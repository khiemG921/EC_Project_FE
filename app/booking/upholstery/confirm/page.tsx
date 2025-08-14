// app/booking/upholstery/confirm/page.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import BookingLayout from '../../../../components/booking/BookingLayout';
import { serviceInfo, allPricingOptions } from '../bookingConfig';
import { useRouter, useSearchParams } from 'next/navigation';

// Types
interface Voucher {
    voucher_code: string;
    discount_percentage: number;
}

interface BookingData {
    selectedItems: Record<string, number>;
    address?: string;
    workDate?: string;
    startTime?: string;
    notes?: string;
}

interface CheckoutResult {
    breakdown?: { name: string; subTotal: number }[];
    totalPrice?: number;
}

export default function UpholsteryConfirmStep() {
    const router = useRouter();
    // For demo: get bookingData from localStorage or query (should use context/global state in real app)
    const [bookingData, setBookingData] = useState<BookingData>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('upholsteryBookingData');
            if (saved) return JSON.parse(saved);
        }
        return { selectedItems: {} };
    });
    const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
    const searchParams = useSearchParams();
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [promoCode, setPromoCode] = useState('');

    // 1) sync promoCode from ?promo=… or saved selection
  useEffect(() => {
      const fromQuery = searchParams.get('promo');
      const saved = localStorage.getItem('selectedPromoCode');
      if (fromQuery) {
          setPromoCode(fromQuery);
          localStorage.setItem('selectedPromoCode', fromQuery);
          // remove ?promo from URL
          window.history.replaceState({}, '', window.location.pathname);
      } else if (saved) {
          setPromoCode(saved);
      }
  }, [searchParams]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vouchers`, {
            credentials: 'include',
        })
        .then((res) => res.json())
        .then((data) => {
            // if API returns { vouchers: [] } or similar
            const arr = Array.isArray(data)
                ? data
                : Array.isArray(data.vouchers)
                ? data.vouchers
                : [];
            setAllVouchers(arr);
        })
        .catch((err) => console.error('Failed to load vouchers:', err));
    }, []);

    useEffect(() => {
        // Fetch price breakdown from backend
        if (Object.keys(bookingData.selectedItems || {}).length === 0) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout/breakdown`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedItems: bookingData.selectedItems })
        })
            .then((r) => r.json())
            .then(setCheckoutResult)
            .catch(console.error);
    }, [JSON.stringify(bookingData.selectedItems)]);

    const vouchersArr = Array.isArray(allVouchers) ? allVouchers : [];
    const voucher = vouchersArr.find(v => v.voucher_code === promoCode);

    // Price calculation
    const { selectedItemsList, totalPrice, discountAmount, finalPrice } = useMemo(() => {
        let price = 0;
        let items = Object.keys(bookingData.selectedItems || {}).map((id: string) => {
            const itemData = allPricingOptions.find(p => p.id === parseInt(id));
            const quantity = bookingData.selectedItems[id];
            let subTotal = 0;
            if (checkoutResult && checkoutResult.breakdown) {
                const b = checkoutResult?.breakdown?.find((x: any) => x.name === itemData?.name);
                subTotal = b ? b.subTotal : 0;
            } else if (itemData && 'price' in itemData && typeof (itemData as any).price === 'number') {
                subTotal = (itemData as any).price * quantity;
            } else {
                subTotal = 0;
            }
            price += subTotal;
            return itemData ? { ...itemData, quantity, subTotal } : null;
        }).filter(Boolean);
        // Calculate selected voucher before return (ensure it's in the correct scope)
        const discount = voucher ? Math.floor(price * voucher.discount_percentage / 100) : 0;
        return { selectedItemsList: items, totalPrice: price, discountAmount: discount, finalPrice: price - discount };
    }, [bookingData.selectedItems, allVouchers, promoCode, checkoutResult]);

    // Navigation
    const handleBack = () => router.push('/booking/upholstery/time');

    const handleConfirm = async () => {
            // 1) Tạo Job trên backend
        try {
            // 1) Tạo Job trên backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    serviceId: serviceInfo.id, // hoặc giá trị tương ứng
                    serviceDetailId: Object.keys(bookingData.selectedItems).join(','), // danh sách id các mục đã chọn
                    location: bookingData.address, // hoặc toạ độ
                }),
            });

            // 2) Chuyển sang trang payment
            const job = await res.json();
            localStorage.setItem('paymentInfo', JSON.stringify({
                totalPrice: totalPrice,
                jobId: job.job_id,
            }));
            router.push(`/payment`);
            } catch (err) {
                console.error('Failed to create job:', err);
                alert('Không thể tạo công việc, vui lòng thử lại.');
            }
        };

    const goToPromo = () => router.push('/promo?service=upholstery&returnStep=3');

    const workDateFormatted = bookingData.workDate || '';

    return (
        <BookingLayout
            title={serviceInfo.name}
            onBack={handleBack}
            footer={
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-500">Tổng tiền</p>
                        <p className="font-bold text-xl">{finalPrice.toLocaleString()}đ</p>
                    </div>
                    <button className="px-8 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold" onClick={handleConfirm}>
                        Xác nhận dịch vụ
                    </button>
                </div>
            }
        >
            <div className="space-y-4 text-slate-700">
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-teal-500"></i>THÔNG TIN CA LÀM
                    </h3>
                    <p className="pl-6 border-l-2 border-slate-200">{bookingData.address}</p>
                    <p className="pl-6 border-l-2 border-slate-200">{workDateFormatted}, lúc {bookingData.startTime}</p>
                    <p className="pl-6 border-l-2 border-slate-200">{bookingData.notes || 'Không có ghi chú'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-box-open text-teal-500"></i>CHI TIẾT DỊCH VỤ
                    </h3>
                    {selectedItemsList.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <span className="text-slate-600">{item.quantity} x {item.name}</span>
                            <span className="font-semibold">{item.subTotal?.toLocaleString()}đ</span>
                        </div>
                    ))}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                        <span className="text-slate-800">Tổng tiền dịch vụ</span>
                        <span>{totalPrice.toLocaleString()}đ</span>
                    </div>
                </div>
                {/* Voucher selection UI (periodic-cleaning style) */}
                <div className="bg-white rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-gift text-emerald-500"></i>Ưu đãi
                    </h3>
                    <div
                        onClick={goToPromo}
                        className="flex justify-between items-center text-emerald-600 cursor-pointer py-2 border border-emerald-200 rounded-lg px-3 hover:bg-emerald-50 transition-colors"
                    >
                        <span className="flex items-center">
                            <i className="fas fa-ticket-alt mr-2"></i>
                            Mã khuyến mãi
                        </span>
                        <span className="font-semibold flex items-center">
                            {voucher ? voucher.voucher_code : 'Chọn mã'}
                            <i className="fas fa-chevron-right ml-2"></i>
                        </span>
                    </div>
                    {voucher && (
                        <div className="flex justify-between text-emerald-600 text-sm">
                            <span>Giảm giá voucher</span>
                            <span>-{discountAmount.toLocaleString()}đ</span>
                        </div>
                    )}
                </div>
                {/* Discount and final price */}
                <div className="bg-white rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700">Giảm giá</span>
                        <span className="text-green-600 font-bold">-{discountAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-slate-800">Tổng thanh toán</span>
                        <span className="text-teal-600">{finalPrice.toLocaleString()}đ</span>
                    </div>
                </div>
            </div>
        </BookingLayout>
    );
}
