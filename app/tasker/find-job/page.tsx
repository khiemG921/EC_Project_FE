'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, Clock, CheckCircle2, Search, Briefcase, SlidersHorizontal, Shield, FileText, Hourglass, History } from 'lucide-react';
import fetchWithAuth from '@/lib/apiClient';
import DashboardHeader from '@/components/common/DashboardHeader';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

type BackendTaskerJob = {
    job_id: number;
    service: { name: string; service_id: string };
    location: string;
    created_at: string;
    noted?: string;
    estimated_earnings: number;
    accepted?: boolean;
    distance?: number;
    status?: JobStatus;
    completed_at?: string | null;
};

type UiTaskerJob = BackendTaskerJob & { status: JobStatus; completed_at?: string | null };

const mockServices = [
    { id: '1', name: 'Giúp Việc Ca Lẻ' },
    { id: '2', name: 'Giúp Việc Định Kỳ' },
    { id: '4', name: 'Vệ Sinh Sofa, Đệm, Rèm, Thảm' },
    { id: '5', name: 'Vệ Sinh Điều Hòa' },
    { id: '8', name: 'Vệ Sinh Công Nghiệp' },
];

// Helper: time since string
const timeSince = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' ngày trước';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' giờ trước';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' phút trước';
    return Math.floor(seconds) + ' giây trước';
};

// --- Job Cards ---
const NewJobCard: React.FC<{ job: UiTaskerJob; onAccept: (id: number) => void; onView: (id: number) => void; accepting?: boolean }>
= ({ job, onAccept, onView, accepting }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md">
        <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg">{job.service?.name || 'Dịch vụ'}</h3>
                <div className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{Number(job.estimated_earnings || 0).toLocaleString('en-US')}đ</div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{job.location}{typeof job.distance === 'number' ? ` (~${job.distance} km)` : ''}</span></div>
                <div className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0" /><span>Đăng {timeSince(job.created_at)}</span></div>
                {job.noted ? <p className="text-slate-500 pt-2 italic border-t border-slate-100 mt-3">"{job.noted}"</p> : null}
            </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onView(job.job_id)}>Xem chi tiết</Button>
            <Button className="flex-1 bg-teal-500 hover:bg-teal-600" disabled={accepting} onClick={() => onAccept(job.job_id)}>{accepting ? 'Đang nhận...' : 'Nhận việc'}</Button>
        </div>
    </div>
);

const OngoingJobCard: React.FC<{ job: UiTaskerJob; onComplete: (id: number) => void; onView: (id: number) => void; completing?: boolean }>
= ({ job, onComplete, onView, completing }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md">
        <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg">{job.service?.name || 'Dịch vụ'}</h3>
                <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{Number(job.estimated_earnings || 0).toLocaleString('en-US')}đ</div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{job.location}</span></div>
                <div className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0" /><span>Đã nhận {timeSince(job.created_at)}</span></div>
                {job.noted ? <p className="text-slate-500 pt-2 italic border-t border-slate-100 mt-3">"{job.noted}"</p> : null}
            </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onView(job.job_id)}>Xem chi tiết</Button>
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600" disabled={completing} onClick={() => onComplete(job.job_id)}>{completing ? 'Đang xử lý...' : 'Hoàn thành công việc'}</Button>
        </div>
    </div>
);

const CompletedJobCard: React.FC<{ job: UiTaskerJob; onView: (id: number) => void }>
= ({ job, onView }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md opacity-90">
        <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-600 text-lg">{job.service?.name || 'Dịch vụ'}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><CheckCircle2 size={14} /> ĐÃ HOÀN THÀNH</span>
            </div>
            <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{job.location}</span></div>
                {job.completed_at ? (
                    <div className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0" /><span>Hoàn thành {timeSince(job.completed_at)}</span></div>
                ) : null}
                <div className="text-sm font-semibold text-slate-700 pt-2 border-t border-slate-100 mt-3">Thu nhập: {Number(job.estimated_earnings || 0).toLocaleString('en-US')}đ</div>
            </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onView(job.job_id)}>Xem lại chi tiết</Button>
        </div>
    </div>
);

// --- Main Page - Trang nhận việc ---
const FindJobsPage = () => {
    const { user, loading, logoutUser } = useUser();
    const [jobs, setJobs] = useState<UiTaskerJob[]>([]);
    const [activeTab, setActiveTab] = useState<JobStatus>('pending');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterService, setFilterService] = useState('all');
    const [city, setCity] = useState<'hcm' | 'hanoi' | 'danang'>('hcm');
    const [actionState, setActionState] = useState<{ type: 'accepting' | 'completing' | null, id: number | null }>({ type: null, id: null });

    // Modals state
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [jobDetail, setJobDetail] = useState<any>(null);
    const [policyOpen, setPolicyOpen] = useState(false);
    const [policyLoading, setPolicyLoading] = useState(false);
    const [policy, setPolicy] = useState<any>(null);

    const fetchJobs = useCallback(async () => {
        if (!user) return;
        const isTasker = Array.isArray(user.roles) && user.roles.includes('tasker');
        if (!isTasker) return;
        try {
            const res = await fetchWithAuth(`/api/tasker/jobs?city=${city}`, { method: 'GET' });
            if (!res.ok) throw new Error('Không thể tải danh sách công việc');
            const data = await res.json();
            const list: BackendTaskerJob[] = (data?.data || []) as BackendTaskerJob[];
            const mapped: UiTaskerJob[] = list.map(j => ({
                ...j,
                status: (j.status as JobStatus) || (j.accepted ? 'in_progress' : 'pending'),
                completed_at: j.completed_at ?? null,
            }));
            setJobs(mapped);
        } catch (e) {
            console.error(e);
            setJobs([]);
        }
    }, [city, user?.id]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    // Accept job: keep real backend call
    const acceptJob = async (jobId: number) => {
        try {
            setActionState({ type: 'accepting', id: jobId });
            const res = await fetchWithAuth(`/api/tasker/jobs/${jobId}/accept`, { method: 'POST' });
            if (!res.ok) throw new Error('Không thể nhận việc');
            setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: 'in_progress', accepted: true } as UiTaskerJob : j));
        } catch (e) {
            console.error(e);
        } finally {
            setActionState({ type: null, id: null });
        }
    };

    // Complete job: mock first; if backend exists, use it, else fallback to local state update
    const completeJob = async (jobId: number) => {
        setActionState({ type: 'completing', id: jobId });
        let done = false;
        try {
            const res = await fetchWithAuth(`/api/tasker/jobs/${jobId}/complete`, { method: 'POST' });
            if (res.ok) {
                done = true;
            }
        } catch (e) {
            // ignore, will fallback to mock
        }
        // Fallback mock (or also run when backend succeeded to update UI immediately)
        await new Promise(r => setTimeout(r, 600));
        setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: 'completed', completed_at: new Date().toISOString() } : j));
        setActionState({ type: null, id: null });
    };

    // View detail: keep real backend call
    const viewDetail = async (jobId: number) => {
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailError(null);
        try {
            const res = await fetchWithAuth(`/api/tasker/jobs/${jobId}`, { method: 'GET' });
            if (!res.ok) {
                if (res.status === 403) throw new Error('Bạn không có quyền xem chi tiết công việc này.');
                if (res.status === 404) throw new Error('Không tìm thấy công việc.');
                throw new Error('Không thể tải chi tiết công việc.');
            }
            const data = await res.json();
            setJobDetail(data.data || null);
        } catch (e: any) {
            setDetailError(e?.message || 'Đã xảy ra lỗi.');
            setJobDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    // Regulations: keep real backend call with built-in fallback content
    const openPolicy = async () => {
        setPolicyOpen(true);
        if (policy) return;
        setPolicyLoading(true);
        try {
            const res = await fetchWithAuth('/api/tasker/regulations', { method: 'GET' });
            if (!res.ok) throw new Error('Không thể tải quy định');
            const data = await res.json();
            setPolicy(data);
        } catch (e) {
            setPolicy({
                title: 'Quy chế nhận và hủy việc',
                rules: [
                    'Khi bấm "Nhận việc", đối tác xác nhận đã đọc kỹ mô tả công việc.',
                    'Đối tác không được hủy sau khi đã nhận việc.',
                    'Nếu có sự cố, vui lòng liên hệ tổng đài hỗ trợ.',
                ],
            });
        } finally {
            setPolicyLoading(false);
        }
    };

    // Filtered jobs by tab/search/service
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesStatus = job.status === activeTab;
            const search = searchTerm.trim().toLowerCase();
            const matchesSearch = !search || (job.location?.toLowerCase().includes(search) || job.service?.name?.toLowerCase().includes(search));
            const matchesService = filterService === 'all' || job.service?.service_id === filterService;
            return matchesStatus && matchesSearch && matchesService;
        });
    }, [jobs, searchTerm, filterService, activeTab]);

    // Loading/auth gate
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600"></div>
            </div>
        );
    }
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-700">Bạn cần đăng nhập để truy cập trang này</h2>
                    <p className="text-slate-500 mt-1">Vui lòng đăng nhập bằng tài khoản Tasker.</p>
                    <a href="/auth/login" className="inline-block mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">Đăng nhập</a>
                </div>
            </div>
        );
    }
    const isTasker = Array.isArray(user.roles) && user.roles.includes('tasker');
    if (!isTasker) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <DashboardHeader user={user} onLogout={logoutUser} activeRole={user.roles[0]} onRoleChange={() => { }} showRoleSwitcher={user.roles.length > 1} />
                <main className="container mx-auto p-6 lg:p-8">
                    <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-semibold text-slate-700">Bạn không có quyền truy cập trang này</h2>
                        <p className="text-slate-500 mt-1">Chỉ Tasker mới có thể xem và nhận việc.</p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <a href="/dashboard" className="inline-block bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200">Về Dashboard</a>
                            <a href="/" className="inline-block bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">Trang chủ</a>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const renderJobList = () => {
        if (filteredJobs.length === 0) {
            const messages: Record<'pending' | 'in_progress' | 'completed' | 'cancelled', { title: string; desc: string }> = {
                pending: { title: 'Không có công việc mới nào', desc: 'Hiện tại không có công việc nào phù hợp với lựa chọn của bạn.' },
                in_progress: { title: 'Không có công việc đang thực hiện', desc: 'Bạn chưa nhận công việc nào. Hãy chuyển sang tab "Công việc mới" nhé.' },
                completed: { title: 'Chưa có công việc hoàn thành', desc: 'Lịch sử công việc đã hoàn thành của bạn sẽ được hiển thị ở đây.' },
                cancelled: { title: 'Không có công việc đã hủy', desc: 'Các công việc hủy sẽ hiển thị tại đây nếu có.' },
            };
            const msg = messages[activeTab];
            return (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Briefcase size={48} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-700">{msg.title}</h3>
                    <p className="mt-1 text-slate-500">{msg.desc}</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobs.map(job => {
                    switch (job.status) {
                        case 'pending':
                            return (
                                <NewJobCard key={job.job_id} job={job} onAccept={acceptJob} onView={viewDetail} accepting={actionState.type === 'accepting' && actionState.id === job.job_id} />
                            );
                        case 'in_progress':
                            return (
                                <OngoingJobCard key={job.job_id} job={job} onComplete={completeJob} onView={viewDetail} completing={actionState.type === 'completing' && actionState.id === job.job_id} />
                            );
                        case 'completed':
                            return (
                                <CompletedJobCard key={job.job_id} job={job} onView={viewDetail} />
                            );
                        default:
                            return null;
                    }
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader user={user} onLogout={logoutUser} activeRole="tasker" onRoleChange={() => { }} showRoleSwitcher={user.roles.length > 1} />

            <main className="container mx-auto p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý công việc</h1>
                    <p className="text-slate-500 mt-1">Xem, nhận và hoàn thành các công việc của bạn.</p>
                </header>

                {/* Tabs */}
                <div className="mb-8 border-b border-slate-200">
                    <nav className="flex -mb-px space-x-6">
                        <button onClick={() => setActiveTab('pending')} className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}><Briefcase size={16} /> Công việc mới</button>
                        <button onClick={() => setActiveTab('in_progress')} className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'in_progress' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}><Hourglass size={16} /> Đang thực hiện</button>
                        <button onClick={() => setActiveTab('completed')} className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}><History size={16} /> Đã hoàn thành</button>
                    </nav>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input placeholder="Tìm theo tên việc, địa chỉ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" />
                        </div>
                        <select value={city} onChange={(e) => setCity(e.target.value as any)} className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="hcm">TP. Hồ Chí Minh</option>
                            <option value="hanoi">Hà Nội</option>
                            <option value="danang">Đà Nẵng</option>
                        </select>
                        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="all">Tất cả dịch vụ</option>
                            {mockServices.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                        </select>
                        <Button variant="outline" className="flex items-center gap-2"><SlidersHorizontal size={16} /><span>Bộ lọc</span></Button>
                        <Button onClick={openPolicy} variant="outline" className="flex items-center gap-2 md:ml-auto"><Shield size={16} /><span>Quy định</span></Button>
                    </div>
                </div>

                {/* List */}
                <div>{renderJobList()}</div>
            </main>

            {/* Job Detail Modal */}
            {detailOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={20} className="text-teal-600" />
                            <h3 className="text-lg font-bold text-slate-800">Chi tiết công việc</h3>
                        </div>
                        {detailLoading ? (
                            <p className="text-slate-500">Đang tải…</p>
                        ) : detailError ? (
                            <p className="text-red-600">{detailError}</p>
                        ) : jobDetail ? (
                            <div className="space-y-3 text-sm text-slate-700">
                                <div className="font-semibold text-slate-800">{jobDetail.service?.name || 'Dịch vụ'}</div>
                                <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5" /><span>{jobDetail.location}</span></div>
                                <div className="flex items-start gap-2"><Clock size={16} className="mt-0.5" /><span>Đăng lúc {new Date(jobDetail.created_at).toLocaleString('vi-VN')}</span></div>
                                {jobDetail.noted && <p className="italic text-slate-600">"{jobDetail.noted}"</p>}
                                {jobDetail.description && (
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <div className="font-semibold">Gói dịch vụ</div>
                                        <div>{jobDetail.description}</div>
                                        {jobDetail?.total_duration ? <div>Thời lượng: {jobDetail.total_duration} giờ</div> : null}
                                    </div>
                                )}
                                <div className="font-semibold text-teal-700">Thu nhập ước tính: {Number(jobDetail.estimated_earnings).toLocaleString('en-US')}đ</div>
                            </div>
                        ) : (
                            <p className="text-slate-500">Không có dữ liệu.</p>
                        )}
                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Regulations Modal */}
            {policyOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPolicyOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={20} className="text-teal-600" />
                            <h3 className="text-lg font-bold text-slate-800">{policy?.title || 'Quy định'}</h3>
                        </div>
                        {policyLoading ? (
                            <p className="text-slate-500">Đang tải…</p>
                        ) : (
                            <div className="text-sm text-slate-700 space-y-3">
                                <ul className="list-disc list-inside space-y-1">
                                    {(policy?.rules || []).map((r: string, i: number) => <li key={i}>{r}</li>)}
                                </ul>
                                {policy?.cancellation && (
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <div className="font-semibold">Chính sách hủy:</div>
                                        <div>Được hủy sau khi nhận: {policy.cancellation.can_cancel_after_accept ? 'Có' : 'Không'}</div>
                                        {policy.cancellation.contact_phone && <div>Hotline: {policy.cancellation.contact_phone}</div>}
                                        {policy.cancellation.contact_email && <div>Email: {policy.cancellation.contact_email}</div>}
                                        {policy.cancellation.instruction && <div className="text-slate-600">{policy.cancellation.instruction}</div>}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setPolicyOpen(false)}>Đã hiểu</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindJobsPage;
