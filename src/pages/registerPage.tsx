import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User as UserIcon, Building2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Department } from '../types';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
    onRegisterSuccess: (user: any) => void;
}

export default function RegisterPage({ onSwitchToLogin, onRegisterSuccess }: RegisterPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingDepts, setFetchingDepts] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const { data, error } = await supabase
                    .from('departments')
                    .select('*')
                    .order('name');

                if (error) throw error;
                if (data) setDepartments(data);
            } catch (err) {
                console.error('Error fetching departments:', err);
            } finally {
                setFetchingDepts(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!departmentId) {
            setError('Please select a department');
            setLoading(false);
            return;
        }

        // Validate  Email
        if (!email.toLowerCase().endsWith('@fochant.lk')) {
            setError('Please use your organization email (@fochant.lk)');
            setLoading(false);
            return;
        }

        // 2. Assign Role by Email
        const supervisorEmails = ['it_head@fochant.lk', 'design_head@fochant.lk'];
        const role = supervisorEmails.includes(email.toLowerCase()) ? 'HEAD' : 'EMPLOYEE';

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        department_id: departmentId,
                        role: role
                    }
                }
            });

            if (authError) {
                setError(authError.message);
            } else if (data.user) {
                if (data.session) {
                    onRegisterSuccess(data.user);
                } else {
                    setError('Registration successful! Please check your email for confirmation.');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="max-w-md w-full"
            >
                <div className="bg-white shadow p-8 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={onSwitchToLogin}
                            className="p-1.5 -ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Create Account</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                                    placeholder="Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                                    placeholder="yourname@fochant.lk"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    required
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 appearance-none cursor-pointer text-sm"
                                    disabled={fetchingDepts}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center gap-2 p-3 text-sm border ${error.includes('successful') ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}
                            >
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || fetchingDepts}
                            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-2.5 transition-all flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account? <button onClick={onSwitchToLogin} className="font-medium text-orange-600 hover:underline">Sign In</button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
