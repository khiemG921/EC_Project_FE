// Component Footer cho trang chủ
import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-800 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-2xl font-bold text-white">Clean<span className="text-green-400">Now</span></h3>
          <p className="mt-4 text-gray-400">Dịch vụ dọn dẹp chuyên nghiệp, mang lại không gian sống trong lành cho gia đình bạn.</p>
        </div>
        <div>
          <h4 className="font-bold tracking-wider uppercase">Dịch vụ</h4>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Giúp Việc Ca Lẻ</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Giúp Việc Định Kỳ</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tổng Vệ Sinh</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Vệ Sinh Máy Lạnh</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold tracking-wider uppercase">Liên kết</h4>
          <ul className="mt-4 space-y-2">
            <li><a href="/about-us" className="text-gray-400 hover:text-white transition-colors">Về Chúng Tôi</a></li>
            <li><a href="/recruitment" className="text-gray-400 hover:text-white transition-colors">Tuyển Dụng</a></li>
            <li><a href="/policy" className="text-gray-400 hover:text-white transition-colors">Chính Sách</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold tracking-wider uppercase">Liên hệ</h4>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start"><MapPin size={20} className="mr-3 mt-1 flex-shrink-0" /><span className="text-gray-400">123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span></li>
            <li className="flex items-center"><Mail size={20} className="mr-3 flex-shrink-0" /><a href="mailto:support@cleannow.vn" className="text-gray-400 hover:text-white transition-colors">support@cleannow.vn</a></li>
            <li className="flex items-center"><Phone size={20} className="mr-3 flex-shrink-0" /><a href="tel:19008888" className="text-gray-400 hover:text-white transition-colors">1900 8888</a></li>
          </ul>
        </div>
      </div>
      {/* <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} CleanNow. All rights reserved.</p>
      </div> */}
    </div>
  </footer>
);

export default Footer;
