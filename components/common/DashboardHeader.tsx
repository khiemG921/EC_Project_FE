'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    LogOut,
    User,
    Heart,
    History,
    Settings,
    LayoutGrid,
    ChevronDown,
    Tag,
    Bookmark,
} from 'lucide-react';

import RoleSwitcher from './RoleSwitcher';
import { useRouter } from 'next/navigation';

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

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    user,
    onLogout,
    activeRole,
    onRoleChange,
    showRoleSwitcher,
}) => {
    const router = useRouter();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';

    const menuItems = [
        { label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
        { label: 'Hồ sơ của tôi', icon: User, href: '/profile' },
        { label: 'Lịch sử đặt', icon: History, href: '/history' },
        { label: 'Yêu thích', icon: Heart, href: '/favorite' },
        { label: 'Xem sau', icon: Bookmark, href: '/watchlist' },
        { label: 'Ưu đãi', icon: Tag, href: '/vouchers' },
        { label: 'Cài đặt', icon: Settings, href: '/settings' },
    ];

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a
                    href="/"
                    className="text-3xl font-bold text-teal-600 cursor-pointer select-none"
                >
                    clean<span className="text-emerald-500">Now</span>
                </a>
                <div className="flex items-center gap-4">
                    {/* Show "Quay về Dashboard" nếu không trong trang dashboard */}
                    {pathname !== '/dashboard' && (
                        <a
                            href="/dashboard"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                        >
                            <LayoutGrid size={16} /> Quay về Dashboard
                        </a>
                    )}
                    {showRoleSwitcher && (
                        <RoleSwitcher
                            roles={user.roles}
                            activeRole={activeRole}
                            onRoleChange={(role) => {
                                onRoleChange(role);
                                // Chuyển trang theo role
                                if (role === 'tasker') {
                                    router.push('/tasker/find-job');
                                } else {
                                    router.push('/dashboard');
                                }
                            }}
                        />
                    )}
                    <button className="relative text-slate-500 hover:text-teal-600 transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 hover:bg-slate-50 rounded-lg p-1 transition-colors"
                        >
                            <img
                                src={
                                    user.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        user.name || 'User'
                                    )}&background=14b8a6&color=fff`
                                }
                                alt="User Avatar"
                                className="w-9 h-9 rounded-full object-cover border-2 border-teal-400"
                            />
                            <ChevronDown size={16} className="text-slate-400" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl z-50 border border-slate-100 animate-fade-in-down">
                                <div className="p-4 border-b border-slate-100">
                                    <p className="font-bold text-slate-800 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-slate-500 truncate">
                                        {user.email}
                                    </p>
                                    <div className="mt-1">
                                        <span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                                            {user.roles?.includes('admin')
                                                ? 'Admin'
                                                : user.roles?.includes('tasker')
                                                ? 'Tasker'
                                                : 'Khách hàng'}
                                        </span>
                                    </div>
                                </div>
                                <nav className="py-2">
                                    {[
                                        ...menuItems,
                                        ...(user.roles?.includes('tasker')
                                            ? [
                                                  {
                                                      label: 'Nhận việc',
                                                      icon: LayoutGrid,
                                                      href: '/tasker/find-job',
                                                  },
                                              ]
                                            : []),
                                    ].map((item) => (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <item.icon size={18} />
                                            <span>{item.label}</span>
                                        </a>
                                    ))}
                                </nav>
                                <div className="p-2 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onLogout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
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
