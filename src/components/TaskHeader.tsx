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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <p className="text-slate-500 mt-1">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none w-full md:w-48 transition-all text-sm"
                    />
                </div>

                <select
                    value={filterDeptId || ''}
                    onChange={(e) => onDeptSelect?.(e.target.value || null)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-medium min-w-[140px]"
                >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter?.(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-medium"
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
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 transition-all shadow-lg shadow-orange-200 text-sm font-bold"
                    >
                        <Plus size={18} />
                        <span>New Task</span>
                    </button>
                )}
            </div>
        </div>
    );
};
