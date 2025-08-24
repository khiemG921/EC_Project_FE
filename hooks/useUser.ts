'use client';
import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { fetchProfile, updateProfile, uploadAvatar } from '@/lib/profileUser';
import { logoutUser, verifyToken } from '@/lib/authClient';
import { logDev } from '@/lib/utils';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hàm refetch profile
  const refetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProfile();
      const roles = Array.isArray(data.roles) ? data.roles : [data.roles || 'customer'];
      setUser({ ...data, roles });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const hasCookieToken = () =>
      typeof document !== 'undefined' && (document.cookie || '').includes('token=');

    // Core verify routine
    const doVerify = async (idToken?: string) => {
      try {
        const verified = await verifyToken(idToken).catch(() => null);
        if (!mounted) return;
        if (verified && verified.user) {
          const vuser = verified.user || {};
          const roles = Array.isArray(vuser.roles) ? vuser.roles : [vuser.roles || 'customer'];
          setUser({
            ...vuser,
            roles,
            avatar: vuser.avatar,
            dob: vuser.date_of_birth || vuser.dob || undefined,
            gender: vuser.gender || undefined,
            address: vuser.address || undefined,
          });
        } else {
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Subscribe to Firebase auth changes for immediate updates
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      logDev('useUser onAuthStateChanged:', !!firebaseUser);
      if (!mounted) return;
      setLoading(true);
      if (firebaseUser) {
        let token: string | undefined;
        try { token = await firebaseUser.getIdToken(false); } catch {}
        if (!token) { try { token = await firebaseUser.getIdToken(true); } catch {} }
        await doVerify(token);
      } else if (hasCookieToken()) {
        // No Firebase user, but we have a session cookie (server-verified)
        await doVerify();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // On first mount, if we already have a cookie but no Firebase event yet, verify once
    if (!auth?.currentUser && hasCookieToken()) {
      doVerify();
    }

    return () => {
      mounted = false;
      try { unsub(); } catch {}
    };
  }, [refetchProfile]);

  // Khi update profile thành công, refetch lại
  const saveProfile = async (data: any) => {
    try {
      await updateProfile(data);
      // Chỉ refetch nếu update thành công
      await refetchProfile();
    } catch (error) {
      console.error('Error in saveProfile:', error);
      // Re-throw error để component có thể handle
      throw error;
    }
  };

  // Hàm upload avatar
  const saveAvatar = useCallback(async (file: File) => {
    const url = await uploadAvatar(file);
    // Optimistically update local state for instant UI feedback
  setUser((prev: any) => (prev ? { ...prev, avatar: url, avatar_url: url } : prev));
    // Then refetch to stay in sync with server
    await refetchProfile();
    return url;
  }, [refetchProfile]);

  // Khi logout, xóa user info
  const logout = async () => {
    await logoutUser();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  };

  return { user, setUser, loading, saveProfile, saveAvatar, logoutUser: logout, refetchProfile };
}