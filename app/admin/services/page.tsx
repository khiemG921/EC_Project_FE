'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { logDev } from '@/lib/utils';

interface Service {
    id: string | number;
    name: string;
    description: string;
    type: string;
    image_url: string;
    status: 'active' | 'inactive';
    _id?: string; // MongoDB ID
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        type: '',
        status: 'active' as 'active' | 'inactive'
    });

    const categories = [
        'Giúp Việc Gia Đình',
        'Dịch Vụ Phổ Biến',
        'Vệ Sinh Chuyên Sâu',
        'Bảo Dưỡng Điện Máy',
        'Dịch Vụ Dành Cho Doanh Nghiệp',
        'Dịch Vụ Doanh Nghiệp',
        'Dịch Vụ Chăm Sóc',
        'Dịch Vụ Tiện Ích Nâng Cao'
    ];

    const categoryLabels: Record<string, string> = {
        'Giúp Việc Gia Đình': 'Giúp Việc Gia Đình',
        'Dịch Vụ Phổ Biến': 'Dịch Vụ Phổ Biến',
        'Vệ Sinh Chuyên Sâu': 'Vệ Sinh Chuyên Sâu',
        'Bảo Dưỡng Điện Máy': 'Bảo Dưỡng Điện Máy',
        'Dịch Vụ Dành Cho Doanh Nghiệp': 'Dịch Vụ Dành Cho Doanh Nghiệp',
        'Dịch Vụ Doanh Nghiệp': 'Dịch Vụ Doanh Nghiệp',
        'Dịch Vụ Chăm Sóc': 'Dịch Vụ Chăm Sóc',
        'Dịch Vụ Tiện Ích Nâng Cao': 'Dịch Vụ Tiện Ích Nâng Cao'
    };

    // Fetch services from backend
    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/admin`);
            if (response.ok) {
                const data = await response.json();
                logDev('API Response:', data); // Debug log
                setServices(data.data || []);
            } else {
                console.error('Failed to fetch services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const method = editingService ? 'PUT' : 'POST';
            const url = editingService 
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/services/${editingService.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/services`;

            // Lấy token từ Firebase
            const user = auth.currentUser;
            const token = user ? await user.getIdToken() : null;
        
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchServices(); // Refresh the list
                resetForm();
                alert(editingService ? 'Cập nhật dịch vụ thành công!' : 'Tạo dịch vụ thành công!');
            } else {
                const error = await response.json();
                alert(`Lỗi: ${error.message || 'Không thể lưu dịch vụ'}`);
            }
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Có lỗi xảy ra khi lưu dịch vụ');
        }
    };

    const handleDelete = async (serviceId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;

        // Lấy token từ Firebase
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/services/${serviceId}`;
        logDev('Gọi API xóa dịch vụ:', url);

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                credentials: 'include'
            });

            if (response.ok) {
                await fetchServices(); // Refresh the list
                alert('Xóa dịch vụ thành công!');
            } else {
                const error = await response.json();
                alert(error.error || 'Không thể xóa dịch vụ');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Có lỗi xảy ra khi xóa dịch vụ');
        }
    };

    // Handle edit
    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            image_url: service.image_url || '',
            type: service.type || '',
            status: service.status || 'active'
        });
        setShowCreateForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image_url: '',
            type: '',
            status: 'active' as 'active' | 'inactive'
        });
        setEditingService(null);
        setShowCreateForm(false);
    };

    // Filter services
    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterCategory === 'all' || service.type === filterCategory;
        return matchesSearch && matchesType;
    });

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">🛎️ Quản lý Dịch vụ</h1>
                        <p className="text-gray-600">
                            Quản lý tất cả dịch vụ của CleanNow
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Thêm dịch vụ mới
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm dịch vụ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {categoryLabels[category]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services List */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải dịch vụ...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {filteredServices.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                                <p>Không tìm thấy dịch vụ nào</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dịch vụ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Loại dịch vụ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredServices.map((service) => (
                                            <tr key={service.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img
                                                                className="h-10 w-10 rounded-lg object-cover"
                                                                src={service.image_url || '/images/default-service.jpg'}
                                                                alt={service.name}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {service.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                {service.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {service.type ? (categoryLabels[service.type] || service.type) : 'Chưa phân loại'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        service.status === 'active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {service.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() => handleEdit(service)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            <i className="fas fa-edit mr-1"></i>
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(service.id.toString())}
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <i className="fas fa-trash mr-1"></i>
                                                            Xóa
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Create/Edit Form Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                                </h2>
                                <Button
                                    onClick={resetForm}
                                    variant="outline"
                                    size="sm"
                                >
                                    <i className="fas fa-times"></i>
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên dịch vụ *
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Nhập tên dịch vụ"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Loại dịch vụ *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Chọn loại dịch vụ</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {categoryLabels[category]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Nhập mô tả dịch vụ"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trạng thái
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Hoạt động</option>
                                            <option value="inactive">Tạm dừng</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL hình ảnh
                                        </label>
                                        <Input
                                            value={formData.image_url}
                                            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={resetForm}
                                        variant="outline"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {editingService ? 'Cập nhật' : 'Tạo mới'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
