import { Plus, Search } from 'lucide-react';

interface TaskHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewTask: () => void;
    userRole: string;
    statusFilter?: string;
    setStatusFilter?: (status: string) => void;
    currentView: string;
}

export const TaskHeader = ({
    searchQuery,
    setSearchQuery,
    onNewTask,
    userRole,
    statusFilter,
    setStatusFilter,
    currentView
}: TaskHeaderProps) => {
    const title = currentView === 'archive' ? 'Completed Archive' : 'Tasks';
    const subtitle = currentView === 'archive' ? 'View and track all successfully finished projects' : "Manage and track your team's progress";

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl text-slate-900 tracking-tight">{title}</h1>
                <p className="text-slate-500 mt-1">{subtitle}</p>
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

                {currentView === 'dashboard' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter?.(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-medium"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="CREATED">Created</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="CANCEL_REQUESTED">Cancel Requested</option>
                    </select>
                )}

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
