// app/booking/business-cleaning/service/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import BookingLayout, {
    AddressModal,
    PriceListModal,
} from '../../../../components/booking/BookingLayout';
import { useRouter } from 'next/navigation';
import { serviceInfo, pricingData } from '../bookingConfig';

// --- DỮ LIỆU DỊCH VỤ ---
const allPricingOptions = [
    { id: 43, service_id: 8, name: 'Vệ sinh văn phòng, nhà xưởng' },
    { id: 44, service_id: 8, name: 'Dịch vụ chà sàn' },
    { id: 45, service_id: 8, name: 'Vệ sinh kính mặt trong tòa nhà' },
    {
        id: 46,
        service_id: 8,
        name: 'Vệ sinh kính mặt ngoài tòa nhà cao tầng, cao ốc',
    },
    { id: 47, service_id: 8, name: 'Đánh bóng sàn đá hoa cương, đá marble' },
];

const ServiceStep = () => {
    const router = useRouter();
    const [bookingData, setBookingData] = useState({
        address: '',
        sessionsPerWeek: 2,
        selectedServices: [] as number[],
        area: 0,
        schedule: {},
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        packageDuration: 1,
    });
    const [modal, setModal] = useState<{
        type: string | null;
        data?: any;
        title?: string;
    }>({ type: null });

    useEffect(() => {
        const saved = localStorage.getItem('businessBookingData');
        if (saved) {
            try {
                setBookingData(JSON.parse(saved));
            } catch {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            'businessBookingData',
            JSON.stringify(bookingData)
        );
    }, [bookingData]);

    const handleNext = () => {
        router.push('/booking/business-cleaning/time');
    };

    const handleServiceToggle = (id: number) => {
        const list = bookingData.selectedServices.includes(id)
            ? bookingData.selectedServices.filter((s) => s !== id)
            : [...bookingData.selectedServices, id];
        setBookingData({ ...bookingData, selectedServices: list });
    };

    // mở modal bảng giá
    const openModal = async (type: string, items: any[], title = '') => {
        if (type === 'price') {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/price_list`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            service_id: serviceInfo.id,
                            ids: items.map((i) => i.id),
                        }),
                    }
                );
                const prices = await res.json();
                setModal({ type, data: { items, prices }, title });
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <>
            <AddressModal
                isOpen={modal.type === 'address'}
                onClose={() => setModal({ type: null })}
                onConfirm={(addr) =>
                    setBookingData({ ...bookingData, address: addr })
                }
            />

            <PriceListModal
                isOpen={modal.type === 'price'}
                onClose={() => setModal({ type: null })}
                title={modal.title ?? ''}
                items={modal.data?.items}
                prices={modal.data?.prices}
            />

            <BookingLayout
                title="Vệ sinh Công nghiệp - Bước 1: Dịch vụ"
                onBack={() => router.push('/dashboard')}
                footer={
                    <button
                        onClick={handleNext}
                        disabled={!bookingData.address || bookingData.area <= 0}
                        className="px-8 py-3 rounded-lg bg-teal-500 text-white font-bold w-full mt-4 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        Tiếp tục
                    </button>
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
                        TẦN SUẤT LÀM VIỆC
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

                {/* Diện tích */}
                <div className="bg-white rounded-xl p-4 mb-4">
                    <label className="font-bold text-slate-800 mb-2 block">
                        DIỆN TÍCH (m2)
                    </label>
                    <input
                        type="number"
                        value={bookingData.area}
                        onChange={(e) =>
                            setBookingData({
                                ...bookingData,
                                area: parseFloat(e.target.value) || 0,
                            })
                        }
                        placeholder="Nhập diện tích"
                        className="w-full p-3 bg-slate-100 border-transparent rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                {/* Dịch vụ */}
                <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-400">
                            DỊCH VỤ
                        </label>
                        <button
                            onClick={() =>
                                openModal(
                                    'price',
                                    allPricingOptions,
                                    'Bảng giá dịch vụ'
                                )
                            }
                            className="text-xs font-bold text-teal-500 border border-teal-500 rounded-full px-2 py-0.5"
                        >
                            Bảng giá
                        </button>
                    </div>
                    <div className="mt-2 space-y-3">
                        {allPricingOptions.map((option) => (
                            <div
                                key={option.id}
                                className="flex justify-between items-center"
                            >
                                <label
                                    htmlFor={`option-${option.id}`}
                                    className="font-semibold text-slate-700"
                                >
                                    {option.name}
                                </label>
                                <input
                                    type="checkbox"
                                    id={`option-${option.id}`}
                                    className="toggle-checkbox"
                                    checked={bookingData.selectedServices.includes(
                                        option.id
                                    )}
                                    onChange={() =>
                                        handleServiceToggle(option.id)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </BookingLayout>

            <style jsx global>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
                .toggle-checkbox {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 3.5rem;
                    height: 2rem;
                    border-radius: 9999px;
                    background-color: #e2e8f0;
                    position: relative;
                    transition: background-color 0.2s ease-in-out;
                    cursor: pointer;
                }
                .toggle-checkbox::before {
                    content: '';
                    position: absolute;
                    top: 0.25rem;
                    left: 0.25rem;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 9999px;
                    background-color: #fff;
                    transition: transform 0.2s ease-in-out;
                }
                .toggle-checkbox:checked {
                    background-color: #10b981;
                }
                .toggle-checkbox:checked::before {
                    transform: translateX(1.5rem);
                }
            `}</style>
        </>
    );
};

export default ServiceStep;
