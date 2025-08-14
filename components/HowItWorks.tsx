// Component dành cho Trang chủ để hiển thị phần hướng dẫn quy trình hoạt động
import React from 'react';

const HowItWorks = () => (
    <section id="how-it-works" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">Quy Trình Hoạt Động</h2>
                <p className="text-gray-600 mt-3 text-lg">Chỉ với 3 bước đơn giản để có ngay không gian sạch như mới.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                    <div className="flex justify-center items-center mb-4">
                        <div className="bg-green-100 text-green-600 rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold">1</div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Chọn Dịch Vụ</h3>
                    <p className="text-gray-600">Lựa chọn dịch vụ dọn dẹp phù hợp với nhu cầu của bạn.</p>
                </div>
                <div className="p-6">
                    <div className="flex justify-center items-center mb-4">
                        <div className="bg-green-100 text-green-600 rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold">2</div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Đặt Lịch Hẹn</h3>
                    <p className="text-gray-600">Chọn ngày giờ và địa điểm thuận tiện cho bạn.</p>
                </div>
                <div className="p-6">
                    <div className="flex justify-center items-center mb-4">
                        <div className="bg-green-100 text-green-600 rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold">3</div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Thanh Toán & Tận Hưởng</h3>
                    <p className="text-gray-600">Nhân viên chuyên nghiệp sẽ đến và hoàn thành công việc.</p>
                </div>
            </div>
        </div>
    </section>
);

export default HowItWorks;
