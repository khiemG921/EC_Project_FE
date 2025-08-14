import React from 'react';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    notes: string;
    setNotes: (notes: string) => void;
}

export default function NotesModal({ isOpen, onClose, onConfirm, notes, setNotes }: NotesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4">
                <h3 className="text-lg font-bold mb-4">Ghi chú cho nhân viên</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú (tùy chọn)..."
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
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
}
