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
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white max-w-md w-full shadow-2xl rounded-2xl border border-slate-100 overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Assignment</h3>
                                <p className="text-sm text-slate-500 mt-1">Directly assign or transfer to another team</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                            <button
                                onClick={() => setMode('EMPLOYEE')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'EMPLOYEE' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <UserIcon size={16} />
                                <span>Employee</span>
                            </button>
                            <button
                                onClick={() => setMode('DEPARTMENT')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'DEPARTMENT' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Building2 size={16} />
                                <span>Department</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {mode === 'EMPLOYEE' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Team Member</label>
                                        {!isHeadOfCurrentDept && (
                                            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider bg-rose-50 px-2 py-0.5">Restricted</span>
                                        )}
                                    </div>

                                    {!isHeadOfCurrentDept ? (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                            <p className="text-xs text-rose-700 leading-relaxed">
                                                You can only assign employees within your own department. If you need a different team to handle this, use the <strong>Department</strong> transfer option.
                                            </p>
                                        </div>
                                    ) : (
                                        <select
                                            defaultValue=""
                                            onChange={(e) => e.target.value && onAssign(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none hover:border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Choose an employee...</option>
                                            {users.filter(u => u.department_id === taskDeptId).map(u => (
                                                <option key={u.id} value={u.id}>{u.full_name}</option>
                                            ))}
                                            {users.filter(u => u.department_id === taskDeptId).length === 0 && (
                                                <option disabled>No employees in this department</option>
                                            )}
                                        </select>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Target Department</label>
                                    <select
                                        defaultValue=""
                                        onChange={(e) => e.target.value && onAssign(null, e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none hover:border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Choose a department...</option>
                                        {departments.filter(d => d.id !== taskDeptId).map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-500 italic ml-1 leading-relaxed">
                                        Transferring will notify the target department's head for final assignment.
                                    </p>
                                </div>
                            )}

                            <Button onClick={onClose} variant="ghost" className="w-full h-12 rounded-xl">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
