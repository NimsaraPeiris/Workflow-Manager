import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserPlus, FolderPlus, Search, Loader2 } from 'lucide-react';
import { auditLogger } from '../../lib/auditLogger';
import {
    AdminStats,
    DepartmentCard,
    CreateDeptModal,
    CreateUserModal
} from '../../components/admin';

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
            if (profs) setUsers(profs);
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
                    userId: currentUser?.id || null,
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
            alert('User created successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUserLoading(false);
        }
    };

    const groupedProfiles = departments.map(dept => ({
        ...dept,
        members: users.filter(p => p.department_id === dept.id)
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
            <AdminStats
                departmentsCount={departments.length}
                profilesCount={users.length}
                headsCount={users.filter(p => p.role === 'HEAD').length}
            />

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
                        <DepartmentCard key={dept.id} dept={dept} />
                    ))}
                </div>
            )}

            <CreateDeptModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                onSubmit={handleCreateDept}
                newDeptName={newDeptName}
                setNewDeptName={setNewDeptName}
                loading={deptLoading}
                error={error}
            />

            <CreateUserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSubmit={handleCreateUser}
                newUser={newUser}
                setNewUser={setNewUser}
                departments={departments}
                loading={userLoading}
                error={error}
            />
        </div>
    );
}
