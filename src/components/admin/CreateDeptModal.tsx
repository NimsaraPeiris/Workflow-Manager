import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface CreateDeptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newDeptName: string;
    setNewDeptName: (name: string) => void;
    loading: boolean;
    error: string;
}

export const CreateDeptModal = ({
    isOpen,
    onClose,
    onSubmit,
    newDeptName,
    setNewDeptName,
    loading,
    error
}: CreateDeptModalProps) => {
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
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 rounded-none"
                    >
                        <form onSubmit={onSubmit} className="p-8 space-y-6">
                            <div>
                                <h2 className="text-2xl text-slate-900 dark:text-white font-bold tracking-tight">Create Department</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Add a new administrative unit to your organization.</p>
                            </div>

                            {error && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs border border-red-100 dark:border-red-900/30 rounded-none">{error}</div>}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Department Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-white outline-none transition-all rounded-none"
                                    placeholder="e.g. Sales & Marketing"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-all rounded-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 dark:disabled:bg-slate-800 text-white font-medium transition-all shadow-lg dark:shadow-none shadow-orange-100 flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Dept"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
