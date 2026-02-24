import { useState, useEffect } from 'react';
import LoginPage from '../pages/loginPage';
import RegisterPage from '../pages/registerPage';
import Header from '../components/Header';
import DashboardPage from '../pages/dashboard';
import { supabase } from '../lib/supabaseClient';

export default function App() {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');

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

    const handleLogin = (userData: any) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAuthView('login');
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
                <DashboardPage />
            </main>
        </div>
    );
}
