// app/auth/login/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, loginWithGoogle, verifyToken } from "@/lib/authClient";

const slides = [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1627916575235-3bb591a350de?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544143436-39a341b3a16b?q=80&w=1974&auto=format&fit=crop",
];

const LoginPage = () => {
    const [slideIndex, setSlideIndex] = useState(0);
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            console.log('Starting login process...');
            // Đăng nhập qua Firebase
            const token = await loginUser(email, password);
            console.log('Login successful, verifying backend session...');
            // rely on Firebase auth state
            // Ensure backend session is set and valid before navigating (prevents middleware redirect)
            try {
                // retry a few times because browser may need a tick to accept cookie
                const waitForVerify = async (retries = 6, delay = 300) => {
                    let lastErr: any = null;
                    for (let i = 0; i < retries; i++) {
                        try {
                            const res = await verifyToken();
                            return res;
                        } catch (err) {
                            lastErr = err;
                            await new Promise(r => setTimeout(r, delay));
                        }
                    }
                    throw lastErr;
                };

                const verifyResult = await waitForVerify();
                console.log('Backend verify result:', verifyResult);
                router.push('/dashboard');
            } catch (verifyErr) {
                console.error('Backend verification failed after login:', verifyErr);
                setError('Đăng nhập thành công nhưng không thể xác thực phiên. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Đăng nhập thất bại: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    // Nếu muốn test Google login mock, có thể dùng logic tương tự:
    async function handleGoogleLogin() {
        // Nếu muốn test Google login thật, có thể gọi loginWithGoogle ở đây
        const token = await loginWithGoogle();
        // Sau khi thành công, set user = MOCK_USER
        router.push('/dashboard');
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Panel - Image Slider */}
            <div className="hidden lg:flex flex-col flex-1 relative bg-slate-900">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
                        style={{ backgroundImage: `url(${slide})`, opacity: slideIndex === index ? 1 : 0 }}
                    />
                ))}
                <div className="relative flex flex-col justify-end h-full p-12 bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h2 className="text-4xl font-bold mb-4">Dọn dẹp chuyên nghiệp. Cuộc sống thảnh thơi.</h2>
                    <p className="text-lg text-slate-300">Giao phó việc nhà, tận hưởng thời gian cho riêng bạn.</p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
                <div className="w-full max-w-sm">
                    <h1 className="text-3xl font-bold text-teal-500 text-center mb-2">cleanNow</h1>
                    <p className="text-center text-slate-600 mb-8">Chào mừng bạn trở lại!</p>

                    <form onSubmit={handleLogin} action="#" method="post" autoComplete="off" className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder="email@example.com" 
                                required 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">Mật khẩu</label>
                                <a href="/auth/forgot-password" className="text-sm text-teal-500 hover:underline">Quên mật khẩu?</a>
                            </div>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="••••••••" 
                                required 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/30 transform hover:scale-105 disabled:hover:scale-100"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-slate-200" />
                        <span className="mx-4 text-sm text-slate-400">hoặc</span>
                        <hr className="flex-grow border-slate-200" />
                    </div>

                    <button 
                        onClick={handleGoogleLogin} 
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-100 disabled:bg-slate-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/24px-Google_%22G%22_logo.svg.png" alt="Google" className="w-5 h-5" />
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
                    </button>

                    <p className="text-center text-sm text-slate-600 mt-8">
                        Chưa có tài khoản? <a href="/auth/register" className="font-bold text-teal-500 hover:underline">Tạo tài khoản ngay</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

