import { Search } from 'lucide-react';

export const TaskHeader = ({
    currentView,
    departments = [],
    filterDeptId,
    filterTeamId,
    teams = []
}: {
    currentView: string;
    departments?: any[];
    filterDeptId?: string | null;
    filterTeamId?: string | null;
    teams?: any[];
}) => {
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
        <div className="space-y-2 hidden sm:block">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-600 text-white rounded-none">
                    <Search size={20} className="rotate-90" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight border-l-2 border-orange-500 pl-4">
                    {subtitle}
                </p>
                <div className="hidden sm:flex items-center gap-2">
                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        System Integrity Active
                    </span>
                </div>
            </div>
        </div>
    );
};
