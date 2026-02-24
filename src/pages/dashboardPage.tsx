import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Task, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Clock,
    Loader2,
    ChevronRight,
    X,
    AlertCircle
} from 'lucide-react';

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
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
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
            case 'CREATED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ACCEPTED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'SUBMITTED': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
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
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tasks</h1>
                    <p className="text-slate-500 mt-1">Manage and track your team's progress</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200"
                    >
                        <Plus size={20} />
                        <span>New Task</span>
                    </button>
                </div>
            </div>

            {/* Task Grid/List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all">
                        <Loader2 className="text-blue-500 animate-spin mb-4" size={40} />
                        <p className="text-slate-400 font-medium">Fetching tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all text-center px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                            <Plus size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No tasks found</h3>
                        <p className="text-slate-500 max-w-sm">
                            {searchQuery ? "We couldn't find any tasks matching your search." : "Get started by creating your first task to track progress."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div className={`w-3 h-12 rounded-full ${task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                            {task.due_date && (
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                                    <Clock size={12} />
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 truncate max-w-2xl">
                                            {task.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {task.id.slice(0, 2).toUpperCase()}
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Task</h2>
                                    <p className="text-slate-500 text-sm">Fill in the details for your new project</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Task Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Design Landing Page"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                    <textarea
                                        rows={3}
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                                        placeholder="What needs to be done?"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={newTask.due_date}
                                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                                    >
                                        {createLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Plus size={20} />
                                                <span>Create Task</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
