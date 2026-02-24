import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2, Plus } from 'lucide-react';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
    newTask: {
        title: string;
        description: string;
        priority: string;
        due_date: string;
    };
    setNewTask: React.Dispatch<React.SetStateAction<{
        title: string;
        description: string;
        priority: string;
        due_date: string;
    }>>;
}

export const CreateTaskModal = ({
    isOpen,
    onClose,
    onSubmit,
    loading,
    error,
    newTask,
    setNewTask
}: CreateTaskModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl text-slate-900 tracking-tight">Create Task</h2>
                                <p className="text-slate-500 text-sm">Fill in the details for your new project</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 text-sm">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm text-slate-700 ml-1">Task Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                    placeholder="e.g. Design Landing Page"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-700 ml-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all resize-none"
                                    placeholder="What needs to be done?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-700 ml-1">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-700 ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white py-4 transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Plus size={20} />
                                            <span>Create Task</span>
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
