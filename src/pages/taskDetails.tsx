import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Task, TaskStatus } from '../types';
import { Button } from '../components/ui/Button';

// Refactored Components
import { TaskMainContent } from '../components/task-details/TaskMainContent';
import { TaskActivityTimeline } from '../components/task-details/TaskActivityTimeline';
import { TaskActionsSidebar } from '../components/task-details/TaskActionsSidebar';
import { AssignEmployeeModal } from '../components/task-details/AssignEmployeeModal';

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
    const [uploading, setUploading] = useState(false);

    const userRole = currentUser?.user_metadata?.role;
    const isHead = userRole === 'SUPERVISOR' || userRole === 'HEAD';

    useEffect(() => {
        fetchTaskDetails();
        if (isHead) fetchUsers();
    }, [taskId]);

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
            const { data, error: fetchError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    creator:profiles!tasks_creator_id_fkey(full_name),
                    assignee:profiles!tasks_assignee_id_fkey(full_name),
                    department:departments(name),
                    activities:task_activities(
                        *,
                        profile:profiles(full_name)
                    )
                `)
                .eq('id', taskId)
                .single();

            if (fetchError) throw fetchError;
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
        await supabase.from('task_activities').insert([{
            task_id: taskId,
            user_id: currentUser.id,
            ...payload
        }]);
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
        setUpdating(true);
        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', taskId);

        if (!error) {
            await addActivity({
                activity_type: 'STATUS_CHANGE',
                content: `Changed status from ${task?.status} to ${newStatus}`,
                field_name: 'status',
                old_value: task?.status,
                new_value: newStatus
            });
            fetchTaskDetails();
        }
        setUpdating(false);
    };

    const handleAssign = async (userId: string) => {
        setUpdating(true);
        const selectedUser = users.find(u => u.id === userId);
        const { error } = await supabase
            .from('tasks')
            .update({
                assignee_id: userId,
                status: 'ASSIGNED',
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (!error) {
            await addActivity({
                activity_type: 'EDIT',
                content: `Task assigned to ${selectedUser?.full_name || 'employee'}`,
                field_name: 'assignee_id',
                new_value: userId
            });
            setShowAssignModal(false);
            fetchTaskDetails();
        }
        setUpdating(false);
    };

    const getBadgeVariant = (status: TaskStatus) => {
        switch (status) {
            case 'CREATED': return 'orange';
            case 'IN_PROGRESS': return 'amber';
            case 'APPROVED': return 'emerald';
            case 'REJECTED': return 'rose';
            case 'CANCELLED': return 'slate';
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
            <div className="bg-white border border-slate-200 p-8 text-center">
                <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Task</h2>
                <p className="text-slate-500 mb-6">{typeof error === 'string' ? error : 'Task not found'}</p>
                <Button onClick={onBack}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4 mb-2">
                <button onClick={onBack} className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl text-slate-900 tracking-tight">Task Details</h2>
                    <p className="text-sm text-slate-500">Overview of the project progress and updates</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <TaskMainContent task={task} getBadgeVariant={getBadgeVariant} />

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
                        isHead={isHead}
                        updating={updating}
                        onUpdateStatus={handleUpdateStatus}
                        onShowAssignModal={() => setShowAssignModal(true)}
                    />
                </div>
            </div>

            <AssignEmployeeModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onAssign={handleAssign}
                users={users}
                taskDeptId={task.department_id}
            />
        </motion.div>
    );
}
