import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { hasPermission } from '../lib/permissions';
import type { Task, TaskStatus } from '../types';
import { Button } from '../components/ui/Button';
import { auditLogger } from '../lib/auditLogger';

// Refactored Components
import { TaskMainContent } from '../components/task-details/TaskMainContent';
import { TaskActivityTimeline } from '../components/task-details/TaskActivityTimeline';
import { TaskActionsSidebar } from '../components/task-details/TaskActionsSidebar';
import { AssignEmployeeModal } from '../components/task-details/AssignEmployeeModal';
import { DecisionModal } from '../components/task-details/DecisionModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { SubTaskSection } from '../components/task-details/SubTaskSection';

interface TaskDetailsPageProps {
    taskId: string;
    onBack: () => void;
    currentUser: any;
}

export default function TaskDetailsPage({ taskId, onBack, currentUser }: TaskDetailsPageProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', confirmText: '', variant: 'primary' as 'primary' | 'danger' | 'warning' });
    const [pendingAssignment, setPendingAssignment] = useState<{ userId: string | null; teamId?: string | null; newDeptId?: string } | null>(null);
    const [pendingSubTaskToggle, setPendingSubTaskToggle] = useState<{ id: string; isCompleted: boolean } | null>(null);

    const canAssign = hasPermission(currentUser, 'task:assign');
    const canEdit = hasPermission(currentUser, 'task:edit');

    useEffect(() => {
        fetchTaskDetails();
        fetchDepartments();
        fetchTeams();
        if (canAssign) fetchUsers();
    }, [taskId]);

    const fetchDepartments = async () => {
        const { data } = await supabase.from('departments').select('*').order('name');
        if (data) setDepartments(data);
    };

    const fetchTeams = async () => {
        const { data } = await supabase.from('teams').select('*').order('name');
        if (data) setTeams(data);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, department_id, team_id, role, departments(name), teams(name)');

        if (data) {
            setUsers(data); // Include everyone, filtering will happen in the modal
        }
    };

    const fetchTaskDetails = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('tasks')
                .select(`
                    *,
                    creator:profiles!tasks_creator_id_fkey(full_name),
                    assignee:profiles!tasks_assignee_id_fkey(full_name),
                    department:departments(name),
                    team:teams(name),
                    sub_tasks(*, assignee:profiles(full_name)),
                    activities:task_activities(
                        *,
                        profile:profiles(full_name)
                    )
                `)
                .eq('id', taskId);

            // Access Control Enforcement
            const canViewGlobal = hasPermission(currentUser, 'task:view');
            const canViewDept = hasPermission(currentUser, 'task:view_dept');
            const deptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;
            const teamId = currentUser?.team_id || currentUser?.user_metadata?.team_id;

            if (!canViewGlobal) {
                if (canViewDept && deptId) {
                    // Head/Dept viewing: can only see their own creations, tasks belonging to their department, or tasks for their team
                    let filter = `department_id.eq.${deptId},creator_id.eq.${currentUser.id}`;
                    if (teamId) filter += `,team_id.eq.${teamId}`;
                    query = query.or(filter);
                } else {
                    // Employee viewing: can only see tasks assigned to them, tasks they created, tasks for their team, or tasks in their department
                    let filter = `assignee_id.eq.${currentUser.id},creator_id.eq.${currentUser.id}`;
                    if (deptId) filter += `,department_id.eq.${deptId}`;
                    if (teamId) filter += `,team_id.eq.${teamId}`;
                    query = query.or(filter);
                }
            }

            const { data, error: fetchError } = await (query as any).single();

            if (fetchError) throw new Error("Unauthorized Access: You do not have permission to view this task or it does not exist.");
            setTask(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addActivity = async (payload: {
        activity_type: 'COMMENT' | 'STATUS_CHANGE' | 'EDIT' | 'ATTACHMENT';
        content?: string;
        field_name?: string;
        old_value?: string;
        new_value?: string;
        file_url?: string;
        file_name?: string;
    }) => {
        const { error } = await supabase.from('task_activities').insert([{
            task_id: taskId,
            user_id: currentUser.id,
            ...payload
        }]);

        if (!error && (payload.activity_type === 'COMMENT' || payload.activity_type === 'ATTACHMENT')) {
            // Ensure major events are captured in the central audit log
            await auditLogger.log({
                userId: currentUser.id,
                action: 'TASK_UPDATE',
                entityType: 'Task',
                entityId: taskId,
                newData: {
                    type: payload.activity_type,
                    summary: payload.content || payload.file_name
                }
            });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${taskId}/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('task-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('task-files')
                .getPublicUrl(filePath);

            await addActivity({
                activity_type: 'ATTACHMENT',
                content: `Uploaded ${file.name}`,
                file_url: publicUrl,
                file_name: file.name
            });

            fetchTaskDetails();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: TaskStatus) => {
        const confirmContent: Record<string, { title: string; description: string; confirmText: string; variant: 'primary' | 'danger' | 'warning' }> = {
            'ACCEPTED': {
                title: 'Accept Task',
                description: 'Are you sure you want to accept this task? This signals that your department is now responsible for its completion.',
                confirmText: 'Yes, Accept Task',
                variant: 'primary'
            },
            'IN_PROGRESS': {
                title: 'Start Working',
                description: 'Ready to begin? This will notify stakeholders that work has started on this task.',
                confirmText: 'Start Now',
                variant: 'primary'
            },
            'SUBMITTED': {
                title: 'Submit Task',
                description: 'Are you sure you want to submit this task for approval? Ensure all work is complete.',
                confirmText: 'Submit for Review',
                variant: 'warning'
            },
            'CANCELLED': {
                title: 'Cancel Task',
                description: 'Are you sure you want to cancel this task? This action is permanent and will stop all work.',
                confirmText: 'Yes, Cancel Task',
                variant: 'danger'
            },
            'CANCEL_REQUESTED': {
                title: 'Request Cancellation',
                description: 'This task was created by someone else. Requesting cancellation will send a notification to the creator for final approval.',
                confirmText: 'Send Request',
                variant: 'warning'
            }
        };

        if (confirmContent[newStatus]) {
            setPendingStatus(newStatus);
            setConfirmConfig(confirmContent[newStatus]);
            setShowConfirmModal(true);
            return;
        }

        await executeStatusUpdate(newStatus);
    };

    const executeStatusUpdate = async (newStatus: TaskStatus) => {
        setUpdating(true);
        const oldStatus = task?.status;
        const updates: any = {
            status: newStatus,
            updated_at: new Date().toISOString()
        };

        // TIME TRACKING LOGIC
        const now = new Date();

        // If resuming or starting work, set the start timestamp
        if (newStatus === 'IN_PROGRESS') {
            updates.timer_started_at = now.toISOString();
        }

        // If pausing or finishing work (moving away from IN_PROGRESS)
        if (oldStatus === 'IN_PROGRESS' && task?.timer_started_at) {
            const startTime = new Date(task.timer_started_at);
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            updates.total_time_spent = (task.total_time_spent || 0) + elapsedSeconds;
            updates.timer_started_at = null; // Clear timer when not in progress
        }

        const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId);

        if (!error) {
            await auditLogger.log({
                userId: currentUser.id,
                action: 'TASK_STATUS_UPDATE',
                entityType: 'Task',
                entityId: taskId,
                oldData: { status: oldStatus },
                newData: { status: newStatus, ...updates }
            });
            await addActivity({
                activity_type: 'STATUS_CHANGE',
                content: `Changed status from ${oldStatus} to ${newStatus}`,
                field_name: 'status',
                old_value: oldStatus,
                new_value: newStatus
            });
            fetchTaskDetails();
            setShowConfirmModal(false);
            setPendingStatus(null);
        } else {
            alert(`Failed to update status: ${error.message}`);
        }
        setUpdating(false);
    };

    const handleDecision = async (status: TaskStatus, comment: string) => {
        setUpdating(true);
        const oldStatus = task?.status;
        const updates: any = {
            status: status,
            updated_at: new Date().toISOString()
        };

        // If finishing work through decision
        if (oldStatus === 'IN_PROGRESS' && task?.timer_started_at) {
            const now = new Date();
            const startTime = new Date(task.timer_started_at);
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            updates.total_time_spent = (task.total_time_spent || 0) + elapsedSeconds;
            updates.timer_started_at = null;
        }

        // 1. Update status
        const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId);

        if (!error) {
            // 2. Record decision comment
            await addActivity({
                activity_type: 'COMMENT',
                content: `${status.toUpperCase()} FEEDBACK: ${comment}`
            });

            // 3. Central Audit Log
            await auditLogger.log({
                userId: currentUser.id,
                action: 'TASK_STATUS_UPDATE',
                entityType: 'Task',
                entityId: taskId,
                oldData: { status: oldStatus },
                newData: { status: status, reason: comment }
            });

            // 4. Status change marker
            await addActivity({
                activity_type: 'STATUS_CHANGE',
                content: `${status} by requester`,
                field_name: 'status',
                old_value: oldStatus,
                new_value: status
            });

            setShowDecisionModal(false);
            setPendingStatus(null);
            fetchTaskDetails();
        }
        setUpdating(false);
    };

    const handleAssign = (userId: string | null, teamId?: string | null, newDeptId?: string) => {
        const selectedUser = users.find(u => u.id === userId);
        const selectedTeam = teams.find(t => t.id === teamId);
        const selectedDept = departments.find(d => d.id === newDeptId);

        setPendingAssignment({ userId, teamId, newDeptId });
        setConfirmConfig({
            title: newDeptId ? 'Transfer Task' : teamId ? 'Assign Team' : 'Assign Member',
            description: newDeptId
                ? `Are you sure you want to transfer this task to ${selectedDept?.name}? It will be moved to their queue for acceptance.`
                : teamId
                    ? `Assign this task to the entire ${selectedTeam?.name} squad?`
                    : `Assign this task to ${selectedUser?.full_name || 'this team member'}?`,
            confirmText: newDeptId ? 'Transfer Now' : 'Assign Now',
            variant: 'primary'
        });
        setPendingStatus(null);
        setShowConfirmModal(true);
    };

    const executeAssignment = async (userId: string | null, teamId?: string | null, newDeptId?: string) => {
        setUpdating(true);
        const updates: any = {
            updated_at: new Date().toISOString()
        };

        if (newDeptId) {
            // Find the head of the target department
            const { data: headProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('department_id', newDeptId)
                .in('role', ['DEP_HEAD', 'HEAD'])
                .limit(1)
                .maybeSingle();

            updates.department_id = newDeptId;
            updates.team_id = null;
            updates.assignee_id = headProfile?.id || null;
            updates.status = 'ASSIGNED';
        } else if (teamId) {
            updates.team_id = teamId;
            updates.assignee_id = null; // Unassign individual when assigning team
            updates.status = 'ASSIGNED';
        } else if (userId) {
            updates.assignee_id = userId;
            updates.team_id = users.find(u => u.id === userId)?.team_id || null;
            updates.status = 'ASSIGNED';
        }

        const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId);

        if (!error) {
            const selectedUser = users.find(u => u.id === userId);
            const selectedDept = departments.find(d => d.id === newDeptId);

            await auditLogger.log({
                userId: currentUser.id,
                action: newDeptId ? 'TASK_TRANSFER' : 'TASK_ASSIGN',
                entityType: 'Task',
                entityId: taskId,
                newData: updates
            });

            await addActivity({
                activity_type: 'EDIT',
                content: newDeptId
                    ? `Task transferred to department: ${selectedDept?.name || 'Unknown'}`
                    : teamId
                        ? `Task assigned to team: ${teams.find(t => t.id === teamId)?.name || 'Unknown'}`
                        : `Task assigned to ${selectedUser?.full_name || 'employee'}`,
                field_name: newDeptId ? 'department_id' : teamId ? 'team_id' : 'assignee_id',
                new_value: newDeptId || teamId || userId || undefined
            });

            setShowConfirmModal(false);
            setPendingAssignment(null);
            setShowAssignModal(false);
            fetchTaskDetails();
        } else {
            alert(`Failed to assign task: ${error.message}`);
        }
        setUpdating(false);
    };
    const executeSubTaskToggle = async (id: string, isCompleted: boolean) => {
        if (!task) return;
        setUpdating(true);
        const sub = task.sub_tasks?.find(s => s.id === id);
        const updates: any = { is_completed: isCompleted, updated_at: new Date().toISOString() };

        // Stop subtask timer if completing it
        if (isCompleted && sub?.timer_started_at) {
            const now = new Date();
            const startTime = new Date(sub.timer_started_at);
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            updates.total_time_spent = (sub.total_time_spent || 0) + elapsedSeconds;
            updates.timer_started_at = null;
        }

        const { error } = await supabase
            .from('sub_tasks')
            .update(updates)
            .eq('id', id);

        if (!error) {
            await addActivity({
                activity_type: 'STATUS_CHANGE',
                content: `${isCompleted ? 'Finished' : 'Reopened'} sub-task: ${sub?.title}`,
                field_name: 'sub_task_completion',
                new_value: isCompleted ? 'COMPLETED' : 'INCOMPLETE'
            });
            setShowConfirmModal(false);
            setPendingSubTaskToggle(null);
            fetchTaskDetails();
        } else {
            alert(`Failed to update sub-task: ${error.message}`);
        }
        setUpdating(false);
    };

    const handleClaim = async () => {
        if (!task || !currentUser) return;
        setConfirmConfig({
            title: 'Claim Task',
            description: `Are you sure you want to take ownership of this task? You will be set as the primary assignee.`,
            confirmText: 'Claim Now',
            variant: 'primary'
        });
        setPendingAssignment({ userId: currentUser.id, teamId: task.team_id, newDeptId: undefined });
        setShowConfirmModal(true);
    };

    const handleDateUpdate = async (newDate: string) => {
        if (!task) return;
        setUpdating(true);
        const oldDate = task.due_date;

        const { error } = await supabase
            .from('tasks')
            .update({ due_date: newDate, updated_at: new Date().toISOString() })
            .eq('id', taskId);

        if (!error) {
            await auditLogger.log({
                userId: currentUser.id,
                action: 'TASK_UPDATE',
                entityType: 'Task',
                entityId: taskId,
                oldData: { due_date: oldDate },
                newData: { due_date: newDate }
            });

            await addActivity({
                activity_type: 'EDIT',
                content: `Due date changed from ${oldDate ? new Date(oldDate).toLocaleDateString() : 'None'} to ${new Date(newDate).toLocaleDateString()}`,
                field_name: 'due_date',
                old_value: oldDate,
                new_value: newDate
            });

            fetchTaskDetails();
        }
        setUpdating(false);
    };

    const getBadgeVariant = (status: TaskStatus) => {
        switch (status) {
            case 'CREATED': return 'orange';
            case 'IN_PROGRESS': return 'yellow';
            case 'APPROVED': return 'green';
            case 'REJECTED': return 'rose';
            case 'CANCELLED': return 'slate';
            case 'CANCEL_REQUESTED': return 'rose';
            default: return 'orange';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
                />
                <p className="text-slate-500 mt-4">Loading task details...</p>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center rounded-none shadow-xl transition-colors">
                <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Task</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">{typeof error === 'string' ? error : 'Task not found'}</p>
                <div className="flex justify-center">
                    <Button onClick={onBack} variant="secondary">Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4 mb-2 group">
                <button onClick={onBack} className="p-2.5 rounded-none hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all text-slate-500 dark:text-slate-400">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Task Details</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Overview of the project progress and updates</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <TaskMainContent
                        task={task}
                        getBadgeVariant={getBadgeVariant}
                        canEdit={
                            canEdit ||
                            currentUser.id === task.creator_id ||
                            (hasPermission(currentUser, 'task:edit') &&
                                !!task.due_date &&
                                new Date(task.due_date) < new Date() &&
                                !['APPROVED', 'CANCELLED'].includes(task.status) &&
                                task.department_id === currentUser.user_metadata?.department_id)
                        }
                        onDateUpdate={handleDateUpdate}
                    />

                    <SubTaskSection
                        subTasks={task.sub_tasks || []}
                        currentUserId={currentUser.id}
                        teamMembers={users.filter(u => {
                            if (task.team_id) return u.team_id === task.team_id;
                            return u.department_id === task.department_id;
                        })}
                        canCreate={
                            hasPermission(currentUser, 'task:view_dept') ||
                            currentUser.id === task.creator_id ||
                            currentUser.role === 'SUPER_ADMIN'
                        }
                        onToggle={async (id: string, isCompleted: boolean) => {
                            const sub = task.sub_tasks?.find(s => s.id === id);
                            setConfirmConfig({
                                title: isCompleted ? 'Finish Sub-task' : 'Reopen Sub-task',
                                description: isCompleted
                                    ? `Are you sure you want to mark "${sub?.title}" as finished?`
                                    : `Are you sure you want to reopen "${sub?.title}"?`,
                                confirmText: isCompleted ? 'Finish' : 'Reopen',
                                variant: 'primary'
                            });
                            setPendingSubTaskToggle({ id, isCompleted });
                            setShowConfirmModal(true);
                        }}
                        onCreate={async (title: string, subDueDate?: string, assigneeId?: string) => {
                            const { error } = await supabase
                                .from('sub_tasks')
                                .insert([{
                                    task_id: taskId,
                                    title,
                                    due_date: subDueDate || null,
                                    total_time_spent: 0,
                                    assignee_id: assigneeId || null
                                }]);

                            if (!error) {
                                await addActivity({
                                    activity_type: 'EDIT',
                                    content: `Created new sub-task: ${title}`,
                                    field_name: 'sub_task'
                                });
                                fetchTaskDetails();
                            }
                        }}
                        onDelete={async (id: string) => {
                            const sub = task.sub_tasks?.find(s => s.id === id);
                            const { error } = await supabase
                                .from('sub_tasks')
                                .delete()
                                .eq('id', id);

                            if (!error) {
                                await addActivity({
                                    activity_type: 'EDIT',
                                    content: `Deleted sub-task: ${sub?.title}`,
                                    field_name: 'sub_task'
                                });
                                fetchTaskDetails();
                            }
                        }}
                        onTimerToggle={async (id: string, isStarting: boolean) => {
                            const sub = task.sub_tasks?.find(s => s.id === id);
                            if (!sub) return;

                            const now = new Date();
                            const updates: any = { updated_at: now.toISOString() };

                            if (isStarting) {
                                updates.timer_started_at = now.toISOString();
                                // Also ensure the main task is IN_PROGRESS if we start a subtask?
                                if (task.status !== 'IN_PROGRESS') {
                                    await executeStatusUpdate('IN_PROGRESS');
                                }
                                await addActivity({
                                    activity_type: 'STATUS_CHANGE',
                                    content: `Started working on sub-task: ${sub.title}`,
                                    field_name: 'sub_task_timer',
                                    new_value: 'STARTED'
                                });
                            } else if (sub.timer_started_at) {
                                const startTime = new Date(sub.timer_started_at);
                                const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                                updates.total_time_spent = (sub.total_time_spent || 0) + elapsedSeconds;
                                updates.timer_started_at = null;
                                await addActivity({
                                    activity_type: 'STATUS_CHANGE',
                                    content: `Paused working on sub-task: ${sub.title}`,
                                    field_name: 'sub_task_timer',
                                    new_value: 'STOPPED'
                                });
                            }

                            const { error } = await supabase
                                .from('sub_tasks')
                                .update(updates)
                                .eq('id', id);
                            if (!error) fetchTaskDetails();
                        }}
                    />

                    <TaskActivityTimeline
                        activities={(task as any).activities}
                        uploading={uploading}
                        onFileUpload={handleFileUpload}
                        onAddComment={async (content) => {
                            await addActivity({ activity_type: 'COMMENT', content });
                            fetchTaskDetails();
                        }}
                    />
                </div>

                <div className="space-y-6">
                    <TaskActionsSidebar
                        task={task}
                        currentUser={currentUser}
                        updating={updating}
                        onUpdateStatus={handleUpdateStatus}
                        onShowAssignModal={() => setShowAssignModal(true)}
                        onShowDecisionModal={(status) => {
                            setPendingStatus(status);
                            setShowDecisionModal(true);
                        }}
                        onClaim={handleClaim}
                        cancellationRequester={(task as any).activities?.find((a: any) => a.new_value === 'CANCEL_REQUESTED')?.profile?.full_name}
                    />
                </div>
            </div>

            <AssignEmployeeModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onAssign={handleAssign}
                users={users}
                departments={departments}
                teams={teams}
                taskDeptId={task.department_id}
                currentUser={currentUser}
            />

            <DecisionModal
                isOpen={showDecisionModal}
                onClose={() => {
                    setShowDecisionModal(false);
                    setPendingStatus(null);
                }}
                onConfirm={handleDecision}
                status={pendingStatus}
                loading={updating}
            />

            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setPendingStatus(null);
                    setPendingAssignment(null);
                    setPendingSubTaskToggle(null);
                }}
                onConfirm={() => {
                    if (pendingStatus) {
                        executeStatusUpdate(pendingStatus);
                    } else if (pendingAssignment) {
                        executeAssignment(pendingAssignment.userId, pendingAssignment.teamId, pendingAssignment.newDeptId);
                    } else if (pendingSubTaskToggle) {
                        executeSubTaskToggle(pendingSubTaskToggle.id, pendingSubTaskToggle.isCompleted);
                    }
                }}
                title={confirmConfig.title}
                description={confirmConfig.description}
                confirmText={confirmConfig.confirmText}
                variant={confirmConfig.variant}
                loading={updating}
            />
        </motion.div>
    );
}
