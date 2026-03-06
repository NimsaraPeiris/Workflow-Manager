import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Loader2, Users, Building2, Trash2, UserPlus } from 'lucide-react';
import { auditLogger } from '../../lib/auditLogger';
import { CreateTeamModal, ManageTeamMembersModal } from '../../components/admin';
import type { User, Department } from '../../types';

interface TeamsManagementProps {
    currentUser: User | null;
}

export default function TeamsManagementPage({ currentUser }: TeamsManagementProps) {
    const [teams, setTeams] = useState<any[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [teamLoading, setTeamLoading] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', departmentId: '' });
    const [error, setError] = useState('');
    const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<any | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: teamData } = await supabase
                .from('teams')
                .select('*, departments(name), profiles(id, full_name, role)')
                .order('name');

            const { data: deptData } = await supabase
                .from('departments')
                .select('*')
                .order('name');

            if (teamData) setTeams(teamData);
            if (deptData) setDepartments(deptData);
        } catch (err) {
            console.error('Error fetching teams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setTeamLoading(true);
        setError('');
        try {
            const { data, error: teamErr } = await supabase
                .from('teams')
                .insert([{ name: newTeam.name, department_id: newTeam.departmentId }])
                .select()
                .single();

            if (teamErr) throw teamErr;

            if (data) {
                await auditLogger.log({
                    userId: currentUser?.id || null,
                    action: 'TEAM_CREATE',
                    entityType: 'Team',
                    entityId: data.id,
                    newData: newTeam
                });
            }

            setNewTeam({ name: '', departmentId: '' });
            setIsTeamModalOpen(false);
            fetchData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setTeamLoading(false);
        }
    };

    const handleDeleteTeam = async (teamId: string) => {
        if (!confirm('Are you sure you want to disband this squad? All members will be unassigned from the team but will remain in their department.')) return;

        try {
            // Unset team_id for all profiles in this team first (handled by DB if RLS allows, but let's be safe)
            await supabase.from('profiles').update({ team_id: null }).eq('team_id', teamId);

            const { error: delErr } = await supabase
                .from('teams')
                .delete()
                .eq('id', teamId);

            if (delErr) throw delErr;

            await auditLogger.log({
                userId: currentUser?.id || null,
                action: 'TEAM_DELETE',
                entityType: 'Team',
                entityId: teamId
            });

            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.departments?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none text-orange-600 dark:text-orange-500">Squad Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Coordinate operational teams and squad deployments.</p>
                </div>
                <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all rounded-none flex items-center gap-3 shadow-xl active:scale-95"
                >
                    <Users size={18} />
                    New Squad
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search squads or departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500/50 dark:text-white outline-none transition-all shadow-sm rounded-none font-bold"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-950/20 border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Squad Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map(team => (
                        <div key={team.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:border-orange-500/50 transition-all rounded-none group flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 rounded-none group-hover:scale-110 transition-transform duration-500">
                                    <Users size={28} />
                                </div>
                                <button
                                    onClick={() => handleDeleteTeam(team.id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase">{team.name}</h3>
                            <div className="flex items-center gap-2 mb-6">
                                <Building2 size={14} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{team.departments?.name}</span>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                    <span>Personnel Deployed</span>
                                    <span>{team.profiles?.length || 0}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {team.profiles?.slice(0, 5).map((p: any) => (
                                        <div key={p.id} className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-none" title={p.full_name}>
                                            {p.full_name.charAt(0)}
                                        </div>
                                    ))}
                                    {team.profiles?.length > 5 && (
                                        <div className="w-8 h-8 flex items-center justify-center bg-orange-50 dark:bg-orange-500/10 text-[10px] font-black text-orange-600">
                                            +{team.profiles.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedTeamForMembers(team)}
                                className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 w-full text-left flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-orange-600 transition-colors"
                            >
                                <span>Manage Squad Roster</span>
                                <div className="p-1 px-2 bg-slate-100 dark:bg-slate-800 rounded-none group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <UserPlus size={12} />
                                </div>
                            </button>
                        </div>
                    ))}
                    {filteredTeams.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Users className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={60} />
                            <h3 className="text-lg font-black text-slate-400 uppercase tracking-[0.3em]">No Operational Squads Found</h3>
                        </div>
                    )}
                </div>
            )}

            <CreateTeamModal
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                onSubmit={handleCreateTeam}
                newTeam={newTeam}
                setNewTeam={setNewTeam}
                departments={departments}
                loading={teamLoading}
                error={error}
            />

            <ManageTeamMembersModal
                isOpen={!!selectedTeamForMembers}
                onClose={() => setSelectedTeamForMembers(null)}
                team={selectedTeamForMembers}
                departments={departments}
                onSaved={fetchData}
            />
        </div>
    );
}
