// app/favorite/page.tsx
'use client';
import React from 'react';
import { Heart } from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader';
import FavoriteServiceCard from '@/components/common/FavoriteServiceCard';
// import FavoriteTaskerCard from '@/components/common/FavoriteTaskerCard'; // Tạm ẩn UI đối tác yêu thích
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/providers/auth_provider';
import { useFavoriteServices } from '@/hooks/useFavoriteServices';

const FavoritesPage = () => {
    const { user, logout, loading: authLoading } = useAuth();
    // Chỉ hiển thị dịch vụ yêu thích; ẩn tab đối tác
    // const [activeTab, setActiveTab] = React.useState<'services' | 'taskers'>('services');
    // const [taskers, setTaskers] = React.useState<any[]>([]);
    const isAuthenticated = !!user;
    const { favorites, loading, toggleFavorite } = useFavoriteServices();
    const [services, setServices] = React.useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);

    // Fetch chi tiết dịch vụ yêu thích từ backend khi favorites thay đổi
    React.useEffect(() => {
        if (!isAuthenticated) {
            setServices([]);
            return;
        }
        
        // Nếu không có favorites, set services rỗng
        if (!favorites || favorites.length === 0) {
            setServices([]);
            return;
        }
        
        // Gọi API backend để lấy chi tiết dịch vụ yêu thích cho user
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite/details`, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(favServices => {
                console.log('Fetched favorite services:', favServices);
                console.log('Services structure:', favServices.map((s: any) => ({ 
                    id: s.id, 
                    service_id: s.service_id, 
                    _id: s._id,
                    name: s.name,
                    image_url: s.image_url
                })));
                setServices(favServices || []);
            })
            .catch((error) => {
                console.error('Error fetching favorite services:', error);
                setServices([]);
            });
    }, [isAuthenticated, favorites, refreshTrigger]); // Thêm refreshTrigger để force refresh

    // Fetch favorite taskers từ backend
    // React.useEffect(() => {
    //     if (!isAuthenticated) {
    //         setTaskers([]);
    //         return;
    //     }
    //     setTaskers([]);
    // }, [isAuthenticated]);

    const activeRole = user?.roles?.[0] || 'customer';

    if (authLoading) {
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
                    <p className="text-slate-600 mb-4">Vui lòng đăng nhập để xem danh sách yêu thích</p>
                    <a href="/auth/login" className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">
                        Đăng nhập
                    </a>
                </div>
            </div>
        );
    }
    // Xử lý xóa dịch vụ yêu thích
    const handleRemoveService = async (id: string) => {
        try {
            await toggleFavorite(Number(id));
            // Cập nhật state services
            setServices(current => current.filter(s => 
                String(s.id) !== id && 
                String(s.service_id) !== id && 
                String(s._id) !== id &&
                String(s.image_url) !== id
            ));
            // Force refresh để đảm bảo đồng bộ
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error removing favorite service:', error);
        }
    };

    // Xử lý xóa tasker yêu thích
    // const handleRemoveTasker = (id: string) => {};

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
                    <h1 className="text-3xl font-bold text-slate-800">Danh sách Yêu thích</h1>
                    <p className="text-slate-500 mt-1">Quản lý các dịch vụ và đối tác bạn tin tưởng.</p>
                </header>
                
                {/* Tab đối tác yêu thích đã được ẩn; chỉ hiển thị danh sách dịch vụ */}

                {/* Nội dung Tab */}
                <div>
                    {loading ? (
                        <div className="text-center py-8">Đang tải...</div>
                    ) : services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {services.map((service, index) => {
                                console.log('Rendering service:', service);
                                const uniqueKey = service.service_id ;
                                return (
                                    <FavoriteServiceCard 
                                        key={uniqueKey} 
                                        service={service} 
                                        onRemove={handleRemoveService} 
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState icon={<Heart className="mx-auto text-slate-300" size={48} />} title="Chưa có dịch vụ yêu thích" description="Hãy thêm các dịch vụ bạn thường dùng để đặt lại nhanh hơn!" />
                    )}
                </div>
            </main>
        </div>
    );
};

export default FavoritesPage;
