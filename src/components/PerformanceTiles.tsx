import React from 'react';
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    Zap,
    Clock,
    FileText,
    ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Task } from '../types';

interface PerformanceTilesProps {
    tasks: Task[];
}

export const PerformanceTiles: React.FC<PerformanceTilesProps> = ({ tasks }) => {
    // Calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'APPROVED').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH').length;
    const activeTasks = tasks.filter(t => !['APPROVED', 'CANCELLED'].includes(t.status)).length;
    const submittedTasks = tasks.filter(t => t.status === 'SUBMITTED').length;
    const overdueTasks = tasks.filter(t =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        !['APPROVED', 'CANCELLED'].includes(t.status)
    ).length;

    const stats = [
        {
            label: 'Total Scope',
            value: totalTasks.toString(),
            detail: 'All tasks',
            icon: FileText,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/50',
            borderColor: 'group-hover:border-indigo-200'
        },
        {
            label: 'Completion',
            value: `${completionRate}%`,
            detail: `${completedTasks} finalized`,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50/50',
            borderColor: 'group-hover:border-green-200'
        },
        {
            label: 'Active',
            value: activeTasks.toString(),
            detail: 'In progress',
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50/50',
            borderColor: 'group-hover:border-blue-200'
        },
        {
            label: 'Overdue',
            value: overdueTasks.toString(),
            detail: 'Missed deadline',
            icon: Clock,
            color: 'text-rose-600',
            bg: 'bg-rose-50/50',
            borderColor: 'group-hover:border-rose-200'
        },
        {
            label: 'Critical',
            value: highPriorityTasks.toString(),
            detail: 'High priority',
            icon: AlertCircle,
            color: 'text-orange-600',
            bg: 'bg-orange-50/50',
            borderColor: 'group-hover:border-orange-200'
        },
        {
            label: 'Pending Review',
            value: submittedTasks.toString(),
            detail: 'Needs approval',
            icon: Zap,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50/50',
            borderColor: 'group-hover:border-yellow-200'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        >
            {stats.map((stat, idx) => (
                <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    className={`group relative bg-white p-4 border border-slate-100 shadow-sm transition-all duration-300 ${stat.borderColor}`}
                >
                    <div className="flex items-center gap-3 mb-2.5">
                        <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={16} />
                        </div>
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            {stat.label}
                        </h3>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                                {stat.value}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                {stat.detail}
                            </div>
                        </div>
                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    {/* Subtle bottom accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${stat.color.replace('text', 'bg')}`} />
                </motion.div>
            ))}
        </motion.div>
    );
};
