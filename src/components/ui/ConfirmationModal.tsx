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
            bg: 'bg-orange-50 dark:bg-orange-500/10',
            text: 'text-orange-600 dark:text-orange-500',
            border: 'border-orange-100 dark:border-orange-900/30',
            button: 'primary' as const
        },
        danger: {
            bg: 'bg-rose-50 dark:bg-rose-500/10',
            text: 'text-rose-600 dark:text-rose-500',
            border: 'border-rose-100 dark:border-rose-900/30',
            button: 'danger' as const
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            text: 'text-amber-600 dark:text-amber-500',
            border: 'border-amber-100 dark:border-amber-900/30',
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
                        className="absolute inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md transition-colors"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-white dark:bg-slate-900 max-w-sm w-full shadow-2xl rounded-none border border-slate-100 dark:border-slate-800 p-8 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-4 rounded-none ${colors.bg} ${colors.text} transition-colors shadow-sm`}>
                                <AlertCircle size={28} />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-10 text-center sm:text-left">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-none transition-colors">
                                {title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold transition-colors">
                                {description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 h-12 rounded-none dark:border-slate-800 dark:text-slate-400 font-bold order-2 sm:order-1"
                                disabled={loading}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                onClick={onConfirm}
                                variant={colors.button}
                                className="flex-1 h-12 rounded-none shadow-xl font-bold order-1 sm:order-2"
                                loading={loading}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
