// // components/Sidebar.tsx
// 'use client';
// import React from 'react';

// // Component Sidebar nhận vào các props:
// // - onLogoutClick: Hàm xử lý khi bấm nút Đăng xuất.
// // - activeItem: Tên của mục đang được chọn (string).
// // - onItemClick: Hàm được gọi khi một mục điều hướng được click, truyền về tên mục đó.
// const Sidebar = ({ onLogoutClick, activeItem, onItemClick }: { onLogoutClick: () => void, activeItem: string, onItemClick: (item: string) => void }) => {
//     // Hàm trợ giúp để xác định class CSS cho mục điều hướng
//     const getItemClasses = (itemName: string) => {
//         // Nếu mục hiện tại là activeItem, áp dụng style xanh đậm, ngược lại là style thông thường
//         return activeItem === itemName
//             ? "flex items-center gap-3 px-4 py-3 bg-teal-500 text-white rounded-lg shadow-md font-semibold"
//             : "flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors";
//     };

//     return (
//         <aside className="w-64 bg-white shadow-lg flex flex-col h-screen fixed top-0 left-0 z-20">
//             <div className="flex items-center justify-center h-20 border-b border-slate-200">
//                 <h1 className="text-2xl font-bold text-teal-500">cleanNow</h1>
//             </div>
//             {/* Khu vực chứa các liên kết điều hướng, cho phép cuộn nếu nội dung vượt quá */}
//             <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
//                  <a href="/dashboard" className={getItemClasses('Dashboard')} onClick={() => onItemClick('Dashboard')}>
//                     <i className="fas fa-th-large w-5 text-center"></i>
//                     <span>Trang chủ</span>
//                 </a>
//                 <a href="/allservice" className={getItemClasses('Tất cả dịch vụ')} onClick={() => onItemClick('Tất cả dịch vụ')}>
//                     <i className="fas fa-th-large w-5 text-center"></i>
//                     <span>Tất cả dịch vụ</span>
//                 </a>
//                 <a href="/profile" className={getItemClasses('Hồ sơ của tôi')} onClick={() => onItemClick('Hồ sơ của tôi')}>
//                     <i className="fas fa-user w-5 text-center"></i>
//                     <span>Hồ sơ của tôi</span>
//                 </a>
//                 {/* --- MỤC YÊU THÍCH --- */}
//                 <a href="/favorite" className={getItemClasses('Yêu thích')} onClick={() => onItemClick('Yêu thích')}>
//                     <i className="fas fa-heart w-5 text-center"></i>
//                     <span>Yêu thích</span>
//                 </a>
//                 <a href="/history" className={getItemClasses('Lịch sử đặt')} onClick={() => onItemClick('Lịch sử đặt')}>
//                     <i className="fas fa-history w-5 text-center"></i>
//                     <span>Lịch sử đặt</span>
//                 </a>
//                 <a href="/rewards" className={getItemClasses('Lịch sử tích điểm')} onClick={() => onItemClick('Lịch sử tích điểm')}>
//                     <i className="fas fa-star w-5 text-center"></i>
//                     <span>Lịch sử tích điểm</span>
//                 </a>
//                 <a href="/settings" className={getItemClasses('Cài đặt')} onClick={() => onItemClick('Cài đặt')}>
//                     <i className="fas fa-cog w-5 text-center"></i>
//                     <span>Cài đặt</span>
//                 </a>
//             </nav>
//             <div className="p-4 border-t border-slate-200">
//                 <button 
//                     onClick={onLogoutClick} 
//                     className="w-full flex items-center justify-center gap-3 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors shadow-lg"
//                 >
//                     <i className="fas fa-sign-out-alt"></i>
//                     <span>Đăng xuất</span>
//                 </button>
//             </div>
//         </aside>
//     );
// };

// export default Sidebar;
