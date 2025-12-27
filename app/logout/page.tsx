"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (response.ok) {
          // Redirect to login page after successful logout
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        // Even if logout fails, redirect to login
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } finally {
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="mb-6">
          {isLoggingOut ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Logging out...
              </h2>
              <p className="text-gray-600 mt-2">Please wait</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Logged out successfully
              </h2>
              <p className="text-gray-600 mt-2">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
