import { Building2, MoreVertical, Mail } from 'lucide-react';

interface Member {
    id: string;
    full_name: string;
    role: string;
}

interface DepartmentCardProps {
    dept: {
        id: string;
        name: string;
        members: Member[];
    };
}

export const DepartmentCard = ({ dept }: DepartmentCardProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:border-orange-200 dark:hover:border-orange-900/40 transition-all rounded-none">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-none text-slate-600 dark:text-slate-400">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">{dept.name}</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold mt-1 tracking-widest">{dept.members.length} Members</p>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-none transition-all opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} />
                </button>
            </div>

            <div className="flex-1 p-6">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Department Personnel</h4>
                <div className="space-y-4">
                    {dept.members.length === 0 ? (
                        <div className="text-xs italic text-slate-400 dark:text-slate-600 py-2">No members assigned to this department.</div>
                    ) : (
                        dept.members.sort((a) => a.role === 'HEAD' ? -1 : 1).map(member => (
                            <div key={member.id} className="flex items-center justify-between py-2 px-3 -mx-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-none">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-none ${member.role === 'HEAD' ? 'bg-blue-600 font-black' : 'bg-slate-100 dark:bg-slate-800'} flex items-center justify-center text-white dark:text-slate-400 text-xs font-bold`}>
                                        {member.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{member.full_name}</span>
                                            {member.role === 'HEAD' && (
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] px-1.5 py-0.5 font-bold rounded-none uppercase tracking-wider">Head</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 font-medium">Node ID: {member.id.substring(0, 8)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-none transition-all text-slate-300 dark:text-slate-600 hover:text-orange-600 dark:hover:text-orange-500 cursor-pointer">
                                        <Mail size={16} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
