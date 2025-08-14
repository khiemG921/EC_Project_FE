// app/booking/periodic-cleaning/time/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import BookingLayout, { CalendarModal } from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import { serviceInfo, weekDays, timeSlots, pricingData } from '../bookingConfig';

const TimeStep = () => {
    const router = useRouter();
    const saved = localStorage.getItem('periodicBookingData');
    const saved_json = saved ? JSON.parse(saved) : {};
    const [bookingData, setBookingData] = useState<any>({
        address: saved_json.address || '',
        sessionsPerWeek: saved_json.sessionsPerWeek || 2,
        hoursPerSession: saved_json.hoursPerSession || 3,
        extraServices: saved_json.extraServices || [],
        totalHoursPerSession: saved_json.totalHoursPerSession || 3,
        schedule: saved_json.schedule || {},
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        packageDuration: 1
    });
    const [modal, setModal] = useState({ type: null });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('periodicBookingData');
        // console.log('Recovering bookingData:', saved);
        if (saved) setBookingData((prev: any) => ({ ...prev, ...JSON.parse(saved) }));
        // console.log('After recovering bookingData:', bookingData);
    }, []);
    useEffect(() => {
        localStorage.setItem('periodicBookingData', JSON.stringify(bookingData));
    }, [bookingData]);

    const handleScheduleToggle = (day: string, slot: string) => {
        const newSchedule = { ...bookingData.schedule };
        if (!newSchedule[day]) newSchedule[day] = {};
        newSchedule[day][slot] = !newSchedule[day][slot];
        setBookingData({ ...bookingData, schedule: newSchedule });
    };
    const handleNext = () => {
        const selectedSlotsCount = Object.values(bookingData.schedule).reduce(
            (acc: number, daySlots: any) => acc + Object.values(daySlots).filter(Boolean).length,
            0
        );
        if (selectedSlotsCount !== bookingData.sessionsPerWeek) {
            setValidationError(`Vui lòng chọn đúng ${bookingData.sessionsPerWeek} ca làm việc.`);
            return;
        }
        setValidationError('');
        router.push('/booking/periodic-cleaning/confirm');
    };
    return (
        <BookingLayout
            title="Dọn dẹp Định kỳ - Bước 2: Lịch & Gói"
            onBack={() => router.push('/booking/periodic-cleaning/service')}
            footer={
                <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-lg bg-teal-500 text-white font-bold w-full mt-4"
                >
                    Tiếp tục
                </button>
            }
        >
            {/* Lịch làm việc */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <label className="font-bold text-slate-800 mb-2 block">Lịch làm việc</label>
                <p className="text-sm text-slate-500 mb-4">
                    Vui lòng chọn <strong className="text-teal-500">{bookingData.sessionsPerWeek}</strong> ca làm việc cố định trong tuần.
                </p>
                {validationError && <p className="text-sm text-red-500 mb-4">{validationError}</p>}
                <div className="space-y-3">
                    {Object.keys(weekDays).map((dayKey) => (
                        <div key={dayKey} className="grid grid-cols-4 items-center gap-2">
                            <strong className="text-slate-600">{weekDays[dayKey]}</strong>
                            {Object.keys(timeSlots).map((slotKey) => (
                                <button
                                    key={slotKey}
                                    onClick={() => handleScheduleToggle(dayKey, slotKey)}
                                    className={`p-2 rounded-lg font-semibold text-sm ${bookingData.schedule[dayKey]?.[slotKey] ? 'bg-teal-500 text-white' : 'bg-slate-100'}`}
                                >
                                    {timeSlots[slotKey].split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {/* Ngày bắt đầu */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <label className="font-bold text-slate-800 mb-2 block">Ngày bắt đầu</label>
                <button
                    onClick={() => setModal({ type: 'calendar' })}
                    className="w-full p-3 bg-slate-100 rounded-lg text-slate-800 font-semibold text-left"
                >
                    {bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString('vi-VN') : 'Chọn ngày'}
                </button>
            </div>
            {/* Gói dịch vụ */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <label className="font-bold text-slate-800 mb-2 block">Gói dịch vụ</label>
                <div className="grid grid-cols-3 gap-2">
                    {pricingData.packages.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setBookingData({ ...bookingData, packageDuration: p.value })}
                            className={`p-2 rounded-lg font-semibold ${bookingData.packageDuration === p.value ? 'bg-teal-500 text-white' : 'bg-slate-100'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>
            <CalendarModal
                isOpen={modal.type === 'calendar'}
                onClose={() => setModal({ type: null })}
                selectedDate={bookingData.startDate}
                onSelectDate={(date) => setBookingData({ ...bookingData, startDate: date })}
            />
        </BookingLayout>
    );
};

export default TimeStep;
