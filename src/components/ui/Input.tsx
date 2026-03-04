import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    as?: 'input' | 'textarea';
}

export const Input = ({ label, error, as = 'input', className = '', ...props }: InputProps) => {
    const Component = as;
    const baseStyles = "w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border text-sm dark:text-white transition-all outline-none rounded-none font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600";
    const stateStyles = error
        ? "border-rose-400 dark:border-rose-500/50 focus:ring-8 focus:ring-rose-500/10 focus:border-rose-500 dark:focus:border-rose-500"
        : "border-slate-100 dark:border-slate-700/50 focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 dark:focus:border-orange-500";

    return (
        <div className="space-y-2 w-full">
            {label && <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1 leading-none">{label}</label>}
            <Component
                className={`${baseStyles} ${stateStyles} ${className}`}
                {...props as any}
            />
            {error && (
                <div className="flex items-center gap-2 ml-1 mt-1.5">
                    <div className="w-1 h-1 rounded-none bg-rose-500" />
                    <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">{error}</p>
                </div>
            )}
        </div>
    );
};
