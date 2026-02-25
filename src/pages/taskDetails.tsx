import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    Tag,
    User as UserIcon,
    MessageSquare,
    Send,
    AlertCircle,
    Paperclip,
    FileText,
    Download,
    History
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Task, TaskStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

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
                    className="w-10 h-10 border-4 border-orange-500 border-t-transparent"
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
                    <div className="bg-white border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Badge variant={getBadgeVariant(task.status)}>{task.status}</Badge>
                            <Badge variant={task.priority === 'HIGH' ? 'rose' : task.priority === 'MEDIUM' ? 'amber' : 'emerald'}>
                                {task.priority} Priority
                            </Badge>
                        </div>

                        <h1 className="text-3xl font-medium text-slate-900 mb-4 leading-tight">{task.title}</h1>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description || 'No description provided.'}</p>

                        <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 gap-8">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-orange-50 text-orange-600"><Clock size={20} /></div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Due Date</p>
                                    <p className="text-slate-700 font-medium">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No deadline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600"><Tag size={20} /></div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Created At</p>
                                    <p className="text-slate-700 font-medium">{new Date(task.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <History className="text-orange-600" size={20} />
                                <h3 className="text-lg font-medium text-slate-900">Activity Timeline</h3>
                            </div>
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-100 transition-all uppercase tracking-widest">
                                <Paperclip size={14} />
                                {uploading ? 'Uploading...' : 'Attach File'}
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-100 before:via-slate-100 before:to-transparent">
                            {(task as any).activities?.length > 0 ? (
                                (task as any).activities.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((act: any) => (
                                    <div key={act.id} className="relative flex gap-6 group">
                                        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all shadow-sm ${act.activity_type === 'COMMENT' ? 'bg-white border-2 border-orange-500 text-orange-500' :
                                                act.activity_type === 'ATTACHMENT' ? 'bg-white border-2 border-blue-500 text-blue-500' :
                                                    'bg-white border-2 border-slate-300 text-slate-400'
                                            }`}>
                                            {act.activity_type === 'COMMENT' ? <MessageSquare size={16} /> :
                                                act.activity_type === 'ATTACHMENT' ? <Paperclip size={16} /> :
                                                    <History size={16} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <p className="text-sm font-bold text-slate-900 truncate">{act.profile?.full_name || 'System'}</p>
                                                <time className="text-[10px] text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap">
                                                    {new Date(act.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </time>
                                            </div>
                                            <div className={`p-4 rounded-lg border ${act.activity_type === 'COMMENT' ? 'bg-slate-50 border-slate-100 text-slate-700' :
                                                    act.activity_type === 'ATTACHMENT' ? 'bg-blue-50/30 border-blue-100 text-blue-900' :
                                                        'bg-white border-transparent text-slate-500 italic text-sm'
                                                }`}>
                                                {act.activity_type === 'ATTACHMENT' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white border border-blue-200 text-blue-500 rounded"><FileText size={20} /></div>
                                                        <div className="flex-1 truncate">
                                                            <p className="text-sm font-medium truncate">{act.file_name}</p>
                                                            <a href={act.file_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 uppercase tracking-tighter mt-1">
                                                                <Download size={10} /> Download File
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : <p className="text-sm leading-relaxed">{act.content}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-sm text-slate-400 italic">No activity recorded yet.</div>
                            )}
                        </div>

                        <div className="mt-12 relative">
                            <Input
                                placeholder="Write a comment..."
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                        const val = (e.target as HTMLInputElement).value;
                                        (e.target as HTMLInputElement).value = '';
                                        await addActivity({ activity_type: 'COMMENT', content: val });
                                        fetchTaskDetails();
                                    }
                                }}
                                className="pr-14 mt-1"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-0 text-orange-600 hover:scale-110 transition-transform">
                                <Send size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
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
                                <Button onClick={() => handleUpdateStatus('ACCEPTED')} loading={updating} className="w-full">Accept Task</Button>
                            )}
                            {isHead && currentUser.user_metadata?.department_id === task.department_id && (task.status === 'ACCEPTED' || task.status === 'CREATED' || task.status === 'ASSIGNED') && (
                                <Button onClick={() => setShowAssignModal(true)} variant="secondary" className="w-full">{task.assignee_id ? 'Reassign' : 'Assign'}</Button>
                            )}
                            {currentUser.id === task.assignee_id && (task.status === 'ASSIGNED' || task.status === 'REJECTED') && (
                                <Button onClick={() => handleUpdateStatus('IN_PROGRESS')} loading={updating} className="w-full">Start Working</Button>
                            )}
                            {currentUser.id === task.assignee_id && task.status === 'IN_PROGRESS' && (
                                <Button onClick={() => handleUpdateStatus('SUBMITTED')} loading={updating} className="w-full">Submit</Button>
                            )}
                            {currentUser.id === task.creator_id && task.status === 'SUBMITTED' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={() => handleUpdateStatus('APPROVED')} loading={updating}>Approve</Button>
                                    <Button onClick={() => handleUpdateStatus('REJECTED')} variant="danger" loading={updating}>Reject</Button>
                                </div>
                            )}
                            {currentUser.id === task.creator_id && (task.status === 'CREATED' || task.status === 'ACCEPTED' || task.status === 'ASSIGNED') && (
                                <Button onClick={() => handleUpdateStatus('CANCELLED')} variant="outline" className="w-full">Cancel</Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showAssignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white max-w-md w-full p-8 shadow-2xl">
                        <h3 className="text-xl font-medium mb-6">Assign Employee</h3>
                        <select
                            defaultValue=""
                            onChange={(e) => e.target.value && handleAssign(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none"
                        >
                            <option value="" disabled>Select employee...</option>
                            {users.filter(u => u.department_id === task.department_id).map(u => (
                                <option key={u.id} value={u.id}>{u.full_name} ({u.departments?.name})</option>
                            ))}
                        </select>
                        <Button onClick={() => setShowAssignModal(false)} variant="ghost" className="w-full mt-4">Cancel</Button>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
