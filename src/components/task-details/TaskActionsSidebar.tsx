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
    cancellationRequester?: string;
}

export const TaskActionsSidebar = ({
    task,
    currentUser,
    isHead,
    updating,
    onUpdateStatus,
    onShowAssignModal,
    onShowDecisionModal,
    cancellationRequester
}: TaskActionsSidebarProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl p-8 space-y-8 rounded-2xl transition-all">
            <div className="group">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 font-black">Assignee</p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 flex items-center justify-center rounded-xl shadow-inner transition-colors"><UserIcon size={24} /></div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{(task as any).assignee?.full_name || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-tighter mt-0.5">Wait for supervisor</p>
                    </div>
                </div>
            </div>

            <div className="group">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 font-black">Department</p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 flex items-center justify-center rounded-xl shadow-inner transition-colors"><Tag size={20} /></div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{(task as any).department?.name || 'General'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-tighter mt-0.5">Target department</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                {isHead && currentUser.user_metadata?.department_id === task.department_id && task.status === 'CREATED' && (
                    <Button onClick={() => onUpdateStatus('ACCEPTED')} loading={updating} className="w-full h-12 text-sm font-bold shadow-lg shadow-orange-500/10 active:scale-95">Accept Task</Button>
                )}
                {isHead && currentUser.user_metadata?.department_id === task.department_id && (task.status === 'ACCEPTED' || task.status === 'CREATED' || task.status === 'ASSIGNED') && (
                    <Button onClick={() => onShowAssignModal()} variant="secondary" className="w-full h-12 text-sm font-bold dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 active:scale-95 transition-all">{task.assignee_id ? 'Reassign' : 'Assign'}</Button>
                )}
                {currentUser.id === task.assignee_id && (task.status === 'ASSIGNED' || task.status === 'REJECTED') && (
                    <Button onClick={() => onUpdateStatus('IN_PROGRESS')} loading={updating} className="w-full h-12 text-sm font-bold shadow-lg shadow-orange-500/10 active:scale-95">Start Working</Button>
                )}
                {currentUser.id === task.assignee_id && task.status === 'IN_PROGRESS' && (
                    <Button onClick={() => onUpdateStatus('SUBMITTED')} variant="secondary" loading={updating} className="w-full h-12 text-sm font-bold active:scale-95">Submit Task</Button>
                )}
                {(currentUser.id === task.creator_id || currentUser.user_metadata?.role === 'SUPER_ADMIN') && task.status === 'SUBMITTED' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => onShowDecisionModal('APPROVED')} variant="secondary" loading={updating} className="h-12 text-sm font-bold active:scale-95">Approve</Button>
                        <Button onClick={() => onShowDecisionModal('REJECTED')} variant="danger" loading={updating} className="h-12 text-sm font-bold active:scale-95">Reject</Button>
                    </div>
                )}
                {(currentUser.id === task.creator_id || currentUser.user_metadata?.role === 'SUPER_ADMIN') && task.status === 'CANCEL_REQUESTED' && (
                    <div className="space-y-3 p-5 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm transition-colors">
                        <div className="space-y-1 mb-2">
                            <p className="text-[10px] text-orange-800 dark:text-orange-400 font-black uppercase tracking-wider">Cancellation Requested</p>
                            {cancellationRequester && (
                                <p className="text-[10px] text-orange-600 dark:text-orange-500 font-bold italic">by {cancellationRequester}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => onUpdateStatus('CANCELLED')} variant="danger" loading={updating} className="h-10 text-xs font-bold active:scale-95">Confirm</Button>
                            <Button onClick={() => onUpdateStatus('ASSIGNED')} variant="outline" loading={updating} className="h-10 text-xs font-bold dark:border-slate-700 dark:text-slate-300 active:scale-95">Keep Task</Button>
                        </div>
                    </div>
                )}

                {(task.status === 'CREATED' || task.status === 'ACCEPTED' || task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') && (
                    <div className="pt-2">
                        {currentUser.id === task.creator_id || currentUser.user_metadata?.role === 'SUPER_ADMIN' ? (
                            <Button onClick={() => onUpdateStatus('CANCELLED')} variant="outline" className="w-full h-12 text-xs font-bold border-rose-100 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20 transition-all active:scale-95">Cancel Task</Button>
                        ) : isHead ? (
                            <Button onClick={() => onUpdateStatus('CANCEL_REQUESTED')} variant="outline" className="w-full h-12 text-xs font-bold border-orange-100 text-orange-600 hover:bg-orange-50 dark:border-orange-900/30 dark:hover:bg-orange-950/20 transition-all active:scale-95" loading={updating}>Request Cancellation</Button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};
