// app/booking/hourly-cleaning/time/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import BookingLayout, { TimePickerModal } from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';

// --- DỮ LIỆU DỊCH VỤ ---
const allPricingOptions = [
    { id: 1, service_id: 1, type: "Thời Lượng", name: "2 Giờ - Tối đa 60m^2", hours: 2 },
    { id: 2, service_id: 1, type: "Thời Lượng", name: "3 Giờ - Tối đa 90m^2", hours: 3 },
    { id: 3, service_id: 1, type: "Thời Lượng", name: "4 Giờ - Tối đa 110m^2", hours: 4 },
    { id: 4, service_id: 1, type: "Tùy Chọn", name: "Sử dụng máy hút bụi" },
    { id: 99, service_id: 1, type: "Tùy Chọn", name: "Dụng cụ & Chất tẩy rửa cơ bản" },
    { id: 5, service_id: 1, type: "Dịch Vụ Thêm", name: "Nấu ăn", hours: 1, icon: "fas fa-utensils" },
    { id: 6, service_id: 1, type: "Dịch Vụ Thêm", name: "Giặt ủi", hours: 1, icon: "fas fa-tshirt" },
];

const serviceInfo = { id: 1, name: "Giúp Việc Ca Lẻ" };

const TimeSelectionPage = () => {
    const router = useRouter();
    
    const savedBookingData = localStorage.getItem('hourlyBookingData');
    const recoveredData = savedBookingData ? JSON.parse(savedBookingData) : null;
    const [bookingData, setBookingData] = useState({
        staffCount: recoveredData?.staffCount || 1,
        durationId: recoveredData?.durationId || 2,
        address: recoveredData?.address || '',
        selectedOptionIds: recoveredData?.selectedOptionIds || [99],
        notes: recoveredData?.notes || '',
        promoCode: recoveredData?.promoCode || '',
        workDate: null as Date | null,
        startTime: '',
    });

    const [checkoutResult, setCheckoutResult] = useState<any>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [dates, setDates] = useState<Array<{ fullDate: Date, day: number, dayName: string }>>([]);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [isDataRestored, setIsDataRestored] = useState(false);
    const [fromServicePage, setFromServicePage] = useState(false);

    // Khôi phục booking data từ localStorage khi mount
    useEffect(() => {
        console.log('🚀 [Time] Component mounting, checking localStorage...');

        // Check nếu đang navigate từ service page
        const urlParams = new URLSearchParams(window.location.search);
        const fromService = urlParams.get('fromService') === 'true';

        if (fromService) {
            console.log('🔗 [Time] Navigation from service page detected, clearing URL params');
            setFromServicePage(true);
            // Clear URL params
            window.history.replaceState({}, '', window.location.pathname);
        }

        if (savedBookingData) {
            try {
                const parsed = JSON.parse(savedBookingData);
                console.log('Khôi phục dữ liệu từ localStorage:', parsed);
                if (parsed.workDate) {
                    parsed.workDate = new Date(parsed.workDate);
                }
                setBookingData(parsed);

                // Đợi một chút để đảm bảo setState xong
                setTimeout(() => {
                    console.log('Data restored, setting flag');
                    setIsDataRestored(true);
                }, fromService ? 200 : 50); // Delay lâu hơn nếu từ service page
            } catch (error) {
                console.error('Error parsing saved booking data:', error);
                setIsDataRestored(false);
            }
        } else {
            console.log('No saved data found');
            // Nếu không có data và không phải từ service page thì có thể redirect
            if (!fromService) {
                console.log('No data and not from service, should redirect');
            }
            setIsDataRestored(true);
        }
    }, []);

    // Validation logic - chỉ chạy sau khi đã restore
    useEffect(() => {
        if (!isDataRestored) {
            console.log('Data not restored yet, skipping validation');
            return;
        }

        // Wait for one render cycle to ensure state is fully updated
        const timeout = setTimeout(() => {
            console.log('Validation running. Current data:', {
                address: bookingData.address,
                durationId: bookingData.durationId,
                isDataRestored,
                fromServicePage
            });

            // Chỉ chạy validation nếu không phải từ service page
            if (fromServicePage) {
                console.log('Skipping validation - coming from service page');
                return;
            }

            if (!bookingData.address || !bookingData.durationId) {
                console.log('Missing basic info, redirecting to service step');
                router.replace('/booking/hourly-cleaning/service');
            } else {
                console.log('Validation passed, staying on time page');
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [isDataRestored, bookingData.address, bookingData.durationId, router, fromServicePage]);

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
                dayName: i === 0 ? 'H.nay' : i === 1 ? 'N.mai' : weekDays[date.getDay()],
            };
        });
        setDates(next7Days);
        if (!bookingData.workDate) {
            setBookingData(prev => ({ ...prev, workDate: next7Days[1].fullDate })); // Default to tomorrow
        }
    }, []);

    // Lưu booking data vào localStorage mỗi khi thay đổi
    useEffect(() => {
        console.log('Saving booking data to localStorage:', bookingData);
        localStorage.setItem('hourlyBookingData', JSON.stringify(bookingData));
    }, [bookingData]);

    // Gọi checkout API
    useEffect(() => {
        if (bookingData.durationId) {
            const timeoutId = setTimeout(async () => {
                setIsCheckoutLoading(true);
                try {
                    const durationObj = allPricingOptions.find(d => d.id === bookingData.durationId);
                    if (!durationObj) return;

                    const payload = {
                        staff_count: bookingData.staffCount,
                        cleaning_duration: durationObj.hours,
                        vacuum: bookingData.selectedOptionIds.includes(4),
                        cooking: bookingData.selectedOptionIds.includes(5),
                        laundry: bookingData.selectedOptionIds.includes(6)
                    };

                    console.log('Checkout payload:', payload);

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking/hourly/checkout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    const data = await res.json();
                    console.log('Checkout result:', data);
                    setCheckoutResult(data);
                } catch (error) {
                    console.error('Error fetching checkout data:', error);
                } finally {
                    setIsCheckoutLoading(false);
                }
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [bookingData.staffCount, bookingData.durationId, bookingData.selectedOptionIds, bookingData.promoCode]);

    const selectedDuration = useMemo(() => {
        return allPricingOptions.find(opt => opt.id === bookingData.durationId)?.hours || 0;
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
            />

            <BookingLayout
                title={serviceInfo.name}
                onBack={handleBack}
                footer={
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
                            disabled={
                                !bookingData.workDate || !bookingData.startTime
                            }
                            className="px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold disabled:bg-slate-300 hover:bg-emerald-600"
                        >
                            Tiếp tục
                        </button>
                    </div>
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
