import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  User,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import fetchWithAuth from '@/lib/apiClient';
import { clearAuthTokens } from './authUtils';

const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || '';

// Xác thực mã đăng ký tài khoản
export async function verifyRegisterCode(email: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-register-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!response.ok) throw new Error("Mã xác thực không đúng hoặc hết hạn");
  return response.json();
}

// Đăng ký user với email và mật khẩu
export async function registerUser(email: unknown, password: unknown, name?: string, phone?: string) {
  const emailStr = String(email).trim();
  const passwordStr = String(password).trim();
  const nameStr = name ? String(name).trim() : '';
  const phoneStr = phone ? String(phone).trim() : '';
  
  console.log('Starting registration for:', emailStr);
  
  try {
    // Gọi backend để đăng ký - backend sẽ tạo Firebase user và gửi OTP
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: emailStr, 
        password: passwordStr,
        name: nameStr,
        phone: phoneStr
      }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Đăng ký thất bại");
    }
    
    const result = await response.json();
    console.log('Registration response:', result);
    return result;
    
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Đăng nhập user với email và mật khẩu
export async function loginUser(email: unknown, password: unknown) {
  const emailStr = String(email).trim();
  const passwordStr = String(password).trim();
  
  console.log('Login attempt for:', emailStr);
  
  try {
    // Đăng nhập Firebase
    const result = await signInWithEmailAndPassword(auth, emailStr, passwordStr);
    console.log('Firebase login successful:', result.user.uid);
    
    const idToken = await result.user.getIdToken();
    console.log('Got Firebase token:', idToken.substring(0, 20) + '...');
    
    // Lưu session vào backend
  await saveSession(idToken);
    console.log('Session saved successfully');
    
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
  
  // Kiểm tra xem user đã có trong database chưa
  // Nếu chưa thì tạo mới (tương tự register)
  try {
    // Thử verify token trước
    await saveSession(idToken);
    const userData = await verifyToken();
    
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
  const response = await fetch(`${API_BASE_URL}/api/auth/google-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    credentials: "include",
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
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (e) {
      // ignore FE route errors but log for debugging
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
  console.log('Saving session with token:', idToken.substring(0, 20) + '...');
  
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include',
    });
  
  console.log('Save session response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Save session failed:', errorText);
    throw new Error("Failed to save session");
  }
  
  const result = await response.json();
  console.log('Session saved successfully:', result);
  return result;
}

// Verify token và lấy thông tin user từ backend
export async function verifyToken(passedIdToken?: string) {
  try {
    // Lấy Firebase token nếu user đã đăng nhập
    let headers: HeadersInit = {};

    console.log('VerifyToken: Starting verification...');
    console.log('VerifyToken: auth.currentUser:', !!auth.currentUser);

    const doRequest = async (tokenForHeader?: string) => {
      const h: HeadersInit = { ...headers };
      if (tokenForHeader) {
        h['Authorization'] = `Bearer ${tokenForHeader}`;
      }
      console.log('VerifyToken: Making request to backend...');
      const resp = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "GET",
        headers: h,
        credentials: "include",
      });
      console.log('VerifyToken: Response status:', resp.status);
      return resp;
    };

    let tokenToUse = passedIdToken;

    // Acquire token if not supplied
    if (!tokenToUse) {
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          tokenToUse = token;
          console.log('VerifyToken: Got Firebase token, length:', token.length);
        } catch (tokenError) {
          console.log('VerifyToken: Could not get Firebase token (will try force refresh):', tokenError);
          // Try force refresh once
          try {
            const refreshed = await auth.currentUser.getIdToken(true);
            tokenToUse = refreshed;
            console.log('VerifyToken: Got refreshed Firebase token, length:', refreshed.length);
          } catch (refreshErr) {
            console.log('VerifyToken: Failed to force refresh token:', refreshErr);
          }
        }
      } else {
        console.log('VerifyToken: No Firebase user logged in');
      }
    }

    // First attempt
    let response = await doRequest(tokenToUse);

    // If unauthorized and we have a firebase user, try to force refresh and retry once
    if (response.status === 401 && auth.currentUser) {
      try {
        console.log('VerifyToken: 401 received, attempting token force refresh and retry...');
        const refreshed = await auth.currentUser.getIdToken(true);
        tokenToUse = refreshed;
        response = await doRequest(tokenToUse);
      } catch (retryErr) {
        console.log('VerifyToken: Retry failed to get refreshed token:', retryErr);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('VerifyToken: Error response:', errorData);
      if (response.status === 401) {
        throw new Error(errorData.error || "No authentication token");
      }
      throw new Error("Failed to verify token");
    }

    const result = await response.json();
    console.log('VerifyToken: Success, got user:', !!result.user);
    return result;
  } catch (networkError) {
    // Handle network errors gracefully
    if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
      throw new Error("Network error - cannot reach authentication server");
    }
    throw networkError;
  }
}

// Lấy thông tin dashboard từ backend
export async function getDashboardData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    return response.json();
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    throw error;
  }
}

// Sync user với database
export async function syncUserToDatabase(firebaseUser: User) {
  try {
    console.log('Syncing user to database:', firebaseUser.uid);
    const token = await firebaseUser.getIdToken();
    console.log('Got Firebase token for sync');
    
  const response = await fetchWithAuth('/api/auth/sync-user', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      }),
    });
    
    console.log('Sync response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('User sync failed:', {
        status: response.status,
        error: errorData
      });
      return null;
    }
    
    const data = await response.json();
    console.log('User sync successful:', {
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