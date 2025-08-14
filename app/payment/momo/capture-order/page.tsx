'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function MomoCaptureOrderPage() {
    const params = useSearchParams();

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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction/create`, {
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
