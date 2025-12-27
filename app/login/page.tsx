"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import TwoFactorVerification from "@/components/auth/TwoFactorVerification";

type Step = "CREDENTIALS" | "TWO_FACTOR";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [step, setStep] = useState<Step>("CREDENTIALS");
  const [pendingUser, setPendingUser] = useState<{
    userId: number;
    email: string;
    name?: string;
  } | null>(null);

  const [magicVerifying, setMagicVerifying] = useState(false);
  const [magicError, setMagicError] = useState<string | null>(null);
  const magicCheckedRef = useRef(false);

  useEffect(() => {
    if (magicCheckedRef.current) return;
    magicCheckedRef.current = true;

    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const userIdParam = params.get("userId");
    const token = params.get("token");

    if (mode === "magic" && userIdParam && token) {
      const userId = Number(userIdParam);
      if (Number.isNaN(userId)) return;

      setMagicVerifying(true);
      setMagicError(null);

      (async () => {
        try {
          const response = await fetch("/api/auth/2fa/verify-magic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, token }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error?.message || "Magic link verification failed"
            );
          }
          router.push("/dashboard");
          router.refresh();
        } catch (err: any) {
          const message =
            err.message ||
            "Magic link is invalid or has expired. Please try logging in with your email and password.";
          setMagicError(message);
        } finally {
          setMagicVerifying(false);
        }
      })();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== "CREDENTIALS") return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        setPendingUser({
          userId: data.userId,
          email: formData.email,
          name: data.name,
        });
        setStep("TWO_FACTOR");
      } else {
        // Normal login - redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTwoFactorSuccess = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const handleBackToCredentials = () => {
    setStep("CREDENTIALS");
    setPendingUser(null);
    setError("");
  };

  const isCredentialsStep = step === "CREDENTIALS";
  const isTwoFactorStep = step === "TWO_FACTOR" && !!pendingUser;

  return (
    <div className="flex min-h-screen">
      {/* Left Side - IT Governance Branding Panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-white px-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6">
              <Shield className="w-14 h-14 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            IT
            <br />
            Governance
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6"></div>
          <p className="text-blue-100 text-lg max-w-sm mx-auto">
            Streamline your governance, compliance, and risk management
          </p>
        </div>
      </div>

      {/* Right Side - Login Form / 2FA */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo and Welcome */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-gray-800">
                  mi<span className="text-cyan-500">Life</span>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-cyan-500 flex items-center justify-center">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {isTwoFactorStep ? "Verify your login" : "Welcome back,"}
              </h2>
              <p className="text-gray-600">
                {isTwoFactorStep
                  ? "Enter the verification code sent to your email."
                  : "Please sign in to your account."}
              </p>
            </div>
          </div>

          {/* Magic link error (if any) */}
          {magicError && (
            <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
              {magicError}
            </div>
          )}

          {/* Magic link verifying state */}
          {magicVerifying ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">
                Verifying your magic link, please wait...
              </p>
            </div>
          ) : (
            <>
              {/* Credentials Step */}
              {isCredentialsStep && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      User Account
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement forgot password functionality
                        alert("Forgot password functionality coming soon!");
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </button>
                </form>
              )}

              {/* Two Factor Step */}
              {isTwoFactorStep && pendingUser && (
                <TwoFactorVerification
                  userId={pendingUser.userId}
                  email={pendingUser.email}
                  onSuccess={handleTwoFactorSuccess}
                  onBack={handleBackToCredentials}
                />
              )}
            </>
          )}

          {/* Register Link - Only show on credentials step */}
          {isCredentialsStep && !magicVerifying && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Create one now
                </a>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            miLife © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
