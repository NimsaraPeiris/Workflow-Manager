import React from 'react';
import { PlusCircle } from 'lucide-react';
import { PermissionGuard } from '../../auth/PermissionGuard';

interface CreateTaskButtonProps {
    onClick: () => void;
    className?: string;
}

export const CreateTaskButton: React.FC<CreateTaskButtonProps> = ({ onClick, className }) => {
    return (
        <PermissionGuard permission="task:create">
            <button
                onClick={onClick}
                className={className || "flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 transition-all shadow-md"}
            >
                <PlusCircle size={18} />
                <span className="font-bold text-sm">Create Task</span>
            </button>
        </PermissionGuard>
    );
};
