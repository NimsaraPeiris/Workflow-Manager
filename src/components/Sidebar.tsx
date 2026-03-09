import {
    Building2,
    AlertCircle,
    ShieldCheck,
    Users,
    PieChart,
    Moon,
    Sun,
    Calendar,
    UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../lib/ThemeContext';
import { PermissionGuard } from './auth/PermissionGuard';
import { hasPermission } from '../lib/permissions';


interface SidebarProps {
    departments: any[];
    taskCounts: Record<string, number>;
    selectedDeptId: string | null;
    onDeptSelect: (id: string | null) => void;
    highPriorityCount: number;
    externalTaskCount?: number;
    approvedCount?: number;
    cancelledCount?: number;
    isOpen: boolean;
    onClose: () => void;
    onViewChange: (view: 'dashboard' | 'audit' | 'users' | 'teams' | 'approved' | 'cancelled' | 'calendar' | 'assigned') => void;
    currentView: 'dashboard' | 'audit' | 'users' | 'teams' | 'approved' | 'cancelled' | 'calendar' | 'assigned';
    selectedTeamId: string | null;
    onTeamSelect: (id: string | null) => void;
    userTeams: any[];
    user: any;
}


export const Sidebar = ({
    departments,
    taskCounts,
    selectedDeptId,
    onDeptSelect,
    highPriorityCount,
    externalTaskCount = 0,
    approvedCount = 0,
    cancelledCount = 0,
    isOpen,
    onClose,
    onViewChange,
    currentView,
    selectedTeamId,
    onTeamSelect,
    userTeams,
    user
}: SidebarProps) => {
    const { theme, toggleTheme } = useTheme();
    const isOverview = currentView === 'dashboard' && !selectedDeptId;

    const navItems = [
        {
            id: 'overview',
            label: 'Task Overview',
            icon: PieChart,
            active: isOverview,
            onClick: () => {
                onDeptSelect(null);
                onViewChange('dashboard');
            },
            permission: 'task:view' as const
        }
    ];

    const adminItems = [
        {
            id: 'users',
            label: 'Departments & Permissions',
            icon: ShieldCheck,
            active: currentView === 'users',
            onClick: () => onViewChange('users'),
            permission: 'user:view' as const
        },
        {
            id: 'teams',
            label: 'Teams',
            icon: Users,
            active: currentView === 'teams',
            onClick: () => onViewChange('teams'),
            permission: 'team:manage' as const
        },
        {
            id: 'audit',
            label: 'Security Logs',
            icon: AlertCircle,
            active: currentView === 'audit',
            onClick: () => onViewChange('audit'),
            permission: 'audit:view' as const
        }
    ];


    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <aside className={`
                w-72 bg-[#f8fafc] dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 fixed left-0 top-14 lg:top-16 z-50
                h-[calc(100dvh-56px)] lg:h-[calc(100vh-64px)]
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isOpen ? 'translate-x-0 shadow-2xl dark:shadow-slate-900/50' : '-translate-x-full'}
                lg:translate-x-0 lg:block lg:shadow-none
            `}>
                <div className="flex flex-col h-full transition-colors">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                        {/* Summary Card for High Priority */}
                        {highPriorityCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-rose-600 dark:bg-rose-700 p-4 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/20 relative overflow-hidden group"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle size={14} className="animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Attention Required</span>
                                    </div>
                                    <h4 className="text-xl font-bold">{highPriorityCount} Critical Tasks</h4>
                                    <p className="text-[10px] opacity-70 mt-1">Found across your workspace</p>
                                </div>
                                <AlertCircle className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
                            </motion.div>
                        )}

                        {/* Primary Navigation */}
                        <div className="space-y-1">
                            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-orange-600 uppercase tracking-[0.2em] mb-2">Main Console</p>
                            {navItems.map((item) => (
                                <PermissionGuard key={item.id} permission={item.permission}>
                                    <button
                                        onClick={() => {
                                            item.onClick();
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                            ${item.active
                                                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-sm border border-slate-100 dark:border-slate-800'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'}
                                        `}
                                    >
                                        <item.icon size={18} className={`${item.active ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`} />
                                        <span className="text-sm font-semibold flex-1 text-left">{item.label}</span>
                                        {item.active && <div className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 shadow-sm" />}
                                    </button>
                                </PermissionGuard>
                            ))}

                            {/* Assigned Tasks - visible to all */}
                            <button
                                onClick={() => {
                                    onDeptSelect(null);
                                    onViewChange('assigned');
                                    onClose();
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                    ${currentView === 'assigned'
                                        ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-sm border border-slate-100 dark:border-slate-800'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'}
                                `}
                            >
                                <UserCheck size={18} className={`${currentView === 'assigned' ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`} />
                                <span className="text-sm font-semibold flex-1 text-left">Assigned Tasks</span>
                                {currentView === 'assigned' && <div className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 shadow-sm" />}
                            </button>
                        </div>

                        <div className="space-y-1 pt-2">
                            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-orange-500 uppercase tracking-[0.2em] mb-2">History & Logs</p>
                            <button
                                onClick={() => {
                                    onDeptSelect(null);
                                    onViewChange('approved');
                                    onClose();
                                }}
                                className={`
                                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                                        ${currentView === 'approved'
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'}
                                    `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transition-colors ${currentView === 'approved' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    <span className="text-xs font-semibold">Approved History</span>
                                </div>
                                {approvedCount > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${currentView === 'approved' ? 'bg-emerald-200/50 dark:bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                        {approvedCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    onDeptSelect(null);
                                    onViewChange('cancelled');
                                    onClose();
                                }}
                                className={`
                                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                                        ${currentView === 'cancelled'
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-700'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'}
                                    `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transition-colors ${currentView === 'cancelled' ? 'bg-slate-600 dark:bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    <span className="text-xs font-semibold">Cancelled Log</span>
                                </div>
                                {cancelledCount > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${currentView === 'cancelled' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                        {cancelledCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="space-y-1 pt-2">
                            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-orange-500 uppercase tracking-[0.2em] mb-2">Administration</p>

                            {adminItems.map((item) => (
                                <PermissionGuard key={item.id} permission={item.permission}>
                                    <button
                                        onClick={() => {
                                            item.onClick();
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                            ${item.active
                                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'}
                                        `}
                                    >
                                        <item.icon size={18} className={`${item.active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`} />
                                        <span className="text-sm font-semibold flex-1 text-left">{item.label}</span>
                                        {item.active && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-sm" />}
                                    </button>
                                </PermissionGuard>
                            ))}
                        </div>

                        {/* Squads / Teams */}
                        {userTeams.length > 0 && (
                            <div className="space-y-1 pt-2">
                                <div className="flex items-center justify-between px-3 mb-2">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-orange-500 uppercase tracking-[0.2em]">
                                        {hasPermission(user, 'team:view_dept') ? 'Department Teams' : 'Assigned Squads'}
                                    </p>
                                    <Users size={12} className="text-slate-300 dark:text-orange-500" />
                                </div>
                                <div className="space-y-0.5">
                                    {userTeams.map(team => (
                                        <button
                                            key={team.id}
                                            onClick={() => {
                                                onTeamSelect(team.id);
                                                onClose();
                                            }}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group
                                                ${selectedTeamId === team.id
                                                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold border border-orange-100 dark:border-orange-500/20'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-100 dark:hover:border-slate-800'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-2 h-2 rounded-full shadow-inner transition-colors ${selectedTeamId === team.id ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                                <span className="text-xs truncate tracking-tight">{team.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Workflow Hub / Departments */}
                        <PermissionGuard permission="task:view_dept">
                            <div className="space-y-1 pt-2">
                                <div className="flex items-center justify-between px-3 mb-2">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-orange-500 uppercase tracking-[0.2em]">Workflows</p>
                                    <Building2 size={12} className="text-slate-300 dark:text-orange-500" />
                                </div>
                                <div className="space-y-0.5">
                                    {departments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => {
                                                onDeptSelect(dept.id);
                                                onViewChange('dashboard');
                                                onClose();
                                            }}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group
                                                ${selectedDeptId === dept.id && currentView === 'dashboard'
                                                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold border border-orange-100 dark:border-orange-500/20'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-100 dark:hover:border-slate-800'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-2 h-2 rounded-full shadow-inner transition-colors ${selectedDeptId === dept.id ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                                <span className="text-xs truncate tracking-tight">{dept.name}</span>
                                            </div>
                                            {taskCounts[dept.id] > 0 && (
                                                <span className={`
                                                    text-[10px] min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold rounded-lg
                                                    ${selectedDeptId === dept.id ? 'bg-orange-200/50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}
                                                `}>
                                                    {taskCounts[dept.id]}
                                                </span>
                                            )}
                                        </button>
                                    ))}

                                    {/* External Tasks for Heads - Logic moved into this block */}
                                    <button
                                        onClick={() => {
                                            onDeptSelect('EXTERNAL');
                                            onViewChange('dashboard');
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group mt-2
                                            ${selectedDeptId === 'EXTERNAL'
                                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-500/20'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-100 dark:hover:border-slate-800'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-2 h-2 rounded-full shadow-inner transition-colors ${selectedDeptId === 'EXTERNAL' ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                            <span className="text-xs truncate tracking-tight">Cross-Dept Requests</span>
                                        </div>
                                        {externalTaskCount > 0 && (
                                            <span className={`
                                                text-[10px] min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold rounded-lg
                                                ${selectedDeptId === 'EXTERNAL' ? 'bg-blue-200/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}
                                            `}>
                                                {externalTaskCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </PermissionGuard>
                    </div>

                    {/* Footer / App Badge */}
                    <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors space-y-4">
                        {/* Timeline Calendar Toggle */}
                        <button
                            onClick={() => {
                                onViewChange('calendar');
                                onClose();
                            }}
                            className={`
                                w-full flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all group mb-2
                                ${currentView === 'calendar'
                                    ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 font-bold'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 shadow-sm hover:shadow-md'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl shadow-sm border transition-colors ${currentView === 'calendar' ? 'bg-white dark:bg-slate-950 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                                    <Calendar size={16} />
                                </div>
                                <span className="text-xs font-bold tracking-tight">Timeline Calendar</span>
                            </div>
                            {currentView === 'calendar' && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm" />
                            )}
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                </span>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </button>


                    </div>
                </div>
            </aside>
        </>
    );
};
