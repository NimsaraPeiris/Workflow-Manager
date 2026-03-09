import { Search } from 'lucide-react';
import { CreateTaskButton } from './permissions/tasks/CreateTaskButton';

interface TaskHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewTask: () => void;
    statusFilter?: string;
    setStatusFilter?: (status: string) => void;
    currentView: string;
    departments?: any[];
    filterDeptId?: string | null;
    filterTeamId?: string | null;
    teams?: any[];
    onDeptSelect?: (deptId: string | null) => void;
}

export const TaskHeader = ({
    searchQuery,
    setSearchQuery,
    onNewTask,
    statusFilter,
    setStatusFilter,
    currentView,
    departments = [],
    filterDeptId,
    filterTeamId,
    teams = [],
    onDeptSelect
}: TaskHeaderProps) => {
    const isHistory = currentView === 'approved' || currentView === 'cancelled';
    const selectedTeam = filterTeamId ? teams.find(t => t.id === filterTeamId) : null;
    const selectedDept = filterDeptId && filterDeptId !== 'EXTERNAL' ? departments.find(d => d.id === filterDeptId) : null;

    const title = isHistory ? (currentView === 'approved' ? 'Approved History' : 'Cancelled Log') :
        selectedTeam ? `${selectedTeam.name} Squad` :
            selectedDept ? `${selectedDept.name} Workflow` :
                filterDeptId === 'EXTERNAL' ? 'Cross-Dept Requests' :
                    'Workflow Management';

    const subtitle = selectedTeam ? `Strategic operations for the ${selectedTeam.name} unit` :
        isHistory ? `Track organizational ${currentView} records` :
            "Manage and track your team's progress";

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{title}</h1>
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

                {currentView === 'dashboard' && (
                    <CreateTaskButton onClick={onNewTask} />
                )}
            </div>
        </div>
    );
};
