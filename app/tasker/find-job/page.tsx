// Trang quản lý công việc cho Tasker
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CheckCircle2, Search, Briefcase, SlidersHorizontal, Shield, FileText, Check, Hourglass, History, LogOut, UserCircle } from 'lucide-react';
// import fetchWithAuth from '@/lib/apiClient'; // Bỏ qua import thật
// import DashboardHeader from '@/components/common/DashboardHeader'; // Bỏ qua import thật
// import { useUser } from '@/hooks/useUser'; // Bỏ qua import thật
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// --- MOCK IMPLEMENTATIONS FOR MISSING COMPONENTS ---

// Giả lập hook useUser để cung cấp dữ liệu người dùng
const useUser = () => {
    const [user, setUser] = useState<any>({
        name: 'Tasker Demo',
        roles: ['tasker', 'customer'],
        avatar: null,
    });
    const [loading, setLoading] = useState(false);

    const logoutUser = () => {
        console.log("User logged out");
        setUser(null);
    };

    return { user, loading, logoutUser };
};

// Giả lập component DashboardHeader
const DashboardHeader: React.FC<{ user: any, onLogout: () => void, activeRole: string, onRoleChange: (role: string) => void, showRoleSwitcher: boolean }> = ({ user, onLogout }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="text-2xl font-bold text-teal-600">
                        <a href="/">cleanNow</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-700">Chào, {user?.name || 'Guest'}!</span>
                        <button onClick={onLogout} className="flex items-center gap-2 text-slate-600 hover:text-teal-600">
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                        <UserCircle size={28} className="text-slate-500" />
                    </div>
                </div>
            </div>
        </header>
    );
};

// Giả lập hàm fetchWithAuth
const fetchWithAuth = async (url: string, options: any) => {
    console.log(`Fetching ${url} with options:`, options);
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
};


// --- TYPES AND MOCK DATA ---

type JobStatus = 'new' | 'ongoing' | 'completed';

type TaskerJob = {
    job_id: number;
    service: { name: string; service_id: string };
    location: string;
    created_at: string;
    noted?: string;
    estimated_earnings: number;
    distance?: number;
    status: JobStatus;
    completed_at?: string;
};

const mockServices = [
    { id: '1', name: 'Giúp Việc Ca Lẻ' },
    { id: '2', name: 'Giúp Việc Định Kỳ' },
    { id: '4', name: 'Vệ Sinh Sofa, Đệm, Rèm, Thảm' },
    { id: '5', name: 'Vệ Sinh Điều Hòa' },
    { id: '8', name: 'Vệ Sinh Công Nghiệp' },
];

const mockAllJobs: TaskerJob[] = [
    { job_id: 1, service: { name: 'Giúp Việc Định Kỳ', service_id: '2' }, location: '11, Cầu Rạch Ông, Tân Hưng, Quận 7, Hồ Chí Minh', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), estimated_earnings: 350000, status: 'new', distance: 2.5 },
    { job_id: 2, service: { name: 'Vệ Sinh Điều Hòa', service_id: '5' }, location: '25, Nguyễn Hữu Thọ, Tân Hưng, Quận 7, Hồ Chí Minh', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), estimated_earnings: 250000, status: 'new', distance: 3.1, noted: "Vui lòng đến đúng giờ, điều hòa hãng Daikin." },
    { job_id: 3, service: { name: 'Vệ Sinh Công Nghiệp', service_id: '8' }, location: 'Tòa nhà Bitexco, 2 Hải Triều, Bến Nghé, Quận 1, Hồ Chí Minh', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), estimated_earnings: 1500000, status: 'ongoing', distance: 8.2 },
    { job_id: 4, service: { name: 'Giúp Việc Ca Lẻ', service_id: '1' }, location: 'Chung cư Sunrise City, 27 Nguyễn Hữu Thọ, Tân Hưng, Quận 7, Hồ Chí Minh', created_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), estimated_earnings: 200000, status: 'ongoing', distance: 3.5, noted: "Nhà có nuôi một chú chó Poodle nhỏ." },
    { job_id: 5, service: { name: 'Vệ Sinh Sofa, Đệm, Rèm, Thảm', service_id: '4' }, location: '45, đường số 10, KDC Him Lam, Quận 7, Hồ Chí Minh', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), estimated_earnings: 650000, status: 'completed', completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

// --- HELPER FUNCTIONS ---

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) + " giây trước";
};

// --- JOB CARD COMPONENTS ---

const NewJobCard: React.FC<{ job: TaskerJob; onAccept: (id: number) => void; onView: (id: number) => void; accepting?: boolean }>
= ({ job, onAccept, onView, accepting }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md">
        <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg">{job.service.name}</h3>
                <div className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{job.estimated_earnings.toLocaleString('en-US')}đ</div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{job.location} (~{job.distance} km)</span></div>
                <div className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0" /><span>Đăng {timeSince(job.created_at)}</span></div>
                {job.noted && <p className="text-slate-500 pt-2 italic border-t border-slate-100 mt-3">"{job.noted}"</p>}
            </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onView(job.job_id)}>Xem chi tiết</Button>
            <Button className="flex-1 bg-teal-500 hover:bg-teal-600" disabled={accepting} onClick={() => onAccept(job.job_id)}>{accepting ? 'Đang nhận...' : 'Nhận việc'}</Button>
        </div>
    </div>
);

const OngoingJobCard: React.FC<{ job: TaskerJob; onComplete: (id: number) => void; onView: (id: number) => void; completing?: boolean }>
= ({ job, onComplete, onView, completing }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md">
        <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg">{job.service.name}</h3>
                <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{job.estimated_earnings.toLocaleString('en-US')}đ</div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{job.location}</span></div>
                <div className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0" /><span>Đã nhận {timeSince(job.created_at)}</span></div>
                {job.noted && <p className="text-slate-500 pt-2 italic border-t border-slate-100 mt-3">"{job.noted}"</p>}
            </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onView(job.job_id)}>Xem chi tiết</Button>
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600" disabled={completing} onClick={() => onComplete(job.job_id)}>{completing ? 'Đang xử lý...' : 'Hoàn thành công việc'}</Button>
        </div>
    </div>
);

const CompletedJobCard: React.FC<{ job: TaskerJob; onView: (id: number) => void; }>
= ({ job, onView }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md opacity-80">
        <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-600 text-lg">{job.service.name}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><CheckCircle2 size={14} /> ĐÃ HOÀN THÀNH</span>
            </div>
            <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{job.location}</span></div>
                <div className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0" /><span>Hoàn thành {timeSince(job.completed_at!)}</span></div>
                <div className="text-sm font-semibold text-slate-700 pt-2 border-t border-slate-100 mt-3">Thu nhập: {job.estimated_earnings.toLocaleString('en-US')}đ</div>
            </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onView(job.job_id)}>Xem lại chi tiết</Button>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---
const FindJobsPage = () => {
    const { user, loading, logoutUser } = useUser();
    const [jobs, setJobs] = useState<TaskerJob[]>([]);
    const [activeTab, setActiveTab] = useState<JobStatus>('new');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterService, setFilterService] = useState('all');
    const [city, setCity] = useState<'hcm' | 'hanoi' | 'danang'>('hcm');
    const [actionState, setActionState] = useState<{ type: 'accepting' | 'completing', id: number | null }>({ type: 'accepting', id: null });
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [jobDetail, setJobDetail] = useState<any>(null);
    const [policyOpen, setPolicyOpen] = useState(false);
    const [policyLoading, setPolicyLoading] = useState(false);
    const [policy, setPolicy] = useState<any>(null);

    useEffect(() => {
        setJobs(mockAllJobs);
    }, []);

    const acceptJob = async (jobId: number) => {
        setActionState({ type: 'accepting', id: jobId });
        await new Promise(resolve => setTimeout(resolve, 1000));
        setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: 'ongoing' } : j));
        setActionState({ type: 'accepting', id: null });
    };

    const completeJob = async (jobId: number) => {
        setActionState({ type: 'completing', id: jobId });
        await new Promise(resolve => setTimeout(resolve, 1000));
        setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: 'completed', completed_at: new Date().toISOString() } : j));
        setActionState({ type: 'completing', id: null });
    };

    const viewDetail = async (jobId: number) => {
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailError(null);
        const detail = jobs.find(j => j.job_id === jobId);
        if (detail) setJobDetail(detail);
        else setDetailError('Không tìm thấy công việc.');
        setDetailLoading(false);
    };

    const openPolicy = async () => {
        setPolicyOpen(true);
        if (policy) return;
        setPolicyLoading(true);
        await new Promise(r => setTimeout(r, 500));
        setPolicy({ title: 'Quy chế nhận và hủy việc', rules: ['Khi bấm "Nhận việc", đối tác xác nhận đã đọc kỹ mô tả công việc.', 'Đối tác không được hủy sau khi đã nhận việc.', 'Nếu có sự cố, vui lòng liên hệ tổng đài hỗ trợ.'] });
        setPolicyLoading(false);
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesStatus = job.status === activeTab;
            const matchesSearch = job.location.toLowerCase().includes(searchTerm.toLowerCase()) || job.service.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesService = filterService === 'all' || job.service.service_id === filterService;
            return matchesStatus && matchesSearch && matchesService;
        });
    }, [jobs, searchTerm, filterService, activeTab]);

    const renderJobList = () => {
        if (filteredJobs.length === 0) {
            const messages = {
                new: { title: "Không có công việc mới nào", desc: "Hiện tại không có công việc nào phù hợp với lựa chọn của bạn." },
                ongoing: { title: "Không có công việc đang thực hiện", desc: "Bạn chưa nhận công việc nào. Hãy chuyển sang tab 'Công việc mới' nhé." },
                completed: { title: "Chưa có công việc hoàn thành", desc: "Lịch sử công việc đã hoàn thành của bạn sẽ được hiển thị ở đây." }
            };
            const msg = messages[activeTab];
            return <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100"><Briefcase size={48} className="mx-auto text-slate-300" /><h3 className="mt-4 text-lg font-semibold text-slate-700">{msg.title}</h3><p className="mt-1 text-slate-500">{msg.desc}</p></div>;
        }
        return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{filteredJobs.map(job => { switch (job.status) { case 'new': return <NewJobCard key={job.job_id} job={job} onAccept={acceptJob} onView={viewDetail} accepting={actionState.type === 'accepting' && actionState.id === job.job_id} />; case 'ongoing': return <OngoingJobCard key={job.job_id} job={job} onComplete={completeJob} onView={viewDetail} completing={actionState.type === 'completing' && actionState.id === job.job_id} />; case 'completed': return <CompletedJobCard key={job.job_id} job={job} onView={viewDetail} />; default: return null; }})}</div>;
    };
    
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600"></div></div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center"><h2 className="text-xl font-semibold text-slate-700">Bạn cần đăng nhập để truy cập trang này</h2><p className="text-slate-500 mt-1">Vui lòng đăng nhập bằng tài khoản Tasker.</p><a href="/auth/login" className="inline-block mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">Đăng nhập</a></div></div>;
    const isTasker = Array.isArray(user.roles) && user.roles.includes('tasker');
    if (!isTasker) return <div className="min-h-screen bg-slate-50 font-sans"><DashboardHeader user={user} onLogout={logoutUser} activeRole={user.roles[0]} onRoleChange={() => { }} showRoleSwitcher={user.roles.length > 1} /><main className="container mx-auto p-6 lg:p-8"><div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100"><h2 className="text-xl font-semibold text-slate-700">Bạn không có quyền truy cập trang này</h2><p className="text-slate-500 mt-1">Chỉ Tasker mới có thể xem và nhận việc.</p><div className="mt-4 flex items-center justify-center gap-3"><a href="/dashboard" className="inline-block bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200">Về Dashboard</a><a href="/" className="inline-block bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">Trang chủ</a></div></div></main></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader user={user} onLogout={logoutUser} activeRole="tasker" onRoleChange={() => { }} showRoleSwitcher={user.roles.length > 1} />
            <main className="container mx-auto p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý công việc</h1>
                    <p className="text-slate-500 mt-1">Xem, nhận và hoàn thành các công việc của bạn.</p>
                </header>
                <div className="mb-8 border-b border-slate-200">
                    <nav className="flex -mb-px space-x-6">
                        <button onClick={() => setActiveTab('new')} className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'new' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}><Briefcase size={16} /> Công việc mới</button>
                        <button onClick={() => setActiveTab('ongoing')} className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'ongoing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}><Hourglass size={16} /> Đang thực hiện</button>
                        <button onClick={() => setActiveTab('completed')} className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}><History size={16} /> Đã hoàn thành</button>
                    </nav>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><Input placeholder="Tìm theo tên việc, địa chỉ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" /></div>
                        <select value={city} onChange={(e) => setCity(e.target.value as any)} className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="hcm">TP. Hồ Chí Minh</option><option value="hanoi">Hà Nội</option><option value="danang">Đà Nẵng</option></select>
                        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="all">Tất cả dịch vụ</option>{mockServices.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
                        <Button variant="outline" className="flex items-center gap-2"><SlidersHorizontal size={16} /><span>Bộ lọc</span></Button>
                        <Button onClick={openPolicy} variant="outline" className="flex items-center gap-2 md:ml-auto"><Shield size={16} /><span>Quy định</span></Button>
                    </div>
                </div>
                <div>{renderJobList()}</div>
            </main>
            {detailOpen && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailOpen(false)}><div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-2 mb-4"><FileText size={20} className="text-teal-600" /><h3 className="text-lg font-bold text-slate-800">Chi tiết công việc</h3></div>{detailLoading ? <p className="text-slate-500">Đang tải…</p> : detailError ? <p className="text-red-600">{detailError}</p> : jobDetail ? <div className="space-y-3 text-sm text-slate-700"><div className="font-semibold text-slate-800">{jobDetail.service?.name || 'Dịch vụ'}</div><div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5" /><span>{jobDetail.location}</span></div><div className="flex items-start gap-2"><Clock size={16} className="mt-0.5" /><span>Đăng lúc {new Date(jobDetail.created_at).toLocaleString('vi-VN')}</span></div>{jobDetail.noted && <p className="italic text-slate-600">"{jobDetail.noted}"</p>}<div className="font-semibold text-teal-700">Thu nhập ước tính: {Number(jobDetail.estimated_earnings).toLocaleString('en-US')}đ</div></div> : <p className="text-slate-500">Không có dữ liệu.</p>}<div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button></div></div></div>}
            {policyOpen && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPolicyOpen(false)}><div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-2 mb-4"><Shield size={20} className="text-teal-600" /><h3 className="text-lg font-bold text-slate-800">{policy?.title || 'Quy định'}</h3></div>{policyLoading ? <p className="text-slate-500">Đang tải…</p> : <div className="text-sm text-slate-700 space-y-3"><ul className="list-disc list-inside space-y-1">{(policy?.rules || []).map((r: string, i: number) => <li key={i}>{r}</li>)}</ul></div>}<div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setPolicyOpen(false)}>Đã hiểu</Button></div></div></div>}
        </div>
    );
};

export default FindJobsPage;
