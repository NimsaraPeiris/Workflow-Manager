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
        <div className="bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:border-orange-200 transition-all">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center rounded-lg text-slate-600">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{dept.name}</h3>
                        <p className="text-xs text-slate-400 uppercase font-medium">{dept.members.length} Members</p>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} />
                </button>
            </div>

            <div className="flex-1 p-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Department Members</h4>
                <div className="space-y-4">
                    {dept.members.length === 0 ? (
                        <div className="text-xs italic text-slate-400 py-2">No members assigned to this department.</div>
                    ) : (
                        dept.members.sort((a) => a.role === 'HEAD' ? -1 : 1).map(member => (
                            <div key={member.id} className="flex items-center justify-between py-1 px-2 -mx-2 hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${member.role === 'HEAD' ? 'bg-indigo-600' : 'bg-slate-200'} flex items-center justify-center text-white text-xs font-bold`}>
                                        {member.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-900">{member.full_name}</span>
                                            {member.role === 'HEAD' && (
                                                <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 font-bold rounded uppercase">Head</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 line-clamp-1">ID: {member.id.substring(0, 8)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-300 hover:text-slate-500 cursor-pointer transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
