// app/booking/ac-cleaning/time/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import BookingLayout, {
    TimePickerModal,
} from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';

const serviceInfo = { id: 5, name: 'Vệ sinh Máy lạnh' };

// Type props
interface DateInfo {
    fullDate: Date;
    day: number;
    dayName: string;
    month: number;
}
interface BookingData {
    workDate: Date | null;
    startTime: string;
}
const DateTimeSelectionForm = ({
    bookingData,
    setBookingData,
    openModal,
}: {
    bookingData: BookingData;
    setBookingData: (d: BookingData) => void;
    openModal: (type: string) => void;
}) => {
    const { workDate, startTime } = bookingData;
    const [dates, setDates] = useState<DateInfo[]>([]);
    useEffect(() => {
        const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const today = new Date();
        const next7Days: DateInfo[] = Array.from({ length: 7 }).map((_, i) => {
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
                month: date.getMonth() + 1,
            };
        });
        setDates(next7Days);
        if (!workDate) {
            setBookingData({ ...bookingData, workDate: next7Days[1].fullDate });
        }
    }, []);
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-slate-400">
                        CHỌN NGÀY LÀM
                    </label>
                    <span className="font-semibold text-sm">
                        Tháng{' '}
                        {workDate
                            ? workDate.getMonth() + 1
                            : new Date().getMonth() + 1}
                        /
                        {workDate
                            ? workDate.getFullYear()
                            : new Date().getFullYear()}
                    </span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {dates.map((d) => (
                        <button
                            key={d.fullDate.toISOString()}
                            onClick={() =>
                                setBookingData({
                                    ...bookingData,
                                    workDate: d.fullDate,
                                })
                            }
                            className={`p-2 rounded-lg text-center ${
                                workDate &&
                                workDate.toDateString() ===
                                    d.fullDate.toDateString()
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-slate-100'
                            }`}
                        >
                            <span className="text-xs block">{d.dayName}</span>
                            <span className="font-bold text-lg block">
                                {d.day}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-xl p-4">
                <label className="text-xs font-bold text-slate-400 mb-2 block">
                    CHỌN GIỜ LÀM
                </label>
                <button
                    onClick={() => openModal('time')}
                    className="w-full p-3 bg-slate-100 rounded-lg text-slate-800 font-semibold text-center text-xl"
                >
                    {startTime ? startTime : 'Chọn giờ'}
                </button>
            </div>
        </div>
    );
};

export default function ACTimeStep() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('acCleaningBookingData');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.workDate) {
                    parsed.workDate = new Date(parsed.workDate);
                }
                return parsed;
            }
        }
        return { workDate: '', startTime: '' };
    });

    const canContinue = useMemo(() => {
        if (!bookingData.workDate || !bookingData.startTime) return false;
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(bookingData.workDate);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < today) return false;
        if (selectedDate.getTime() === today.getTime()) {
            const [h, m] = bookingData.startTime.split(':').map(Number);
            const selectedDateTime = new Date(bookingData.workDate);
            selectedDateTime.setHours(h, m, 0, 0);
            if (selectedDateTime < now) return false;
        }
        return true;
    }, [bookingData.workDate, bookingData.startTime]);

    const [modal, setModal] = useState<{ type: string | null }>({ type: null });
    const openModal = (type: string) => setModal({ type });
    const closeModal = () => setModal({ type: null });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                'acCleaningBookingData',
                JSON.stringify(bookingData)
            );
        }
    }, [bookingData]);
    const handleNext = () => router.push('/booking/ac-cleaning/confirm');
    const handleBack = () => router.push('/booking/ac-cleaning/service');
    return (
        <>
            <TimePickerModal
                isOpen={modal.type === 'time'}
                onClose={closeModal}
                onSelect={(time) => {
                    setBookingData({ ...bookingData, startTime: time });
                    closeModal();
                }}
            />
            <BookingLayout
                title={serviceInfo.name}
                onBack={handleBack}
                footer={
                    canContinue ? (
                        <button
                            onClick={handleNext}
                            disabled={
                                !bookingData.workDate || !bookingData.startTime
                            }
                            className="w-full px-8 py-3 rounded-lg bg-teal-500 text-white font-bold disabled:bg-slate-300"
                        >
                            Tiếp tục
                        </button>
                    ) : null
                }
            >
                <DateTimeSelectionForm
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    openModal={openModal}
                />
            </BookingLayout>
        </>
    );
}
