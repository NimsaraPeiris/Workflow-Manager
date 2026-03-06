import React from 'react';
import { FolderPlus } from 'lucide-react';
import { PermissionGuard } from '../../auth/PermissionGuard';

interface CreateDepartmentButtonProps {
    onClick: () => void;
    className?: string;
}

export const CreateDepartmentButton: React.FC<CreateDepartmentButtonProps> = ({ onClick, className }) => {
    return (
        <PermissionGuard permission="dept:create">
            <button
                onClick={onClick}
                className={className || "flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 transition-all shadow-sm rounded-none"}
            >
                <FolderPlus size={18} className="text-blue-600" />
                <span className="font-bold text-sm">New Dept</span>
            </button>
        </PermissionGuard>
    );
};
