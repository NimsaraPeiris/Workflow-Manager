import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    Tag,
    User as UserIcon,
    Building2,
    MessageSquare,
    Send,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Task, TaskStatus } from '../types';

interface TaskDetailsPageProps {
    taskId: string;
    onBack: () => void;
    getStatusColor: (status: TaskStatus) => string;
}

export default function TaskDetailsPage({ taskId, onBack, getStatusColor }: TaskDetailsPageProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', taskId)
                .single();

            if (fetchError) throw fetchError;
            setTask(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-orange-500 border-t-transparent"
                />
                <p className="text-slate-500 mt-4">Loading task details...</p>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="bg-white border border-slate-200 p-8 text-center">
                <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Task</h2>
                <p className="text-slate-500 mb-6">{error || 'Task not found'}</p>
                <button
                    onClick={onBack}
                    className="bg-slate-900 text-white px-6 py-2 transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all text-slate-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl text-slate-900 tracking-tight">Task Details</h2>
                    <p className="text-sm text-slate-500">Overview of the project progress and updates</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`px-4 py-1.5 text-xs border ${getStatusColor(task.status)} uppercase tracking-wider`}>
                                {task.status}
                            </span>
                            <span className={`px-4 py-1.5 text-xs border border-slate-100 bg-slate-50 text-slate-600 uppercase tracking-wider`}>
                                {task.priority} Priority
                            </span>
                        </div>

                        <h1 className="text-3xl font-medium text-slate-900 mb-4 leading-tight">
                            {task.title}
                        </h1>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {task.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 gap-8">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-orange-50 text-orange-600">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Due Date</p>
                                    <p className="text-slate-700 font-medium">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No deadline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Created At</p>
                                    <p className="text-slate-700 font-medium">
                                        {new Date(task.created_at || '').toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed Placeholder */}
                    <div className="bg-white border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <MessageSquare className="text-orange-600" size={20} />
                            <h3 className="text-lg font-medium text-slate-900">Task Activity</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                    S
                                </div>
                                <div className="flex-1">
                                    <div className="bg-slate-50 p-4 border border-slate-100">
                                        <p className="text-sm text-slate-600">Task was created and assigned to the default department.</p>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2">SYSTEM • JUST NOW</p>
                                </div>
                            </div>

                            <div className="flex gap-4 opacity-50">
                                <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 italic">
                                    ?
                                </div>
                                <div className="flex-1">
                                    <div className="h-10 bg-slate-50 border border-dashed border-slate-200 flex items-center px-4">
                                        <span className="text-xs text-slate-400 italic">Comments coming soon...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 relative">
                            <input
                                disabled
                                type="text"
                                placeholder="Write a comment... (Coming Soon)"
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 text-sm outline-none cursor-not-allowed"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-300">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-100 shadow-sm p-6 space-y-6">
                        <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4 font-bold">Assignee</p>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100">
                                <div className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Unassigned</p>
                                    <p className="text-[10px] text-slate-500">Wait for supervisor</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4 font-bold">Department</p>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Operations</p>
                                    <p className="text-[10px] text-slate-500">Main workflow</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                disabled
                                className="w-full py-3 bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
                            >
                                Edit Task (Admin Only)
                            </button>
                            <p className="text-[10px] text-center text-slate-400 mt-2 italic">
                                General users cannot modify tasks
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
