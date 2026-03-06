import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../types';
import { hasPermission } from '../lib/permissions';
import { useState, useEffect } from 'react';

interface CalendarViewProps {
    currentUser: any;
    onTaskClick: (taskId: string) => void;
}

export default function CalendarView({ currentUser, onTaskClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalendarTasks();
    }, [currentDate, currentUser?.id]);

    const fetchCalendarTasks = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const startStr = format(startOfWeek(startOfMonth(currentDate)), 'yyyy-MM-dd');
            const endStr = format(endOfWeek(endOfMonth(currentDate)), 'yyyy-MM-dd');

            let query = supabase.from('tasks').select(`
                *,
                department:departments(name),
                team:teams(name)
            `);

            // Apply visibility filters if not a global viewer
            const canViewAll = hasPermission(currentUser, 'task:view');

            if (!canViewAll) {
                const appRole = currentUser?.role;
                const deptId = currentUser?.department_id || currentUser?.user_metadata?.department_id;
                const teamId = currentUser?.team_id || currentUser?.user_metadata?.team_id;
                const canViewDept = appRole === 'DEP_HEAD' || appRole === 'HEAD' || hasPermission(currentUser, 'task:view_dept');

                if (canViewDept && deptId) {
                    let filter = `department_id.eq.${deptId},creator_id.eq.${currentUser.id}`;
                    if (teamId) filter += `,team_id.eq.${teamId}`;
                    query = query.or(filter);
                } else if (currentUser.id) {
                    let filter = `assignee_id.eq.${currentUser.id},creator_id.eq.${currentUser.id}`;
                    if (deptId) filter += `,department_id.eq.${deptId}`;
                    if (teamId) filter += `,team_id.eq.${teamId}`;
                    query = query.or(filter);
                }
            }

            const { data } = await query
                .gte('due_date', startStr)
                .lte('due_date', endStr);

            if (data) setTasks(data);
        } catch (err) {
            console.error('Error fetching calendar tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500';
            case 'IN_PROGRESS': return 'bg-amber-500';
            case 'CANCELLED': return 'bg-slate-400';
            case 'SUBMITTED': return 'bg-indigo-500';
            case 'ASSIGNED': return 'bg-blue-500';
            default: return 'bg-rose-500';
        }
    };

    if (loading && tasks.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-12 w-12 border-2 border-orange-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                        <CalendarIcon className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Timeline <span className="text-orange-600">Calendar</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Visualizing task deadlines and work schedule</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <button onClick={prevMonth} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md px-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[200px] text-center shadow-inner">
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                    </div>
                    <button onClick={nextMonth} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all">
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-5 text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{day}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(format(day, 'yyyy-MM-dd')));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                className={`
                                    min-h-[160px] p-3 border-r border-b border-slate-100 dark:border-slate-800 transition-all relative group/cell overflow-hidden
                                    ${dayTasks.length > 0
                                        ? 'bg-orange-100/40 dark:bg-orange-500/[0.08]'
                                        : !isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-950/20' : 'bg-white dark:bg-slate-900'}
                                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                                    hover:bg-slate-50/80 dark:hover:bg-slate-800/30
                                `}
                            >
                                {dayTasks.length > 0 && (
                                    <>
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 dark:bg-orange-500/30 blur-[60px] rounded-full -mr-20 -mt-20 pointer-events-none animate-pulse duration-[3000ms]" />
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/20 dark:bg-orange-400/20 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                                    </>
                                )}
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <span className={`
                                        text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all
                                        ${isToday
                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/40 scale-110 z-10'
                                            : isCurrentMonth
                                                ? dayTasks.length > 0
                                                    ? 'text-orange-900 dark:text-orange-200 bg-orange-100/50 dark:bg-orange-500/20'
                                                    : 'text-slate-900 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50'
                                                : 'text-slate-300 dark:text-slate-700'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="space-y-2 max-h-[120px] overflow-y-auto no-scrollbar scroll-smooth relative z-10">
                                    {dayTasks.map(task => (
                                        <motion.button
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={task.id}
                                            onClick={() => onTaskClick(task.id)}
                                            className="w-full text-left p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
                                        >
                                            <div className="flex items-center gap-2 relative z-10">
                                                <div className={`w-2 h-2 shrink-0 rounded-full shadow-sm ${getStatusColor(task.status)}`} />
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white leading-tight">
                                                    {task.title}
                                                </span>
                                            </div>
                                            {/* subtle status gradient background */}
                                            <div className={`absolute inset-y-0 left-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${getStatusColor(task.status)}`} />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* status legend */}
            <div className="flex flex-wrap items-center gap-8 px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-slate-400 shadow-sm" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Pending</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Assigned</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Active</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/20" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Submitted</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Completed</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/20" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Cancelled</span>
                </div>
            </div>
        </div>
    );
}
