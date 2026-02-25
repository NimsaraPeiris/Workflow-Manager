import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'orange' | 'blue' | 'emerald' | 'rose' | 'slate' | 'amber';
    className?: string;
}

export const Badge = ({ children, variant = 'slate', className = '' }: BadgeProps) => {
    const variants = {
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        slate: 'bg-slate-50 text-slate-600 border-slate-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    };

    return (
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
