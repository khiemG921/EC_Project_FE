'use client';

import React, { useState } from 'react';
import {
    User,
    Shield,
    Bell,
    Briefcase,
    ChevronRight,
    Edit,
    LogOut,
    Check,
    X,
    Mail,
} from 'lucide-react';
// ---- chỉnh đường dẫn import Header nếu cần ----
import { Header } from '@/components/Header'; // <--- thay đường dẫn này cho đúng vị trí Header trong project của bạn
import Footer from '@/components/Footer';
import { logoutUser } from '@/lib/authClient';
import { useRouter } from 'next/navigation';
import { logDev } from '@/lib/utils';

const mockUser = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    avatarUrl: 'https://placehold.co/100x100/A0AEC0/FFFFFF?text=NA',
};

const mockServices = [
    {
        id: '1',
        name: 'Giúp Việc Gia Đình',
        description: 'Dọn dẹp nhà cửa theo giờ',
        price: '250.000 VNĐ',
    },
    {
        id: '2',
        name: 'Vệ Sinh Sofa & Nệm',
        description: 'Làm sạch sâu sofa, nệm và rèm',
        price: '450.000 VNĐ',
    },
    {
        id: '3',
        name: 'Dọn Dẹp Văn Phòng',
        description: 'Dịch vụ dọn dẹp cho công ty',
        price: 'Liên hệ',
    },
];
const SettingsPage = () => {
    const router = useRouter();
    const [user, setUser] = useState(mockUser);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

    const handleEditProfile = () => {
        // Logic để lưu thông tin đã chỉnh sửa
        setIsEditingProfile(false);
        logDev('Thông tin hồ sơ đã được lưu:', user);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            router.push('/auth/login');
        }
    };

    const handleNotificationsToggle = () => {
        setIsNotificationsEnabled(!isNotificationsEnabled);
    };

    return (
        // thêm một khoảng top để tránh header sticky che vùng nội dung
        <main className="bg-gray-100 min-h-screen pt-20 pb-12">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center sm:text-left">
                    Cài Đặt
                </h1>

                {/* Phần 1: Hồ sơ cá nhân */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 transition-all duration-300 hover:shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <User size={24} className="text-emerald-600" />
                            <h2 className="text-xl font-semibold text-gray-700">
                                Hồ Sơ Cá Nhân
                            </h2>
                        </div>
                        {isEditingProfile ? (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleEditProfile}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                    aria-label="Lưu hồ sơ"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={() => setIsEditingProfile(false)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Hủy chỉnh sửa"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                aria-label="Chỉnh sửa hồ sơ"
                            >
                                <Edit size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
                        <img
                            src={user.avatarUrl}
                            alt="Ảnh đại diện"
                            className="w-24 h-24 rounded-full border-4 border-emerald-500 object-cover shadow-lg"
                        />
                        <div className="text-center sm:text-left flex-1">
                            <div className="flex flex-col mb-2">
                                <label className="text-sm font-medium text-gray-500 mb-1">
                                    Tên của bạn
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={user.name}
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                name: e.target.value,
                                            })
                                        }
                                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-gray-800">
                                        {user.name}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-500 mb-1">
                                    Email
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="email"
                                        value={user.email}
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                email: e.target.value,
                                            })
                                        }
                                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                    />
                                ) : (
                                    <p className="text-gray-600">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần 2: Quản lý dịch vụ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center space-x-4 mb-6">
                        <Briefcase size={24} className="text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-700">
                            Quản Lý Dịch Vụ
                        </h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Danh sách các dịch vụ bạn đang cung cấp:
                    </p>
                    <ul className="space-y-4">
                        {mockServices.map((service) => (
                            <li
                                key={service.id}
                                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-gray-100"
                            >
                                <div>
                                    <h3 className="text-lg font-medium text-gray-800">
                                        {service.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {service.description}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-emerald-600 font-bold">
                                        {service.price}
                                    </span>
                                    <button
                                        className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"
                                        aria-label={`Mở ${service.name}`}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Phần 3: Cài đặt Bảo mật & Thông báo */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Bảo mật */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center space-x-4 mb-6">
                            <Shield size={24} className="text-emerald-600" />
                            <h2 className="text-xl font-semibold text-gray-700">
                                Bảo Mật
                            </h2>
                        </div>
                        <button className="w-full text-left flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors">
                            <span>Đổi mật khẩu</span>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    {/* Thông báo */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center space-x-4 mb-6">
                            <Bell size={24} className="text-emerald-600" />
                            <h2 className="text-xl font-semibold text-gray-700">
                                Thông Báo
                            </h2>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-2">
                                <Mail size={20} className="text-gray-500" />
                                <span>Thông báo qua email</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    value=""
                                    className="sr-only peer"
                                    checked={isNotificationsEnabled}
                                    onChange={handleNotificationsToggle}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Nút Đăng xuất */}
                <div className="text-center mt-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center mx-auto text-red-500 hover:text-red-700 font-medium py-3 px-6 rounded-full transition-colors"
                    >
                        <LogOut size={20} className="mr-2" />
                        Đăng Xuất
                    </button>
                </div>
            </div>
        </main>
    );
};

// Component bao bọc để hiển thị trang cài đặt (ví dụ)
const App = () => {
    return (
        <div className="font-sans antialiased text-gray-900">
            {/* Header sticky (được import ở trên) */}
            <Header />
            <SettingsPage />
            <Footer />
        </div>
    );
};

export default App;
