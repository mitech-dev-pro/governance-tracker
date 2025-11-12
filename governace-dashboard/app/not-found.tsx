"use client";

import { Home, ArrowLeftCircle, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-2xl px-6 py-16 text-center">
        {/* Large 404 */}
        <h1 className="text-[10rem] font-black leading-none bg-gradient-to-br from-blue-100 via-blue-800 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:via-blue-400 dark:to-slate-300 select-none">
          404
        </h1>

        {/* Icon */}
        <div className="flex justify-center -mt-8 mb-6">
          <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
            <SearchX className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Text content */}
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved
          to a new location.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold
            bg-blue-600 text-white hover:bg-blue-700
            shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
            transition-all duration-200 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
            Go to Dashboard
          </button>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold
            bg-white text-slate-700 border border-slate-200 
            hover:bg-slate-50 hover:border-slate-300
            dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700
            dark:hover:bg-slate-700 dark:hover:border-slate-600
            shadow-sm hover:shadow-md
            transition-all duration-200 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Decorative element */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>
    </main>
  );
}
