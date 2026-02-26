import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import type { Department } from '../../types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newUser: any;
    setNewUser: (user: any) => void;
    departments: Department[];
    loading: boolean;
    error: string;
}

export const CreateUserModal = ({
    isOpen,
    onClose,
    onSubmit,
    newUser,
    setNewUser,
    departments,
    loading,
    error
}: CreateUserModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <form onSubmit={onSubmit} className="p-8 space-y-6">
                            <div>
                                <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Add User / Head</h2>
                                <p className="text-slate-500 text-sm">Create a new organizational account and assign roles.</p>
                            </div>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-100">{error}</div>}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.fullName}
                                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        placeholder="Employee Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Office Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        placeholder="name@fochant.lk"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Initial Password</label>
                                <input
                                    required
                                    type="password"
                                    minLength={6}
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Department</label>
                                    <select
                                        required
                                        value={newUser.departmentId}
                                        onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none transition-all"
                                    >
                                        <option value="">Select Dept</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Role</label>
                                    <select
                                        required
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none transition-all"
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="HEAD">Department Head</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium transition-all shadow-lg shadow-orange-100 flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Create User"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
