'use client';
import React from 'react';
import { Smile, Briefcase, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';

const CareersPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-800">
            {/* Header section */}
            <Header />

            <main className="flex-grow">
                {/* Hero section */}
                <section className="bg-emerald-600 text-white py-20 md:py-32">
                    <div className="container mx-auto px-4 md:px-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                            cleanNow
                        </h1>
                        <p className="mt-4 md:mt-6 text-lg md:text-xl max-w-2xl mx-auto">
                            Với trang web mang sứ mệnh đem sự tiện ích tới mọi gia đình đang cần và nguồn thu nhập tới những con người cần nó, chúng tôi tự hào giới thiệu với các bạn về trang web cleanNow của chúng tôi, hãy trở thành một thành viên của chúng tôi ngay hôm nay.
                        </p>
                        <a 
                            href={`${API_BASE_URL}/auth/login`}
                            className="mt-8 inline-block bg-white text-emerald-600 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transition-colors duration-300"
                        >
                            Đăng nhập ngay
                        </a>
                    </div>
                </section>

                {/* Who we are section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div className="order-2 lg:order-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                                    Chúng tôi là ai?
                                </h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Chúng tôi là một nhóm các bạn trẻ tràn đầy đam mê và nhiệt huyết mong muốn biến thế giới này thành một nơi tốt đẹp và mang lại hạnh phúc cho gia đình chúng tôi, sau đó tới các bạn!
                                </p>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="aspect-w-16 aspect-h-9 relative rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src="https://dichvuvesinhnhagiare.com/wp-content/uploads/2020/12/Ve-sinh-nha-o-ha-noi.jpg"
                                        alt="Nhóm dự án cleanNow"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What we do section */}
                <section className="bg-emerald-50 py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div>
                                <div className="aspect-w-16 aspect-h-9 relative rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src="https://thethaovanhoa.mediacdn.vn/372676912336973824/2023/2/24/screen-shot-2023-02-24-at-072508-1677199770611678722719.png"
                                        alt="Công việc tại cleanNow"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                                    Chúng tôi làm những gì?
                                </h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Một trang web kết nối giữa những người có nhu cầu thuê giúp việc và những người muốn có công việc ngay trên giao diện website đơn giản – hợp lí rồi ai đòi hỏi được gì hơn cơ chứ 😊
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Why work here section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-b-4 border-emerald-500 pb-4 inline-block">
                            Vì sao bạn nên tới làm việc cùng chúng tôi ?
                        </h2>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-transform hover:scale-105 duration-300">
                                <Smile size={48} className="text-emerald-500 mx-auto" />
                                <h3 className="text-xl font-bold mt-4">Nó miễn phí !</h3>
                                <p className="text-gray-600 mt-2">
                                    Thì đã có gì nhiều đâu mà thu phí các bạn chứ 😊
                                </p>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-transform hover:scale-105 duration-300">
                                <Briefcase size={48} className="text-emerald-500 mx-auto" />
                                <h3 className="text-xl font-bold mt-4">Môi trường làm việc thoải mái !</h3>
                                <p className="text-gray-600 mt-2">
                                    Bạn thích thì cứ nghỉ, ở đây tôi không giao deadline cho bạn làm đâu, nhưng mà nhận việc rồi thì nhớ làm nha cha !
                                </p>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-transform hover:scale-105 duration-300">
                                <Sparkles size={48} className="text-emerald-500 mx-auto" />
                                <h3 className="text-xl font-bold mt-4">Kì nghỉ linh hoạt !</h3>
                                <p className="text-gray-600 mt-2">
                                    Bạn đọc lại cái bên cạnh là hiểu sao tôi nói vậy rồi khỏi giải thích he 😊
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer section */}
            <Footer />
        </div>
    );
};

export default CareersPage;
