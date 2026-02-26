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
    const accentColor = isReject ? 'rose' : 'emerald';

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
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white max-w-lg w-full shadow-2xl overflow-hidden rounded-2xl border border-slate-100"
                >
                    {/* Header Accent Bar */}
                    <div className={`h-1.5 w-full bg-${accentColor}-500`} />

                    <div className="p-8">
                        <div className="flex items-start gap-5 mb-6">
                            <div className={`p-3 bg-${accentColor}-50 rounded-xl`}>
                                {config.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {config.title}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                    {config.description}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="relative group">
                                <div className="absolute top-4 left-4 text-slate-400">
                                    <MessageSquare size={18} />
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => {
                                        setComment(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder={config.placeholder}
                                    className={`w-full h-40 pl-12 pr-4 py-4 bg-slate-50 border ${error ? 'border-rose-300' : 'border-slate-200'} rounded-xl outline-none group-hover:bg-white focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all resize-none text-slate-700 leading-relaxed`}
                                />
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[11px] text-rose-500 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5"
                                    >
                                        <AlertTriangle size={12} /> {error}
                                    </motion.p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <Info className="text-slate-400 shrink-0" size={18} />
                                <p className="text-[11px] text-slate-500 font-medium">
                                    This decision will be captured in the <strong>Audit Log</strong> and added to the <strong>Activity Timeline</strong> for future reference.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                    className="flex-1 h-12"
                                    disabled={loading}
                                >
                                    Go Back
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    variant={config.variant}
                                    className="flex-1 h-12 shadow-lg"
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
