import { LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
    user: any;
    onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-900 flex items-center justify-center text-white">
                </div>
                <span className="font-semibold text-base">Workflow <span className="text-orange-600">Manager</span></span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 border border-gray-200">
                    <div className="text-right">
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
                </div>
                <button
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
}
