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
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    startOfDay,
    endOfDay
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
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalendarTasks();
    }, [currentDate, currentUser?.id, viewMode]);

    const fetchCalendarTasks = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            let start, end;
            if (viewMode === 'month') {
                start = startOfWeek(startOfMonth(currentDate));
                end = endOfWeek(endOfMonth(currentDate));
            } else if (viewMode === 'week') {
                start = startOfWeek(currentDate);
                end = endOfWeek(currentDate);
            } else {
                start = startOfDay(currentDate);
                end = endOfDay(currentDate);
            }
            const startStr = format(start, 'yyyy-MM-dd');
            const endStr = format(end, 'yyyy-MM-dd');

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

    const handleNext = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const handlePrev = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const getCalendarDays = () => {
        if (viewMode === 'month') {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart);
            const endDate = endOfWeek(monthEnd);
            return eachDayOfInterval({ start: startDate, end: endDate });
        } else if (viewMode === 'week') {
            const startDate = startOfWeek(currentDate);
            const endDate = endOfWeek(currentDate);
            return eachDayOfInterval({ start: startDate, end: endDate });
        } else {
            return [startOfDay(currentDate)];
        }
    };

    const calendarDays = getCalendarDays();

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
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                        <CalendarIcon className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-md text-slate-900 dark:text-white tracking-tight">Timeline <span className="text-orange-600">Calendar</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm font-medium">Visualizing task deadlines and work schedule</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 relative z-10 w-full lg:w-auto">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                        {(['month', 'week', 'day'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`
                                    flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                    ${viewMode === mode
                                        ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}
                                `}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <button onClick={handlePrev} className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md px-4 sm:px-8 py-2 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 sm:min-w-[200px] text-center shadow-inner">
                            <span className="text-[10px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                                {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') :
                                    viewMode === 'week' ? `Week of ${format(startOfWeek(currentDate), 'MMM d')}` :
                                        format(currentDate, 'MMMM d, yyyy')}
                            </span>
                        </div>
                        <button onClick={handleNext} className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
            </div>

            <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all ${viewMode === 'day' ? 'max-w-2xl mx-auto' : ''}`}>
                {viewMode !== 'day' && (
                    <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-3 sm:py-5 text-center">
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                    <span className="hidden sm:inline">{day}</span>
                                    <span className="sm:hidden">{day.charAt(0)}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className={`grid ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
                    {calendarDays.map((day, idx) => {
                        const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(format(day, 'yyyy-MM-dd')));
                        const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, startOfMonth(currentDate)) : true;
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                className={`
                                    ${viewMode === 'day' ? 'min-h-[400px] p-8' : 'min-h-[80px] sm:min-h-[200px] p-1 sm:p-3'} 
                                    border-r border-b border-slate-100 dark:border-slate-800 transition-all relative group/cell overflow-hidden
                                    ${dayTasks.length > 0
                                        ? 'bg-orange-100/40 dark:bg-orange-500/[0.08]'
                                        : !isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-950/20' : 'bg-white dark:bg-slate-900'}
                                    ${idx % 7 === 6 || viewMode === 'day' ? 'border-r-0' : ''}
                                    ${viewMode !== 'day' ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30' : ''}
                                `}
                            >
                                {dayTasks.length > 0 && (
                                    <>
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 dark:bg-orange-500/30 blur-[60px] rounded-full -mr-20 -mt-20 pointer-events-none animate-pulse duration-[3000ms]" />
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/20 dark:bg-orange-400/20 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                                    </>
                                )}
                                <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <span className={`
                                            text-[10px] sm:text-sm font-black w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-2xl transition-all
                                            ${isToday
                                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/40 scale-110'
                                                : isCurrentMonth
                                                    ? dayTasks.length > 0
                                                        ? 'text-orange-900 dark:text-orange-200 bg-orange-100/50 dark:bg-orange-500/20'
                                                        : 'text-slate-900 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50'
                                                    : 'text-slate-300 dark:text-slate-700'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {viewMode === 'day' && (
                                            <div>
                                                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                                    {format(day, 'EEEE')}
                                                </p>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                    Operational Schedule
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`space-y-2 ${viewMode === 'day' ? 'max-h-none' : 'max-h-[160px] overflow-y-auto no-scrollbar'} scroll-smooth relative z-10`}>
                                    {dayTasks.map(task => (
                                        <motion.button
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={task.id}
                                            onClick={() => onTaskClick(task.id)}
                                            className={`
                                                w-full text-left rounded-xl bg-white dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group overflow-hidden relative
                                                ${viewMode === 'day' ? 'p-4' : 'p-1 sm:p-2'}
                                            `}
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                                                <div className={`shrink-0 rounded-full shadow-sm ${viewMode === 'day' ? 'w-3 h-3' : 'w-1 h-1 sm:w-2 sm:h-2'} ${getStatusColor(task.status)}`} />
                                                <div className="flex-1 min-w-0">
                                                    <span className={`font-bold block text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white leading-tight ${viewMode === 'day' ? 'text-sm' : 'text-[7px] sm:text-[10px]'}`}>
                                                        {task.title}
                                                    </span>
                                                    {viewMode === 'day' && task.description && (
                                                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`absolute inset-y-0 left-0 w-0.5 sm:w-1 opacity-0 group-hover:opacity-100 transition-opacity ${getStatusColor(task.status)}`} />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* status legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-8 px-4 sm:px-8 py-4 sm:py-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl sm:rounded-[32px] border border-slate-100 dark:border-slate-800">
                {[
                    { color: 'bg-slate-400', label: 'Pending' },
                    { color: 'bg-blue-500', label: 'Assigned' },
                    { color: 'bg-amber-500', label: 'Active' },
                    { color: 'bg-indigo-500', label: 'Submitted' },
                    { color: 'bg-emerald-500', label: 'Completed' },
                    { color: 'bg-rose-500', label: 'Cancelled' }
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 sm:gap-3">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${item.color} shadow-sm`} />
                        <span className="text-[7px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest sm:tracking-[0.2em]">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
