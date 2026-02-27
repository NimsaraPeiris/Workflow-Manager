import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'orange' | 'blue' | 'green' | 'rose' | 'slate' | 'yellow';
    className?: string;
}

export const Badge = ({ children, variant = 'slate', className = '' }: BadgeProps) => {
    const variants = {
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        slate: 'bg-slate-50 text-slate-600 border-slate-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100'
    };

    return (
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
