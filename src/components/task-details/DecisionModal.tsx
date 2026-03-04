import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    MessageSquare,
    AlertTriangle,
    Info
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { TaskStatus } from '../../types';

interface DecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (status: TaskStatus, comment: string) => void;
    status: TaskStatus | null;
    loading: boolean;
}

export const DecisionModal = ({
    isOpen,
    onClose,
    onConfirm,
    status,
    loading
}: DecisionModalProps) => {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setComment('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !status) return null;

    const isReject = status === 'REJECTED';

    const config = {
        title: isReject ? 'Reject Submission' : 'Approve Submission',
        icon: isReject ? <XCircle className="text-rose-500" size={28} /> : <CheckCircle2 className="text-emerald-500" size={28} />,
        description: isReject
            ? 'Providing clear feedback helps the assignee understand exactly what needs to be changed for a successful rework loop.'
            : 'Formally approve this task. You can add optional feedback or closing notes for the record.',
        placeholder: isReject ? 'Describe the changes required...' : 'Add feedback (optional)...',
        confirmText: isReject ? 'Confirm Rejection' : 'Confirm Approval',
        variant: isReject ? 'danger' as const : 'secondary' as const
    };

    const handleConfirm = () => {
        if (isReject && !comment.trim()) {
            setError('A comment is required for rejection');
            return;
        }
        onConfirm(status, comment.trim());
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md transition-colors"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white dark:bg-slate-900 max-w-lg w-full shadow-2xl overflow-hidden rounded-none border border-slate-100 dark:border-slate-800 transition-colors"
                >
                    {/* Header Accent Bar */}
                    <div className={`h-2 w-full ${isReject ? 'bg-rose-500' : 'bg-emerald-500'} dark:opacity-80`} />

                    <div className="p-10">
                        <div className="flex items-start gap-6 mb-8">
                            <div className={`p-4 ${isReject ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'} rounded-none transition-colors`}>
                                {config.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                                    {config.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                                    {config.description}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <div className="absolute top-5 left-5 text-slate-400 dark:text-slate-500">
                                    <MessageSquare size={20} />
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => {
                                        setComment(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder={config.placeholder}
                                    className={`w-full h-44 pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/40 border-2 ${error ? 'border-rose-400 dark:border-rose-500/50' : 'border-slate-100 dark:border-slate-700/50'} rounded-none outline-none group-hover:bg-white dark:group-hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 dark:focus:border-orange-500 dark:text-white dark:placeholder:text-slate-600 transition-all resize-none font-bold text-slate-700 leading-relaxed`}
                                />
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[10px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2"
                                    >
                                        <AlertTriangle size={14} /> {error}
                                    </motion.p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-none transition-colors">
                                <Info className="text-slate-400 dark:text-slate-600 shrink-0" size={20} />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
                                    This decision will be captured in the <strong className="text-slate-700 dark:text-slate-200">Audit Log</strong> and added to the <strong className="text-slate-700 dark:text-slate-200">Activity Timeline</strong> for future reference.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 h-14 rounded-none text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-black uppercase tracking-widest text-[10px]"
                                    disabled={loading}
                                >
                                    Go Back
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    variant={config.variant}
                                    className="flex-1 h-14 rounded-none shadow-xl font-black uppercase tracking-widest text-[10px]"
                                    loading={loading}
                                >
                                    {config.confirmText}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
