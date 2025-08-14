import React, { useState } from 'react';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (address: string) => void;
}

export default function AddressModal({ isOpen, onClose, onConfirm }: AddressModalProps) {
    const [address, setAddress] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (address.trim()) {
            onConfirm(address);
            onClose();
            setAddress('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4">
                <h3 className="text-lg font-bold mb-4">Nhập địa chỉ</h3>
                <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ chi tiết..."
                    className="w-full p-3 border rounded-lg mb-4 h-24 resize-none"
                />
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}
