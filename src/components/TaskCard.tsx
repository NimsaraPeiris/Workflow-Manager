import { motion } from 'framer-motion';
import { Clock, ChevronRight, User as UserIcon, Building2, Flag } from 'lucide-react';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import type { Task, TaskStatus } from '../types';
import { Badge } from './ui/Badge';

interface TaskCardProps {
    task: Task;
    onClick: (taskId: string) => void;
    variant?: 'default' | 'brief';
}

export const TaskCard = ({ task, onClick, variant = 'default' }: TaskCardProps) => {
    // ... helper functions ... (rest of component logic)
    const getBadgeVariant = (status: TaskStatus) => {
        switch (status) {
            case 'CREATED': return 'orange';
            case 'ACCEPTED': return 'orange';
            case 'ASSIGNED': return 'yellow';
            case 'IN_PROGRESS': return 'yellow';
            case 'SUBMITTED': return 'orange';
            case 'APPROVED': return 'green';
            case 'REJECTED': return 'rose';
            case 'CANCELLED': return 'slate';
            case 'CANCEL_REQUESTED': return 'rose';
            case 'PAUSED': return 'orange';
            default: return 'orange';
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isOverdue = task.due_date &&
        startOfDay(new Date(task.due_date)) < startOfDay(new Date()) &&
        !['APPROVED', 'CANCELLED'].includes(task.status);

    const getRemainingDaysText = () => {
        if (!task.due_date || isOverdue || task.status !== 'IN_PROGRESS') return null;
        const now = startOfDay(new Date());
        const due = startOfDay(new Date(task.due_date));
        const diffDays = differenceInCalendarDays(due, now);
        if (diffDays === 0) return 'DUE TODAY';
        return `${diffDays}d remaining`;
    };

    if (variant === 'brief') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onClick(task.id)}
                className={`group bg-white dark:bg-slate-900 border ${isOverdue ? 'border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10' : 'border-slate-100 dark:border-slate-800'} py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer rounded-none flex items-center justify-between gap-4 shadow-sm hover:shadow-md`}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-1.5 h-6 rounded-none ${task.priority === 'HIGH' ? 'bg-rose-500' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                        {task.title}
                    </span>
                    {isOverdue && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">
                            <Clock size={10} />
                            Deadline expired
                        </span>
                    )}
                    {!isOverdue && task.status === 'IN_PROGRESS' && (
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
                            ({getRemainingDaysText()})
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={getBadgeVariant(task.status)}>
                        <span className="text-[9px] uppercase tracking-tighter">{task.status.replace('_', ' ')}</span>
                    </Badge>
                    <div className={`text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'} w-12 text-right`}>
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-700 group-hover:text-orange-500" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onClick(task.id)}
            className={`group bg-white dark:bg-slate-900 border ${isOverdue ? 'border-rose-100 dark:border-rose-900/30 shadow-rose-50 dark:shadow-rose-950/10' : 'border-slate-100 dark:border-slate-800 shadow-sm'} hover:shadow-xl dark:hover:shadow-slate-900/50 hover:shadow-slate-200/60 transition-all cursor-pointer overflow-hidden rounded-none h-full`}
        >
            <div className="flex flex-col md:flex-row md:items-stretch h-full transition-colors">
                {/* Priority Sidebar */}
                <div className={`w-full md:w-1.5 h-1 md:h-auto ${task.priority === 'HIGH' ? 'bg-rose-500' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />

                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Status and Meta Row */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant={getBadgeVariant(task.status)}>
                                {task.status.replace('_', ' ')}
                            </Badge>

                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-none transition-colors">
                                <Flag size={10} className={
                                    task.priority === 'HIGH' ? 'text-rose-500' :
                                        task.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                                } />
                                {task.priority}
                            </div>

                            {task.due_date && (
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-none transition-colors ${isOverdue ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                    <Clock size={10} />
                                    {isOverdue ? 'DEADLINE EXPIRED ' : ''}
                                    {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    {!isOverdue && task.status === 'IN_PROGRESS' && (
                                        <span className="ml-1 text-indigo-500">
                                            ({getRemainingDaysText()})
                                        </span>
                                    )}
                                </div>
                            )}

                            {task.department?.name && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-none pointer-events-none transition-colors">
                                    <Building2 size={10} />
                                    {task.department.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors leading-tight mb-1">
                                {task.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-3xl font-medium">
                                {task.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Assignee and Creator Info */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
                                    {getInitials(task.creator?.full_name)}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">Creator</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{task.creator?.full_name || 'System'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-none ${task.assignee_id ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'} flex items-center justify-center text-[10px] font-bold border transition-colors`}>
                                    {task.assignee_id ? getInitials(task.assignee?.full_name) : <UserIcon size={12} />}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">Assignee</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{task.assignee?.full_name || 'Pending Assignment'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center self-end md:self-center">
                        <div className="w-10 h-10 rounded-none flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-all">
                            <ChevronRight size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
