import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoginPage from '../pages/loginPage';
import RegisterPage from '../pages/registerPage';
import Header from '../components/Header';
import DashboardPage from '../pages/dashboard';
import TaskDetailsPage from '../pages/taskDetails';
import AuditLogsPage from '../pages/admin/AuditLogs';
import TeamsManagementPage from '../pages/admin/TeamsManagement';
import UserManagementPage from '../pages/admin/UserManagement';
import { supabase } from '../lib/supabaseClient';
import { Sidebar } from '../components/Sidebar';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { ThemeProvider } from '../lib/ThemeContext';
import { hasPermission } from '../lib/permissions';

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

function AppContent() {
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
    const [currentView, setCurrentView] = useState<'dashboard' | 'audit' | 'users' | 'teams' | 'approved' | 'cancelled'>('dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);

    const loadUserData = async (authUser: any, isMounted: boolean) => {
        try {
            if (!authUser) {
                if (user !== null) setUser(null);
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            let activeProfile = profile;

            if (!profile && !error) {
                // If profile is missing, attempt to provision it from auth metadata
                console.log('Profile missing for user, attempting auto-provisioning...');
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: authUser.id,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown User',
                        department_id: authUser.user_metadata?.department_id || null,
                        role: authUser.user_metadata?.role || 'EMPLOYEE',
                        permissions: authUser.user_metadata?.permissions || []
                    }])
                    .select()
                    .maybeSingle();

                if (insertError) {
                    console.error('Auto-provisioning failed:', insertError);
                } else {
                    activeProfile = newProfile;
                    console.log('Successfully provisioned profile for', authUser.id);
                }
            }

            if (error && error.code !== 'PGRST116') {
                console.error('Core profile fetch failed:', error);
            }

            // Build best-available user profile
            const combinedUser = {
                ...authUser,
                ...activeProfile,
                // Fallback for role/dept if profile still doesn't exist (e.g. insert failed)
                role: activeProfile?.role || authUser.user_metadata?.role || 'EMPLOYEE',
                department_id: activeProfile?.department_id || authUser.user_metadata?.department_id,
                full_name: activeProfile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                permissions: Array.isArray(activeProfile?.permissions) ? activeProfile.permissions :
                    Array.isArray(authUser?.user_metadata?.permissions) ? authUser.user_metadata.permissions : []
            };

            // Only update if critical fields have changed to avoid loops
            const hasChanged = !user ||
                user.id !== combinedUser.id ||
                user.role !== combinedUser.role ||
                user.department_id !== combinedUser.department_id ||
                JSON.stringify(user.permissions) !== JSON.stringify(combinedUser.permissions);

            if (hasChanged) {
                setUser(combinedUser);
            }
        } catch (err) {
            console.error('Fatal error in loadUserData:', err);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        let authSubscription: any = null;

        // Emergency timeout to clear loading screen even if Supabase hangs
        const timeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("Auth initialization timed out, forcing loading screen off.");
                setLoading(false);
                setLoadingError("Initialization taking longer than expected. System fallback engaged.");
            }
        }, 5000);

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (isMounted) {
                    await loadUserData(session?.user ?? null, isMounted);
                }

                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                    if (isMounted) {
                        await loadUserData(session?.user ?? null, isMounted);
                    }
                });
                authSubscription = subscription;
            } catch (err) {
                console.error("Auth init fatal error:", err);
                if (isMounted) {
                    setLoading(false);
                    setLoadingError("Critical system error during startup.");
                }
            }
        };

        if (isMounted) init();

        return () => {
            isMounted = false;
            clearTimeout(timeout);
            if (authSubscription) authSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (user && !loading) {
            fetchStats();
            // Redirect based on permissions if needed
            if (!hasPermission(user, 'task:view') && !selectedDeptId && currentView === 'dashboard') {
                const deptId = user.department_id || user.user_metadata?.department_id;
                if (deptId) setSelectedDeptId(deptId);
            }
        }
    }, [user?.id, user?.permissions?.length, user?.role, user?.department_id, loading]);

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
            users: 'Departments & Permissions',
            teams: 'Teams'
        };

        document.title = `${viewTitles[currentView] || 'Overview'} | Workflow Manager`;
    }, [user, currentView, selectedTaskId]);

    const fetchStats = async () => {
        if (!user) return;
        try {
            const canViewAll = hasPermission(user, 'task:view');
            const canViewDept = hasPermission(user, 'task:view_dept');
            const userDeptId = user?.department_id || user?.user_metadata?.department_id;

            // 1. Fetch Departments based on permissions
            let deptQuery = supabase.from('departments').select('*').order('name');
            if (!canViewAll && userDeptId) {
                deptQuery = deptQuery.eq('id', userDeptId);
            }
            const { data: depts } = await deptQuery;
            if (depts) setDepartments(depts);

            // 2. Fetch Tasks for statistics based on permissions
            let taskQuery = supabase.from('tasks').select('id, department_id, priority, creator_id, assignee_id, status');

            if (canViewAll) {
                // No filter needed, fetch all for global stats
            } else if (canViewDept && userDeptId) {
                // View my department tasks + tasks I created + history
                taskQuery = taskQuery.or(`department_id.eq.${userDeptId},creator_id.eq.${user.id},status.eq.APPROVED,status.eq.CANCELLED`);
            } else if (user?.id) {
                // Standard employee: tasks assigned to me + history
                taskQuery = taskQuery.or(`assignee_id.eq.${user.id},status.eq.APPROVED,status.eq.CANCELLED`);
            } else {
                return;
            }

            const { data: tasks } = await taskQuery;
            if (tasks) {
                const counts: Record<string, number> = {};
                let highCount = 0;
                let extCount = 0;
                let appCount = 0;
                let canCount = 0;

                tasks.forEach((t: any) => {
                    if (t.department_id) {
                        counts[t.department_id] = (counts[t.department_id] || 0) + 1;
                    }

                    if (t.priority === 'HIGH' && t.status !== 'APPROVED' && t.status !== 'CANCELLED') highCount++;
                    if (t.status === 'APPROVED') appCount++;
                    if (t.status === 'CANCELLED') canCount++;

                    // External tasks: created by me but NOT in my department (only relevant for those without global view)
                    if (!canViewAll && t.creator_id === user.id && t.department_id !== userDeptId) {
                        extCount++;
                    }
                });

                setTaskCounts(counts);
                setHighPriorityCount(highCount);
                setExternalTaskCount(extCount);
                setApprovedCount(appCount);
                setCancelledCount(canCount);
            }
        } catch (err) {
            console.error("Stats fetching failed:", err);
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-6">
                <div className="animate-pulse flex flex-col items-center gap-6">
                    <div className="w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-none rotate-45 shadow-2xl"></div>
                    <div className="h-1 w-32 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                {loadingError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-12 text-center space-y-4"
                    >
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{loadingError}</p>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                sessionStorage.clear();
                                window.location.reload();
                            }}
                            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                        >
                            Reset System Access
                        </button>
                    </motion.div>
                )}
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-orange-500/20">
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
                externalTaskCount={externalTaskCount}
                approvedCount={approvedCount}
                cancelledCount={cancelledCount}
                currentView={currentView}
                onViewChange={(view: 'dashboard' | 'audit' | 'users' | 'teams' | 'approved' | 'cancelled') => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                    setSelectedTaskId(null); // Exit task details when switching views
                    if (view !== 'dashboard' && view !== 'approved' && view !== 'cancelled') setSelectedDeptId(null);
                }}
            />

            <main className="lg:ml-72 pt-20 min-h-screen overflow-x-hidden">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-8 lg:px-12">
                    {currentView === 'users' ? (
                        <UserManagementPage currentUser={user} />
                    ) : currentView === 'teams' ? (
                        <TeamsManagementPage currentUser={user} />
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
