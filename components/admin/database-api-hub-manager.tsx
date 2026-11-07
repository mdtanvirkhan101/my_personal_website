"use client";

import React, { useState } from "react";
import {
  DatabaseTelemetry,
  ApiHubConfig,
  testExternalDatabaseConnection,
  saveExternalDatabaseSetting,
  executePrismaSqlDatabaseUpdate,
  executePrismaSqlDatabaseReset,
} from "@/actions/database-api-hub";
import {
  Database,
  Cpu,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Bot,
  KeyRound,
  Send,
  Mail,
  Zap,
  Lock,
  Loader2,
  ArrowUpRight,
  Globe,
  Sliders,
  Check,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface DatabaseApiHubProps {
  initialTelemetry: DatabaseTelemetry;
  initialApiHub: ApiHubConfig;
}

export function DatabaseApiHubManager({
  initialTelemetry,
  initialApiHub,
}: DatabaseApiHubProps) {
  const [telemetry, setTelemetry] = useState<DatabaseTelemetry>(initialTelemetry);
  const [apiHub, setApiHub] = useState<ApiHubConfig>(initialApiHub);

  // External DB input states
  const [externalDbUrl, setExternalDbUrl] = useState("");
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Prisma SQL Database Management State
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);
  const [isResettingDb, setIsResettingDb] = useState(false);
  const [sqlOperationNotice, setSqlOperationNotice] = useState<{ success: boolean; message: string } | null>(null);

  const handlePrismaSqlUpdate = async () => {
    if (!confirm("Execute full Prisma SQL database sync & update? This will synchronize default engineering skills, active services, and metadata without affecting admin credentials.")) {
      return;
    }
    setIsUpdatingDb(true);
    setSqlOperationNotice(null);
    try {
      const res = await executePrismaSqlDatabaseUpdate();
      setSqlOperationNotice(res);
    } catch (err: any) {
      setSqlOperationNotice({ success: false, message: err.message || "Failed to update database via Prisma SQL." });
    } finally {
      setIsUpdatingDb(false);
    }
  };

  const handlePrismaSqlDelete = async () => {
    const promptConfirm = prompt("WARNING: This will delete and clear test content collections (Projects, Skills, Services, Messages) using Prisma SQL. Admin accounts will be preserved.\n\nType 'CONFIRM' to proceed:");
    if (promptConfirm !== "CONFIRM") {
      return;
    }
    setIsResettingDb(true);
    setSqlOperationNotice(null);
    try {
      const res = await executePrismaSqlDatabaseReset({
        deleteProjects: true,
        deleteSkills: true,
        deleteServices: true,
        deleteMessages: true,
      });
      setSqlOperationNotice(res);
    } catch (err: any) {
      setSqlOperationNotice({ success: false, message: err.message || "Failed to execute database delete via Prisma SQL." });
    } finally {
      setIsResettingDb(false);
    }
  };

  const handleTestDb = async () => {
    if (!externalDbUrl.trim()) return;
    setIsTestingDb(true);
    setDbNotice(null);
    try {
      const res = await testExternalDatabaseConnection(externalDbUrl);
      setDbNotice(res);
    } catch (err: any) {
      setDbNotice({
        success: false,
        message: err.message || "Failed to inspect database connection.",
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSaveDb = async () => {
    if (!externalDbUrl.trim()) return;
    setIsSavingDb(true);
    setDbNotice(null);
    try {
      const res = await saveExternalDatabaseSetting(externalDbUrl);
      setDbNotice(res);
    } catch (err: any) {
      setDbNotice({
        success: false,
        message: err.message || "Failed to save database connection.",
      });
    } finally {
      setIsSavingDb(false);
    }
  };

  const dbTarget = telemetry.targetInfo;
  const isLocal = dbTarget.classification === "LOCAL_ISOLATED";
  const isCloud = dbTarget.classification === "CLOUD_STAGING" || dbTarget.classification === "REMOTE_PRODUCTION";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b"
        style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <span>External Database &amp; Centralized API Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your external PostgreSQL database cluster, API credentials, and multi-cloud AI connections in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/automation"
            className="px-4 py-2 rounded-xl bg-[#141444] border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 hover:text-white hover:bg-[#1a1a52] transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Workflows</span>
          </Link>
          <Link
            href="/admin/backup"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Backup &amp; Rollback</span>
          </Link>
        </div>
      </div>

      {/* Database Target Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Target */}
        <div className="p-6 rounded-3xl bg-[#141444]/80 border border-cyan-500/30 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Active Database Target
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isCloud
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {dbTarget.classification}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-mono">{dbTarget.hostname}</h3>
            <p className="text-xs text-slate-400 font-mono">
              Port: {dbTarget.port} &bull; DB: {dbTarget.database}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>SSL Mode: {telemetry.storageStatus.sslMode}</span>
          </div>
        </div>

        {/* Card 2: AI & LLM Engine Status */}
        <div className="p-6 rounded-3xl bg-[#141444]/80 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-bold">
              Active AI Intelligence Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
              {apiHub.activeModelName}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{apiHub.activeProviderName}</h3>
            <p className="text-xs text-slate-400 font-mono">
              {telemetry.recordCounts.aiModels} Models Configured &bull; {telemetry.recordCounts.workflows} Workflows Active
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-purple-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Connected &amp; Ready for Chat Widget</span>
          </div>
        </div>

        {/* Card 3: Integrations & Notifications */}
        <div className="p-6 rounded-3xl bg-[#141444]/80 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
              External Notification Channels
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" /> Telegram Channel
              </span>
              <span className={apiHub.telegramBotConfigured ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {apiHub.telegramBotConfigured ? "Configured" : "Not Set"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" /> SMTP / Resend Email
              </span>
              <span className={apiHub.resendApiKeyConfigured ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {apiHub.resendApiKeyConfigured ? "Configured" : "Not Set"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-indigo-300 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{telemetry.recordCounts.contactMessages} Total Messages Handled</span>
          </div>
        </div>
      </div>

      {/* External Database Connection Setup Section */}
      <div className="rounded-3xl bg-[#141444]/70 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <span>External Cloud Database Connection String (PostgreSQL)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Connect external managed PostgreSQL instances (Supabase, Neon, AWS RDS, Railway, Render) with zero code modifications.
            </p>
          </div>
        </div>

        {/* Masked Connection Banner */}
        <div className="p-4 rounded-2xl bg-[#090924] border border-purple-500/25 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Current Masked Connection String:</span>
            <span className="text-cyan-400 font-bold">Auto-Protected</span>
          </div>
          <code className="text-xs text-purple-300 font-mono block break-all">
            {apiHub.customDatabaseUrlMasked}
          </code>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-300 font-semibold">
              New External PostgreSQL Connection URL
            </label>
            <input
              type="text"
              value={externalDbUrl}
              onChange={(e) => setExternalDbUrl(e.target.value)}
              placeholder="postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres?sslmode=require"
              className="w-full bg-[#090924] border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <p className="text-[11px] text-slate-400 font-mono">
              Tip: Credentials and passwords are masked automatically. Never stored in client-side code.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTestDb}
              disabled={isTestingDb || !externalDbUrl.trim()}
              className="px-5 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs font-mono transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isTestingDb ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Target...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test Connection String</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveDb}
              disabled={isSavingDb || !externalDbUrl.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingDb ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Store External Database Target</span>
                </>
              )}
            </button>
          </div>

          {/* Notice Feedback */}
          {dbNotice && (
            <div
              className={`p-4 rounded-2xl text-xs font-mono flex items-start gap-2.5 ${
                dbNotice.success
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border border-red-500/30 text-red-300"
              }`}
            >
              {dbNotice.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{dbNotice.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Prisma SQL Database Maintenance Section (Full Update & Delete Controls) */}
      <div className="rounded-3xl bg-[#141444]/80 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <span>Prisma SQL Full Database Operations</span>
            </h2>
            <p className="text-xs text-slate-400">
              One-click buttons to execute full database sync/update or purge test content using Prisma ORM (Strictly preserving Admin credentials).
            </p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            Prisma SQL Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Prisma Full Database Update */}
          <div className="p-5 rounded-2xl bg-[#090924] border border-cyan-500/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Full Database Update &amp; Resync</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Synchronizes and restores all standard engineering services, core technical skills (Grandstream, Cisco, MikroTik, FortiGate, etc.), and updates system timestamp tags.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrismaSqlUpdate}
              disabled={isUpdatingDb || isResettingDb}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingDb ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Prisma SQL Update...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Update Full Database (Prisma SQL)</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Prisma Full Database Delete */}
          <div className="p-5 rounded-2xl bg-[#090924] border border-red-500/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Purge Test Content Collections</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Safely cleans test projects, dummy contact messages, and temporary skills via Prisma SQL. Administrator accounts and security hashes are 100% protected.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrismaSqlDelete}
              disabled={isUpdatingDb || isResettingDb}
              className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isResettingDb ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Purging Selected Collections...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Database Content (Prisma SQL)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SQL Operation Notice Feedback */}
        {sqlOperationNotice && (
          <div
            className={`p-4 rounded-2xl text-xs font-mono flex items-start gap-2.5 ${
              sqlOperationNotice.success
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
            }`}
          >
            {sqlOperationNotice.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>{sqlOperationNotice.message}</span>
          </div>
        )}
      </div>

      {/* Centralized API Hub Status Grid */}
      <div className="rounded-3xl bg-[#141444]/70 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Multi-Provider Centralized API Key Hub</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live status and quick management of all external AI providers and cloud communication APIs.
            </p>
          </div>

          <Link
            href="/admin/integrations"
            className="text-xs font-mono text-cyan-400 hover:text-white flex items-center gap-1 font-bold"
          >
            <span>Open Integrations Console</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Google Gemini API",
              status: apiHub.geminiApiKeyConfigured,
              role: "Public AI Assistant Chatbot",
              link: "/admin/automation",
            },
            {
              name: "OpenAI ChatGPT API",
              status: apiHub.openaiApiKeyConfigured,
              role: "Alternative AI Generation Engine",
              link: "/admin/integrations",
            },
            {
              name: "Groq High-Speed LPU",
              status: apiHub.groqApiKeyConfigured,
              role: "Ultra-low Latency Inference",
              link: "/admin/integrations",
            },
            {
              name: "Anthropic Claude API",
              status: apiHub.claudeApiKeyConfigured,
              role: "Technical Architecture Generation",
              link: "/admin/integrations",
            },
            {
              name: "Telegram Bot API",
              status: apiHub.telegramBotConfigured,
              role: "1-Click DB Snapshot & Inquiries",
              link: "/admin/backup",
            },
            {
              name: "Resend / SMTP API",
              status: apiHub.resendApiKeyConfigured,
              role: "Auto-Responder & Transactional Emails",
              link: "/admin/integrations",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#090924] border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-mono">{item.name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    item.status
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  }`}
                >
                  {item.status ? "CONFIGURED" : "PENDING SETUP"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{item.role}</p>

              <div className="pt-2 border-t border-slate-800">
                <Link
                  href={item.link}
                  className="text-[11px] font-mono text-cyan-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <span>Configure Settings</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

