'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn, logDev } from "@/lib/utils";
import { fetchCountUsers, fetchCountServices, fetchCountJobs } from '@/lib/admin/dashboard'
import { Button } from "@/components/ui/button";
import AdminLayout from '@/components/admin/AdminLayout';
interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalServices: number;
    activeServices: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalPromotions: number;
    activePromotions: number;
}

// Định nghĩa kiểu dữ liệu cho hoạt động gần đây
interface RecentActivity {
    id: string;
    type: 'new_user' | 'new_booking' | 'service_update' | 'promo_created';
    description: string;
    timestamp: string; // ISO string
}

// Dữ liệu giả định cho Dashboard Stats
const mockStats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalPromotions: 20,
    activePromotions: 12,
};

// Dữ liệu giả định cho Hoạt động gần đây
const mockRecentActivities: RecentActivity[] = [
    { id: 'act-001', type: 'new_booking', description: 'Đơn đặt lịch #bkg-006 mới cho dịch vụ "Vệ sinh máy lạnh".', timestamp: '2025-07-12T10:30:00Z' },
    { id: 'act-002', type: 'new_user', description: 'Người dùng mới: Nguyễn Thị Hoa đã đăng ký.', timestamp: '2025-07-12T09:15:00Z' },
    { id: 'act-003', type: 'service_update', description: 'Cập nhật dịch vụ "Dọn dẹp nhà cửa": thay đổi mô tả.', timestamp: '2025-07-11T16:00:00Z' },
    { id: 'act-004', type: 'promo_created', description: 'Mã khuyến mãi mới "SUMMER20" đã được tạo.', timestamp: '2025-07-11T14:45:00Z' },
    { id: 'act-005', type: 'new_booking', description: 'Đơn đặt lịch #bkg-005 được xác nhận.', timestamp: '2025-07-11T11:20:00Z' },
    { id: 'act-006', type: 'new_user', description: 'Người dùng mới: Trần Minh Khôi đã đăng ký.', timestamp: '2025-07-10T18:00:00Z' },
];

// --- DashboardCard Component ---
interface DashboardCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: string; // Font Awesome class
    colorClass: string; // Tailwind color class for icon background
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon, colorClass }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border border-gray-200">
            <div className={cn("flex-shrink-0 p-3 rounded-full text-white", colorClass)}>
                <i className={cn("text-2xl", icon)}></i>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
        </div>
    );
};

// --- RecentActivityItem Component ---
interface RecentActivityItemProps {
    activity: RecentActivity;
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({ activity }) => {
    const timeAgo = useMemo(() => {
        const date = new Date(activity.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Vừa xong';
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    }, [activity.timestamp]);

    const getIconAndColor = (type: RecentActivity['type']) => {
        switch (type) {
            case 'new_user':
                return { icon: 'fas fa-user-plus', color: 'text-blue-500' };
            case 'new_booking':
                return { icon: 'fas fa-calendar-check', color: 'text-teal-500' };
            case 'service_update':
                return { icon: 'fas fa-tools', color: 'text-yellow-500' };
            case 'promo_created':
                return { icon: 'fas fa-gift', color: 'text-purple-500' };
            default:
                return { icon: 'fas fa-info-circle', color: 'text-gray-500' };
        }
    };

    const { icon, color } = getIconAndColor(activity.type);

    return (
        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className={cn("flex-shrink-0", color)}>
                <i className={cn("text-xl", icon)}></i>
            </div>
            <div className="flex-grow">
                <p className="text-gray-800 text-sm">{activity.description}</p>
                <p className="text-gray-500 text-xs mt-1">{timeAgo}</p>
            </div>
        </div>
    );
};


// --- Main Admin Dashboard Page Component ---
const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>(mockStats);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(mockRecentActivities);

    useEffect(() => {
        const fetchData = setTimeout(() => {
            // setStats(fetchedStats);
            // setRecentActivities(fetchedActivities);
            logDev("Dashboard data loaded.");
        }, 500); // Giả lập tải 0.5 giây

        return () => clearTimeout(fetchData);
    }, []);

    useEffect(() => {
        async function fetchStats() {
            try {
                const userStats = await fetchCountUsers();
                const serviceStats = await fetchCountServices();
                const jobStats = await fetchCountJobs();

                logDev("User Stats:", userStats);
                logDev("Service Stats:", serviceStats);
                logDev("Job Stats:", jobStats);

                setStats(prev => ({
                    ...prev,
                    totalUsers: userStats.totalUsers,
                    activeUsers: userStats.activeUsers,
                    totalServices: serviceStats.totalServices,
                    activeServices: serviceStats.activeServices,
                    totalBookings: jobStats.totalJobs,
                    pendingBookings: jobStats.pendingJobs,
                    confirmedBookings: jobStats.inProgressJobs,
                    completedBookings: jobStats.completedJobs,
                    cancelledBookings: jobStats.cancelledJobs,
                }));
            } catch (error) {
                // Xử lý lỗi nếu cần
            }
        }
        fetchStats();
    }, []);

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto w-full">
                {/* Tiêu đề trang */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Tổng quan Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Các số liệu và hoạt động quan trọng của hệ thống.</p>
                </header>

                {/* Thống kê chung */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardCard
                        title="Tổng số người dùng"
                        value={stats.totalUsers.toLocaleString()}
                        description={`(${stats.activeUsers.toLocaleString()} hoạt động)`}
                        icon="fas fa-users"
                        colorClass="bg-blue-500"
                    />
                    <DashboardCard
                        title="Tổng số dịch vụ"
                        value={stats.totalServices.toLocaleString()}
                        description={`(${stats.activeServices.toLocaleString()} đang hoạt động)`}
                        icon="fas fa-tools"
                        colorClass="bg-teal-500"
                    />
                    <DashboardCard
                        title="Tổng số đặt lịch"
                        value={stats.totalBookings.toLocaleString()}
                        description={`${stats.pendingBookings} chờ, ${stats.confirmedBookings} xác nhận`}
                        icon="fas fa-calendar-alt"
                        colorClass="bg-purple-500"
                    />
                    <DashboardCard
                        title="Tổng khuyến mãi"
                        value={stats.totalPromotions.toLocaleString()}
                        description={`(${stats.activePromotions.toLocaleString()} đang hoạt động)`}
                        icon="fas fa-gift"
                        colorClass="bg-orange-500"
                    />
                </div>

                {/* Chi tiết đặt lịch theo trạng thái */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Trạng thái đặt lịch</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DashboardCard
                            title="Đang chờ"
                            value={stats.pendingBookings.toLocaleString()}
                            icon="fas fa-hourglass-half"
                            colorClass="bg-yellow-500"
                        />
                        <DashboardCard
                            title="Đã xác nhận"
                            value={stats.confirmedBookings.toLocaleString()}
                            icon="fas fa-check-circle"
                            colorClass="bg-blue-500"
                        />
                        <DashboardCard
                            title="Đã hoàn thành"
                            value={stats.completedBookings.toLocaleString()}
                            icon="fas fa-clipboard-check"
                            colorClass="bg-green-500"
                        />
                        <DashboardCard
                            title="Đã hủy"
                            value={stats.cancelledBookings.toLocaleString()}
                            icon="fas fa-times-circle"
                            colorClass="bg-red-500"
                        />
                    </div>
                </div>

                {/* Hoạt động gần đây */}
                {/* <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Hoạt động gần đây</h2> */}
                {/* <div className="space-y-3">
                        {recentActivities.length > 0 ? (
                            recentActivities.map(activity => (
                                <RecentActivityItem key={activity.id} activity={activity} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Không có hoạt động gần đây.</p>
                        )}
                    </div> */}
                {/* Nút xem tất cả hoạt động (tùy chọn) */}
                {/* <Button variant="link" className="mt-4 text-teal-600">Xem tất cả hoạt động</Button> */}
                {/* </div> */}
            </div>
            {/* Global styles for Font Awesome */}
            <style jsx global>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
            `}</style>
        </AdminLayout>
    );
};

export default AdminDashboardPage;