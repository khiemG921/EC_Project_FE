'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

interface MenuItem {
    icon: string;
    label: string;
    href: string;
    description: string;
}

interface AdminSidebarProps {
    onLogout?: () => void;
}

const menuItems: MenuItem[] = [
    {
        icon: 'fas fa-tachometer-alt',
        label: 'Dashboard',
        href: '/admin',
        description: 'Tổng quan hệ thống'
    },
    {
        icon: 'fas fa-concierge-bell',
        label: 'Quản lý Dịch vụ',
        href: '/admin/services',
        description: 'Thêm, sửa, xóa dịch vụ'
    },
    {
        icon: 'fas fa-users',
        label: 'Quản lý Khách hàng',
        href: '/admin/customers',
        description: 'Thông tin khách hàng'
    },
    {
        icon: 'fas fa-calendar-check',
        label: 'Quản lý Đặt lịch',
        href: '/admin/bookings',
        description: 'Đơn đặt dịch vụ'
    },
    {
        icon: 'fas fa-newspaper',
        label: 'Quản lý Tin tức',
        href: '/admin/news',
        description: 'Bài viết và tin tức'
    },
    {
        icon: 'fas fa-gift',
        label: 'Quản lý Voucher',
        href: '/admin/vouchers',
        description: 'Mã giảm giá và khuyến mãi'
    },
    // {
    //     icon: 'fas fa-chart-bar',
    //     label: 'Báo cáo',
    //     href: '/admin/reports',
    //     description: 'Thống kê và báo cáo'
    // },
    // {
    //     icon: 'fas fa-cog',
    //     label: 'Cài đặt',
    //     href: '/admin/settings',
    //     description: 'Cấu hình hệ thống'
    // },
    {
        // Duyệt tasker
        icon: 'fas fa-user-check',
        label: 'Duyệt Tasker',
        href: '/admin/tasker-review',
        description: 'Xem và duyệt ứng viên tasker'
    },
    {
        icon: 'fas fa-robot',
        label: 'Crawler',
        href: '/admin/crawler',
        description: 'Cào tin tức tự động, xuất CSV'
    }
];

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useUser();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <div className={cn(
            "h-screen bg-slate-800 text-white transition-all duration-300 flex flex-col shadow-xl",
            collapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div>
                            <h1 className="text-xl font-bold text-white">🔧 Admin Panel</h1>
                            <p className="text-slate-300 text-sm">CleanNow</p>
                        </div>
                    )}
                    <Button
                        onClick={() => setCollapsed(!collapsed)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                        <i className={cn("fas", collapsed ? "fa-chevron-right" : "fa-chevron-left")}></i>
                    </Button>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center p-3 rounded-lg transition-colors duration-200",
                                "hover:bg-slate-700 group",
                                isActive ? "bg-teal-600 text-white" : "text-slate-300"
                            )}
                        >
                            <div className="flex items-center min-w-0 flex-1">
                                <i className={cn(
                                    item.icon,
                                    "text-lg",
                                    collapsed ? "mx-auto" : "mr-3",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                )}></i>
                                
                                {!collapsed && (
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm truncate">
                                            {item.label}
                                        </div>
                                        <div className="text-xs text-slate-400 group-hover:text-slate-300 truncate">
                                            {item.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-700">
                {!collapsed && (
                    <div className="mb-3">
                        <div className="text-sm font-medium text-white truncate">
                            👤 {user?.email || '—'}
                        </div>
                        <div className="text-xs text-slate-400">
                            Administrator
                        </div>
                    </div>
                )}
                
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className={cn(
                        "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500",
                        collapsed ? "w-8 h-8 p-0" : "w-full"
                    )}
                >
                    <i className="fas fa-sign-out-alt"></i>
                    {!collapsed && <span className="ml-2">Đăng xuất</span>}
                </Button>
            </div>

            {/* Font Awesome CSS */}
            <style jsx global>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
            `}</style>
        </div>
    );
}
