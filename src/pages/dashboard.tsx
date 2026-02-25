import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../types';
import { TaskHeader } from '../components/TaskHeader';
import { TaskList } from '../components/TaskList';
import { CreateTaskModal } from '../components/CreateTaskModal';

interface DashboardPageProps {
    onTaskClick: (taskId: string) => void;
    currentUser: any;
    filterDeptId: string | null;
    onRefreshStats: () => void;
}

export default function DashboardPage({ onTaskClick, currentUser, filterDeptId, onRefreshStats }: DashboardPageProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');

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
        let query = supabase.from('profiles').select('*, departments(name)');

        // Only show employees
        query = query.eq('role', 'EMPLOYEE');

        // Filter by department if one is selected
        if (newTask.department_id) {
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
        const role = (rawRole === 'SUPERVISOR' || rawRole === 'HEAD') ? 'HEAD' : 'EMPLOYEE';
        const deptId = currentUser.user_metadata?.department_id;

        let query = supabase.from('tasks').select('*');

        if (role === 'HEAD') {
            // Requester Dept Head & Receiving Dept Head combined:
            // See tasks created by them OR tasks addressed to their department
            query = query.or(`department_id.eq.${deptId},creator_id.eq.${currentUser.id}`);
        } else if (role === 'EMPLOYEE') {
            // Assignee (Employee): restricted to viewing only tasks assigned to them
            query = query.eq('assignee_id', currentUser.id);
        }

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

        const { error: createError } = await supabase
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
            ]);

        if (createError) {
            setError(createError.message);
        } else {
            setIsModalOpen(false);
            setNewTask({ title: '', description: '', priority: 'MEDIUM', due_date: '', department_id: '', assignee_id: '' });
            fetchTasks();
            onRefreshStats();
        }
        setCreateLoading(false);
    };

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const highPriorityTasks = filteredTasks.filter(t => t.priority === 'HIGH');
    const normalTasks = filteredTasks.filter(t => t.priority !== 'HIGH');

    return (
        <div className="space-y-8">
            <TaskHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewTask={() => setIsModalOpen(true)}
                userRole={(currentUser.user_metadata?.role === 'SUPERVISOR' || currentUser.user_metadata?.role === 'HEAD') ? 'HEAD' : 'EMPLOYEE'}
            />

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
            />
        </div>
    );
}