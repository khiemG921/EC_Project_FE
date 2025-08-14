'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Types - Simplified without max_uses/current_uses
interface Voucher {
  voucher_id: number;
  voucher_code: string;
  detail: string;
  discount_percentage: number;
  expiry_date: string;
  status: 'active' | 'expired';
  is_active: boolean;
  created_at: string;
  days_left: number;
}

interface VoucherFormData {
  voucher_code: string;
  detail: string;
  discount_percentage: number;
  expiry_date: string;
}

const VoucherManagementPage = () => {
  // States
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });

  // Form state
  const [formData, setFormData] = useState<VoucherFormData>({
    voucher_code: '',
    detail: '',
    discount_percentage: 0,
    expiry_date: new Date().toISOString().split('T')[0]
  });

  // Fetch data
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: '100'
      });

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers?${params}`;
      console.log('🔍 Fetching vouchers from:', url);

      const response = await fetch(url, {
        credentials: 'include' // Dùng cookie session
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vouchers data received:', data);
        setVouchers(data.data || []);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch vouchers:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers/stats`;
      console.log('🔍 Fetching stats from:', url);

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stats data received:', data);
        setStats(data.data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch stats:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  useEffect(() => {
    console.log('🌍 Environment check:');
    console.log('- NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('- Search term:', searchTerm);
    console.log('- Status filter:', statusFilter);
    
    fetchVouchers();
    fetchStats();
  }, [searchTerm, statusFilter]);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount_percentage' || name === 'max_uses' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.voucher_code || !formData.discount_percentage || !formData.expiry_date) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.discount_percentage < 1 || formData.discount_percentage > 100) {
      alert('Phần trăm giảm giá phải từ 1-100%');
      return;
    }

    // Kiểm tra ngày hết hạn phải trong tương lai
    const expiryDate = new Date(formData.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expiryDate <= today) {
      alert('Ngày hết hạn phải sau ngày hôm nay');
      return;
    }

    try {
      const url = editingVoucher 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers/${editingVoucher.voucher_code}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers`;
      
      const method = editingVoucher ? 'PUT' : 'POST';

      console.log(`🚀 ${method} voucher:`, formData);

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('📡 Voucher save response:', result);

      if (response.ok) {
        alert(`✅ ${result.message}`);
        resetForm();
        fetchVouchers();
        fetchStats();
      } else {
        alert(`❌ ${result.error || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error('❌ Error saving voucher:', error);
      alert('Có lỗi xảy ra khi lưu voucher');
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      voucher_code: voucher.voucher_code,
      detail: voucher.detail,
      discount_percentage: voucher.discount_percentage,
      expiry_date: voucher.expiry_date.split('T')[0]
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (voucher_code: string) => {
    const voucher = vouchers.find(v => v.voucher_code === voucher_code);
    const confirmMessage = voucher 
      ? `Bạn có chắc chắn muốn xóa voucher "${voucher_code}"?\n\n` +
        `💰 Giảm giá: ${voucher.discount_percentage}%\n` +
        `📅 Hết hạn: ${new Date(voucher.expiry_date).toLocaleDateString('vi-VN')}\n\n` +
        `⚠️ Hành động này không thể hoàn tác!`
      : `Bạn có chắc chắn muốn xóa voucher ${voucher_code}?`;

    if (!confirm(confirmMessage)) return;

    try {
      console.log(`🗑️ Deleting voucher: ${voucher_code}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers/${voucher_code}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();
      console.log('📡 Delete response:', result);

      if (response.ok) {
        alert(`✅ ${result.message}`);
        fetchVouchers();
        fetchStats();
      } else {
        alert(`❌ ${result.error || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting voucher:', error);
      alert('Có lỗi xảy ra khi xóa voucher');
    }
  };

  const resetForm = () => {
    setFormData({
      voucher_code: '',
      detail: '',
      discount_percentage: 0,
      expiry_date: new Date().toISOString().split('T')[0]
    });
    setEditingVoucher(null);
    setShowCreateForm(false);
  };

  // Get status badge color
  const getStatusBadge = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) <= new Date();
    
    if (isExpired) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Hết hạn</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎫 Quản lý Voucher Hệ thống</h1>
            <p className="text-gray-600 mt-2">Quản lý mã giảm giá cho toàn bộ hệ thống</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <i className="fas fa-plus mr-2"></i>
            Tạo Voucher Mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
                <i className="fas fa-ticket-alt text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tổng Voucher</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
                <i className="fas fa-check-circle text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-500 text-white p-3 rounded-lg mr-4">
                <i className="fas fa-times-circle text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Hết hạn</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="🔍 Tìm kiếm theo mã voucher hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="expired">Hết hạn</option>
            </select>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times mr-2"></i>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã Voucher *
                  </label>
                  <Input
                    name="voucher_code"
                    value={formData.voucher_code}
                    onChange={handleInputChange}
                    placeholder="VD: SUMMER2024"
                    className="uppercase"
                    required
                    disabled={!!editingVoucher}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phần trăm giảm giá * (1-100%)
                  </label>
                  <Input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày hết hạn *
                  </label>
                  <Input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="detail"
                  value={formData.detail}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Mô tả chi tiết về voucher..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  <i className="fas fa-save mr-2"></i>
                  {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <i className="fas fa-times mr-2"></i>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Vouchers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách Voucher Hệ thống</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-2">Đang tải...</p>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-ticket-alt text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-600">Chưa có voucher nào</p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-teal-600 hover:bg-teal-700"
                >
                  Tạo voucher đầu tiên
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã Voucher
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giảm giá
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hết hạn
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vouchers.map((voucher) => (
                      <tr key={voucher.voucher_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {voucher.voucher_code}
                            </div>
                            <div className="text-sm text-gray-500">
                              {voucher.detail || 'Không có mô tả'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-teal-600">
                            {voucher.discount_percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(voucher.expiry_date).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {voucher.days_left > 0 ? `${voucher.days_left} ngày` : 'Đã hết hạn'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(voucher.status, voucher.expiry_date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(voucher)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(voucher.voucher_code)}
                              className="text-red-600 hover:text-red-800"
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
        </div>
      </div>

      {/* Font Awesome CSS */}
      <style jsx global>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
      `}</style>
    </AdminLayout>
  );
};

export default VoucherManagementPage;
