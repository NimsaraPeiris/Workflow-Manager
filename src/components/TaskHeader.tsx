import { Plus, Search } from 'lucide-react';

interface TaskHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewTask: () => void;
    userRole: string;
    statusFilter?: string;
    setStatusFilter?: (status: string) => void;
    currentView: string;
    departments?: any[];
    filterDeptId?: string | null;
    onDeptSelect?: (deptId: string | null) => void;
}

export const TaskHeader = ({
    searchQuery,
    setSearchQuery,
    onNewTask,
    userRole,
    statusFilter,
    setStatusFilter,
    currentView,
    departments = [],
    filterDeptId,
    onDeptSelect
}: TaskHeaderProps) => {
    const isHistory = currentView === 'approved' || currentView === 'cancelled';
    const title = currentView === 'approved' ? 'Approved History' :
        currentView === 'cancelled' ? 'Cancelled Log' :
            'Workflow Management';
    const subtitle = isHistory ? `Track organizational ${currentView} records` : "Manage and track your team's progress";

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none w-full md:w-48 transition-all text-sm dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                    />
                </div>

                <select
                    value={filterDeptId || ''}
                    onChange={(e) => onDeptSelect?.(e.target.value || null)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-medium min-w-[140px] dark:text-slate-300"
                >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="dark:bg-slate-900">{dept.name}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter?.(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-medium dark:text-slate-300"
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

                {userRole === 'HEAD' && currentView === 'dashboard' && (
                    <button
                        onClick={onNewTask}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 transition-all shadow-lg shadow-orange-200 dark:shadow-orange-900/20 text-sm font-bold active:scale-95"
                    >
                        <Plus size={18} />
                        <span>New Task</span>
                    </button>
                )}
            </div>
        </div>
    );
};
