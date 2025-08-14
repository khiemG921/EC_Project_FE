'use client';
import React from 'react';
import { Bookmark } from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader';
import ServiceCard from '@/components/common/ServiceCard'; // Giả định bạn có một component ServiceCard chung
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/providers/auth_provider';
import { useWatchlistServices } from '@/hooks/useWatchlistServices';

const WatchlistPage = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const isAuthenticated = !!user;
    
    // Sử dụng hook mới để lấy danh sách xem sau
    const { watchlistServices, removeWatchlist, loading } = useWatchlistServices();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Vui lòng đăng nhập để xem danh sách Xem sau của bạn</p>
                    <a href="/auth/login" className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600">
                        Đăng nhập
                    </a>
                </div>
            </div>
        );
    }

    // Xử lý xóa dịch vụ khỏi danh sách xem sau
    const handleRemoveService = async (serviceId: number) => {
        try {
            await removeWatchlist(serviceId);
        } catch (error) {
            console.error('Error removing from watchlist:', error);
        }
    };

    const activeRole = user?.roles?.[0] || 'customer';

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader
                user={user}
                onLogout={logout}
                activeRole={activeRole}
                onRoleChange={() => { }}
                showRoleSwitcher={user.roles.length > 1}
            />
            <main className="container mx-auto p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Danh sách Xem sau</h1>
                    <p className="text-slate-500 mt-1">Quản lý các dịch vụ bạn muốn xem lại sau.</p>
                </header>
                <div>
                    {loading ? (
                        <div className="text-center py-8">Đang tải...</div>
                    ) : watchlistServices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {watchlistServices.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onRemove={handleRemoveService}
                                    isRemovable={true} // Bổ sung prop để ServiceCard hiển thị nút xóa
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            icon={<Bookmark className="mx-auto text-slate-300" size={48} />} 
                            title="Chưa có dịch vụ nào trong danh sách Xem sau" 
                            description="Hãy thêm các dịch vụ bạn quan tâm để xem lại sau." 
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default WatchlistPage;