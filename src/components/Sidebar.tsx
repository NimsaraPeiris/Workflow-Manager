import { Layout, Building2, AlertCircle, Bookmark, X, ShieldCheck } from 'lucide-react';

interface SidebarProps {
    departments: any[];
    taskCounts: Record<string, number>;
    selectedDeptId: string | null;
    onDeptSelect: (id: string | null) => void;
    highPriorityCount: number;
    isOpen: boolean;
    onClose: () => void;
    userRole?: string;
    onViewChange: (view: 'dashboard' | 'audit' | 'users') => void;
    currentView: 'dashboard' | 'audit' | 'users';
}

export const Sidebar = ({
    departments,
    taskCounts,
    selectedDeptId,
    onDeptSelect,
    highPriorityCount,
    isOpen,
    onClose,
    userRole,
    onViewChange,
    currentView
}: SidebarProps) => {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                w-72 bg-white border-r border-slate-200 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                lg:translate-x-0 lg:block lg:shadow-none
            `}>
                <div className="p-6 space-y-8">
                    {/* Mobile Close Button */}
                    <div className="flex items-center justify-between lg:hidden mb-6">
                        <span className="font-bold text-slate-900">Menu</span>
                        <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Navigation</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    onDeptSelect(null);
                                    onViewChange('dashboard');
                                }}
                                className={`w-full flex items-center justify-between p-3 transition-all ${currentView === 'dashboard' && !selectedDeptId ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Layout size={18} />
                                    <span className="text-sm font-medium">Overview</span>
                                </div>
                            </button>

                            <button
                                className="w-full flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertCircle size={18} className={highPriorityCount > 0 ? 'text-rose-500' : ''} />
                                    <span className="text-sm font-medium">Critical Tasks</span>
                                </div>
                                {highPriorityCount > 0 && (
                                    <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 font-bold">
                                        {highPriorityCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Admin Section (Visible only to SUPER_ADMIN) */}
                    {userRole === 'SUPER_ADMIN' && (
                        <div>
                            <h3 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-4">Administration</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => onViewChange('users')}
                                    className={`w-full flex items-center gap-3 p-3 transition-all ${currentView === 'users' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Building2 size={18} />
                                    <span className="text-sm font-medium">User & Dept Management</span>
                                </button>
                                <button
                                    onClick={() => onViewChange('audit')}
                                    className={`w-full flex items-center gap-3 p-3 transition-all ${currentView === 'audit' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <ShieldCheck size={18} />
                                    <span className="text-sm font-medium">System Audit Logs</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Departments */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departments</h3>
                            <Building2 size={14} className="text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            {departments.map((dept) => (
                                <button
                                    key={dept.id}
                                    onClick={() => {
                                        onDeptSelect(dept.id);
                                        onViewChange('dashboard');
                                    }}
                                    className={`w-full flex items-center justify-between p-3 transition-all ${selectedDeptId === dept.id && currentView === 'dashboard' ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedDeptId === dept.id ? 'bg-orange-600' : 'bg-slate-300'}`} />
                                        <span className="text-sm font-medium truncate">{dept.name}</span>
                                    </div>
                                    {taskCounts[dept.id] > 0 && (
                                        <span className={`text-[10px] px-2 py-0.5 font-bold ${selectedDeptId === dept.id ? 'bg-orange-100' : 'bg-slate-100'}`}>
                                            {taskCounts[dept.id]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Filters Placeholder */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Shortcuts</h3>
                        <div className="space-y-1">
                            <button className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 transition-all text-sm italic">
                                <Bookmark size={16} />
                                <span>Saved views coming soon</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold">
                            WM
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Workflow Manager</p>
                            <p className="text-[10px] text-slate-500 italic">Fochant Technologies</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
