// app/auth/register/page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, verifyRegisterCode } from "@/lib/authClient";
import OtpInput from '@/components/common/OtpInput';

// --- COMPONENT MODAL CHÍNH SÁCH ---
import { X } from 'lucide-react';
const PolicyModal = ({ initialTab, onClose }: { initialTab: 'terms' | 'privacy', onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">Điều khoản & Chính sách</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500"><X size={20} /></button>
                </header>
                <div className="border-b border-slate-200 shrink-0">
                    <nav className="flex space-x-4 px-4">
                        <button onClick={() => setActiveTab('terms')} className={`py-3 px-1 text-sm font-semibold border-b-2 ${activeTab === 'terms' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Điều khoản Dịch vụ</button>
                        <button onClick={() => setActiveTab('privacy')} className={`py-3 px-1 text-sm font-semibold border-b-2 ${activeTab === 'privacy' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Chính sách Bảo mật</button>
                    </nav>
                </div>
                <div className="overflow-y-auto p-6 prose prose-slate max-w-none">
                    {activeTab === 'terms' ? (
                        <>
                            <h3>Điều khoản Dịch vụ của cleanNow</h3>
                            <p className="text-sm text-slate-500">Cập nhật lần cuối: 25/08/2025</p>
                            <p>Chào mừng bạn đến với cleanNow! Bằng việc sử dụng ứng dụng và dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.</p>
                            <h4>1. Phạm vi Dịch vụ</h4>
                            <p>cleanNow là một nền tảng công nghệ kết nối Khách hàng có nhu cầu dọn dẹp, vệ sinh nhà cửa với các Đối tác (Tasker) cung cấp dịch vụ. Chúng tôi không trực tiếp thực hiện công việc dọn dẹp mà chỉ đóng vai trò trung gian.</p>
                            <h4>2. Tài khoản Người dùng</h4>
                            <ul>
                                <li>Bạn cam kết cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản.</li>
                                <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập (mật khẩu, email) và hoàn toàn chịu trách nhiệm cho các hoạt động diễn ra từ tài khoản của mình.</li>
                            </ul>
                             <h4>3. Hành vi của Người dùng</h4>
                            <p>Bạn đồng ý không sử dụng dịch vụ cho các mục đích bất hợp pháp hoặc bị cấm bởi các điều khoản này. Bạn không được gây rối, lạm dụng, hoặc làm hại đến bất kỳ người dùng nào khác hoặc chính nền tảng.</p>
                            <h4>4. Sở hữu Trí tuệ</h4>
                            <p>Tất cả nội dung, logo, và các tài sản trí tuệ khác trên nền tảng cleanNow là tài sản của chúng tôi hoặc các bên cấp phép của chúng tôi. Bạn không được phép sao chép, phân phối hoặc tạo ra các sản phẩm phái sinh mà không có sự cho phép rõ ràng của chúng tôi.</p>
                            <h4>5. Chấm dứt tài khoản</h4>
                            <p>Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn bất kỳ lúc nào nếu bạn vi phạm các điều khoản này, mà không cần thông báo trước.</p>
                            <h4>6. Thay đổi Điều khoản</h4>
                            <p>Chúng tôi có thể sửa đổi các điều khoản này theo thời gian. Phiên bản mới nhất sẽ luôn được đăng tải trên trang web và ứng dụng của chúng tôi. Việc bạn tiếp tục sử dụng dịch vụ sau khi các thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới.</p>
                        </>
                    ) : (
                        <>
                            <h3>Chính sách Bảo mật của cleanNow</h3>
                            <p className="text-sm text-slate-500">Cập nhật lần cuối: 25/08/2025</p>
                            <p>cleanNow cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.</p>
                            <h4>1. Thông tin chúng tôi thu thập</h4>
                            <ul>
                                <li><strong>Thông tin bạn cung cấp:</strong> Họ tên, email, số điện thoại, địa chỉ, thông tin thanh toán khi bạn đăng ký và sử dụng dịch vụ.</li>
                                <li><strong>Thông tin sử dụng:</strong> Dữ liệu về cách bạn tương tác với ứng dụng, lịch sử đặt dịch vụ, đánh giá.</li>
                                <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành, và các thông tin kỹ thuật khác được thu thập tự động.</li>
                            </ul>
                            <h4>2. Cách chúng tôi sử dụng thông tin</h4>
                            <p>Thông tin của bạn được dùng để cung cấp và cải thiện dịch vụ, liên lạc với bạn về đơn đặt hàng và các chương trình khuyến mãi, cũng như để đảm bảo an toàn và an ninh cho nền tảng.</p>
                            <h4>3. Bảo mật Dữ liệu</h4>
                            <p>Chúng tôi áp dụng các biện pháp bảo mật vật lý, điện tử và thủ tục hợp lý để bảo vệ thông tin cá nhân của bạn. Tuy nhiên, không có phương thức truyền tải qua Internet hoặc lưu trữ điện tử nào là an toàn 100%.</p>
                            <h4>4. Lưu trữ Dữ liệu</h4>
                            <p>Chúng tôi sẽ lưu trữ thông tin cá nhân của bạn trong khoảng thời gian cần thiết để thực hiện các mục đích được nêu trong chính sách này, trừ khi pháp luật yêu cầu hoặc cho phép một khoảng thời gian lưu trữ dài hơn.</p>
                            <h4>5. Quyền riêng tư của trẻ em</h4>
                            <p>Dịch vụ của chúng tôi không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 18 tuổi.</p>
                            <h4>6. Liên hệ</h4>
                            <p>Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật này, vui lòng liên hệ với chúng tôi qua email: support@cleannow.com.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


const RegisterPage = () => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [policyOpen, setPolicyOpen] = useState(false);
    const [policyInitialTab, setPolicyInitialTab] = useState<'terms' | 'privacy'>('terms');
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
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
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
            try { console.debug('[Register] Backend response:', res); } catch {}
            const shouldGoOtp = !!(res && (res.needVerify || res?.uid || res?.message));
            if (shouldGoOtp) {
                setStep(2);
                setOtpDigits(Array(6).fill(""));
                if (res?.isExistingUser) {
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
                                Tôi đã đọc và đồng ý với <a href="#" onClick={(e) => { e.preventDefault(); setPolicyInitialTab('terms'); setPolicyOpen(true); }} className="font-semibold text-teal-500 hover:underline">Điều khoản</a> và <a href="#" onClick={(e) => { e.preventDefault(); setPolicyInitialTab('privacy'); setPolicyOpen(true); }} className="font-semibold text-teal-500 hover:underline">Chính sách Bảo mật</a>.
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
                            onResend={async () => {
                                setLoading(true);
                                setError("");
                                setMessage("");
                                try {
                                    const res = await registerUser(email, password, name, phone);
                                    if (res && res.needVerify) {
                                        setMessage(res.isExistingUser
                                            ? "Email đã tồn tại. Đã gửi lại mã xác thực để hoàn tất đăng nhập."
                                            : "Đã gửi lại mã xác thực về email. Vui lòng kiểm tra hộp thư.");
                                        setOtpDigits(Array(6).fill(""));
                                    }
                                } catch (err: any) {
                                    setError(err?.message || 'Không thể gửi lại mã xác thực.');
                                } finally {
                                    setLoading(false);
                                }
                            }}
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
            {policyOpen && (
                <PolicyModal initialTab={policyInitialTab} onClose={() => setPolicyOpen(false)} />
            )}
        </div>
    );
};

export default RegisterPage;

