// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Tag, Briefcase, ChevronRight, PlusCircle } from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import TaskerApplicationModal from '@/components/common/TaskerApplicationModal';
import {
    taskerApplicationApi,
    TaskerApplication,
} from '@/lib/taskerApplicationApi';
import { userAgent } from 'next/server';

const initialDashboardData = {
    walletBalance: 0,
    availableVouchers: 0,
    ongoingJobsCount: 0,
    upcomingJob: {} as any,
};

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    color: string;
    onClick?: () => void;
}

// Component thẻ thống kê (Ví, Ưu đãi, Đơn hàng)
const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    title,
    value,
    color,
    onClick,
}) => {
    const cardClasses = `bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all duration-300 ${
        onClick
            ? 'cursor-pointer hover:shadow-md hover:border-slate-200 hover:-translate-y-1'
            : ''
    }`;
    const iconClasses = `w-12 h-12 rounded-full flex items-center justify-center ${color}`;

    return (
        <div className={cardClasses} onClick={onClick}>
            <div className={iconClasses}>
                <Icon className="text-white" size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-slate-800 text-2xl font-bold">{value}</p>
            </div>
            {onClick && <ChevronRight className="ml-auto text-slate-400" />}
        </div>
    );
};

// --- COMPONENT CHÍNH CỦA TRANG DASHBOARD ---
const CustomerDashboardPage = () => {
    const { user, loading, logoutUser } = useUser();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState(initialDashboardData);
    const [isTaskerModalOpen, setIsTaskerModalOpen] = useState(false);
    const [applicationStatus, setApplicationStatus] =
        useState<TaskerApplication | null>(null);

    // Lấy reward points
    useEffect(() => {
        if (!user?.id) return;
        setDashboardData((prev) => ({
            ...prev,
            walletBalance: Number(user?.rewardPoints) || 0,
        }));
        
    }, [user?.id]);

    // Kiểm tra trạng thái đơn đăng ký khi component mount
    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (user && !user.roles.includes('tasker')) {
                try {
                    const result = await taskerApplicationApi.getMyStatus();
                    if (result.success && result.data) {
                        setApplicationStatus(result.data);
                    }
                } catch (error) {
                    console.error('Error checking application status:', error);
                }
            }
        };

        checkApplicationStatus();
    }, [user]);

    const handleTaskerApplicationSuccess = () => {
        // Refresh application status sau khi gửi đơn thành công
        taskerApplicationApi.getMyStatus().then((result) => {
            if (result.success && result.data) {
                setApplicationStatus(result.data);
            }
        });
    };

    const renderTaskerCTA = () => {
        // Nếu đã là tasker thì không hiện gì
        if (user?.roles.includes('tasker')) {
            return null;
        }

        // Nếu có đơn đăng ký
        if (applicationStatus) {
            const { status } = applicationStatus;

            if (status === 'pending') {
                return (
                    <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200 text-center">
                        <h3 className="text-lg font-bold text-amber-800">
                            Đơn đăng ký đang được xét duyệt
                        </h3>
                        <p className="text-amber-600 mt-1 mb-4 text-sm">
                            Đơn đăng ký của bạn đang được admin xem xét. Vui
                            lòng chờ thông báo.
                        </p>
                        <p className="text-xs text-amber-600">
                            Thời gian xét duyệt: 1-2 ngày làm việc
                        </p>
                    </div>
                );
            }

            if (status === 'rejected') {
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <h3 className="text-lg font-bold text-slate-800">
                            Đăng ký lại làm Đối tác?
                        </h3>
                        <p className="text-slate-500 mt-1 mb-4 text-sm">
                            Đơn trước đó chưa được chấp nhận. Bạn có thể thử
                            đăng ký lại.
                        </p>
                        <Button
                            onClick={() => setIsTaskerModalOpen(true)}
                            variant="outline"
                            className="w-full border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                        >
                            Đăng ký lại
                        </Button>
                    </div>
                );
            }
        }

        // Nếu chưa có đơn đăng ký nào
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <h3 className="text-lg font-bold text-slate-800">
                    Kiếm thêm thu nhập?
                </h3>
                <p className="text-slate-500 mt-1 mb-4 text-sm">
                    Tham gia đội ngũ đối tác được tin cậy của chúng tôi.
                </p>
                <Button
                    onClick={() => setIsTaskerModalOpen(true)}
                    variant="outline"
                    className="w-full border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                >
                    Đăng ký làm Đối tác
                </Button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">
                        Vui lòng đăng nhập để xem bảng điều khiển
                    </p>
                    <a
                        href="/auth/login"
                        className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
                    >
                        Đăng nhập
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader
                user={user}
                onLogout={logoutUser}
                activeRole="customer"
                onRoleChange={() => {}}
                showRoleSwitcher={user.roles.length > 1}
            />

            <main className="container mx-auto p-6 lg:p-8">
                {/* Welcome Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Chào mừng trở lại, {user.name.split(' ').pop()}!
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Đây là bảng điều khiển của bạn hôm nay.
                    </p>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={Wallet}
                        title="Ví CleanPay"
                        value={`${dashboardData.walletBalance.toLocaleString(
                            'en-US'
                        )} VNĐ`}
                        color="bg-green-500"
                    />
                    <StatCard
                        icon={Tag}
                        title="Ưu đãi"
                        value={`${dashboardData.availableVouchers} có sẵn`}
                        color="bg-orange-500"
                        onClick={() => router.push('/vouchers')}
                    />
                    <StatCard
                        icon={Briefcase}
                        title="Đơn hiện tại"
                        value={`${dashboardData.ongoingJobsCount} đơn`}
                        color="bg-purple-500"
                        onClick={() => router.push('/history')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Job */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-5">
                                Công việc sắp tới
                            </h3>
                            {dashboardData.upcomingJob ? (
                                <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            {
                                                dashboardData.upcomingJob
                                                    .serviceName
                                            }
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {new Date(
                                                dashboardData.upcomingJob.dateTime
                                            ).toLocaleDateString('vi-VN', {
                                                weekday: 'long',
                                                day: '2-digit',
                                                month: '2-digit',
                                            })}
                                            {' lúc '}
                                            {new Date(
                                                dashboardData.upcomingJob.dateTime
                                            ).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-800">
                                        {dashboardData.upcomingJob.status}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-4">
                                    Không có công việc nào sắp tới.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Booking CTA */}
                        <div className="bg-teal-500 text-white p-6 rounded-2xl shadow-lg shadow-teal-500/20 text-center">
                            <h3 className="text-xl font-bold">
                                Cần giúp việc ngay?
                            </h3>
                            <p className="opacity-80 mt-1 mb-4 text-sm">
                                Đặt dịch vụ mới chỉ với vài cú nhấp chuột.
                            </p>
                            <Button
                                onClick={() => router.push('/')}
                                className="w-full bg-white text-teal-600 hover:bg-teal-50 font-bold"
                            >
                                <PlusCircle size={18} className="mr-2" />
                                Đặt dịch vụ mới
                            </Button>
                        </div>

                        {/* Tasker CTA */}
                        {renderTaskerCTA()}
                    </div>
                </div>

                {/* Tasker Application Modal */}
                <TaskerApplicationModal
                    isOpen={isTaskerModalOpen}
                    onClose={() => setIsTaskerModalOpen(false)}
                    onSuccess={handleTaskerApplicationSuccess}
                />
            </main>
        </div>
    );
};

export default CustomerDashboardPage;
