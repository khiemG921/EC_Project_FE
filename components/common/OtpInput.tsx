// components/common/OtpInput.tsx
'use client';
import React from "react";

export interface OtpInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  disabled?: boolean;
  error?: string;
  length?: number;
  autoFocus?: boolean;
  resendLimit?: number;
  expireSeconds?: number;
  loading?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onVerify,
  onResend,
  disabled = false,
  error = "",
  length = 6,
  autoFocus = false,
  resendLimit = 3,
  expireSeconds = 120,
  loading = false,
}) => {
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [countdown, setCountdown] = React.useState(expireSeconds);
  const [resendCount, setResendCount] = React.useState(0);
  const [resendLocked, setResendLocked] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setCountdown(expireSeconds);
    setOtpError("");
    setVerifying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, [resendCount, expireSeconds]);

  React.useEffect(() => {
    if (autoFocus && inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newDigits = [...value];
    newDigits[index] = val;
    onChange(newDigits);
    setOtpError("");
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
    // Auto verify if all digits filled
    if (newDigits.every(d => d.length === 1)) {
      handleVerify(newDigits.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").slice(0, length);
    if (new RegExp(`^\\d{${length}}$`).test(paste)) {
      onChange(paste.split(""));
      handleVerify(paste);
    }
  };

  async function handleVerify(otp: string) {
    if (verifying || countdown === 0) return;
    setVerifying(true);
    setOtpError("");
    try {
      await onVerify(otp);
    } catch (err: any) {
      setOtpError(err.message || "Mã xác thực không đúng hoặc đã hết hạn.");
      onChange(Array(length).fill(""));
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!onResend || resendCount >= resendLimit) return;
    setResendLocked(false);
    setOtpError("");
    setVerifying(false);
    setCountdown(expireSeconds);
    setResendCount(c => c + 1);
    try {
      await onResend();
    } catch (err: any) {
      setOtpError(err.message || "Không thể gửi lại mã xác thực.");
    }
    if (resendCount + 1 >= resendLimit) setResendLocked(true);
  }

  function formatCountdown(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            id={`otp-digit-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={`w-10 h-12 text-center text-xl border rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${otpError || error ? "border-red-500" : "border-slate-300"}`}
            value={value[i] || ""}
            onChange={e => handleChange(i, e.target.value)}
            onPaste={i === 0 ? handlePaste : undefined}
            ref={el => { inputs.current[i] = el; }}
            disabled={disabled || verifying || countdown === 0}
            autoFocus={autoFocus && i === 0}
          />
        ))}
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-base text-teal-600 font-semibold">
          {countdown > 0
            ? `Mã hết hạn sau: ${formatCountdown(countdown)}`
            : "Mã đã hết hạn."}
        </span>
        {(countdown === 0 || otpError) && !resendLocked && onResend && (
          <button
            type="button"
            onClick={handleResend}
            className="text-base text-teal-500 underline font-semibold"
            disabled={resendCount >= resendLimit || verifying}
          >
            Gửi lại mã ({resendLimit - resendCount} lần còn lại)
          </button>
        )}
        {resendLocked && (
          <span className="text-base text-red-500 font-semibold">
            Bạn đã gửi lại mã quá số lần cho phép. Vui lòng thử lại sau 24 giờ.
          </span>
        )}
      </div>
      {(otpError || error) && (
        <p className="text-red-500 text-center font-semibold">{otpError || error}</p>
      )}
    </div>
  );
};

export default OtpInput;
