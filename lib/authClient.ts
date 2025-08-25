import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '');

import fetchWithAuth from '@/lib/apiClient';
import { clearAuthTokens } from './authUtils';
import { logDev } from '@/lib/utils';

// const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || '';

// Xác thực mã đăng ký tài khoản
export async function verifyRegisterCode(email: string, code: string) {
  if (!API_BASE_URL) {
    console.warn('VERIFY_REGISTER_CODE: NEXT_PUBLIC_API_URL not set, using relative path');
  }

  const res = await fetchWithAuth(`${API_BASE_URL || ''}/api/auth/verify-register-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `Verify code failed: HTTP ${res.status}`);
  }

  return res.json();
}

// Đăng ký user với email và mật khẩu
export async function registerUser(email: unknown, password: unknown, name?: string, phone?: string) {
  const emailStr = String(email).trim();
  const passwordStr = String(password).trim();
  const nameStr = name ? String(name).trim() : '';
  const phoneStr = phone ? String(phone).trim() : '';
  
  if (!emailStr || !passwordStr) throw new Error('Email và mật khẩu là bắt buộc');

  try {
    const res = await fetchWithAuth(`${API_BASE_URL || ''}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        email: emailStr, 
        password: passwordStr,
        name: nameStr,
        phone: phoneStr
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const msg = errBody?.error || errBody?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error('registerUser failed:', error);
    throw error;
  }
}

// Đăng nhập user với email và mật khẩu
export async function loginUser(email: unknown, password: unknown) {
  const emailStr = String(email).trim();
  const passwordStr = String(password).trim();
  
  try {
    // Đăng nhập Firebase
    console.log('url:', `${API_BASE_URL}`);

    const result = await signInWithEmailAndPassword(auth, emailStr, passwordStr);
    
    const idToken = await result.user.getIdToken();
    
  // Lưu session vào backend (FE edge route sẽ mirror cookie từ BE)
  await saveSession(idToken);
    logDev('Session saved successfully');
    
    return idToken;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Đăng nhập với Google
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const idToken = await user.getIdToken();

  try {
    // Thử verify token trước
  await saveSession(idToken);
  let userData = await verifyToken(idToken).catch(() => null);
  if (!userData || !userData.user) {
    userData = await verifyToken(undefined, { force: true }).catch(() => null);
  }
    
    if (!userData || !userData.user) {
      // User chưa có trong database, tạo mới
      await registerGoogleUser({
        email: user.email!,
        name: user.displayName || user.email!,
        avatar: user.photoURL || '',
        firebaseId: user.uid
      });
      
  // Lưu session lại sau khi tạo user
  await saveSession(idToken);
  await verifyToken(undefined, { force: true }).catch(() => null);
    }
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
  
  return idToken;
}

// Helper function để đăng ký user từ Google
async function registerGoogleUser(userData: {
  email: string;
  name: string; 
  avatar: string;
  firebaseId: string;
}) {
  const response = await fetchWithAuth(`${API_BASE_URL || ''}/api/auth/google-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Đăng ký Google thất bại");
  }
  return response.json();
}

// Đăng xuất user
export async function logoutUser() {
  try {
    // sign out from Firebase to clear client auth state
    await signOut(auth);
    // request backend to delete the server session
    try {
      // call FE edge route to clear mirrored cookie and notify backend
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (e) {
      console.error('FE session delete failed:', e);
    }
    if (typeof window !== 'undefined') {
      try {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        clearAuthTokens(); // Clear
      } catch (e) {}
      try { localStorage.removeItem('token'); } catch (e) {}
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

// Force logout - clear tất cả auth state
export async function forceLogout() {
  try {
    // Clear backend session
    await fetch(`${API_BASE_URL}/api/auth/force-logout`, {
      method: "POST",
      credentials: "include",
    });
    
    // Clear Firebase auth
    await signOut(auth);
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    }
  } catch (error) {
    console.error("Force logout error:", error);
    // Vẫn clear local state
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
}

// Lưu session vào backend
export async function saveSession(idToken: string) {
  logDev('Saving session with token:', idToken.substring(0, 20) + '...');
  // Prefer calling FE edge route which will mirror backend Set-Cookie into FE cookie store
  const edgeUrl = '/api/auth/session';
  let response: Response | null = null;
  let backendResponse: Response | null = null;

  try {
    response = await fetch(edgeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include',
    });
    try { console.debug('[saveSession] FE edge POST status:', response.status); } catch {}
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('FE edge session route failed, falling back to backend:', e);
    }
  }
  // Always also call backend directly to ensure the browser stores the backend-domain cookie
  if (API_BASE_URL) {
    try {
      backendResponse = await fetch(`${API_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include',
      });
      try { console.debug('[saveSession] Backend POST status:', backendResponse.status); } catch {}
    } catch (e) {
      console.warn('Direct backend save session failed (non-fatal):', e);
    }
  }
  
  const effective = backendResponse && backendResponse.ok ? backendResponse : response;
  if (!effective) throw new Error('Save session failed: no response');

  logDev('Save session response status:', effective.status);

  if (!effective.ok) {
    const errorText = await effective.text().catch(() => '');
    console.error('Save session failed:', errorText);
    throw new Error(errorText || "Failed to save session");
  }
  
  const result = await effective.json().catch(() => ({}));
  logDev('Session saved successfully:', result);
  console.log('Session saved successfully:', result);
  return result;
}

// Verify token và lấy thông tin user từ backend
let __inFlightVerify: Promise<any> | null = null;
let __lastVerifyAt = 0;
let __lastVerifyResult: any | null = null;

export async function verifyToken(passedIdToken?: string, opts?: { force?: boolean }) {
  try {
    logDev('VerifyToken: Starting verification...');
  const urlBackend = API_BASE_URL ? `${API_BASE_URL}/api/auth/verify` : '';
  const urlEdge = '/api/auth/verify';

    // Coalesce concurrent calls and throttle if recently verified
    if (!opts?.force && !passedIdToken) {
      if (__inFlightVerify) {
        logDev('VerifyToken: Using in-flight request');
        return __inFlightVerify;
      }
      const now = Date.now();
      if (__lastVerifyResult && now - __lastVerifyAt < 3000) {
        logDev('VerifyToken: Returning recent cached result');
        return __lastVerifyResult;
      }
    }

    const doRequest = async (tokenForHeader?: string, bust?: boolean) => {
      const headers: HeadersInit = {};
      if (tokenForHeader) headers['Authorization'] = `Bearer ${tokenForHeader}`;
      // Try backend first if configured, else use edge; fallback on 404/Network
      const target = urlBackend || urlEdge;
      const finalUrl = bust ? `${target}${target.includes('?') ? '&' : '?'}_ts=${Date.now()}` : target;
      let resp: Response;
      try {
        resp = await fetch(finalUrl, { method: 'GET', headers, credentials: 'include', cache: 'no-store' });
        if (resp.status === 404 && target === urlBackend) {
          // Fallback to edge
          const edgeUrl = bust ? `${urlEdge}?_ts=${Date.now()}` : urlEdge;
          resp = await fetch(edgeUrl, { method: 'GET', headers, credentials: 'include', cache: 'no-store' });
        }
      } catch (e) {
        // Network issue, try edge as last resort
        const edgeUrl = bust ? `${urlEdge}?_ts=${Date.now()}` : urlEdge;
        resp = await fetch(edgeUrl, { method: 'GET', headers, credentials: 'include', cache: 'no-store' });
      }
      try {
        const authPrev = headers['Authorization'] ? String(headers['Authorization']).slice(0, 27) + '...' : 'none';
        console.debug('[verifyToken] GET', finalUrl, 'status:', resp.status, 'auth:', authPrev);
      } catch {}
      return resp;
    };

    let tokenToUse = passedIdToken;
    if (!tokenToUse && auth?.currentUser) {
      try { tokenToUse = await auth.currentUser.getIdToken(); } catch {}
      if (!tokenToUse) {
        try { tokenToUse = await auth.currentUser.getIdToken(true); } catch {}
      }
    }

    const exec = async () => {
      let response = await doRequest(tokenToUse);
      if (response.status === 304) {
        // Fallback: retry with cache-busting query & no-store
        response = await doRequest(tokenToUse, true);
      }
      if (response.status === 401 && auth?.currentUser) {
        try {
          const refreshed = await auth.currentUser.getIdToken(true);
          response = await doRequest(refreshed);
          if (response.status === 304) {
            response = await doRequest(refreshed, true);
          }
        } catch {}
      }
      return response;
    };

    // Mark in-flight to coalesce concurrent calls
    if (!opts?.force && !passedIdToken) {
      __inFlightVerify = exec();
    }

    let response = await (__inFlightVerify || exec());
    if (response.status === 304) {
      // Fallback: retry with cache-busting query & no-store
      response = await doRequest(tokenToUse, true);
    }
  // clear in-flight
  __inFlightVerify = null;

    logDev('VerifyToken: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logDev('VerifyToken: Error response:', errorData);
      if (response.status === 401) {
        throw new Error(errorData.error || 'No token provided');
      }
      throw new Error("Failed to verify token");
    }

    const result = await response.json();
    logDev('VerifyToken: Success, got user:', !!result.user);
  // cache result briefly
  __lastVerifyAt = Date.now();
  __lastVerifyResult = result;
    return result;
  } catch (networkError) {
  __inFlightVerify = null;
    if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
      throw new Error("Network error - cannot reach authentication server");
    }
    throw networkError;
  }
}

// Sync user với database
export async function syncUserToDatabase(firebaseUser: User) {
  try {
    logDev('Syncing user to database:', firebaseUser.uid);
    // fetchWithAuth will attach Authorization header when client Firebase token exists
    const response = await fetchWithAuth('/api/auth/sync-user', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      }),
    });
    
    logDev('Sync response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('User sync failed:', {
        status: response.status,
        error: errorData
      });
      return null;
    }
    
    const data = await response.json();
    logDev('User sync successful:', {
      hasUser: !!data.user,
      userId: data.user?.id,
      userName: data.user?.name
    });
    return data;
  } catch (error) {
    console.error("User sync network error:", error);
    return null;
  }
}

// Gửi mã xác thực về email
export async function sendResetCode(email: string) {
  const res = await fetch(`${API_BASE_URL}/api/forgot-password/send-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Xác thực code
export async function verifyResetCode(email: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/api/forgot-password/verify-reset-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!response.ok) throw new Error("Mã xác thực không đúng hoặc hết hạn");
  return response.json(); // { token }
}

// Đổi mật khẩu
export async function resetPassword(email: string, token: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/forgot-password/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, password }),
  });
  if (!response.ok) throw new Error("Không thể đổi mật khẩu");
  return response.json();
}