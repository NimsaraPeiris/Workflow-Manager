import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Search, UserCheck, UserPlus, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { Department } from '../../types';

interface ManageTeamMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: { id: string; name: string; department_id: string } | null;
    departments: Department[];
    onSaved: () => void;
}

export const ManageTeamMembersModal = ({
    isOpen,
    onClose,
    team,
    departments,
    onSaved
}: ManageTeamMembersModalProps) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen && team) {
            fetchUsers();
        }
    }, [isOpen, team]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, role, department_id, team_id, departments(name)')
                .order('full_name');

            if (data) {
                setUsers(data);
                const teamMembers = data.filter(u => u.team_id === team?.id).map(u => u.id);
                setSelectedUserIds(new Set(teamMembers));
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId: string) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(userId)) {
            newSet.delete(userId);
        } else {
            newSet.add(userId);
        }
        setSelectedUserIds(newSet);
    };

    const handleSave = async () => {
        if (!team) return;
        setSaving(true);
        try {
            // Find users who were in the team but are now deselected
            const originalMembers = users.filter(u => u.team_id === team.id).map(u => u.id);
            const toRemove = originalMembers.filter(id => !selectedUserIds.has(id));
            const toAdd = Array.from(selectedUserIds).filter(id => !originalMembers.includes(id));

            if (toRemove.length > 0) {
                await supabase.from('profiles').update({ team_id: null }).in('id', toRemove);
            }

            if (toAdd.length > 0) {
                await supabase.from('profiles').update({ team_id: team.id }).in('id', toAdd);
            }

            onSaved();
            onClose();
        } catch (err) {
            console.error('Error saving team members:', err);
            alert('Failed to update squad roster.');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === 'ALL' || user.department_id === deptFilter;
        return matchesSearch && matchesDept;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 rounded-none flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none text-orange-600">Assign Squad Members</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Managing personnel for <span className="font-bold text-slate-900 dark:text-white uppercase">{team?.name}</span></p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search personnel..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                    />
                                </div>
                                <select
                                    className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none focus:border-orange-500 font-bold text-sm appearance-none cursor-pointer"
                                    value={deptFilter}
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                >
                                    <option value="ALL">All Departments</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-[300px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning Personnel...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredUsers.map(user => {
                                        const isSelected = selectedUserIds.has(user.id);
                                        const inOtherTeam = user.team_id && user.team_id !== team?.id;

                                        return (
                                            <div
                                                key={user.id}
                                                onClick={() => toggleUser(user.id)}
                                                className={`
                                                    flex items-center justify-between p-4 cursor-pointer transition-all border-2
                                                    ${isSelected
                                                        ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-500/30'
                                                        : 'bg-white dark:bg-slate-800/40 border-transparent hover:border-slate-100 dark:hover:border-slate-700'}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-none transition-colors ${isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                                            {user.full_name}
                                                            {user.role === 'HEAD' && (
                                                                <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-tighter rounded-none">Head</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                            <Building2 size={10} />
                                                            {user.departments?.name}
                                                            {inOtherTeam && (
                                                                <span className="text-rose-400 ml-2 italic">Transferring from other squad</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isSelected ? (
                                                    <div className="p-2 bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                                                        <UserCheck size={18} />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 text-slate-200 dark:text-slate-700">
                                                        <UserPlus size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 transition-colors">
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-widest transition-all rounded-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-800"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        Confirm Deployment
                                        <span className="text-[10px] opacity-60">({selectedUserIds.size} Selected)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
