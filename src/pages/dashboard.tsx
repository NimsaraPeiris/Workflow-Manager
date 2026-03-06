import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { hasPermission } from '../lib/permissions';
import type { Task } from '../types';
import { TaskHeader } from '../components/TaskHeader';
import { TaskList } from '../components/TaskList';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { PerformanceTiles } from '../components/PerformanceTiles';
import { auditLogger } from '../lib/auditLogger';

interface DashboardPageProps {
    onTaskClick: (taskId: string) => void;
    currentUser: any;
    filterDeptId: string | null;
    onDeptSelect: (deptId: string | null) => void;
    onRefreshStats: () => void;
    currentView: 'dashboard' | 'audit' | 'users' | 'approved' | 'cancelled';
}

export default function DashboardPage({ onTaskClick, currentUser, filterDeptId, onDeptSelect, onRefreshStats, currentView }: DashboardPageProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        due_date: '',
        department_id: '',
        assignee_id: ''
    });
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        if (currentUser) {
            fetchTasks();
            fetchDepartments();
            fetchEmployees();
        }
    }, [currentUser?.id, currentUser?.permissions?.length, currentUser?.role, newTask.department_id, filterDeptId, currentView]);

    const fetchEmployees = async () => {
        const userRole = currentUser?.role || currentUser?.user_metadata?.role;
        const userDeptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;

        let query = supabase.from('profiles').select('*, departments(name)');
        query = query.eq('role', 'EMPLOYEE');

        // Only allow direct assignment if:
        // 1. User is SUPER_ADMIN
        // 2. User is HEAD and the target department is THEIR department
        if (userRole !== 'SUPER_ADMIN') {
            if (newTask.department_id && newTask.department_id !== userDeptId) {
                setEmployees([]); // Cannot assign to other department's employees directly
                return;
            }
            // For general list, if no dept selected, default to their own
            if (!newTask.department_id) {
                query = query.eq('department_id', userDeptId);
            } else {
                query = query.eq('department_id', newTask.department_id);
            }
        } else if (newTask.department_id) {
            query = query.eq('department_id', newTask.department_id);
        }

        const { data } = await query.order('full_name');
        if (data) setEmployees(data);
    };

    const fetchDepartments = async () => {
        const { data } = await supabase.from('departments').select('*').order('name');
        if (data) setDepartments(data);
    };

    const fetchTasks = async () => {
        if (!currentUser) return;
        setLoading(true);

        try {
            const canViewAll = hasPermission(currentUser, 'task:view');
            const canViewDept = hasPermission(currentUser, 'task:view_dept');
            const deptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;

            let query = supabase.from('tasks').select(`
                *,
                creator:profiles!tasks_creator_id_fkey(full_name),
                assignee:profiles!tasks_assignee_id_fkey(full_name),
                department:departments(name)
            `);

            if (!canViewAll) {
                if (canViewDept && deptId) {
                    // View all in my department OR tasks I created
                    if (currentView === 'dashboard') {
                        query = query.or(`department_id.eq.${deptId},creator_id.eq.${currentUser.id}`);
                    }
                } else {
                    // Employee/Strict view: only tasks assigned to me OR created by me
                    if (currentView === 'dashboard') {
                        query = query.or(`assignee_id.eq.${currentUser.id},creator_id.eq.${currentUser.id}`);
                    }
                }
            }
            // If canViewAll is true, no filters applied -> sees everything.

            if (filterDeptId === 'EXTERNAL') {
                // Tasks created by me but NOT in my department
                query = query.eq('creator_id', currentUser.id).neq('department_id', deptId);
            } else if (filterDeptId) {
                query = query.eq('department_id', filterDeptId);
            }

            const { data, error: fetchError } = await query.order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            if (data) setTasks(data);
        } catch (err: any) {
            console.error('Error fetching dashboard tasks:', err);
            setError('Failed to sync workload from central intelligence.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError('You must be logged in to create a task');
            setCreateLoading(false);
            return;
        }

        // Safety check: ensure the profile exists to prevent foreign key violations (tasks_creator_id_fkey)
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
        if (!profile) {
            console.log('Profile missing during task creation, auto-provisioning...');
            const { error: profileError } = await supabase.from('profiles').insert([{
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
                department_id: user.user_metadata?.department_id || null,
                role: user.user_metadata?.role || 'EMPLOYEE',
                permissions: user.user_metadata?.permissions || []
            }]);
            if (profileError) {
                console.error('Failed to auto-provision profile:', profileError);
                // We'll proceed anyway, database FK will catch it, but at least we tried
            }
        }

        const { data: createdTasks, error: createError } = await supabase
            .from('tasks')
            .insert([
                {
                    ...newTask,
                    due_date: newTask.due_date || null,
                    department_id: newTask.department_id || null,
                    assignee_id: newTask.assignee_id || null,
                    creator_id: user.id,
                    status: newTask.assignee_id ? 'ASSIGNED' : 'CREATED'
                }
            ])
            .select();

        if (createError) {
            setError(createError.message);
        } else {
            await auditLogger.log({
                userId: user.id,
                action: 'TASK_CREATE',
                entityType: 'Task',
                entityId: createdTasks?.[0]?.id,
                newData: newTask
            });
            setIsModalOpen(false);
            setNewTask({ title: '', description: '', priority: 'MEDIUM', due_date: '', department_id: '', assignee_id: '' });
            fetchTasks();
            onRefreshStats();
        }
        setCreateLoading(false);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());


        // 1. View-based logic
        if (statusFilter !== 'ALL') {
            if (task.status !== statusFilter) return false;
        } else {
            // No status filter: use view defaults
            if (currentView === 'approved') {
                if (task.status !== 'APPROVED') return false;
            } else if (currentView === 'cancelled') {
                if (task.status !== 'CANCELLED') return false;
            } else {
                // Dashboard view: hide approved/cancelled by default
                if (task.status === 'APPROVED' || task.status === 'CANCELLED') return false;
            }
        }

        return matchesSearch;
    });

    const highPriorityTasks = filteredTasks.filter(t => t.priority === 'HIGH');
    const normalTasks = filteredTasks.filter(t => t.priority !== 'HIGH');

    return (
        <div className="space-y-8">
            <TaskHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewTask={() => setIsModalOpen(true)}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                currentView={currentView}
                departments={departments}
                filterDeptId={filterDeptId}
                onDeptSelect={onDeptSelect}
            />

            {/* OVERVIEW MODE: Only show performance tiles on Dashboard view */}
            {!filterDeptId && !loading && currentView === 'dashboard' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-orange-600 rounded-none" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Organization Overview</h2>
                    </div>

                    {tasks.length > 0 ? (
                        <div className="space-y-6">
                            <PerformanceTiles tasks={tasks} />
                            <div className="pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {hasPermission(currentUser, 'task:view') ? 'All Organization Tasks' : 'My Department Tasks'}
                                    </h3>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-none font-bold">
                                        {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                                    </span>
                                </div>
                                <TaskList
                                    tasks={filteredTasks}
                                    loading={loading}
                                    searchQuery={searchQuery}
                                    onTaskClick={onTaskClick}
                                    variant="brief"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center rounded-none transition-colors">
                            <p className="text-slate-400 dark:text-slate-600 font-medium">No organizational data available for the current period.</p>
                        </div>
                    )}
                </div>
            )}

            {/* DEPARTMENT VIEW or HISTORY VIEW: Show task lists */}
            {(filterDeptId || currentView === 'approved' || currentView === 'cancelled') && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {highPriorityTasks.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <div className="w-2 h-2 rounded-none bg-rose-600 animate-pulse" />
                                <h2 className="text-sm font-bold uppercase tracking-widest">High Priority Actions</h2>
                            </div>
                            <TaskList
                                tasks={highPriorityTasks}
                                loading={loading}
                                searchQuery={searchQuery}
                                onTaskClick={onTaskClick}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {highPriorityTasks.length > 0 ? 'General Tasks' : 'All Department Tasks'}
                            </h2>
                            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-none border border-slate-100 dark:border-slate-800 transition-colors">
                                {normalTasks.length} {normalTasks.length === 1 ? 'Task' : 'Tasks'}
                            </span>
                        </div>
                        <TaskList
                            tasks={normalTasks}
                            loading={loading}
                            searchQuery={searchQuery}
                            onTaskClick={onTaskClick}
                        />

                        {tasks.length === 0 && !loading && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 text-center rounded-none transition-colors shadow-sm">
                                <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">No tasks found for this department yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
                loading={createLoading}
                error={error}
                newTask={newTask}
                setNewTask={setNewTask}
                departments={departments}
                employees={employees}
                currentUser={currentUser}
            />
        </div>
    );
}