'use client';
import { useAuth } from '@/providers/auth_provider';
import { forceLogout } from '@/lib/authClient';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted before rendering client-specific content
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleForceLogout = async () => {
    await forceLogout();
    window.location.href = '/';
  };
  
  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) return null;
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const tokenCookie = cookies['token'];
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.name : 'null'}</div>
      <div>Token Cookie: {tokenCookie ? `${tokenCookie.substring(0, 10)}...` : 'not found'}</div>
      <div>Token Valid: {tokenCookie && tokenCookie !== 'undefined' && tokenCookie !== 'null' ? 'yes' : 'no'}</div>
      <div>Path: {window.location.pathname}</div>
      <div className="mt-2 text-xs space-y-1">
        <button 
          onClick={() => {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.reload();
          }}
          className="block w-full bg-red-600 px-2 py-1 rounded text-white hover:bg-red-700"
        >
          Clear Token
        </button>
        <button 
          onClick={handleForceLogout}
          className="block w-full bg-orange-600 px-2 py-1 rounded text-white hover:bg-orange-700"
        >
          Force Logout
        </button>
      </div>
    </div>
  );
}
