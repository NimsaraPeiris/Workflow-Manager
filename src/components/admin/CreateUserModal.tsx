import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';

import type { Department } from '../../types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newUser: any;
    setNewUser: (user: any) => void;
    departments: Department[];
    teams?: any[];
    roles?: any[];
    loading: boolean;
    error: string;
}


import { PERMISSION_MAP, getCategoryKeys } from '../../lib/permissions';

export const CreateUserModal = ({
    isOpen,
    onClose,
    onSubmit,
    newUser,
    setNewUser,
    departments,
    teams = [],
    roles = [],
    loading,
    error
}: CreateUserModalProps) => {


    const togglePermission = (key: string) => {
        const current = newUser.permissions || [];
        const updated = current.includes(key)
            ? current.filter((k: string) => k !== key)
            : [...current, key];
        setNewUser({ ...newUser, permissions: updated });
    };

    const toggleCategory = (category: keyof typeof PERMISSION_MAP) => {
        const categoryKeys = getCategoryKeys(category);
        const current = newUser.permissions || [];
        const allSelected = categoryKeys.every((k: string) => current.includes(k));

        let updated;
        if (allSelected) {
            // Remove all in category
            updated = current.filter((k: string) => !categoryKeys.includes(k as any));
        } else {
            // Add all in category (avoiding duplicates)
            updated = Array.from(new Set([...current, ...categoryKeys]));
        }
        setNewUser({ ...newUser, permissions: updated });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col h-[min(90vh,900px)] rounded-none overflow-hidden transition-colors"
                    >
                        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-600 rounded-none shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
                                        <X size={24} className="text-white rotate-45" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl text-slate-900 dark:text-white font-bold tracking-tight">Provision Identity</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Configure access gates and organizational placement.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Active Gates</span>
                                        <span className="text-2xl font-black text-orange-600">{(newUser.permissions || []).length}</span>
                                    </div>
                                    <button onClick={onClose} type="button" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-none transition-colors">
                                        <X size={24} className="text-slate-400 dark:text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar overscroll-contain">
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm border-l-4 border-red-500 font-bold rounded-none">
                                        {error}
                                    </div>
                                )}

                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-6 bg-slate-900 dark:bg-slate-200 rounded-none" />
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Deployment Specifications</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Legal Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={newUser.fullName}
                                                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white"
                                                placeholder="Enter Here"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Corporate Email</label>
                                            <input
                                                required
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white"
                                                placeholder="name@company.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Access Secret</label>
                                            <input
                                                required
                                                type="password"
                                                minLength={6}
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Department Node</label>
                                            <select
                                                required
                                                value={newUser.departmentId}
                                                onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="" className="dark:bg-slate-900">Select Node</option>
                                                {departments.map(d => <option key={d.id} value={d.id} className="dark:bg-slate-900">{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Squad (Team)</label>
                                            <select
                                                value={newUser.teamId || ''}
                                                onChange={(e) => setNewUser({ ...newUser, teamId: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="" className="dark:bg-slate-900">No Squad Assigned</option>
                                                {departments.map(dept => {
                                                    const deptTeams = teams.filter(t => t.department_id === dept.id);
                                                    if (deptTeams.length === 0) return null;
                                                    return (
                                                        <optgroup key={dept.id} label={dept.name} className="dark:bg-slate-900">
                                                            {deptTeams.map(t => (
                                                                <option key={t.id} value={t.id} className="dark:bg-slate-900">{t.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Role Blueprint</label>
                                            <select
                                                required
                                                value={newUser.roleId}
                                                onChange={(e) => {
                                                    const role = roles.find(r => r.id === e.target.value);
                                                    setNewUser({
                                                        ...newUser,
                                                        roleId: e.target.value,
                                                        role: role ? role.name : 'Custom',
                                                        permissions: role ? role.permissions : (newUser.permissions || [])
                                                    });
                                                }}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="" className="dark:bg-slate-900">Select Blueprint</option>
                                                {roles.map(r => <option key={r.id} value={r.id} className="dark:bg-slate-900">{r.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-6 bg-orange-600 rounded-none" />
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Custom Permission Override</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                        {Object.entries(PERMISSION_MAP).map(([key, group]) => {
                                            const categoryKeys = getCategoryKeys(key as any);
                                            const isAllSelected = categoryKeys.every(k => (newUser.permissions || []).includes(k));

                                            return (
                                                <div key={key} className="space-y-6">
                                                    <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                                                        <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                                            {group.label}
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategory(key as any)}
                                                            className={`text-[10px] font-bold uppercase transition-all px-3 py-1 rounded-none ${isAllSelected ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                        >
                                                            {isAllSelected ? 'Revoke All' : 'Grant All'}
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2.5">
                                                        {group.micro.map(p => (
                                                            <div
                                                                key={p.key}
                                                                onClick={() => togglePermission(p.key)}
                                                                className={`
                                                                    flex items-center gap-3 p-4 rounded-none border-2 transition-all cursor-pointer group
                                                                    ${newUser.permissions?.includes(p.key)
                                                                        ? 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-500/20'
                                                                        : 'bg-white dark:bg-slate-800/40 border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                                                `}
                                                            >
                                                                <div className={`
                                                                    w-5 h-5 rounded-none border-2 flex items-center justify-center transition-all
                                                                    ${newUser.permissions?.includes(p.key)
                                                                        ? 'bg-orange-600 border-orange-600 scale-110 shadow-lg shadow-orange-200 dark:shadow-none'
                                                                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-orange-400'}
                                                                `}>
                                                                    {newUser.permissions?.includes(p.key) && (
                                                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white stroke-[4px]" fill="none" stroke="currentColor">
                                                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span className={`text-xs font-bold transition-colors ${newUser.permissions?.includes(p.key) ? 'text-orange-950 dark:text-orange-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                    {p.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            <div className="p-8 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 flex gap-6 shrink-0 transition-colors">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm transition-all rounded-none"
                                >
                                    Discard Request
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-10 py-4 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold text-sm transition-all shadow-2xl shadow-slate-300 dark:shadow-none flex items-center justify-center gap-3 rounded-none"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            Provision Account
                                            <div className="w-2 h-2 rounded bg-green-600 animate-pulse shadow-glow" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
