// app/admin/bookings/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Search,
    User,
    Wrench,
    MapPin,
    Loader,
    Hourglass,
    Phone,
    FileText,
    Tag,
    Hash,
    X,
    CreditCard,
    Shield,
    Landmark,
    Trash2,
    Undo2,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// --- TYPES AND FETCH DATA ---

interface EnrichedBooking {
    // From job table
    job_id: number;
    customer_id: number;
    tasker_id?: number | null;
    service_id: string;
    location?: string | null;
    job_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at?: string | null;
    completed_at?: string | null;
    noted?: string | null;

    customer_name: string;
    customer_avatar?: string | null;
    customer_phone: string;

    tasker_name?: string | null;
    tasker_avatar?: string | null;
    tasker_phone?: string | null;

    service_name: string;

    transaction_id?: string | null;
    amount?: number | null;
    platform_fee?: number | null;
    currency?: 'VND' | 'USD' | null;
    payment_gateway?: 'Momo' | 'Paypal' | 'ZaloPay' | null;
    transaction_status?: string | null;
    paid_at?: string | null;
}

const dataBookings: EnrichedBooking[] = [];
//     {
//         job_id: 101,
//         customer_id: 1,
//         tasker_id: 201,
//         service_id: 'SVC-001',
//         location: '123 Đường ABC, Phường 1, Quận 1, TP.HCM',
//         job_status: 'completed',
//         created_at: '2025-07-28T09:00:00Z',
//         completed_at: '2025-07-28T11:00:00Z',
//         noted: 'Máy lạnh ở phòng khách, hơi kêu to.',
//         customer_name: 'Nguyễn Văn An',
//         customer_avatar: 'https://placehold.co/40x40/E2E8F0/4A5568?text=A',
//         customer_phone: '0901234567',
//         tasker_name: 'Trần Văn Bình',
//         tasker_avatar: 'https://placehold.co/40x40/2DD4BF/1F2937?text=B',
//         tasker_phone: '0987654321',
//         service_name: 'Vệ sinh máy lạnh',
//         transaction_id: 'TRN-101-MOMO',
//         amount: 350000,
//         platform_fee: 35000,
//         currency: 'VND',
//         payment_gateway: 'Momo',
//         transaction_status: 'completed',
//         paid_at: '2025-07-28T09:05:00Z',
//     },
//     {
//         job_id: 102,
//         customer_id: 2,
//         tasker_id: 202,
//         service_id: 'SVC-002',
//         location: '456 Đường XYZ, Phường 5, Quận 3, TP.HCM',
//         job_status: 'in_progress',
//         created_at: '2025-07-29T14:00:00Z',
//         completed_at: null,
//         noted: null,
//         customer_name: 'Lê Thị Cẩm',
//         customer_avatar: 'https://placehold.co/40x40/E2E8F0/4A5568?text=C',
//         customer_phone: '0912345678',
//         tasker_name: 'Phạm Thị Dung',
//         tasker_avatar: 'https://placehold.co/40x40/2DD4BF/1F2937?text=D',
//         tasker_phone: '0978123456',
//         service_name: 'Dọn dẹp nhà cửa (gói cơ bản)',
//         transaction_id: 'TRN-102-BANK',
//         amount: 500000,
//         platform_fee: 50000,
//         currency: 'VND',
//         payment_gateway: 'Bank_Transfer',
//         transaction_status: 'pending',
//         paid_at: null,
//     },
//     {
//         job_id: 103,
//         customer_id: 3,
//         tasker_id: null,
//         service_id: 'SVC-003',
//         location: '789 Đường LMN, Phường 10, Quận 10, TP.HCM',
//         job_status: 'pending',
//         created_at: '2025-07-30T11:30:00Z',
//         completed_at: null,
//         noted: 'Nhớ giặt khô áo vest.',
//         customer_name: 'Hoàng Văn Minh',
//         customer_avatar: 'https://placehold.co/40x40/E2E8F0/4A5568?text=M',
//         customer_phone: '0934567890',
//         tasker_name: null,
//         tasker_avatar: null,
//         tasker_phone: null,
//         service_name: 'Giặt ủi cao cấp',
//         transaction_id: 'TRN-103-PAYPAL',
//         amount: 250000,
//         platform_fee: 25000,
//         currency: 'VND',
//         payment_gateway: 'Paypal',
//         transaction_status: 'completed',
//         paid_at: '2025-07-30T11:32:00Z',
//     },
// ];

// --- HELPER COMPONENTS ---

const StatusBadge = ({
    status,
    type,
}: {
    status: string;
    type: 'job' | 'transaction';
}) => {
    const jobStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    const transactionStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };
    const jobText = {
        pending: 'Chờ xác nhận',
        in_progress: 'Đang thực hiện',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
    };
    const transactionText = {
        pending: 'Chờ thanh toán',
        completed: 'Đã thanh toán',
        failed: 'Thất bại',
    };

    const styles = type === 'job' ? jobStyles : transactionStyles;
    const text = type === 'job' ? jobText : transactionText;

    return (
        <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                styles[status] || 'bg-gray-100 text-gray-800'
            }`}
        >
            {text[status] || status}
        </span>
    );
};

const InfoCard = ({ title, person }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-500 mb-2">{title}</h4>
        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
            <img
                src={
                    person.avatar_url ||
                    'https://placehold.co/48x48/E2E8F0/4A5568?text=?'
                }
                alt={person.name}
                className="w-12 h-12 rounded-full object-cover"
            />
            <div>
                <p className="font-bold text-gray-800">{person.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Phone size={14} />
                    <span>{person.phone}</span>
                </div>
            </div>
        </div>
    </div>
);

const DetailItem = ({ icon, label, value, children }) => (
    <div className="flex items-start gap-3 text-sm">
        <div className="text-gray-500 mt-0.5">{icon}</div>
        <div>
            <p className="font-semibold text-gray-700">{label}:</p>
            <div className="text-gray-600">{value || children}</div>
        </div>
    </div>
);

// --- BOOKING DETAIL MODAL ---
const BookingDetailModal = ({
    booking,
    onClose,
    onCancelBooking,
    onResetBooking,
}: {
    booking: EnrichedBooking;
    onClose: () => void;
    onCancelBooking: (jobId: number) => void;
    onResetBooking: (jobId: number) => void;
}) => {
    const totalAmount = (booking.amount || 0) + (booking.platform_fee || 0);

    const handleCancel = () => {
        if (
            window.confirm(
                `Bạn có chắc chắn muốn HỦY lịch đặt #${booking.job_id} không? Hành động này không thể hoàn tác.`
            )
        ) {
            onCancelBooking(booking.job_id);
        }
    };

    const handleReset = () => {
        if (
            window.confirm(
                `Bạn có chắc chắn muốn ĐƯA lịch đặt #${booking.job_id} về trạng thái chờ không? Đối tác hiện tại sẽ bị gỡ.`
            )
        ) {
            onResetBooking(booking.job_id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Hash size={20} className="text-gray-500" />
                        <h2 className="text-xl font-bold text-gray-800">
                            Chi tiết Đặt lịch #{booking.job_id}
                        </h2>
                        <StatusBadge status={booking.job_status} type="job" />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        <X size={20} />
                    </Button>
                </header>

                <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Job & Transaction */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-bold text-lg mb-3 text-gray-800">
                                Thông tin công việc
                            </h3>
                            <div className="space-y-3">
                                <DetailItem
                                    icon={<Wrench size={16} />}
                                    label="Dịch vụ"
                                    value={booking.service_name}
                                />
                                <DetailItem
                                    icon={<MapPin size={16} />}
                                    label="Địa điểm"
                                    value={booking.location}
                                />
                                {booking.noted && (
                                    <DetailItem
                                        icon={<FileText size={16} />}
                                        label="Ghi chú của khách"
                                        value={
                                            <p className="italic">
                                                "{booking.noted}"
                                            </p>
                                        }
                                    />
                                )}
                                <DetailItem
                                    icon={<Calendar size={16} />}
                                    label="Thời gian"
                                >
                                    <p>
                                        Tạo lúc:{' '}
                                        {booking.created_at
                                            ? new Date(
                                                  booking.created_at
                                              ).toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </p>
                                    {booking.completed_at && (
                                        <p>
                                            Hoàn thành:{' '}
                                            {new Date(
                                                booking.completed_at
                                            ).toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                </DetailItem>
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-bold text-lg mb-3 text-gray-800">
                                Thông tin giao dịch
                            </h3>
                            {booking.transaction_id ? (
                                <div className="space-y-3">
                                    <DetailItem
                                        icon={<Hash size={16} />}
                                        label="Mã giao dịch"
                                        value={booking.transaction_id}
                                    />
                                    <DetailItem
                                        icon={<CreditCard size={16} />}
                                        label="Cổng thanh toán"
                                        value={booking.payment_gateway}
                                    />
                                    <DetailItem
                                        icon={<Tag size={16} />}
                                        label="Chi phí"
                                    >
                                        <p>
                                            Phí dịch vụ:{' '}
                                            {(
                                                booking.amount || 0
                                            ).toLocaleString('vi-VN')}{' '}
                                            {booking.currency}
                                        </p>
                                        <p>
                                            Phí nền tảng:{' '}
                                            {(
                                                booking.platform_fee || 0
                                            ).toLocaleString('vi-VN')}{' '}
                                            {booking.currency}
                                        </p>
                                        <p className="font-bold">
                                            Tổng cộng:{' '}
                                            {totalAmount.toLocaleString(
                                                'vi-VN'
                                            )}{' '}
                                            {booking.currency}
                                        </p>
                                    </DetailItem>
                                    <DetailItem
                                        icon={<Shield size={16} />}
                                        label="Trạng thái thanh toán"
                                    >
                                        <StatusBadge
                                            status={
                                                booking.transaction_status ||
                                                'N/A'
                                            }
                                            type="transaction"
                                        />
                                        {booking.paid_at && (
                                            <span className="text-xs ml-2 text-gray-500">
                                                (Lúc:{' '}
                                                {new Date(
                                                    booking.paid_at
                                                ).toLocaleString('vi-VN')}
                                                )
                                            </span>
                                        )}
                                    </DetailItem>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">
                                    Chưa có thông tin giao dịch.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: People */}
                    <div className="lg:col-span-1 space-y-6">
                        <InfoCard
                            title="Khách hàng"
                            person={{
                                name: booking.customer_name,
                                avatar_url: booking.customer_avatar,
                                phone: booking.customer_phone,
                            }}
                        />
                        {booking.tasker_name ? (
                            <InfoCard
                                title="Đối tác thực hiện"
                                person={{
                                    name: booking.tasker_name,
                                    avatar_url: booking.tasker_avatar,
                                    phone: booking.tasker_phone,
                                }}
                            />
                        ) : (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                                    Đối tác thực hiện
                                </h4>
                                <div className="flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-lg h-full text-gray-500 italic">
                                    Chưa có đối tác nhận lịch
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <div className="flex gap-2">
                        {booking.job_status === 'in_progress' && (
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="flex items-center gap-2"
                            >
                                <Undo2 size={16} />
                                Đưa về trạng thái chờ
                            </Button>
                        )}
                        {(booking.job_status === 'pending' ||
                            booking.job_status === 'in_progress') && (
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                className="flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Hủy lịch đặt
                            </Button>
                        )}
                    </div>
                    <Button onClick={onClose}>Đóng</Button>
                </footer>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const AdminBookingManagementPage = () => {
    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [activeTab, setActiveTab] = useState<
        'pending' | 'in_progress' | 'completed' | 'cancelled'
    >('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBooking, setSelectedBooking] =
        useState<EnrichedBooking | null>(null);
    const itemsPerPage = 8;

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/jobs', {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: EnrichedBooking[] = await res.json();
                setBookings(data);
            } catch (err) {
                console.error('Failed to load admin bookings:', err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleCancelBooking = (jobId: number) => {
        setBookings((prev) =>
            prev.map((b) =>
                b.job_id === jobId ? { ...b, job_status: 'cancelled' } : b
            )
        );
        setSelectedBooking(null); // Close modal after action
    };

    const handleResetBooking = (jobId: number) => {
        setBookings((prev) =>
            prev.map((b) =>
                b.job_id === jobId
                    ? {
                          ...b,
                          job_status: 'pending',
                          tasker_id: null,
                          tasker_name: null,
                          tasker_avatar: null,
                          tasker_phone: null,
                      }
                    : b
            )
        );
        setSelectedBooking(null); // Close modal after action
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const matchesStatus = booking.job_status === activeTab;
            const matchesSearch =
                booking.customer_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                booking.service_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (booking.tasker_name &&
                    booking.tasker_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) ||
                booking.job_id.toString().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }, [bookings, activeTab, searchTerm]);

    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredBookings, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <AdminLayout>
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onCancelBooking={handleCancelBooking}
                    onResetBooking={handleResetBooking}
                />
            )}
            <div className="p-6 bg-gray-50 min-h-screen">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Quản lý Đặt lịch
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Theo dõi và quản lý tất cả các lịch đặt dịch vụ.
                    </p>
                </header>

                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Tìm theo ID, khách hàng, đối tác, dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-base"
                        />
                    </div>
                </div>

                <div className="mb-6 border-b border-gray-200">
                    <nav
                        className="flex flex-wrap gap-x-6 gap-y-2"
                        aria-label="Tabs"
                    >
                        <button
                            onClick={() => {
                                setActiveTab('pending');
                                setCurrentPage(1);
                            }}
                            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                activeTab === 'pending'
                                    ? 'border-cyan-500 text-cyan-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Hourglass size={16} /> Chờ xác nhận
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('in_progress');
                                setCurrentPage(1);
                            }}
                            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                activeTab === 'in_progress'
                                    ? 'border-cyan-500 text-cyan-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Loader size={16} /> Đang thực hiện
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('completed');
                                setCurrentPage(1);
                            }}
                            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                activeTab === 'completed'
                                    ? 'border-cyan-500 text-cyan-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <CheckCircle size={16} /> Đã hoàn thành
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('cancelled');
                                setCurrentPage(1);
                            }}
                            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                activeTab === 'cancelled'
                                    ? 'border-cyan-500 text-cyan-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <XCircle size={16} /> Đã hủy
                        </button>
                    </nav>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    ID / Dịch vụ
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Khách hàng
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Đối tác
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Tổng tiền
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Ngày tạo
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Trạng thái
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center"
                                >
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-10"
                                    >
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                                        <p className="mt-2 text-gray-500">
                                            Đang tải dữ liệu...
                                        </p>
                                    </td>
                                </tr>
                            ) : paginatedBookings.length > 0 ? (
                                paginatedBookings.map((booking) => (
                                    <tr
                                        key={booking.job_id}
                                        className="bg-white border-b hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800">
                                                #{booking.job_id}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {booking.service_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.customer_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.tasker_name || (
                                                <span className="text-gray-400 italic">
                                                    Chưa có
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">
                                            {(
                                                booking.amount || 0
                                            ).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.created_at
                                                ? new Date(
                                                      booking.created_at
                                                  ).toLocaleDateString('vi-VN')
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={booking.job_status}
                                                type="job"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedBooking(booking)
                                                }
                                            >
                                                Chi tiết
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-10"
                                    >
                                        <Calendar
                                            size={40}
                                            className="mx-auto text-gray-300"
                                        />
                                        <p className="mt-2 text-gray-500">
                                            Không có lịch đặt nào trong mục này.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && !isLoading && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                        <span className="text-sm text-gray-700">
                            Hiển thị{' '}
                            <span className="font-semibold">
                                {paginatedBookings.length}
                            </span>{' '}
                            trên tổng số{' '}
                            <span className="font-semibold">
                                {filteredBookings.length}
                            </span>{' '}
                            kết quả
                        </span>
                        <div className="inline-flex rounded-md shadow-sm">
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                variant="outline"
                                className="rounded-r-none"
                            >
                                Trước
                            </Button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                variant="outline"
                                className="rounded-l-none"
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminBookingManagementPage;
