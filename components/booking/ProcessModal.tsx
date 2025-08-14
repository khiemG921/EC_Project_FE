import React from 'react';

interface ProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProcessModal({ isOpen, onClose }: ProcessModalProps) {
    if (!isOpen) return null;

    const steps = [
        'Kiểm tra và đánh giá tình trạng máy lạnh',
        'Tháo lưới lọc và các bộ phận có thể tháo được',
        'Vệ sinh lưới lọc bằng nước và chất tẩy rửa chuyên dụng',
        'Vệ sinh cánh quạt và động cơ quạt',
        'Vệ sinh dàn lạnh và dàn nóng',
        'Kiểm tra và bơm gas nếu cần thiết',
        'Lắp đặt lại các bộ phận và kiểm tra hoạt động',
        'Dọn dẹp khu vực làm việc'
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Quy trình vệ sinh máy lạnh</h3>
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                            </div>
                            <p className="text-sm text-gray-700">{step}</p>
                        </div>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-6 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}
