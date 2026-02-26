import { useState, useEffect } from 'react';
import LoginPage from '../pages/loginPage';
import RegisterPage from '../pages/registerPage';
import Header from '../components/Header';
import DashboardPage from '../pages/dashboard';
import TaskDetailsPage from '../pages/taskDetails';
import AuditLogsPage from '../pages/admin/AuditLogs';
import UserManagementPage from '../pages/admin/UserManagement';
import { supabase } from '../lib/supabaseClient';

import { Sidebar } from '../components/Sidebar';

export default function App() {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
    const [highPriorityCount, setHighPriorityCount] = useState(0);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'audit' | 'users'>('dashboard');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        const { data: depts } = await supabase.from('departments').select('*').order('name');
        if (depts) setDepartments(depts);

        const { data: tasks } = await supabase.from('tasks').select('id, department_id, priority');
        if (tasks) {
            const counts: Record<string, number> = {};
            let highCount = 0;

            tasks.forEach((t: any) => {
                if (t.department_id) {
                    counts[t.department_id] = (counts[t.department_id] || 0) + 1;
                }
                if (t.priority === 'HIGH') highCount++;
            });

            setTaskCounts(counts);
            setHighPriorityCount(highCount);
        }
    };

    const handleLogin = (userData: any) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAuthView('login');
        setSelectedTaskId(null);
        setCurrentView('dashboard');
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
            <Header
                user={user}
                onLogout={handleLogout}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <Sidebar
                departments={departments}
                taskCounts={taskCounts}
                selectedDeptId={selectedDeptId}
                onDeptSelect={(id) => {
                    setSelectedDeptId(id);
                    setIsSidebarOpen(false);
                }}
                highPriorityCount={highPriorityCount}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userRole={user.user_metadata?.role}
                currentView={currentView}
                onViewChange={(view) => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                    if (view === 'audit') setSelectedTaskId(null);
                }}
            />

            <main className="lg:ml-72 pt-16 min-h-screen">
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
                    {currentView === 'users' ? (
                        <UserManagementPage currentUser={user} />
                    ) : currentView === 'audit' ? (
                        <AuditLogsPage />
                    ) : selectedTaskId ? (
                        <TaskDetailsPage
                            taskId={selectedTaskId}
                            onBack={() => setSelectedTaskId(null)}
                            currentUser={user}
                        />
                    ) : (
                        <DashboardPage
                            onTaskClick={(id) => setSelectedTaskId(id)}
                            currentUser={user}
                            filterDeptId={selectedDeptId}
                            onRefreshStats={fetchStats}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
