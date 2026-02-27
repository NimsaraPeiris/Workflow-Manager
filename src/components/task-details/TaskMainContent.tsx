import { Clock, Tag } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Task, TaskStatus } from '../../types';

interface TaskMainContentProps {
    task: Task;
    getBadgeVariant: (status: TaskStatus) => "orange" | "yellow" | "green" | "rose" | "slate";
}

export const TaskMainContent = ({ task, getBadgeVariant }: TaskMainContentProps) => {
    return (
        <div className="bg-white border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
                <Badge variant={getBadgeVariant(task.status)}>{task.status}</Badge>
                <Badge variant={task.priority === 'HIGH' ? 'rose' : task.priority === 'MEDIUM' ? 'yellow' : 'green'}>
                    {task.priority} Priority
                </Badge>
            </div>

            <h1 className="text-3xl font-medium text-slate-900 mb-4 leading-tight">{task.title}</h1>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description || 'No description provided.'}</p>

            <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 gap-8">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-orange-50 text-orange-600"><Clock size={20} /></div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Due Date</p>
                        <p className="text-slate-700 font-medium">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No deadline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600"><Tag size={20} /></div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Created At</p>
                        <p className="text-slate-700 font-medium">{new Date(task.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
