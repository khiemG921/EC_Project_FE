import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm m-4">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <p className="text-slate-600 mt-2 mb-8">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold">Hủy</button>
                    <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
