import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../types';
import { TaskHeader } from '../components/TaskHeader';
import { TaskList } from '../components/TaskList';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { PerformanceTiles } from '../components/PerformanceTiles';
import { auditLogger } from '../lib/auditLogger';

interface DashboardPageProps {
    onTaskClick: (taskId: string) => void;
    currentUser: any;
    filterDeptId: string | null;
    onRefreshStats: () => void;
    currentView: 'dashboard' | 'archive' | 'audit' | 'users';
}

export default function DashboardPage({ onTaskClick, currentUser, filterDeptId, onRefreshStats, currentView }: DashboardPageProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        due_date: '',
        department_id: '',
        assignee_id: ''
    });
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        if (currentUser) {
            fetchTasks();
            fetchDepartments();
            fetchEmployees();
        }
    }, [currentUser, newTask.department_id, filterDeptId]);

    const fetchEmployees = async () => {
        const userRole = currentUser?.user_metadata?.role;
        const userDeptId = currentUser?.user_metadata?.department_id;

        let query = supabase.from('profiles').select('*, departments(name)');
        query = query.eq('role', 'EMPLOYEE');

        // Only allow direct assignment if:
        // 1. User is SUPER_ADMIN
        // 2. User is HEAD and the target department is THEIR department
        if (userRole !== 'SUPER_ADMIN') {
            if (newTask.department_id && newTask.department_id !== userDeptId) {
                setEmployees([]); // Cannot assign to other department's employees directly
                return;
            }
            // For general list, if no dept selected, default to their own
            if (!newTask.department_id) {
                query = query.eq('department_id', userDeptId);
            } else {
                query = query.eq('department_id', newTask.department_id);
            }
        } else if (newTask.department_id) {
            query = query.eq('department_id', newTask.department_id);
        }

        const { data } = await query.order('full_name');
        if (data) setEmployees(data);
    };

    const fetchDepartments = async () => {
        const { data } = await supabase.from('departments').select('*').order('name');
        if (data) setDepartments(data);
    };

    const fetchTasks = async () => {
        if (!currentUser) return;
        setLoading(true);

        const rawRole = currentUser.user_metadata?.role;
        // Normalize role to handle any legacy data
        let role = (rawRole === 'SUPERVISOR' || rawRole === 'HEAD') ? 'HEAD' : 'EMPLOYEE';
        if (rawRole === 'SUPER_ADMIN') role = 'SUPER_ADMIN';

        const deptId = currentUser.user_metadata?.department_id;

        let query = supabase.from('tasks').select(`
            *,
            creator:profiles!tasks_creator_id_fkey(full_name),
            assignee:profiles!tasks_assignee_id_fkey(full_name),
            department:departments(name)
        `);

        if (role === 'HEAD') {
            // Requester Dept Head & Receiving Dept Head combined:
            // See tasks created by them OR tasks addressed to their department
            query = query.or(`department_id.eq.${deptId},creator_id.eq.${currentUser.id}`);
        } else if (role === 'EMPLOYEE') {
            // Assignee (Employee): restricted to viewing only tasks assigned to them
            query = query.eq('assignee_id', currentUser.id);
        }
        // SUPER_ADMIN sees everything (no role filter applied)

        if (filterDeptId) {
            query = query.eq('department_id', filterDeptId);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (!fetchError && data) {
            setTasks(data);
        }
        setLoading(false);
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError('You must be logged in to create a task');
            setCreateLoading(false);
            return;
        }

        const { data: createdTasks, error: createError } = await supabase
            .from('tasks')
            .insert([
                {
                    ...newTask,
                    due_date: newTask.due_date || null,
                    department_id: newTask.department_id || null,
                    assignee_id: newTask.assignee_id || null,
                    creator_id: user.id,
                    status: newTask.assignee_id ? 'ASSIGNED' : 'CREATED'
                }
            ])
            .select();

        if (createError) {
            setError(createError.message);
        } else {
            await auditLogger.log({
                userId: user.id,
                action: 'TASK_CREATE',
                entityType: 'Task',
                entityId: createdTasks?.[0]?.id,
                newData: newTask
            });
            setIsModalOpen(false);
            setNewTask({ title: '', description: '', priority: 'MEDIUM', due_date: '', department_id: '', assignee_id: '' });
            fetchTasks();
            onRefreshStats();
        }
        setCreateLoading(false);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const isSuperAdmin = currentUser.user_metadata?.role === 'SUPER_ADMIN';

        // 1. View-based logic
        if (currentView === 'archive') {
            // Archive only shows APPROVED tasks
            if (task.status !== 'APPROVED') return false;
        } else {
            // Dashboard overview:
            if (statusFilter === 'ALL') {
                // Hide approved tasks by default in the overview for non-super admins
                if (!isSuperAdmin && task.status === 'APPROVED') return false;
            } else {
                // If a specific status is filtered, only show that
                if (task.status !== statusFilter) return false;
            }
        }

        return matchesSearch;
    });

    const highPriorityTasks = filteredTasks.filter(t => t.priority === 'HIGH');
    const normalTasks = filteredTasks.filter(t => t.priority !== 'HIGH');

    return (
        <div className="space-y-8">
            <TaskHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewTask={() => setIsModalOpen(true)}
                userRole={(currentUser.user_metadata?.role === 'SUPERVISOR' || currentUser.user_metadata?.role === 'HEAD' || currentUser.user_metadata?.role === 'SUPER_ADMIN') ? 'HEAD' : 'EMPLOYEE'}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                currentView={currentView}
            />

            {!filterDeptId && !loading && tasks.length > 0 && (
                <PerformanceTiles tasks={tasks} />
            )}

            {highPriorityTasks.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-600">
                        <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">High Priority Actions</h2>
                    </div>
                    <TaskList
                        tasks={highPriorityTasks}
                        loading={loading}
                        searchQuery={searchQuery}
                        onTaskClick={onTaskClick}
                    />
                </div>
            )}

            <div className="space-y-4">
                {highPriorityTasks.length > 0 && (
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">General Tasks</h2>
                )}
                <TaskList
                    tasks={normalTasks}
                    loading={loading}
                    searchQuery={searchQuery}
                    onTaskClick={onTaskClick}
                />
            </div>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
                loading={createLoading}
                error={error}
                newTask={newTask}
                setNewTask={setNewTask}
                departments={departments}
                employees={employees}
                currentUser={currentUser}
            />
        </div>
    );
}