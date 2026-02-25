import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    as?: 'input' | 'textarea';
}

export const Input = ({ label, error, as = 'input', className = '', ...props }: InputProps) => {
    const Component = as;
    const baseStyles = "w-full px-4 py-2.5 bg-white border text-sm transition-all outline-none placeholder:text-slate-400";
    const stateStyles = error
        ? "border-rose-300 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500"
        : "border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500";

    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
            <Component
                className={`${baseStyles} ${stateStyles} ${className}`}
                {...props as any}
            />
            {error && <p className="text-[11px] text-rose-500 font-medium ml-1">{error}</p>}
        </div>
    );
};
