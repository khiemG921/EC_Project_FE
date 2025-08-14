'use client';
import React, { useState } from 'react';
import { Shield, FileText, Users, Mail } from 'lucide-react';

import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
    { id: 'data-collection', title: 'Thu thập thông tin cá nhân', icon: <Shield size={20} /> },
    { id: 'data-usage', title: 'Mục đích và phạm vi sử dụng', icon: <FileText size={20} /> },
    { id: 'data-disclosure', title: 'Tiếp cận và chia sẻ thông tin', icon: <Users size={20} /> },
    { id: 'contact', title: 'Liên hệ & giải quyết khiếu nại', icon: <Mail size={20} /> },
];

const PolicyPage = () => {
    const [activeSection, setActiveSection] = useState('data-collection');

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-800">
            {/* Header đã được đặt cố định, cần xử lý khi anchor link */}
            <Header />

            <main className="flex-grow">
                <section className="container mx-auto px-4 md:px-8 py-16 md:py-24">
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:p-16">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar Navigation */}
                            <nav className="lg:col-span-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Chính sách Bảo mật
                                </h2>
                                <ul className="space-y-2">
                                    {sections.map(section => (
                                        <li key={section.id}>
                                            <a
                                                href={`#${section.id}`}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                                                    activeSection === section.id
                                                        ? 'bg-emerald-500 text-white font-semibold'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600'
                                                }`}
                                            >
                                                {section.icon}
                                                <span>{section.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                <div className="space-y-12">
                                    {/* Section 1: Thu thập thông tin cá nhân */}
                                    <div id="data-collection" className="scroll-mt-[5rem]">
                                        <h3 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4 mb-6">
                                            Thu thập thông tin cá nhân
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            “Thông tin Cá nhân” là thông tin về bạn mang tính nhận dạng, bao gồm nhưng không giới hạn tên, số CMND, địa chỉ, số điện thoại, địa chỉ email, thông tin tài chính, nghề nghiệp, và bất kỳ thông tin nào bạn cung cấp cho cleanNow. Việc cung cấp thông tin là hoàn toàn tự nguyện, tuy nhiên, nếu bạn không cung cấp, chúng tôi có thể không thể xử lý yêu cầu của bạn hoặc cung cấp dịch vụ.
                                        </p>
                                        <p className="mt-4 text-gray-600 leading-relaxed">
                                            Chúng tôi có thể thu thập thông tin từ nhiều nguồn khác nhau, bao gồm từ các đơn đăng ký của bạn, các trang mạng xã hội của cleanNow, khi bạn tương tác tại các sự kiện hoặc qua việc sử dụng trang web của chúng tôi.
                                        </p>
                                    </div>

                                    {/* Section 2: Mục đích và phạm vi sử dụng */}
                                    <div id="data-usage" className="scroll-mt-[5rem]">
                                        <h3 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4 mb-6">
                                            Mục đích và phạm vi sử dụng
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Chúng tôi sử dụng thông tin của bạn để:
                                        </p>
                                        <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
                                            <li>Cung cấp, quản lý và xác minh các dịch vụ bạn yêu cầu.</li>
                                            <li>Thực hiện các nghĩa vụ theo thỏa thuận đã ký kết.</li>
                                            <li>Phục vụ mục đích quản lý nội bộ như kiểm toán và phân tích dữ liệu.</li>
                                            <li>Hỗ trợ phát hiện, ngăn chặn và truy tố tội phạm.</li>
                                            <li>Liên hệ với bạn về các thông tin liên quan đến dịch vụ.</li>
                                        </ul>
                                        <p className="mt-6 text-gray-600 leading-relaxed">
                                            Thông tin cá nhân của bạn sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc bạn tự thực hiện việc hủy bỏ. Chúng tôi cam kết bảo mật thông tin cá nhân của bạn trên máy chủ của cleanNow.
                                        </p>
                                    </div>

                                    {/* Section 3: Tiếp cận và chia sẻ thông tin */}
                                    <div id="data-disclosure" className="scroll-mt-[5rem]">
                                        <h3 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4 mb-6">
                                            Tiếp cận và chia sẻ thông tin
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Thông tin cá nhân của bạn có thể được chuyển giao hoặc tiết lộ cho bên thứ ba để phục vụ các mục đích đã nêu trên. Bên thứ ba có thể bao gồm các đối tác, nhà cung cấp dịch vụ công nghệ thông tin, cố vấn chuyên môn, và các cơ quan Chính phủ khi cần thiết để tuân thủ pháp luật.
                                        </p>
                                        <p className="mt-4 text-gray-600 leading-relaxed">
                                            cleanNow có thể làm việc với các công ty, nhà cung cấp dịch vụ hoặc cá nhân khác để thực hiện các chức năng thay mặt chúng tôi, và vì vậy có thể cung cấp quyền tiếp cận thông tin của bạn cho các bên này.
                                        </p>
                                    </div>

                                    {/* Section 4: Liên hệ và giải quyết khiếu nại */}
                                    <div id="contact" className="scroll-mt-[5rem]">
                                        <h3 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4 mb-6">
                                            Liên hệ & giải quyết khiếu nại
                                        </h3>
                                        <div className="text-gray-600 leading-relaxed space-y-4">
                                            <p>
                                                Bạn có thể yêu cầu truy cập, đính chính, hoặc xóa bỏ thông tin cá nhân của mình bằng cách liên hệ với chúng tôi. Chúng tôi sẽ xử lý yêu cầu của bạn theo quy định pháp luật.
                                            </p>
                                            <p>
                                                Khi phát sinh khiếu nại hoặc tranh chấp, chúng tôi đề cao giải pháp thương lượng, hòa giải. Bạn có thể liên hệ với chúng tôi qua các kênh sau:
                                            </p>
                                            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
                                                <li>Địa chỉ: 135B đường Trần Hưng Đạo, phường Cầu Ông Lãnh, quận 1, thành phố Hồ Chí Minh</li>
                                                <li>Email: phatkhangoz33@gmail.com</li>
                                                <li>Điện thoại: 0398437922</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
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

export default PolicyPage;