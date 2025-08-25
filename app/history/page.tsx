// app/history/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Clock,
    MapPin,
    Package,
    Star,
    Tag,
    User,
    Hash,
    MessageSquare,
    XCircle,
    AlertTriangle,
    CheckCircle,
    LogOut,
    UserCircle
} from 'lucide-react';
// import DashboardHeader from '@/components/common/DashboardHeader'; // Bỏ qua import thật
// import { useUser } from '@/hooks/useUser'; // Bỏ qua import thật
import { Button } from '@/components/ui/button';
// import { logDev } from '@/lib/utils'; // Bỏ qua import thật
// import fetchWithAuth from '@/lib/apiClient'; // Bỏ qua import thật

// --- MOCK IMPLEMENTATIONS FOR MISSING COMPONENTS ---

const useUser = () => ({
    user: { name: 'Customer Demo', roles: ['customer'], id: 'cust123' },
    loading: false,
    logoutUser: () => console.log("User logged out"),
});

const DashboardHeader: React.FC<{ user: any, onLogout: () => void, activeRole: string, onRoleChange: (role: string) => void, showRoleSwitcher: boolean }> = ({ user, onLogout }) => (
    <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="text-2xl font-bold text-teal-600"><a href="/">cleanNow</a></div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">Chào, {user?.name || 'Guest'}!</span>
                    <button onClick={onLogout} className="flex items-center gap-2 text-slate-600 hover:text-teal-600"><LogOut size={18} /><span>Đăng xuất</span></button>
                    <UserCircle size={28} className="text-slate-500" />
                </div>
            </div>
        </div>
    </header>
);

const fetchWithAuth = async (url: string, options?: any) => new Response(JSON.stringify([]), { status: 200 });
const logDev = console.log;

// --- DỮ LIỆU MẪU ---
const mockJobs = [
    {
        job_id: 101,
        service: { name: 'Giúp Việc Ca Lẻ' },
        status: 'in_progress',
        tasker_completed: false, // Tasker chưa hoàn thành
        created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        location: '123 Đường ABC, Phường 1, Quận 1, TP. HCM',
        price: 250000,
        currency: 'VND',
        tasker: { name: 'Nguyễn Văn A', avatar_url: 'https://placehold.co/40x40/E2E8F0/475569?text=A' },
        completed_at: null,
    },
    {
        job_id: 102,
        service: { name: 'Vệ Sinh Điều Hòa' },
        status: 'in_progress',
        tasker_completed: true, // Tasker ĐÃ hoàn thành, khách có thể xác nhận
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        location: '456 Đường XYZ, Phường 2, Quận 3, TP. HCM',
        price: 300000,
        currency: 'VND',
        tasker: { name: 'Trần Thị B', avatar_url: 'https://placehold.co/40x40/E2E8F0/475569?text=B' },
        completed_at: null,
    },
    {
        job_id: 103,
        service: { name: 'Vệ Sinh Công Nghiệp' },
        status: 'pending',
        tasker_completed: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: '789 Đường LMN, Phường 3, Quận 5, TP. HCM',
        price: 1500000,
        currency: 'VND',
        tasker: null,
        completed_at: null,
    },
    {
        job_id: 201,
        service: { name: 'Giúp Việc Định Kỳ' },
        status: 'completed',
        tasker_completed: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: '101 Đường DEF, Phường 4, Quận 7, TP. HCM',
        price: 1200000,
        currency: 'VND',
        tasker: { name: 'Lê Văn C', avatar_url: 'https://placehold.co/40x40/E2E8F0/475569?text=C' },
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        review: { rating_tasker: 5 }
    },
];


// --- COMPONENT MODAL HỦY DỊCH VỤ (Giữ nguyên) ---
function CancellationModal({ isOpen, onClose, job, onConfirm }: { isOpen: boolean; onClose: () => void; job: any; onConfirm: (jobId: number, reason: string) => void; }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <h3 className="text-lg font-bold text-slate-800 mt-4">Xác nhận hủy công việc?</h3>
                    <p className="text-sm text-slate-500 mt-2">Bạn có chắc chắn muốn hủy công việc này không? Vui lòng xem xét chính sách hủy của chúng tôi.</p>
                </div>
                <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>Ở lại</Button>
                    <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => onConfirm(job.job_id, 'Customer cancelled')}>Đồng ý hủy</Button>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT PHỤ ---
const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: { [key: string]: string } = { pending: 'bg-yellow-100 text-yellow-800', in_progress: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800', };
    const statusText: { [key: string]: string } = { pending: 'Chờ nhận', in_progress: 'Đang thực hiện', completed: 'Đã hoàn thành', cancelled: 'Đã hủy', };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>{statusText[status] || 'Không xác định'}</span>;
};

const JobCard: React.FC<{ job: any; onCancel: (job: any) => void; onConfirmCompletion: (jobId: number) => void; }> = ({ job, onCancel, onConfirmCompletion }) => {
    const { tasker, service, status } = job;

    const renderActions = () => {
        switch (status) {
            case 'completed':
                return (
                    <>
                        {job.review ? (
                            <div className="flex items-center gap-1 text-sm text-yellow-500 font-semibold"><Star size={16} className="fill-current" /><span>Đã đánh giá ({job.review.rating_tasker}/5)</span></div>
                        ) : (
                            <Button variant="outline" className="flex-1"><Star size={16} /> Viết đánh giá</Button>
                        )}
                    </>
                );
            case 'in_progress':
                return (
                    <div className="w-full flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="flex-1"><MessageSquare size={16} /> Nhắn tin</Button>
                        <Button
                            onClick={() => onConfirmCompletion(job.job_id)}
                            disabled={!job.tasker_completed}
                            className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-500"
                        >
                            <CheckCircle size={16} />
                            <span>Xác nhận hoàn thành</span>
                        </Button>
                    </div>
                );
            case 'pending':
                 return (
                    <div className="w-full flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="flex-1" disabled><MessageSquare size={16} /> Nhắn tin</Button>
                        <Button onClick={() => onCancel(job)} variant="destructive" className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"><XCircle size={16} /> Hủy đơn</Button>
                    </div>
                 );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-shadow hover:shadow-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 text-md">{service.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"><Hash size={14} /> Mã đơn: #{job.job_id}</p>
                </div>
                <StatusBadge status={status} />
            </div>
            <div className="p-4 space-y-4">
                {tasker ? (
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                        <img src={tasker.avatar_url} alt={tasker.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/E2E8F0/475569?text=U'; }}/>
                        <div>
                            <p className="text-sm text-slate-500">Đối tác thực hiện</p>
                            <p className="font-semibold text-slate-700">{tasker.name}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-yellow-50 text-yellow-700 p-3 rounded-lg">
                        <User size={20} />
                        <div><p className="font-semibold">Đang tìm đối tác</p><p className="text-sm">Hệ thống sẽ thông báo ngay khi có người nhận việc.</p></div>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-600"><Calendar size={16} className="mt-0.5 shrink-0" /><span>Ngày đặt: {new Date(job.created_at).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex items-start gap-2 text-slate-600"><Clock size={16} className="mt-0.5 shrink-0" /><span>Hoàn thành: {job.completed_at ? new Date(job.completed_at).toLocaleDateString('vi-VN') : 'Chưa có'}</span></div>
                    <div className="flex items-start gap-2 text-slate-600 sm:col-span-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{job.location}</span></div>
                    <div className="flex items-start gap-2 text-slate-600"><Tag size={16} className="mt-0.5 shrink-0" /><span>{job.currency === 'USD' ? `$${job.price}` : `${job.price.toLocaleString('vi-VN')}đ`}</span></div>
                </div>
                 {job.status === 'in_progress' && !job.tasker_completed && (
                    <div className="text-xs text-center text-slate-500 bg-slate-100 p-2 rounded-md">
                        Vui lòng đợi Đối tác hoàn thành công việc để xác nhận.
                    </div>
                )}
            </div>
            <div className="p-4 bg-slate-50 flex flex-col sm:flex-row-reverse items-center gap-3">{renderActions()}</div>
        </div>
    );
};

const BookingHistoryPage = () => {
    const { user, loading, logoutUser } = useUser();
    const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
    const [jobs, setJobs] = useState<any[]>([]);
    const router = useRouter();
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedJobForCancel, setSelectedJobForCancel] = useState<any>(null);

    useEffect(() => {
        // Thay vì gọi API, sử dụng dữ liệu mẫu
        setJobs(mockJobs);
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600"></div></div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center"><p className="text-slate-600 mb-4">Vui lòng đăng nhập để xem lịch sử đặt hàng</p><a href="/auth/login" className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">Đăng nhập</a></div></div>;

    const handleOpenCancelModal = (job: any) => { setSelectedJobForCancel(job); setCancelModalOpen(true); };
    const handleCloseCancelModal = () => { setCancelModalOpen(false); setSelectedJobForCancel(null); };
    const handleConfirmCancellation = (jobId: number, reason: string) => {
        logDev(`Đã xác nhận hủy job ID: ${jobId} với lý do: "${reason}"`);
        setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: 'cancelled' } : j));
        handleCloseCancelModal();
    };

    const handleConfirmCompletion = (jobId: number) => {
        logDev(`Khách hàng đã xác nhận hoàn thành job ID: ${jobId}`);
        setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: 'completed', completed_at: new Date().toISOString() } : j));
    };

    const ongoingJobs = jobs.filter(job => ['in_progress', 'pending'].includes(job.status));
    const completedJobs = jobs.filter(job => ['completed', 'cancelled'].includes(job.status));

    const renderJobList = (jobList: any[]) => {
        if (jobList.length === 0) {
            return (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Package size={48} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-700">Không có đơn đặt nào</h3>
                    <p className="mt-1 text-slate-500">Các dịch vụ bạn đặt sẽ xuất hiện ở đây.</p>
                    <Button onClick={() => router.push('/')} className="mt-4 bg-teal-500 hover:bg-teal-600">Đặt dịch vụ ngay</Button>
                </div>
            );
        }
        return (
            <div className="space-y-6">
                {jobList.map(job => <JobCard key={job.job_id} job={job} onCancel={handleOpenCancelModal} onConfirmCompletion={handleConfirmCompletion} />)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader user={user} onLogout={logoutUser} activeRole={user.roles[0]} onRoleChange={() => {}} showRoleSwitcher={user.roles.length > 1} />
            <main className="container mx-auto p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Lịch sử đặt dịch vụ</h1>
                    <p className="text-slate-500 mt-1">Theo dõi các dịch vụ bạn đã và đang sử dụng.</p>
                </header>
                <div className="mb-8 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('ongoing')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ongoing' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Đang thực hiện</button>
                        <button onClick={() => setActiveTab('completed')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'completed' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Đã hoàn thành</button>
                    </nav>
                </div>
                <div>
                    {activeTab === 'ongoing' && renderJobList(ongoingJobs)}
                    {activeTab === 'completed' && renderJobList(completedJobs)}
                </div>
            </main>
            <CancellationModal isOpen={isCancelModalOpen} onClose={handleCloseCancelModal} job={selectedJobForCancel} onConfirm={handleConfirmCancellation} />
        </div>
    );
};

export default BookingHistoryPage;
