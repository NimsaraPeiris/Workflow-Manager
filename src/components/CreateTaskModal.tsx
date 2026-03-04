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
        department_id: string;
        assignee_id: string;
    };
    setNewTask: React.Dispatch<React.SetStateAction<{
        title: string;
        description: string;
        priority: string;
        due_date: string;
        department_id: string;
        assignee_id: string;
    }>>;
    departments: any[];
    employees: any[];
    currentUser: any;
}

export const CreateTaskModal = ({
    isOpen,
    onClose,
    onSubmit,
    loading,
    error,
    newTask,
    setNewTask,
    departments,
    employees,
    currentUser
}: CreateTaskModalProps) => {
    const userRole = currentUser?.user_metadata?.role;
    const userDeptId = currentUser?.user_metadata?.department_id;
    const isRestricted = !!(userRole !== 'SUPER_ADMIN' && newTask.department_id && newTask.department_id !== userDeptId);

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
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors"
                    >
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center transition-colors">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none text-orange-600 dark:text-orange-500">Create Task</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Fill in the details for your new project</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl transition-colors">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Task Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white dark:placeholder:text-slate-600 outline-none transition-all font-bold"
                                    placeholder="e.g. Design Landing Page"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Description</label>
                                <textarea
                                    rows={3}
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white dark:placeholder:text-slate-600 outline-none transition-all resize-none font-bold"
                                    placeholder="What needs to be done?"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Target Department</label>
                                <select
                                    required
                                    value={newTask.department_id}
                                    onChange={(e) => setNewTask({ ...newTask, department_id: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white outline-none transition-all appearance-none cursor-pointer font-bold"
                                >
                                    <option value="" className="dark:bg-slate-900">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id} className="dark:bg-slate-900">{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Assign To (Employee)</label>
                                <div className="relative">
                                    <select
                                        value={newTask.assignee_id}
                                        onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
                                        disabled={isRestricted}
                                        className={`w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 outline-none transition-all appearance-none font-bold ${isRestricted ? 'bg-slate-100 dark:bg-slate-800/20 cursor-not-allowed text-slate-400 dark:text-slate-600' : 'bg-slate-50 dark:bg-slate-800/40 dark:text-white cursor-pointer'}`}
                                    >
                                        <option value="" className="dark:bg-slate-900">{isRestricted ? 'Restricted: Target Head will assign' : 'Select Employee'}</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id} className="dark:bg-slate-900">
                                                {emp.full_name} ({emp.departments?.name || 'No Dept'})
                                            </option>
                                        ))}
                                    </select>
                                    {isRestricted && (
                                        <div className="mt-2.5 flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900/30 rounded-xl text-[10px] text-orange-800 dark:text-orange-300 font-bold leading-relaxed animate-in fade-in slide-in-from-top-2 duration-500 transition-colors">
                                            <AlertCircle className="shrink-0 mt-0.5" size={14} />
                                            <span>As a Department Head, you can only assign employees within your own department. The target department head will receive this task for assignment.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white outline-none transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="LOW" className="dark:bg-slate-900">Low Priority</option>
                                        <option value="MEDIUM" className="dark:bg-slate-900">Medium Priority</option>
                                        <option value="HIGH" className="dark:bg-slate-900">High Priority</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl dark:text-white outline-none transition-all cursor-pointer font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-orange-300 dark:disabled:bg-orange-900/50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Plus size={20} strokeWidth={3} />
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
