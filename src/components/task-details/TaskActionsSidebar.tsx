import { User as UserIcon, Tag, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { PermissionGuard } from '../auth/PermissionGuard';
import type { Task, TaskStatus } from '../../types';

interface TaskActionsSidebarProps {
    task: Task;
    currentUser: any;
    updating: boolean;
    onUpdateStatus: (status: TaskStatus) => void;
    onShowAssignModal: () => void;
    onShowDecisionModal: (status: TaskStatus) => void;
    cancellationRequester?: string;
}

export const TaskActionsSidebar = ({
    task,
    currentUser,
    updating,
    onUpdateStatus,
    onShowAssignModal,
    onShowDecisionModal,
    cancellationRequester
}: TaskActionsSidebarProps) => {
    const isAdmin = currentUser?.role === 'SUPER_ADMIN' || (currentUser as any)?.user_metadata?.role === 'SUPER_ADMIN';
    const userDeptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl p-8 space-y-8 rounded-none transition-all">
            <div className="group">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 font-black">
                    {task.assignee_id ? 'Assignee' : task.team_id ? 'Assigned Team' : 'Assignment'}
                </p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-none transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 flex items-center justify-center rounded-none shadow-inner transition-colors">
                        {task.assignee_id ? <UserIcon size={24} /> : task.team_id ? <Users size={24} /> : <UserIcon size={24} className="opacity-50" />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {task.assignee?.full_name || task.team?.name || 'Unassigned'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-tighter mt-0.5">
                            {task.assignee_id ? 'Individual Member' : task.team_id ? 'Full Squad Active' : 'Wait for supervisor'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="group">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 font-black">Department</p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-none transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 flex items-center justify-center rounded-none shadow-inner transition-colors"><Tag size={20} /></div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{(task as any).department?.name || 'General'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-tighter mt-0.5">Target department</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                {/* Accept Task */}
                <PermissionGuard permission="task:approve">
                    {(isAdmin || userDeptId === task.department_id) && task.status === 'CREATED' && (
                        <Button onClick={() => onUpdateStatus('ACCEPTED')} loading={updating} className="w-full h-12 text-sm font-bold shadow-lg shadow-orange-500/10 active:scale-95">Accept Task</Button>
                    )}
                </PermissionGuard>

                {/* Assign / Reassign */}
                <PermissionGuard permission="task:assign">
                    {(isAdmin || userDeptId === task.department_id) && (task.status === 'ACCEPTED' || task.status === 'CREATED' || task.status === 'ASSIGNED') && (
                        <Button onClick={() => onShowAssignModal()} variant="primary" className="w-full h-12 text-sm font-bold dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 active:scale-95 transition-all">{task.assignee_id || task.team_id ? 'Reassign' : 'Assign'}</Button>
                    )}
                </PermissionGuard>


                {/* Employee Self-Actions: assignee OR team members */}
                {(() => {
                    const userTeamId = currentUser?.team_id || currentUser?.user_metadata?.team_id;
                    const isAssignee = currentUser.id === task.assignee_id;
                    const isTeamMember = !!(task.team_id && userTeamId && task.team_id === userTeamId);
                    const canWork = isAssignee || isTeamMember;

                    return canWork && (
                        <>
                            {(task.status === 'ASSIGNED' || task.status === 'REJECTED' || task.status === 'PAUSED') && (
                                <Button onClick={() => onUpdateStatus('IN_PROGRESS')} loading={updating} className="w-full h-12 text-sm font-bold shadow-lg shadow-orange-500/10 active:scale-95">{task.status === 'PAUSED' ? 'Resume Working' : 'Start Working'}</Button>
                            )}
                            {task.status === 'IN_PROGRESS' && (
                                <div className="flex flex-col gap-3">
                                    <Button onClick={() => onUpdateStatus('SUBMITTED')} loading={updating} className="w-full h-12 text-sm font-bold active:scale-95">Submit</Button>
                                    <Button onClick={() => onUpdateStatus('PAUSED')} variant="outline" loading={updating} className="w-full h-12 text-sm font-bold border-orange-100 text-orange-600 hover:bg-orange-50 dark:border-orange-900/40 dark:text-orange-400 active:scale-95 transition-all">Do Later</Button>
                                </div>
                            )}
                        </>
                    );
                })()}

                {/* Approve / Reject */}
                {task.status === 'SUBMITTED' && (
                    <PermissionGuard permission="task:approve">
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => onShowDecisionModal('APPROVED')} variant="secondary" loading={updating} className="h-12 text-sm font-bold active:scale-95">Approve</Button>
                            <Button onClick={() => onShowDecisionModal('REJECTED')} variant="danger" loading={updating} className="h-12 text-sm font-bold active:scale-95">Reject</Button>
                        </div>
                    </PermissionGuard>
                )}

                {/* Cancellation Requests */}
                {task.status === 'CANCEL_REQUESTED' && (
                    <PermissionGuard permission="task:approve">
                        <div className="space-y-3 p-5 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-none animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm transition-colors">
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
                    </PermissionGuard>
                )}

                {/* General Cancel / Request Cancellation */}
                {(task.status === 'CREATED' || task.status === 'ACCEPTED' || task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') && (
                    <div className="pt-2">
                        {/* Creator or Super Admin can cancel directly */}
                        <PermissionGuard permission="task:delete">
                            <Button onClick={() => onUpdateStatus('CANCELLED')} variant="outline" className="w-full h-12 text-xs font-bold border-rose-100 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20 transition-all active:scale-95">Cancel Task</Button>
                        </PermissionGuard>

                        {/* If not can delete, maybe can request cancellation (Head level) */}
                        <div className="mt-2">
                            <PermissionGuard permission="task:view_dept">
                                {currentUser.id !== task.creator_id && (
                                    <Button onClick={() => onUpdateStatus('CANCEL_REQUESTED')} variant="outline" className="w-full h-12 text-xs font-bold border-orange-100 text-orange-600 hover:bg-orange-50 dark:border-orange-900/30 dark:hover:bg-orange-950/20 transition-all active:scale-95" loading={updating}>Request Cancellation</Button>
                                )}
                            </PermissionGuard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
