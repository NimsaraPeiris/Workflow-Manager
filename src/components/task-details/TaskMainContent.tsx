import { Clock, Tag } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Task, TaskStatus } from '../../types';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { TaskTimer } from './TaskTimer';

interface TaskMainContentProps {
    task: Task;
    getBadgeVariant: (status: TaskStatus) => "orange" | "yellow" | "green" | "rose" | "slate";
    canEdit?: boolean;
    onDateUpdate?: (newDate: string) => void;
}

export const TaskMainContent = ({ task, getBadgeVariant, canEdit, onDateUpdate }: TaskMainContentProps) => {
    const getDeadlineLabel = () => {
        if (!task.due_date) return null;

        const now = startOfDay(new Date());
        const due = startOfDay(new Date(task.due_date));
        const diffDays = differenceInCalendarDays(due, now);

        if (diffDays < 0) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    Deadline expired
                </span>
            );
        }

        if (task.status === 'IN_PROGRESS') {
            if (diffDays === 0) {
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-bold bg-orange-50 text-orange-600 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        Due today
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    {diffDays} days remaining
                </span>
            );
        }

        return null;
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 rounded-none transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Badge variant={getBadgeVariant(task.status)}>{task.status}</Badge>
                    <Badge variant={task.priority === 'HIGH' ? 'rose' : task.priority === 'MEDIUM' ? 'yellow' : 'green'}>
                        {task.priority} Priority
                    </Badge>
                    {getDeadlineLabel()}
                </div>

                {task.assignee_id && (
                    <div className="flex items-center gap-4">
                        <TaskTimer
                            totalTimeSpent={task.total_time_spent || 0}
                            timerStartedAt={task.timer_started_at || null}
                            status={task.status}
                        />
                    </div>
                )}
                {task.team && (
                    <Badge variant="blue">Team: {task.team.name}</Badge>
                )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">{task.title}</h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">{task.description || 'No description provided.'}</p>

            <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-8 transition-colors">
                <div className="flex items-start gap-3 group">
                    <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 rounded-none transition-colors group-hover:scale-110 duration-300 self-start"><Clock size={20} /></div>
                    <div className="flex-1">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-black">Due Date</p>
                        {canEdit ? (
                            <input
                                type="date"
                                defaultValue={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                                onChange={(e) => onDateUpdate?.(e.target.value)}
                                className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-none focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all pointer-events-auto"
                            />
                        ) : (
                            <p className="text-slate-700 dark:text-slate-200 font-bold">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No deadline'}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-start gap-3 group">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-none transition-colors group-hover:scale-110 duration-300"><Tag size={20} /></div>
                    <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-black">Created At</p>
                        <p className="text-slate-700 dark:text-slate-200 font-bold">{new Date(task.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
