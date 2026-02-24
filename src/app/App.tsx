import { useState, useEffect } from 'react';
import LoginPage from '../pages/loginPage';
import RegisterPage from '../pages/registerPage';
import Header from '../components/Header';
import DashboardPage from '../pages/dashboard';
import TaskDetailsPage from '../pages/taskDetails';
import { supabase } from '../lib/supabaseClient';
import type { TaskStatus } from '../types';

export default function App() {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    useEffect(() => {
        const checkProfile = async (currentUser: any) => {
            if (!currentUser) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', currentUser.id)
                .maybeSingle();

            if (!profile) {
                console.log('Syncing missing profile for existing session...');
                await supabase.from('profiles').insert([{
                    id: currentUser.id,
                    full_name: currentUser.user_metadata?.full_name || '',
                    department_id: currentUser.user_metadata?.department_id,
                    role: currentUser.user_metadata?.role || 'USER'
                }]);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) checkProfile(currentUser);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) checkProfile(currentUser);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = (userData: any) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAuthView('login');
        setSelectedTaskId(null);
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'CREATED': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'ACCEPTED': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'SUBMITTED': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'CANCELLED': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200"></div>
                    <div className="h-3 w-20 bg-gray-200"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return authView === 'login' ? (
            <LoginPage
                onLogin={handleLogin}
                onSwitchToRegister={() => setAuthView('register')}
            />
        ) : (
            <RegisterPage
                onSwitchToLogin={() => setAuthView('login')}
                onRegisterSuccess={handleLogin}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Header user={user} onLogout={handleLogout} />

            <main className="max-w-5xl mx-auto py-8 px-6">
                {selectedTaskId ? (
                    <TaskDetailsPage
                        taskId={selectedTaskId}
                        onBack={() => setSelectedTaskId(null)}
                        getStatusColor={getStatusColor}
                    />
                ) : (
                    <DashboardPage onTaskClick={(id) => setSelectedTaskId(id)} />
                )}
            </main>
        </div>
    );
}
