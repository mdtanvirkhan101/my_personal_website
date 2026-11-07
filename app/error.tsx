"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error captured by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0e0e34] text-[#F7F6F7] flex items-center justify-center p-4 font-sans selection:bg-purple-500/40 selection:text-white">
      <div className="max-w-md w-full text-center space-y-6 bg-[#141444]/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-rose-500/30 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            An unexpected client or rendering error occurred. You can retry the operation or return to the main dashboard.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-[#0e0e34] border border-slate-800 text-[11px] font-mono text-rose-300/80 text-left line-clamp-3">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-mono text-xs font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0e0e34] hover:bg-[#1a1a4a] border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
