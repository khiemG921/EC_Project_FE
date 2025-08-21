// components/booking/BookingLayout.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';

// --- Các Pop-up dùng chung ---
// AddressModal có"Địa chỉ đã lưu"
export const AddressModal = ({
    isOpen,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (address: string) => void;
}) => {
    const [step, setStep] = useState(1);
    const [fullAddress, setFullAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [addressDetails, setAddressDetails] = useState('');

    // --- STATE MỚI CHO AUTOCOMPLETE VÀ MAP ---
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lon: number;
    } | null>(null);
    const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;

    // load saved addresses from backend
    const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/location/get`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                    }
                );
                const payload = await res.json();

                // normalize into array-of-{address}
                let list: Array<{ address: string }> = [];
                if (Array.isArray(payload)) {
                    list = payload;
                } else if (Array.isArray((payload as any).result)) {
                    list = (payload as any).result;
                } else if (Array.isArray((payload as any).data)) {
                    list = (payload as any).data;
                } else {
                    // fallback: nothing to show
                    list = [];
                }

                setSavedAddresses(list.map((item) => item.address));
            } catch (err) {
                console.error('Failed to load saved addresses:', err);
                setSavedAddresses([]);
            }
        })();
    }, [isOpen]);

    // --- useEffect GỌI API AUTOCOMPLETE ---
    useEffect(() => {
        if (hasSelectedSuggestion) {
            return;
        }

        if (searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/location/autocomplete`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: searchQuery }),
                    }
                );
                const data = await res.json();
                setSuggestions(data);
            } catch (error) {
                console.error('Autocomplete failed:', error);
            }
        }, 300); // Debounce 300ms
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // --- useEffect KHỞI TẠO BẢN ĐỒ ---
    useEffect(() => {
        if (!isOpen || step !== 2 || mapInstanceRef.current) return;

        const goongjs = (window as any).goongjs;
        if (!goongjs || !mapContainerRef.current) return;

        goongjs.accessToken = GOONG_API_KEY;
        const centerCoords = selectedLocation
            ? [selectedLocation.lon, selectedLocation.lat]
            : [106.73653091, 10.79495855];

        const map = new goongjs.Map({
            container: mapContainerRef.current,
            style: 'https://tiles.goong.io/assets/goong_map_web.json',
            center: centerCoords,
            zoom: 16,
        });
        mapInstanceRef.current = map;

        // khởi tạo marker tại vị trí ban đầu
        markerRef.current = new goongjs.Marker()
            .setLngLat(centerCoords)
            .addTo(map);

        // ─── FIX: force resize ngay sau khi render container ───
        map.on('load', () => {
            map.resize();
        });
        // Nếu thư viện không emit 'load', dùng fallback:
        setTimeout(() => {
            map.resize();
        }, 100);

        // click lên map → di chuyển marker và chọn luôn
        map.on('click', (e: any) => {
            const { lat, lng } = e.lngLat;
            // di chuyển marker
            markerRef.current.setLngLat([lng, lat]);
            // cập nhật state
            setSelectedLocation({ lat, lon: lng });
            // tự động gọi chọn vị trí (bước 3)
            handleSelectOnMap(lng, lat);
        });

        return () => {
            map.off('click');
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [isOpen, step, selectedLocation, GOONG_API_KEY]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSearchQuery('');
            setHasSelectedSuggestion(false);
            setSuggestions([]);
            setAddressDetails('');
            setFullAddress('');
            setSelectedLocation(null);
        }
    }, [isOpen]);

    const handleSuggestionClick = (suggestion: any) => {
        setSearchQuery(suggestion.name);
        setSelectedLocation({ lat: suggestion.lat, lon: suggestion.lon });
        setFullAddress(suggestion.name); // Lưu địa chỉ đầy đủ
        setDistrict(suggestion.district || '');
        setCity(suggestion.city || '');
        setSuggestions([]); // Ẩn danh sách gợi ý đi
        setHasSelectedSuggestion(true); // đánh dấu đã chọn
    };

    const handleSelectOnMap = async (lng?: number, lat?: number) => {
        if (!mapInstanceRef.current) return;
        const coords =
            lng != null && lat != null
                ? { lat, lng }
                : mapInstanceRef.current.getCenter();
        try {
            console.log('Selected coordinates:', coords);
            const res = await fetch(`/api/location/reverse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
            });
            const data = await res.json();
            console.log('Reverse geocoding result:', data);
            setFullAddress(data.address);
            setCity(data.city);
            setDistrict(data.district);
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            setFullAddress(
                `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
            );
        }
        setSelectedLocation({ lat: coords.lat, lon: coords.lng });
        setStep(3);
    };

    // Xác nhận và đóng modal
    const handleConfirmAddress = async () => {
        if (!addressDetails || !selectedLocation) return;
        const detail = `${addressDetails}, ${fullAddress}`;

        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/location/create`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: selectedLocation.lat,
                        longtitude: selectedLocation.lon,
                        city: city,
                        district: district,
                        detail: detail,
                    }),
                    credentials: 'include',
                }
            );
        } catch (err) {
            console.error('Save location failed:', err);
        }
        onConfirm(detail);
        onClose();
    };

    // Chọn địa chỉ đã lưu sẽ xác nhận ngay lập tức
    const handleSelectSavedAddress = (address: string) => {
        onConfirm(address);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <header className="flex items-center p-4 border-b">
                <button
                    onClick={
                        step === 1 ? onClose : () => setStep((prev) => prev - 1)
                    }
                    className="text-xl w-10 h-10 flex items-center justify-center"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h2 className="font-bold text-lg mx-auto">Chọn địa điểm</h2>
                <div className="w-10"></div>
            </header>

            {/* Thêm overflow-y-auto để đảm bảo nội dung cuộn được */}
            <div className="flex-grow overflow-y-auto">
                {step === 1 && (
                    <div className="p-4 space-y-4">
                        {/* BỌC INPUT VÀO DIV ĐỂ ĐỊNH VỊ DANH SÁCH GỢI Ý */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nhập tên đường, tòa nhà..."
                                className="w-full p-3 bg-slate-100 rounded-lg"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setHasSelectedSuggestion(false);
                                }}
                            />
                            {/* HIỂN THỊ DANH SÁCH GỢI Ý */}
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                handleSuggestionClick(s)
                                            }
                                            className="w-full text-left p-3 hover:bg-slate-100"
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full flex items-center gap-3 p-3 text-left text-teal-600 font-semibold hover:bg-teal-50 rounded-lg"
                        >
                            <i className="fas fa-map-marked-alt w-5 text-center"></i>
                            <span>Chọn trực tiếp trên bản đồ</span>
                        </button>
                        <hr />
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-400">
                                ĐỊA CHỈ ĐÃ LƯU
                            </h3>
                            {savedAddresses.length ? (
                                savedAddresses.map((addr) => (
                                    <button
                                        key={addr}
                                        onClick={() =>
                                            handleSelectSavedAddress(addr)
                                        }
                                        className="w-full p-3 bg-slate-100 rounded-lg text-left"
                                    >
                                        {addr}
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Không có địa chỉ đã lưu
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="flex flex-col flex-grow h-full">
                        {/* Bản đồ chiếm toàn bộ không gian còn lại */}
                        <div ref={mapContainerRef} className="flex-grow" />

                        {/* Footer chứa nút xác nhận, luôn hiển thị trên cùng */}
                        <div className="p-4 bg-white border-t">
                            <button
                                onClick={() => handleSelectOnMap()}
                                className="w-full px-6 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg"
                            >
                                Xác nhận vị trí này
                            </button>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">Địa chỉ đã chọn:</h3>
                        <p className="p-3 bg-slate-100 rounded-lg mb-4">
                            {fullAddress}
                        </p>
                        <label className="font-semibold mb-2 block">
                            Số nhà / Căn hộ / Ngõ hẻm:
                        </label>
                        <input
                            type="text"
                            placeholder="Phòng, số nhà, ngõ..."
                            value={addressDetails}
                            onChange={(e) => setAddressDetails(e.target.value)}
                            className="w-full p-3 bg-slate-100 rounded-lg mb-4"
                        />
                        <button
                            onClick={handleConfirmAddress}
                            disabled={!addressDetails}
                            className="w-full p-3 bg-teal-500 text-white font-bold rounded-lg disabled:bg-slate-300"
                        >
                            Xác nhận địa chỉ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Modal hiển thị bảng giá dịch vụ
export const PriceListModal = ({
    isOpen,
    onClose,
    title,
    items = [],
    prices = [],
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: { id: number; name: string }[];
    prices: { id: number; price: number }[];
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">
                        Bảng giá tham khảo
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-800 text-2xl"
                    >
                        &times;
                    </button>
                </div>
                <div className="space-y-2">
                    {items.map((item) => {
                        const p = prices.find((x) => x.id === item.id);
                        return (
                            <div key={item.id} className="flex justify-between">
                                <span>{item.name}</span>
                                <strong>
                                    {(p?.price ?? 0).toLocaleString()}đ
                                </strong>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Modal để chọn giờ bắt đầu công việc
export const TimePickerModal = ({
    isOpen,
    onClose,
    onSelect,
    selectedDate,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (time: string) => void;
    selectedDate?: Date | string;
}) => {
    if (!isOpen) return null;
    const morningSlots = [
        '07:00',
        '07:30',
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
    ];
    const afternoonSlots = [
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
    ];
   const now = new Date();
   const currentDate = selectedDate ? new Date(selectedDate) : now;
   const isToday = currentDate.toDateString() === now.toDateString();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-800 text-lg"
                    >
                        Hủy
                    </button>
                    <h3 className="text-lg font-bold text-slate-800">
                        Chọn giờ bắt đầu
                    </h3>
                    <div className="w-12"></div>
                </div>
                <div className="p-4 max-h-[50vh] overflow-y-auto">
                    <div className="mb-4">
                        <h4 className="font-bold text-slate-600 mb-2">
                            Buổi sáng
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                            {morningSlots.map((time) => {
                                const [h, m] = time
                                    .split(':')
                                    .map((n) => parseInt(n, 10));
                                const slotTime = new Date();
                                slotTime.setHours(h, m, 0, 0);
                                const disabled = isToday && slotTime < now;
                                return (
                                    <button
                                        key={time}
                                        onClick={() =>
                                            !disabled && onSelect(time)
                                        }
                                        disabled={disabled}
                                        className={`p-2 rounded-lg text-slate-700 font-semibold
                                            ${
                                                disabled
                                                    ? 'bg-gray-200 cursor-not-allowed opacity-50'
                                                    : 'bg-slate-100 hover:bg-teal-100'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-600 mb-2">
                            Buổi chiều
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                            {afternoonSlots.map(time => {
                                const [h, m] = time.split(':').map(n => parseInt(n, 10));
                                const slotTime = new Date();
                                slotTime.setHours(h, m, 0, 0);
                                const disabled = isToday && slotTime < now;
                                return (
                                    <button
                                        key={time}
                                        onClick={() => !disabled && onSelect(time)}
                                        disabled={disabled}
                                        className={`p-2 rounded-lg text-slate-700 font-semibold
                                            ${disabled
                                                ? 'bg-gray-200 cursor-not-allowed opacity-50'
                                                : 'bg-slate-100 hover:bg-teal-100'}`}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal để chọn số lượng dịch vụ
export const QuantitySelector = ({
    item,
    quantity,
    setQuantity,
}: {
    item: any;
    quantity: number;
    setQuantity: (q: number) => void;
}) => (
    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
        <div>
            <span className="font-semibold text-slate-700">{item.name}</span>
            {item.description && (
                <p className="text-xs text-slate-500">{item.description}</p>
            )}
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors flex-shrink-0"
            >
                <i className="fas fa-minus"></i>
            </button>
            <span className="font-bold text-lg w-8 text-center">
                {quantity}
            </span>
            <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors flex-shrink-0"
            >
                <i className="fas fa-plus"></i>
            </button>
        </div>
    </div>
);

// ---------------------- PROCESS MODAL ----------------------
// Modal hiển thị quy trình vệ sinh máy lạnh
export const ProcessModal = ({
    isOpen,
    onClose,
    acType,
}: {
    isOpen: boolean;
    onClose: () => void;
    acType: 'Treo tường' | 'Tủ đứng' | 'Âm trần';
}) => {
    if (!isOpen) return null;

    const processContent = {
        'Treo tường': {
            title: 'Quy trình vệ sinh Máy lạnh Treo tường',
            steps: [
                '**Bước 1: Kiểm tra tình trạng máy:** Bật, kiểm tra và xác nhận tình trạng máy với Khách hàng.',
                '**Bước 2: Vệ sinh bộ lọc và vỏ máy:** Ngắt nguồn điện. Tháo gỡ lưới lọc, mặt nạ. Dùng vòi xịt áp lực cao làm sạch.',
                '**Bước 3: Vệ sinh giàn lạnh:** Che chắn bo mạch. Treo túi hứng nước. Dùng bơm tăng áp xịt rửa giàn lạnh.',
                '**Bước 4: Vệ sinh giàn nóng:** Dùng máy bơm áp lực xịt rửa giàn nóng và khu vực xung quanh.',
                '**Bước 5: Bơm ga (nếu có):** Gắn dây vào đồng hồ đo và giàn nóng để xác định lượng gas cần bơm.',
                '**Bước 6: Lắp lại và kiểm tra:** Dùng khăn lau khô, lắp đặt lại, bật máy và kiểm tra.',
            ],
            note: null,
        },
        'Tủ đứng': {
            title: 'Quy trình vệ sinh Máy lạnh Tủ đứng',
            steps: [
                // Giả sử quy trình tương tự máy treo tường
                '**Bước 1: Kiểm tra tình trạng máy:** Bật, kiểm tra và xác nhận tình trạng máy với Khách hàng.',
                '**Bước 2: Vệ sinh bộ lọc và vỏ máy:** Ngắt nguồn điện. Tháo gỡ lưới lọc, mặt nạ. Dùng vòi xịt áp lực cao làm sạch.',
                '**Bước 3: Vệ sinh giàn lạnh:** Che chắn bo mạch. Treo túi hứng nước. Dùng bơm tăng áp xịt rửa giàn lạnh.',
                '**Bước 4: Vệ sinh giàn nóng:** Dùng máy bơm áp lực xịt rửa giàn nóng và khu vực xung quanh.',
                '**Bước 5: Bơm ga (nếu có):** Gắn dây vào đồng hồ đo và giàn nóng để xác định lượng gas cần bơm.',
                '**Bước 6: Lắp lại và kiểm tra:** Dùng khăn lau khô, lắp đặt lại, bật máy và kiểm tra.',
            ],
            note: null,
        },
        'Âm trần': {
            title: 'Quy trình vệ sinh Máy lạnh Âm trần',
            steps: [
                '**Bước 1: Kiểm tra tình trạng máy:** Bật, kiểm tra và xác nhận tình trạng máy với Khách hàng.',
                '**Bước 2: Vệ sinh lưới lọc và họng gió:** Ngắt nguồn điện. Vệ sinh sạch lưới lọc và họng gió của máy.',
                '**Bước 3: Vệ sinh giàn nóng:** Dùng máy bơm áp lực xịt rửa giàn nóng và khu vực xung quanh.',
                '**Bước 4: Lắp lại và kiểm tra:** Lắp lại các bộ phận, bật máy và kiểm tra lại hoạt động.',
            ],
            note: 'Lưu ý: Máy lạnh giấu trần chỉ vệ sinh lưới lọc, họng gió và cục nóng.',
        },
    };

    const content = processContent[acType] || processContent['Treo tường'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-slate-800">
                        {content.title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-800 text-2xl"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-6 space-y-3 text-slate-600 text-sm max-h-[70vh] overflow-y-auto">
                    {content.note && (
                        <p className="font-semibold text-orange-500">
                            {content.note}
                        </p>
                    )}
                    {content.steps.map((step, index) => (
                        <p
                            key={index}
                            dangerouslySetInnerHTML={{
                                __html: step.replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<strong>$1</strong>'
                                ),
                            }}
                        ></p>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Modal để nhập ghi chú cho Tasker ---
export const NotesModal = ({
    isOpen,
    onClose,
    onConfirm,
    notes,
    setNotes,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    notes: string;
    setNotes: (n: string) => void;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                    Ghi chú cho Tasker
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    Ghi chú này sẽ giúp Tasker làm nhanh và tốt hơn.
                </p>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Tầng 1 ngoài ban công có 1 Máy lạnh không mát..."
                    className="w-full p-3 bg-slate-100 border-transparent rounded-lg h-24 resize-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
                <button
                    onClick={onConfirm}
                    className="w-full mt-4 p-3 bg-teal-500 text-white font-bold rounded-lg"
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};

// --- Modal để chọn ngày trong lịch ---
export const CalendarModal = ({
    isOpen,
    onClose,
    onSelectDate,
    selectedDate,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: Date) => void;
    selectedDate?: Date | string;
}) => {
    if (!isOpen) return null;

    // 1) Luôn giữ một biến Date để so sánh
    const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
    const selectedDateStr = selectedDateObj?.toDateString();

    // 2) State tháng hiển thị
    const initial = selectedDateObj || new Date();
    const [currentMonth, setCurrentMonth] = useState<Date>(initial);

    // Khi selectedDate thay đổi (có thể là chuỗi), đồng bộ currentMonth
    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(new Date(selectedDate));
        }
    }, [selectedDate]);

    const renderCalendar = () => {
        const today = new Date();
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDateStr;
            const isPast = date < today && !isToday;

            days.push(
                <button
                    key={i}
                    disabled={isPast}
                    onClick={() => onSelectDate(date)}
                    className={[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isPast ? 'text-slate-300' : '',
                        isSelected ? 'bg-teal-500 text-white' : '',
                        isToday && !isSelected
                            ? 'border-2 border-teal-500'
                            : '',
                    ].join(' ')}
                >
                    {i}
                </button>
            );
        }

        return days;
    };
    const changeMonth = (offset: number) => {
        setCurrentMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-4">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <h3 className="font-bold">
                        {currentMonth.toLocaleString('vi-VN', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </h3>
                    <button onClick={() => changeMonth(1)}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                        <div key={day} className="font-semibold text-slate-500">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {renderCalendar()}
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-4 p-3 bg-teal-500 text-white font-bold rounded-lg"
                >
                    Xong
                </button>
            </div>
        </div>
    );
};

// --- COMPONENT BOOKING LAYOUT ---
interface BookingLayoutProps {
    title: string;
    footer: React.ReactNode;
    children: React.ReactNode;
    onBack: () => void;
}

const BookingLayout = ({
    title,
    footer,
    children,
    onBack,
}: BookingLayoutProps) => {
    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="bg-white flex items-center p-4 shadow-sm fixed top-0 left-0 right-0 z-30">
                <button
                    onClick={onBack}
                    className="text-xl w-8 text-left text-slate-600 hover:text-slate-800"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1 className="font-bold text-lg mx-auto">{title}</h1>
                <div className="w-8">
                    <i className="fas fa-info-circle text-xl text-slate-400"></i>
                </div>
            </header>
            <main className="pt-20 pb-28 px-4">{children}</main>
            <footer className="bg-white p-4 shadow-top fixed bottom-0 left-0 right-0 z-30">
                {footer}
            </footer>
        </div>
    );
};

export default BookingLayout;
