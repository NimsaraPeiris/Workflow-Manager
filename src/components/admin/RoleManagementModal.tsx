import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, Plus, X, ChevronRight, Settings } from 'lucide-react';
import { PERMISSION_MAP, getCategoryKeys } from '../../lib/permissions';

interface RoleManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: { id?: string; name: string; permissions: string[] }) => Promise<void>;
    onDelete?: (roleId: string) => Promise<void>;
    existingRoles: any[];
}

export const RoleManagementModal = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    existingRoles
}: RoleManagementModalProps) => {
    const [editingRole, setEditingRole] = useState<any>(null);
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'list' | 'create'>('list');
    const [error, setError] = useState('');

    const togglePermission = (key: string) => {
        setSelectedPermissions(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const toggleCategory = (category: keyof typeof PERMISSION_MAP) => {
        const categoryKeys = getCategoryKeys(category);
        const allSelected = categoryKeys.every(k => selectedPermissions.includes(k));
        setError('');

        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(k => !categoryKeys.includes(k as any)));
        } else {
            setSelectedPermissions(prev => Array.from(new Set([...prev, ...categoryKeys])));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onSave({
                id: editingRole?.id,
                name,
                permissions: selectedPermissions
            });
            setName('');
            setSelectedPermissions([]);
            setEditingRole(null);
            setView('list');
        } catch (err: any) {
            console.error('Save failed:', err);
            setError(err.message || 'Blueprint synchronization failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role: any) => {
        setEditingRole(role);
        setName(role.name);
        setSelectedPermissions(role.permissions || []);
        setView('create');
    };

    const handleDelete = async (roleId: string) => {
        if (!onDelete || !window.confirm('Are you sure you want to delete this role blueprint? This may affect users currently assigned to this role.')) return;

        setLoading(true);
        try {
            await onDelete(roleId);
        } catch (err: any) {
            setError(err.message || 'Deletion failed.');
        } finally {
            setLoading(false);
        }
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
                        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col h-[min(90vh,900px)] rounded-none overflow-hidden transition-colors"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-2xl text-slate-900 dark:text-white font-bold tracking-tight">Authority & Roles</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Define custom access levels and permission blueprints.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-none transition-colors">
                                <X size={24} className="text-slate-400 dark:text-slate-500" />
                            </button>
                        </div>

                        {view === 'list' ? (
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
                                <div className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-none transition-colors">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Organizational Roles</h3>
                                        <button
                                            onClick={() => {
                                                setEditingRole(null);
                                                setName('');
                                                setSelectedPermissions([]);
                                                setView('create');
                                                setError('');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-orange-600 text-white text-xs font-bold rounded-none hover:bg-slate-800 dark:hover:bg-orange-700 transition-all shadow-lg dark:shadow-none"
                                        >
                                            <Plus size={16} />
                                            Define New Role
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {existingRoles.map(role => (
                                            <div key={role.id} className="p-5 border-2 border-slate-100 dark:border-slate-800 rounded-none bg-white dark:bg-slate-800/40 hover:border-orange-500/20 dark:hover:border-orange-500/40 transition-all group relative">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-orange-50 dark:bg-orange-900/10 rounded-none">
                                                            <Shield size={20} className="text-orange-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-white">{role.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-orange-600 transition-colors"
                                                            title="Edit Blueprint"
                                                        >
                                                            <Settings size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(role.id)}
                                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-600 transition-colors"
                                                            title="Delete Blueprint"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {role.permissions.slice(0, 3).map((p: string) => (
                                                        <span key={p} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-none font-bold">
                                                            {p}
                                                        </span>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold px-1">+{role.permissions.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar overscroll-contain">
                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            {error && (
                                                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-none transition-colors">
                                                    {error}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setView('list')}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none text-slate-400"
                                                >
                                                    <ChevronRight className="rotate-180" size={20} />
                                                </button>
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
                                                    {editingRole ? 'Edit Blueprint' : 'Blueprint Configuration'}
                                                </h3>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role Designation</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-none transition-all rounded-none text-lg font-bold dark:text-white"
                                                    placeholder="e.g. Branch Supervisor"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-4 w-1 bg-orange-600" />
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Permission Matrix</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                {Object.entries(PERMISSION_MAP).map(([key, group]) => {
                                                    const categoryKeys = getCategoryKeys(key as any);
                                                    const isAllSelected = categoryKeys.every(k => selectedPermissions.includes(k));

                                                    return (
                                                        <div key={key} className="space-y-4">
                                                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                                                <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{group.label}</h4>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleCategory(key as any)}
                                                                    className={`text-[10px] font-bold uppercase transition-colors px-2 py-1 rounded-none ${isAllSelected ? 'bg-orange-600 text-white shadow-lg dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                                >
                                                                    {isAllSelected ? 'Deselect All' : 'Select All'}
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-2">
                                                                {group.micro.map(p => (
                                                                    <div
                                                                        key={p.key}
                                                                        onClick={() => togglePermission(p.key)}
                                                                        className={`
                                                                            flex items-center gap-3 p-3 rounded-none border-2 transition-all cursor-pointer group
                                                                            ${selectedPermissions.includes(p.key)
                                                                                ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-500/20'
                                                                                : 'bg-white dark:bg-slate-800/40 border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                                                        `}
                                                                    >
                                                                        <div className={`
                                                                            w-5 h-5 rounded-none border-2 flex items-center justify-center transition-all
                                                                            ${selectedPermissions.includes(p.key)
                                                                                ? 'bg-orange-600 border-orange-600 scale-110 shadow-lg dark:shadow-none'
                                                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 group-hover:border-orange-400'}
                                                                        `}>
                                                                            {selectedPermissions.includes(p.key) && (
                                                                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white stroke-[4px]" fill="none" stroke="currentColor">
                                                                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-xs font-bold transition-colors ${selectedPermissions.includes(p.key) ? 'text-orange-900 dark:text-orange-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                            {p.label}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 transition-colors">
                                    <button
                                        type="button"
                                        onClick={() => setView('list')}
                                        className="px-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm transition-all rounded-none"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !name}
                                        className="flex-1 px-8 py-4 bg-orange-600 text-white font-bold rounded-none hover:bg-orange-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-xl shadow-orange-200 dark:shadow-none flex items-center justify-center gap-3"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : (editingRole ? "Update Blueprint" : "Save Role Blueprint")}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

