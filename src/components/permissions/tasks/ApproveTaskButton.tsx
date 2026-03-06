import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PermissionGuard } from '../../auth/PermissionGuard';

interface ApproveTaskButtonProps {
    onClick: () => void;
    loading?: boolean;
    className?: string;
}

export const ApproveTaskButton: React.FC<ApproveTaskButtonProps> = ({ onClick, loading, className }) => {
    return (
        <PermissionGuard permission="task:approve">
            <button
                disabled={loading}
                onClick={onClick}
                className={className || "flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-md transition-all shadow-md"}
            >
                <CheckCircle2 size={18} />
                <span className="font-bold text-sm">{loading ? 'Approving...' : 'Approve Task'}</span>
            </button>
        </PermissionGuard>
    );
};
