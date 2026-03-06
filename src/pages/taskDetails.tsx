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
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', confirmText: '', variant: 'primary' as 'primary' | 'danger' | 'warning' });

    const canAssign = hasPermission(currentUser, 'task:assign');
    const canEdit = hasPermission(currentUser, 'task:edit');

    useEffect(() => {
        fetchTaskDetails();
        fetchDepartments();
        if (canAssign) fetchUsers();
    }, [taskId]);

    const fetchDepartments = async () => {
        const { data } = await supabase.from('departments').select('*').order('name');
        if (data) setDepartments(data);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, department_id, role, departments(name)');

        if (data) {
            setUsers(data.filter(u => u.role === 'EMPLOYEE'));
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
                    sub_tasks(*),
                    activities:task_activities(
                        *,
                        profile:profiles(full_name)
                    )
                `)
                .eq('id', taskId);

            // Access Control Enforcement
            const canViewGlobal = hasPermission(currentUser, 'task:view');
            const canViewDept = hasPermission(currentUser, 'task:view_dept');
            const deptId = currentUser?.user_metadata?.department_id;

            if (!canViewGlobal) {
                if (canViewDept && deptId) {
                    // Head/Dept viewing: can only see their own creations or tasks belonging to their department
                    query = query.or(`department_id.eq.${deptId},creator_id.eq.${currentUser.id}`);
                } else {
                    // Employee viewing: can only see tasks assigned to them OR tasks they created
                    query = query.or(`assignee_id.eq.${currentUser.id},creator_id.eq.${currentUser.id}`);
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
        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', taskId);

        if (!error) {
            await auditLogger.log({
                userId: currentUser.id,
                action: 'TASK_STATUS_UPDATE',
                entityType: 'Task',
                entityId: taskId,
                oldData: { status: oldStatus },
                newData: { status: newStatus }
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

        // 1. Update status
        const { error } = await supabase
            .from('tasks')
            .update({ status: status, updated_at: new Date().toISOString() })
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

    const handleAssign = async (userId: string | null, newDeptId?: string) => {
        setUpdating(true);
        const updates: any = {
            updated_at: new Date().toISOString()
        };

        if (newDeptId) {
            updates.department_id = newDeptId;
            updates.assignee_id = null; // Reset assignee when moving depts
            updates.status = 'CREATED'; // Reset status to CREATED for new dept head to accept
        } else if (userId) {
            updates.assignee_id = userId;
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
                    : `Task assigned to ${selectedUser?.full_name || 'employee'}`,
                field_name: newDeptId ? 'department_id' : 'assignee_id',
                new_value: newDeptId || userId || undefined
            });

            setShowAssignModal(false);
            fetchTaskDetails();
        }
        setUpdating(false);
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
                        onToggle={async (id: string, isCompleted: boolean) => {
                            const { error } = await supabase
                                .from('sub_tasks')
                                .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
                                .eq('id', id);
                            if (!error) fetchTaskDetails();
                        }}
                        onCreate={async (title: string, subDueDate?: string) => {
                            const { error } = await supabase
                                .from('sub_tasks')
                                .insert([{
                                    task_id: taskId,
                                    title,
                                    due_date: subDueDate || null
                                }]);
                            if (!error) fetchTaskDetails();
                        }}
                        onDelete={async (id: string) => {
                            const { error } = await supabase
                                .from('sub_tasks')
                                .delete()
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
                }}
                onConfirm={() => pendingStatus && executeStatusUpdate(pendingStatus)}
                title={confirmConfig.title}
                description={confirmConfig.description}
                confirmText={confirmConfig.confirmText}
                variant={confirmConfig.variant}
                loading={updating}
            />
        </motion.div>
    );
}
