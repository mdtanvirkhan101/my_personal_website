"use client";

import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Server,
  Activity,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative group w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl"
      style={{
        background: "linear-gradient(135deg, #06b6d4, #6366f1, #8b5cf6)",
        boxShadow: "0 0 35px rgba(6, 182, 212, 0.35)",
      }}
    >
      {/* Shine effect */}
      <span className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-700 ease-in-out" />

      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Verifying Credentials &amp; Session...</span>
        </>
      ) : (
        <>
          <ShieldCheck className="w-4 h-4 text-cyan-200" />
          <span>Sign In to Admin Console</span>
        </>
      )}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden select-none bg-[#0a0a29]">
      {/* Dynamic Background Aurora Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none bg-radial-gradient from-purple-600/20 via-indigo-600/15 to-transparent" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-radial-gradient from-cyan-500/15 to-transparent" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-radial-gradient from-indigo-500/15 to-transparent" />

      {/* Cyber Grid Lines Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(34,211,238,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.4) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Return Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-mono font-medium text-slate-400 hover:text-cyan-300 transition-colors group px-3.5 py-1.5 rounded-full bg-[#141444]/60 border border-purple-500/20 backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-cyan-400" />
            <span>Return to Portfolio</span>
          </Link>

          <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Login Card */}
        <div
          className="relative rounded-3xl p-7 sm:p-9 overflow-hidden bg-[#141444]/80 border border-purple-500/30 backdrop-blur-2xl shadow-2xl space-y-7"
          style={{
            boxShadow: "0 25px 60px rgba(7, 7, 30, 0.9), 0 0 45px rgba(6, 182, 212, 0.12)",
          }}
        >
          {/* Top Brand Banner */}
          <div className="text-center space-y-3">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 blur-md opacity-60 animate-pulse" />
              <div className="relative w-full h-full rounded-2xl bg-[#0e0e34] border border-cyan-500/40 flex items-center justify-center shadow-lg">
                <KeyRound className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              </div>
            </div>

            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                <span>Enterprise Admin Portal</span>
              </h1>
              <p className="text-xs text-slate-300 font-normal mt-1">
                Authorized identity verification &amp; CMS session guard
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {state?.error && (
            <div className="p-4 rounded-2xl text-xs flex items-start space-x-3 bg-red-950/40 border border-red-500/40 text-red-300 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{state.error}</div>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-slate-300">
                Administrator Email
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@example.com"
                  defaultValue="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090924] border border-purple-500/25 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
                />
              </div>
              {state?.fieldErrors?.email && (
                <p className="text-xs text-red-400 pl-1">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-medium text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-cyan-400/80 font-mono">Rate-Limited &bull; 5 Attempts Max</span>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••••••••"
                  defaultValue="admin_secure_password_123!"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#090924] border border-purple-500/25 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {state?.fieldErrors?.password && (
                <p className="text-xs text-red-400 pl-1">{state.fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Two-Factor Authentication (2FA) PIN field (dynamically requested or always available) */}
            <div className="space-y-1.5 pt-1 border-t border-purple-500/20">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2FA Security PIN {state?.requiresTwoFactor && <span className="text-red-400">*</span>}</span>
                </label>
                <span className="text-[10px] text-purple-400 font-mono">
                  {state?.requiresTwoFactor ? "Required for this account" : "Optional (if enabled)"}
                </span>
              </div>
              <div className="relative group">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="password"
                  name="twoFactorPin"
                  maxLength={8}
                  placeholder="Enter 4-8 digit security PIN"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090924] border border-cyan-500/30 text-cyan-200 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          {/* Security Features Bullet Points */}
          <div className="pt-4 border-t border-purple-500/20 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Anti-Brute Force</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>JOSE JWT Token</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>HttpOnly Cookies</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Zero-Trust Guard</span>
            </div>
          </div>

          {/* Seeded Default Notice */}
          <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
            <span>Default Seed: </span>
            <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
              admin@example.com
            </code>
          </div>
        </div>
      </div>
    </main>
  );
}
