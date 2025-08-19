// app/booking/ac-cleaning/confirm/page.tsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import BookingLayout from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

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

const FinalConfirmationForm = ({
    bookingData,
    goToPromo,
    checkoutResult,
}: {
    bookingData: any;
    goToPromo: () => void;
    checkoutResult: CheckoutResult;
}) => {
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [promoCode, setPromoCode] = useState('');

    useEffect(() => {
        // Lấy mã khuyến mãi đã chọn từ localStorage
        const code = localStorage.getItem('selectedPromoCode') || '';
        setPromoCode(code);

        // Fetch danh sách voucher
        fetch(`${API_BASE_URL}/vouchers`)
            .then((res) => res.json())
            .then((data) => setAllVouchers(data));
    }, []);

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

        const list = checkoutResult.breakdown
            .map((bd, idx) => {
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
                        {(() => {
                            const voucher = allVouchers.find(
                                (v) => v.voucher_code === promoCode
                            );
                            return voucher ? voucher.voucher_code : 'Chọn mã';
                        })()}
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
                <div className="flex justify-between items-center">
                    <span className="text-slate-700">Giảm giá</span>
                    <span className="text-green-600 font-bold">
                        -{checkoutResult?.discount.toLocaleString()}đ
                    </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-slate-800">Tổng thanh toán</span>
                    <span className="text-teal-600">
                        {checkoutResult?.totalPrice.toLocaleString()}đ
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

            // 2) Chuyển sang trang payment
            const job = await res.json();
            localStorage.setItem(
                'paymentInfo',
                JSON.stringify({
                    totalPrice: checkoutResult?.totalPrice || 0,
                    jobId: job.job_id,
                })
            );
            router.push(`/payment`);
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
                />
            ) : (
                <p className="p-4 text-center">
                    Đang tính toán chi tiết & giá…
                </p>
            )}
        </BookingLayout>
    );
}
