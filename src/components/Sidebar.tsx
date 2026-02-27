import {
    Building2,
    AlertCircle,
    ShieldCheck,
    Users,
    Settings,
    PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    userRole?: string;
    onViewChange: (view: 'dashboard' | 'audit' | 'users' | 'approved' | 'cancelled') => void;
    currentView: 'dashboard' | 'audit' | 'users' | 'approved' | 'cancelled';
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
    userRole,
    onViewChange,
    currentView
}: SidebarProps) => {
    const isOverview = currentView === 'dashboard' && !selectedDeptId;

    const navItems = userRole !== 'EMPLOYEE' ? [
        {
            id: 'overview',
            label: 'Organization Overview',
            icon: PieChart,
            active: isOverview,
            onClick: () => {
                onDeptSelect(null);
                onViewChange('dashboard');
            }
        }
    ] : [];

    const adminItems = [
        {
            id: 'users',
            label: 'Teams & Permissions',
            icon: Users,
            active: currentView === 'users',
            onClick: () => onViewChange('users')
        },
        {
            id: 'audit',
            label: 'Security Logs',
            icon: ShieldCheck,
            active: currentView === 'audit',
            onClick: () => onViewChange('audit')
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
                w-72 bg-[#f8fafc] border-r border-slate-200 h-[calc(100vh-64px)] fixed left-0 top-16 z-50
                transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                lg:translate-x-0 lg:block lg:shadow-none
            `}>
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                        {/* Summary Card for High Priority */}
                        {highPriorityCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-rose-600 p-4 text-white shadow-lg shadow-rose-200 relative overflow-hidden group"
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
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Main Console</p>
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        item.onClick();
                                        onClose();
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                        ${item.active
                                            ? 'bg-white text-orange-600 shadow-sm border border-slate-100'
                                            : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'}
                                    `}
                                >
                                    <item.icon size={18} className={`${item.active ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                                    <span className="text-sm font-semibold flex-1 text-left">{item.label}</span>
                                    {item.active && <div className="w-1.5 h-1.5 rounded-full bg-orange-600 shadow-sm" />}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-1 pt-2">
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">History & Logs</p>
                            <button
                                onClick={() => {
                                    onDeptSelect(null);
                                    onViewChange('approved');
                                    onClose();
                                }}
                                className={`
                                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                                        ${currentView === 'approved'
                                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                                        : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'}
                                    `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transition-colors ${currentView === 'approved' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                    <span className="text-xs font-semibold">Approved History</span>
                                </div>
                                {approvedCount > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${currentView === 'approved' ? 'bg-emerald-200/50' : 'bg-slate-100'}`}>
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
                                        ? 'bg-slate-200 text-slate-900 font-bold'
                                        : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'}
                                    `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transition-colors ${currentView === 'cancelled' ? 'bg-slate-600' : 'bg-slate-200'}`} />
                                    <span className="text-xs font-semibold">Cancelled Log</span>
                                </div>
                                {cancelledCount > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${currentView === 'cancelled' ? 'bg-slate-300' : 'bg-slate-100'}`}>
                                        {cancelledCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Admin Section */}
                        {userRole === 'SUPER_ADMIN' && (
                            <div className="space-y-1 pt-2">
                                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Administration</p>
                                {adminItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            item.onClick();
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                            ${item.active
                                                ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                                                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'}
                                        `}
                                    >
                                        <item.icon size={18} className={`${item.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                                        <span className="text-sm font-semibold flex-1 text-left">{item.label}</span>
                                        {item.active && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Workflow Hub / Departments */}
                        <div className="space-y-1 pt-2">
                            <div className="flex items-center justify-between px-3 mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Workflows</p>
                                <Building2 size={12} className="text-slate-300" />
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
                                                ? 'bg-orange-50 text-orange-700 font-bold'
                                                : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent hover:border-slate-100'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-2 h-2 rounded-full shadow-inner transition-colors ${selectedDeptId === dept.id ? 'bg-orange-500' : 'bg-slate-200'}`} />
                                            <span className="text-xs truncate tracking-tight">{dept.name}</span>
                                        </div>
                                        {taskCounts[dept.id] > 0 && (
                                            <span className={`
                                                text-[10px] min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold rounded-lg
                                                ${selectedDeptId === dept.id ? 'bg-orange-200/50 text-orange-700' : 'bg-slate-100 text-slate-500'}
                                            `}>
                                                {taskCounts[dept.id]}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                {/* External Tasks for Heads */}
                                {userRole === 'HEAD' && (
                                    <button
                                        onClick={() => {
                                            onDeptSelect('EXTERNAL');
                                            onViewChange('dashboard');
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group mt-2
                                            ${selectedDeptId === 'EXTERNAL'
                                                ? 'bg-indigo-50 text-indigo-700 font-bold'
                                                : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent hover:border-slate-100'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-2 h-2 rounded-full shadow-inner transition-colors ${selectedDeptId === 'EXTERNAL' ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                            <span className="text-xs truncate tracking-tight">Cross-Dept Requests</span>
                                        </div>
                                        {externalTaskCount > 0 && (
                                            <span className={`
                                                text-[10px] min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold rounded-lg
                                                ${selectedDeptId === 'EXTERNAL' ? 'bg-indigo-200/50 text-indigo-700' : 'bg-slate-100 text-slate-500'}
                                            `}>
                                                {externalTaskCount}
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / App Badge */}
                    <div className="p-4 bg-white border-t border-slate-200 mt-auto">
                        <div className="bg-slate-50 p-4 flex items-center gap-4 border border-slate-100">
                            <div className="w-10 h-10 bg-orange-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-orange-100 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700" />
                                <span className="relative">W</span>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-slate-900">Workflow Manager</h5>
                                <p className="text-[10px] text-slate-400 font-medium">Alpha Version</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
