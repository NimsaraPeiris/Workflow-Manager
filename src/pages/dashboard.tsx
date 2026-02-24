import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Task, TaskStatus } from '../types';
import { TaskHeader } from '../components/TaskHeader';
import { TaskList } from '../components/TaskList';
import { CreateTaskModal } from '../components/CreateTaskModal';

export default function DashboardPage() {
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
        due_date: ''
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const { data, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

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
                    creator_id: user.id,
                    status: 'CREATED'
                }
            ]);

        if (createError) {
            setError(createError.message);
        } else {
            setIsModalOpen(false);
            setNewTask({ title: '', description: '', priority: 'MEDIUM', due_date: '' });
            fetchTasks();
        }
        setCreateLoading(false);
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'CREATED': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'ACCEPTED': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'SUBMITTED': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'CANCELLED': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <TaskHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewTask={() => setIsModalOpen(true)}
            />

            <TaskList
                tasks={filteredTasks}
                loading={loading}
                searchQuery={searchQuery}
                getStatusColor={getStatusColor}
            />

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
                loading={createLoading}
                error={error}
                newTask={newTask}
                setNewTask={setNewTask}
            />
        </div>
    );
}