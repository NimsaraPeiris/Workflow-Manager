import { useState } from 'react';
import { LogOut, User as UserIcon, Menu, Mail, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
    user: any;
    onLogout: () => void;
    onToggleSidebar: () => void;
}

export default function Header({ user, onLogout, onToggleSidebar }: HeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex justify-between items-center sticky top-0 z-50 transition-colors">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden rounded-xl transition-all active:scale-90"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-slate-950 dark:bg-orange-600 flex items-center justify-center text-white rounded-xl shadow-lg shadow-slate-200 dark:shadow-none transition-transform hover:rotate-12">
                        <span className="text-sm font-black italic">W</span>
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="font-black text-sm text-slate-900 dark:text-white tracking-widest uppercase">Workflow</span>
                        <span className="text-[10px] font-black text-orange-600 tracking-[0.3em] uppercase opacity-80">Workspace</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative">
                <div
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800/50 p-1 pr-3 border border-gray-200 dark:border-slate-700 cursor-pointer rounded-2xl transition-all hover:border-slate-300 dark:hover:border-slate-600 active:scale-95 shadow-sm"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 flex items-center justify-center text-white rounded-xl shadow-inner">
                        <UserIcon size={16} />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-[9px] text-gray-500 dark:text-slate-500 uppercase tracking-widest font-black leading-none">
                            {user.role || 'User'}
                        </p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                            {user.full_name?.split(' ')[0] || 'System'}
                        </p>
                    </div>
                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                    {showUserMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-3 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl p-5 z-50 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

                            <div className="relative space-y-5">
                                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-orange-500 rounded-2xl shrink-0 border border-slate-200 dark:border-slate-700">
                                        <UserIcon size={24} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-base font-black text-slate-900 dark:text-white truncate leading-tight">
                                            {user.full_name || 'System User'}
                                        </p>
                                        <p className="text-[10px] text-orange-600 dark:text-orange-500 font-black uppercase tracking-[0.2em]">
                                            {user.role || 'Operator'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 px-1">
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg"><Mail size={12} /></div>
                                        <span className="text-xs font-bold truncate">{user.user_metadata?.email || user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg"><Shield size={12} /></div>
                                        <span className="text-xs font-bold tracking-tight">Active Session Security</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onLogout();
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full mt-2 flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-orange-600 text-white rounded-2xl text-[10px] font-black tracking-widest hover:bg-slate-800 dark:hover:bg-orange-700 transition-all shadow-xl shadow-slate-200 dark:shadow-orange-900/20 active:scale-95"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                <button
                    onClick={onLogout}
                    className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all hidden sm:block rounded-xl border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
}
