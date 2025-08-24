import React from 'react';
import { useFavoriteServices } from '../hooks/useFavoriteServices';
import { useWatchlistServices } from '../hooks/useWatchlistServices'; // Import hook mới cho Watchlist
import { Heart, Bookmark } from 'react-feather'; // Import biểu tượng Bookmark
import { Service } from '../lib/servicesApi';
import BookServiceButton from '../components/BookServiceButton';
import { SERVICE_ID_TO_BOOKING_URL } from '../lib/servicesApi';
import { useAuth } from '../providers/auth_provider';
import Link from 'next/link';
const ServiceCatalog = ({ services }: { services: Service[] }) => {
    // Lấy thông tin user từ auth context
    const { user } = useAuth();
    const isLoggedIn = !!user; // Dùng trạng thái user từ Header làm nguồn chân lý hiển thị
    const { favorites, toggleFavorite, loading } = useFavoriteServices();
    const { watchlist, toggleWatchlist } = useWatchlistServices(); // Sử dụng hook mới cho watchlist

    // Lọc chỉ dịch vụ đang hoạt động
    const activeServices = services.filter(service => service.status === 'active');

    // Gom theo loại dịch vụ
    const servicesByType = activeServices.reduce<Record<string, Service[]>>((acc, service) => {
        const { type } = service;
        if (!acc[type]) acc[type] = [];
        acc[type].push(service);
        return acc;
    }, {});

    const defaultImg = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3kzdW1zZjNkYXR2N2lqaXNlNnYzbW02N2tqZmtkeGM4ZWs5NXkxZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/je9T6CsmiLj3i/giphy.gif';

    const handleToggleFavorite = async (serviceId: string) => {
    if (!isLoggedIn) {
            window.location.href = '/auth/login';
            return;
        }
        try {
            await toggleFavorite(Number(serviceId));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleToggleWatchlist = async (serviceId: string) => {
    if (!isLoggedIn) {
            window.location.href = '/auth/login';
            return;
        }
        try {
            // Gọi hàm toggle Watchlist từ hook mới
            await toggleWatchlist(Number(serviceId));
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        }
    };

    return (
        <section id="services" className="py-16 lg:py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">eCatalog Dịch Vụ</h2>
                    <p className="text-gray-600 mt-3 text-lg">Giải pháp toàn diện cho không gian sống của bạn.</p>
                </div>
                {Object.keys(servicesByType).map(type => (
                    <div key={type} className="mb-16">
                        <h3 className="text-2xl font-bold text-emerald-600 mb-8 border-l-4 border-emerald-500 pl-4">{type}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {servicesByType[type].map((service) => {
                                // Chỉ hiển thị khi đã đăng nhập theo Header
                                const isFavorite = isLoggedIn && favorites.includes(service.id);
                                // Kiểm tra xem dịch vụ có trong watchlist không
                                const isSaved = isLoggedIn && watchlist.some(s => s.id === service.id);

                                return (
                                    <div key={service.id} className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center group">
                                        
                                        {/* Nút yêu thích - CHỈ hiển thị khi đã đăng nhập */}
                                        {isLoggedIn && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFavorite(String(service.id));
                                                }}
                                                className="absolute top-4 right-4 p-1.5 bg-white/70 backdrop-blur-sm rounded-full z-10 transition-transform transform hover:scale-110"
                                                aria-label="Yêu thích"
                                            >
                                                <Heart
                                                    size={22}
                                                    className={`transition-all duration-300 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                                />
                                            </button>
                                        )}
                                        
                                        {/* Nút Xem sau - ĐỐI XỨNG với nút yêu thích */}
                                        {isLoggedIn && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleWatchlist(String(service.id));
                                                }}
                                                className="absolute top-4 left-4 p-1.5 bg-white/70 backdrop-blur-sm rounded-full z-10 transition-transform transform hover:scale-110"
                                                aria-label="Xem sau"
                                            >
                                                <Bookmark
                                                    size={22}
                                                    className={`transition-all duration-300 ${isSaved ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400 hover:text-emerald-400'}`}
                                                />
                                            </button>
                                        )}

                                        <div className="h-16 w-16 mb-4 flex items-center justify-center">
                                            <Link
                                            href={`/reviews?serviceId=${service.id}`}
                                            className="h-16 w-16 mb-4 flex items-center justify-center"
                                            >
                                                <img
                                                    src={service.image_url || defaultImg}
                                                    alt={service.name}
                                                    className="h-16 w-16 object-contain rounded-full hover:scale-110 transition-transform duration-200"
                                                />
                                            </Link>
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h4>
                                        <p className="text-gray-600 text-sm flex-grow">{service.description}</p>
                                        {SERVICE_ID_TO_BOOKING_URL[service.id] ? (
                                            <BookServiceButton bookingUrl={SERVICE_ID_TO_BOOKING_URL[service.id]} />
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServiceCatalog;