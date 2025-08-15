'use client';

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

// --- SVG Icons (for demonstration without installing a library) ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

interface BadgeProps {
    text: string;
    colorClass: string;
}

interface RankingBadgeProps {
    ranking: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface StatusBadgeProps {
    isActive: boolean;
}

// --- Mock Data (Dữ liệu mẫu) ---
// Dữ liệu này mô phỏng theo cấu trúc DB bạn cung cấp.
// Trong thực tế, bạn sẽ fetch dữ liệu này từ API của mình.
const mockCustomers = [
    {
        customer_id: 1,
        avatar_url: 'https://placehold.co/40x40/E2E8F0/4A5568?text=A',
        name: 'Nguyễn Văn An',
        email: 'an.nguyen@example.com',
        phone: '0901234567',
        ranking: 'gold',
        active: true,
        date_joined: '2023-01-15',
    },
    {
        customer_id: 2,
        avatar_url: 'https://placehold.co/40x40/E2E8F0/4A5568?text=B',
        name: 'Trần Thị Bình',
        email: 'binh.tran@example.com',
        phone: '0912345678',
        ranking: 'platinum',
        active: true,
        date_joined: '2022-11-20',
    },
    {
        customer_id: 3,
        avatar_url: 'https://placehold.co/40x40/E2E8F0/4A5568?text=C',
        name: 'Lê Văn Cường',
        email: 'cuong.le@example.com',
        phone: '0987654321',
        ranking: 'silver',
        active: false,
        date_joined: '2023-03-10',
    },
    {
        customer_id: 4,
        avatar_url: 'https://placehold.co/40x40/E2E8F0/4A5568?text=D',
        name: 'Phạm Thị Dung',
        email: 'dung.pham@example.com',
        phone: '0978123456',
        ranking: 'bronze',
        active: true,
        date_joined: '2023-05-22',
    },
    {
        customer_id: 5,
        avatar_url: null,
        name: 'Võ Thành Long',
        email: 'long.vo@example.com',
        phone: '0333444555',
        ranking: 'silver',
        active: true,
        date_joined: '2023-02-18',
    },
    // Thêm nhiều khách hàng hơn để test phân trang
    ...Array.from({ length: 18 }, (_, i) => ({
        customer_id: i + 6,
        avatar_url: `https://placehold.co/40x40/E2E8F0/4A5568?text=${String.fromCharCode(69 + i)}`,
        name: `Khách hàng ${i + 6}`,
        email: `customer${i + 6}@example.com`,
        phone: `09000000${i + 10}`,
        ranking: ['bronze', 'silver', 'gold', 'platinum'][i % 4],
        active: i % 3 !== 0,
        date_joined: `2023-0${(i % 5) + 1}-0${(i % 9) + 1}`,
    })),
];

// --- Helper Components (Component phụ trợ) ---

// Component hiển thị huy hiệu cho Hạng và Trạng thái
const Badge = ({ text, colorClass }: BadgeProps) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {text}
    </span>
);

const RankingBadge = ({ ranking }: RankingBadgeProps) => {
    const rankStyles = {
        bronze: { text: 'Đồng', color: 'bg-orange-200 text-orange-800' },
        silver: { text: 'Bạc', color: 'bg-gray-200 text-gray-800' },
        gold: { text: 'Vàng', color: 'bg-yellow-200 text-yellow-800' },
        platinum: { text: 'Bạch kim', color: 'bg-cyan-200 text-cyan-800' },
    };
    const style = rankStyles[ranking] || rankStyles.bronze;
    return <Badge text={style.text} colorClass={style.color} />;
};

const StatusBadge = ({ isActive }: StatusBadgeProps) => {
    const statusStyles = {
        true: { text: 'Hoạt động', color: 'bg-green-200 text-green-800' },
        false: { text: 'Vô hiệu', color: 'bg-red-200 text-red-800' },
    };
    const style = statusStyles[String(isActive) as "true" | "false"];
    return <Badge text={style.text} colorClass={style.color} />;
};

// --- Main Component (Component chính) ---

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState(mockCustomers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ ranking: 'all', status: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Lọc và tìm kiếm dữ liệu
    const filteredCustomers = useMemo(() => {
        return customers
            .filter(customer => {
                const matchesRanking = filters.ranking === 'all' || customer.ranking === filters.ranking;
                const matchesStatus = filters.status === 'all' || String(customer.active) === filters.status;
                return matchesRanking && matchesStatus;
            })
            .filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [customers, searchTerm, filters]);

    // Phân trang
    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCustomers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset về trang đầu khi filter
    };

    // Hàm xử lý khi nhấp vào nút phân trang
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 Quản lý Khách hàng</h1>
                <p className="text-gray-600 mb-6">
                    Xem, tìm kiếm, lọc và quản lý thông tin khách hàng.
                </p>

                {/* Phần Filter và Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-1">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, email..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset về trang đầu khi search
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <FilterIcon />
                                <span className="ml-2 font-semibold text-gray-600">Bộ lọc:</span>
                            </div>
                            <div>
                                <select
                                    name="ranking"
                                    value={filters.ranking}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                                >
                                    <option value="all">Tất cả hạng</option>
                                    <option value="bronze">Đồng</option>
                                    <option value="silver">Bạc</option>
                                    <option value="gold">Vàng</option>
                                    <option value="platinum">Bạch kim</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Vô hiệu</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bảng dữ liệu khách hàng */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Khách hàng</th>
                                <th scope="col" className="px-6 py-3">Số điện thoại</th>
                                <th scope="col" className="px-6 py-3">Hạng</th>
                                <th scope="col" className="px-6 py-3">Trạng thái</th>
                                <th scope="col" className="px-6 py-3">Ngày tham gia</th>
                                <th scope="col" className="px-6 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCustomers.map((customer) => (
                                <tr key={customer.customer_id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover mr-4"
                                                src={customer.avatar_url || 'https://placehold.co/40x40/E2E8F0/4A5568?text=?'}
                                                alt={`${customer.name}'s avatar`}
                                                onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = 'https://placehold.co/40x40/E2E8F0/4A5568?text=?'; }}
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-800">{customer.name}</div>
                                                <div className="text-xs text-gray-500">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{customer.phone}</td>
                                    <td className="px-6 py-4">
                                        <RankingBadge ranking={customer.ranking as 'bronze' | 'silver' | 'gold' | 'platinum'} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge isActive={customer.active} />
                                    </td>
                                    <td className="px-6 py-4">{customer.date_joined}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="font-medium text-cyan-600 hover:underline mr-3">Chi tiết</button>
                                        <button className="font-medium text-blue-600 hover:underline mr-3">Sửa</button>
                                        <button className="font-medium text-red-600 hover:underline">
                                            {customer.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paginatedCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">
                                        Không tìm thấy khách hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-sm text-gray-700">
                            Hiển thị <span className="font-semibold">{paginatedCustomers.length}</span> trên tổng số <span className="font-semibold">{filteredCustomers.length}</span> kết quả
                        </span>
                        <div className="inline-flex rounded-md shadow-sm">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            {/* Page numbers could be generated here for more complex pagination */}
                            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
