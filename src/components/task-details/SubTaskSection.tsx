import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Calendar, Play, Pause, Clock as ClockIcon, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubTask } from '../../types';

interface SubTaskSectionProps {
    subTasks: SubTask[];
    onToggle: (id: string, isCompleted: boolean) => Promise<void>;
    onCreate: (title: string, dueDate?: string, assigneeId?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onTimerToggle: (id: string, isStarting: boolean) => Promise<void>;
    teamMembers: any[];
    canCreate: boolean;
    currentUserId?: string;
}

const SubTaskRow = ({ st, onToggle, onDelete, onTimerToggle, toggling, canCreate, currentUserId }: { st: SubTask, onToggle: any, onDelete: any, onTimerToggle: any, toggling: string | null, canCreate: boolean, currentUserId?: string }) => {
    const isMine = st.assignee_id === currentUserId;
    const isAssigned = !!st.assignee_id;
    const [elapsed, setElapsed] = useState(st.total_time_spent || 0);

    useEffect(() => {
        let interval: any;
        if (st.timer_started_at) {
            const start = new Date(st.timer_started_at).getTime();
            const tick = () => {
                const now = new Date().getTime();
                setElapsed((st.total_time_spent || 0) + Math.floor((now - start) / 1000));
            };
            tick();
            interval = setInterval(tick, 1000);
        } else {
            setElapsed(st.total_time_spent || 0);
        }
        return () => clearInterval(interval);
    }, [st.timer_started_at, st.total_time_spent]);

    const formatMiniTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-center gap-4 p-4 border rounded-none transition-all ${st.is_completed
                ? 'bg-slate-50 dark:bg-slate-800/40 border-transparent opacity-75'
                : isMine
                    ? 'bg-blue-50/10 border-blue-200 dark:border-blue-500/30'
                    : isAssigned
                        ? 'bg-orange-50/10 border-orange-100 dark:border-orange-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                } shadow-sm`}
        >
            <button
                onClick={() => onToggle(st.id, !st.is_completed)}
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

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate transition-all ${st.is_completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                    {st.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                    {st.due_date && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap">
                            <Calendar size={10} />
                            <span className="uppercase tracking-tighter">{new Date(st.due_date).toLocaleDateString()}</span>
                        </div>
                    )}
                    {st.assignee && (
                        <div className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-500 font-bold whitespace-nowrap">
                            <UserIcon size={10} />
                            <span className="uppercase tracking-tighter">{st.assignee.full_name}</span>
                        </div>
                    )}
                    {(elapsed > 0 || st.timer_started_at) && (
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${st.timer_started_at ? 'text-orange-600' : 'text-slate-400'}`}>
                            <ClockIcon size={10} className={st.timer_started_at ? 'animate-spin-slow' : ''} />
                            <span>{formatMiniTime(elapsed)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                {!st.is_completed && (
                    <button
                        onClick={() => onTimerToggle(st.id, !st.timer_started_at)}
                        className={`p-2 transition-all ${st.timer_started_at ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' : 'text-slate-400 hover:text-orange-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        title={st.timer_started_at ? "Pause Timer" : "Start Timer"}
                    >
                        {st.timer_started_at ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                )}
                {canCreate && (
                    <button
                        onClick={() => onDelete(st.id)}
                        className="p-2 text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-none transition-all active:scale-90"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </motion.div >
    );
};

export const SubTaskSection = ({ subTasks, onToggle, onCreate, onDelete, onTimerToggle, teamMembers, canCreate, currentUserId }: SubTaskSectionProps) => {
    const [newTitle, setNewTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setSubmitting(true);
        try {
            await onCreate(newTitle, dueDate || undefined, assigneeId || undefined);
            setNewTitle('');
            setDueDate('');
            setAssigneeId('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (id: string, isCompleted: boolean) => {
        setToggling(id);
        try {
            await onToggle(id, isCompleted);
        } finally {
            setToggling(null);
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
                        <SubTaskRow
                            key={st.id}
                            st={st}
                            onToggle={handleToggle}
                            onDelete={onDelete}
                            onTimerToggle={onTimerToggle}
                            toggling={toggling}
                            canCreate={canCreate}
                            currentUserId={currentUserId}
                        />
                    ))}
                </AnimatePresence>

                {subTasks.length === 0 && (
                    <div className="py-10 text-center bg-slate-50 dark:bg-slate-900/40 rounded-none border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                        <p className="text-sm text-slate-500 dark:text-slate-600 font-medium">No sub-tasks yet. Break down your work!</p>
                    </div>
                )}
            </div>

            {canCreate && (
                <form onSubmit={handleCreate} className="pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 transition-colors">
                    <div className="md:col-span-12 lg:col-span-4">
                        <input
                            type="text"
                            placeholder="New sub-task..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-sm dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-orange-500 dark:focus:ring-4 dark:focus:ring-orange-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="md:col-span-12 lg:col-span-4">
                        <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-[12px] dark:text-white focus:border-orange-500 dark:focus:ring-4 dark:focus:ring-orange-500/10 transition-all outline-none appearance-none cursor-pointer font-bold"
                        >
                            <option value="">No Assignee</option>
                            {teamMembers.map(m => (
                                <option key={m.id} value={m.id}>{m.full_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-12 lg:col-span-3">
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-sm dark:text-white focus:border-orange-500 dark:focus:ring-4 dark:focus:ring-orange-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="md:col-span-12 lg:col-span-1">
                        <button
                            type="submit"
                            disabled={submitting || !newTitle}
                            className="w-full h-full min-h-[46px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-none flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 dark:shadow-none active:scale-95 font-bold"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
