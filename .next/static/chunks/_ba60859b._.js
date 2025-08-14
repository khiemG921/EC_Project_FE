(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/firebase.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "auth": (()=>auth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__getAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index-35c79a8a.js [app-client] (ecmascript) <export p as getAuth>");
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyB8Ij8TFuuARHHkifXUriV0J4K8U1t8p9s"),
    authDomain: ("TURBOPACK compile-time value", "ec-project-5fc99.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "ec-project-5fc99")
};
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initializeApp"])(firebaseConfig);
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__getAuth$3e$__["getAuth"])(app);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/authClient.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Xác thực mã đăng ký tài khoản
__turbopack_context__.s({
    "forceLogout": (()=>forceLogout),
    "getDashboardData": (()=>getDashboardData),
    "loginUser": (()=>loginUser),
    "loginWithGoogle": (()=>loginWithGoogle),
    "logoutUser": (()=>logoutUser),
    "registerUser": (()=>registerUser),
    "resetPassword": (()=>resetPassword),
    "saveSession": (()=>saveSession),
    "sendResetCode": (()=>sendResetCode),
    "syncUserToDatabase": (()=>syncUserToDatabase),
    "verifyRegisterCode": (()=>verifyRegisterCode),
    "verifyResetCode": (()=>verifyResetCode),
    "verifyToken": (()=>verifyToken)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__ac__as__signInWithEmailAndPassword$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index-35c79a8a.js [app-client] (ecmascript) <export ac as signInWithEmailAndPassword>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Y__as__GoogleAuthProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index-35c79a8a.js [app-client] (ecmascript) <export Y as GoogleAuthProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__d__as__signInWithPopup$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index-35c79a8a.js [app-client] (ecmascript) <export d as signInWithPopup>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__signOut$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index-35c79a8a.js [app-client] (ecmascript) <export D as signOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [app-client] (ecmascript)");
async function verifyRegisterCode(email, code) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-register-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            code
        })
    });
    if (!response.ok) throw new Error("Mã xác thực không đúng hoặc hết hạn");
    return response.json();
}
;
;
// Base URL cho backend API
const API_BASE_URL = ("TURBOPACK compile-time value", "https://ecprojectbe-production.up.railway.app");
async function registerUser(email, password, name, phone) {
    const emailStr = String(email).trim();
    const passwordStr = String(password).trim();
    const nameStr = name ? String(name).trim() : '';
    const phoneStr = phone ? String(phone).trim() : '';
    console.log('Starting registration for:', emailStr);
    try {
        // Gọi backend để đăng ký - backend sẽ tạo Firebase user và gửi OTP
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailStr,
                password: passwordStr,
                name: nameStr,
                phone: phoneStr
            }),
            credentials: "include"
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
async function loginUser(email, password) {
    const emailStr = String(email).trim();
    const passwordStr = String(password).trim();
    console.log('Login attempt for:', emailStr);
    try {
        // Đăng nhập Firebase
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__ac__as__signInWithEmailAndPassword$3e$__["signInWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], emailStr, passwordStr);
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
async function loginWithGoogle() {
    const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Y__as__GoogleAuthProvider$3e$__["GoogleAuthProvider"]();
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__d__as__signInWithPopup$3e$__["signInWithPopup"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], provider);
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
                email: user.email,
                name: user.displayName || user.email,
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
async function registerGoogleUser(userData) {
    const response = await fetch(`${API_BASE_URL}/api/auth/google-register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData),
        credentials: "include"
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Đăng ký Google thất bại");
    }
    return response.json();
}
async function logoutUser() {
    try {
        // Xóa session từ backend
        await fetch(`${API_BASE_URL}/api/auth/session`, {
            method: "DELETE",
            credentials: "include"
        });
        // Đăng xuất khỏi Firebase
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__signOut$3e$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]);
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
}
async function forceLogout() {
    try {
        // Clear backend session
        await fetch(`${API_BASE_URL}/api/auth/force-logout`, {
            method: "POST",
            credentials: "include"
        });
        // Clear Firebase auth
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__signOut$3e$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]);
        // Clear local storage
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.clear();
            // Clear all cookies
            document.cookie.split(";").forEach((c)=>{
                const eqPos = c.indexOf("=");
                const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });
        }
    } catch (error) {
        console.error("Force logout error:", error);
        // Vẫn clear local state
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.clear();
        }
    }
}
async function saveSession(idToken) {
    console.log('Saving session with token:', idToken.substring(0, 20) + '...');
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idToken
        }),
        credentials: "include"
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
async function verifyToken() {
    try {
        // Lấy Firebase token nếu user đã đăng nhập
        let headers = {};
        console.log('VerifyToken: Starting verification...');
        console.log('VerifyToken: auth.currentUser:', !!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser);
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser) {
            try {
                const token = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
                console.log('VerifyToken: Got Firebase token, length:', token.length);
            } catch (tokenError) {
                console.log('VerifyToken: Could not get Firebase token:', tokenError);
            // Tiếp tục mà không có token, có thể dựa vào cookie
            }
        } else {
            console.log('VerifyToken: No Firebase user logged in');
        }
        console.log('VerifyToken: Making request to backend...');
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: "GET",
            headers,
            credentials: "include"
        });
        console.log('VerifyToken: Response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(()=>({}));
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
async function getDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
            method: "GET",
            credentials: "include"
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
async function syncUserToDatabase(firebaseUser) {
    try {
        console.log('Syncing user to database:', firebaseUser.uid);
        const token = await firebaseUser.getIdToken();
        console.log('Got Firebase token for sync');
        const response = await fetch(`${API_BASE_URL}/api/auth/sync-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include",
            body: JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
            })
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
async function sendResetCode(email) {
    const res = await fetch(`${API_BASE_URL}/api/forgot-password/send-reset-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email
        })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
async function verifyResetCode(email, code) {
    const response = await fetch(`${API_BASE_URL}/api/forgot-password/verify-reset-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            code
        })
    });
    if (!response.ok) throw new Error("Mã xác thực không đúng hoặc hết hạn");
    return response.json(); // { token }
}
async function resetPassword(email, token, password) {
    const response = await fetch(`${API_BASE_URL}/api/forgot-password/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            token,
            password
        })
    });
    if (!response.ok) throw new Error("Không thể đổi mật khẩu");
    return response.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/providers/auth_provider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__z__as__onAuthStateChanged$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index-35c79a8a.js [app-client] (ecmascript) <export z as onAuthStateChanged>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Đảm bảo component đã mount trên client
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            setMounted(true);
        }
    }["AuthProvider.useEffect"], []);
    // Helper function để clear invalid tokens
    const clearInvalidAuth = ()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            // Clear cookie
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            // Clear localStorage if any
            localStorage.removeItem('token');
        }
        setUser(null);
    };
    // Theo dõi trạng thái auth từ Firebase
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (!mounted) return; // Chỉ chạy khi đã mounted trên client
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$35c79a8a$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__z__as__onAuthStateChanged$3e$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], {
                "AuthProvider.useEffect.unsubscribe": async (firebaseUser)=>{
                    console.log('Firebase auth state changed:', firebaseUser ? 'logged in' : 'logged out');
                    // Check if we're on auth pages (login/register) to avoid unnecessary token verification
                    const isAuthPage = "object" !== 'undefined' && (window.location.pathname.includes('/auth/') || window.location.pathname.includes('/register') || window.location.pathname.includes('/login'));
                    if (firebaseUser) {
                        try {
                            // Đảm bảo Firebase user đã được authenticate hoàn toàn
                            const idToken = await firebaseUser.getIdToken(false);
                            if (!idToken) {
                                console.log('No valid ID token available');
                                setUser(null);
                                setLoading(false);
                                return;
                            }
                            // Verify token và lấy thông tin user từ backend
                            const userData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verifyToken"])();
                            // console.log('User data from backend:', userData);
                            if (userData && userData.user) {
                                setUser(userData.user);
                            } else {
                                console.log('No user data from backend, attempting to sync...');
                                // Thử sync user từ Firebase sang database
                                try {
                                    const syncResponse = await fetch(`${("TURBOPACK compile-time value", "https://ecprojectbe-production.up.railway.app")}/api/auth/sync-user`, {
                                        method: 'POST',
                                        credentials: 'include'
                                    });
                                    if (syncResponse.ok) {
                                        console.log('User synced successfully, retrying verification...');
                                        const retryUserData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verifyToken"])();
                                        if (retryUserData && retryUserData.user) {
                                            setUser(retryUserData.user);
                                        } else {
                                            console.log('Still no user data after sync, clearing auth');
                                            clearInvalidAuth();
                                        }
                                    } else {
                                        console.log('Sync failed, clearing invalid auth');
                                        clearInvalidAuth();
                                    }
                                } catch (syncError) {
                                    console.error('Sync error:', syncError);
                                    clearInvalidAuth();
                                }
                            }
                        } catch (error) {
                            // Chỉ log error, không throw để tránh crash UI
                            console.log('Auth verification issue:', error instanceof Error ? error.message : 'Unknown error');
                            // Xử lý các loại lỗi khác nhau
                            if (error instanceof Error) {
                                if (error.message.includes('No token') || error.message.includes('No authentication')) {
                                    console.log('User not authenticated - normal for registration/login pages');
                                    setUser(null);
                                } else if (error.message === 'Failed to verify token') {
                                    console.log('Token verification failed - clearing invalid auth');
                                    clearInvalidAuth();
                                } else {
                                    console.log('Other authentication error:', error.message);
                                    setUser(null);
                                }
                            } else {
                                console.log('Unknown authentication error');
                                setUser(null);
                            }
                        }
                    } else {
                        console.log('No firebase user, clearing auth');
                        clearInvalidAuth();
                    }
                    setLoading(false);
                }
            }["AuthProvider.useEffect.unsubscribe"]);
            return ({
                "AuthProvider.useEffect": ()=>unsubscribe()
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        mounted
    ]); // Depend on mounted state
    // Hàm login - nhận user data và token từ login form
    const login = (userData, token)=>{
        // Lưu token vào localStorage hoặc cookie
        localStorage.setItem('token', token);
        setUser(userData);
    };
    // Hàm logout
    const logout = async ()=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logoutUser"])();
            clearInvalidAuth();
        } catch (error) {
            console.error('Logout error:', error);
            // Vẫn clear local state nếu có lỗi
            clearInvalidAuth();
        }
    };
    // Hàm refresh user data từ backend
    const refreshUser = async ()=>{
        try {
            const userData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verifyToken"])();
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
            value: {
                user: null,
                loading: true,
                login,
                logout,
                refreshUser
            },
            children: children
        }, void 0, false, {
            fileName: "[project]/providers/auth_provider.tsx",
            lineNumber: 165,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            logout,
            refreshUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/providers/auth_provider.tsx",
        lineNumber: 172,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "FIzqnIW1H0bYFdbyChrAwNmvoDA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/ClientProviders.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ClientProviders)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$auth_provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/providers/auth_provider.tsx [app-client] (ecmascript)");
'use client';
;
;
function ClientProviders({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$auth_provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/components/ClientProviders.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
_c = ClientProviders;
var _c;
__turbopack_context__.k.register(_c, "ClientProviders");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_ba60859b._.js.map