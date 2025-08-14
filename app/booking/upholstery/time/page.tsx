// app/booking/upholstery/time/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import BookingLayout, { TimePickerModal } from '../../../../components/booking/BookingLayout';
import { serviceInfo } from '../bookingConfig';
import { useRouter } from 'next/navigation';

export default function UpholsteryTimeStep() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('upholsteryBookingData');
            if (saved) return JSON.parse(saved);
        }
        return { workDate: null, startTime: '' };
    });
    const [modal, setModal] = useState<{ type: string | null }>({ type: null });
    const [dates, setDates] = useState<{ fullDate: Date; day: number; dayName: string }[]>([]);

    useEffect(() => {
        // Generate next 7 days
        const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const today = new Date();
        const next7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return {
                fullDate: date,
                day: date.getDate(),
                dayName:
                    i === 0 ? 'H.nay' : i === 1 ? 'N.mai' : weekDays[date.getDay()],
            };
        });
        setDates(next7Days);
        if (!bookingData.workDate) {
            setBookingData((prev: any) => ({ ...prev, workDate: next7Days[1].fullDate }));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('upholsteryBookingData', JSON.stringify(bookingData));
        }
    }, [bookingData]);

    const openModal = (type: string) => setModal({ type });
    const closeModal = () => setModal({ type: null });

    const handleNext = () => router.push('/booking/upholstery/confirm');
    const handleBack = () => router.push('/booking/upholstery/service');

    const handleSelectTime = (time: string) => {
        setBookingData((prev: any) => ({ ...prev, startTime: time }));
        closeModal();
    };

    return (
        <>
            <TimePickerModal
                isOpen={modal.type === 'time'}
                onClose={closeModal}
                onSelect={handleSelectTime}
            />
            <BookingLayout
                title={serviceInfo.name}
                onBack={handleBack}
                footer={
                    <button
                        onClick={handleNext}
                        disabled={!bookingData.workDate || !bookingData.startTime}
                        className="w-full px-8 py-3 rounded-lg bg-teal-500 text-white font-bold disabled:bg-slate-300"
                    >
                        Tiếp tục
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4">
                        <label className="text-xs font-bold text-slate-400 mb-2 block">NGÀY LÀM</label>
                        <div className="grid grid-cols-4 gap-3">
                            {dates.map((d) => (
                                <button
                                    key={d.fullDate.toISOString()}
                                    onClick={() => setBookingData((prev: any) => ({ ...prev, workDate: d.fullDate }))}
                                    className={`p-2 rounded-lg text-center border-2 ${bookingData.workDate && new Date(bookingData.workDate).toDateString() === d.fullDate.toDateString() ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-200'}`}
                                >
                                    <span className="font-bold block">{d.dayName}</span>
                                    <span className="text-xs block">{`${d.day}/${d.fullDate.getMonth() + 1}`}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                        <label className="text-xs font-bold text-slate-400 mb-2 block">GIỜ LÀM VIỆC</label>
                        <button
                            onClick={() => openModal('time')}
                            className="w-full p-3 bg-slate-100 rounded-lg text-slate-800 font-semibold text-center"
                        >
                            {bookingData.startTime ? bookingData.startTime : 'Chọn giờ bắt đầu'}
                        </button>
                    </div>
                </div>
            </BookingLayout>
        </>
    );
}
