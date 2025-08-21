// app/booking/periodic-cleaning/service/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import BookingLayout, {
    AddressModal,
} from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import { serviceInfo, pricingData } from '../bookingConfig';

const ServiceStep = () => {
    const router = useRouter();
    interface BookingData {
        address: string;
        sessionsPerWeek: number;
        hoursPerSession: number;
        extraServices: number[];
        totalHoursPerSession: number;
        schedule: Record<string, unknown>;
        workDate: Date;
        packageDuration: number;
    }

    const [bookingData, setBookingData] = useState<BookingData>({
        address: '',
        sessionsPerWeek: 2,
        hoursPerSession: 3,
        extraServices: [],
        totalHoursPerSession: 3,
        schedule: {},
        workDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        packageDuration: 1,
    });
    const [modal, setModal] = useState<{ type: string | null }>({ type: null });

    // chỉ cho phép footer khi đã chọn đủ
    const canContinue =
        bookingData.address.trim() !== '' &&
        bookingData.sessionsPerWeek > 0 &&
        bookingData.hoursPerSession > 0;

    useEffect(() => {
        // Restore from localStorage if exists
        const saved = localStorage.getItem('periodicBookingData');
        if (saved) setBookingData(JSON.parse(saved));
    }, []);
    useEffect(() => {
        localStorage.setItem(
            'periodicBookingData',
            JSON.stringify(bookingData)
        );
    }, [bookingData]);

    const handleNext = () => {
        router.push('/booking/periodic-cleaning/time');
    };

    const handleExtraToggle = (id: number) => {
        const newExtras = bookingData.extraServices.includes(id)
            ? bookingData.extraServices.filter((eId: number) => eId !== id)
            : [...bookingData.extraServices, id];
        const extraSum = newExtras.reduce((sum: number, eId: number) => {
            const ex = pricingData.extras.find((e) => e.id === eId);
            return sum + (ex?.value || 0);
        }, 0);
        setBookingData({
            ...bookingData,
            extraServices: newExtras,
            totalHoursPerSession: bookingData.hoursPerSession + extraSum,
        });
    };

    return (
        <BookingLayout
            title="Dọn dẹp Định kỳ - Bước 1: Dịch vụ"
            onBack={() => router.push('/')}
            footer={
                canContinue ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 rounded-lg bg-teal-500 text-white font-bold w-full mt-4"
                    >
                        Tiếp tục
                    </button>
                ) : null
            }
        >
            {/* Địa chỉ */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <label className="text-xs font-bold text-slate-400">
                    ĐỊA ĐIỂM LÀM VIỆC
                </label>
                <div
                    onClick={() => setModal({ type: 'address' })}
                    className="flex justify-between items-center mt-2 cursor-pointer"
                >
                    <p
                        className={
                            bookingData.address
                                ? 'text-slate-800 font-semibold'
                                : 'text-slate-400'
                        }
                    >
                        {bookingData.address || 'Bạn cần nhập địa chỉ'}
                    </p>
                    <span className="text-sm font-bold text-teal-500 hover:text-teal-700">
                        Tạo mới
                    </span>
                </div>
            </div>
            {/* Tần suất */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <label className="font-bold text-slate-800 mb-2 block">
                    Tần suất làm việc
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {pricingData.sessions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() =>
                                setBookingData({
                                    ...bookingData,
                                    sessionsPerWeek: s.value,
                                })
                            }
                            className={`p-2 rounded-lg font-semibold ${
                                bookingData.sessionsPerWeek === s.value
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-slate-100'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
            {/* Thời lượng */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <label className="font-bold text-slate-800 mb-2 block">
                    Thời lượng mỗi buổi
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {pricingData.durations.map((d) => (
                        <button
                            key={d.id}
                            onClick={() =>
                                setBookingData({
                                    ...bookingData,
                                    hoursPerSession: d.value,
                                    totalHoursPerSession: d.value,
                                })
                            }
                            className={`p-2 rounded-lg font-semibold ${
                                bookingData.hoursPerSession === d.value
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-slate-100'
                            }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>
            {/* Dịch vụ thêm */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <label className="font-bold text-slate-800 mb-2 block">
                    Dịch vụ thêm (mỗi buổi)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {pricingData.extras.map((e) => (
                        <button
                            key={e.id}
                            type="button"
                            onClick={() => handleExtraToggle(e.id)}
                            className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition font-semibold text-lg shadow-sm
                                ${
                                    bookingData.extraServices.includes(e.id)
                                        ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-md'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-300'
                                }
                            `}
                        >
                            <i className={`${e.icon} text-2xl`}></i>
                            <span>{e.name}</span>
                            {bookingData.extraServices.includes(e.id) && (
                                <i className="fas fa-check-circle text-teal-500 ml-auto"></i>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <AddressModal
                isOpen={modal.type === 'address'}
                onClose={() => setModal({ type: null })}
                onConfirm={(addr) =>
                    setBookingData({ ...bookingData, address: addr })
                }
            />
        </BookingLayout>
    );
};

export default ServiceStep;
