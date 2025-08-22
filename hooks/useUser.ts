'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchProfile, updateProfile, uploadAvatar} from '@/lib/profileUser';
import { logoutUser, verifyToken } from '@/lib/authClient';

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
    (async () => {
      setLoading(true);
      try {
        const verified = await verifyToken().catch(() => null);
        if (mounted && verified && verified.user) {
          const roles = Array.isArray(verified.user.roles) ? verified.user.roles : [verified.user.roles || 'customer'];
          setUser({ ...verified.user, roles });
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore and fallback
      }

      // fallback to existing behavior
      try {
        await refetchProfile();
      } catch (e) {
        // refetchProfile handles setting user to null
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
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