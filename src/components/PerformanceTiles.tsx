import React from 'react';
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Zap
} from 'lucide-react';
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
    const pendingTasks = tasks.filter(t => !['APPROVED', 'CANCELLED'].includes(t.status)).length;

    // Efficiency calculation (mocked trend)
    const efficiency = completionRate > 70 ? 'High' : (completionRate > 40 ? 'Moderate' : 'Critical');

    const stats = [
        {
            label: 'Completion Rate',
            value: `${completionRate}%`,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: '+12% from last week',
            trendColor: 'text-emerald-500'
        },
        {
            label: 'Workflow Velocity',
            value: efficiency,
            icon: Zap,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            trend: 'Stable performance',
            trendColor: 'text-slate-400'
        },
        {
            label: 'Active Workflows',
            value: pendingTasks.toString(),
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '4 tasks in review',
            trendColor: 'text-blue-500'
        },
        {
            label: 'Critical Load',
            value: highPriorityTasks.toString(),
            icon: AlertCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            trend: highPriorityTasks > 3 ? 'Immediate attention' : 'Managed load',
            trendColor: highPriorityTasks > 3 ? 'text-rose-500' : 'text-slate-400'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="bg-white p-3.5 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className={`p-2 md:p-2.5 ${stat.bg} ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                            <stat.icon size={18} className="md:w-[22px] md:h-[22px]" />
                        </div>
                        <div className="hidden md:flex items-center gap-1 text-slate-400">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Metrics</span>
                        </div>
                    </div>

                    <div className="space-y-0.5 md:space-y-1">
                        <h3 className="text-xs md:text-sm font-medium text-slate-500 leading-tight">{stat.label}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                {stat.value}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-50 flex items-center gap-2">
                        <span className={`text-[10px] md:text-[11px] font-medium leading-tight ${stat.trendColor}`}>
                            {stat.trend}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
