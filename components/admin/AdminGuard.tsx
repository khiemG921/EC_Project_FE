'use client';

import React, { useEffect, useState } from 'react';
import { loginUser, verifyToken as verifyBackendToken, logoutUser } from '@/lib/authClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminSidebar from './AdminSidebar';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [checking, setChecking] = useState(true);

    // verify existing session cookie
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const result = await verifyBackendToken();
                const roles: string[] = result?.user?.roles || [];
                const hasAdmin = Array.isArray(roles) && roles.includes('admin');
                if (!mounted) return;
                if (hasAdmin) {
                    setIsAdmin(true);
                    setShowLoginForm(false);
                } else {
                    setShowLoginForm(true);
                    setIsAdmin(false);
                }
            } catch {
                if (!mounted) return;
                setShowLoginForm(true);
                setIsAdmin(false);
            } finally {
                if (mounted) setChecking(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Real login handler via Firebase -> save backend session cookie
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            if (!loginForm.email || !loginForm.password) {
                setLoginError('Vui lòng nhập email và mật khẩu');
                return;
            }

            // Login with Firebase and persist session cookie in backend
            await loginUser(loginForm.email, loginForm.password);

            // Verify session and role
            try {
                const result = await verifyBackendToken();
                const roles: string[] = result?.user?.roles || [];
                if (!Array.isArray(roles) || !roles.includes('admin')) {
                    setLoginError('Tài khoản không có quyền admin.');
                    return;
                }
            } catch (err) {
                setLoginError('Phiên đăng nhập không hợp lệ.');
                return;
            }

            setIsAdmin(true);
            setShowLoginForm(false);
            setLoginError('');
        } catch (error) {
            console.error('Admin login error:', error);
            setLoginError('Đăng nhập thất bại, vui lòng kiểm tra thông tin.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser(); // xóa cookie trên backend
        } catch (e) {
            console.error("Admin logout failed:", e);
        } finally {
            // existing client-only cleanup
            setIsAdmin(false);
            setShowLoginForm(true);
            setLoginForm({ email: '', password: '' });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // While verifying, show a neutral loader to avoid flashing the login screen
    if (checking) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-slate-600 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    <span>Đang kiểm tra phiên đăng nhập…</span>
                </div>
            </div>
        );
    }

    // Show login form if not authenticated (after verification completes)
    if (showLoginForm || !isAdmin) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">🔐 Admin Login</h1>
                        <p className="text-gray-600 mt-2">Authentication - Enter credentials</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <Input
                                type="email"
                                name="email"
                                value={loginForm.email}
                                onChange={handleInputChange}
                                placeholder="admin@example.com"
                                required
                                disabled={loginLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu
                            </label>
                            <Input
                                type="password"
                                name="password"
                                value={loginForm.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                required
                                disabled={loginLoading}
                            />
                        </div>

                        {loginError && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                                {loginError}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            disabled={loginLoading}
                        >
                            {loginLoading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Đang đăng nhập...
                                </div>
                            ) : (
                                '🚀 Đăng nhập'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // Show admin panel if authenticated
    return (
        <div className="relative min-h-screen bg-gray-100">
            {/* Fixed Sidebar overlay */}
            <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <AdminSidebar onLogout={handleLogout} />
            </div>
            {/* Backdrop when open on small screens */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-30 lg:hidden" />
            )}
            {/* Floating menu button (appears when sidebar is closed) */}
            {!sidebarOpen && (
                <Button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-20 rounded-full shadow-md bg-white text-slate-700 hover:bg-slate-100"
                    size="sm"
                    variant="outline"
                    aria-label="Mở menu"
                >
                    <i className="fas fa-bars"></i>
                </Button>
            )}
            {/* Page content - padded, not pushed */}
            <main className="relative z-10 p-4 sm:p-6 max-w-[1400px] mx-auto">
                {children}
            </main>
        </div>
    );
}
