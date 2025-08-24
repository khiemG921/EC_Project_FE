'use client';
import Script from 'next/script';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import DashboardHeader from '@/components/common/DashboardHeader';
import Swal from 'sweetalert2';
import { getVoucherCodeFromStorage } from '@/lib/paymentUtils';
import { logDev } from '@/lib/utils';
import fetchWithAuth from '@/lib/apiClient';

// Declare PayPal types for TypeScript
declare global {
    interface Window {
        paypal?: {
            Buttons: (options: {
                style?: {
                    shape?: string;
                    layout?: string;
                    color?: string;
                    label?: string;
                };
                createOrder: () => Promise<string>;
                onApprove: (data: any, actions: any) => Promise<void>;
                onError: (err: any) => void;
            }) => {
                render: (selector: string) => void;
            };
        };
    }
}

// --- Component chính của trang Thanh toán ---
export default function PaymentPage() {
    const [amount, setAmount] = useState<number>(0);
    const [jobId, setJobId] = useState<number | null>(null);
    const [platformFee] = useState<number>(15000);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<string>('');
    const [isPaypalReady, setIsPaypalReady] = useState(false);
    const paypalRenderedRef = useRef(false);
    const paypalClientId = (globalThis as any)?.process?.env?.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string | undefined;

    const { user, logoutUser, loading } = useUser();
    const router = useRouter();

    // Nếu chưa có user, redirect về login
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        logDev('Payment page loaded.');
    }, []);

    useEffect(() => {
        const paymentInfoString = localStorage.getItem('paymentInfo');
        if (paymentInfoString) {
            const paymentInfo = JSON.parse(paymentInfoString);
            setAmount(paymentInfo.totalPrice);
            setJobId(paymentInfo.jobId);
        } else {
            // Xử lý trường hợp không tìm thấy thông tin thanh toán
            alert('Không tìm thấy thông tin thanh toán.');
            // Có thể điều hướng người dùng về trang chủ
            // router.push('/');
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
            </div>
        );
    }
    if (!user) {
        return null;
    }

    const totalAmountVND = amount + platformFee;

    const handlePaymentSubmit = async () => {
        if (!selectedPaymentMethod) {
            alert('Vui lòng chọn một phương thức thanh toán.');
            return;
        }

            // 1) Lấy tỷ giá USD/VND
            const exKey = (globalThis as any)?.process?.env?.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
            const rateRes = await fetch(
                `https://v6.exchangerate-api.com/v6/${exKey}/pair/USD/VND`
            );
            const rateData = await rateRes.json();
            const vndPerUsd = rateData.conversion_rate;
            const usdValue = (totalAmountVND / vndPerUsd).toFixed(2);

            // 2) Render PayPal Buttons với pop-up
            if (window.paypal && !paypalRenderedRef.current) {
                window.paypal
                    .Buttons({
                        style: {
                            shape: 'rect',
                            layout: 'vertical',
                            color: 'gold',
                            label: 'paypal',
                        },
                        createOrder: async () => {
                            try {
                                const response = await fetchWithAuth(
                                    `/api/payment/paypal/create-order`,
                                    {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            amount: usdValue,
                                        }),
                                    }
                                );
                                const orderData = await response.json();

                                if (orderData.id) {
                                    return orderData.id;
                                }
                                const errorDetail = orderData?.details?.[0];
                                const errorMessage = errorDetail
                                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                    : JSON.stringify(orderData);
                                throw new Error(errorMessage);
                            } catch (error) {
                                console.error(error);
                                alert(
                                    `Could not initiate PayPal Checkout: ${error}`
                                );
                            }
                        },
                        onApprove: async (data: any, actions: any) => {
                            try {
                                // 1) Capture order qua PayPal
                                const response = await fetchWithAuth(
                                    `/api/payment/paypal/capture-order`,
                                    {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            orderID: data.orderID,
                                        }),
                                    }
                                );
                                logDev('Order data:', response);
                                const orderData = await response.json();

                                // 2) Xử lý các trường hợp lỗi
                                const errorDetail = orderData?.details?.[0];
                                if (
                                    errorDetail?.issue === 'INSTRUMENT_DECLINED'
                                ) {
                                    return actions.restart();
                                } else if (errorDetail) {
                                    throw new Error(
                                        `${errorDetail.description} (${orderData.debug_id})`
                                    );
                                } else if (!orderData.purchase_units) {
                                    throw new Error(JSON.stringify(orderData));
                                }

                                // 3) Lưu transaction
                                const transaction =
                                    orderData?.purchase_units?.[0]?.payments
                                        ?.captures?.[0] ||
                                    orderData?.purchase_units?.[0]?.payments
                                        ?.authorizations?.[0];

                                await fetchWithAuth(
                                    `/api/transaction/create`,
                                    {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            transactionId: transaction.id,
                                            jobId,
                                            amount: parseFloat(
                                                transaction.amount.value
                                            ),
                                            platformFee: (
                                                platformFee / vndPerUsd
                                            ).toFixed(2),
                                            currency: 'USD',
                                            paymentGateway: 'Paypal',
                                            status: transaction.status,
                                            paidAt: transaction.update_time,
                                            voucher_code: getVoucherCodeFromStorage() || null
                                        }),
                                    }
                                );

                                // 4) Điều hướng hoặc show thông báo
                                Swal.fire({
                                    text: `Thanh toán thành công: ${transaction.status} - ${transaction.id}`,
                                    icon: 'success',
                                    confirmButtonColor: '#14b8a6',
                                    confirmButtonText: 'Đóng',
                                    title: '',
                                });
                                // Xóa item sau khi đã đọc để tránh dùng lại dữ liệu cũ
                                localStorage.removeItem('paymentInfo');
                                router.push('/history');
                            } catch (error) {
                                console.error(error);
                                alert(`Thanh toán thất bại: ${error}`);
                            }
                        },
                        onError: (err: any) => {
                            console.error(err);
                            alert('Có lỗi PayPal.');
                        },
                    })
                    .render('#paypal-button-container');
            } else if (window.paypal && paypalRenderedRef.current) {
                Swal.fire({
                    text: 'PayPal SDK đã được render rồi.',
                    icon: 'info',
                    confirmButtonColor: '#14b8a6',
                    confirmButtonText: 'Đóng',
                    title: '',
                });
            } else {
                Swal.fire({
                    text: 'PayPal SDK chưa load xong, thử lại.',
                    icon: 'warning',
                    confirmButtonColor: '#14b8a6',
                    confirmButtonText: 'Đóng',
                    title: '',
                });
            }
            return;
        } else if (selectedPaymentMethod === 'momo') {
            // 1) Tạo order Momo
            const res = await fetchWithAuth(
                `/api/payment/momo/create-order`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: totalAmountVND,
                        orderInfo: `Thanh toán job #${jobId}`,
                        jobId,
                    }),
                }
            );
            const data = await res.json();
            if (!data.payUrl) {
                return Swal.fire({
                    text: 'Không thể khởi tạo thanh toán MoMo.',
                    icon: 'warning',
                    confirmButtonText: 'Đóng',
                });
            }

            // 2) Mở popup
            const popup = window.open(
                data.payUrl,
                'MoMoPayment',
                'width=460,height=600'
            );
            if (!popup) {
                return alert('Trình duyệt chặn pop-up, vui lòng cho phép.');
            }

            return;
        } else if (selectedPaymentMethod === 'zalopay') {
            // 1) Tạo đơn ZaloPay
            const res = await fetchWithAuth(
                `/api/payment/zalo/create-order`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: totalAmountVND,
                        orderInfo: `Thanh toán job #${jobId}`,
                        jobId,
                    }),
                }
            );
            const data = await res.json();
            if (!data.order_url) {
                return Swal.fire({
                    text: 'Không thể khởi tạo thanh toán ZaloPay.',
                    icon: 'warning',
                    confirmButtonText: 'Đóng',
                });
            }

            // 2) Mở pop-up với URL thanh toán
            const popup = window.open(
                data.order_url,
                'ZaloPayPayment',
                'width=500,height=600'
            );
            if (!popup) {
                return alert('Trình duyệt chặn pop-up, vui lòng cho phép.');
            }

            return;
        }
        // Xử lý các phương thức thanh toán khác
        alert(`Phương thức ${selectedPaymentMethod} chưa được triển khai.`);
    };

    const handleGoBack = async () => {
        // 1) Gọi API hủy job nếu có jobId
    if (jobId) {
            try {
    const res = await fetchWithAuth(
            `/api/job/cancel/${jobId}`,
                    {
                        method: 'POST',
                    }
                );
                if (!res.ok) {
                    const err = await res.json();
                    console.error('Cancel job failed:', err);
                }
            } catch (error) {
                console.error('Error cancelling job:', error);
            }
        } else {
            console.warn('No jobId to cancel');
        }

        // 2) Gọi API hoàn tiền CleanPay (refund) nếu đã sử dụng ví
        try {
            await fetchWithAuth(
                `/api/customer/refund`,
                {
                    method: 'POST',
                    body: JSON.stringify({ amount: totalAmountVND }),
                }
            );
        } catch (err) {
            console.error('Refund CleanPay failed:', err);
        }

        window.history.back(); // Quay lại trang trước đó trong lịch sử trình duyệt
    };

    const handleCancelPayment = async () => {
        // 1) Gọi API hủy job nếu có jobId
    if (jobId) {
            try {
    const res = await fetchWithAuth(
            `/api/job/cancel/${jobId}`,
                    {
                        method: 'POST',
                    }
                );
                if (!res.ok) {
                    const err = await res.json();
                    console.error('Cancel job failed:', err);
                }
            } catch (error) {
                console.error('Error cancelling job:', error);
            }
        } else {
            console.warn('No jobId to cancel');
        }

        // 2) Gọi API hoàn tiền CleanPay (refund) nếu đã sử dụng ví
        try {
            await fetchWithAuth(
                `/api/customer/refund`,
                {
                    method: 'POST',
                    body: JSON.stringify({ amount: totalAmountVND }),
                }
            );
        } catch (err) {
            console.error('Refund CleanPay failed:', err);
        }

        // 3) Thông báo và điều hướng
        Swal.fire({
            text: 'Bạn đã hủy thanh toán.',
            icon: 'warning',
            confirmButtonColor: '#14b8a6',
            confirmButtonText: 'Đóng',
            title: '',
        });

        // Xóa item thanh toán cũ và trở về trang dịch vụ
        localStorage.removeItem('paymentInfo');
        router.push('/#service');
    };

    return (
        <>
            {/* PayPal SDK */}
            {paypalClientId ? (
                <Script
                    src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`}
                    strategy="afterInteractive"
                    onLoad={() => setIsPaypalReady(true)}
                />
            ) : null}

            <div className="flex min-h-screen bg-slate-50">
                <main className="flex-1 p-8">
                    <DashboardHeader
                        user={user}
                        onLogout={logoutUser}
                        activeRole={user.roles[0]}
                        onRoleChange={() => {}}
                        showRoleSwitcher={false}
                    />
                    <header className="mb-8 text-center">
                        {' '}
                        {/* Căn giữa tiêu đề */}
                        <h1 className="text-3xl font-bold text-slate-800">
                            Thanh toán dịch vụ
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Hoàn tất thanh toán cho dịch vụ của bạn.
                        </p>
                    </header>

                    {/* Cột chọn phương thức thanh toán - Đã điều chỉnh bố cục */}
                    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8">
                        {' '}
                        {/* max-w-lg và mx-auto để căn giữa và giới hạn chiều rộng */}
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                            Chọn phương thức thanh toán
                        </h2>{' '}
                        {/* Căn giữa tiêu đề */}
                        <div className="space-y-6">
                            {/* Thanh toán Quốc tế */}
                            <div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-3">
                                    Quốc tế
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paypal"
                                            checked={
                                                selectedPaymentMethod ===
                                                'paypal'
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                            className="form-radio text-teal-500 h-5 w-5"
                                        />
                                        <img
                                            src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg"
                                            alt="PayPal"
                                            className="h-6 ml-3"
                                        />
                                        <span className="ml-3 font-medium text-slate-700">
                                            PayPal
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Thanh toán Việt Nam */}
                            <div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-3">
                                    Việt Nam
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="momo"
                                            checked={
                                                selectedPaymentMethod === 'momo'
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                            className="form-radio text-teal-500 h-5 w-5"
                                        />
                                        <img
                                            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png"
                                            alt="MoMo"
                                            className="h-6 ml-3"
                                        />
                                        <span className="ml-3 font-medium text-slate-700">
                                            MoMo
                                        </span>
                                    </label>
                                    <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="zalopay"
                                            checked={
                                                selectedPaymentMethod ===
                                                'zalopay'
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                            className="form-radio text-teal-500 h-5 w-5"
                                        />
                                        <img
                                            src="https://cdn.brandfetch.io/id_T-oXJkN/w/1624/h/1624/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1751816051661"
                                            alt="ZaloPay"
                                            className="h-10 ml-2"
                                        />
                                        <span className="ml-1 font-medium text-slate-700">
                                            ZaloPay
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* Tóm tắt thanh toán - Đã di chuyển vào cùng khối với phương thức thanh toán */}
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                                Tóm tắt thanh toán
                            </h2>
                            <div className="space-y-2 text-slate-700">
                                <div className="flex justify-between">
                                    <span>Giá dịch vụ:</span>
                                    <span className="font-semibold">
                                        {amount.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí nền tảng:</span>
                                    <span className="font-semibold">
                                        {platformFee.toLocaleString('vi-VN')}{' '}
                                        VNĐ
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-2 mt-2">
                                    <span>Tổng cộng:</span>
                                    <span className="text-teal-600">
                                        {totalAmountVND.toLocaleString('vi-VN')}{' '}
                                        VNĐ
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* PayPal Button Container */}
                        {selectedPaymentMethod === 'paypal' && (
                            <div
                                id="paypal-button-container"
                                className="mt-6"
                            />
                        )}
                        {/* Các nút hành động */}
                        <div className="flex justify-between mt-8 space-x-4">
                            {' '}
                            {/* Dùng flex và space-x để đặt các nút cạnh nhau */}
                            <button
                                onClick={handleGoBack}
                                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition-colors shadow-md"
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Quay
                                lại
                            </button>
                            <button
                                onClick={handleCancelPayment}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-500/30"
                            >
                                <i className="fas fa-times-circle mr-2"></i> Hủy
                                thanh toán
                            </button>
                            <button
                                onClick={handlePaymentSubmit}
                                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-teal-500/30"
                            >
                                <i className="fas fa-check-circle mr-2"></i> Xác
                                nhận thanh toán
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
