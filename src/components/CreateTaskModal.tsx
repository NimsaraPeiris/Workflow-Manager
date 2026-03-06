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
        team_id: string;
    };
    setNewTask: React.Dispatch<React.SetStateAction<{
        title: string;
        description: string;
        priority: string;
        due_date: string;
        department_id: string;
        assignee_id: string;
        team_id: string;
    }>>;
    departments: any[];
    employees: any[];
    teams: any[];
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
    teams,
    currentUser
}: CreateTaskModalProps) => {
    const appRole = (currentUser?.role && currentUser?.role !== 'authenticated')
        ? currentUser.role
        : currentUser?.user_metadata?.role;
    const userDeptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;
    const isRestricted = !!(appRole !== 'SUPER_ADMIN' && newTask.department_id && newTask.department_id !== userDeptId);

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
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-none overflow-hidden border border-slate-100 dark:border-slate-800 transition-all flex flex-col h-[min(90vh,800px)]"
                    >
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center transition-colors shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none text-orange-600 dark:text-orange-500">Create Task</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Fill in the details for your new project</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar overscroll-contain">
                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-none transition-colors">
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
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white dark:placeholder:text-slate-600 outline-none transition-all font-bold"
                                        placeholder="e.g. Design Landing Page"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Description</label>
                                    <textarea
                                        rows={3}
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white dark:placeholder:text-slate-600 outline-none transition-all resize-none font-bold"
                                        placeholder="What needs to be done?"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Target Department</label>
                                    <select
                                        required
                                        value={newTask.department_id}
                                        onChange={(e) => setNewTask({ ...newTask, department_id: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white outline-none transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="" className="dark:bg-slate-900">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id} className="dark:bg-slate-900">{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-slate-50 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Tactical Assignment</h4>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Assign to Squad (Team)</label>
                                        <select
                                            value={newTask.team_id}
                                            onChange={(e) => {
                                                setNewTask({ ...newTask, team_id: e.target.value, assignee_id: '' });
                                            }}
                                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white outline-none transition-all appearance-none cursor-pointer font-bold"
                                        >
                                            <option value="" className="dark:bg-slate-900">Individual Assignment Only</option>
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

                                    {!newTask.team_id && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Assign to Individual</label>
                                            <div className="relative">
                                                <select
                                                    value={newTask.assignee_id}
                                                    onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
                                                    disabled={isRestricted}
                                                    className={`w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-none focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 outline-none transition-all appearance-none font-bold ${isRestricted ? 'bg-slate-100 dark:bg-slate-800/20 cursor-not-allowed text-slate-400 dark:text-slate-600' : 'bg-slate-50 dark:bg-slate-800/40 dark:text-white cursor-pointer'}`}
                                                >
                                                    <option value="" className="dark:bg-slate-900">{isRestricted ? 'Restricted: Target Head will assign' : 'Select Employee'}</option>
                                                    {employees.map(emp => (
                                                        <option key={emp.id} value={emp.id} className="dark:bg-slate-900">
                                                            {emp.full_name} ({emp.departments?.name || 'No Dept'})
                                                        </option>
                                                    ))}
                                                </select>
                                                {isRestricted && (
                                                    <div className="mt-2.5 flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900/30 rounded-none text-[10px] text-orange-800 dark:text-orange-300 font-bold leading-relaxed animate-in fade-in slide-in-from-top-2 duration-500 transition-colors">
                                                        <AlertCircle className="shrink-0 mt-0.5" size={14} />
                                                        <span>Restricted to your department employees. Target head will manage remote assignment.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-none">Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none focus:border-orange-500 dark:focus:ring-8 dark:focus:ring-orange-500/10 dark:text-white outline-none transition-all appearance-none cursor-pointer font-bold"
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
                                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-none dark:text-white outline-none transition-all cursor-pointer font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 disabled:bg-slate-200 dark:disabled:bg-orange-900/50 text-white font-black py-4 rounded-full transition-all shadow-xl shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95"
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
