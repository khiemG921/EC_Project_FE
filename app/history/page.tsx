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
    Repeat,
    MessageSquare,
    XCircle,
    AlertTriangle,
    Currency,
} from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { logDev } from '@/lib/utils';
import fetchWithAuth from '@/lib/apiClient';

const createdJobs: any[] = [];

// --- COMPONENT MODAL HỦY DỊCH VỤ ---
function CancellationModal({
    isOpen,
    onClose,
    job,
    onConfirm,
}: {
    isOpen: boolean;
    onClose: () => void;
    job: any;
    onConfirm: (jobId: number, reason: string) => void;
}) {
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [exchangeRate, setExchangeRate] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setReason('');
            setOtherReason('');
        }
    }, [isOpen]);

    useEffect(() => {
        const tx =
            (job as any)?.transaction ||
            (Array.isArray((job as any)?.transactions)
                ? (job as any).transactions[0]
                : undefined);
        const currency = tx?.currency ?? job?.currency;
        if (isOpen && currency === 'USD') {
            const exKey = (globalThis as any)?.process?.env
                ?.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
            fetch(`https://v6.exchangerate-api.com/v6/${exKey}/pair/USD/VND`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.conversion_rate) {
                        setExchangeRate(data.conversion_rate);
                    }
                })
                .catch((err) => {
                    console.error('Error fetching exchange rate:', err);
                });
        }
    }, [isOpen, job]);

    // Logic tính phí hủy và hoàn tiền
    const { finalPrice, refund, feeDetails, policyMessage } = useMemo(() => {
        if (step !== 3 || !job) {
            return {
                finalPrice: 0,
                refund: 0,
                feeDetails: [],
                policyMessage: '',
            };
        }
        const now = new Date();
        const timeSinceCreationHours =
            (now.getTime() - new Date(job.created_at).getTime()) /
            (1000 * 60 * 60);
        const timeUntilStartHours =
            (new Date(job.job_datetime).getTime() - now.getTime()) /
            (1000 * 60 * 60);

        // Lấy amount/currency từ transaction nếu có, fallback về job
        const tx =
            (job as any).transaction ||
            (Array.isArray((job as any).transactions)
                ? (job as any).transactions[0]
                : undefined);
        const rawAmount = tx?.amount ?? (job as any).amount ?? job.price ?? 0;
        const currency = tx?.currency ?? job.currency ?? 'VND';
        const amountNum =
            typeof rawAmount === 'string'
                ? parseFloat(rawAmount)
                : Number(rawAmount);

        // Quy đổi sang VND nếu USD để áp dụng chính sách tính phí theo VND
        const basePrice: number =
            currency === 'USD'
                ? Number((amountNum * exchangeRate).toFixed(0))
                : amountNum;

        let _fee = 0;
        let _refund = 0;
        let _policyMessage = '';
        const _feeDetails: { label: string; value: number }[] = [];

        if (timeSinceCreationHours <= 24) {
            _policyMessage =
                'Bạn được hủy miễn phí và hoàn 100% giá trị đơn hàng về ví CleanPay.';
            _refund = basePrice;
            _feeDetails.push({
                label: 'Hoàn tiền về ví CleanPay',
                value: _refund,
            });
        } else {
            _policyMessage =
                'Do hủy sau 24 giờ kể từ khi đặt, bạn sẽ được hoàn 50% giá trị dịch vụ, sau khi trừ phí hủy (nếu có).';
            const baseRefund = basePrice * 0.5;
            if (timeUntilStartHours <= 24) {
                _fee = basePrice * 0.3;
                _feeDetails.push({
                    label: 'Hoàn 50% giá trị gốc',
                    value: baseRefund,
                });
                _feeDetails.push({
                    label: 'Phí hủy (gấp, <24h)',
                    value: -_fee,
                });
            } else {
                _fee = 20000;
                _feeDetails.push({
                    label: 'Hoàn 50% giá trị gốc',
                    value: baseRefund,
                });
                _feeDetails.push({
                    label: 'Phí hủy (thường, >24h)',
                    value: -_fee,
                });
            }
            _refund = Math.max(0, baseRefund - _fee);
        }

        return {
            finalPrice: basePrice,
            refund: _refund,
            feeDetails: _feeDetails,
            policyMessage: _policyMessage,
        };
    }, [step, job, exchangeRate]);

    if (!isOpen) return null;

    const handleNext = () => setStep(step + 1);

    const handleReasonSelect = (selectedReason: string) => {
        setReason(selectedReason);
        if (selectedReason === 'Đổi người làm') {
            setStep(100); // Step đặc biệt cho thông báo
        } else {
            setStep(3); // Chuyển đến bước xác nhận chính sách
        }
    };

    const handleFinalConfirm = async () => {
        const finalReason = reason === 'Lý do khác' ? otherReason : reason;
        try {
            let res = await import('@/lib/apiClient').then((m) =>
                m.fetchWithAuth(`/api/job/cancel/${job.job_id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: finalReason }),
                })
            );
            console.debug('Cancel job response status:', res.status);
            if (!res.ok) {
                throw new Error(`Cancel failed with status ${res.status}`);
            }

            res = await import('@/lib/apiClient').then((m) =>
                m.fetchWithAuth(`/api/customer/refund`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: job.customer_id,
                        amount: refund,
                        currency:
                            (
                                (job as any).transaction ||
                                (Array.isArray((job as any).transactions)
                                    ? (job as any).transactions[0]
                                    : undefined)
                            )?.currency ?? job.currency,
                    }),
                })
            );
            console.debug('Refund response status:', res.status);

            if (!res.ok) {
                throw new Error(`Refund failed with status ${res.status}`);
            }

            onConfirm(job.job_id, finalReason);
        } catch (error) {
            console.error('Cancel job error:', error);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 1: // Cảnh báo ban đầu
                return (
                    <>
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                            <h3 className="text-lg font-bold text-slate-800 mt-4">
                                Cân nhắc hủy công việc
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Thao tác hủy việc có thể làm giảm điểm uy tín
                                tài khoản của bạn. Bạn có chắc chắn muốn tiếp
                                tục?
                            </p>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Ở lại
                            </Button>
                            <Button
                                className="flex-1 bg-red-500 hover:bg-red-600"
                                onClick={handleNext}
                            >
                                Vẫn hủy
                            </Button>
                        </div>
                    </>
                );
            case 2: // Chọn lý do
                const reasons = [
                    'Bận việc đột xuất',
                    'Đổi người làm',
                    'Không cần công việc này nữa',
                    'Chưa có người nhận',
                    'Lý do khác',
                ];
                return (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 text-center">
                            Lý do hủy việc là gì?
                        </h3>
                        <div className="mt-4 space-y-2">
                            {reasons.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => handleReasonSelect(r)}
                                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        {/* --- THÊM NÚT QUAY LẠI --- */}
                        <div className="mt-4 border-t border-slate-200 pt-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setStep(1)}
                            >
                                Quay lại
                            </Button>
                        </div>
                    </div>
                );
            case 3: // Xác nhận chính sách và phí
                return (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 text-center">
                            Xác nhận hủy và chính sách
                        </h3>
                        <div className="mt-4 bg-slate-50 p-4 rounded-lg text-sm space-y-3">
                            <p className="font-semibold text-slate-800">
                                Chính sách hủy dịch vụ:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-1">
                                <li>
                                    <b>Miễn phí:</b> Trong vòng 24 giờ kể từ lúc
                                    đặt (Hoàn 100% vào ví CleanPay).
                                </li>
                                <li>
                                    <b>Sau 24 giờ kể từ lúc đặt:</b> Hoàn 50%
                                    giá trị dịch vụ vào ví CleanPay, sau khi trừ
                                    các khoản phí sau:
                                </li>
                                <li className="ml-4">
                                    - Phí hủy{' '}
                                    <b className="text-red-600">30%</b> giá trị
                                    việc nếu hủy trước giờ làm{' '}
                                    <b className="text-red-600">dưới 24 giờ</b>.
                                </li>
                                <li className="ml-4">
                                    - Phí hủy{' '}
                                    <b className="text-red-600">20,000đ</b> nếu
                                    hủy trước giờ làm{' '}
                                    <b className="text-red-600">trên 24 giờ</b>.
                                </li>
                            </ul>
                            <p className="italic text-xs text-slate-500">
                                Đối với gói tháng, chúng tôi sẽ hoàn lại tổng số
                                tiền của những tháng chưa sử dụng vào ví
                                CleanPay.
                            </p>

                            <div className="border-t border-slate-200 pt-3 mt-3 space-y-2">
                                <p className="font-semibold text-slate-800">
                                    Áp dụng cho đơn hàng của bạn:
                                </p>
                                {feeDetails.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex justify-between"
                                    >
                                        <span>{item.label}</span>
                                        <span
                                            className={`${
                                                item.value < 0
                                                    ? 'text-red-600'
                                                    : 'text-slate-700'
                                            }`}
                                        >
                                            {item.value.toLocaleString('vi-VN')}
                                            đ
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
                                    <span>Số tiền hoàn cuối cùng</span>
                                    <span className="text-teal-600">
                                        {refund.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep(2)}
                            >
                                Quay lại
                            </Button>
                            <Button
                                className="flex-1 bg-red-500 hover:bg-red-600"
                                onClick={handleFinalConfirm}
                            >
                                Đồng ý hủy
                            </Button>
                        </div>
                    </div>
                );
            case 100: // Thông báo đổi người làm
                return (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 text-center">
                            Hỗ trợ đổi người làm
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 text-center">
                            Trong quá trình sử dụng dịch vụ, nếu bạn muốn thay
                            đổi người giúp việc, vui lòng gọi đến tổng đài{' '}
                            <strong className="text-teal-600">1900 8888</strong>{' '}
                            để được hỗ trợ nhanh chóng.
                        </p>
                        <div className="mt-6">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={onClose}
                            >
                                Đã hiểu
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        // --- THÊM onClick ĐỂ ĐÓNG MODAL ---
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {renderContent()}
            </div>
        </div>
    );
}

// --- COMPONENT PHỤ ---
const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: { [key: string]: string } = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    const statusText: { [key: string]: string } = {
        pending: 'Chờ nhận',
        in_progress: 'Đang thực hiện',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã hủy',
    };
    return (
        <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                statusStyles[status] || 'bg-slate-100 text-slate-800'
            }`}
        >
            {statusText[status] || 'Không xác định'}
        </span>
    );
};

interface JobCardProps {
    job: any;
    onCancel: (job: any) => void;
    status: string;
    onConfirmCompletion: (id: number) => void;
}
const JobCard: React.FC<JobCardProps> = ({
    job,
    onCancel,
    status,
    onConfirmCompletion,
}) => {
    const { tasker, service } = job;
    const renderActions = () => {
        switch (status) {
            case 'completed':
                return (
                    <>
                        {job.review ? (
                            <div className="flex items-center gap-1 text-sm text-yellow-500 font-semibold">
                                <Star size={16} className="fill-current" />
                                <span>
                                    Đã đánh giá ({job.review.rating_tasker}/5)
                                </span>
                            </div>
                        ) : (
                            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                                <Star size={16} /> Viết đánh giá
                            </button>
                        )}
                    </>
                );
            case 'in_progress':
            case 'pending':
                return (
                    <>
                        <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                            <MessageSquare size={16} /> Nhắn tin
                        </button>
                        <button
                            onClick={() => onCancel(job)}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <XCircle size={16} /> Hủy đơn
                        </button>
                        {job.completed_at ? (
                            <button
                                onClick={() => onConfirmCompletion(job.job_id)}
                                disabled={job.completed_at == null}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                Xác nhận hoàn thành
                            </button>
                        ) : null}
                    </>
                );
            default:
                return null;
        }
    };
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-shadow hover:shadow-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 text-md">
                        {service.name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                        <Hash size={14} /> Mã đơn: #{job.job_id}
                    </p>
                </div>
                <StatusBadge status={status} />
            </div>
            <div className="p-4 space-y-4">
                {tasker && (
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                        <img
                            src={tasker.avatar_url}
                            alt={tasker.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="text-sm text-slate-500">
                                Đối tác thực hiện
                            </p>
                            <p className="font-semibold text-slate-700">
                                {tasker.name}
                            </p>
                        </div>
                    </div>
                )}
                {!tasker && status === 'pending' && (
                    <div className="flex items-center gap-3 bg-yellow-50 text-yellow-700 p-3 rounded-lg">
                        <User size={20} />
                        <div>
                            <p className="font-semibold">Đang tìm đối tác</p>
                            <p className="text-sm">
                                Hệ thống sẽ thông báo ngay khi có người nhận
                                việc.
                            </p>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-600">
                        <Calendar size={16} className="mt-0.5 shrink-0" />
                        <span>
                            Ngày đặt:{' '}
                            {new Date(job.created_at).toLocaleDateString(
                                'vi-VN'
                            )}
                        </span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600">
                        <Clock size={16} className="mt-0.5 shrink-0" />
                        <span>
                            Hoàn thành:{' '}
                            {job.completed_at
                                ? new Date(job.completed_at).toLocaleDateString(
                                      'vi-VN'
                                  )
                                : 'Chưa có'}
                        </span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600 sm:col-span-2">
                        <MapPin size={16} className="mt-0.5 shrink-0" />
                        <span>{job.location}</span>
                    </div>
                    {/* <div className="flex items-start gap-2 text-slate-600">
                        <Package size={16} className="mt-0.5 shrink-0" />
                        <span>{service_detail.name}</span>
                    </div> */}
                    <div className="flex items-start gap-2 text-slate-600">
                        <Tag size={16} className="mt-0.5 shrink-0" />
                        <span>
                            {(() => {
                                const tx =
                                    (job as any).transaction ||
                                    (Array.isArray((job as any).transactions)
                                        ? (job as any).transactions[0]
                                        : undefined);
                                const amount =
                                    tx?.amount ??
                                    (job as any).amount ??
                                    job.price ??
                                    0;
                                const currency =
                                    tx?.currency ?? job.currency ?? 'VND';
                                const amt =
                                    typeof amount === 'string'
                                        ? parseFloat(amount)
                                        : Number(amount);
                                return currency === 'USD'
                                    ? `$${amt}`
                                    : `${amt.toLocaleString('vi-VN')}đ`;
                            })()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 flex flex-col sm:flex-row-reverse items-center gap-3">
                {renderActions()}
            </div>
        </div>
    );
};

const BookingHistoryPage = () => {
    const { user, loading, logoutUser } = useUser();
    const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>(
        'ongoing'
    );
    const [jobs, setJobs] = useState<typeof createdJobs>([]);
    const [statuses, setStatuses] = useState<Record<number, string>>({});
    const router = useRouter();

    // --- State cho modal hủy ---
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedJobForCancel, setSelectedJobForCancel] = useState<any>(null);

    // Load dữ liệu lịch sử đặt
    useEffect(() => {
        if (loading || !user) return; // Chỉ tải khi đã có user
        const controller = new AbortController();
        async function loadJobs() {
            try {
                const res = await fetchWithAuth('/api/job/load', {
                    method: 'GET',
                    signal: controller.signal as any,
                });
                console.debug('GET /api/job/load status:', res.status);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const data = await res.json();
                setJobs(data || []);
            } catch (err: any) {
                if (err?.name === 'AbortError') return;
                console.error('Lỗi khi load lịch sử công việc:', err);
            }
        }
        loadJobs();
        return () => controller.abort();
    }, [loading, user?.id]);

    // Khi jobs thay đổi thì fetch status từng job
    useEffect(() => {
        const controller = new AbortController();
        async function loadStatuses() {
            const s: Record<number, string> = {};
            await Promise.all(
                jobs.map(async (job) => {
                    try {
                        const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/job/status/${job.job_id}`,
                            {
                                credentials: 'include',
                                signal: controller.signal,
                            }
                        );
                        const json = await res.json();
                        s[job.job_id] = json.status;
                    } catch {
                        s[job.job_id] = job.status;
                    }
                })
            );
            setStatuses(s);
        }
        if (jobs.length) loadStatuses();
        return () => controller.abort();
    }, [jobs]);

    // Gọi API confirm hoàn thành
    const handleConfirmCompletion = async (jobId: number) => {
        if (!window.confirm(`Xác nhận hoàn thành đơn #${jobId}?`)) return;
        const res = await fetchWithAuth(`/api/job/customer/confirm/${jobId}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (res.ok) {
            // cập nhật UI local
            setStatuses((prev) => ({ ...prev, [jobId]: 'completed' }));
            setJobs((prev) =>
                prev.map((j) =>
                    j.job_id === jobId ? { ...j, status: 'completed' } : j
                )
            );
        } else {
            alert('Xác nhận hoàn thành thất bại');
        }
    };

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
                    <p className="text-slate-600 mb-4">
                        Vui lòng đăng nhập để xem lịch sử đặt hàng
                    </p>
                    <a
                        href="/auth/login"
                        className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
                    >
                        Đăng nhập
                    </a>
                </div>
            </div>
        );
    }

    const handleOpenCancelModal = (job: any) => {
        setSelectedJobForCancel(job);
        setCancelModalOpen(true);
    };

    const handleCloseCancelModal = () => {
        setCancelModalOpen(false);
        setSelectedJobForCancel(null);
    };

    const handleConfirmCancellation = (jobId: number, reason: string) => {
        logDev(`Đã xác nhận hủy job ID: ${jobId} với lý do: "${reason}"`);

        setJobs((prevJobs) =>
            prevJobs.map((job) =>
                job.job_id === jobId ? { ...job, status: 'cancelled' } : job
            )
        );
        handleCloseCancelModal();
    };

    const ongoingJobs = jobs.filter((job) =>
        ['in_progress', 'pending'].includes(job.status)
    );
    const completedJobs = jobs.filter((job) =>
        ['completed', 'cancelled'].includes(job.status)
    );

    const renderJobList = (jobList: typeof createdJobs) => {
        if (jobList.length === 0) {
            return (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Package size={48} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-700">
                        Không có đơn đặt nào
                    </h3>
                    <p className="mt-1 text-slate-500">
                        Các dịch vụ bạn đặt sẽ xuất hiện ở đây.
                    </p>
                    {/* nút để đặt dịch vụ mới dẫn về trang chủ */}
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        Đặt dịch vụ ngay
                    </button>
                </div>
            );
        }
        return (
            <div className="space-y-6">
                {jobList.map((job) => (
                    <JobCard
                        key={job.job_id}
                        job={job}
                        onCancel={handleOpenCancelModal}
                        status={statuses[job.job_id] || job.status}
                        onConfirmCompletion={handleConfirmCompletion}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader
                user={user}
                onLogout={logoutUser}
                activeRole={user.roles[0]}
                onRoleChange={() => {}}
                showRoleSwitcher={user.roles.length > 1}
            />
            <main className="container mx-auto p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Lịch sử đặt dịch vụ
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Theo dõi các dịch vụ bạn đã và đang sử dụng.
                    </p>
                </header>
                <div className="mb-8 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('ongoing')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'ongoing'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Đang thực hiện
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'completed'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Đã hoàn thành
                        </button>
                    </nav>
                </div>
                <div>
                    {activeTab === 'ongoing' && renderJobList(ongoingJobs)}
                    {activeTab === 'completed' && renderJobList(completedJobs)}
                </div>
            </main>
            <CancellationModal
                isOpen={isCancelModalOpen}
                onClose={handleCloseCancelModal}
                job={selectedJobForCancel}
                onConfirm={handleConfirmCancellation}
            />
        </div>
    );
};

export default BookingHistoryPage;
