import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    leftIcon?: React.ReactNode;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100',
        secondary: 'bg-slate-900 text-white hover:bg-slate-800',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100',
        outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-50'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'p-2'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : leftIcon ? (
                <span className="mr-2">{leftIcon}</span>
            ) : null}
            {children}
        </button>
    );
};
