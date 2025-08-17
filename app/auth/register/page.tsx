// app/auth/register/page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, verifyRegisterCode } from "@/lib/authClient";
import OtpInput from '@/components/common/OtpInput';

const RegisterPage = () => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [step, setStep] = useState(1); // 1: form, 2: otp
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
    const [otpError, setOtpError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(120);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (step === 2) {
            setCountdown(120);
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [step]);

    function formatCountdown(sec: number) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await registerUser(email, password, name, phone);
            if (res.needVerify) {
                setStep(2);
                setOtpDigits(Array(6).fill(""));
                if (res.isExistingUser) {
                    setMessage("Email đã tồn tại. Đã gửi mã xác thực để hoàn tất đăng nhập.");
                } else {
                    setMessage("Đã gửi mã xác thực về email. Vui lòng kiểm tra hộp thư.");
                }
            } else {
                alert("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
                router.push("/auth/login");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Đăng ký thất bại";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    // Xử lý nhập OTP 
    async function handleVerifyOtp(otp: string) {
        setLoading(true);
        setOtpError("");
        try {
            await verifyRegisterCode(email, otp);
            setMessage("Xác thực thành công! Đang chuyển về trang đăng nhập...");
            setTimeout(() => router.push("/auth/login"), 1500);
        } catch (err: any) {
            setOtpError("Mã xác thực không đúng hoặc đã hết hạn.");
            setOtpDigits(Array(6).fill(""));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550181519-946b12b1e1a4?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-teal-500 text-center mb-2">Tạo tài khoản</h1>
                <p className="text-center text-slate-600 mb-8">Bắt đầu khám phá CleanNow.</p>
                {step === 1 && (
                    <form onSubmit={handleRegister} autoComplete="off" className="space-y-4">
                        <div>
                            <input 
                                type="text" 
                                placeholder="Họ và tên" 
                                required 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </div>
                        <div>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                required 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"  
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>
                        <div>
                            <input 
                                type="tel" 
                                placeholder="Số điện thoại (tùy chọn)" 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                            />
                        </div>
                        <div>
                            <input 
                                type="password" 
                                placeholder="Mật khẩu" 
                                required 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-600">
                                Tôi đã đọc và đồng ý với <a href="#" className="font-semibold text-teal-500 hover:underline">Điều khoản</a> và <a href="#" className="font-semibold text-teal-500 hover:underline">Chính sách Bảo mật</a>.
                            </label>
                        </div>
                        <button 
                            type="submit"
                            disabled={!termsAccepted || loading}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/30 transform hover:scale-105 disabled:bg-slate-300 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                        </button>
                        {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
                        {message && <p className="text-teal-600 text-center text-sm mt-2">{message}</p>}
                    </form>
                )}
                {step === 2 && (
                    <div className="space-y-5 mt-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Mã xác thực (OTP) đã gửi về email</label>
                        <OtpInput
                            value={otpDigits}
                            onChange={setOtpDigits}
                            onVerify={handleVerifyOtp}
                            onResend={undefined}
                            disabled={loading}
                            expireSeconds={120}
                            resendLimit={3}
                            loading={loading}
                            error={otpError}
                        />
                        {message && <p className="text-teal-600 text-center font-semibold">{message}</p>}
                    </div>
                )}
                <p className="text-center text-sm text-slate-600 mt-8">
                    Đã có tài khoản? <a href="/auth/login" className="font-bold text-teal-500 hover:underline">Đăng nhập</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

