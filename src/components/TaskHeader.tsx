import { Plus, Search } from 'lucide-react';

interface TaskHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewTask: () => void;
    userRole: string;
}

export const TaskHeader = ({ searchQuery, setSearchQuery, onNewTask, userRole }: TaskHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl text-slate-900 tracking-tight">Tasks</h1>
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
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none w-full md:w-64 transition-all"
                    />
                </div>
                {userRole === 'HEAD' && (
                    <button
                        onClick={onNewTask}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 transition-all shadow-lg shadow-orange-200"
                    >
                        <Plus size={20} />
                        <span>New Task</span>
                    </button>
                )}
            </div>
        </div>
    );
};
