'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Swal from 'sweetalert2';
import { getVoucherCodeFromStorage } from '@/lib/paymentUtils';
import fetchWithAuth from '@/lib/apiClient';

function ZaloCaptureOrderContent() {
    const params = useSearchParams();

    useEffect(() => {
        const zpTransToken = params.get('checksum');
        const returnCode = params.get('status');
        const amount = params.get('amount');
        const jobId = params.get('jobId');

        // 1) Nếu thanh toán thất bại
        if (returnCode !== '1') {
            Swal.fire(
                'Thanh toán ZaloPay thất bại',
                `Code: ${returnCode}`,
                'error'
            ).then(() => window.close());
            return;
        }

        // 2) Nếu thành công, query trạng thái đơn từ backend
        (async () => {
            try {
                const txRes = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/create`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            transactionId: zpTransToken,
                            jobId: jobId,
                            amount: amount, // số tiền VND từ response query
                            platformFee: 15000,
                            currency: 'VND',
                            paymentGateway: 'ZaloPay',
                            status: 'COMPLETED',
                            paidAt: new Date().toISOString(),
                            voucher_code: getVoucherCodeFromStorage() || null,
                        }),
                    }
                );
                if (!txRes.ok) {
                    const err = await txRes.json();
                    throw new Error(err.error || 'Lỗi lưu transaction');
                }

                // 5) Hiển thị thông báo thành công
                await Swal.fire(
                    'Thanh toán ZaloPay thành công!',
                    '',
                    'success'
                );

                // 6) Chuyển trang cha về lịch sử và đóng popup
                if (window.opener) {
                    // Xóa item sau khi đã đọc để tránh dùng lại dữ liệu cũ
                    Object.keys(localStorage)
                        .filter((key) => key.toLowerCase().includes('booking'))
                        .forEach((key) => localStorage.removeItem(key));

                    window.opener.location.href = '/history';
                }
                window.close();
            } catch (e: any) {
                console.error(e);
                await Swal.fire(
                    'Lỗi khi xử lý giao dịch',
                    e.message || '',
                    'error'
                );
                if (window.opener) window.opener.location.href = '/history';
                window.close();
            }
        })();
    }, [params]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Đang xử lý kết quả thanh toán ZaloPay…</p>
        </div>
    );
}

export default function ZaloCaptureOrderPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
                </div>
            }
        >
            <ZaloCaptureOrderContent />
        </Suspense>
    );
}
