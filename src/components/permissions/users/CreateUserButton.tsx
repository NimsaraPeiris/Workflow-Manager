import React from 'react';
import { UserPlus } from 'lucide-react';
import { PermissionGuard } from '../../auth/PermissionGuard';

interface CreateUserButtonProps {
    onClick: () => void;
    className?: string;
}

export const CreateUserButton: React.FC<CreateUserButtonProps> = ({ onClick, className }) => {
    return (
        <PermissionGuard permission="user:create">
            <button
                onClick={onClick}
                className={className || "flex items-center gap-2 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-700 text-white px-5 py-2.5 transition-all shadow-lg shadow-slate-200 dark:shadow-none rounded-none"}
            >
                <UserPlus size={18} />
                <span className="font-bold text-sm">Add Staff</span>
            </button>
        </PermissionGuard>
    );
};
