// Component dành cho Trang chủ để hiển thị phần giới thiệu dịch vụ dọn dẹp
import React from 'react';

const HeroSection = () => (
    <section className="relative pt-24 pb-32 text-white">
        <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop')" }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                Dịch Vụ Dọn Dẹp Chuyên Nghiệp
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto font-light" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                Tận hưởng không gian sống trong lành và sạch sẽ. Đặt lịch chỉ trong vài phút, tận hưởng sự thảnh thơi.
            </p>
            <a href="#services" className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl">
                Khám Phá Dịch Vụ
            </a>
        </div>
    </section>
);

export default HeroSection;
