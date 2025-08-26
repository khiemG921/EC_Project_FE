'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Swal from 'sweetalert2';
import { getVoucherCodeFromStorage } from '@/lib/paymentUtils';
import fetchWithAuth from '@/lib/apiClient';

function MomoCaptureOrderContent() {
    const params = useSearchParams();

    const paymentInfoString = localStorage.getItem('paymentInfo');
    const paymentInfo = paymentInfoString ? JSON.parse(paymentInfoString) : {};
    const cleanCoinUsed = paymentInfo.usedCleanCoin ?? 0;

    useEffect(() => {
        // 1) Lấy dữ liệu MoMo trả về từ query string
        const transId = params.get('transId');
        const amount = params.get('amount');
        const extraData = params.get('extraData'); // chứa {"jobId":...}
        const resultCode = params.get('resultCode');

        if (resultCode !== '0') {
            Swal.fire(
                'Thanh toán thất bại',
                `Code: ${resultCode}`,
                'error'
            ).then(() => window.close());
            return;
        }

        // 2) Parse jobId từ extraData
        let jobId: number | null = null;
        try {
            const ed = JSON.parse(decodeURIComponent(extraData || ''));
            jobId = ed.jobId;
        } catch (e) {
            /* ignore */
        }

        // 3) Gọi API tạo transaction
        fetchWithAuth(`/api/transaction/create`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transactionId: transId,
                jobId,
                amount: parseFloat(amount || '0'),
                platformFee: 15000,
                currency: 'VND',
                paymentGateway: 'MoMo',
                status: 'COMPLETED',
                paidAt: new Date().toISOString(),
                voucher_code: getVoucherCodeFromStorage() || null,
                cleanCoinUsed: cleanCoinUsed,
            }),
        })
            .then(async (res) => {
                if (res.ok) {
                    await Swal.fire(
                        'Thanh toán MoMo thành công!',
                        '',
                        'success'
                    );
                } else {
                    const err = await res.json();
                    await Swal.fire(
                        'Lỗi khi lưu giao dịch',
                        err.error || '',
                        'error'
                    );
                }
                // Sau khi thông báo, chuyển trang cha về history và đóng pop-up
                if (window.opener) {
                    // Xóa item sau khi đã đọc để tránh dùng lại dữ liệu cũ
                    Object.keys(localStorage)
                        .filter((key) => key.toLowerCase().includes('booking'))
                        .forEach((key) => localStorage.removeItem(key));
                        
                    window.opener.location.href = '/history';
                }
                window.close();
            })
            .catch((e) => {
                console.error(e);
                Swal.fire('Lỗi mạng', '', 'error').then(() => {
                    if (window.opener) {
                        window.opener.location.href = '/dashboard';
                    }
                    window.close();
                });
            });
    }, [params]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Đang xử lý thanh toán MoMo…</p>
        </div>
    );
}

export default function MomoCaptureOrderPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
                </div>
            }
        >
            <MomoCaptureOrderContent />
        </Suspense>
    );
}
