// 'use client';
// import React, { useState, useEffect, useMemo } from 'react';
// // import Sidebar from '../../components/Sidebars'; 

// // --- Component Header ---
// const Header: React.FC = () => {
//     return (
//         <header className="flex justify-between items-center mb-8 px-4 py-3 bg-white rounded-xl shadow-sm">
//             <div className="flex items-center">
//             </div>
//             <div className="flex items-center gap-4">
//                 {/* Notification Icon */}
//                 <button className="relative p-2 text-slate-600 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
//                     <i className="fas fa-bell text-xl"></i>
//                     <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
//                 </button>
//                 {/* User Profile Info */}
//                 <div className="flex items-center gap-2">
//                     <img
//                         src="https://placehold.co/40x40/2EC5B2/FFFFFF?text=A"
//                         alt="User Avatar"
//                         className="w-9 h-9 rounded-full object-cover border-2 border-teal-400"
//                         onError={(e) => (e.currentTarget.src = '/default-avatar.png')} // Fallback nếu ảnh lỗi
//                     />
//                     <span className="font-semibold text-slate-800">Nguyễn Kim Anh</span>
//                 </div>
//             </div>
//         </header>
//     );
// };

// // --- Component chính của trang Tất cả dịch vụ ---
// const EcatalogPage: React.FC = () => {
//     // State để quản lý mục đang active trên Sidebar
//     const [activeSidebarItem, setActiveSidebarItem] = useState('Tất cả dịch vụ');

//     // State chứa danh sách tất cả các dịch vụ
//     const [allServices, setAllServices] = useState<Array<{
//         id: number;
//         name: string;
//         description: string;
//         image_url: string;
//         route: string;
//         isFavorite: boolean;
//         type: string; // Thêm trường type để phân cấp
//     }>>([]);

//     // State cho từ khóa tìm kiếm
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedType, setSelectedType] = useState<string | null>(null);

//     useEffect(() => {
//         setTimeout(() => {
//             setAllServices([
//                 {
//                     id: 1,
//                     name: "Giúp việc theo giờ",
//                     description: "Dọn dẹp ngắn hạn theo giờ và linh hoạt lịch",
//                     image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/hourly",
//                     isFavorite: false,
//                     type: "Dịch Vụ Phổ Biến"
//                 },
//                 {
//                     id: 2,
//                     name: "Giúp việc định kỳ",
//                     description: "Dọn dẹp định kỳ, giữ nhà cửa luôn sạch sẽ",
//                     image_url: "https://img.lovepik.com/photo/50771/5843.jpg_wh860.jpg",
//                     route: "/booking/recurring",
//                     isFavorite: false,
//                     type: "Dịch Vụ Phổ Biến"
//                 },
//                 {
//                     id: 3,
//                     name: "Vệ sinh sofa, rèm, thảm",
//                     description: "Làm sạch đồ vải trong nhà nhanh gọn",
//                     image_url: "https://sofatruongan.com/wp-content/uploads/2021/10/mot-so-dieu-luu-y-khi-tao-dang-chup-anh-ngoi-ghe-sofa.jpg",
//                     route: "/booking/upholstery-curtains-carpets",
//                     isFavorite: false,
//                     type: "Dịch Vụ Phổ Biến"
//                 },
//                 {
//                     id: 4,
//                     name: "Vệ sinh máy lạnh",
//                     description: "Bảo dưỡng và làm sạch máy lạnh",
//                     image_url: "https://media.istockphoto.com/id/176853963/vi/anh/c%C3%B4-g%C3%A1i-xinh-%C4%91%E1%BA%B9p-v%E1%BB%9Bi-%C4%91i%E1%BB%81u-h%C3%B2a-kh%C3%B4ng-kh%C3%AD.jpg?s=612x612&w=0&k=20&c=ToE2WYRLdm1sCTIydPQr93wKYFy9mGL13TVbWI6E-Kk=",
//                     route: "/booking/ac-cleaning",
//                     isFavorite: false,
//                     type: "Dịch Vụ Bảo Dưỡng Điện Máy"
//                 },
//                 {
//                     id: 5,
//                     name: "Nấu ăn tại nhà",
//                     description: "Đầu bếp chuyên nghiệp chuẩn bị bữa ăn ngon, dinh dưỡng theo yêu cầu.",
//                     image_url: "https://images.unsplash.com/photo-1506354619780-b0b6703b4b8a?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/cooking",
//                     isFavorite: false,
//                     type: "Dịch Vụ Tiện Ích Nâng Cao"
//                 },
//                 {
//                     id: 6,
//                     name: "Chăm sóc trẻ em",
//                     description: "Người giúp việc tận tâm chăm sóc, chơi đùa và hỗ trợ học tập cho bé.",
//                     image_url: "https://images.unsplash.com/photo-1563461660947-505432039147?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/childcare",
//                     isFavorite: false,
//                     type: "Dịch Vụ Chăm Sóc"
//                 },
//                 {
//                     id: 7,
//                     name: "Vệ Sinh Văn Phòng",
//                     description: "Dọn dẹp văn phòng, duy trì môi trường làm việc sạch",
//                     image_url: "https://free.vector6.com/wp-content/uploads/2020/03/Stock-Anh-04001.jpg",
//                     route: "/booking/office-cleaning",
//                     isFavorite: false,
//                     type: "Dịch Vụ Dành Cho Doanh Nghiệp"
//                 },
//                 {
//                     id: 8,
//                     name: "Vệ Sinh Công Nghiệp",
//                     description: "Vệ sinh nhà xưởng, công trình lớn",
//                     image_url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/industrial-cleaning",
//                     isFavorite: false,
//                     type: "Dịch Vụ Dành Cho Doanh Nghiệp"
//                 },
//                 {
//                     id: 9,
//                     name: "Chăm Sóc Người Cao Tuổi",
//                     description: "Hỗ trợ sinh hoạt, nâng cao chất lượng cho người lớn tuổi",
//                     image_url: "https://images.unsplash.com/photo-1521737711867-ee563518a287?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/elderly-care",
//                     isFavorite: false,
//                     type: "Dịch Vụ Chăm Sóc"
//                 },
//                 {
//                     id: 10,
//                     name: "Đi chợ hộ",
//                     description: "Mua sắm thực phẩm tươi ngon, đảm bảo chất lượng theo danh sách của bạn.",
//                     image_url: "https://images.unsplash.com/photo-1542838117-380d6118d360?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/grocery",
//                     isFavorite: false,
//                     type: "Dịch Vụ Tiện Ích Nâng Cao"
//                 },
//                 {
//                     id: 11,
//                     name: "Giặt Ủi",
//                     description: "Giặt ủi quần áo, giao nhận tận nơi",
//                     image_url: "https://images.unsplash.com/photo-1545173361-9c60dd79d865?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/laundry",
//                     isFavorite: false,
//                     type: "Dịch Vụ Tiện Ích Nâng Cao"
//                 },
//                 {
//                     id: 12,
//                     name: "Sửa chữa điện nước",
//                     description: "Khắc phục nhanh chóng các sự cố điện, nước trong gia đình.",
//                     image_url: "https://images.unsplash.com/photo-1581092281896-e2a225301827?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/repair",
//                     isFavorite: false,
//                     type: "Dịch Vụ Tiện Ích Nâng Cao"
//                 },
//                 {
//                     id: 13,
//                     name: "Tổng Vệ Sinh",
//                     description: "Vệ sinh tổng thể cho mọi không gian",
//                     image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
//                     route: "/booking/general-cleaning",
//                     isFavorite: false,
//                     type: "Dịch Vụ Phổ Biến"
//                 },
//             ]);
//         }, 1000);

//         // Cập nhật activeSidebarItem khi trang được tải
//         const path = window.location.pathname;
//         if (path === '/ecatalog') {
//             setActiveSidebarItem('Tất cả dịch vụ');
//         } else if (path === '/profile') {
//             setActiveSidebarItem('Hồ sơ của tôi');
//         } else if (path === '/dashboard') {
//             setActiveSidebarItem('Dashboard');
//         } else if (path === '/history') {
//             setActiveSidebarItem('Lịch sử đặt');
//         } else if (path === '/rewards') {
//             setActiveSidebarItem('Lịch sử tích điểm');
//         } else if (path === '/settings') {
//             setActiveSidebarItem('Cài đặt');
//         }
//     }, []);

//     const handleLogoutConfirm = () => {
//         console.log("Logging out from All Services page...");
//     };

//     // Hàm xử lý khi click vào một mục trên Sidebar
//     const handleSidebarItemClick = (item: string) => {
//         setActiveSidebarItem(item);
//         // khi href của thẻ <a> được click.
//     };

//     // Hàm xử lý khi click nút tim (yêu thích)
//     const handleToggleFavorite = (id: number) => {
//         setAllServices(prevServices =>
//             prevServices.map(service =>
//                 service.id === id ? { ...service, isFavorite: !service.isFavorite } : service
//             )
//         );
//         console.log(`Dịch vụ ID ${id} đã được ${allServices.find(s => s.id === id)?.isFavorite ? 'bỏ' : 'thêm vào'} yêu thích.`);
//         // Thêm logic lưu trạng thái yêu thích vào backend/local storage nếu cần
//     };

//     // Lấy tất cả các loại dịch vụ duy nhất
//     const serviceTypes = useMemo(() => {
//         const types = new Set<string>();
//         allServices.forEach(service => types.add(service.type));
//         return ['Tất cả', ...Array.from(types).sort()]; // Thêm "Tất cả" và sắp xếp
//     }, [allServices]);

//     // Lọc dịch vụ dựa trên từ khóa tìm kiếm và loại dịch vụ được chọn
//     const filteredServices = useMemo(() => {
//         let currentServices = allServices;

//         // Lọc theo loại dịch vụ
//         if (selectedType && selectedType !== 'Tất cả') {
//             currentServices = currentServices.filter(service => service.type === selectedType);
//         }

//         // Lọc theo từ khóa tìm kiếm
//         if (searchQuery) {
//             currentServices = currentServices.filter(service =>
//                 service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 service.description.toLowerCase().includes(searchQuery.toLowerCase())
//             );
//         }
//         return currentServices;
//     }, [allServices, searchQuery, selectedType]);

//     return (
//         <div className="flex min-h-screen bg-slate-50">
//             <Sidebar
//                 onLogoutClick={handleLogoutConfirm}
//                 activeItem={activeSidebarItem}
//                 onItemClick={handleSidebarItemClick}
//             />
//             <main className="flex-1 ml-64 p-8">
//                 <Header />
//                 <header className="mb-8 flex justify-between items-center">
//                     <div>
//                         <h1 className="text-3xl font-bold text-slate-800">Tất cả dịch vụ</h1>
//                         <p className="text-slate-500 mt-1">Khám phá và đặt các dịch vụ tiện ích cho gia đình bạn.</p>
//                     </div>
//                 </header>

//                 {/* Ô tìm kiếm */}
//                 <div className="mb-6 relative">
//                     <input
//                         type="text"
//                         placeholder="Tìm kiếm dịch vụ..."
//                         className="w-full p-3 pl-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                     <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
//                 </div>

//                 <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
//                     <h3 className="text-lg font-bold text-slate-800 mb-4">Lọc theo loại dịch vụ</h3>
//                     <div className="flex flex-wrap gap-3">
//                         {serviceTypes.map(type => (
//                             <button
//                                 key={type}
//                                 onClick={() => setSelectedType(type)}
//                                 className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
//                                     selectedType === type || (selectedType === null && type === 'Tất cả')
//                                         ? 'bg-teal-500 text-white shadow-md'
//                                         : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                                 }`}
//                             >
//                                 {type}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl shadow-lg p-8">
//                     <h3 className="text-xl font-bold text-slate-800 mb-6">
//                         {selectedType && selectedType !== 'Tất cả' ? `Dịch vụ: ${selectedType}` : 'Danh sách tất cả dịch vụ'}
//                     </h3>
//                     {filteredServices.length > 0 ? (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                             {filteredServices.map((service) => (
//                                 <div key={service.id} className="relative flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
//                                     <img
//                                         src={service.image_url}
//                                         alt={service.name}
//                                         className="w-full h-36 object-cover rounded-lg mb-4"
//                                         onError={(e) => (e.currentTarget.src = 'https://placehold.co/300x144/E2E8F0/64748B?text=Service')}
//                                     />
//                                     <h4 className="font-semibold text-slate-800 text-lg mb-1">{service.name}</h4>
//                                     <p className="text-sm text-slate-600 flex-grow mb-3">{service.description}</p>
//                                     <div className="flex items-center justify-between mt-auto">
//                                         {/* Nút "Đặt ngay" */}
//                                         <a href={service.route} className="flex-grow mr-2 px-4 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors text-sm text-center">
//                                             Đặt ngay
//                                         </a>
//                                         {/* Nút "Tim" (Yêu thích) */}
//                                         <button
//                                             onClick={() => handleToggleFavorite(service.id)}
//                                             className={`p-2 rounded-full transition-colors ${
//                                                 service.isFavorite ? 'text-red-500 bg-red-100 hover:bg-red-200' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
//                                             }`}
//                                             title={service.isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
//                                         >
//                                             <i className={`${service.isFavorite ? 'fas' : 'far'} fa-heart text-lg`}></i>
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <p className="text-slate-500 text-base">Không có dịch vụ nào để hiển thị.</p>
//                     )}
//                 </div>

//                 {/* Phần bổ sung dưới cùng nếu muốn, hiện tại để trống */}
//                 {/* <div className="mt-8 text-center p-6 bg-slate-100 rounded-xl">
//                     <p className="text-slate-600">Bạn muốn tìm một dịch vụ cụ thể? Hãy sử dụng thanh tìm kiếm hoặc liên hệ hỗ trợ!</p>
//                     <button className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Liên hệ hỗ trợ</button>
//                 </div> */}
//             </main>
//         </div>
//     );
// };

// export default EcatalogPage;