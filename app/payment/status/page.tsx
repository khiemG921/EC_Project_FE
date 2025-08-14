'use client';

import React from 'react';
import Link from 'next/link';

// --- Component Header (reused from payment/page.tsx) ---
const Header: React.FC = () => {
    return (
        <header className="flex justify-between items-center mb-8 px-4 py-3 bg-white rounded-xl shadow-sm">
            <div className="flex items-center">
                {/* Để trống hoặc thêm breadcrumbs nếu cần */}
            </div>
            <div className="flex items-center gap-4">
                {/* Notification Icon */}
                <button className="relative p-2 text-slate-600 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
                    <i className="fas fa-bell text-xl"></i>
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                {/* User Profile Info */}
                <div className="flex items-center gap-2">
                    <img
                        src="https://placehold.co/40x40/2EC5B2/FFFFFF?text=A"
                        alt="User Avatar"
                        className="w-9 h-9 rounded-full object-cover border-2 border-teal-400"
                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')} // Fallback nếu ảnh lỗi
                    />
                    <span className="font-semibold text-slate-800">Nguyễn Kim Anh</span>
                </div>
            </div>
        </header>
    );
};

// --- Main Payment Success Page Component ---
const PaymentSuccessPage: React.FC = () => {
    // Dữ liệu giả định cho giao dịch thành công
    const transactionDetails = {
        transactionId: 'TXN-CLEANOW-123456789',
        amount: 265000, // Tổng tiền dịch vụ + phí nền tảng
        serviceName: 'Dọn dẹp nhà cửa',
        date: '28/07/2025',
        time: '15:30',
        paymentMethod: 'MoMo',
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <main className="flex-1 p-8">
                <Header />
                <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center mt-12">
                    <div className="mb-6">
                        <i className="fas fa-check-circle text-green-500 text-7xl mb-4 animate-bounce"></i>
                        <h1 className="text-4xl font-bold text-green-700 mb-2">Thanh toán thành công!</h1>
                        <p className="text-slate-600 text-lg">Giao dịch của bạn đã được xử lý thành công.</p>
                    </div>

                    <div className="text-left bg-green-50 p-6 rounded-lg mb-6 border border-green-200">
                        <h2 className="text-xl font-bold text-green-800 mb-4">Chi tiết giao dịch</h2>
                        <div className="space-y-2 text-slate-700">
                            <div className="flex justify-between">
                                <span className="font-semibold">Mã giao dịch:</span>
                                <span>{transactionDetails.transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Dịch vụ:</span>
                                <span>{transactionDetails.serviceName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Tổng tiền:</span>
                                <span className="font-bold text-teal-600">{transactionDetails.amount.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Ngày & Giờ:</span>
                                <span>{transactionDetails.date} lúc {transactionDetails.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Phương thức:</span>
                                <span>{transactionDetails.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <Link href="/dashboard" className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-teal-500/30 flex items-center justify-center">
                            <i className="fas fa-home mr-2"></i> Về trang chủ
                        </Link>
                        <Link href="/history" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center">
                            <i className="fas fa-history mr-2"></i> Xem lịch sử đặt
                        </Link>
                    </div>
                </div>
            </main>
            {/* Global styles for Font Awesome */}
            <style jsx global>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
            `}</style>
        </div>
    );
};

export default PaymentSuccessPage;