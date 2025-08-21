// app/booking/periodic-cleaning/confirm/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import BookingLayout from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import {
    serviceInfo,
    weekDays,
    timeSlots,
    pricingData,
    getExtraServicesWithPrices,
    getScheduleSummary,
} from '../bookingConfig';

const ConfirmStep = () => {
    const router = useRouter();

    // --- state ---
    const [bookingData, setBookingData] = useState<any>({});
    const [allVouchers, setAllVouchers] = useState<any[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [checkoutResult, setCheckoutResult] = useState<any>(null);
    const [isDataRestored, setIsDataRestored] = useState(false);

    // --- State cho ví CleanPay ---
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);

    useEffect(() => {
        const savedBookingData = localStorage.getItem('periodicBookingData');
        if (savedBookingData) {
            try {
                const parsed = JSON.parse(savedBookingData);
                console.log('Khôi phục dữ liệu từ localStorage:', parsed);
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

    // Xử lý promo code riêng biệt
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const promoFromQuery = params.get('promo');
        const savedPromoCode = localStorage.getItem('selectedPromoCode');

        if (promoFromQuery) {
            localStorage.setItem('selectedPromoCode', promoFromQuery);
            setPromoCode(promoFromQuery);

            // Chờ cho booking data được restore xong
            if (isDataRestored) {
                setBookingData((prev: any) => {
                    console.log(
                        'Updating booking data with promo:',
                        promoFromQuery
                    );
                    return { ...prev, promoCode: promoFromQuery };
                });

                // Clear URL params after processing promo code
                window.history.replaceState({}, '', window.location.pathname);
            }
        } else if (savedPromoCode && isDataRestored) {
            console.log('Update voucher localStorage:', savedPromoCode);
            setPromoCode(savedPromoCode);
            setBookingData((prev: any) => ({
                ...prev,
                promoCode: savedPromoCode,
            }));
        }
    }, [isDataRestored]); // Chạy lại khi isDataRestored thay đổi

    // Đồng bộ hóa promoCode với bookingData
    useEffect(() => {
        if (bookingData.promoCode) {
            console.log('🔄 Sync promoCode display:', bookingData.promoCode);
            setPromoCode(bookingData.promoCode);
        }
    }, [bookingData.promoCode]);

    useEffect(() => {
        // Gọi API tính toán lại xèng khi bookingData thay đổiiiii
        if (
            !bookingData.hoursPerSession ||
            !bookingData.sessionsPerWeek ||
            !bookingData.packageDuration
        )
            return;
        const payload = {
            duration: bookingData.hoursPerSession,
            daysPerWeek: bookingData.sessionsPerWeek,
            months: bookingData.packageDuration,
            cooking: bookingData.extraServices?.includes(11),
            shopping: bookingData.extraServices?.includes(12),
            laundry: bookingData.extraServices?.includes(13),
            vacuum: bookingData.extraServices?.includes(14),
            voucher_code: bookingData.promoCode || '',
        };
        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking/periodic/checkout`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        )
            .then((res) => res.json())
            .then((data) => setCheckoutResult(data));
    }, [bookingData]);

    const vouchersArr = Array.isArray(allVouchers) ? allVouchers : [];
    const voucher = vouchersArr.find((v) => v.voucher_code === promoCode);
    const promoDiscountAmount =
        voucher && checkoutResult
            ? (checkoutResult.totalPrice * voucher.discount_percentage) / 100
            : 0;
    const scheduleSummary = getScheduleSummary(bookingData.schedule);
    const extraConfig = getExtraServicesWithPrices(bookingData.extraServices);
    // Lấy các mục từ breakdown (API) có name khớp với dịch vụ thêm đã chọn
    const extraServicesWithPrices =
        checkoutResult?.breakdown?.filter((item: any) =>
            extraConfig.some((e) => e?.name === item.name)
        ) || [];

    // --- Tính toán giá cuối cùng ---
    const finalPrice = checkoutResult
        ? checkoutResult.totalPrice - promoDiscountAmount
        : 0;
    const walletDeduction = useWallet ? Math.min(finalPrice, walletBalance) : 0;
    const remainingAmount = finalPrice - walletDeduction;

    const goToPromo = () => {
        router.push(
            '/promo?service=periodic-cleaning&returnUrl=/booking/periodic-cleaning/confirm'
        );
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
                        serviceId: serviceInfo.id, // hoặc giá trị tương ứng
                        serviceDetailId:
                            bookingData.extraServices &&
                            bookingData.extraServices.length > 0
                                ? bookingData.extraServices.join(',')
                                : null,
                        description:
                            checkoutResult && checkoutResult.breakdown
                                ? '(' +
                                  checkoutResult.breakdown
                                      .map((item: any) => `${item.name}`)
                                      .join(', ') +
                                  ')' +
                                  ` x ${bookingData.hoursPerSession} x ${bookingData.sessionsPerWeek} x ${bookingData.packageDuration} tháng`
                                : '',
                        location: bookingData.address, // hoặc toạ độ
                    }),
                }
            );

            // 2) Chuyển sang trang payment
            const job = await res.json();
            localStorage.setItem(
                'paymentInfo',
                JSON.stringify({
                    ttotalPrice: remainingAmount,
                    jobId: job.job_id,
                    usedCleanCoin: useWallet ? walletDeduction : 0,
                    voucher_code: bookingData.promoCode || '',
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
            alert('Không thể tạo công việc, vui lòng thử lại.');
        }
    };

    return (
        <BookingLayout
            title="Dọn dẹp Định kỳ - Xác nhận"
            onBack={() => router.push('/booking/periodic-cleaning/time')}
            footer={
                <button
                    onClick={handleConfirm}
                    className="px-8 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold w-full mt-4"
                >
                    Xác nhận dịch vụ
                </button>
            }
        >
            <div className="space-y-4 text-slate-700">
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-teal-500"></i>
                        ĐỊA ĐIỂM
                    </h3>
                    <p>{bookingData.address}</p>
                </div>
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-teal-500"></i>
                        LỊCH TRÌNH
                    </h3>
                    <div className="flex justify-between">
                        <span>Tần suất:</span>{' '}
                        <strong>
                            {bookingData.sessionsPerWeek} buổi/tuần,{' '}
                            {bookingData.hoursPerSession}h/buổi
                        </strong>
                    </div>
                    <div className="flex justify-between">
                        <span>Lịch cố định:</span>{' '}
                        <strong className="text-right">
                            {scheduleSummary}
                        </strong>
                    </div>
                    <div className="flex justify-between">
                        <span>Ngày bắt đầu:</span>{' '}
                        <strong>
                            {bookingData.startDate
                                ? new Date(
                                      bookingData.startDate
                                  ).toLocaleDateString('vi-VN')
                                : ''}
                        </strong>
                    </div>
                    <div className="flex justify-between">
                        <span>Gói dịch vụ:</span>{' '}
                        <strong>{bookingData.packageDuration} tháng</strong>
                    </div>
                </div>
                {extraServicesWithPrices.length > 0 && (
                    <div className="bg-white rounded-xl p-4 space-y-2">
                        <h3 className="font-bold text-slate-800 mb-2">
                            Dịch vụ thêm
                        </h3>
                        {extraServicesWithPrices.map((e: any) => (
                            <div key={e.name} className="flex justify-between">
                                <span>{e.name}</span>
                                <strong>
                                    {e.unitPrice.toLocaleString()}đ/buổi
                                    <span className="text-slate-500 text-xs">
                                        (x{e.multiplier} buổi)
                                    </span>
                                </strong>
                            </div>
                        ))}
                    </div>
                )}
                {/* Voucher*/}
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
                            <span>
                                -{promoDiscountAmount.toLocaleString()}đ
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
                {/* Thanh toán */}
                <div className="bg-white rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-money-bill-wave text-teal-500"></i>
                        THANH TOÁN
                    </h3>
                    {checkoutResult && (
                        <>
                            <div className="flex justify-between">
                                <span>
                                    Tạm tính ({bookingData.packageDuration}{' '}
                                    tháng)
                                </span>
                                <span>
                                    {(
                                        checkoutResult.totalPrice +
                                        (checkoutResult?.discount || 0)
                                    ).toLocaleString()}
                                    đ
                                </span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Giảm giá gói</span>
                                <span>
                                    -
                                    {(
                                        checkoutResult?.discount || 0
                                    ).toLocaleString()}
                                    đ
                                </span>
                            </div>
                            {voucher && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá voucher</span>
                                    <span>
                                        -{promoDiscountAmount.toLocaleString()}đ
                                    </span>
                                </div>
                            )}
                            <hr />
                            <div className="flex justify-between font-bold text-slate-800 text-lg">
                                <span>Thành tiền</span>
                                <span>{remainingAmount.toLocaleString()}đ</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </BookingLayout>
    );
};

export default ConfirmStep;
