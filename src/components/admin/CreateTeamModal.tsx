import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, Building2, X } from 'lucide-react';
import type { Department } from '../../types';

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newTeam: { name: string; departmentId: string };
    setNewTeam: (team: { name: string; departmentId: string }) => void;
    departments: Department[];
    loading: boolean;
    error: string;
}

export const CreateTeamModal = ({
    isOpen,
    onClose,
    onSubmit,
    newTeam,
    setNewTeam,
    departments,
    loading,
    error
}: CreateTeamModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md transition-colors"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 rounded-none transition-colors"
                    >
                        <form onSubmit={onSubmit} className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none text-orange-600 dark:text-orange-500">Create Team</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Add a new operational squad to a department.</p>
                                </div>
                                <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-900/30 rounded-none">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Team Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-orange-500 transition-colors">
                                            <Users size={18} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={newTeam.name}
                                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white outline-none transition-all placeholder:text-slate-400 font-bold"
                                            placeholder="e.g. Design Systems"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Parent Department</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-orange-500 transition-colors pointer-events-none">
                                            <Building2 size={18} />
                                        </div>
                                        <select
                                            required
                                            value={newTeam.departmentId}
                                            onChange={(e) => setNewTeam({ ...newTeam, departmentId: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none outline-none hover:border-orange-200 dark:hover:border-orange-500/50 focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 font-bold"
                                        >
                                            <option value="" disabled className="dark:bg-slate-900">Select a department...</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id} className="dark:bg-slate-900">{dept.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600 group-hover:text-orange-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-sm uppercase tracking-widest transition-all rounded-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !newTeam.name || !newTeam.departmentId}
                                    className="px-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-800 flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Provision Team"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
