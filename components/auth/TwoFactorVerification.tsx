// components/auth/TwoFactorVerification.tsx
"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

interface TwoFactorVerificationProps {
  userId: number;
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function TwoFactorVerification({
  userId,
  email,
  onSuccess,
  onBack,
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Verification failed");
      }

      // Success
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch("/api/auth/2fa/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to resend code");
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className="w-full">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* Email info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Verification code sent
            </p>
            <p className="text-sm text-blue-700 mt-1">
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>
        </div>

        {/* Code input */}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={handleCodeChange}
            maxLength={6}
            placeholder="000000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono bg-gray-50 outline-none transition-all"
            required
            disabled={loading}
            autoComplete="off"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            Code expires in 10 minutes
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success message for resend */}
        {resendSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Verification code resent successfully!
          </div>
        )}

        {/* Verify button */}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        {/* Resend button */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {resending && <Loader2 className="w-3 h-3 animate-spin" />}
            {resending ? "Resending..." : "Didn't receive the code? Resend"}
          </button>
        </div>
      </form>

      {/* Help text */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          If you continue to have issues, please contact your system
          administrator.
        </p>
      </div>
    </div>
  );
}
