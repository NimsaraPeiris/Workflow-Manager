import { useState } from 'react';
import { Plus, Loader2, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubTask } from '../../types';

interface SubTaskSectionProps {
    subTasks: SubTask[];
    onToggle: (id: string, isCompleted: boolean) => Promise<void>;
    onCreate: (title: string, dueDate?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export const SubTaskSection = ({ subTasks, onToggle, onCreate, onDelete }: SubTaskSectionProps) => {
    const [newTitle, setNewTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setSubmitting(true);
        try {
            await onCreate(newTitle, dueDate || undefined);
            setNewTitle('');
            setDueDate('');
        } finally {
            setSubmitting(false);
        }
    };

    const completedCount = subTasks.filter(st => st.is_completed).length;
    const progress = subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6 rounded-none transition-colors">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sub-Tasks</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Track granular progress of this task</p>
                </div>
                <div className="text-right">
                    <motion.span
                        key={progress}
                        initial={{ scale: 1.2, color: '#f97316' }}
                        animate={{ scale: 1, color: '#ea580c' }}
                        className="text-2xl font-black text-orange-600 block leading-none"
                    >
                        {Math.round(progress)}%
                    </motion.span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black mt-1">Progress</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden p-0.5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded ${progress === 100 ? 'bg-green-400' : 'bg-orange-500'} shadow-sm`}
                />
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {subTasks.map(st => (
                        <motion.div
                            key={st.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`flex items-center gap-4 p-4 border rounded-none transition-all ${st.is_completed ? 'bg-slate-50 dark:bg-slate-800/40 border-transparent opacity-75' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}
                        >
                            <button
                                onClick={() => {
                                    setToggling(st.id);
                                    onToggle(st.id, !st.is_completed).finally(() => setToggling(null));
                                }}
                                disabled={toggling === st.id}
                                className={`w-6 h-6 rounded-none border flex items-center justify-center transition-all ${st.is_completed ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-500'}`}
                            >
                                {toggling === st.id ? (
                                    <Loader2 className="animate-spin" size={12} />
                                ) : st.is_completed && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>

                            <div className="flex-1">
                                <p className={`text-sm font-bold transition-all ${st.is_completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {st.title}
                                </p>
                                {st.due_date && (
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                        <Calendar size={10} />
                                        <span className="uppercase tracking-tighter">Due: {new Date(st.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onDelete(st.id)}
                                className="p-2 text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-none transition-all active:scale-90"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {subTasks.length === 0 && (
                    <div className="py-10 text-center bg-slate-50 dark:bg-slate-900/40 rounded-none border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                        <p className="text-sm text-slate-500 dark:text-slate-600 font-medium">No sub-tasks yet. Break down your work!</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleCreate} className="pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 transition-colors">
                <div className="md:col-span-12 lg:col-span-7">
                    <input
                        type="text"
                        placeholder="New sub-task..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-sm dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-orange-500 dark:focus:ring-4 dark:focus:ring-orange-500/10 transition-all outline-none"
                    />
                </div>
                <div className="md:col-span-6 lg:col-span-3">
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-sm dark:text-white focus:border-orange-500 dark:focus:ring-4 dark:focus:ring-orange-500/10 transition-all outline-none"
                    />
                </div>
                <div className="md:col-span-6 lg:col-span-2">
                    <button
                        type="submit"
                        disabled={submitting || !newTitle}
                        className="w-full h-full min-h-[46px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-none flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 dark:shadow-none active:scale-95 font-bold"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
};
