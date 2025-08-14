// app/vouchers/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Calendar, Filter, Package } from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader'; 
import { useUser } from '@/hooks/useUser';
import { fetchVouchers} from '@/lib/vouchersApi';
import { Voucher} from '@/types/voucher'

const mockServices = [
    { id: '1', name: 'Giúp Việc Ca Lẻ' },
    { id: '2', name: 'Giúp Việc Định Kỳ' },
    { id: '4', name: 'Vệ Sinh Sofa, Đệm, Rèm, Thảm' },
    { id: '5', name: 'Vệ Sinh Điều Hòa' },
    { id: '8', name: 'Vệ Sinh Công Nghiệp' },
];


// --- COMPONENT PHỤ ---

const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
    const router = useRouter();
    const isExpired = new Date(voucher.expiry_date) < new Date() || !voucher.is_active;
    const discountValue = voucher.discount_percentage > 0 ? `${voucher.discount_percentage}%` : 'Free';

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md ${isExpired ? 'opacity-60' : ''}`}>
            <div className="p-5 flex-grow">
                <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white flex-shrink-0 ${isExpired ? 'bg-slate-400' : 'bg-teal-500'}`}>
                        <span className="text-2xl font-bold">{discountValue}</span>
                        <span className="text-xs font-semibold opacity-80">GIẢM</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{voucher.detail}</h3>
                        <p className="text-xs text-slate-500 mt-2">
                            Mã: <code className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{voucher.voucher_code}</code>
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar size={14} />
                    <span>HSD: {new Date(voucher.expiry_date).toLocaleDateString('vi-VN')}</span>
                </div>
                {!isExpired && (
                    <button 
                        onClick={() => router.push('/')}
                        className="px-4 py-1.5 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
                    >
                        Sử dụng ngay
                    </button>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH CỦA TRANG ƯU ĐÃI ---
const VouchersPage = () => {
    const { user, loading, logoutUser } = useUser();
    const [activeTab, setActiveTab] = useState<'valid' | 'expired'>('valid');
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // State cho bộ lọc
    const [filterService, setFilterService] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    const loadVouchers = useCallback(async (signal?: AbortSignal) => {
        try {
            setLoadingVouchers(true);
            setError(null);
            const data = await fetchVouchers({ signal });
            setVouchers(data);
        } catch (error: any) {
            if (error?.name === 'AbortError') return;
            setVouchers([]);
            setError('Không tải được danh sách ưu đãi');
        } finally {
            setLoadingVouchers(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        loadVouchers(controller.signal);
        return () => controller.abort();
    }, [loadVouchers, user?.id]); // refetch khi trạng thái đăng nhập đổi

    const todayMidnight = useMemo(() => {
        const d = new Date(); d.setHours(0,0,0,0); return d;
    }, []);

    const validVouchers = vouchers.filter(v => {
        const exp = new Date(v.expiry_date); exp.setHours(0,0,0,0);
        return exp >= todayMidnight && v.is_active;
    });
    const expiredVouchers = vouchers.filter(v => {
        const exp = new Date(v.expiry_date); exp.setHours(0,0,0,0);
        return exp < todayMidnight || !v.is_active;
    });

    // Logic lọc và sắp xếp
    const processedValidVouchers = useMemo(() => {
        let filtered = [...validVouchers];

        // Lọc theo dịch vụ
        if (filterService !== 'all') {
            filtered = filtered.filter(voucher => {
                if (!voucher.service_ids) return true; // Áp dụng cho tất cả dịch vụ
                return voucher.service_ids.split(',').includes(filterService);
            });
        }

        // Sắp xếp
        if (sortBy === 'expiring_soon') {
            filtered.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
        }

        return filtered;
    }, [validVouchers, filterService, sortBy]);


    if (loading || loadingVouchers) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600"></div>
        </div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Vui lòng đăng nhập để xem ưu đãi</p>
                    <a href="/auth/login" className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">
                        Đăng nhập
                    </a>
                </div>
            </div>
        );
    }

    if (error && !loadingVouchers) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <p className="text-slate-600">{error}</p>
                <button
                  onClick={() => loadVouchers()}
                  className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  Thử lại
                </button>
            </div>
        );
    }

    const renderVoucherList = (voucherList: Voucher[]) => {
        if (voucherList.length === 0) {
            return (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Tag size={48} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-700">Không có ưu đãi nào</h3>
                    <p className="mt-1 text-slate-500">Không tìm thấy ưu đãi phù hợp với lựa chọn của bạn.</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {voucherList.map(voucher => <VoucherCard key={voucher.voucher_code} voucher={voucher} />)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader
              user={user}
              onLogout={logoutUser}
              activeRole={user?.roles?.[0] || 'customer'}
              onRoleChange={() => {}}
              showRoleSwitcher={user?.roles?.length > 1}
            />
            {/* Thêm nút refresh nhỏ */}
            <div className="container mx-auto px-6 pt-4 flex justify-end">
              <button
                onClick={() => loadVouchers()}
                className="text-sm text-teal-600 hover:underline flex items-center gap-1"
                disabled={loadingVouchers}
              >
                <i className="fas fa-rotate-right" /> Làm mới
              </button>
            </div>

            <main className="container mx-auto p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Ưu đãi của tôi</h1>
                    <p className="text-slate-500 mt-1">Quản lý các mã khuyến mãi và ưu đãi dành riêng cho bạn.</p>
                </header>

                {/* --- THANH BỘ LỌC MỚI --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                         <div className="flex-1">
                            <label htmlFor="service-filter" className="text-sm font-medium text-slate-600 mb-1 block">Lọc theo dịch vụ</label>
                            <select
                                id="service-filter"
                                value={filterService}
                                onChange={(e) => setFilterService(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="all">Tất cả dịch vụ</option>
                                {mockServices.map(service => (
                                    <option key={service.id} value={service.id}>{service.name}</option>
                                ))}
                            </select>
                         </div>
                         <div className="flex-1">
                            <label htmlFor="sort-by" className="text-sm font-medium text-slate-600 mb-1 block">Sắp xếp</label>
                            <select
                                id="sort-by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="default">Mặc định</option>
                                <option value="expiring_soon">Sắp hết hạn</option>
                            </select>
                         </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('valid')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'valid' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            Còn hiệu lực
                        </button>
                        <button
                            onClick={() => setActiveTab('expired')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'expired' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            Đã hết hạn
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'valid' && renderVoucherList(processedValidVouchers)}
                    {activeTab === 'expired' && renderVoucherList(expiredVouchers)}
                </div>
            </main>
        </div>
    );
};

export default VouchersPage;
