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
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export default function App() {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
    const [highPriorityCount, setHighPriorityCount] = useState(0);
    const [externalTaskCount, setExternalTaskCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [cancelledCount, setCancelledCount] = useState(0);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'audit' | 'users' | 'approved' | 'cancelled'>('dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
            // Employees have no organization view - redirect to their department
            if (user.user_metadata?.role === 'EMPLOYEE' && !selectedDeptId && currentView === 'dashboard') {
                setSelectedDeptId(user.user_metadata?.department_id);
            }
        }
    }, [user]);

    // Dynamic Tab Titles
    useEffect(() => {
        if (!user) {
            document.title = 'Login | Workflow Manager';
            return;
        }

        if (selectedTaskId) {
            document.title = 'Task Details | Workflow Manager';
            return;
        }

        const viewTitles: Record<string, string> = {
            dashboard: 'Dashboard',
            approved: 'Approved History',
            cancelled: 'Cancelled Log',
            audit: 'System Audit',
            users: 'User Management'
        };

        document.title = `${viewTitles[currentView] || 'Overview'} | Workflow Manager`;
    }, [user, currentView, selectedTaskId]);

    const fetchStats = async () => {
        const userRole = user?.user_metadata?.role;
        const userDeptId = user?.user_metadata?.department_id;

        // 1. Fetch Departments based on role
        let deptQuery = supabase.from('departments').select('*').order('name');
        if (userRole !== 'SUPER_ADMIN' && userDeptId) {
            deptQuery = deptQuery.eq('id', userDeptId);
        }
        const { data: depts } = await deptQuery;
        if (depts) setDepartments(depts);

        // 2. Fetch Tasks for statistics based on role
        // For 'Organization View' of history, we fetch all approved/cancelled for counts
        let taskQuery = supabase.from('tasks').select('id, department_id, priority, creator_id, assignee_id, status');

        if (userRole === 'HEAD') {
            // Include all approved/cancelled tasks for organization metrics, but only active tasks for their department
            taskQuery = taskQuery.or(`department_id.eq.${userDeptId},creator_id.eq.${user.id},status.eq.APPROVED,status.eq.CANCELLED`);
        } else if (userRole === 'EMPLOYEE') {
            taskQuery = taskQuery.or(`assignee_id.eq.${user.id},status.eq.APPROVED,status.eq.CANCELLED`);
        }
        // SUPER_ADMIN sees all

        const { data: tasks } = await taskQuery;
        if (tasks) {
            const counts: Record<string, number> = {};
            let highCount = 0;
            let extCount = 0;
            let appCount = 0;
            let canCount = 0;

            tasks.forEach((t: any) => {
                // Count for department sidebar
                if (t.department_id) {
                    counts[t.department_id] = (counts[t.department_id] || 0) + 1;
                }

                // General metrics
                if (t.priority === 'HIGH' && t.status !== 'APPROVED' && t.status !== 'CANCELLED') highCount++;
                if (t.status === 'APPROVED') appCount++;
                if (t.status === 'CANCELLED') canCount++;

                // External tasks for HEADs: created by me but NOT in my department
                if (userRole === 'HEAD' && t.creator_id === user.id && t.department_id !== userDeptId) {
                    extCount++;
                }
            });

            setTaskCounts(counts);
            setHighPriorityCount(highCount);
            setExternalTaskCount(extCount);
            setApprovedCount(appCount);
            setCancelledCount(canCount);
        }
    };

    const handleLogin = (userData: any) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setShowLogoutConfirm(false);
        setIsSidebarOpen(false);
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
                onLogout={() => setShowLogoutConfirm(true)}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <Sidebar
                departments={departments}
                taskCounts={taskCounts}
                selectedDeptId={selectedDeptId}
                onDeptSelect={(id) => {
                    setSelectedDeptId(id);
                    setIsSidebarOpen(false);
                    setSelectedTaskId(null); // Return to dashboard view for the selected department
                }}
                highPriorityCount={highPriorityCount}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userRole={user.user_metadata?.role}
                externalTaskCount={externalTaskCount}
                approvedCount={approvedCount}
                cancelledCount={cancelledCount}
                currentView={currentView}
                onViewChange={(view: 'dashboard' | 'audit' | 'users' | 'approved' | 'cancelled') => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                    setSelectedTaskId(null); // Exit task details when switching views
                    if (view !== 'dashboard' && view !== 'approved' && view !== 'cancelled') setSelectedDeptId(null);
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
                            key={currentView}
                            onTaskClick={(id) => setSelectedTaskId(id)}
                            currentUser={user}
                            filterDeptId={selectedDeptId}
                            onDeptSelect={setSelectedDeptId}
                            onRefreshStats={fetchStats}
                            currentView={currentView}
                        />
                    )}
                </div>
            </main>
            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Sign Out"
                description="Are you sure you want to sign out? You will need to login again to access your tasks."
                confirmText="Sign Out"
                variant="danger"
            />
        </div>
    );
}
