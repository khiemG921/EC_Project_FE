// app/booking/ac-cleaning/service.tsx
'use client';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useEffect } from 'react';
import BookingLayout, * as BookingLayout_1 from '../../../../components/booking/BookingLayout';

interface PricingOption {
    id: number;
    service_id: number;
    type: string;
    name: string;
    duration: number;
    image?: string;
    description?: string;
}

interface BookingData {
    address: string;
    acType: 'Treo tường' | 'Tủ đứng' | 'Âm trần';
    selectedItems: Record<number, { quantity: number; addGas: boolean }>;
    voucher_code: string;
}

interface SelectionFormProps {
    bookingData: BookingData;
    setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
    openModal: (type: string) => void;
}

interface AccordionItemProps {
    item: PricingOption;
    bookingData: BookingData;
    setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
}

interface AddressSelectionFormProps {
    bookingData: BookingData;
    setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
}

const serviceId = 5;
const serviceInfo = { id: 5, name: 'Vệ sinh Máy lạnh' };
const allPricingOptions = [
    {
        id: 38,
        service_id: 5,
        type: 'Treo tường',
        name: 'Máy lạnh treo tường dưới 2HP',
        duration: 1,
        image: 'https://placehold.co/600x300/e2e8f0/64748b?text=M%C3%A1y+l%E1%BA%A1nh+treo+t%C6%B0%E1%BB%9Dng',
    },
    {
        id: 39,
        service_id: 5,
        type: 'Treo tường',
        name: 'Máy lạnh treo tường từ 2HP trở lên',
        duration: 1.5,
        image: 'https://placehold.co/600x300/e2e8f0/64748b?text=M%C3%A1y+l%E1%BA%A1nh+treo+t%C6%B0%E1%BB%9Dng',
    },
    {
        id: 40,
        service_id: 5,
        type: 'Tủ đứng',
        name: 'Máy lạnh tủ đứng',
        duration: 2,
        image: 'https://placehold.co/600x300/e2e8f0/64748b?text=M%C3%A1y+l%E1%BA%A1nh+t%E1%BB%A7+%C4%91%E1%BB%A9ng',
    },
    {
        id: 41,
        service_id: 5,
        type: 'Âm trần',
        name: 'Máy lạnh âm trần',
        duration: 2.5,
        image: 'https://placehold.co/600x300/e2e8f0/64748b?text=M%C3%A1y+l%E1%BA%A1nh+%C3%A2m+tr%E1%BA%A7n',
        description: 'Chỉ vệ sinh lưới lọc, họng gió và cục nóng.',
    },
    { id: 42, service_id: 5, type: 'Phụ phí', name: 'Bơm gas', duration: 0.5 },
];
const acOptions: Record<'Treo tường' | 'Tủ đứng' | 'Âm trần', PricingOption[]> = {
    'Treo tường': allPricingOptions.filter((p) => p.type === 'Treo tường'),
    'Tủ đứng': allPricingOptions.filter((p) => p.type === 'Tủ đứng'),
    'Âm trần': allPricingOptions.filter((p) => p.type === 'Âm trần'),
};

function AddressSelectionForm({
    bookingData,
    setBookingData,
}: AddressSelectionFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirmAddress = (fullAddress: string) => {
        setBookingData({ ...bookingData, address: fullAddress });
        setIsOpen(false);
    };

    return (
        <>
            <div
                className="bg-white rounded-xl p-4 cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <label className="text-xs font-bold text-slate-400">
                    ĐỊA ĐIỂM LÀM VIỆC
                </label>
                <div className="flex justify-between items-center mt-2">
                    <p
                        className={
                            bookingData.address
                                ? 'text-slate-800 font-semibold'
                                : 'text-slate-400'
                        }
                    >
                        {bookingData.address || 'Chạm để chọn hoặc tạo địa chỉ'}
                    </p>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                </div>
            </div>

            <BookingLayout_1.AddressModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleConfirmAddress}
            />
        </>
    );
}

function AccordionItem({
    item,
    bookingData,
    setBookingData,
}: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const id = item.id;
    const currentItem = bookingData.selectedItems[id] || {
        quantity: 0,
        addGas: false,
    };
    const setItemData = (data: any) => {
        const newItems = { ...bookingData.selectedItems };
        if (data.quantity > 0 || data.addGas) {
            newItems[id] = data;
        } else {
            delete newItems[id];
        }
        setBookingData({ ...bookingData, selectedItems: newItems });
    };
    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4"
            >
                <span className="font-semibold text-slate-800">
                    {item.name}
                </span>
                <i
                    className={`fas fa-chevron-down transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                ></i>
            </button>
            {isOpen && (
                <div className="p-4 border-t bg-slate-50 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">
                            SỐ LƯỢNG
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    setItemData({
                                        ...currentItem,
                                        quantity: Math.max(
                                            0,
                                            currentItem.quantity - 1
                                        ),
                                    })
                                }
                                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600"
                            >
                                -
                            </button>
                            <span className="font-bold text-lg w-8 text-center">
                                {currentItem.quantity}
                            </span>
                            <button
                                onClick={() =>
                                    setItemData({
                                        ...currentItem,
                                        quantity: currentItem.quantity + 1,
                                    })
                                }
                                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">
                            BƠM GAS
                        </span>
                        <input
                            type="checkbox"
                            className="toggle-checkbox"
                            checked={currentItem.addGas}
                            onChange={(e) =>
                                setItemData({
                                    ...currentItem,
                                    addGas: e.target.checked,
                                })
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function SelectionForm({
    bookingData,
    setBookingData,
    openModal,
}: SelectionFormProps) {
    const { acType } = bookingData;
    const currentOptions = acOptions[acType] || [];
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
                <label className="text-xs font-bold text-slate-400 mb-2 block">
                    CHỌN LOẠI MÁY LẠNH
                </label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() =>
                            setBookingData({
                                ...bookingData,
                                acType: 'Treo tường',
                            })
                        }
                        className={`flex-1 p-2 rounded-md font-semibold ${
                            acType === 'Treo tường'
                                ? 'bg-teal-500 text-white shadow'
                                : 'text-slate-500'
                        }`}
                    >
                        Treo tường
                    </button>
                    <button
                        onClick={() =>
                            setBookingData({
                                ...bookingData,
                                acType: 'Tủ đứng',
                            })
                        }
                        className={`flex-1 p-2 rounded-md font-semibold ${
                            acType === 'Tủ đứng'
                                ? 'bg-teal-500 text-white shadow'
                                : 'text-slate-500'
                        }`}
                    >
                        Tủ đứng
                    </button>
                    <button
                        onClick={() =>
                            setBookingData({
                                ...bookingData,
                                acType: 'Âm trần',
                            })
                        }
                        className={`flex-1 p-2 rounded-md font-semibold ${
                            acType === 'Âm trần'
                                ? 'bg-teal-500 text-white shadow'
                                : 'text-slate-500'
                        }`}
                    >
                        Âm trần
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 space-y-4">
                <img
                    src={currentOptions[0]?.image || ''}
                    alt={`Ảnh ${acType}`}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                />
                {currentOptions.map((item) => (
                    <AccordionItem
                        key={item.id}
                        item={item}
                        bookingData={bookingData}
                        setBookingData={setBookingData}
                    />
                ))}
            </div>
            <div className="bg-white rounded-xl p-4 space-y-2">
                <button
                    onClick={() => openModal('process')}
                    className="flex justify-between items-center w-full text-left text-teal-600 font-semibold"
                >
                    <i className="fas fa-clipboard-list"></i>
                    <span>Quy trình các bước vệ sinh Máy lạnh</span>
                    <i className="fas fa-chevron-right"></i>
                </button>
                <hr />
                <div className="flex items-center gap-2 w-full text-left text-teal-500 font-semibold">
                    <i className="fas fa-shield-alt"></i>
                    <span>Dịch vụ được bảo hành trong 7 ngày.</span>
                </div>
            </div>
        </div>
    );
}

export default function ACCleaningServicePage() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState<BookingData>({
        address: '',
        acType: 'Treo tường',
        selectedItems: {},
        voucher_code: '',
    });

    const [modalType, setModalType] = useState<string | null>(null);
    const openModal = (type: string) => setModalType(type);
    const closeModal = () => setModalType(null);

    const totalDuration = useMemo(() => {
        return Object.entries(bookingData.selectedItems).reduce(
            (sum, [key, itemData]) => {
                const option = allPricingOptions.find(
                    (opt) => opt.id === Number(key)
                );
                if (!option) return sum;
                return sum + option.duration * itemData.quantity;
            },
            0
        );
    }, [bookingData.selectedItems]);

    useEffect(() => {
        localStorage.setItem('acCleaningBookingData', JSON.stringify(bookingData));
    }, [bookingData]);

    const handleNext = () => {
        if (totalDuration > 4.5) {
            Swal.fire({
                text: 'Chỉ được phép đặt dịch vụ tối đa 4.5 giờ',
                icon: 'warning',
                confirmButtonColor: '#14b8a6',
                confirmButtonText: 'Đóng',
                title: '',
            });
            return;
        }
        router.push('/booking/ac-cleaning/time');
    };

    return (
        <>
            <BookingLayout_1.AddressModal
                isOpen={modalType === 'address'}
                onClose={closeModal}
                onConfirm={(addr) => {
                    setBookingData({ ...bookingData, address: addr });
                    closeModal();
                }}
            />
            <BookingLayout_1.ProcessModal
                isOpen={modalType === 'process'}
                onClose={closeModal}
                acType={bookingData.acType}
            />

            <BookingLayout
                title="Vệ sinh Máy lạnh"
                onBack={() => router.push('//#services')}
                footer={
                    totalDuration > 0 && (
                        <button
                            onClick={handleNext}
                            disabled={!bookingData.address}
                            className="w-full p-3 bg-teal-500 text-white font-bold rounded-lg disabled:bg-slate-300"
                        >
                            Tiếp theo
                        </button>
                    )
                }
            >
                <div className="space-y-4">
                    <AddressSelectionForm
                        bookingData={bookingData}
                        setBookingData={setBookingData}
                    />
                    <SelectionForm
                        bookingData={bookingData}
                        setBookingData={setBookingData}
                        openModal={openModal}
                    />
                </div>
            </BookingLayout>
        </>
    );
}
