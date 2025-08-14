'use client';
import React from 'react';
import { Sparkles, MapPin, Handshake } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
const AboutUsPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-800">
            {/* Header section (placeholder) */}
            <Header />

            <main className="flex-grow">
                {/* Hero section */}
                <section className="bg-emerald-600 text-white py-20 md:py-32">
                    <div className="container mx-auto px-4 md:px-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                            Chọn – dọn cùng vô vàn tiện ích!
                        </h1>
                        <p className="mt-4 md:mt-6 text-lg md:text-xl max-w-2xl mx-auto">
                            Dự án cleanNow ra đời với sứ mệnh mang lại không gian sống sạch sẽ, gọn gàng và tạo ra cơ hội việc làm linh hoạt cho mọi người.
                        </p>
                    </div>
                </section>

                {/* About Us section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div className="order-2 lg:order-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                                    Chúng tôi là cleanNow
                                </h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Đồ án TNHH cleanNow được thành lập vào ngày 14/06/2025 bởi tập thể 4 thành viên gồm CEO Nguyễn Kim Anh, Full-stack-super-cool-developer Trần Gia Khiêm và Phạm Hoàng Tiên, UI-who-want-to-do-something-cool-developer Nguyễn Tiến Phát.
                                </p>
                                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                                    Chúng tôi cung cấp dịch vụ đa tiện ích như là vệ sinh máy lạnh; vệ sinh sofa, rèm thảm; giúp việc ca lẻ hay giúp việc định kỳ tùy theo nhu cầu thuê người làm việc của bạn; ... Thông qua trang web cleanNow siêu cấp tiện dụng của chúng tôi, bạn có thể trở thành cộng tác viên có thể chủ động đăng và nhận việc trực tiếp trên trang web của chúng tôi.
                                </p>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="aspect-w-16 aspect-h-9 relative rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src="https://hoctiengbalan.com/uploads/D%E1%BB%8Dn%20d%E1%BA%B9p%20nh%C3%A0%20c%E1%BB%ADa%201.jpg"
                                        alt="Nhóm dự án cleanNow"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Vision and Mission Section */}
                <section className="bg-white py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div>
                                <div className="aspect-w-16 aspect-h-9 relative rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src="https://enic.vn/wp-content/uploads/2025/01/don-dep-nha-cua-theo-trinh-tu-giup-qua-trinh-tro-nen-nhanh-chong-hon.jpg"
                                        alt="Ý nghĩa của cleanNow"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                                    Ý nghĩa của cleanNow
                                </h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Tên gọi cleanNow được lấy cảm hứng từ hai từ tiếng tiếng Anh là “clean” và “now”. Clean trong tiếng Anh có nghĩa là dọn dẹp, thể hiện sự sạch sẽ, gọn gàng, ngăn nắp như cách chúng tôi dọn dẹp cái nhà của các bạn vậy; đồng thời nó còn thể hiện rằng chúng tôi sẽ thực hiện yêu cầu của các bạn một cách “clean” nhất – không rườm rà, trì trệ và tận tụy
                                </p>
                                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                                    Còn từ now trong tiếng Anh có nghĩa là ngay bây giờ - đây chính là tinh thần làm việc của chúng tôi: kịp thời, ngay lập tức đáp ứng khi bạn có nhu cầu làm việc hay thuê tìm kiếm việc làm.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats and Achievements Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div className="order-2 lg:order-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                                    Phát triển mạnh hơn nữa
                                </h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Tính đến nay trang web của chúng tôi đã cung cấp dịch vụ dọn dẹp cho hơn 1.000.000 hộ gia đình trên khắp đất nước, đồng thời cung cấp việc làm cho hơn 80.000 người, tạo nguồn thu nhập ổn định cho những cộng tác viên hợp tác làm việc cùng chúng tôi.
                                </p>
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="flex items-center space-x-4">
                                        <Sparkles size={36} className="text-emerald-500" />
                                        <div>
                                            <p className="text-3xl font-extrabold">1,000,000+</p>
                                            <p className="text-gray-600">Hộ gia đình đã sử dụng</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Handshake size={36} className="text-emerald-500" />
                                        <div>
                                            <p className="text-3xl font-extrabold">80,000+</p>
                                            <p className="text-gray-600">Cộng tác viên</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="aspect-w-16 aspect-h-9 relative rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src="https://giupviecnhathienphuc.com/wp-content/uploads/2019/09/dich-vu-ve-sinh-nha-cua-tai-TPHCM.jpg"
                                        alt="Thống kê về cleanNow"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Operating Area Section */}
                <section className="bg-white py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div>
                                <div className="aspect-w-16 aspect-h-9 relative rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src="https://i.ytimg.com/vi/OY2q9ynIiQc/maxresdefault.jpg"
                                        alt="Bản đồ Việt Nam"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                                    Khu vực hoạt động
                                </h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Chúng tôi có mạng lưới hoạt động phủ rộng rãi khắp các khu vực, trải dài hơn 20 tỉnh thành và thành phố khắp đất nước: Thành phố Hồ Chí Minh, Hà Nội, Hoa Thanh Quế, Quảng Bình, Hải Phòng, Đà Nẵng, Hội An, Nha Trang, Đà Lạt, Bình Dương và 10 tỉnh thành khác.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer section (placeholder) */}
            <Footer />
        </div>
    );
};

export default AboutUsPage;

