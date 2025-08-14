// Component dành cho Trang chủ để đặt dịch vụ dọn dẹp với kiểm tra đăng nhập
import React from 'react';

interface BookServiceButtonProps {
    bookingUrl?: string;
}

const BookServiceButton: React.FC<BookServiceButtonProps> = ({ bookingUrl }) => {
    const handleClick = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/auth/login';
                return;
            }
            if (bookingUrl) {
                window.location.href = bookingUrl;
            } else {
                window.location.href = '/';
            }
        }
    };
    return (
        <button onClick={handleClick} className="mt-4 bg-emerald-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-emerald-700 transition-all flex items-center">
            Đặt dịch vụ
        </button>
    );
};

export default BookServiceButton;
