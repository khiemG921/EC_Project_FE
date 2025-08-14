// app/profile/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Pencil, Trash2 } from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import InfoField from '@/components/common/InfoField';
// import RankCard from '@/components/common/RankCard';
import { useUser } from '@/hooks/useUser';

// --- COMPONENT CHÍNH CỦA TRANG PROFILE ---
type TaskerInfo = { avgRating: number; completedJobs: number; bio: string };

const UserProfilePage = () => {
    const { user, loading, saveProfile, logoutUser, saveAvatar } = useUser();
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const [isLogoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'tasker'>('personal');
    const [formData, setFormData] = useState<any>(user);
    const [isAvatarModalOpen, setAvatarModalOpen] = useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isEditMode && user) {
            setFormData(user);
        }
    }, [isEditMode, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý mở modal thay đổi avatar
    const handleAvatarClick = () => {
        setAvatarUrl(formData.avatar || '');
        setAvatarModalOpen(true);
    };

    // Xử lý chọn file upload
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    // Xử lý khi chọn file: Tải file lên và cập nhật URL xem trước
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('Kích thước file không được vượt quá 5MB.');
            return;
        }

        setIsUploading(true);
        try {
            // Sử dụng hàm saveAvatar từ hook để tải file lên và nhận lại URL
            const newAvatarUrl = await saveAvatar(file);
            // Cập nhật URL trong modal để xem trước
            setAvatarUrl(newAvatarUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Tải ảnh lên thất bại. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    // Xử lý áp dụng avatar mới
    const handleApplyAvatar = () => {
        if (avatarUrl.trim()) {
            setFormData({ ...formData, avatar: avatarUrl.trim() });
            setAvatarModalOpen(false);
        }
    };

    // Xử lý hủy thay đổi avatar
    const handleCancelAvatar = () => {
        setAvatarUrl('');
        setAvatarModalOpen(false);
    };

    const handleSave = async () => {
        if (!formData) return;
        try {
            await saveProfile(formData);
            setEditMode(false);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Có lỗi xảy ra khi cập nhật profile. Vui lòng thử lại.');
        }
    };

    const handleRegisterTasker = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // TODO: Gọi API đăng ký tasker
    };
    const handleLogoutConfirm = async () => {
        setLogoutModalOpen(false);
        try {
            await logoutUser();
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    const handleDeleteConfirm = async () => {
        setDeleteModalOpen(false);
        // TODO: Gọi API xóa tài khoản
        logoutUser();
        router.push('/');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600"></div>
        </div>;
    }
    if (!user || !formData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Vui lòng đăng nhập để xem hồ sơ cá nhân</p>
                    <a href="/auth/login" className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">
                        Đăng nhập
                    </a>
                </div>
            </div>
        );
    }
    return (
        <>
            <ConfirmationModal isOpen={isLogoutModalOpen} onClose={() => setLogoutModalOpen(false)} onConfirm={handleLogoutConfirm} title="Xác nhận Đăng xuất" message="Bạn có chắc chắn muốn kết thúc phiên làm việc này không?" confirmText="Đăng xuất" />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title="Xác nhận Xóa tài khoản" message="Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn." confirmText="Tôi hiểu, Xóa" />

            {/* Avatar Modal */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                            <h3 className="text-xl font-bold text-white">Thay đổi ảnh đại diện</h3>
                        </div>
                        
                        <div className="p-6">
                            {/* Preview */}
                            <div className="text-center mb-6">
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    <img 
                                        src={avatarUrl || formData.avatar} 
                                        alt="Preview" 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-teal-100 shadow-md"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=14b8a6&color=fff';
                                        }}
                                    />
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">Xem trước ảnh đại diện mới</p>
                            </div>

                            {/* URL Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Đường dẫn ảnh (URL)
                                </label>
                                <input
                                    type="url"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                    disabled={isUploading}
                                />
                            </div>

                            {/* Divider */}
                            <div className="flex items-center my-4">
                                <div className="flex-1 border-t border-slate-200"></div>
                                <span className="px-3 text-sm text-slate-500">hoặc</span>
                                <div className="flex-1 border-t border-slate-200"></div>
                            </div>

                            {/* Upload Button */}
                            <button
                                onClick={handleFileSelect}
                                disabled={isUploading}
                                className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <Camera size={20} />
                                {isUploading ? 'Đang tải lên...' : 'Chọn ảnh từ máy tính'}
                            </button>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Định dạng: JPG, PNG, WEBP. Kích thước tối đa: 5MB
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end">
                            <button
                                onClick={handleCancelAvatar}
                                disabled={isUploading}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleApplyAvatar}
                                disabled={isUploading || !avatarUrl.trim()}
                                className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-slate-50 font-sans">
                <DashboardHeader user={user} onLogout={() => setLogoutModalOpen(true)} activeRole={user.roles[0]} onRoleChange={() => { }} showRoleSwitcher={user.roles.length > 1} />

                <main className="container mx-auto p-6 lg:p-8">
                    <header className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
                            <p className="text-slate-500 mt-1">Quản lý thông tin và các tùy chọn của bạn.</p>
                        </div>
                        {!isEditMode && (
                            <button onClick={() => setEditMode(true)} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                                <Pencil size={16} /><span>Chỉnh sửa</span>
                            </button>
                        )}
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cột trái: Thông tin chung */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                                <div className="relative w-28 h-28 mx-auto">
                                    <img src={formData.avatar} alt="User Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" />
                                    {isEditMode && (
                                        <button 
                                            onClick={handleAvatarClick}
                                            className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-200 hover:scale-110"
                                            title="Thay đổi ảnh đại diện"
                                        >
                                            <Camera size={16} />
                                        </button>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mt-4">{formData.name}</h2>
                                <p className="text-slate-500">{formData.email}</p>
                            </div>
                            {/* <RankCard points={formData.rewardPoints || 0} /> */}
                            {!formData.roles.includes('tasker') && !isEditMode && (
                                <div className="text-center bg-teal-50 p-6 rounded-xl border border-teal-200">
                                    <h3 className="text-lg font-bold text-teal-800">Sẵn sàng kiếm thêm thu nhập?</h3>
                                    <p className="text-teal-700 mt-1 mb-4 text-sm">Tham gia đội ngũ đối tác được tin cậy của chúng tôi.</p>
                                    <button onClick={handleRegisterTasker} className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-teal-500/20">Bắt đầu đăng ký</button>
                                </div>
                            )}
                        </div>

                        {/* Cột phải: Thông tin chi tiết */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            {formData.roles.includes('tasker') && !isEditMode && (
                                <div className="border-b border-slate-200 mb-6">
                                    <nav className="-mb-px flex space-x-6">
                                        <button onClick={() => setActiveTab('personal')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Thông tin cá nhân</button>
                                        <button onClick={() => setActiveTab('tasker')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasker' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Thông tin Đối tác</button>
                                    </nav>
                                </div>
                            )}

                            {/* Content cho Personal Info Tab */}
                            <div className={`${activeTab === 'personal' || isEditMode ? 'block' : 'hidden'}`}>
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Thông tin Cơ bản</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    <InfoField label="Họ và tên" value={formData.name} isEditing={isEditMode} name="name" onChange={handleInputChange} />
                                    <InfoField label="Số điện thoại" value={formData.phone} isEditing={isEditMode} name="phone" onChange={handleInputChange} />
                                    <InfoField label="Email" value={formData.email} isEditing={false} name="email" onChange={() => { }} />
                                    <InfoField label="Giới tính" value={formData.gender} isEditing={isEditMode} name="gender" onChange={handleInputChange} />
                                    <InfoField label="Ngày sinh" value={formData.dob} isEditing={isEditMode} name="dob" onChange={handleInputChange} type="date" />
                                    <div className="md:col-span-2"><InfoField label="Địa chỉ" value={formData.address} isEditing={isEditMode} name="address" onChange={handleInputChange} /></div>
                                </div>
                            </div>

                            {/* Content cho Tasker Info Tab */}
                            <div className={`${activeTab === 'tasker' && !isEditMode ? 'block' : 'hidden'}`}>
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Thông tin Đối tác</h3>
                                <div className="space-y-5">
                                    <InfoField label="Đánh giá trung bình" value={formData.taskerInfo?.avgRating} isEditing={false} name="rating" onChange={() => { }} />
                                    <InfoField label="Số việc đã hoàn thành" value={formData.taskerInfo?.completedJobs} isEditing={false} name="jobs" onChange={() => { }} />
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Giới thiệu bản thân</label>
                                        <p className="mt-1 text-base text-slate-700 bg-slate-50 p-3 rounded-md">{formData.taskerInfo?.bio}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nút hành động khi ở chế độ chỉnh sửa */}
                            {isEditMode && (
                                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
                                    <button onClick={() => setDeleteModalOpen(true)} className="text-sm text-red-500 hover:text-red-700 hover:underline font-semibold flex items-center gap-1.5">
                                        <Trash2 size={14} /> Xóa tài khoản
                                    </button>
                                    <div className="flex gap-3">
                                        <button onClick={() => setEditMode(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-6 rounded-lg">Hủy</button>
                                        <button onClick={handleSave} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-lg">Lưu thay đổi</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default UserProfilePage;
