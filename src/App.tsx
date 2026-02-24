import { useState, useEffect } from 'react';
import LoginPage from './pages/loginPage';
import DashboardPage from './pages/dashboardPage';
import { LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <LayoutDashboard size={22} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">Project <span className="text-blue-600">Portal</span></span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                {user.user_metadata?.role || 'User'} • {user.user_metadata?.department || 'General'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <UserIcon size={16} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto py-10 px-6">
        <DashboardPage />
      </main>
    </div>
  );
}
