"use client";
import React, { useState, useEffect, useRef } from "react";
import OtpInput from '@/components/common/OtpInput';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [otpErrorCount, setOtpErrorCount] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);

  // Thời gian hết hạn OTP (2 phút)
  const OTP_EXPIRE = 120;
  const [countdown, setCountdown] = useState(OTP_EXPIRE);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Khi gửi mã, bắt đầu đếm ngược
  useEffect(() => {
    if (emailSent && !codeVerified) {
      setCountdown(OTP_EXPIRE);
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [emailSent, codeVerified, resendCount]);

  // Xác thực OTP
  async function handleVerifyOtp(otp: string) {
    setLoading(true);
    setMessage("");
    try {
      const { token } = await import("@/lib/authClient").then(m => m.verifyResetCode(email, otp));
      setToken(token);
      setCodeVerified(true);
      setStep(3);
      setMessage("Mã xác thực đúng. Bạn có thể đặt lại mật khẩu.");
    } catch (err: any) {
      setOtpDigits(Array(6).fill(""));
      setMessage("Mã xác thực không đúng hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  }

  // Gửi mã xác thực
  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await import("@/lib/authClient").then(m => m.sendResetCode(email));
      setMessage("Đã gửi mã xác thực về email.");
      setEmailSent(true);
      setStep(2);
      setOtpDigits(Array(6).fill(""));
      setOtpErrorCount(0);
      setResendCount(0);
      setResendLocked(false);
    } catch (err: any) {
      setMessage(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  // Gửi lại mã
  async function handleResendCode(e: React.MouseEvent) {
    e.preventDefault();
    if (resendCount >= 3) {
      setResendLocked(true);
      setMessage("Bạn đã gửi lại mã quá số lần cho phép. Vui lòng thử lại sau 24 giờ.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await import("@/lib/authClient").then(m => m.sendResetCode(email));
      setMessage("Đã gửi lại mã xác thực về email.");
      setCountdown(OTP_EXPIRE);
      setStep(2);
      setOtpDigits(Array(6).fill(""));
      setOtpErrorCount(0);
      setResendCount(resendCount + 1);
    } catch (err: any) {
      setMessage(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  // Xác thực mã OTP
  async function verifyOtp(otp: string) {
    if (!email) {
      setMessage("Vui lòng nhập email trước.");
      return;
  }
    setLoading(true);
    setMessage("");

    try {
      const { token } = await import("@/lib/authClient").then(m => m.verifyResetCode(email, otp));
      setToken(token);
      setCodeVerified(true);
      setStep(3);
      setMessage("Mã xác thực đúng. Bạn có thể đặt lại mật khẩu.");
    } catch (err: any) {
      setOtpErrorCount(prev => prev + 1);
      setOtpDigits(Array(6).fill(""));
      if (otpErrorCount + 1 >= 5) {
        setMessage("Bạn đã nhập sai quá số lần cho phép. Vui lòng gửi lại mã mới.");
        setCountdown(0);
      } else {
        setMessage("Mã xác thực không đúng hoặc đã hết hạn.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Đổi mật khẩu
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await import("@/lib/authClient").then(m => m.resetPassword(email, token, password));
      setMessage("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");
      setTimeout(() => window.location.href = "/auth/login", 2000);
    } catch (err: any) {
      setMessage(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  function formatCountdown(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-teal-500 text-center mb-2">Quên mật khẩu</h1>
        <p className="text-center text-slate-600 mb-8">Nhập email để nhận mã xác thực và đặt lại mật khẩu.</p>
        <form className="space-y-5" onSubmit={handleSendEmail}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={emailSent}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              placeholder="Nhập email"
            />
            <button
              type="submit"
              disabled={loading || emailSent || !email}
              className={`w-full mt-3 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/30 ${emailSent ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Gửi mã xác thực
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-lg text-teal-600 font-semibold">{message}</p>
        )}

        {/* OTP input */}
        {emailSent && !codeVerified && (
          <div className="space-y-5 mt-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Mã xác thực (OTP)</label>
            <OtpInput
              value={otpDigits}
              onChange={setOtpDigits}
              onVerify={handleVerifyOtp}
              onResend={async () => { await handleResendCode({} as any); }}
              disabled={loading}
              expireSeconds={120}
              resendLimit={3}
              loading={loading}
            />
          </div>
        )}

        {/* Password input chỉ xuất hiện khi đã xác thực mã */}
        {codeVerified && (
          <form className="space-y-5 mt-2" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/30"
            >
              Đổi mật khẩu
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600 mt-8">
          <a href="/auth/login" className="font-bold text-teal-500 hover:underline">Quay lại đăng nhập</a>
        </p>
      </div>
    </div>
  );
}