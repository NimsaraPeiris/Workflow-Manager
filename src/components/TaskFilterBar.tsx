import { Search, Plus } from 'lucide-react';

interface TaskFilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    departments: any[];
    filterDeptId: string | null;
    onDeptSelect: (id: string | null) => void;
    currentView: string;
    onNewTask: () => void;
}

export const TaskFilterBar = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    departments,
    filterDeptId,
    onDeptSelect,
    currentView,
    onNewTask
}: TaskFilterBarProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 pb-3 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-sm transition-all rounded-none sticky top-14 lg:top-16 z-30 space-y-4 sm:space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center flex-wrap gap-3">
                    <select
                        value={filterDeptId || ''}
                        onChange={(e) => onDeptSelect?.(e.target.value || null)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm rounded-none outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-[10px] font-black uppercase tracking-widest dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <option value="">DEPT: ALL SYSTEMS</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name.toUpperCase()}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter?.(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm rounded-none outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-[10px] font-black uppercase tracking-widest dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <option value="ALL">STATUS: ANY</option>
                        <option value="CREATED">CREATED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="CANCEL_REQUESTED">REQUESTED</option>
                    </select>
                </div>

                {currentView === 'dashboard' && (
                    <button
                        onClick={onNewTask}
                        className="hidden lg:flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-950 dark:bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none hover:bg-slate-800 dark:hover:bg-orange-700 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={14} />
                        Initiate Terminal
                    </button>
                )}
            </div>

            <div className="relative group">
                <div className="absolute left-0 bottom-0 w-full h-[1px] bg-slate-100 dark:bg-slate-800" />
                <div className="absolute left-0 bottom-0 w-0 h-[1px] bg-orange-500 group-focus-within:w-full transition-all duration-500" />

                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search for intelligence, activities, assignments or specific units..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-transparent border-none focus:outline-none dark:text-white transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-none tracking-tight"
                />
            </div>
        </div>
    );
};
