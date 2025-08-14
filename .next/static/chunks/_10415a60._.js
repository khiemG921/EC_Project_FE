(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/components/common/OtpInput.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// components/common/OtpInput.tsx
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const OtpInput = ({ value, onChange, onVerify, onResend, disabled = false, error = "", length = 6, autoFocus = false, resendLimit = 3, expireSeconds = 120, loading = false })=>{
    _s();
    const inputs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef([]);
    const [countdown, setCountdown] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(expireSeconds);
    const [resendCount, setResendCount] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(0);
    const [resendLocked, setResendLocked] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [otpError, setOtpError] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState("");
    const [verifying, setVerifying] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    const timerRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef(null);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "OtpInput.useEffect": ()=>{
            setCountdown(expireSeconds);
            setOtpError("");
            setVerifying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval({
                "OtpInput.useEffect": ()=>{
                    setCountdown({
                        "OtpInput.useEffect": (prev)=>{
                            if (prev <= 1) {
                                clearInterval(timerRef.current);
                                return 0;
                            }
                            return prev - 1;
                        }
                    }["OtpInput.useEffect"]);
                }
            }["OtpInput.useEffect"], 1000);
            return ({
                "OtpInput.useEffect": ()=>{
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            })["OtpInput.useEffect"];
        // eslint-disable-next-line
        }
    }["OtpInput.useEffect"], [
        resendCount,
        expireSeconds
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "OtpInput.useEffect": ()=>{
            if (autoFocus && inputs.current[0]) {
                inputs.current[0].focus();
            }
        }
    }["OtpInput.useEffect"], [
        autoFocus
    ]);
    const handleChange = (index, val)=>{
        if (!/^[0-9]?$/.test(val)) return;
        const newDigits = [
            ...value
        ];
        newDigits[index] = val;
        onChange(newDigits);
        setOtpError("");
        if (val && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
        // Auto verify if all digits filled
        if (newDigits.every((d)=>d.length === 1)) {
            handleVerify(newDigits.join(""));
        }
    };
    const handlePaste = (e)=>{
        const paste = e.clipboardData.getData("text").slice(0, length);
        if (new RegExp(`^\\d{${length}}$`).test(paste)) {
            onChange(paste.split(""));
            handleVerify(paste);
        }
    };
    async function handleVerify(otp) {
        if (verifying || countdown === 0) return;
        setVerifying(true);
        setOtpError("");
        try {
            await onVerify(otp);
        } catch (err) {
            setOtpError(err.message || "Mã xác thực không đúng hoặc đã hết hạn.");
            onChange(Array(length).fill(""));
        } finally{
            setVerifying(false);
        }
    }
    async function handleResend() {
        if (!onResend || resendCount >= resendLimit) return;
        setResendLocked(false);
        setOtpError("");
        setVerifying(false);
        setCountdown(expireSeconds);
        setResendCount((c)=>c + 1);
        try {
            await onResend();
        } catch (err) {
            setOtpError(err.message || "Không thể gửi lại mã xác thực.");
        }
        if (resendCount + 1 >= resendLimit) setResendLocked(true);
    }
    function formatCountdown(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2 justify-center",
                children: Array.from({
                    length
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: `otp-digit-${i}`,
                        type: "text",
                        inputMode: "numeric",
                        maxLength: 1,
                        className: `w-10 h-12 text-center text-xl border rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${otpError || error ? "border-red-500" : "border-slate-300"}`,
                        value: value[i] || "",
                        onChange: (e)=>handleChange(i, e.target.value),
                        onPaste: i === 0 ? handlePaste : undefined,
                        ref: (el)=>{
                            inputs.current[i] = el;
                        },
                        disabled: disabled || verifying || countdown === 0 || resendLocked,
                        autoFocus: autoFocus && i === 0
                    }, i, false, {
                        fileName: "[project]/components/common/OtpInput.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/common/OtpInput.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mt-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-base text-teal-600 font-semibold",
                        children: countdown > 0 ? `Mã hết hạn sau: ${formatCountdown(countdown)}` : "Mã đã hết hạn."
                    }, void 0, false, {
                        fileName: "[project]/components/common/OtpInput.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    (countdown === 0 || otpError) && !resendLocked && onResend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleResend,
                        className: "text-base text-teal-500 underline font-semibold",
                        disabled: resendCount >= resendLimit || verifying,
                        children: [
                            "Gửi lại mã (",
                            resendLimit - resendCount,
                            " lần còn lại)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/common/OtpInput.tsx",
                        lineNumber: 149,
                        columnNumber: 11
                    }, this),
                    resendLocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-base text-red-500 font-semibold",
                        children: "Bạn đã gửi lại mã quá số lần cho phép. Vui lòng thử lại sau 24 giờ."
                    }, void 0, false, {
                        fileName: "[project]/components/common/OtpInput.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/common/OtpInput.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            (otpError || error) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-500 text-center font-semibold",
                children: otpError || error
            }, void 0, false, {
                fileName: "[project]/components/common/OtpInput.tsx",
                lineNumber: 165,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/common/OtpInput.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this);
};
_s(OtpInput, "WO6B75tRTg6WG9FMBWcr9ZSl9vk=");
_c = OtpInput;
const __TURBOPACK__default__export__ = OtpInput;
var _c;
__turbopack_context__.k.register(_c, "OtpInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/auth/register/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// app/auth/register/page.tsx
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$common$2f$OtpInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/common/OtpInput.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const RegisterPage = ()=>{
    _s();
    const [termsAccepted, setTermsAccepted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [phone, setPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1); // 1: form, 2: otp
    const [otpDigits, setOtpDigits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Array(6).fill(""));
    const [otpError, setOtpError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [countdown, setCountdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(120);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RegisterPage.useEffect": ()=>{
            if (step === 2) {
                setCountdown(120);
                timerRef.current = setInterval({
                    "RegisterPage.useEffect": ()=>{
                        setCountdown({
                            "RegisterPage.useEffect": (prev)=>{
                                if (prev <= 1) {
                                    clearInterval(timerRef.current);
                                    return 0;
                                }
                                return prev - 1;
                            }
                        }["RegisterPage.useEffect"]);
                    }
                }["RegisterPage.useEffect"], 1000);
            }
            return ({
                "RegisterPage.useEffect": ()=>{
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            })["RegisterPage.useEffect"];
        }
    }["RegisterPage.useEffect"], [
        step
    ]);
    function formatCountdown(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["registerUser"])(email, password, name, phone);
            if (res.needVerify) {
                setStep(2);
                setOtpDigits(Array(6).fill(""));
                if (res.isExistingUser) {
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
        } finally{
            setLoading(false);
        }
    }
    // Xử lý nhập OTP 
    async function handleVerifyOtp(otp) {
        setLoading(true);
        setOtpError("");
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verifyRegisterCode"])(email, otp);
            setMessage("Xác thực thành công! Đang chuyển về trang đăng nhập...");
            setTimeout(()=>router.push("/auth/login"), 1500);
        } catch (err) {
            setOtpError("Mã xác thực không đúng hoặc đã hết hạn.");
            setOtpDigits(Array(6).fill(""));
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex items-center justify-center p-4 bg-cover bg-center",
        style: {
            backgroundImage: "url('https://images.unsplash.com/photo-1550181519-946b12b1e1a4?q=80&w=2070&auto=format&fit=crop')"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold text-teal-500 text-center mb-2",
                    children: "Tạo tài khoản"
                }, void 0, false, {
                    fileName: "[project]/app/auth/register/page.tsx",
                    lineNumber: 95,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-center text-slate-600 mb-8",
                    children: "Bắt đầu khám phá bTaskee."
                }, void 0, false, {
                    fileName: "[project]/app/auth/register/page.tsx",
                    lineNumber: 96,
                    columnNumber: 17
                }, this),
                step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleRegister,
                    autoComplete: "off",
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Họ và tên",
                                required: true,
                                className: "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition",
                                value: name,
                                onChange: (e)=>setName(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/auth/register/page.tsx",
                                lineNumber: 100,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 99,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "email",
                                placeholder: "Email",
                                required: true,
                                className: "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition",
                                value: email,
                                onChange: (e)=>setEmail(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/auth/register/page.tsx",
                                lineNumber: 110,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 109,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "tel",
                                placeholder: "Số điện thoại (tùy chọn)",
                                className: "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition",
                                value: phone,
                                onChange: (e)=>setPhone(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/auth/register/page.tsx",
                                lineNumber: 120,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 119,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "password",
                                placeholder: "Mật khẩu",
                                required: true,
                                className: "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition",
                                value: password,
                                onChange: (e)=>setPassword(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/auth/register/page.tsx",
                                lineNumber: 129,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 128,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    id: "terms",
                                    checked: termsAccepted,
                                    onChange: (e)=>setTermsAccepted(e.target.checked),
                                    className: "h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                }, void 0, false, {
                                    fileName: "[project]/app/auth/register/page.tsx",
                                    lineNumber: 139,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "terms",
                                    className: "text-sm text-slate-600",
                                    children: [
                                        "Tôi đã đọc và đồng ý với ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "font-semibold text-teal-500 hover:underline",
                                            children: "Điều khoản"
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/register/page.tsx",
                                            lineNumber: 147,
                                            columnNumber: 58
                                        }, this),
                                        " và ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "font-semibold text-teal-500 hover:underline",
                                            children: "Chính sách Bảo mật"
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/register/page.tsx",
                                            lineNumber: 147,
                                            columnNumber: 144
                                        }, this),
                                        "."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/auth/register/page.tsx",
                                    lineNumber: 146,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 138,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: !termsAccepted || loading,
                            className: "w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/30 transform hover:scale-105 disabled:bg-slate-300 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed",
                            children: loading ? "Đang xử lý..." : "Tạo tài khoản"
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 150,
                            columnNumber: 25
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-red-500 text-center text-sm mt-2",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 157,
                            columnNumber: 35
                        }, this),
                        message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-teal-600 text-center text-sm mt-2",
                            children: message
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 158,
                            columnNumber: 37
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/auth/register/page.tsx",
                    lineNumber: 98,
                    columnNumber: 21
                }, this),
                step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-5 mt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium text-slate-600 mb-1",
                            children: "Mã xác thực (OTP) đã gửi về email"
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 163,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$common$2f$OtpInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            value: otpDigits,
                            onChange: setOtpDigits,
                            onVerify: handleVerifyOtp,
                            onResend: undefined,
                            disabled: loading,
                            expireSeconds: 120,
                            resendLimit: 3,
                            loading: loading,
                            error: otpError
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 164,
                            columnNumber: 25
                        }, this),
                        message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-teal-600 text-center font-semibold",
                            children: message
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 175,
                            columnNumber: 37
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/auth/register/page.tsx",
                    lineNumber: 162,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-center text-sm text-slate-600 mt-8",
                    children: [
                        "Đã có tài khoản? ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "/auth/login",
                            className: "font-bold text-teal-500 hover:underline",
                            children: "Đăng nhập"
                        }, void 0, false, {
                            fileName: "[project]/app/auth/register/page.tsx",
                            lineNumber: 179,
                            columnNumber: 38
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/auth/register/page.tsx",
                    lineNumber: 178,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/auth/register/page.tsx",
            lineNumber: 94,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/auth/register/page.tsx",
        lineNumber: 90,
        columnNumber: 9
    }, this);
};
_s(RegisterPage, "sXsOWa3KyRv6WEXMgiJTQ3ltYy4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = RegisterPage;
const __TURBOPACK__default__export__ = RegisterPage;
var _c;
__turbopack_context__.k.register(_c, "RegisterPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=_10415a60._.js.map