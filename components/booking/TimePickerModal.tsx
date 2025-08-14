import React from 'react';

interface TimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (time: string) => void;
}

export default function TimePickerModal({ isOpen, onClose, onSelect }: TimePickerModalProps) {
    if (!isOpen) return null;

    const timeSlots = [
        '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];

    const handleTimeSelect = (time: string) => {
        onSelect(time);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Chọn giờ bắt đầu</h3>
                <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                        <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className="p-3 text-center border rounded-lg hover:bg-teal-50 hover:border-teal-500 transition-colors"
                        >
                            {time}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-4 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    Hủy
                </button>
            </div>
        </div>
    );
}
