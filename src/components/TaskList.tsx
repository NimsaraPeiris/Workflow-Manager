import { Loader2 } from 'lucide-react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
    tasks: Task[];
    loading: boolean;
    searchQuery: string;
    onTaskClick: (taskId: string) => void;
    variant?: 'default' | 'brief';
}

export const TaskList = ({ tasks, loading, searchQuery, onTaskClick, variant = 'default' }: TaskListProps) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all rounded-none">
                <Loader2 className="text-orange-500 animate-spin mb-4" size={40} />
                <p className="text-slate-400 dark:text-slate-500 font-medium">Fetching tasks...</p>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all text-center px-6 rounded-none">
                <h3 className="text-xl text-slate-900 dark:text-white font-bold mb-2">No tasks found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">
                    {searchQuery ? "We couldn't find any tasks matching your search." : "Get started by creating your first task to track progress."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                    variant={variant}
                />
            ))}
        </div>
    );
};
