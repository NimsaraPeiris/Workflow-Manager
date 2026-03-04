import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'orange' | 'blue' | 'green' | 'rose' | 'slate' | 'yellow';
    className?: string;
}

export const Badge = ({ children, variant = 'slate', className = '' }: BadgeProps) => {
    const variants = {
        orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-100 dark:border-orange-900/30',
        blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-100 dark:border-blue-900/30',
        green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-100 dark:border-green-900/30',
        rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-100 dark:border-rose-900/30',
        slate: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700',
        yellow: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-100 dark:border-yellow-900/30'
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
