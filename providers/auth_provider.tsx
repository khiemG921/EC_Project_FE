"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { verifyToken, logoutUser } from '../lib/authClient';
import fetchWithAuth from '@/lib/apiClient';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { logDev } from '@/lib/utils';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Đảm bảo component đã mount trên client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function để clear invalid tokens
  const clearInvalidAuth = () => {
    if (typeof window !== 'undefined') {
      // Clear cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Clear localStorage if any
      localStorage.removeItem('token');
    }
    setUser(null);
  };

  // Theo dõi trạng thái auth từ Firebase
  useEffect(() => {
    if (!mounted) return; // Chỉ chạy khi đã mounted trên client

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      logDev('Firebase auth state changed:', firebaseUser ? 'logged in' : 'logged out');
      
      // Check if we're on auth pages (login/register) to avoid unnecessary token verification
      const isAuthPage = typeof window !== 'undefined' && 
        (window.location.pathname.includes('/auth/') || 
         window.location.pathname.includes('/register') || 
         window.location.pathname.includes('/login'));
      
      if (firebaseUser) {
        try {
          // Đảm bảo Firebase user đã được authenticate hoàn toàn
          const idToken = await firebaseUser.getIdToken(false);
          if (!idToken) {
            logDev('No valid ID token available');
            setUser(null);
            setLoading(false);
            return;
          }

          // Verify token và lấy thông tin user từ backend
          const userData = await verifyToken();
          // console.log('User data from backend:', userData);
          
          if (userData && userData.user) {
            setUser(userData.user);
          } else {
            logDev('No user data from backend, attempting to sync...');
            
            // Thử sync user từ Firebase sang database
            try {
              const syncResponse = await fetchWithAuth('/api/auth/sync-user', { method: 'POST' });
              
              if (syncResponse.ok) {
                console.log('User synced successfully, retrying verification...');
                const retryUserData = await verifyToken();
                if (retryUserData && retryUserData.user) {
                  setUser(retryUserData.user);
                } else {
                  logDev('Still no user data after sync, clearing auth');
                  clearInvalidAuth();
                }
              } else {
                logDev('Sync failed, clearing invalid auth');
                clearInvalidAuth();
              }
            } catch (syncError) {
              console.error('Sync error:', syncError);
              clearInvalidAuth();
            }
          }
        } catch (error) {
          // Chỉ log error, không throw để tránh crash UI
          logDev('Auth verification issue:', error instanceof Error ? error.message : 'Unknown error');
          
          // Xử lý các loại lỗi khác nhau
          if (error instanceof Error) {
            if (error.message.includes('No token') || error.message.includes('No authentication')) {
              logDev('User not authenticated - normal for registration/login pages');
              setUser(null);
            } else if (error.message === 'Failed to verify token') {
              logDev('Token verification failed - clearing invalid auth');
              clearInvalidAuth();
            } else {
              logDev('Other authentication error:', error.message);
              setUser(null);
            }
          } else {
            logDev('Unknown authentication error');
            setUser(null);
          }
        }
      } else {
        logDev('No firebase user, clearing auth');
        clearInvalidAuth();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mounted]); // Depend on mounted state

  // Hàm login - nhận user data và token từ login form
  const login = (userData: User, token: string) => {
    setUser(userData);
  };

  // Hàm logout
  const logout = async () => {
    try {
      await logoutUser();
      clearInvalidAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn clear local state nếu có lỗi
      clearInvalidAuth();
    }
  };

  // Hàm refresh user data từ backend
  const refreshUser = async () => {
    try {
      const userData = await verifyToken();
      if (userData && userData.user) {
        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  // Render nothing until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, loading: true, login, logout, refreshUser }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
