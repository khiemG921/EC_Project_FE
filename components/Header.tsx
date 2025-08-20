'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    ChevronDown,
    LogOut,
    User,
    Heart,
    History,
    Settings,
    LayoutGrid,
    MapPin,
    Mail,
    Phone,
    Tag,
    Bookmark,
} from 'lucide-react';
import { useAuth } from '@/providers/auth_provider';

// Header component cho trang chủ
// --- COMPONENT HEADER ---
// Component này tự quản lý trạng thái đăng nhập và hiển thị UI tương ứng.
export function Header() {
    const { user, loading, logout } = useAuth();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error('Logout failed:', e);
        } finally {
            // ensure any legacy token is removed
            try { window.localStorage.removeItem('token'); } catch (e) { console.error('Failed to remove token:', e); }

            try { router.refresh(); } catch (e) { console.error('Failed to refresh router:', e); }
        }
    }
}

// Hàm xử lý việc cuộn đến các mục trên trang chủ
const handleAnchor = (anchor: string) => {
    // Nếu không ở trang chủ, điều hướng về trước rồi mới cuộn
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        router.push('/');
        // Đợi để trình duyệt điều hướng xong
        setTimeout(() => {
            document
                .getElementById(anchor)
                ?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    } else {
        // Nếu đã ở trang chủ, chỉ cần cuộn
        document
            .getElementById(anchor)
            ?.scrollIntoView({ behavior: 'smooth' });
    }
};

// Xử lý click vào nút đăng nhập khi đã có user
const handleLoginClick = (e: React.MouseEvent) => {
    if (user && !loading) {
        e.preventDefault();
        router.push('/dashboard');
    }
};

// Các mục trong menu người dùng
const userMenuItems = [];
if (user) {
    userMenuItems.push(
        { label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
        { label: 'Hồ sơ của tôi', icon: User, href: '/profile' },
        { label: 'Lịch sử đặt', icon: History, href: '/history' },
        { label: 'Yêu thích', icon: Heart, href: '/favorite' },
        { label: 'Xem sau', icon: Bookmark, href: '/watchlist' },
        { label: 'Ưu đãi', icon: Tag, href: '/vouchers' },
        { label: 'Cài đặt', icon: Settings, href: '/settings' }
    );
    if (user.roles?.includes('tasker')) {
        userMenuItems.push({
            label: 'Nhận việc',
            icon: LayoutGrid,
            href: '/tasker/find-job',
        });
    }
} else {
    userMenuItems.push(
        { label: 'Đăng nhập', icon: User, href: '/auth/login' },
        { label: 'Đăng ký', icon: User, href: '/auth/register' }
    );
}

return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <a href="/" className="text-3xl font-bold text-teal-600">
                    clean<span className="text-emerald-500">Now</span>
                </a>

                {/* Điều hướng chính của trang chủ */}
                <nav className="hidden md:flex items-center space-x-8">
                    <button
                        onClick={() => handleAnchor('services')}
                        className="text-gray-600 hover:text-teal-600 transition-colors bg-transparent border-none cursor-pointer font-medium"
                    >
                        Dịch vụ
                    </button>
                    <button
                        onClick={() => handleAnchor('how-it-works')}
                        className="text-gray-600 hover:text-teal-600 transition-colors bg-transparent border-none cursor-pointer font-medium"
                    >
                        Quy trình
                    </button>
                    <a
                        href="/news"
                        className="text-gray-600 hover:text-teal-600 transition-colors font-medium"
                    >
                        Tin tức
                    </a>
                </nav>

                {/* Khu vực hành động của người dùng */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {loading ? (
                        <div className="h-9 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                    ) : user ? (
                        // Giao diện khi đã đăng nhập
                        <div className="flex items-center gap-4">
                            <button className="relative text-slate-500 hover:text-teal-600 transition-colors">
                                <Bell size={22} />
                                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="relative">
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
                                    <ChevronDown
                                        size={16}
                                        className="text-slate-400"
                                    />
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
                                                    {user.roles?.[0] ===
                                                        'customer'
                                                        ? 'Khách hàng'
                                                        : user
                                                            .roles?.[0] ===
                                                            'tasker'
                                                            ? 'Tasker'
                                                            : 'Admin'}
                                                </span>
                                            </div>
                                        </div>
                                        <nav className="py-2">
                                            {userMenuItems.map((item) => (
                                                <a
                                                    key={item.label}
                                                    href={item.href}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                                >
                                                    <item.icon size={18} />
                                                    <span>
                                                        {item.label}
                                                    </span>
                                                </a>
                                            ))}
                                        </nav>
                                        <div className="p-2 border-t border-slate-100">
                                            <button
                                                onClick={handleLogout}
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
                    ) : (
                        // Giao diện khi chưa đăng nhập
                        <>
                            <a
                                href="/auth/login"
                                className="text-gray-600 hover:text-teal-600 transition-colors text-sm sm:text-base font-medium"
                            >
                                Đăng nhập
                            </a>
                            <a
                                href="/auth/register"
                                className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors shadow-sm text-sm sm:text-base font-semibold"
                            >
                                Đăng ký
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    </header>
);
}

// --- COMPONENT FOOTER ---
interface FooterService {
    id: string | number;
    name: string;
}

interface FooterProps {
    services?: FooterService[];
}

export function Footer({ services }: FooterProps) {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <h3 className="text-2xl font-bold text-white">
                            clean<span className="text-green-400">Now</span>
                        </h3>
                        <p className="mt-4 text-gray-400">
                            Dịch vụ dọn dẹp chuyên nghiệp, mang lại không gian
                            sống trong lành cho gia đình bạn.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold tracking-wider uppercase">
                            Dịch vụ
                        </h4>
                        <ul className="mt-4 space-y-2">
                            {(services || [])
                                .slice(0, 4)
                                .map((s: FooterService) => (
                                    <li key={s.id}>
                                        <a
                                            href={`/booking/${s.id}`}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            {s.name}
                                        </a>
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold tracking-wider uppercase">
                            Liên kết
                        </h4>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <a
                                    href="/about"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Về Chúng Tôi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/recruitment"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Tuyển Dụng
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/policy"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Chính Sách
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold tracking-wider uppercase">
                            Liên hệ
                        </h4>
                        <ul className="mt-4 space-y-3">
                            <li className="flex items-start">
                                <MapPin
                                    size={20}
                                    className="mr-3 mt-1 flex-shrink-0"
                                />
                                <span className="text-gray-400">
                                    123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Mail
                                    size={20}
                                    className="mr-3 flex-shrink-0"
                                />
                                <a
                                    href="mailto:support@cleannow.vn"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    support@cleannow.vn
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Phone
                                    size={20}
                                    className="mr-3 flex-shrink-0"
                                />
                                <a
                                    href="tel:19001234"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    1900 1234
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
