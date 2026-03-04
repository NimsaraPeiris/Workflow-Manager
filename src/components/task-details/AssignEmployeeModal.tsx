import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { User as UserIcon, Building2, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface AssignEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userId: string | null, newDeptId?: string) => void;
    users: any[];
    departments: any[];
    taskDeptId?: string;
    currentUser: any;
}

export const AssignEmployeeModal = ({
    isOpen,
    onClose,
    onAssign,
    users,
    departments,
    taskDeptId,
    currentUser
}: AssignEmployeeModalProps) => {
    const [mode, setMode] = useState<'EMPLOYEE' | 'DEPARTMENT'>('EMPLOYEE');

    if (!isOpen) return null;

    const userRole = currentUser?.user_metadata?.role;
    const userDeptId = currentUser?.user_metadata?.department_id;
    const isHeadOfCurrentDept = userRole === 'SUPER_ADMIN' || userDeptId === taskDeptId;

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
                    className="relative bg-white dark:bg-slate-900 max-w-md w-full shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                >
                    <div className="p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none text-orange-600 dark:text-orange-500">Assignment</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Directly assign or transfer to another team</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-10 transition-colors">
                            <button
                                onClick={() => setMode('EMPLOYEE')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${mode === 'EMPLOYEE' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                <UserIcon size={18} />
                                <span>Employee</span>
                            </button>
                            <button
                                onClick={() => setMode('DEPARTMENT')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${mode === 'DEPARTMENT' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                <Building2 size={18} />
                                <span>Department</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {mode === 'EMPLOYEE' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Select Team Member</label>
                                        {!isHeadOfCurrentDept && (
                                            <span className="text-[9px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">Restricted</span>
                                        )}
                                    </div>

                                    {!isHeadOfCurrentDept ? (
                                        <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-3 transition-colors">
                                            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-bold">
                                                You can only assign employees within your own department. If you need a different team to handle this, use the <strong>Department</strong> transfer option.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <select
                                                defaultValue=""
                                                onChange={(e) => e.target.value && onAssign(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none hover:border-orange-200 dark:hover:border-orange-500/50 focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 font-bold"
                                            >
                                                <option value="" disabled className="dark:bg-slate-900">Choose an employee...</option>
                                                {users.filter(u => u.department_id === taskDeptId).map(u => (
                                                    <option key={u.id} value={u.id} className="dark:bg-slate-900">{u.full_name}</option>
                                                ))}
                                                {users.filter(u => u.department_id === taskDeptId).length === 0 && (
                                                    <option disabled className="dark:bg-slate-900">No employees in this department</option>
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
                                            defaultValue=""
                                            onChange={(e) => e.target.value && onAssign(null, e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none hover:border-orange-200 dark:hover:border-orange-500/50 focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 font-bold"
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

                            <div className="pt-2">
                                <Button onClick={onClose} variant="ghost" className="w-full h-14 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
