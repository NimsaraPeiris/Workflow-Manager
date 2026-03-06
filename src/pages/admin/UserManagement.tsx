import { useState, useEffect } from 'react';
import { supabase, createAdminClient } from '../../lib/supabaseClient';
import { Search, Loader2, ArrowLeft, Building2, Users, Settings, X } from 'lucide-react';
import { auditLogger } from '../../lib/auditLogger';
import {
    AdminStats,
    CreateDeptModal,
    CreateUserModal,
    RoleManagementModal,
    EditPermissionsModal,
    CreateTeamModal
} from '../../components/admin';
import {
    ManageRolesButton,
    CreateDepartmentButton,
    CreateUserButton
} from '../../components/permissions';
import { PermissionGuard } from '../../components/auth/PermissionGuard';


import type { User, Department } from '../../types';

interface UserManagementProps {
    currentUser: User | null;
}

export default function UserManagementPage({ currentUser }: UserManagementProps) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [teams, setTeams] = useState<any[]>([]);
    const [newTeam, setNewTeam] = useState({ name: '', departmentId: '' });
    const [teamLoading, setTeamLoading] = useState(false);

    const [newDeptName, setNewDeptName] = useState('');
    const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<Department | null>(null);
    const [deptLoading, setDeptLoading] = useState(false);
    const [error, setError] = useState('');

    const [newUser, setNewUser] = useState({
        email: '',
        fullName: '',
        password: '',
        departmentId: '',
        teamId: '',
        role: 'EMPLOYEE',
        roleId: '',
        permissions: [] as string[]
    });


    const [userLoading, setUserLoading] = useState(false);

    useEffect(() => {
        fetchData();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        const { data } = await supabase.from('roles').select('*');
        if (data) setRoles(data);
    };


    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: depts } = await supabase.from('departments').select('*').order('name');
            const { data: profs } = await supabase.from('profiles').select('*, team:teams(name)');
            const { data: teamData } = await supabase.from('teams').select('*, departments(name)').order('name');

            if (depts) setDepartments(depts);
            if (profs) setUsers(profs as any);
            if (teamData) setTeams(teamData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDept = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeptLoading(true);
        setError('');
        try {
            if (selectedDeptForEdit) {
                // Update implementation
                const { error: updateErr } = await supabase
                    .from('departments')
                    .update({ name: newDeptName })
                    .eq('id', selectedDeptForEdit.id);

                if (updateErr) throw updateErr;

                await auditLogger.log({
                    userId: currentUser?.id || null,
                    action: 'DEPT_UPDATE',
                    entityType: 'Department',
                    entityId: selectedDeptForEdit.id,
                    newData: { name: newDeptName }
                });
            } else {
                // Create implementation
                const { data: deptData, error: deptErr } = await supabase.from('departments').insert([{ name: newDeptName }]).select().single();
                if (deptErr) throw deptErr;

                if (deptData) {
                    await auditLogger.log({
                        userId: currentUser?.id || null,
                        action: 'DEPT_CREATE',
                        entityType: 'Department',
                        entityId: deptData.id,
                        newData: { name: newDeptName }
                    });
                }
            }

            setNewDeptName('');
            setSelectedDeptForEdit(null);
            setIsDeptModalOpen(false);
            fetchData();
        } catch (err: any) {
            console.error('Dept Action Error:', err);
            if (err.status === 409 || err.code === '23505') {
                setError('A department with this name already exists.');
            } else {
                setError(err.message || 'Failed to process department action.');
            }
        } finally {
            setDeptLoading(false);
        }
    };

    const handleDeleteDept = async (deptId: string) => {
        const dept = departments.find(d => d.id === deptId);
        if (!dept) return;

        const hasMembers = users.some(u => u.department_id === deptId);
        if (hasMembers) {
            alert('Cannot delete department with active personnel. Reassign members first.');
            return;
        }

        if (!window.confirm(`Are you sure you want to decommission the "${dept.name}" department?`)) return;

        setDeptLoading(true);
        try {
            const { error: deleteErr } = await supabase.from('departments').delete().eq('id', deptId);
            if (deleteErr) throw deleteErr;

            await auditLogger.log({
                userId: currentUser?.id || null,
                action: 'DEPT_DELETE',
                entityType: 'Department',
                entityId: deptId
            });

            await fetchData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeptLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setTeamLoading(true);
        setError('');
        try {
            const { data: teamData, error: teamErr } = await supabase
                .from('teams')
                .insert([{ name: newTeam.name, department_id: newTeam.departmentId }])
                .select()
                .single();

            if (teamErr) throw teamErr;

            if (teamData) {
                await auditLogger.log({
                    userId: currentUser?.id || null,
                    action: 'TEAM_CREATE',
                    entityType: 'Team',
                    entityId: teamData.id,
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

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserLoading(true);
        setError('');
        try {
            const adminClient = createAdminClient();
            const { data: authData, error: authErr } = await adminClient.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.fullName,
                        department_id: newUser.departmentId === '' ? null : newUser.departmentId,
                        team_id: newUser.teamId === '' ? null : newUser.teamId,
                        role: newUser.role,
                        role_id: newUser.roleId === '' ? null : newUser.roleId,
                        permissions: newUser.permissions || []
                    }
                }
            });

            if (authErr) throw authErr;

            if (authData?.user) {
                await auditLogger.log({
                    userId: currentUser?.id || null,
                    action: 'USER_CREATE',
                    entityType: 'Profile',
                    newData: {
                        email: newUser.email,
                        full_name: newUser.fullName,
                        role: newUser.role,
                        role_id: newUser.roleId === '' ? null : newUser.roleId,
                        department_id: newUser.departmentId === '' ? null : newUser.departmentId,
                        team_id: newUser.teamId === '' ? null : newUser.teamId,
                        permissions: newUser.permissions || []
                    }
                });
            }

            setIsUserModalOpen(false);
            setNewUser({ email: '', fullName: '', password: '', departmentId: '', teamId: '', role: 'EMPLOYEE', roleId: '', permissions: [] });

            fetchData();
            alert('User provisioned successfully with identity keys and permissions.');
        } catch (err: any) {
            console.error('User creation failed:', err);
            if (err.status === 409 || err.code === '23505') {
                setError('This email address is already associated with an identity.');
            } else {
                setError(err.message || 'Identity provision failed. Check system logs.');
            }
        } finally {
            setUserLoading(false);
        }
    };

    const handleUpdatePermissions = async (userId: string, updates: any) => {
        setEditLoading(true);
        setError('');
        try {
            console.log('Current User initiating update:', {
                id: currentUser?.id,
                role: currentUser?.role,
                metadataRole: (currentUser as any)?.user_metadata?.role
            });

            const { data, error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: updates.fullName,
                    role: updates.role,
                    department_id: updates.departmentId,
                    team_id: updates.teamId === '' ? null : updates.teamId,
                    permissions: updates.permissions || [],
                    role_id: updates.roleId === '' ? null : updates.roleId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select();

            if (updateError) {
                console.error('Supabase RLS/Update Error:', updateError);
                throw updateError;
            }

            // If data is empty or null, it means the query matched 0 rows (usually due to RLS)
            if (!data || data.length === 0) {
                console.error('Update returned no data. Check RLS policies for "profiles" table.');
                throw new Error('Access Denied: Your database role does not grant permission to modify this profile. Ensure your "role" in the database is set to "SUPER_ADMIN".');
            }

            await auditLogger.log({
                userId: currentUser?.id || null,
                action: 'USER_UPDATE',
                entityType: 'Profile',
                entityId: userId,
                newData: updates
            });

            fetchData();
            alert('Security keys updated successfully.');
        } catch (err: any) {
            console.error('Update failed:', err);
            setError(err.message || 'Failed to update security keys.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('DANGER: This will permanently decommission this identity and purge all associated profile data. Continue?')) return;

        setLoading(true);
        setError('');
        try {
            const { error: deleteErr } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (deleteErr) throw deleteErr;

            await auditLogger.log({
                userId: currentUser?.id || null,
                action: 'USER_DELETE',
                entityType: 'Profile',
                entityId: userId
            });

            await fetchData();
            alert('Identity successfully purged from system.');
        } catch (err: any) {
            console.error('Delete failed:', err);
            setError(err.message || 'Failed to purge identity. Check for active task assignments.');
        } finally {
            setLoading(false);
        }
    };

    const groupedProfiles = departments.map(dept => ({
        ...dept,
        members: users.filter(p => p.department_id === dept.id)
    }));

    const unassignedMembers = users.filter(p => !p.department_id);

    const filteredDepts = groupedProfiles.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.members.some(m => m.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const showUnassigned = unassignedMembers.length > 0 &&
        (searchQuery === '' || unassignedMembers.some(m => m.full_name.toLowerCase().includes(searchQuery.toLowerCase())));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Departments & Permissions</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage departments, users, and hierarchy across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ManageRolesButton onClick={() => setIsRoleModalOpen(true)} />
                    <CreateDepartmentButton onClick={() => setIsDeptModalOpen(true)} />
                    <CreateUserButton onClick={() => setIsUserModalOpen(true)} />
                </div>
            </div>

            {/* Stats section */}
            <AdminStats
                departmentsCount={departments.length}
                profilesCount={users.length}
                headsCount={users.filter(p => !['EMPLOYEE', 'Custom', 'authenticated'].includes(p.role)).length}
            />

            {/* Search bar - only show when no dept selected or within dept */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={selectedDeptId ? "Search within this department..." : "Search by department or user name..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-white outline-none transition-all shadow-sm rounded-none"
                />
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800">
                    <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                    <p className="text-slate-400 font-medium">Loading organization data...</p>
                </div>
            ) : selectedDeptId ? (
                // DRILL-DOWN VIEW: Selected Department Members
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedDeptId(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-none transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {selectedDeptId === 'unassigned' ? 'Unassigned Personnel' : departments.find(d => d.id === selectedDeptId)?.name}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {users.filter(u => selectedDeptId === 'unassigned' ? !u.department_id : u.department_id === selectedDeptId).length} Active Personnel
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden rounded-none">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Team Member</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Authority Level</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {users
                                    .filter(u => selectedDeptId === 'unassigned' ? !u.department_id : u.department_id === selectedDeptId)
                                    .filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .sort((a) => a.role === 'HEAD' ? -1 : 1)
                                    .map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 flex items-center justify-center font-black text-lg transition-all ${user.role === 'HEAD' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'} rounded-none rotate-3 group-hover:rotate-0`}>
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-base">{user.full_name}</div>
                                                        {(user.permissions && user.permissions.length > 0) && (
                                                            <div className="flex flex-wrap gap-1 mt-3">
                                                                {user.permissions.slice(0, 5).map((p: string) => (
                                                                    <span key={p} className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800/60 text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tighter border border-slate-100 dark:border-slate-800 rounded-none">
                                                                        {p.split(':')[1] || p}
                                                                    </span>
                                                                ))}
                                                                {user.permissions.length > 5 && (
                                                                    <span className="text-[8px] text-orange-500 font-black uppercase self-center pl-1">
                                                                        +{user.permissions.length - 5}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-2 ${user.role === 'SUPER_ADMIN' ? 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/10' :
                                                    'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-500 border-orange-100 dark:border-orange-500/10'
                                                    } rounded-none`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {user.email}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    <PermissionGuard permission="user:edit">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedUserForEdit(user);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 underline decoration-slate-200 hover:decoration-orange-500 transition-all underline-offset-4"
                                                        >
                                                            Manage Identity
                                                        </button>
                                                    </PermissionGuard>
                                                    <PermissionGuard permission="user:delete">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteUser(user.id);
                                                            }}
                                                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all"
                                                        >
                                                            Purge
                                                        </button>
                                                    </PermissionGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {users.filter(u => u.department_id === selectedDeptId).length === 0 && (
                            <div className="py-20 text-center uppercase tracking-widest text-slate-400 font-bold">
                                No personnel deployed to this sector
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // GRID VIEW: Department Selector
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {filteredDepts.map(dept => (
                        <div
                            key={dept.id}
                            onClick={() => setSelectedDeptId(dept.id)}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 cursor-pointer hover:border-orange-500 dark:hover:border-orange-600 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all rounded-none group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 dark:bg-slate-800/50 -mr-8 -mt-8 rotate-45 group-hover:bg-orange-500 transition-colors" />
                            <div className="flex justify-between items-start mb-6">
                                <Building2 className="text-slate-400 dark:text-slate-600 group-hover:text-orange-500 transition-colors" size={32} />
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDeptForEdit(dept);
                                            setNewDeptName(dept.name);
                                            setIsDeptModalOpen(true);
                                        }}
                                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-orange-600 transition-colors"
                                    >
                                        <Settings size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDept(dept.id);
                                        }}
                                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                                {dept.name}
                            </h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Deployment</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:scale-125 transition-transform">{dept.members.length}</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                                <span>Inspect Node</span>
                                <Loader2 size={14} className="opacity-0 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
                            </div>
                        </div>
                    ))}

                    {showUnassigned && (
                        <div
                            onClick={() => setSelectedDeptId('unassigned')}
                            className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-all rounded-none group relative overflow-hidden"
                        >
                            <Users className="text-slate-300 dark:text-slate-700 group-hover:text-slate-500 mb-6 transition-colors" size={32} />
                            <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 tracking-tight mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                Unassigned
                            </h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Awaiting Deployment</span>
                                <span className="text-2xl font-black text-slate-400 dark:text-slate-500 group-hover:scale-125 transition-transform">{unassignedMembers.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <CreateDeptModal
                isOpen={isDeptModalOpen}
                onClose={() => {
                    setIsDeptModalOpen(false);
                    setSelectedDeptForEdit(null);
                    setNewDeptName('');
                }}
                onSubmit={handleCreateDept}
                deptName={newDeptName}
                setDeptName={setNewDeptName}
                loading={deptLoading}
                error={error}
                isEditing={!!selectedDeptForEdit}
            />

            <CreateUserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSubmit={handleCreateUser}
                newUser={newUser}
                setNewUser={setNewUser}
                departments={departments}
                teams={teams}
                roles={roles}
                loading={userLoading}

                error={error}
            />

            <RoleManagementModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSave={async (roleData) => {
                    try {
                        if (roleData.id) {
                            const { error } = await supabase
                                .from('roles')
                                .update({ name: roleData.name, permissions: roleData.permissions })
                                .eq('id', roleData.id);
                            if (error) throw error;
                        } else {
                            const { error } = await supabase.from('roles').insert([roleData]);
                            if (error) throw error;
                        }
                        await fetchRoles();
                    } catch (err: any) {
                        console.error('Role Blueprint Error:', err);
                        if (err.status === 409 || err.code === '23505') {
                            throw new Error('A role with this name already exists.');
                        }
                        throw err;
                    }
                }}
                onDelete={async (roleId) => {
                    const { error } = await supabase
                        .from('roles')
                        .delete()
                        .eq('id', roleId);
                    if (error) throw error;
                    await fetchRoles();
                }}
                existingRoles={roles}
            />

            <EditPermissionsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdatePermissions}
                user={selectedUserForEdit}
                departments={departments}
                teams={teams}
                roles={roles}
                loading={editLoading}
                error={error}
            />

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
        </div>
    );
}
