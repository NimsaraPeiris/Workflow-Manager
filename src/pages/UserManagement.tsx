import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Building2, Users, UserPlus, FolderPlus, Search, Shield, Mail, Loader2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditLogger } from '../lib/auditLogger';

interface Profile {
    id: string;
    full_name: string;
    role: string;
    department_id: string;
    email?: string;
}

interface Department {
    id: string;
    name: string;
    created_at: string;
}

interface UserManagementProps {
    currentUser: any;
}

export default function UserManagementPage({ currentUser }: UserManagementProps) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const [newDeptName, setNewDeptName] = useState('');
    const [deptLoading, setDeptLoading] = useState(false);
    const [error, setError] = useState('');

    const [newUser, setNewUser] = useState({
        email: '',
        fullName: '',
        password: '',
        departmentId: '',
        role: 'EMPLOYEE'
    });
    const [userLoading, setUserLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: depts } = await supabase.from('departments').select('*').order('name');
            const { data: profs } = await supabase.from('profiles').select('*');

            if (depts) setDepartments(depts);
            if (profs) setProfiles(profs);
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

            setNewDeptName('');
            setIsDeptModalOpen(false);
            fetchData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeptLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserLoading(true);
        setError('');
        try {
            // Using auth.signUp will create the user. 
            // Note: This might log out the admin if they are on the same site depending on supabase config.
            // But usually, Admin creates users via a separate process or invitation system.
            // For now, we use the simple signUp approach as seen in registerPage.
            const { data: authData, error: authErr } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.fullName,
                        department_id: newUser.departmentId,
                        role: newUser.role
                    }
                }
            });

            if (authErr) throw authErr;

            if (authData?.user) {
                await auditLogger.log({
                    userId: currentUser?.id,
                    action: 'USER_CREATE',
                    entityType: 'Profile',
                    newData: {
                        email: newUser.email,
                        full_name: newUser.fullName,
                        role: newUser.role,
                        department_id: newUser.departmentId
                    }
                });
            }

            setIsUserModalOpen(false);
            setNewUser({ email: '', fullName: '', password: '', departmentId: '', role: 'EMPLOYEE' });
            fetchData();
            alert('User created successfully! They will need to verify their email.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUserLoading(false);
        }
    };

    const groupedProfiles = departments.map(dept => ({
        ...dept,
        members: profiles.filter(p => p.department_id === dept.id)
    }));

    const filteredDepts = groupedProfiles.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.members.some(m => m.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Organization Management</h1>
                    <p className="text-slate-500 mt-1">Manage departments, users, and hierarchy across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDeptModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 transition-all shadow-sm"
                    >
                        <FolderPlus size={18} />
                        <span className="font-medium text-sm">New Dept</span>
                    </button>
                    <button
                        onClick={() => setIsUserModalOpen(true)}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 transition-all shadow-lg shadow-orange-200"
                    >
                        <UserPlus size={18} />
                        <span className="font-medium text-sm">Add User / Head</span>
                    </button>
                </div>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Departments', value: departments.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Members', value: profiles.length, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Dept Heads', value: profiles.filter(p => p.role === 'HEAD').length, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center rounded-xl`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by department or user name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm rounded-xl"
                />
            </div>

            {/* Departments Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100">
                    <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                    <p className="text-slate-400 font-medium">Loading organization data...</p>
                </div>
            ) : filteredDepts.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-100 uppercase tracking-widest text-slate-400">
                    No matching departments found
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredDepts.map(dept => (
                        <div key={dept.id} className="bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:border-orange-200 transition-all">
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
                    ))}
                </div>
            )}

            {/* Create Dept Modal */}
            <AnimatePresence>
                {isDeptModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsDeptModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <form onSubmit={handleCreateDept} className="p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Create Department</h2>
                                    <p className="text-slate-500 text-sm">Add a new administrative unit to your organization.</p>
                                </div>

                                {error && <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-100">{error}</div>}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Department Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newDeptName}
                                        onChange={(e) => setNewDeptName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                        placeholder="e.g. Sales & Marketing"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeptModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={deptLoading}
                                        className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium transition-all shadow-lg shadow-orange-100 flex items-center justify-center"
                                    >
                                        {deptLoading ? <Loader2 className="animate-spin" size={20} /> : "Create Dept"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create User Modal */}
            <AnimatePresence>
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsUserModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Add User / Head</h2>
                                    <p className="text-slate-500 text-sm">Create a new organizational account and assign roles.</p>
                                </div>

                                {error && <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-100">{error}</div>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newUser.fullName}
                                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Office Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="name@fochant.lk"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Initial Password</label>
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Department</label>
                                        <select
                                            required
                                            value={newUser.departmentId}
                                            onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none transition-all"
                                        >
                                            <option value="">Select Dept</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Role</label>
                                        <select
                                            required
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none transition-all"
                                        >
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="HEAD">Department Head</option>
                                            <option value="SUPER_ADMIN">Super Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={userLoading}
                                        className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium transition-all shadow-lg shadow-orange-100 flex items-center justify-center"
                                    >
                                        {userLoading ? <Loader2 className="animate-spin" size={20} /> : "Create User"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
