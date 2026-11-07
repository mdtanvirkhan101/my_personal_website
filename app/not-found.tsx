import Link from "next/link";
import { ArrowLeft, Home, FolderGit2 } from "lucide-react";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0e34] text-[#F7F6F7] relative selection:bg-purple-500/40 selection:text-white overflow-x-hidden flex flex-col font-sans">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6 bg-[#141444]/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-purple-500/30 shadow-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs">
            <span>404 • Page Not Found</span>
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 font-heading">
            404
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            The route or resource you are looking for has been moved, renamed, or does not exist on this portfolio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-mono text-xs font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>

            <Link
              href="/projects"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#0e0e34] hover:bg-[#1a1a4a] border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2"
            >
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>Explore Projects</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
