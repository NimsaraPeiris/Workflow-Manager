import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import type { Task, TaskStatus } from '../types';
import { Badge } from './ui/Badge';

interface TaskCardProps {
    task: Task;
    onClick: (taskId: string) => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
    const getBadgeVariant = (status: TaskStatus) => {
        switch (status) {
            case 'CREATED': return 'orange';
            case 'IN_PROGRESS': return 'amber';
            case 'APPROVED': return 'emerald';
            case 'REJECTED': return 'rose';
            case 'CANCELLED': return 'slate';
            default: return 'orange';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onClick(task.id)}
            className="group bg-white p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex items-center justify-between gap-6"
        >
            <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className={`w-3 h-12 ${task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <Badge variant={getBadgeVariant(task.status)}>
                            {task.status}
                        </Badge>
                        {task.due_date && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                <Clock size={12} />
                                {new Date(task.due_date).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                        {task.title}
                    </h3>
                    <p className="text-sm text-slate-500 truncate max-w-2xl">
                        {task.description}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {task.id.slice(0, 2).toUpperCase()}
                    </div>
                </div>
                <div className="p-2 text-slate-300 group-hover:text-orange-600 transition-all">
                    <ChevronRight size={20} />
                </div>
            </div>
        </motion.div>
    );
};
