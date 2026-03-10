import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Calendar,
    ShieldCheck,
    UserCheck,
    PlusSquare
} from 'lucide-react';
import { PermissionGuard } from './auth/PermissionGuard';

interface BottomNavProps {
    currentView: string;
    onViewChange: (view: any) => void;
    onOpenCreateModal: () => void;
}

export const BottomNav = ({ currentView, onViewChange, onOpenCreateModal }: BottomNavProps) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Board' },
        { id: 'assigned', icon: UserCheck, label: 'My Tasks' },
        { id: 'create', icon: PlusSquare, label: 'New', isAction: true },
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
        { id: 'audit', icon: ShieldCheck, label: 'Audit', permission: 'audit:view' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 transition-all">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;

                    const content = (
                        <button
                            key={item.id}
                            onClick={() => item.isAction ? onOpenCreateModal() : onViewChange(item.id)}
                            className="relative flex flex-col items-center justify-center w-full h-full space-y-1 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-x-1 inset-y-1 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl"
                                    transition={{ type: "spring", duration: 0.5 }}
                                />
                            )}
                            <div className={`p-1 transition-all duration-300 ${isActive ? 'scale-110' : 'group-active:scale-90'}`}>
                                <Icon
                                    size={item.isAction ? 24 : 20}
                                    className={`${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 dark:text-slate-600'} ${item.isAction ? 'text-slate-800 dark:text-orange-400' : ''}`}
                                />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 dark:text-slate-600'}`}>
                                {item.label}
                            </span>
                        </button>
                    );

                    if (item.permission) {
                        return (
                            <PermissionGuard key={item.id} permission={item.permission as any}>
                                {content}
                            </PermissionGuard>
                        );
                    }

                    return content;
                })}
            </div>
        </div>
    );
};
