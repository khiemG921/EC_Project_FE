// app/booking/ac-cleaning/confirm/page.tsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import BookingLayout from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Wallet } from 'lucide-react';
import { logDev } from '@/lib/utils';
import fetchWithAuth from '@/lib/apiClient';

const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';

// --- SHARED CONSTANTS---
const allPricingOptions = [
    {
        id: 38,
        service_id: 5,
        type: 'Treo tường',
        name: 'Máy lạnh treo tường dưới 2HP',
        duration: 1,
    },
    {
        id: 39,
        service_id: 5,
        type: 'Treo tường',
        name: 'Máy lạnh treo tường từ 2HP trở lên',
        duration: 1.5,
    },
    {
        id: 40,
        service_id: 5,
        type: 'Tủ đứng',
        name: 'Máy lạnh tủ đứng',
        duration: 2,
    },
    {
        id: 41,
        service_id: 5,
        type: 'Âm trần',
        name: 'Máy lạnh âm trần',
        duration: 2,
    },
    { id: 42, service_id: 5, type: 'Phụ phí', name: 'Bơm gas', duration: 0.5 },
];

const serviceInfo = { id: 5, name: 'Vệ sinh Máy lạnh' };

// --- Types ---
interface Voucher {
    voucher_code: string;
    discount_percentage: number;
}
interface CheckoutResult {
    totalPrice: number;
    discount: number;
    breakdown: {
        name: string;
        unitPrice: number;
        multiplier?: number;
        subTotal?: number;
    }[];
}
interface FinalConfirmationFormProps {
    bookingData: any;
    goToPromo: () => void;
    checkoutResult: CheckoutResult;
    promoCode: string;
    allVouchers: Voucher[];
    setUseWallet: (use: boolean) => void;
    useWallet: boolean;
    walletBalance: number;
    walletDeduction: number;
    remainingAmount: number;
}

const FinalConfirmationForm: React.FC<FinalConfirmationFormProps> = ({
    bookingData,
    goToPromo,
    checkoutResult,
    promoCode,
    allVouchers,
    setUseWallet,
    useWallet = false,
    walletBalance = 0,
    walletDeduction = 0,
    remainingAmount = 0,
}) => {
    const { selectedItemsList, totalDuration } = useMemo(() => {
        let duration = 0;
        const items = Object.keys(bookingData.selectedItems || {})
            .map((id) => {
                const itemData = allPricingOptions.find(
                    (p) => p.id === parseInt(id)
                );
                const { quantity, addGas } = (bookingData.selectedItems || {})[
                    id
                ];
                if (itemData && quantity > 0) {
                    // duration vẫn lấy từ itemData
                    duration += itemData.duration * quantity;
                }
                return null;
            })
            .filter(Boolean);

        const list = checkoutResult.breakdown.map((bd, idx) => {
                const qty = bd.multiplier || 0;
                // tìm duration từ allPricingOptions
                const opt = allPricingOptions.find((p) => p.name === bd.name);
                if (opt) duration += opt.duration * qty;
                return {
                    id: idx,
                    name: bd.name,
                    quantity: qty,
                    unitPrice: bd.unitPrice,
                    addGas: bd.name === 'Bơm gas',
                };
            });

        return {
            selectedItemsList: list,
            totalDuration: duration,
        };
    }, [bookingData.selectedItems, checkoutResult]);

    const workDateFormatted = bookingData.workDate
        ? (typeof bookingData.workDate === 'string'
              ? new Date(bookingData.workDate)
              : bookingData.workDate
          ).toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '';
    const endTime =
        bookingData.startTime && totalDuration
            ? (() => {
                  const [h, m] = bookingData.startTime.split(':').map(Number);
                  const d = new Date();
                  d.setHours(h, m, 0, 0);
                  d.setHours(d.getHours() + totalDuration);
                  return d;
              })()
            : '';
    const endTimeFormatted = endTime
        ? (endTime as Date).toTimeString().slice(0, 5)
        : '';

    return (
        <div className="space-y-4 text-slate-700">
            <div className="bg-white rounded-xl p-4">
                <h3 className="font-bold text-slate-800 text-lg mb-2">
                    Vị trí làm việc
                </h3>
                <p>{bookingData.address}</p>
            </div>
            <div className="bg-white rounded-xl p-4">
                <h3 className="font-bold text-slate-800 text-lg mb-2">
                    Thông tin công việc
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Ngày làm việc</span>
                        <strong>{workDateFormatted}</strong>
                    </div>
                    <div className="flex justify-between">
                        <span>Làm trong</span>
                        <strong>
                            {totalDuration} giờ, {bookingData.startTime} đến{' '}
                            {endTimeFormatted}
                        </strong>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-4">
                <h3 className="font-bold text-slate-800 text-lg mb-2">
                    Chi tiết công việc
                </h3>
                <div className="space-y-2">
                    {selectedItemsList.map((item: any) => {
                        // Giá đã tính ở unitPrice
                        const unit = item.unitPrice || 0;
                        const total = unit * item.quantity;
                        return (
                            <div
                                key={item.id}
                                className="flex justify-between items-center"
                            >
                                <span>
                                    {item.quantity}x {item.name}
                                </span>
                                <strong>{total.toLocaleString()}đ</strong>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Voucher selection*/}
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
                        {promoCode || 'Chọn mã'}
                        <i className="fas fa-chevron-right ml-2"></i>
                    </span>
                </div>
                {(() => {
                    const voucher = allVouchers.find(
                        (v) => v.voucher_code === promoCode
                    );
                    if (voucher) {
                        const discount = Math.floor(
                            (checkoutResult?.totalPrice ||
                                0 * voucher.discount_percentage) / 100
                        );
                        return (
                            <div className="flex justify-between text-emerald-600 text-sm">
                                <span>Giảm giá voucher</span>
                                <span>
                                    -{checkoutResult?.discount.toLocaleString()}
                                    đ
                                </span>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
            {/* Discount and final price */}
            <div className="bg-white rounded-xl p-4 space-y-2">
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
                            <span>-{walletDeduction.toLocaleString()}đ</span>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-700">Giảm giá</span>
                    <span className="text-green-600 font-bold">
                        -{checkoutResult?.discount.toLocaleString()}đ
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
    );
};

export default function ACConfirmStep() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('acCleaningBookingData');
            if (saved) return JSON.parse(saved);
        }
        return {
            address: '',
            acType: 'Treo tường',
            selectedItems: {},
            workDate: '',
            startTime: '',
            notes: '',
        };
    });
    const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(
        null
    );

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

    // --- Tính toán giá cuối cùng ---
    const finalPrice = checkoutResult
        ? checkoutResult.totalPrice - checkoutResult.discount
        : 0;
    const walletDeduction = useWallet ? Math.min(finalPrice, walletBalance) : 0;
    const remainingAmount = finalPrice - walletDeduction;

    // 1) Mảng voucher từ API
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);

    // 2) Fetch danh sách voucher khi mount
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers`, {
            credentials: 'include',
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                // Nếu API trả về { vouchers: [...] }
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray((data as any).vouchers)
                    ? (data as any).vouchers
                    : [];
                setAllVouchers(list);
            })
            .catch((err) => console.error('Failed to load vouchers:', err));
    }, []);

    // 1) State lưu promoCode
    const [promoCode, setPromoCode] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedPromoCode') || '';
        }
        return '';
    });
    // 2) Đồng bộ promoCode mỗi khi modal chọn promo thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const code = localStorage.getItem('selectedPromoCode') || '';
            setPromoCode(code);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                'acCleaningBookingData',
                JSON.stringify(bookingData)
            );
            // cập nhật promoCode (nếu người dùng vừa chọn mới)
            const stored = localStorage.getItem('selectedPromoCode') || '';
            setPromoCode(stored);
        }
        // Gọi lại API breakdown
        const items = bookingData.selectedItems;
        const payload = {
            wall_mounted_b2: items[38]?.quantity || 0,
            wall_mounted_a2: items[39]?.quantity || 0,
            floor_standing: items[40]?.quantity || 0,
            concealed: items[41]?.quantity || 0,
            gas: Object.values(items).reduce(
                (sum: any, it: any) => sum + (it.addGas ? it.quantity : 0),
                0
            ),
            voucher_code: promoCode,
        };
        if (Object.values(payload).some((v) => v > 0)) {
            fetch('/api/booking/ac-cleaning/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
                .then((r) => r.json())
                .then((data) => {
                    setCheckoutResult(data);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [bookingData, promoCode]);

    const goToPromo = () => {
        router.push(`/promo?service=ac-cleaning&returnStep=4`);
    };
    const handleBack = () => router.push('/booking/ac-cleaning/time');
    const handleConfirm = async () => {
        // 1) Tạo Job trên backend
        try {
            // 1) Tạo Job trên backend
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/job/create`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        serviceId: serviceInfo.id, // hoặc giá trị tương ứng
                        serviceDetailId: (() => {
                            const items = bookingData.selectedItems || {};
                            const details = Object.keys(items)
                                .filter((key) => items[key].quantity > 0)
                                .map((key) => {
                                    const { quantity, addGas } = items[key];
                                    return `${key}:${quantity}${addGas ? '-gas' : ''}`;
                                });
                            return details.length > 0 ? details.join(',') : null;
                        })(),
                        location: bookingData.address, // hoặc toạ độ
                        description: (() => {
                            if (!checkoutResult) return '';
                            return checkoutResult.breakdown
                                .map((item) => {
                                    const qty = item.multiplier || 0;
                                    return qty > 0
                                        ? `${item.name}${
                                              item.name === 'Bơm gas' ? ' + gas' : ''
                                          } x ${qty}`
                                        : '';
                                })
                                .filter(Boolean)
                                .join(', ');
                        })(),
                    }),
                }
            );

            logDev('Create job response:', res);
            if (res.status !== 201) {
                const errorData = await res.json();
                console.error('Failed to create job:', errorData);
                Swal.fire({
                    text: 'Không thể tạo công việc, vui lòng thử lại.',
                    icon: 'warning',
                    confirmButtonColor: '#14b8a6',
                    confirmButtonText: 'Đóng',
                    title: '',
                });
                return;
            }

            // 2) Chuyển sang trang payment
            const job = await res.json();
            localStorage.setItem(
                'paymentInfo',
                JSON.stringify({
                    totalPrice: remainingAmount,
                    jobId: job.job_id,
                    usedCleanCoin: useWallet ? walletDeduction : 0,
                    voucher_code: promoCode || ''
                })
            );
            // Trừ CleanPay (reward_points) nếu khách dùng ví
            if (useWallet && walletDeduction > 0) {
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/customer/substract-cleanpay`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ amount: walletDeduction }),
                    }
                );
            }
            router.push('/payment');
        } catch (err) {
            console.error('Failed to create job:', err);
            Swal.fire({
                text: 'Không thể tạo công việc, vui lòng thử lại.',
                icon: 'warning',
                confirmButtonColor: '#14b8a6',
                confirmButtonText: 'Đóng',
                title: '',
            });
        }
    };
    return (
        <BookingLayout
            title={serviceInfo.name}
            onBack={handleBack}
            footer={
                <div className="flex justify-end">
                    <button
                        className="px-8 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold"
                        onClick={handleConfirm}
                    >
                        Xác nhận dịch vụ
                    </button>
                </div>
            }
        >
            {checkoutResult ? (
                <FinalConfirmationForm
                    bookingData={bookingData}
                    goToPromo={goToPromo}
                    checkoutResult={checkoutResult}
                    promoCode={promoCode}
                    allVouchers={allVouchers}
                    useWallet={useWallet}
                    walletBalance={walletBalance}
                    walletDeduction={walletDeduction}
                    setUseWallet={setUseWallet}
                    remainingAmount={remainingAmount}
                />
            ) : (
                <p className="p-4 text-center">
                    Đang tính toán chi tiết & giá…
                </p>
            )}
        </BookingLayout>
    );
}
