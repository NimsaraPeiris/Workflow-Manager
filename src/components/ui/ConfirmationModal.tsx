import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'warning';
    loading?: boolean;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    loading = false
}: ConfirmationModalProps) => {
    const variantColors = {
        primary: {
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            border: 'border-orange-100',
            button: 'primary' as const
        },
        danger: {
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            border: 'border-rose-100',
            button: 'danger' as const
        },
        warning: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            button: 'secondary' as const
        }
    };

    const colors = variantColors[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                        className="relative bg-white max-w-md w-full shadow-2xl rounded-2xl border border-slate-100 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
                                    <AlertCircle size={24} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    variant={colors.button}
                                    className="flex-1"
                                    loading={loading}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
