import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { User as UserIcon, Building2, AlertCircle, X, Users } from 'lucide-react';
import { useState } from 'react';

interface AssignEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userId: string | null, teamId?: string | null, newDeptId?: string) => void;
    users: any[];
    departments: any[];
    teams: any[];
    taskDeptId?: string;
    currentUser: any;
}

export const AssignEmployeeModal = ({
    isOpen,
    onClose,
    onAssign,
    users,
    departments,
    teams,
    taskDeptId,
    currentUser
}: AssignEmployeeModalProps) => {
    const [mode, setMode] = useState<'EMPLOYEE' | 'TEAM' | 'DEPARTMENT'>('EMPLOYEE');
    const [selectedId, setSelectedId] = useState<string>('');

    if (!isOpen) return null;

    const userRole = currentUser?.role || currentUser?.user_metadata?.role;
    const userDeptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;

    // Check if the Head is looking at a task that belongs to their department
    const isHeadOfCurrentDept = userRole === 'SUPER_ADMIN' || userDeptId === taskDeptId;

    const handleConfirm = () => {
        if (!selectedId) return;
        if (mode === 'EMPLOYEE') {
            onAssign(selectedId, null, undefined);
        } else if (mode === 'TEAM') {
            onAssign(null, selectedId, undefined);
        } else {
            onAssign(null, null, selectedId);
        }
    };

    const handleModeChange = (newMode: 'EMPLOYEE' | 'TEAM' | 'DEPARTMENT') => {
        setMode(newMode);
        setSelectedId('');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md transition-colors"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white dark:bg-slate-900 max-w-lg w-full shadow-2xl rounded-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                >
                    <div className="p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none text-orange-600 dark:text-orange-500">Assignment</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Deploy personnel or transfer hierarchy</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-none mb-10 transition-colors">
                            <button
                                onClick={() => handleModeChange('EMPLOYEE')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-none text-xs font-black transition-all ${mode === 'EMPLOYEE' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                <UserIcon size={16} />
                                <span>Individual</span>
                            </button>
                            <button
                                onClick={() => handleModeChange('TEAM')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-none text-xs font-black transition-all ${mode === 'TEAM' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                <Users size={16} />
                                <span>Squad/Team</span>
                            </button>
                            <button
                                onClick={() => handleModeChange('DEPARTMENT')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-none text-xs font-black transition-all ${mode === 'DEPARTMENT' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                <Building2 size={16} />
                                <span>Department</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {mode === 'EMPLOYEE' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Select Team Member</label>
                                        {!isHeadOfCurrentDept && (
                                            <span className="text-[9px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-none">Restricted</span>
                                        )}
                                    </div>

                                    {!isHeadOfCurrentDept ? (
                                        <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30 rounded-none flex items-start gap-3 transition-colors">
                                            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-bold">
                                                You can only assign employees within your own department ({currentUser?.departments?.name || 'Loading...'}).
                                                The task must belong to your department first.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <select
                                                value={selectedId}
                                                onChange={(e) => setSelectedId(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none outline-none hover:border-orange-200 dark:hover:border-orange-500/50 focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 font-bold"
                                            >
                                                <option value="" disabled className="dark:bg-slate-900">Choose an employee...</option>
                                                {users.filter(u => userRole === 'SUPER_ADMIN' || u.department_id === (taskDeptId || userDeptId)).map(u => (
                                                    <option key={u.id} value={u.id} className="dark:bg-slate-900">{u.full_name} ({u.role}) - {u.departments?.name || 'No Dept'}</option>
                                                ))}
                                                {users.filter(u => userRole === 'SUPER_ADMIN' || u.department_id === (taskDeptId || userDeptId)).length === 0 && (
                                                    <option disabled className="dark:bg-slate-900">No employees eligible for selection</option>
                                                )}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600 group-hover:text-orange-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : mode === 'TEAM' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Select Squad</label>
                                        {!isHeadOfCurrentDept && (
                                            <span className="text-[9px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-none">Restricted</span>
                                        )}
                                    </div>

                                    {!isHeadOfCurrentDept ? (
                                        <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30 rounded-none flex items-start gap-3 transition-colors">
                                            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-bold">
                                                You can only assign squads within your own department.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <select
                                                value={selectedId}
                                                onChange={(e) => setSelectedId(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none outline-none hover:border-orange-200 dark:hover:border-orange-500/50 focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 font-bold"
                                            >
                                                <option value="" disabled className="dark:bg-slate-900">Choose a squad...</option>
                                                {teams.filter(t => userRole === 'SUPER_ADMIN' || t.department_id === (taskDeptId || userDeptId)).map(t => (
                                                    <option key={t.id} value={t.id} className="dark:bg-slate-900">{t.name} ({departments.find(d => d.id === t.department_id)?.name || 'Squad'})</option>
                                                ))}
                                                {teams.filter(t => userRole === 'SUPER_ADMIN' || t.department_id === (taskDeptId || userDeptId)).length === 0 && (
                                                    <option disabled className="dark:bg-slate-900">No teams eligible for selection</option>
                                                )}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600 group-hover:text-orange-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Target Department</label>
                                    <div className="relative group">
                                        <select
                                            value={selectedId}
                                            onChange={(e) => setSelectedId(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none outline-none hover:border-orange-200 dark:hover:border-orange-500/50 focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 font-bold"
                                        >
                                            <option value="" disabled className="dark:bg-slate-900">Choose a department...</option>
                                            {departments.filter(d => d.id !== taskDeptId).map(dept => (
                                                <option key={dept.id} value={dept.id} className="dark:bg-slate-900">{dept.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600 group-hover:text-orange-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold italic ml-1 leading-relaxed text-center mt-4">
                                        Transferring will notify the target department's head for final assignment.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-6">
                                <Button onClick={onClose} variant="secondary" className="h-14 font-black rounded-none">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={!selectedId}
                                    className="h-14 font-black rounded-none shadow-xl active:scale-95"
                                >
                                    {mode === 'EMPLOYEE' ? 'Assign Member' : mode === 'TEAM' ? 'Assign Team' : 'Transfer Dept'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
