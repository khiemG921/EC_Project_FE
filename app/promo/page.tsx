// app/promo/page.tsx
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import BookingLayout from '../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import { logDev } from '@/lib/utils';

// voucher interface
interface Voucher {
    voucher_code: string;
    detail: string;
    expiry_date: string;
    discount_percentage: number;
}

const VoucherPage = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch voucher từ backend
    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                logDev('Fetching vouchers from API...');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vouchers`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                logDev('API response status:', res.status);
                
                if (!res.ok) {
                    console.error('API response not ok:', res.status, res.statusText);
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                
                const data = await res.json();
                logDev('Vouchers received:', data);
                
                // Handle different response formats
                const vouchers = Array.isArray(data) ? data : 
                                Array.isArray(data.vouchers) ? data.vouchers : 
                                [];
                
                setAllVouchers(vouchers);
            } catch (err) {
                console.error('Error fetching vouchers:', err);
                setAllVouchers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVouchers();
    }, []);

    // Lọc danh sách voucher dựa trên từ khóa tìm kiếm
    const filteredVouchers = useMemo<Voucher[]>(() => {
        if (!searchText) return allVouchers;
        return allVouchers.filter(voucher =>
            (voucher.detail?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
            (voucher.voucher_code?.toLowerCase() || '').includes(searchText.toLowerCase())
        );
    }, [searchText, allVouchers]);

    const handleBack = () => {
        router.back(); // Quay lại trang trước
    };

    const handleConfirm = () => {
        if (selectedVoucherCode) {
            // Lưu mã khuyến mãi vào localStorage
            localStorage.setItem('selectedPromoCode', selectedVoucherCode);

            // Lấy returnUrl từ query string
            const params = new URLSearchParams(window.location.search);
            const returnUrl = params.get('returnUrl');
            const service = params.get('service') || '';

            // Dùng returnUrl để điều hướng
            if (returnUrl) {
                logDev('Quay lại URL:', returnUrl);
                router.push(`${returnUrl}?promo=${selectedVoucherCode}`);
            }
            // Nếu không có returnUrl, kiểm tra service
            else if (service) {
                logDev('Không có returnUrl:', service);
                const returnStep = params.get('returnStep') || '3';

                // Mapping service name to URL
                const serviceUrlMap: Record<string, (step: string, promo: string) => string> = {
                    'hourly': (step, promo) => `/booking/hourly-cleaning?step=${step}&promo=${promo}`,
                    'periodic': (step, promo) => `/booking/periodic-cleaning?step=${step}&promo=${promo}`,
                    'ac-cleaning': (step, promo) => `/booking/ac-cleaning/confirm?promo=${promo}`,
                    'ac': (step, promo) => `/booking/ac-cleaning/confirm?promo=${promo}`,
                    'upholstery': (step, promo) => step === '3' ? `/booking/upholstery/confirm` : `/booking/upholstery/${step === '1' ? 'service' : step === '2' ? 'time' : ''}`,
                    'business': (step, promo) => `/booking/business-cleaning?step=${step}&promo=${promo}`,
                };

                if (serviceUrlMap[service]) {
                    const url = serviceUrlMap[service](returnStep, selectedVoucherCode);
                    router.push(url);
                } else {
                    router.back();
                }
            }
            // Nếu không có returnUrl và không có service, quay lại trang trước
            else {
                logDev('Không có thông tin returnUrl và service, quay lại trang trước');
                router.back();
            }
        }
    };

    // Component hiển thị 1 voucher
    const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
        const isSelected = selectedVoucherCode === voucher.voucher_code;
        const isExpired = new Date(voucher.expiry_date) < new Date();
        const discountValue = voucher.discount_percentage > 0 ? `${voucher.discount_percentage}%` : 'Free';

        return (
            <div className={`rounded-lg flex overflow-hidden shadow-sm transition-all border-2 ${isSelected ? 'border-teal-500' : 'border-transparent'} ${isExpired ? 'opacity-60 bg-slate-100' : 'bg-white'}`}>
                <div className={`w-24 flex-shrink-0 flex flex-col items-center justify-center p-2 text-white ${isExpired ? 'bg-slate-400' : 'bg-teal-500'}`}>
                    <span className="text-2xl font-bold">{discountValue}</span>
                    <span className="text-xs font-semibold">GIẢM</span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800">{voucher.detail}</h3>
                        <p className="text-xs text-slate-500 mt-2">
                            Mã: <code className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{voucher.voucher_code}</code>
                        </p>
                        <p className="text-xs text-slate-500 mt-2">HSD: {new Date(voucher.expiry_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="text-right mt-2">
                        <button
                            onClick={() => setSelectedVoucherCode(voucher.voucher_code)}
                            disabled={isExpired}
                            className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-colors ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'} disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                        >
                            {isSelected ? 'Đã chọn' : 'Chọn'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const footer = (
        <button
            onClick={handleConfirm}
            disabled={!selectedVoucherCode}
            className="w-full p-3 bg-teal-500 text-white font-bold rounded-lg disabled:bg-slate-300"
        >
            Áp dụng
        </button>
    );

    return (
        <>
            <BookingLayout title="Chọn Khuyến Mãi" onBack={handleBack} footer={footer}>
                <div className="space-y-4">
                    {/* Search bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nhập mã khuyến mãi hoặc tìm kiếm..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full p-3 pl-10 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    </div>

                    {/* Danh sách voucher */}
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center text-slate-500 py-8">Đang tải...</p>
                        ) : filteredVouchers.length > 0 ? (
                            filteredVouchers.map(voucher => <VoucherCard key={voucher.voucher_code} voucher={voucher} />)
                        ) : (
                            <p className="text-center text-slate-500 py-8">Không tìm thấy mã khuyến mãi phù hợp.</p>
                        )}
                    </div>
                </div>
            </BookingLayout>
            <style jsx global>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
                .shadow-top{box-shadow:0 -4px 6px -1px #0000001a,0 -2px 4px -2px #0000001a}
            `}</style>
        </>
    );
};

export default VoucherPage;