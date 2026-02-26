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
                        className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <form onSubmit={onSubmit} className="p-8 space-y-6">
                            <div>
                                <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Create Department</h2>
                                <p className="text-slate-500 text-sm">Add a new administrative unit to your organization.</p>
                            </div>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-100">{error}</div>}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Department Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                    placeholder="e.g. Sales & Marketing"
                                />
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
