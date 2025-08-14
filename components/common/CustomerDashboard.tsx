// components/common/DashboardHeader.tsx
'use client';

import React, { useState } from 'react';
import { Bell, LogOut, User, History, Settings, LayoutGrid, Heart, Tag } from 'lucide-react';

// Giả sử bạn có component này
const RoleSwitcher = ({ roles, activeRole, onRoleChange }: any) => (
    <div className="flex items-center bg-slate-100 rounded-lg p-1 text-sm">
        {roles.map((role: string) => (
            <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`px-3 py-1 rounded-md transition-colors ${activeRole === role ? 'bg-white shadow-sm text-teal-600 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                {role === 'customer' ? 'Khách hàng' : 'Đối tác'}
            </button>
        ))}
    </div>
);


interface DashboardHeaderProps {
    user: {
        avatar: string;
        name: string;
        email: string;
        roles: string[];
    };
    onLogout: () => void;
    activeRole: string;
    onRoleChange: (role: string) => void;
    showRoleSwitcher: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout, activeRole, onRoleChange, showRoleSwitcher }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    // Lấy pathname một cách an toàn
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    const menuItems = [
        { label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
        { label: 'Hồ sơ của tôi', icon: User, href: '/profile' },
        { label: 'Lịch sử đặt', icon: History, href: '/history' },
        { label: 'Ưu đãi', icon: Tag, href: '/vouchers' },
        { label: 'Yêu thích', icon: Heart, href: '/favorites' },
        { label: 'Cài đặt', icon: Settings, href: '/settings' },
    ];

    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <a href="/" className="text-3xl font-bold text-teal-600 cursor-pointer select-none">clean<span className="text-emerald-500">Now</span></a>

                <div className="flex items-center gap-4">
                    {/* Nút quay về Dashboard, chỉ hiển thị khi không ở trang dashboard */}
                    {pathname !== '/dashboard' && (
                        <a href="/dashboard" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors">
                            <LayoutGrid size={16} />
                            <span>Quay về Dashboard</span>
                        </a>
                    )}

                    {showRoleSwitcher && (
                        <RoleSwitcher roles={user.roles} activeRole={activeRole} onRoleChange={onRoleChange} />
                    )}

                    <button className="relative text-slate-500 hover:text-teal-600">
                        <Bell size={22} />
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="relative">
                        <button onClick={() => setMenuOpen(!isMenuOpen)} className="flex items-center gap-2">
                            <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-teal-400" />
                        </button>

                        {isMenuOpen && (
                            <div
                                className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl z-50 border border-slate-100 animate-fade-in-down"
                                onMouseLeave={() => setMenuOpen(false)}
                            >
                                <div className="p-4 border-b border-slate-100">
                                    <div className="font-bold text-slate-800 truncate">{user.name}</div>
                                    <div className="text-sm text-slate-500 truncate">{user.email}</div>
                                </div>
                                <nav className="py-2">
                                    {menuItems.map(item => (
                                        <a key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-teal-50 hover:text-teal-600 ${pathname === item.href ? 'bg-teal-50 text-teal-600 font-semibold' : ''}`}>
                                            <item.icon size={18} />
                                            <span>{item.label}</span>
                                        </a>
                                    ))}
                                </nav>
                                <div className="p-2 border-t border-slate-100">
                                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg">
                                        <LogOut size={18} />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
