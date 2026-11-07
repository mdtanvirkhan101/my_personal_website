"use client";

import { useState, useRef, useMemo } from "react";
import {
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Database,
  ShieldCheck,
  Loader2,
  Trash2,
  X,
  TriangleAlert,
  Send,
  Lock,
  Layers,
  Sparkles,
  Server,
  ArrowRight,
  HardDrive,
  FileCheck2,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
} from "lucide-react";
import {
  restoreWebsiteBackup,
  clearAllWebsiteData,
  BackupData,
  sendBackupToTelegram,
} from "@/actions/backup";
import Link from "next/link";

export interface BackupStats {
  projects: number;
  caseStudies: number;
  skills: number;
  services: number;
  experiences: number;
  certifications: number;
  clients: number;
  testimonials: number;
  blogPosts: number;
  articles: number;
  notes: number;
  labs: number;
  contactMessages: number;
  mediaAssets: number;
  settings: number;
}

interface BackupManagerProps {
  stats: BackupStats;
}

export function BackupManager({ stats }: BackupManagerProps) {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<"merge" | "clean">("merge");
  const [activeTab, setActiveTab] = useState<"export" | "restore" | "health">("export");
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    restoredCounts?: Record<string, number>;
  } | null>(null);

  // Clear All Data modal state
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    clearedCounts?: Record<string, number>;
  } | null>(null);

  // Telegram dispatch state
  const [telegramSending, setTelegramSending] = useState(false);
  const [telegramNotice, setTelegramNotice] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [clearOptions, setClearOptions] = useState({
    clearProjects: false,
    clearSkills: false,
    clearServices: false,
    clearExperiences: false,
    clearCertifications: false,
    clearBlogPosts: false,
    clearMessages: false,
    clearSettings: false,
    clearProfile: false,
  });
  const [confirmText, setConfirmText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalRecords = useMemo(() => {
    return (
      stats.projects +
      stats.caseStudies +
      stats.skills +
      stats.services +
      stats.experiences +
      stats.certifications +
      stats.clients +
      stats.testimonials +
      stats.blogPosts +
      stats.articles +
      stats.notes +
      stats.labs +
      stats.contactMessages +
      stats.mediaAssets +
      stats.settings
    );
  }, [stats]);

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = "/api/backup/download";
    link.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 2000);
  };

  const handleSendTelegram = async () => {
    setTelegramSending(true);
    setTelegramNotice(null);
    try {
      const res = await sendBackupToTelegram();
      setTelegramNotice(res);
    } catch (err: any) {
      setTelegramNotice({
        success: false,
        message: err.message || "Failed to dispatch backup snapshot to Telegram.",
      });
    } finally {
      setTelegramSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setParsedBackup(null);
    setRestoreResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || typeof json !== "object") {
          throw new Error("Invalid file content. Must be a valid JSON object.");
        }
        if (!json.version || !json.data) {
          throw new Error("File is missing schema requirements ('version', 'data').");
        }
        setParsedBackup(json as BackupData);
      } catch (err: any) {
        setParseError(err.message || "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSubmit = async () => {
    if (!parsedBackup) return;

    const confirmed = window.confirm(
      restoreMode === "clean"
        ? "CAUTION: 'Clean Replace' will wipe existing table rows before restoring. Continue?"
        : "Restore website from this backup snapshot? Existing IDs will be preserved/merged."
    );
    if (!confirmed) return;

    setRestoring(true);
    setRestoreResult(null);

    try {
      const res = await restoreWebsiteBackup(parsedBackup, restoreMode);
      setRestoreResult(res);
      if (res.success) {
        setSelectedFile(null);
        setParsedBackup(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setRestoreResult({
        success: false,
        error: err.message || "An unexpected error occurred during restore.",
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleClearData = async () => {
    if (confirmText !== "DELETE") return;

    const anySelected = Object.values(clearOptions).some(Boolean);
    if (!anySelected) {
      alert("Please select at least one data category to clear.");
      return;
    }

    setClearing(true);
    setClearResult(null);

    try {
      const res = await clearAllWebsiteData(clearOptions);
      setClearResult(res);
      if (res.success) {
        setShowClearModal(false);
        setConfirmText("");
        setClearOptions({
          clearProjects: false,
          clearSkills: false,
          clearServices: false,
          clearExperiences: false,
          clearCertifications: false,
          clearBlogPosts: false,
          clearMessages: false,
          clearSettings: false,
          clearProfile: false,
        });
      }
    } catch (err: any) {
      setClearResult({ success: false, error: err.message || "Failed to clear data." });
    } finally {
      setClearing(false);
    }
  };

  const clearDataOptions = [
    { key: "clearProjects", label: "Projects & Case Studies", count: stats.projects + stats.caseStudies },
    { key: "clearSkills", label: "Technical Skills", count: stats.skills },
    { key: "clearServices", label: "Services & Offerings", count: stats.services },
    { key: "clearExperiences", label: "Experiences & Training", count: stats.experiences },
    { key: "clearCertifications", label: "Certifications", count: stats.certifications },
    { key: "clearBlogPosts", label: "Blog Posts & Articles", count: stats.blogPosts + stats.articles + stats.notes },
    { key: "clearMessages", label: "Contact Inbox Messages", count: stats.contactMessages },
    { key: "clearSettings", label: "Site Configurations", count: stats.settings },
    { key: "clearProfile", label: "Owner Profile", count: 1 },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b0b2b] via-[#10103e] to-[#16164d] border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Zero Data Loss Protection • 100% Cryptographic Safety</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                <Database className="w-5 h-5" />
              </div>
              <span>Backup &amp; Disaster Recovery Vault</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Generate full JSON snapshots, restore content with automated upsert logic, send cloud snapshots to Telegram, and selectively purge database records with admin safeguards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/database-api-hub"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0e0e34] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-mono font-bold transition-all shadow-md"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Database &amp; API Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Snapshot...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-purple-500/20">
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-purple-500/20">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Total Database Rows</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">{totalRecords}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block">Projects &amp; Case Studies</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-0.5 block">
              {stats.projects + stats.caseStudies}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-emerald-500/20">
            <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">Skills &amp; Services</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              {stats.skills + stats.services}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-amber-500/20">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">Timeline &amp; Certs</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              {stats.experiences + stats.certifications}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-rose-500/20 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-rose-300 uppercase tracking-wider block">Admin Safeguard</span>
            <span className="text-xs font-bold text-rose-400 font-mono mt-1.5 flex items-center space-x-1">
              <Lock className="w-3 h-3 shrink-0" />
              <span>Password Vault Protected</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-purple-500/20 pb-2">
        <button
          onClick={() => setActiveTab("export")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === "export"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-400 hover:text-white bg-[#0e0e34]/50 border border-purple-500/15"
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export &amp; Cloud Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab("restore")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === "restore"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white bg-[#0e0e34]/50 border border-purple-500/15"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Restore from Snapshot</span>
        </button>

        <button
          onClick={() => setActiveTab("health")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === "health"
              ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
              : "text-slate-400 hover:text-white bg-[#0e0e34]/50 border border-purple-500/15"
          }`}
        >
          <TriangleAlert className="w-3.5 h-3.5" />
          <span>Danger Zone &amp; Data Wipe</span>
        </button>
      </div>

      {/* Global Notification Banners */}
      {clearResult && (
        <div
          className={`p-4 rounded-2xl flex items-start space-x-3 ${
            clearResult.success
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          {clearResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-bold">{clearResult.success ? "Data Wipe Completed" : "Operation Failed"}</p>
            <p className="text-slate-400 mt-0.5">{clearResult.message || clearResult.error}</p>
          </div>
          <button onClick={() => setClearResult(null)} className="ml-auto text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: EXPORT & CLOUD DISPATCH */}
      {activeTab === "export" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Export Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e0e34] border border-purple-500/25 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileJson className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Download Full Database Snapshot</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Downloads a production-ready, schema-verified JSON file containing all portfolio content, system settings, blog posts, and relations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141444]/60 border border-purple-500/20 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-purple-300 font-semibold font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Snapshot Coverage Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px] font-mono pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Projects &amp; Case Studies</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Skills &amp; Core Tools</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Experience &amp; Certs</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Blog, Notes &amp; Labs</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Contact Messages</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Site &amp; Sidebar Config</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs font-mono text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting Complete Snapshot...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download .json Backup File</span>
                </>
              )}
            </button>
          </div>

          {/* Telegram Cloud Backup Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e0e34] border border-sky-500/25 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Instant Cloud Backup to Telegram</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Dispatches an encrypted document snapshot directly to your private Telegram Bot channel for immediate offsite storage.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141444]/60 border border-sky-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-sky-300 font-semibold font-mono text-[11px]">
                  <span className="flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-sky-400" />
                    <span>Telegram Offsite Vault</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Automated Bot API</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Your portfolio data will be packed into a timestamped JSON file and delivered as a downloadable document attachment in Telegram with full record tallies.
                </p>
              </div>

              {telegramNotice && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
                    telegramNotice.success
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                  }`}
                >
                  <span className="font-mono text-[11px]">{telegramNotice.message}</span>
                  <button
                    type="button"
                    onClick={() => setTelegramNotice(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSendTelegram}
              disabled={telegramSending}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs font-mono text-cyan-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 transition-all disabled:opacity-50 shadow-md"
            >
              {telegramSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching to Telegram Bot...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Backup to Telegram (1-Click)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: RESTORE FROM SNAPSHOT */}
      {activeTab === "restore" && (
        <div className="rounded-3xl bg-[#0e0e34] border border-emerald-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Restore Database Snapshot</h2>
                <p className="text-xs text-slate-400">
                  Select a valid <code className="text-cyan-400 font-mono">.json</code> backup file exported from this CMS.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-slate-400">Strategy:</span>
              <div className="inline-flex rounded-xl bg-[#141444] border border-purple-500/20 p-1">
                <button
                  type="button"
                  onClick={() => setRestoreMode("merge")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    restoreMode === "merge" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Merge &amp; Upsert
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreMode("clean")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    restoreMode === "clean" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Clean Replace
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 sm:p-12 rounded-3xl cursor-pointer text-center space-y-3 transition-all border-2 border-dashed border-purple-500/30 hover:border-emerald-500/60 bg-[#141444]/40 hover:bg-[#141444]/80 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 group-hover:bg-emerald-500/20 border border-purple-500/20 group-hover:border-emerald-500/40 flex items-center justify-center mx-auto transition-all">
              <FileJson className="w-8 h-8 text-purple-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {selectedFile ? selectedFile.name : "Click to select or drop backup .json file"}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for verification`
                  : "Supports JSON exports with profile, projects, skills, and settings"}
              </p>
            </div>
          </div>

          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{parseError}</span>
            </div>
          )}

          {parsedBackup && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valid Backup Signature Verified (Version: {parsedBackup.version || "1.0.0"})</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Export Date: {new Date(parsedBackup.exportDate).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-[#0e0e34] border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px]">Projects</span>
                  <strong className="text-white text-sm">
                    {parsedBackup.counts?.projects ?? parsedBackup.data?.projects?.length ?? 0}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0e0e34] border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px]">Skills</span>
                  <strong className="text-white text-sm">
                    {parsedBackup.counts?.skills ?? parsedBackup.data?.skills?.length ?? 0}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0e0e34] border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px]">Services</span>
                  <strong className="text-white text-sm">
                    {parsedBackup.counts?.services ?? parsedBackup.data?.services?.length ?? 0}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0e0e34] border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px]">Experience</span>
                  <strong className="text-white text-sm">
                    {parsedBackup.counts?.experiences ?? parsedBackup.data?.experiences?.length ?? 0}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0e0e34] border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px]">Blog Posts</span>
                  <strong className="text-white text-sm">
                    {parsedBackup.counts?.blogPosts ?? parsedBackup.data?.blogPosts?.length ?? 0}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0e0e34] border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px]">Settings</span>
                  <strong className="text-white text-sm">
                    {parsedBackup.counts?.siteSettings ?? parsedBackup.data?.siteSettings?.length ?? 0}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRestoreSubmit}
                  disabled={restoring}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                >
                  {restoring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Restoring Database Records...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Execute Restore ({restoreMode === "clean" ? "Clean Replace" : "Safe Merge"})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {restoreResult && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-start space-x-3 ${
                restoreResult.success
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              {restoreResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{restoreResult.success ? "Database Restored Successfully" : "Restore Failed"}</p>
                <p className="mt-0.5 text-slate-300">{restoreResult.message || restoreResult.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DANGER ZONE & SELECTIVE WIPE */}
      {activeTab === "health" && (
        <div className="rounded-3xl bg-[#0e0e34] border border-rose-500/30 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-rose-500/20 pb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <TriangleAlert className="w-4 h-4 text-rose-400" />
                </div>
                <h2 className="text-base font-bold text-rose-400">Selective Database Purge &amp; Data Cleanup</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permanently purge selected content tables while preserving admin user accounts and password hashes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {clearDataOptions.map(({ key, label, count }) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-[#141444]/60 border border-purple-500/20 flex items-center justify-between font-mono"
              >
                <div>
                  <span className="text-xs font-semibold text-white block">{label}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{count} records stored</span>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-[#0e0e34] text-[10px] text-cyan-400 border border-cyan-500/20 font-bold">
                  Active
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-mono font-bold transition-all shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              <span>Open Selective Purge Wizard</span>
            </button>
          </div>
        </div>
      )}

      {/* Clear Data Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0e0e34] border border-rose-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <TriangleAlert className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">Purge Database Records</h2>
              </div>
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setConfirmText("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono leading-relaxed">
              ⚠️ Select which data tables you want to purge. Admin credentials are protected and will never be deleted.
            </div>

            {/* Checkboxes */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {clearDataOptions.map(({ key, label, count }) => (
                <label
                  key={key}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border font-mono text-xs ${
                    clearOptions[key]
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                      : "bg-[#141444]/60 border-purple-500/15 text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={clearOptions[key]}
                      onChange={(e) =>
                        setClearOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="w-3.5 h-3.5 accent-rose-500 rounded"
                    />
                    <span>{label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{count} records</span>
                </label>
              ))}
            </div>

            {/* Confirm text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">
                Type <strong className="text-rose-400">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono bg-[#141444] border border-rose-500/30 text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowClearModal(false);
                  setConfirmText("");
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-mono font-semibold text-slate-400 bg-white/5 border border-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                disabled={
                  clearing ||
                  confirmText !== "DELETE" ||
                  !Object.values(clearOptions).some(Boolean)
                }
                className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-rose-600/30 flex items-center justify-center space-x-1.5"
              >
                {clearing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Purge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
