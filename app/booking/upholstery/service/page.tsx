// app/booking/upholstery/service/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import BookingLayout, { QuantitySelector, AddressModal, PriceListModal } from '../../../../components/booking/BookingLayout';
import { serviceInfo, upholsteryOptions } from '../bookingConfig';
import { useRouter } from 'next/navigation';

// Modalstate interface
interface ModalState {
    type: string | null;
    data: { items: any[]; prices: any[] } | null;
    title: string;
}

export default function UpholsteryServiceStep() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('upholsteryBookingData');
            if (saved) return JSON.parse(saved);
        }
        return { address: '', selectedItems: {}, curtainWashingMethod: 'Khô', notes: '' };
    });
    const [modal, setModal] = useState<ModalState>({ type: null, data: null, title: '' });

    // Save state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('upholsteryBookingData', JSON.stringify(bookingData));
        }
    }, [bookingData]);

    const handleSetItemQuantity = (itemId: number, quantity: number) => {
        const newItems = { ...bookingData.selectedItems };
        if (quantity > 0) newItems[itemId] = quantity;
        else delete newItems[itemId];
        setBookingData({ ...bookingData, selectedItems: newItems });
    };

    const openModal = async (type: string, data: any = null, title = '') => {
        if (type === 'price' && Array.isArray(data)) {
            // Fetch prices from backend
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking/price_list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service_id: serviceInfo.id, ids: data.map((item: any) => item.id) })
                });
                const prices = await res.json(); // [{id, price}, ..v..v..]
                setModal({ type, data: { items: data, prices }, title });
            } catch (err) {
                setModal({ type, data: { items: data, prices: [] }, title });
            }
        } else {
            setModal({ type, data, title });
        }
    };
    const closeModal = () => setModal({ type: null, data: null, title: '' });

    const isAnyItemSelected = Object.keys(bookingData.selectedItems).length > 0;

    const handleNext = () => router.push('/booking/upholstery/time');

    return (
        <>
            <AddressModal
                isOpen={modal.type === 'address'}
                onClose={closeModal}
                onConfirm={addr => setBookingData({ ...bookingData, address: addr })}
            />
            <PriceListModal
                isOpen={modal.type === 'price'}
                onClose={closeModal}
                title={modal.title}
                items={modal.data?.items || []}
                prices={modal.data?.prices || []}
            />
            <BookingLayout
                title={serviceInfo.name}
                onBack={() => router.push('/dashboard')}
                footer={
                    <button
                        onClick={handleNext}
                        disabled={!bookingData.address || !isAnyItemSelected}
                        className="w-full px-8 py-3 rounded-lg bg-teal-500 text-white font-bold disabled:bg-slate-300"
                    >
                        Tiếp tục
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4">
                        <label className="text-xs font-bold text-slate-400">ĐỊA ĐIỂM LÀM VIỆC</label>
                        <div
                            onClick={() => openModal('address')}
                            className="flex justify-between items-center mt-2 cursor-pointer"
                        >
                            <p className={bookingData.address ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                                {bookingData.address || 'Bạn cần nhập địa chỉ'}
                            </p>
                            <span className="text-sm font-bold text-teal-500 hover:text-teal-700">Tạo mới</span>
                        </div>
                    </div>
                    {/* Sofa Nỉ/Vải */}
                    <CategorySection
                        title="Vệ sinh Sofa Nỉ/Vải"
                        items={upholsteryOptions.sofaNylon}
                        selectedItems={bookingData.selectedItems}
                        handleSetItemQuantity={handleSetItemQuantity}
                        openModal={openModal}
                    />
                    {/* Sofa Da */}
                    <CategorySection
                        title="Vệ sinh Sofa Da"
                        items={upholsteryOptions.sofaLeather}
                        selectedItems={bookingData.selectedItems}
                        handleSetItemQuantity={handleSetItemQuantity}
                        openModal={openModal}
                    />
                    {/* Rèm */}
                    <div className="bg-white rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <label className="font-bold text-slate-800 mb-4 block">Vệ sinh Rèm</label>
                            <button
                                onClick={() => openModal('price', bookingData.curtainWashingMethod === 'Khô' ? upholsteryOptions.curtainDry : upholsteryOptions.curtainWet, `Bảng giá ${bookingData.curtainWashingMethod}`)}
                                className="text-xs font-bold text-teal-500 border border-teal-500 rounded-full px-2 py-0.5"
                            >
                                Xem bảng giá
                            </button>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                            <button
                                onClick={() => setBookingData({ ...bookingData, curtainWashingMethod: 'Khô' })}
                                className={`flex-1 p-2 rounded-md font-semibold ${bookingData.curtainWashingMethod === 'Khô' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}
                            >
                                Giặt Khô
                            </button>
                            <button
                                onClick={() => setBookingData({ ...bookingData, curtainWashingMethod: 'Nước' })}
                                className={`flex-1 p-2 rounded-md font-semibold ${bookingData.curtainWashingMethod === 'Nước' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}
                            >
                                Giặt Nước
                            </button>
                        </div>
                        <div className="space-y-3">
                            {(bookingData.curtainWashingMethod === 'Khô' ? upholsteryOptions.curtainDry : upholsteryOptions.curtainWet).map(item => (
                                <QuantitySelector
                                    key={item.id}
                                    item={item}
                                    quantity={bookingData.selectedItems[item.id] || 0}
                                    setQuantity={q => handleSetItemQuantity(item.id, q)}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Đệm */}
                    <CategorySection
                        title="Vệ sinh Đệm"
                        items={upholsteryOptions.mattress}
                        selectedItems={bookingData.selectedItems}
                        handleSetItemQuantity={handleSetItemQuantity}
                        openModal={openModal}
                    />
                    {/* Thảm */}
                    <CategorySection
                        title="Vệ sinh Thảm"
                        items={upholsteryOptions.carpet}
                        selectedItems={bookingData.selectedItems}
                        handleSetItemQuantity={handleSetItemQuantity}
                        openModal={openModal}
                    />
                    {/* Notes */}
                    <div className="bg-white rounded-xl p-4">
                        <label className="font-bold text-slate-800 mb-2 block">Ghi chú</label>
                        <textarea
                            value={bookingData.notes}
                            onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                            placeholder="Ví dụ: Sofa có vết ố, cần giặt kỹ..."
                            className="w-full p-3 bg-slate-100 border-transparent rounded-lg mt-2 h-24 resize-none focus:ring-2 focus:ring-teal-500"
                        ></textarea>
                    </div>
                </div>
            </BookingLayout>
        </>
    );
}

function CategorySection({ title, items, selectedItems, handleSetItemQuantity, openModal }:
    { title: string; items: any[]; selectedItems: any; handleSetItemQuantity: (id: number, q: number) => void; openModal: (type: string, data?: any, title?: string) => void }) {
    return (
        <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-800">{title}</label>
                <button
                    onClick={() => openModal('price', items, `Bảng giá ${title}`)}
                    className="text-xs font-bold text-teal-500 border border-teal-500 rounded-full px-2 py-0.5"
                >
                    Xem bảng giá
                </button>
            </div>
            <div className="space-y-3">
                {items.map((item: any) => (
                    <QuantitySelector
                        key={item.id}
                        item={item}
                        quantity={selectedItems[item.id] || 0}
                        setQuantity={(q: number) => handleSetItemQuantity(item.id, q)}
                    />
                ))}
            </div>
        </div>
    );
}
