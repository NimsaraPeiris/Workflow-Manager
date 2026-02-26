import { User as UserIcon, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Task, TaskStatus } from '../../types';

interface TaskActionsSidebarProps {
    task: Task;
    currentUser: any;
    isHead: boolean;
    updating: boolean;
    onUpdateStatus: (status: TaskStatus) => void;
    onShowAssignModal: () => void;
    onShowDecisionModal: (status: TaskStatus) => void;
}

export const TaskActionsSidebar = ({
    task,
    currentUser,
    isHead,
    updating,
    onUpdateStatus,
    onShowAssignModal,
    onShowDecisionModal
}: TaskActionsSidebarProps) => {
    return (
        <div className="bg-white border border-slate-100 shadow-sm p-6 space-y-6">
            <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4 font-bold">Assignee</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center"><UserIcon size={20} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">{(task as any).assignee?.full_name || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-500">Wait for supervisor</p>
                    </div>
                </div>
            </div>

            <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4 font-bold">Department</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 flex items-center justify-center"><Tag size={16} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">{(task as any).department?.name || 'General'}</p>
                        <p className="text-[10px] text-slate-500">Target department</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
                {isHead && currentUser.user_metadata?.department_id === task.department_id && task.status === 'CREATED' && (
                    <Button onClick={() => onUpdateStatus('ACCEPTED')} loading={updating} className="w-full">Accept Task</Button>
                )}
                {isHead && currentUser.user_metadata?.department_id === task.department_id && (task.status === 'ACCEPTED' || task.status === 'CREATED' || task.status === 'ASSIGNED') && (
                    <Button onClick={() => onShowAssignModal()} variant="secondary" className="w-full">{task.assignee_id ? 'Reassign' : 'Assign'}</Button>
                )}
                {currentUser.id === task.assignee_id && (task.status === 'ASSIGNED' || task.status === 'REJECTED') && (
                    <Button onClick={() => onUpdateStatus('IN_PROGRESS')} loading={updating} className="w-full">Start Working</Button>
                )}
                {currentUser.id === task.assignee_id && task.status === 'IN_PROGRESS' && (
                    <Button onClick={() => onUpdateStatus('SUBMITTED')} variant="secondary" loading={updating} className="w-full">Submit Task</Button>
                )}
                {currentUser.id === task.creator_id && task.status === 'SUBMITTED' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => onShowDecisionModal('APPROVED')} variant="secondary" loading={updating}>Approve</Button>
                        <Button onClick={() => onShowDecisionModal('REJECTED')} variant="danger" loading={updating}>Reject</Button>
                    </div>
                )}
                {currentUser.id === task.creator_id && (task.status === 'CREATED' || task.status === 'ACCEPTED' || task.status === 'ASSIGNED') && (
                    <Button onClick={() => onUpdateStatus('CANCELLED')} variant="outline" className="w-full">Cancel</Button>
                )}
            </div>
        </div>
    );
};
