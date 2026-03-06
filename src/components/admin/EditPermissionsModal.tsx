import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, ShieldCheck, Layout, CheckSquare, Users, History, Settings } from 'lucide-react';
import { PERMISSION_MAP, getCategoryKeys } from '../../lib/permissions';
import type { Department } from '../../types';

interface EditPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string, updates: any) => Promise<void>;
    user: any;
    departments: Department[];
    roles: any[];
    loading: boolean;
    error: string;
}

export const EditPermissionsModal = ({
    isOpen,
    onClose,
    onSave,
    user,
    departments,
    roles,
    loading,
    error
}: EditPermissionsModalProps) => {
    const [editData, setEditData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<keyof typeof PERMISSION_MAP>('tasks');

    useEffect(() => {
        if (user) {
            setEditData({
                fullName: user.full_name,
                role: user.role,
                departmentId: user.department_id,
                permissions: Array.isArray(user.permissions) ? user.permissions : [],
                roleId: user.role_id || ''
            });
        }
    }, [user, isOpen]);

    const togglePermission = (key: string) => {
        const current = Array.isArray(editData.permissions) ? editData.permissions : [];
        const updated = current.includes(key)
            ? current.filter((k: string) => k !== key)
            : [...current, key];
        setEditData({ ...editData, permissions: updated });
    };

    const toggleCategory = (category: keyof typeof PERMISSION_MAP) => {
        const categoryKeys = getCategoryKeys(category);
        const current = Array.isArray(editData.permissions) ? editData.permissions : [];
        const allSelected = categoryKeys.every((k: string) => current.includes(k));

        let updated;
        if (allSelected) {
            updated = current.filter((k: string) => !categoryKeys.includes(k as any));
        } else {
            updated = Array.from(new Set([...current, ...categoryKeys]));
        }
        setEditData({ ...editData, permissions: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user && editData) {
            onSave(user.id, editData);
        }
    };

    if (!editData) return null;

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
                        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col h-[min(90vh,900px)] rounded-none overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 rounded-none shadow-lg">
                                        <ShieldCheck size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl text-slate-900 dark:text-white font-bold tracking-tight">Security Override</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Modifying access keys for <span className="text-slate-900 dark:text-white font-bold">{editData.fullName}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Assigned Keys</span>
                                        <span className="text-2xl font-black text-indigo-600">{editData.permissions.length}</span>
                                    </div>
                                    <button onClick={onClose} type="button" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-none transition-colors">
                                        <X size={24} className="text-slate-400 dark:text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar overscroll-contain">
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm border-l-4 border-red-500 font-bold">
                                        {error}
                                    </div>
                                )}

                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-6 bg-slate-900 dark:bg-slate-200" />
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Deployment Identity</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 text-xs">Full Name</label>
                                            <input
                                                type="text"
                                                value={editData.fullName}
                                                onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 text-xs">Department</label>
                                            <select
                                                value={editData.departmentId}
                                                onChange={(e) => setEditData({ ...editData, departmentId: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                {departments.map(d => <option key={d.id} value={d.id} className="dark:bg-slate-900">{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 text-xs">Access Tier</label>
                                            <select
                                                value={editData.role}
                                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="EMPLOYEE" className="dark:bg-slate-900">Employee Tier</option>
                                                <option value="HEAD" className="dark:bg-slate-900">Management Tier (Head)</option>
                                                <option value="SUPER_ADMIN" className="dark:bg-slate-900">Technical Administrator</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 text-xs">Sync with Role Blueprint</label>
                                            <select
                                                value={editData.roleId}
                                                onChange={(e) => {
                                                    const role = roles.find(r => r.id === e.target.value);
                                                    setEditData({
                                                        ...editData,
                                                        roleId: e.target.value,
                                                        permissions: role ? role.permissions : editData.permissions
                                                    });
                                                }}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all rounded-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="" className="dark:bg-slate-900">Keep Custom Permissions</option>
                                                {roles.map(r => <option key={r.id} value={r.id} className="dark:bg-slate-900">{r.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-6 bg-indigo-600" />
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Micro-Permission Architecture</h3>
                                    </div>

                                    <div className="flex border-2 border-slate-100 dark:border-slate-800 h-[500px] overflow-hidden">
                                        {/* Permission Sidebar */}
                                        <div className="w-64 bg-slate-50/50 dark:bg-slate-800/20 border-r-2 border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
                                            {Object.entries(PERMISSION_MAP).map(([key, group]) => {
                                                const k = key as keyof typeof PERMISSION_MAP;
                                                const categoryKeys = getCategoryKeys(k);
                                                const permissionsArray = Array.isArray(editData.permissions) ? editData.permissions : [];
                                                const selectedCount = permissionsArray.filter((pk: string) => categoryKeys.includes(pk as any)).length;
                                                const Icon = k === 'tasks' ? CheckSquare : k === 'departments' ? Layout : k === 'users' ? Users : k === 'system' ? History : Settings;

                                                return (
                                                    <button
                                                        key={k}
                                                        type="button"
                                                        onClick={() => setActiveTab(k)}
                                                        className={`
                                                            flex items-center justify-between px-6 py-5 text-left transition-all relative group
                                                            ${activeTab === k
                                                                ? 'bg-white dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold'
                                                                : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Icon size={18} className={activeTab === k ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                                            <span className="text-xs uppercase tracking-wider">{group.label.split(' ')[0]}</span>
                                                        </div>
                                                        {selectedCount > 0 && (
                                                            <div className={`text-[9px] px-1.5 py-0.5 rounded-none font-black ${activeTab === k ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                                                {selectedCount}
                                                            </div>
                                                        )}
                                                        {activeTab === k && <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Permission Content */}
                                        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900/50">
                                            {Object.entries(PERMISSION_MAP).map(([key, group]) => {
                                                if (key !== activeTab) return null;
                                                const categoryKeys = getCategoryKeys(key as any);
                                                const permissionsArray = Array.isArray(editData.permissions) ? editData.permissions : [];
                                                const isAllSelected = categoryKeys.every(k => permissionsArray.includes(k));

                                                return (
                                                    <div key={key} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                                        <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                                                            <div>
                                                                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                                                    {group.label}
                                                                </h4>
                                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1.5">Configure atomic access keys</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleCategory(key as any)}
                                                                className={`text-[10px] font-bold uppercase transition-all px-4 py-2 rounded-none border-2 ${isAllSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-200'}`}
                                                            >
                                                                {isAllSelected ? 'Revoke All' : 'Grant Category'}
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {group.micro.map(p => (
                                                                <div
                                                                    key={p.key}
                                                                    onClick={() => togglePermission(p.key)}
                                                                    className={`
                                                                        flex items-center gap-4 p-5 rounded-none border-2 transition-all cursor-pointer group
                                                                        ${editData.permissions?.includes(p.key)
                                                                            ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-600/20'
                                                                            : 'bg-slate-50/50 dark:bg-slate-800/10 border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-white'}
                                                                    `}
                                                                >
                                                                    <div className={`
                                                                        w-6 h-6 rounded-none border-2 flex items-center justify-center transition-all
                                                                        ${editData.permissions?.includes(p.key)
                                                                            ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-lg shadow-indigo-100 dark:shadow-none'
                                                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 group-hover:border-indigo-400'}
                                                                    `}>
                                                                        {editData.permissions?.includes(p.key) && (
                                                                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white stroke-[4px]" fill="none" stroke="currentColor">
                                                                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className={`text-xs font-bold block mb-0.5 transition-colors ${editData.permissions?.includes(p.key) ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                            {p.label}
                                                                        </span>
                                                                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 dark:text-slate-600">ID: {p.key}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="p-8 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 flex gap-6 shrink-0 transition-colors">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm transition-all rounded-none"
                                >
                                    Cancel Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 rounded-none"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            Save Security Updates
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
