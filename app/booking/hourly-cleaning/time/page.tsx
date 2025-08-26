// app/booking/hourly-cleaning/time/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import BookingLayout, {
    TimePickerModal,
} from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import { logDev } from '@/lib/utils';

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

const serviceInfo = { id: 1, name: 'Giúp Việc Ca Lẻ' };

const TimeSelectionPage = () => {
    const router = useRouter();

    // Helper function to safely access localStorage
    const getSavedBookingData = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('hourlyBookingData');
        }
        return null;
    };
    const savedBookingData = getSavedBookingData() ? JSON.parse(getSavedBookingData()!) : null;
    const [bookingData, setBookingData] = useState({
        staffCount: savedBookingData.staffCount,
        durationId: savedBookingData.durationId,
        address: savedBookingData.address,
        selectedOptionIds: savedBookingData.selectedOptionIds,
        notes: savedBookingData.notes,
        promoCode: savedBookingData.promoCode,
        workDate: savedBookingData.workDate,
        startTime: savedBookingData.startTime,
    });

    const [checkoutResult, setCheckoutResult] = useState<any>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [dates, setDates] = useState<
        Array<{ fullDate: Date; day: number; dayName: string }>
    >([]);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [isDataRestored, setIsDataRestored] = useState(false);
    const [fromServicePage, setFromServicePage] = useState(false);

    // chỉ cho phép footer khi workDate >= hôm nay và startTime >= giờ hiện tại nếu là hôm nay
    const canContinue = useMemo(() => {
        if (!bookingData.workDate || !bookingData.startTime) return false;
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(bookingData.workDate);
        selectedDate.setHours(0, 0, 0, 0);
        // ngày chọn trước hôm nay => không cho tiếp tục
        if (selectedDate < today) return false;

        // nếu chọn ngày hôm nay, thì kiểm tra giờ bắt đầu >= giờ hiện tại
        if (selectedDate.getTime() === today.getTime()) {
            const [h, m] = bookingData.startTime.split(':').map(Number);
            const selectedDateTime = new Date(bookingData.workDate);
            selectedDateTime.setHours(h, m, 0, 0);
            if (selectedDateTime < now) return false;
        }

        return true;
    }, [bookingData.workDate, bookingData.startTime]);

    // Khôi phục booking data từ localStorage khi mount
    useEffect(() => {
        // Check nếu đang navigate từ service page
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const fromService = urlParams.get('fromService') === 'true';

            if (fromService) {
                setFromServicePage(true);
                // Clear URL params
                window.history.replaceState({}, '', window.location.pathname);
            }

            const savedBookingData = getSavedBookingData();
            if (savedBookingData) {
                try {
                    const parsed = JSON.parse(savedBookingData);
                    if (parsed.workDate) {
                        parsed.workDate = new Date(parsed.workDate);
                    }
                    setBookingData(parsed);

                    // Đợi một chút để đảm bảo setState xong
                    setTimeout(
                        () => {
                            logDev('Data restored, setting flag');
                            setIsDataRestored(true);
                        },
                        fromService ? 200 : 50
                    ); // Delay lâu hơn nếu từ service page
                } catch (error) {
                    console.error('Error parsing saved booking data:', error);
                    setIsDataRestored(false);
                }
            } else {
                logDev('No saved data found');
                // Nếu không có data và không phải từ service page thì có thể redirect
                if (!fromService) {
                    logDev(
                        'No data and not from service, should redirect'
                    );
                }
                setIsDataRestored(true);
            }
        } else {
            // Server-side: just set flag to true
            setIsDataRestored(true);
        }
    }, []);

    // Validation logic - chỉ chạy sau khi đã restore
    useEffect(() => {
        if (!isDataRestored || typeof window === 'undefined') {
            logDev(
                'Data not restored yet or server-side, skipping validation'
            );
            return;
        }

        // Wait for one render cycle to ensure state is fully updated
        const timeout = setTimeout(() => {
            logDev('Validation running. Current data:', {
                address: bookingData.address,
                durationId: bookingData.durationId,
                isDataRestored,
                fromServicePage,
            });

            // Chỉ chạy validation nếu không phải từ service page
            if (fromServicePage) {
                logDev('Skipping validation - coming from service page');
                return;
            }

            if (!bookingData.address || !bookingData.durationId) {
                logDev('Missing basic info, redirecting to service step');
                router.replace('/booking/hourly-cleaning/service');
            } else {
                logDev('Validation passed, staying on time page');
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [
        isDataRestored,
        bookingData.address,
        bookingData.durationId,
        router,
        fromServicePage,
    ]);

    // Setup dates
    useEffect(() => {
        const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const today = new Date();
        const next7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return {
                fullDate: date,
                day: date.getDate(),
                dayName:
                    i === 0
                        ? 'H.nay'
                        : i === 1
                        ? 'N.mai'
                        : weekDays[date.getDay()],
            };
        });
        setDates(next7Days);
        if (!bookingData.workDate) {
            setBookingData((prev) => ({
                ...prev,
                workDate: next7Days[1].fullDate,
            })); // Default to tomorrow
        }
    }, []);

    // Lưu booking data vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                'hourlyBookingData',
                JSON.stringify(bookingData)
            );
        }
    }, [bookingData]);

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
                    };

                    logDev('Checkout payload:', payload);

                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/booking/hourly/checkout`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        }
                    );
                    const data = await res.json();
                    logDev('Checkout result:', data);
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

    const selectedDuration = useMemo(() => {
        return (
            allPricingOptions.find((opt) => opt.id === bookingData.durationId)
                ?.hours || 0
        );
    }, [bookingData.durationId]);

    const endTime = useMemo(() => {
        if (!bookingData.startTime) return '';
        const [h, m] = bookingData.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(h, m, 0);
        startDate.setHours(startDate.getHours() + selectedDuration);
        return startDate.toTimeString().slice(0, 5);
    }, [bookingData.startTime, selectedDuration]);

    const handleSelectTime = (time: string) => {
        setBookingData({ ...bookingData, startTime: time });
        setIsTimeModalOpen(false);
    };

    const handleNext = () => {
        router.push('/booking/hourly-cleaning/confirm');
    };

    const handleBack = () => {
        router.push('/booking/hourly-cleaning/service');
    };

    return (
        <>
            <TimePickerModal
                isOpen={isTimeModalOpen}
                onClose={() => setIsTimeModalOpen(false)}
                onSelect={handleSelectTime}
                selectedDate={bookingData.workDate}
            />

            <BookingLayout
                title={serviceInfo.name}
                onBack={handleBack}
                footer={
                    canContinue ? (
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg text-emerald-600 flex items-center">
                                    {isCheckoutLoading || !checkoutResult ? (
                                        <span
                                            className="inline-block w-6 h-6 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"
                                            aria-label="Loading"
                                        />
                                    ) : (
                                        `${(
                                            checkoutResult?.totalPrice || 0
                                        ).toLocaleString()}đ`
                                    )}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {bookingData.staffCount} nhân viên x{' '}
                                    {allPricingOptions.find(
                                        (d) => d.id === bookingData.durationId
                                    )?.hours || 0}
                                    h
                                </p>
                            </div>
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    ) : null
                }
            >
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4">
                        <label className="text-xs font-bold text-slate-400 mb-2 block">
                            NGÀY LÀM
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {dates.map((d) => (
                                <button
                                    key={d.fullDate.toISOString()}
                                    onClick={() =>
                                        setBookingData({
                                            ...bookingData,
                                            workDate: d.fullDate,
                                        })
                                    }
                                    className={`p-2 rounded-lg text-center border-2 ${
                                        bookingData.workDate?.toDateString() ===
                                        d.fullDate.toDateString()
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <span className="font-bold block">
                                        {d.dayName}
                                    </span>
                                    <span className="text-xs block">{`${
                                        d.day
                                    }/${d.fullDate.getMonth() + 1}`}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                        <label className="text-xs font-bold text-slate-400 mb-2 block">
                            GIỜ LÀM VIỆC
                        </label>
                        <button
                            onClick={() => setIsTimeModalOpen(true)}
                            className="w-full p-3 bg-slate-100 rounded-lg text-slate-800 font-semibold text-center"
                        >
                            {bookingData.startTime
                                ? `${bookingData.startTime} - ${endTime}`
                                : 'Chọn giờ bắt đầu'}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                        <label className="text-xs font-bold text-slate-400 mb-2 block">
                            GHI CHÚ
                        </label>
                        <textarea
                            value={bookingData.notes}
                            onChange={(e) =>
                                setBookingData({
                                    ...bookingData,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Các lưu ý của quý khách dành cho nhân viên giúp việc..."
                            className="w-full p-3 bg-slate-100 rounded-lg"
                            rows={4}
                        />
                    </div>
                </div>
            </BookingLayout>
        </>
    );
};

export default TimeSelectionPage;
