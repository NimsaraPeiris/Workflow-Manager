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
        <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50 transition-colors">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden rounded-none transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-900 dark:bg-orange-600 flex items-center justify-center text-white rounded-none ">
                        <span className="text-xs font-bold">W</span>
                    </div>
                    <span className="font-bold text-base hidden sm:inline-block text-slate-900 dark:text-white tracking-tight">Workflow <span className="text-orange-600">Manager</span></span>
                </div>
            </div>

            <div className="flex items-center gap-4 relative">
                <div
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 border border-gray-200 dark:border-slate-700 cursor-pointer lg:cursor-default rounded-none transition-all hover:border-slate-300 dark:hover:border-slate-600"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest font-black mt-0.5">
                            {user.user_metadata?.role || 'User'} • {user.user_metadata?.full_name || 'General'}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            {user.user_metadata?.email}
                        </p>
                    </div>
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400 rounded-none">
                        <UserIcon size={16} />
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform lg:hidden ${showUserMenu ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                    {showUserMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-none p-4 z-50 lg:hidden"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400 rounded-none shrink-0">
                                        <UserIcon size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {user.user_metadata?.full_name || 'System User'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                                            {user.user_metadata?.role || 'User'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Mail size={14} className="text-slate-400 dark:text-slate-500" />
                                        <span className="text-xs truncate">{user.user_metadata?.email || user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Shield size={14} className="text-slate-400 dark:text-slate-500" />
                                        <span className="text-xs">Organizational Identity</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onLogout();
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-orange-600 text-white rounded-none text-xs font-bold hover:bg-slate-800 dark:hover:bg-orange-700 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                <button
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all hidden sm:block rounded-none"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
}
