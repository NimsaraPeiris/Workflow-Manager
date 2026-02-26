import { Building2, Users, Shield } from 'lucide-react';

interface AdminStatsProps {
    departmentsCount: number;
    profilesCount: number;
    headsCount: number;
}

export const AdminStats = ({ departmentsCount, profilesCount, headsCount }: AdminStatsProps) => {
    const stats = [
        { label: 'Total Departments', value: departmentsCount, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Members', value: profilesCount, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Dept Heads', value: headsCount, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-orange-100 transition-all">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center rounded-xl transition-transform group-hover:scale-110`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
