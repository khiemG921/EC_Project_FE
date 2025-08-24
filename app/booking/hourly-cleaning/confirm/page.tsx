// app/booking/hourly-cleaning/confirm/page.tsx
'use client';

import BookingLayout from '../../../../components/booking/BookingLayout';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { logDev } from '@/lib/utils';
import Swal from 'sweetalert2';

// --- DỮ LIỆU DỊCH VỤ ---
const allPricingOptions = [
    {
        id: 1,
        service_id: 1,
        type: 'Thời Lượng',
        name: '2 Giờ - Tối đa 60m^2',
        hours: 2,
    },
    {
        id: 2,
        service_id: 1,
        type: 'Thời Lượng',
        name: '3 Giờ - Tối đa 90m^2',
        hours: 3,
    },
    {
        id: 3,
        service_id: 1,
        type: 'Thời Lượng',
        name: '4 Giờ - Tối đa 110m^2',
        hours: 4,
    },
    { id: 4, service_id: 1, type: 'Tùy Chọn', name: 'Sử dụng máy hút bụi' },
    {
        id: 99,
        service_id: 1,
        type: 'Tùy Chọn',
        name: 'Dụng cụ & Chất tẩy rửa cơ bản',
    },
    {
        id: 5,
        service_id: 1,
        type: 'Dịch Vụ Thêm',
        name: 'Nấu ăn',
        hours: 1,
        icon: 'fas fa-utensils',
    },
    {
        id: 6,
        service_id: 1,
        type: 'Dịch Vụ Thêm',
        name: 'Giặt ủi',
        hours: 1,
        icon: 'fas fa-tshirt',
    },
];

const serviceOptions = {
    duration: allPricingOptions.filter(
        (p) => p.service_id === 1 && p.type === 'Thời Lượng'
    ),
    extra: allPricingOptions.filter(
        (p) => p.service_id === 1 && p.type === 'Dịch Vụ Thêm'
    ),
    other: allPricingOptions.filter(
        (p) => p.service_id === 1 && p.type === 'Tùy Chọn'
    ),
};

const serviceInfo = { id: 1, name: 'Giúp Việc Ca Lẻ' };

const ConfirmationPage = () => {
    const router = useRouter();

    const [bookingData, setBookingData] = useState({
        staffCount: 1,
        durationId: 2,
        address: '',
        selectedOptionIds: [99],
        notes: '',
        promoCode: '',
        workDate: null as Date | null,
        startTime: '',
    });

    const [checkoutResult, setCheckoutResult] = useState<any>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [isDataRestored, setIsDataRestored] = useState(false);

    // --- State cho ví CleanPay ---
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);

    // --- Fetch số dư ví CleanPay (reward_points) ---
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                const res = await fetch(
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

    // Khôi phục booking data từ localStorage khi mount
    useEffect(() => {
        const savedBookingData = localStorage.getItem('hourlyBookingData');
        if (savedBookingData) {
            try {
                const parsed = JSON.parse(savedBookingData);
                if (parsed.workDate) {
                    parsed.workDate = new Date(parsed.workDate);
                }
                setBookingData(parsed);
            } catch (error) {
                console.error('Error parsing saved booking data:', error);
            }
        }
        setIsDataRestored(true);
    }, []);

    // Xử lý promo code riêng biệt
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const promoFromQuery = params.get('promo');
        const savedPromoCode = localStorage.getItem('selectedPromoCode');

        if (promoFromQuery) {
            logDev('Get voucher from URL:', promoFromQuery);
            localStorage.setItem('selectedPromoCode', promoFromQuery);
            setPromoCode(promoFromQuery);

            // Chờ cho booking data được restore xong
            if (isDataRestored) {
                setBookingData((prev) => {
                    return { ...prev, promoCode: promoFromQuery };
                });

                // Clear URL params after processing promo code
                window.history.replaceState({}, '', window.location.pathname);
            }
        } else if (savedPromoCode && isDataRestored) {
            setPromoCode(savedPromoCode);
            setBookingData((prev) => ({ ...prev, promoCode: savedPromoCode }));
        }
    }, [isDataRestored]); // Chạy lại khi isDataRestored thay đổi

    // Đồng bộ hóa promoCode với bookingData
    useEffect(() => {
        if (bookingData.promoCode) {
            setPromoCode(bookingData.promoCode);
        }
    }, [bookingData.promoCode]);

    // Gọi checkout API
    useEffect(() => {
        if (bookingData.durationId) {
            const timeoutId = setTimeout(async () => {
                setIsCheckoutLoading(true);
                try {
                    const durationObj = allPricingOptions.find(
                        (d) => d.id === bookingData.durationId
                    );
                    if (!durationObj) return;

                    const payload = {
                        staff_count: bookingData.staffCount,
                        cleaning_duration: durationObj.hours,
                        vacuum: bookingData.selectedOptionIds.includes(4),
                        cooking: bookingData.selectedOptionIds.includes(5),
                        laundry: bookingData.selectedOptionIds.includes(6),
                        voucher_code: bookingData.promoCode || null,
                    };

                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/booking/hourly/checkout`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        }
                    );
                    const data = await res.json();
                    setCheckoutResult(data);
                } catch (error) {
                    console.error('Error fetching checkout data:', error);
                } finally {
                    setIsCheckoutLoading(false);
                }
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [
        bookingData.staffCount,
        bookingData.durationId,
        bookingData.selectedOptionIds,
        bookingData.promoCode,
    ]);

    const { totalDuration, notSelectedExtras } = useMemo(() => {
        let duration = 0;

        const durationOption = allPricingOptions.find(
            (d) => d.id === bookingData.durationId
        );
        if (durationOption) {
            duration += durationOption.hours || 0;
        }

        bookingData.selectedOptionIds.forEach((id: number) => {
            const option = allPricingOptions.find((o) => o.id === id);
            if (option && option.hours) {
                duration += option.hours;
            }
        });

        const allExtraServiceIds = serviceOptions.extra.map((s) => s.id);
        const selectedExtraServiceIds = bookingData.selectedOptionIds.filter(
            (id: number) => allExtraServiceIds.includes(id)
        );
        const notSelected = serviceOptions.extra.filter(
            (s) => !selectedExtraServiceIds.includes(s.id)
        );

        return {
            totalDuration: duration,
            notSelectedExtras: notSelected,
        };
    }, [bookingData]);

    // Lấy danh sách extra đã chọn
    const selectedExtras = useMemo(
        () =>
            serviceOptions.extra.filter((s) =>
                bookingData.selectedOptionIds.includes(s.id)
            ),
        [bookingData.selectedOptionIds]
    );

    const workDateFormatted = bookingData.workDate
        ? bookingData.workDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '';

    const endTime =
        bookingData.startTime && totalDuration
            ? new Date(
                  new Date().toDateString() + ' ' + bookingData.startTime
              ).getTime() +
              totalDuration * 60 * 60 * 1000
            : '';
    const endTimeFormatted = endTime
        ? new Date(endTime).toTimeString().slice(0, 5)
        : '';

    const basePrice =
        checkoutResult?.breakdown?.find((b: any) => b.service === 'hourly')
            ?.unitPrice ?? 0;
    const totalPrice = checkoutResult?.totalPrice || 0;

    // Compute pricing with wallet
    const walletDeduction = useWallet ? Math.min(totalPrice, walletBalance) : 0;
    const remainingAmount = totalPrice - walletDeduction;

    const goToPromo = () => {
        router.push(
            `/promo?service=hourly&returnUrl=${encodeURIComponent(
                '/booking/hourly-cleaning/confirm'
            )}`
        );
    };

    const handleBack = () => {
        router.push('/booking/hourly-cleaning/time');
    };

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
                        serviceId: serviceInfo.id,
                        serviceDetailId:
                            checkoutResult &&
                            checkoutResult.breakdown &&
                            checkoutResult.breakdown.length > 0
                                ? checkoutResult.breakdown
                                      .map((item: any) => item.detail_id)
                                      .join(',')
                                : null,
                        description:
                            checkoutResult &&
                            checkoutResult.breakdown &&
                            checkoutResult.breakdown.length > 0
                                ? checkoutResult.breakdown
                                      .map(
                                          (item: any) =>
                                              `(${item.name}) x ${bookingData.staffCount}`
                                      )
                                      .join(', ')
                                : null,
                        location: bookingData.address,
                        totalDuration: totalDuration,
                    }),
                }
            );
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

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

    // Loading skeleton - show while data is being restored or checkout is loading
    if (!isDataRestored || isCheckoutLoading) {
        return (
            <BookingLayout
                title={serviceInfo.name}
                onBack={handleBack}
                footer={
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-500">
                                Đang tính giá...
                            </p>
                            <p className="font-bold text-xl text-slate-400">
                                ---đ
                            </p>
                        </div>
                        <button
                            disabled
                            className="px-8 py-3 rounded-lg bg-slate-300 text-white font-bold cursor-not-allowed"
                        >
                            Đang tải...
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 text-slate-700">
                    <div className="bg-white rounded-xl p-4 space-y-3">
                        <div className="h-6 bg-slate-200 rounded animate-pulse mb-3"></div>
                        <div className="h-4 bg-slate-100 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-slate-100 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-slate-100 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-white rounded-xl p-4 space-y-3">
                        <div className="h-6 bg-slate-200 rounded animate-pulse mb-3"></div>
                        <div className="flex justify-between">
                            <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
                            <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4"></div>
                        </div>
                    </div>
                </div>
            </BookingLayout>
        );
    }

    return (
        <BookingLayout
            title={serviceInfo.name}
            onBack={handleBack}
            footer={
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-500">Tổng tiền</p>
                        <p className="font-bold text-lg text-emerald-600 flex items-center">
                            {isCheckoutLoading || !checkoutResult ? (
                                <span
                                    className="inline-block w-6 h-6 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"
                                    aria-label="Loading"
                                />
                            ) : (
                                `${(
                                    checkoutResult.totalPrice ?? 0
                                ).toLocaleString()}đ`
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                    >
                        Xác nhận dịch vụ
                    </button>
                </div>
            }
        >
            <div className="space-y-4 text-slate-700">
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-emerald-500"></i>
                        THÔNG TIN CA LÀM
                    </h3>
                    <p className="pl-6 border-l-2 border-emerald-200">
                        <strong>Địa chỉ:</strong>{' '}
                        {bookingData.address || 'Chưa nhập địa chỉ'}
                    </p>
                    <p className="pl-6 border-l-2 border-emerald-200">
                        <strong>Thời gian:</strong>{' '}
                        {workDateFormatted || 'Chưa chọn ngày'}
                    </p>
                    <p className="pl-6 border-l-2 border-emerald-200">
                        <strong>Giờ làm:</strong>{' '}
                        {bookingData.startTime
                            ? `${bookingData.startTime} - ${endTimeFormatted} (${totalDuration} giờ)`
                            : 'Chưa chọn giờ làm'}
                    </p>
                    <p className="pl-6 border-l-2 border-emerald-200">
                        <strong>Ghi chú:</strong>{' '}
                        {bookingData.notes || 'Không có ghi chú'}
                    </p>

                    {(!bookingData.address ||
                        !bookingData.workDate ||
                        !bookingData.startTime) && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                            <strong>Lưu ý:</strong> Một số thông tin chưa được
                            điền. Vui lòng quay lại các bước trước để hoàn tất.
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-box-open text-emerald-500"></i>
                        GÓI DỊCH VỤ
                    </h3>
                    <div className="flex justify-between">
                        <span>
                            Phí dịch vụ ({bookingData.staffCount} nhân viên x{' '}
                            {bookingData.durationId} giờ)
                        </span>
                        <span className="font-semibold">
                            {basePrice.toLocaleString()}đ
                        </span>
                    </div>
                    {selectedExtras.length > 0 && (
                        <>
                            <hr className="border-emerald-100" />
                            <p className="text-sm font-semibold text-slate-600">
                                Dịch vụ thêm
                            </p>
                            <ul className="list-none space-y-1 pl-4 text-sm">
                                {selectedExtras.map((extra) => {
                                    // map id sang key trong breakdown: 4→vacuum,5→cooking,6→laundry
                                    const svcKey =
                                        extra.id === 4
                                            ? 'Sử dụng máy hút bụi'
                                            : extra.id === 5
                                            ? 'Nấu ăn'
                                            : extra.id === 6
                                            ? 'Giặt ủi'
                                            : '';
                                    const entry =
                                        checkoutResult?.breakdown?.find(
                                            (b: any) => b.name === svcKey
                                        );
                                    return (
                                        <li
                                            key={extra.id}
                                            className="flex justify-between"
                                        >
                                            <span>{extra.name}</span>
                                            <span>
                                                {entry?.unitPrice?.toLocaleString() ||
                                                    0}
                                                đ
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                    {notSelectedExtras.length > 0 && (
                        <>
                            <hr className="border-emerald-100" />
                            <p className="text-sm font-semibold text-slate-600">
                                Không bao gồm các dịch vụ:
                            </p>
                            <ul className="list-disc list-inside text-slate-500 text-sm">
                                {notSelectedExtras.map((s) => (
                                    <li key={s.id}>{s.name}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                <div className="bg-white rounded-xl p-4 space-y-3">
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

                    {checkoutResult?.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Giảm giá</span>
                            <span className="font-semibold">
                                -{checkoutResult.discount.toLocaleString()}đ
                            </span>
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

                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-money-bill-wave text-emerald-500"></i>
                        THANH TOÁN
                    </h3>
                    <div className="flex justify-between">
                        <span>Tạm tính</span>
                        <span className="font-semibold">
                            {(
                                checkoutResult?.totalPrice +
                                    checkoutResult?.discount || '___'
                            ).toLocaleString()}
                            đ
                        </span>
                    </div>
                    {bookingData.promoCode && (
                        <div className="flex justify-between text-green-600">
                            <span>Giảm giá voucher</span>
                            <span>
                                -{checkoutResult?.discount.toLocaleString()}đ
                            </span>
                        </div>
                    )}
                    <hr className="border-emerald-100" />
                    <div className="flex justify-between font-bold text-slate-800 text-lg">
                        <span>Thành tiền</span>
                        <span className="text-emerald-600">
                            {(totalPrice - walletDeduction).toLocaleString()}đ
                        </span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
            `}</style>
        </BookingLayout>
    );
};

export default ConfirmationPage;
