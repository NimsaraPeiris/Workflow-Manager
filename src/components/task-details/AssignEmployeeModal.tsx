import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface AssignEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userId: string) => void;
    users: any[];
    taskDeptId?: string;
}

export const AssignEmployeeModal = ({
    isOpen,
    onClose,
    onAssign,
    users,
    taskDeptId
}: AssignEmployeeModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white max-w-md w-full p-8 shadow-2xl">
                <h3 className="text-xl font-medium mb-6">Assign Employee</h3>
                <select
                    defaultValue=""
                    onChange={(e) => e.target.value && onAssign(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none hover:border-orange-200 focus:border-orange-500 transition-colors"
                >
                    <option value="" disabled>Select employee...</option>
                    {users.filter(u => u.department_id === taskDeptId).map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.departments?.name})</option>
                    ))}
                </select>
                <Button onClick={onClose} variant="ghost" className="w-full mt-4">Cancel</Button>
            </motion.div>
        </div>
    );
};
