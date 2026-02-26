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
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 lg:hidden"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-900 flex items-center justify-center text-white">
                        <span className="text-xs font-bold"></span>
                    </div>
                    <span className="font-semibold text-base hidden sm:inline-block">Workflow <span className="text-orange-600">Manager</span></span>
                </div>
            </div>

            <div className="flex items-center gap-4 relative">
                <div
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 border border-gray-200 cursor-pointer lg:cursor-default"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                            {user.user_metadata?.email}
                        </p>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                            {user.user_metadata?.role === 'HEAD' ? 'Head' : 'Employee'} • {user.user_metadata?.full_name || 'General'}
                        </p>
                    </div>
                    <div className="w-7 h-7 bg-orange-100 flex items-center justify-center text-orange-600">
                        <UserIcon size={14} />
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform sm:hidden ${showUserMenu ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                    {showUserMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-lg p-4 z-50 sm:hidden"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-10 h-10 bg-orange-100 flex items-center justify-center text-orange-600 rounded-full shrink-0">
                                        <UserIcon size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {user.user_metadata?.full_name || 'System User'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                            {user.user_metadata?.role === 'HEAD' ? 'Department Head' : 'Employee'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Mail size={14} className="text-slate-400" />
                                        <span className="text-xs truncate">{user.user_metadata?.email || user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Shield size={14} className="text-slate-400" />
                                        <span className="text-xs">{user.user_metadata?.role === 'HEAD' ? 'Premium Access' : 'Standard Access'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onLogout();
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-colors"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

                <button
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all hidden sm:block"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
}
