import { motion } from 'framer-motion';
import { Clock, ChevronRight, User as UserIcon, Building2, Flag } from 'lucide-react';
import type { Task, TaskStatus } from '../types';
import { Badge } from './ui/Badge';

interface TaskCardProps {
    task: Task;
    onClick: (taskId: string) => void;
    variant?: 'default' | 'brief';
}

export const TaskCard = ({ task, onClick, variant = 'default' }: TaskCardProps) => {
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
            default: return 'orange';
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isOverdue = task.due_date &&
        new Date(task.due_date) < new Date() &&
        !['APPROVED', 'CANCELLED'].includes(task.status);

    if (variant === 'brief') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onClick(task.id)}
                className={`group bg-white border ${isOverdue ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100'} py-2 px-4 hover:bg-slate-50 transition-all cursor-pointer rounded-lg flex items-center justify-between gap-4`}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-1.5 h-6 ${task.priority === 'HIGH' ? 'bg-rose-500' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                    <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-orange-600 transition-colors">
                        {task.title}
                    </span>
                    {isOverdue && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">
                            <Clock size={10} />
                            Overdue
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={getBadgeVariant(task.status)}>
                        <span className="text-[9px] uppercase tracking-tighter">{task.status.replace('_', ' ')}</span>
                    </Badge>
                    <div className={`text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-400'} w-12 text-right`}>
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-orange-500" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onClick(task.id)}
            className={`group bg-white border ${isOverdue ? 'border-rose-100 shadow-rose-50' : 'border-slate-100 shadow-sm'} hover:shadow-xl hover:shadow-slate-200/60 transition-all cursor-pointer overflow-hidden`}
        >
            <div className="flex flex-col md:flex-row md:items-stretch h-full">
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

                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                                <Flag size={10} className={
                                    task.priority === 'HIGH' ? 'text-rose-500' :
                                        task.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                                } />
                                {task.priority}
                            </div>

                            {task.due_date && (
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isOverdue ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                                    <Clock size={10} />
                                    {isOverdue ? 'OVERDUE ' : ''}{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            )}

                            {task.department?.name && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-50/50 px-2 py-1 rounded pointer-events-none">
                                    <Building2 size={10} />
                                    {task.department.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-medium text-slate-900 group-hover:text-orange-600 transition-colors leading-tight mb-1">
                                {task.title}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-1 max-w-3xl">
                                {task.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Assignee and Creator Info */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                    {getInitials(task.creator?.full_name)}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Creator</p>
                                    <p className="text-xs font-semibold text-slate-700">{task.creator?.full_name || 'System'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${task.assignee_id ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-100'} flex items-center justify-center text-[10px] font-bold border`}>
                                    {task.assignee_id ? getInitials(task.assignee?.full_name) : <UserIcon size={12} />}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Assignee</p>
                                    <p className="text-xs font-semibold text-slate-700">{task.assignee?.full_name || 'Pending Assignment'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center self-end md:self-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all">
                            <ChevronRight size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
