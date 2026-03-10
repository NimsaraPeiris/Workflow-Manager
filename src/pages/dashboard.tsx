import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { hasPermission } from '../lib/permissions';
import type { Task } from '../types';
import { TaskHeader } from '../components/TaskHeader';
import { TaskFilterBar } from '../components/TaskFilterBar';
import { TaskList } from '../components/TaskList';
import { PerformanceTiles } from '../components/PerformanceTiles';

interface DashboardPageProps {
    onTaskClick: (taskId: string) => void;
    currentUser: any;
    filterDeptId: string | null;
    filterTeamId: string | null;
    onDeptSelect: (deptId: string | null) => void;
    currentView: 'dashboard' | 'audit' | 'users' | 'approved' | 'cancelled' | 'assigned';
    onOpenCreateModal: () => void;
}

export default function DashboardPage({
    onTaskClick,
    currentUser,
    filterDeptId,
    filterTeamId,
    onDeptSelect,
    currentView,
    onOpenCreateModal
}: DashboardPageProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const fetchIdRef = useRef(0);

    const fetchDepartments = async () => {
        const { data } = await supabase.from('departments').select('*').order('name');
        if (data) setDepartments(data);
    };

    const fetchTeams = async () => {
        const { data } = await supabase.from('teams').select('*, departments(name)').order('name');
        if (data) setTeams(data);
    };

    useEffect(() => {
        if (currentUser) {
            fetchTasks();
            fetchDepartments();
            fetchTeams();
        }
    }, [currentUser?.id, currentUser?.role, currentUser?.team_id, currentUser?.department_id, filterDeptId, filterTeamId, currentView]);

    const fetchTasks = async () => {
        if (!currentUser) return;
        const currentFetchId = ++fetchIdRef.current;
        setLoading(true);

        try {
            const appRole = (currentUser?.role && currentUser?.role !== 'authenticated')
                ? currentUser.role
                : currentUser?.user_metadata?.role;
            const canViewAll = appRole === 'SUPER_ADMIN';
            const canViewDept = appRole === 'DEP_HEAD' || appRole === 'HEAD' || hasPermission(currentUser, 'task:view_dept');
            const deptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;

            let query = supabase.from('tasks').select(`
                *,
                creator:profiles!tasks_creator_id_fkey(full_name),
                assignee:profiles!tasks_assignee_id_fkey(full_name),
                department:departments(name),
                team:teams(name)
            `);

            // For 'assigned' view, skip all visibility & secondary filters — just get my tasks
            if (currentView === 'assigned') {
                query = query.eq('assignee_id', currentUser.id);
            } else {
                // Apply visibility filters if not a global viewer
                if (!canViewAll) {
                    const teamId = currentUser?.team_id || currentUser?.user_metadata?.team_id;
                    if (canViewDept && deptId) {
                        // Head: View all in department OR tasks I created OR tasks for my team
                        let filter = `department_id.eq.${deptId},creator_id.eq.${currentUser.id}`;
                        if (teamId) filter += `,team_id.eq.${teamId}`;
                        query = query.or(filter);
                    } else if (currentUser.id) {
                        // Employee: View tasks assigned to me, created by me, or ANY in my department/team
                        let filter = `assignee_id.eq.${currentUser.id},creator_id.eq.${currentUser.id}`;
                        if (deptId) filter += `,department_id.eq.${deptId}`;
                        if (teamId) filter += `,team_id.eq.${teamId}`;
                        query = query.or(filter);
                    }
                }

                // Apply secondary filters (sidebar selection)
                if (filterTeamId) {
                    query = query.eq('team_id', filterTeamId);
                } else if (filterDeptId === 'EXTERNAL') {
                    query = query.eq('creator_id', currentUser.id).neq('department_id', deptId);
                } else if (filterDeptId) {
                    // Show department tasks + always include user's own assigned tasks and team tasks
                    const teamId = currentUser?.team_id || currentUser?.user_metadata?.team_id;
                    let deptFilter = `department_id.eq.${filterDeptId},assignee_id.eq.${currentUser.id}`;
                    if (teamId) deptFilter += `,team_id.eq.${teamId}`;
                    query = query.or(deptFilter);
                }
            }

            const { data, error: fetchError } = await query.order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            // Only update state if this is still the latest fetch
            if (currentFetchId !== fetchIdRef.current) return;
            setTasks(data || []);
        } catch (err: any) {
            console.error('Error fetching dashboard tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

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
                // Dashboard/assigned view: hide approved/cancelled by default
                if (task.status === 'APPROVED' || task.status === 'CANCELLED') return false;
            }
        }

        return matchesSearch;
    });

    const highPriorityTasks = filteredTasks.filter(t => t.priority === 'HIGH');
    const normalTasks = filteredTasks.filter(t => t.priority !== 'HIGH');

    return (
        <div className="space-y-6 sm:space-y-8 pb-12">
            <TaskHeader
                currentView={currentView}
                departments={departments}
                filterDeptId={filterDeptId}
                filterTeamId={filterTeamId}
                teams={teams}
            />

            {/* OVERVIEW MODE: Performance Info -> Filters -> List */}
            {!filterDeptId && !filterTeamId && !loading && currentView === 'dashboard' && (
                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-orange-600 rounded-none" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">Organization Performance</h2>
                    </div>

                    {tasks.length > 0 && <PerformanceTiles tasks={tasks} />}

                    <div className="space-y-8">
                        <TaskFilterBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            departments={departments}
                            filterDeptId={filterDeptId}
                            onDeptSelect={onDeptSelect}
                            currentView={currentView}
                            onNewTask={onOpenCreateModal}
                        />

                        {tasks.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                        {hasPermission(currentUser, 'task:view') ? 'Enterprise Activity Feed' : 'Departmental Queue'}
                                    </h3>
                                    <span className="text-[10px] bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-none font-black uppercase tracking-widest shadow-sm">
                                        {filteredTasks.length} Units Detected
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
                        ) : (
                            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center rounded-none transition-colors">
                                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em]">Zero Activity Detected in current Intelligence Scope</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ASSIGNED / FILTERED VIEWS: Filters -> List */}
            {(filterDeptId || filterTeamId || currentView !== 'dashboard') && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TaskFilterBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        departments={departments}
                        filterDeptId={filterDeptId}
                        onDeptSelect={onDeptSelect}
                        currentView={currentView}
                        onNewTask={onOpenCreateModal}
                    />

                    {currentView === 'assigned' ? (
                        <div className="space-y-8">
                            {highPriorityTasks.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <div className="w-2 h-2 rounded-none bg-rose-600 animate-pulse" />
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">High Priority Assigned</h2>
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
                                    <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                        {highPriorityTasks.length > 0 ? 'Secondary Workload' : 'Direct Assignments'}
                                    </h2>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
                                        {normalTasks.length} Active Records
                                    </span>
                                </div>
                                <TaskList
                                    tasks={normalTasks}
                                    loading={loading}
                                    searchQuery={searchQuery}
                                    onTaskClick={onTaskClick}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {highPriorityTasks.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <div className="w-2 h-2 rounded-none bg-rose-600 animate-pulse" />
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Critical Exposure</h2>
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
                                <div className="flex items-center justify-between hidden md:block">
                                    <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                        {filterTeamId ? 'Regional Squad Workload' : 'Project Pipeline'}
                                    </h2>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
                                        {normalTasks.length} Results Found
                                    </span>
                                </div>
                                <TaskList
                                    tasks={normalTasks}
                                    loading={loading}
                                    searchQuery={searchQuery}
                                    onTaskClick={onTaskClick}
                                />
                            </div>
                        </div>
                    )}

                    {tasks.length === 0 && !loading && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 text-center rounded-none shadow-sm">
                            <p className="text-slate-400 dark:text-slate-600 text-sm font-bold uppercase tracking-widest">Zero Intelligence Found for this Query</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}