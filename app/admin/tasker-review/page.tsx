// app/admin/tasker-review/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Search, User, Mail, Star } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminTaskerApplicationApi, TaskerApplication } from '@/lib/taskerApplicationApi';

// --- COMPONENT PHỤ ---

const ApplicationCard = ({ application, onApprove, onReject }: { application: TaskerApplication, onApprove: (id: string) => void, onReject: (id: string) => void }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md">
            <div className="p-5 flex-grow">
                <div className="flex items-center gap-4 mb-4">
                    <img 
                        src={application.avatar_url || 'https://via.placeholder.com/64'} 
                        alt={application.name} 
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm" 
                    />
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{application.name}</h3>
                        <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                            <Mail size={14} />
                            <span>{application.email}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                        <Star size={16} className="mt-0.5 shrink-0 text-amber-500" />
                        <div>
                            <p className="font-medium text-slate-500">Kỹ năng đăng ký:</p>
                            <p className="font-semibold text-slate-700">{application.skills}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Clock size={16} className="mt-0.5 shrink-0 text-sky-500" />
                         <div>
                            <p className="font-medium text-slate-500">Ngày nộp đơn:</p>
                            <p className="font-semibold text-slate-700">{new Date(application.application_date).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                </div>
            </div>
            {application.status === 'pending' && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <Button onClick={() => onReject(application.id)} variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">Từ chối</Button>
                    <Button onClick={() => onApprove(application.id)} className="flex-1 bg-teal-500 hover:bg-teal-600">Duyệt</Button>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT CHÍNH CỦA TRANG XÉT DUYỆT ---
const AdminTaskerReviewPage = () => {
    const [applications, setApplications] = useState<TaskerApplication[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch applications data
    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const result = await adminTaskerApplicationApi.getAll();
            if (result.success && result.data) {
                setApplications(result.data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const result = await adminTaskerApplicationApi.approve(id);
            if (result.success) {
                alert(`Đã duyệt hồ sơ ${id}`);
                // Refresh data
                await fetchApplications();
            } else {
                alert(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error approving application:', error);
            alert('Có lỗi xảy ra khi duyệt hồ sơ');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const result = await adminTaskerApplicationApi.reject(id);
            if (result.success) {
                alert(`Đã từ chối hồ sơ ${id}`);
                // Refresh data
                await fetchApplications();
            } else {
                alert(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error rejecting application:', error);
            alert('Có lỗi xảy ra khi từ chối hồ sơ');
        }
    };
    
    const filteredApplications = useMemo(() => {
        return applications.filter((app: TaskerApplication) => {
            const matchesStatus = app.status === activeTab;
            const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  app.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [applications, activeTab, searchTerm]);

    // Trang này được bảo vệ bởi AdminGuard. Không cần fetch profile.

    const renderApplicationList = (apps: TaskerApplication[]) => {
         if (isLoading) {
            return (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Đang tải dữ liệu...</p>
                </div>
            );
        }

        if (apps.length === 0) {
            return (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <User size={48} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-700">Không có hồ sơ nào</h3>
                    <p className="mt-1 text-slate-500">Không có hồ sơ nào trong mục này.</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {apps.map((app: TaskerApplication) => <ApplicationCard key={app.id} application={app} onApprove={handleApprove} onReject={handleReject} />)}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-slate-50 font-sans p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Xét duyệt Đối tác</h1>
                    <p className="text-slate-500 mt-1">Xem xét và phê duyệt các đơn đăng ký làm đối tác mới.</p>
                </header>

                {/* --- THANH TÌM KIẾM VÀ TABS --- */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Tìm theo tên, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 text-base"
                    />
                </div>

                <div className="mb-8 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('pending')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pending' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <Clock size={16} className="inline mr-1.5" /> Chờ duyệt
                        </button>
                        <button onClick={() => setActiveTab('approved')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'approved' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                           <CheckCircle size={16} className="inline mr-1.5" /> Đã duyệt
                        </button>
                         <button onClick={() => setActiveTab('rejected')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'rejected' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                           <XCircle size={16} className="inline mr-1.5" /> Đã từ chối
                        </button>
                    </nav>
                </div>

                {/* Content - Danh sách hồ sơ */}
                <div>
                   {renderApplicationList(filteredApplications)}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTaskerReviewPage;
