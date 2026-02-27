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
    onDeptSelect: (deptId: string | null) => void;
    onRefreshStats: () => void;
    currentView: 'dashboard' | 'audit' | 'users' | 'approved' | 'cancelled';
}

export default function DashboardPage({ onTaskClick, currentUser, filterDeptId, onDeptSelect, onRefreshStats, currentView }: DashboardPageProps) {
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
            // Heads see all in History views, restricted in Dashboard view
            if (currentView === 'dashboard') {
                query = query.or(`department_id.eq.${deptId},creator_id.eq.${currentUser.id}`);
            }
        } else if (role === 'EMPLOYEE') {
            // Employees see all in History views, restricted in Dashboard view
            if (currentView === 'dashboard') {
                query = query.eq('assignee_id', currentUser.id);
            }
        }
        // SUPER_ADMIN sees everything (no role filter applied)

        if (filterDeptId === 'EXTERNAL') {
            // Tasks created by me but NOT in my department
            query = query.eq('creator_id', currentUser.id).neq('department_id', deptId);
        } else if (filterDeptId) {
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


        // 1. View-based logic
        if (statusFilter !== 'ALL') {
            if (task.status !== statusFilter) return false;
        } else {
            // No status filter: use view defaults
            if (currentView === 'approved') {
                if (task.status !== 'APPROVED') return false;
            } else if (currentView === 'cancelled') {
                if (task.status !== 'CANCELLED') return false;
            } else {
                // Dashboard view: hide approved/cancelled by default
                if (task.status === 'APPROVED' || task.status === 'CANCELLED') return false;
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
                departments={departments}
                filterDeptId={filterDeptId}
                onDeptSelect={onDeptSelect}
            />

            {/* OVERVIEW MODE: Only show performance tiles on Dashboard view */}
            {!filterDeptId && !loading && currentView === 'dashboard' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-orange-600 rounded-full" />
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Organization Overview</h2>
                    </div>

                    {tasks.length > 0 ? (
                        <div className="space-y-6">
                            <PerformanceTiles tasks={tasks} />

                            <div className="pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        {currentUser.user_metadata?.role === 'SUPER_ADMIN' ? 'All Organization Tasks' : 'My Department Tasks'}
                                    </h3>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                        {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                                    </span>
                                </div>
                                <TaskList
                                    tasks={filteredTasks}
                                    loading={loading}
                                    searchQuery={searchQuery}
                                    onTaskClick={onTaskClick}
                                    variant="brief"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-slate-200 p-12 text-center rounded-2xl">
                            <p className="text-slate-400">No organizational data available for the current period.</p>
                        </div>
                    )}
                </div>
            )}

            {/* DEPARTMENT VIEW or HISTORY VIEW: Show task lists */}
            {(filterDeptId || currentView === 'approved' || currentView === 'cancelled') && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                {highPriorityTasks.length > 0 ? 'General Tasks' : 'All Department Tasks'}
                            </h2>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1">
                                {normalTasks.length} {normalTasks.length === 1 ? 'Task' : 'Tasks'}
                            </span>
                        </div>
                        <TaskList
                            tasks={normalTasks}
                            loading={loading}
                            searchQuery={searchQuery}
                            onTaskClick={onTaskClick}
                        />

                        {tasks.length === 0 && !loading && (
                            <div className="bg-white border border-slate-100 p-12 text-center rounded-xl">
                                <p className="text-slate-400 text-sm">No tasks found for this department yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

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