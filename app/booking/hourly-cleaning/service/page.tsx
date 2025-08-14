// app/booking/hourly-cleaning/service/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import BookingLayout, { AddressModal, PriceListModal } from '../../../../components/booking/BookingLayout';
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

const serviceId = 1;
const serviceInfo = { id: 1, name: "Giúp Việc Ca Lẻ" };

const serviceOptions = {
    duration: allPricingOptions.filter(p => p.service_id === serviceId && p.type === 'Thời Lượng'),
    extra: allPricingOptions.filter(p => p.service_id === serviceId && p.type === 'Dịch Vụ Thêm'),
    other: allPricingOptions.filter(p => p.service_id === serviceId && p.type === 'Tùy Chọn'),
};

const ServiceSelectionPage = () => {
    const router = useRouter();

    const [bookingData, setBookingData] = useState({
        staffCount: 1,
        durationId: serviceOptions.duration[1]?.id || serviceOptions.duration[0]?.id,
        address: '',
        selectedOptionIds: [99], // Đảm bảo Dụng cụ & Chất tẩy rửa cơ bản luôn được chọn
        notes: '',
        promoCode: '',
        workDate: null,
        startTime: '',
    });

    const [modal, setModal] = useState<{ type: string | null; data: any; title: string }>({
        type: null, data: null, title: ''
    });

    const [isDataRestored, setIsDataRestored] = useState(false);

    // Khôi phục booking data từ localStorage khi mount
    useEffect(() => {
        const savedBookingData = localStorage.getItem('hourlyBookingData');
        if (savedBookingData) {
            try {
                const parsed = JSON.parse(savedBookingData);
                console.log('Khôi phục dữ liệu từ localStorage:', parsed);
                if (parsed.workDate) {
                    parsed.workDate = new Date(parsed.workDate);
                }
                setBookingData({ ...bookingData, ...parsed });
                setIsDataRestored(true);
            } catch (error) {
                console.error('Error parsing saved booking data:', error);
            }
        } else {
            setIsDataRestored(true);
        }
    }, []);

    // Lưu booking data vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (isDataRestored) {
            console.log('Saving booking data to localStorage:', bookingData);
            localStorage.setItem('hourlyBookingData', JSON.stringify(bookingData));

            // Verify save worked
            const saved = localStorage.getItem('hourlyBookingData');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('Verified save successful:', {
                    address: parsed.address,
                    durationId: parsed.durationId,
                    staffCount: parsed.staffCount
                });
            }
        }
    }, [bookingData, isDataRestored]);

    const handleSetStaff = (count: number) => setBookingData({ ...bookingData, staffCount: count });
    const handleSetDuration = (id: number) => setBookingData({ ...bookingData, durationId: id });
    const handleToggleOption = (id: number) => {
        if (id === 99) return; // Không cho phép bỏ chọn Dụng cụ & Chất tẩy rửa cơ bản
        const newIds = bookingData.selectedOptionIds.includes(id)
            ? bookingData.selectedOptionIds.filter((i: number) => i !== id)
            : [...bookingData.selectedOptionIds, id];
        setBookingData({ ...bookingData, selectedOptionIds: newIds });
    };

    const openModal = async (type: string, data: any = null, title = '') => {
        if (type === 'price') {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking/price_list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service_id: serviceId,
                        ids: data.map((item: any) => item.id),
                    }),
                });
                const prices = await res.json();
                setModal({ type, data: { items: data, prices }, title });
            } catch (err) {
                console.error('Lỗi load price list:', err);
            }
        } else {
            setModal({ type, data, title });
        }
    };

    const closeModal = () => setModal({ type: null, data: null, title: '' });

    const handleSelectAddress = (fullAddress: string) => {
        setBookingData({ ...bookingData, address: fullAddress });
        closeModal();
    };

    const handleNext = () => {
        // Force save before navigate
        localStorage.setItem('hourlyBookingData', JSON.stringify(bookingData));

        // Add small delay to ensure save completes
        setTimeout(() => {
            router.push('/booking/hourly-cleaning/time?fromService=true');
        }, 100);
    };

    const handleBack = () => {
        router.push('/dashboard');
    };

    return (
        <>
            <AddressModal
                isOpen={modal.type === 'address'}
                onClose={closeModal}
                onConfirm={handleSelectAddress}
            />
            <PriceListModal
                isOpen={modal.type === 'price'}
                onClose={closeModal}
                title={modal.title}
                items={modal.data?.items}
                prices={modal.data?.prices}
            />

            <BookingLayout
                title={serviceInfo.name}
                onBack={handleBack}
                footer={
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">Chọn dịch vụ của bạn</p>
                            <p className="text-xs text-slate-500">Giá sẽ hiển thị ở bước tiếp theo</p>
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={!bookingData.address || !bookingData.durationId}
                            className="px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-emerald-600"
                        >
                            Tiếp tục
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4">
                        <label className="text-xs font-bold text-slate-400">ĐỊA ĐIỂM LÀM VIỆC</label>
                        <div onClick={() => openModal('address')} className="flex justify-between items-center mt-2 cursor-pointer">
                            <p className={bookingData.address ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                                {bookingData.address || 'Bạn cần nhập địa chỉ'}
                            </p>
                            <span className="text-sm font-bold text-emerald-500 hover:text-emerald-700">Tạo mới</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400">SỐ LƯỢNG NHÂN VIÊN</label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <button
                                    onClick={() => handleSetStaff(1)}
                                    className={`p-3 rounded-lg text-center font-semibold ${bookingData.staffCount === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                                        }`}
                                >
                                    1 Nhân viên
                                </button>
                                <button
                                    onClick={() => handleSetStaff(2)}
                                    className={`p-3 rounded-lg text-center font-semibold ${bookingData.staffCount === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                                        }`}
                                >
                                    2 Nhân viên
                                </button>
                            </div>
                        </div>

                        {serviceOptions.duration.length > 0 && (
                            <div>
                                <label className="text-xs font-bold text-slate-400">THỜI GIAN DỌN DẸP</label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                                    {serviceOptions.duration.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => handleSetDuration(d.id)}
                                            className={`p-3 rounded-lg text-center ${bookingData.durationId === d.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            <span className="font-bold">{d.hours} Giờ</span>
                                            <span className="block text-xs opacity-80">{d.name.split(' - ')[1]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {bookingData.address && (
                        <>
                            {serviceOptions.extra.length > 0 && (
                                <div className="bg-white rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-400">DỊCH VỤ THÊM</label>
                                        <button
                                            onClick={() => openModal('price', serviceOptions.extra, 'Bảng giá dịch vụ thêm')}
                                            className="text-xs font-bold text-emerald-500 border border-emerald-500 rounded-full px-2 py-0.5"
                                        >
                                            Bảng giá
                                        </button>
                                    </div>
                                    <div className="flex gap-3">
                                        {serviceOptions.extra.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => handleToggleOption(s.id)}
                                                className={`flex-1 p-3 rounded-lg border-2 text-center ${bookingData.selectedOptionIds.includes(s.id)
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-slate-200'
                                                    }`}
                                            >
                                                <i className={`${s.icon || 'fa fa-plus'} block text-2xl mb-1`}></i>
                                                <span className="text-sm font-semibold">{s.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {serviceOptions.other.length > 0 && (
                                <div className="bg-white rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-400">TÙY CHỌN KHÁC</label>
                                        <button
                                            onClick={() => openModal('price', serviceOptions.other, 'Bảng giá tùy chọn khác')}
                                            className="text-xs font-bold text-emerald-500 border border-emerald-500 rounded-full px-2 py-0.5"
                                        >
                                            Bảng giá
                                        </button>
                                    </div>
                                    <div className="mt-2 space-y-3">
                                        {serviceOptions.other.map(o => (
                                            <div key={o.id} className="flex justify-between items-center">
                                                <label htmlFor={`option-${o.id}`} className="font-semibold text-slate-700">
                                                    {o.name}
                                                </label>
                                                <input
                                                    type="checkbox"
                                                    id={`option-${o.id}`}
                                                    className={`toggle-checkbox ${o.id === 99 ? 'opacity-55' : ''}`}
                                                    checked={bookingData.selectedOptionIds.includes(o.id)}
                                                    disabled={o.id === 99}
                                                    onChange={() => handleToggleOption(o.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
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

export default ServiceSelectionPage;
