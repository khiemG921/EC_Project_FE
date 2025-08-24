// app/booking/upholstery/confirm/page.tsx
'use client';
import React, { useEffect, useMemo, useState, Suspense } from 'react';
import BookingLayout from '../../../../components/booking/BookingLayout';
import { serviceInfo, allPricingOptions } from '../bookingConfig';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wallet } from 'lucide-react';
import fetchWithAuth from '@/lib/apiClient';

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
    promoCode?: string;
}

interface CheckoutResult {
    breakdown?: { name: string; multiplier: number; subTotal: number }[];
    totalPrice?: number;
    discount?: number;
}

function UpholsteryConfirmContent() {
    const router = useRouter();

    const [bookingData, setBookingData] = useState<BookingData>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('upholsteryBookingData');
            if (saved) return JSON.parse(saved);
        }
        return { selectedItems: {} };
    });
    const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(
        null
    );
    const searchParams = useSearchParams();
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [promoCode, setPromoCode] = useState('');

    // --- State cho ví CleanPay ---
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);

    // --- Fetch số dư ví CleanPay (reward_points) ---
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/customer/reward-points`,
                    { credentials: 'include' }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!aborted) {
                    setWalletBalance(Number(data?.reward_points) || 0);
                }
            } catch (err) {
                console.error('Failed to fetch CleanPay balance:', err);
            }
        })();
        return () => {
            aborted = true;
        };
    }, []);

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
        if (Object.keys(bookingData.selectedItems || {}).length === 0) return;
        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking/upholstery/checkout`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedItems: bookingData.selectedItems,
                    voucher_code: promoCode,
                }),
            }
        )
            .then((r) => r.json())
            .then(setCheckoutResult)
            .catch(console.error);
    }, [JSON.stringify(bookingData.selectedItems), promoCode]);

    const vouchersArr = Array.isArray(allVouchers) ? allVouchers : [];
    const voucher = vouchersArr.find((v) => v.voucher_code === promoCode);

    // Price calculation
    const { selectedItemsList, totalPrice, discountAmount, finalPrice } =
        useMemo(() => {
            // dựng danh sách items từ breakdown
            const items = (checkoutResult?.breakdown || []).map((bd, idx) => {
                return {
                    id: idx,
                    name: bd.name,
                    quantity: bd.multiplier,
                    subTotal: bd.subTotal,
                };
            });
            const total = checkoutResult?.totalPrice ?? 0;
            const discount = checkoutResult?.discount ?? 0;
            return {
                selectedItemsList: items,
                totalPrice: total,
                discountAmount: discount,
                finalPrice: total - discount,
            };
        }, [checkoutResult]);

    // --- Tính toán giá cuối cùng ---
    const walletDeduction = useWallet ? Math.min(finalPrice, walletBalance) : 0;
    const remainingAmount = finalPrice - walletDeduction;

    // Navigation
    const handleBack = () => router.push('/booking/upholstery/time');

    const handleConfirm = async () => {
        try {
            // 1) Tạo Job trên backend
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/job/create`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        serviceId: serviceInfo.id, // hoặc giá trị tương ứng
                        serviceDetailId: Object.keys(
                            bookingData.selectedItems
                        ).join(','), // danh sách id các mục đã chọn
                        location: bookingData.address, // hoặc toạ độ
                        description:
                            checkoutResult?.breakdown
                                ?.map(
                                    (item) =>
                                        `${item.name} x ${item.multiplier}`
                                )
                                .join(', ') || '',
                    }),
                }
            );

            // 2) Chuyển sang trang payment
            const job = await res.json();
            localStorage.setItem(
                'paymentInfo',
                JSON.stringify({
                    totalPrice: remainingAmount,
                    jobId: job.job_id,
                    usedCleanCoin: useWallet ? walletDeduction : 0,
                    voucher_code: bookingData.promoCode || '',
                })
            );
            // Trừ CleanPay (reward_points) nếu khách dùng ví
            if (useWallet && walletDeduction > 0) {
                await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/customer/substract-cleanpay`,
                    {
                        method: 'POST',
                        body: JSON.stringify({ amount: walletDeduction }),
                    }
                );
            }
            router.push('/payment');
        } catch (err) {
            console.error('Failed to create job:', err);
            alert('Không thể tạo công việc, vui lòng thử lại.');
        }
    };

    const goToPromo = () =>
        router.push('/promo?service=upholstery&returnStep=3');

    const workDateFormatted = bookingData.workDate || '';

    return (
        <BookingLayout
            title={serviceInfo.name}
            onBack={handleBack}
            footer={
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-500">Tổng tiền</p>
                        <p className="font-bold text-xl">
                            {finalPrice.toLocaleString()}đ
                        </p>
                    </div>
                    <button
                        className="px-8 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold"
                        onClick={handleConfirm}
                    >
                        Xác nhận dịch vụ
                    </button>
                </div>
            }
        >
            <div className="space-y-4 text-slate-700">
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-teal-500"></i>
                        THÔNG TIN CA LÀM
                    </h3>
                    <p className="pl-6 border-l-2 border-slate-200">
                        {bookingData.address}
                    </p>
                    <p className="pl-6 border-l-2 border-slate-200">
                        {workDateFormatted}, lúc {bookingData.startTime}
                    </p>
                    <p className="pl-6 border-l-2 border-slate-200">
                        {bookingData.notes || 'Không có ghi chú'}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-box-open text-teal-500"></i>CHI
                        TIẾT DỊCH VỤ
                    </h3>
                    {selectedItemsList.map((item: any) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-center"
                        >
                            <span className="text-slate-600">
                                {item.quantity} x {item.name}
                            </span>
                            <span className="font-semibold">
                                {item.subTotal?.toLocaleString()}đ
                            </span>
                        </div>
                    ))}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                        <span className="text-slate-800">
                            Tổng tiền dịch vụ
                        </span>
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
                    {/* --- ví CleanPay --- */}
                    <div className="pt-2 border-t border-slate-200 mt-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Wallet size={18} className="text-teal-500" />
                                <div>
                                    <p
                                        className={`font-semibold ${
                                            walletBalance > 0
                                                ? 'text-slate-700'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        Ví CleanPay
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Số dư: {walletBalance.toLocaleString()}đ
                                        {walletBalance === 0 && (
                                            <span className="text-red-500 ml-2">
                                                Không đủ CleanCoin
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <label
                                htmlFor="useWalletToggle"
                                className="relative inline-flex items-center cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    id="useWalletToggle"
                                    className="sr-only peer"
                                    checked={useWallet}
                                    onChange={() => setUseWallet(!useWallet)}
                                    disabled={walletBalance === 0}
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 peer-disabled:cursor-not-allowed peer-disabled:bg-slate-100"></div>
                            </label>
                        </div>
                        {useWallet && walletBalance > 0 && (
                            <div className="flex justify-between text-blue-600 mt-2">
                                <span>Sử dụng CleanCoin</span>
                                <span>
                                    -{walletDeduction.toLocaleString()}đ
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Discount and final price */}
                <div className="bg-white rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700">Giảm giá</span>
                        <span className="text-green-600 font-bold">
                            -{discountAmount.toLocaleString()}đ
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-slate-800">Thành tiền</span>
                        <span className="text-teal-600">
                            {remainingAmount.toLocaleString()}đ
                        </span>
                    </div>
                </div>
            </div>
        </BookingLayout>
    );
}

export default function UpholsteryConfirmStep() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
                </div>
            }
        >
            <UpholsteryConfirmContent />
        </Suspense>
    );
}
