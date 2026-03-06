import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PermissionGuard } from '../../auth/PermissionGuard';

interface ManageRolesButtonProps {
    onClick: () => void;
    className?: string;
}

export const ManageRolesButton: React.FC<ManageRolesButtonProps> = ({ onClick, className }) => {
    return (
        <PermissionGuard permission="user:edit"> {/* Assuming user:edit is required for roles */}
            <button
                onClick={onClick}
                className={className || "flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 transition-all shadow-sm rounded-none"}
            >
                <ShieldCheck size={18} className="text-orange-600" />
                <span className="font-bold text-sm">Manage Roles</span>
            </button>
        </PermissionGuard>
    );
};
