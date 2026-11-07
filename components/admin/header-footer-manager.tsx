"use client";

import React, { useState, useRef } from "react";
import { HeaderFooterConfig, SocialProfileItem } from "@/lib/header-footer-config";
import { saveHeaderFooterConfig, resetHeaderFooterConfig } from "@/actions/header-footer";
import {
  PanelTop,
  PanelBottom,
  Save,
  RotateCcw,
  ExternalLink,
  Upload,
  Check,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Send,
  Sliders,
  Eye,
  EyeOff,
  Code2,
  FileText,
  Globe,
  Share2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  Terminal,
  Images,
} from "lucide-react";
import { MediaPickerModal } from "./media-picker-modal";

interface HeaderFooterManagerProps {
  initialConfig: HeaderFooterConfig;
}

export function HeaderFooterManager({ initialConfig }: HeaderFooterManagerProps) {
  const [config, setConfig] = useState<HeaderFooterConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Header Logo file upload state
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isHeaderLogoPickerOpen, setIsHeaderLogoPickerOpen] = useState(false);

  // Footer Logo file upload state
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFooterLogo, setIsUploadingFooterLogo] = useState(false);
  const [footerLogoSuccess, setFooterLogoSuccess] = useState(false);
  const [footerLogoError, setFooterLogoError] = useState<string | null>(null);
  const [isFooterLogoPickerOpen, setIsFooterLogoPickerOpen] = useState(false);

  const handleChange = (field: keyof HeaderFooterConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadError(null);
    setLogoUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload logo");
      }

      handleChange("headerSiteLogo", data.url);
      setLogoUploadSuccess(true);
      setTimeout(() => setLogoUploadSuccess(false), 3000);
    } catch (err: any) {
      setLogoUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFooterLogo(true);
    setFooterLogoError(null);
    setFooterLogoSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      handleChange("footerBrandLogo", data.url);
      setFooterLogoSuccess(true);
      setTimeout(() => setFooterLogoSuccess(false), 3000);
    } catch (err: any) {
      setFooterLogoError(err.message || "Failed to upload image");
    } finally {
      setIsUploadingFooterLogo(false);
      if (footerLogoInputRef.current) {
        footerLogoInputRef.current.value = "";
      }
    }
  };

  // Multiple Social Profiles CRUD
  const addSocialProfile = () => {
    const newProfile: SocialProfileItem = {
      id: "sp-" + Date.now(),
      platform: "github",
      url: "",
      label: "GitHub",
    };
    setConfig((prev) => ({
      ...prev,
      footerSocialProfiles: [...(prev.footerSocialProfiles || []), newProfile],
    }));
  };

  const removeSocialProfile = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      footerSocialProfiles: (prev.footerSocialProfiles || []).filter((p) => p.id !== id),
    }));
  };

  const updateSocialProfile = (id: string, field: keyof SocialProfileItem, val: string) => {
    setConfig((prev) => ({
      ...prev,
      footerSocialProfiles: (prev.footerSocialProfiles || []).map((p) => {
        if (p.id !== id) return p;
        return { ...p, [field]: val };
      }),
    }));
  };

  const moveSocialProfile = (idx: number, direction: "up" | "down") => {
    setConfig((prev) => {
      const list = [...(prev.footerSocialProfiles || [])];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, footerSocialProfiles: list };
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await saveHeaderFooterConfig(config);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Header & Footer settings saved successfully! Live website updated.",
        });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to save settings",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset Header & Footer to default values?")) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetHeaderFooterConfig();
      if (res.success) {
        window.location.reload();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to reset" });
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141444] via-[#10103b] to-[#0e0e34] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Global Layout CMS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Header &amp; Footer Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage the top navigation header and the multi-column footer across all public website pages. Update brand logos, action buttons, contact info, and social links in real time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0e0e34] hover:bg-[#18184a] border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-all flex items-center space-x-1.5 shadow-md"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>

            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || isSaving}
              className="px-4 py-2.5 rounded-xl bg-[#0e0e34] hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono font-medium transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Header &amp; Footer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`mt-6 p-4 rounded-2xl flex items-center space-x-3 text-xs font-mono border animate-in fade-in duration-200 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyan-500/20 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("header")}
          className={`flex items-center space-x-2 px-6 py-3 rounded-t-2xl font-mono text-xs font-semibold transition-all border-t border-x ${
            activeTab === "header"
              ? "bg-[#141444] border-cyan-500/40 text-cyan-300 shadow-lg border-b-transparent"
              : "bg-transparent border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <PanelTop className="w-4 h-4 text-cyan-400" />
          <span>Header (Navbar) Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`flex items-center space-x-2 px-6 py-3 rounded-t-2xl font-mono text-xs font-semibold transition-all border-t border-x ${
            activeTab === "footer"
              ? "bg-[#141444] border-cyan-500/40 text-cyan-300 shadow-lg border-b-transparent"
              : "bg-transparent border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <PanelBottom className="w-4 h-4 text-blue-400" />
          <span>Footer Settings</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} noValidate className="space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: HEADER (NAVBAR)                                    */}
        {/* ========================================================= */}
        {activeTab === "header" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0e0e34] border border-cyan-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-cyan-500/20 pb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <PanelTop className="w-5 h-5 text-cyan-400" />
                  <span>Navbar Brand &amp; Identity</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Appears on the top left of every public page.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Site Brand Title
                  </label>
                  <input
                    type="text"
                    value={config.headerSiteTitle}
                    onChange={(e) => handleChange("headerSiteTitle", e.target.value)}
                    placeholder="e.g. MD Tanvir Khan"
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Site Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={config.headerSiteTagline}
                    onChange={(e) => handleChange("headerSiteTagline", e.target.value)}
                    placeholder="e.g. SYSTEM & NETWORK ENGINEER"
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Logo Upload & Preview */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-mono text-slate-300 font-semibold block">
                  Navbar Logo (Icon or Custom Image)
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#141444]/60 border border-cyan-500/20">
                  <div className="w-14 h-14 rounded-xl border border-cyan-500/30 overflow-hidden bg-[#0e0e34] flex items-center justify-center shrink-0">
                    {config.headerSiteLogo ? (
                      <img
                        src={config.headerSiteLogo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).style.display = "none";
                        }}
                      />
                    ) : (
                      <Code2 className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={config.headerSiteLogo}
                        onChange={(e) => handleChange("headerSiteLogo", e.target.value)}
                        placeholder="https://... or upload from computer"
                        className="flex-1 bg-[#0e0e34] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                      />

                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        disabled={isUploadingLogo}
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-mono font-bold transition-all flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                      >
                        {isUploadingLogo ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : logoUploadSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Uploaded!</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Logo</span>
                          </>
                        )}
                      </button>

                      {/* Choose from Library */}
                      <button
                        type="button"
                        onClick={() => setIsHeaderLogoPickerOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 shadow-sm"
                        title="Choose from previously uploaded images"
                      >
                        <Images className="w-3.5 h-3.5 text-purple-400" />
                        <span>Choose from Library</span>
                      </button>
                    </div>

                    {logoUploadError && (
                      <p className="text-[10px] text-rose-400 font-mono">{logoUploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Action Buttons (CTAs) */}
              <div className="border-t border-cyan-500/20 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Header Action Buttons (Top-Right)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CTA 1 (CV) */}
                  <div className="p-5 rounded-2xl bg-[#141444]/60 border border-cyan-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        Action Button 1 (Secondary)
                      </span>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-[10px] font-mono text-slate-400">Show on Navbar</span>
                        <input
                          type="checkbox"
                          checked={config.headerShowCta1}
                          onChange={(e) => handleChange("headerShowCta1", e.target.checked)}
                          className="w-4 h-4 accent-cyan-500 rounded"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={config.headerCta1Text}
                          onChange={(e) => handleChange("headerCta1Text", e.target.value)}
                          placeholder="CV"
                          className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Link URL
                        </label>
                        <input
                          type="text"
                          value={config.headerCta1Url}
                          onChange={(e) => handleChange("headerCta1Url", e.target.value)}
                          placeholder="/resume"
                          className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA 2 (Let's Talk) */}
                  <div className="p-5 rounded-2xl bg-[#141444]/60 border border-cyan-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        Action Button 2 (Primary Glow)
                      </span>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-[10px] font-mono text-slate-400">Show on Navbar</span>
                        <input
                          type="checkbox"
                          checked={config.headerShowCta2}
                          onChange={(e) => handleChange("headerShowCta2", e.target.checked)}
                          className="w-4 h-4 accent-cyan-500 rounded"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={config.headerCta2Text}
                          onChange={(e) => handleChange("headerCta2Text", e.target.value)}
                          placeholder="Let's Talk"
                          className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Link URL
                        </label>
                        <input
                          type="text"
                          value={config.headerCta2Url}
                          onChange={(e) => handleChange("headerCta2Url", e.target.value)}
                          placeholder="/contact"
                          className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FOOTER SETTINGS                                    */}
        {/* ========================================================= */}
        {activeTab === "footer" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0e0e34] border border-cyan-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-cyan-500/20 pb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <PanelBottom className="w-5 h-5 text-blue-400" />
                  <span>Footer Brand &amp; Contact Info</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Displayed in Column 1 and across the bottom of the public footer.
                </p>
              </div>

              {/* Footer Brand Logo / Image Upload Section */}
              <div className="p-5 rounded-2xl bg-[#141444]/60 border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      Footer Brand Logo / Badge Image
                    </span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-[10px] font-mono text-slate-400">Show on Footer</span>
                    <input
                      type="checkbox"
                      checked={config.footerShowLogo}
                      onChange={(e) => handleChange("footerShowLogo", e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0e0e34] border border-cyan-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {config.footerBrandLogo ? (
                      <img
                        src={config.footerBrandLogo}
                        alt="Footer Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Terminal className="w-7 h-7 text-cyan-500/50" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={footerLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFooterLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => footerLogoInputRef.current?.click()}
                        disabled={isUploadingFooterLogo}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        {isUploadingFooterLogo ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Footer Image / Logo</span>
                          </>
                        )}
                      </button>

                      {/* Choose from Library */}
                      <button
                        type="button"
                        onClick={() => setIsFooterLogoPickerOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center space-x-1.5"
                        title="Choose from previously uploaded images"
                      >
                        <Images className="w-3.5 h-3.5 text-purple-400" />
                        <span>Choose from Library</span>
                      </button>

                      {config.footerBrandLogo && (
                        <button
                          type="button"
                          onClick={() => handleChange("footerBrandLogo", "")}
                          className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {footerLogoSuccess && (
                      <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Footer image uploaded successfully!</span>
                      </div>
                    )}
                    {footerLogoError && (
                      <div className="text-[11px] font-mono text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{footerLogoError}</span>
                      </div>
                    )}
                    <p className="text-[11px] font-mono text-slate-500">
                      Upload transparent PNG or SVG logo for crisp display in public footer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Footer Brand Title
                  </label>
                  <input
                    type="text"
                    value={config.footerBrandTitle}
                    onChange={(e) => handleChange("footerBrandTitle", e.target.value)}
                    placeholder="MD Tanvir Khan"
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Footer Brand Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={config.footerBrandTagline}
                    onChange={(e) => handleChange("footerBrandTagline", e.target.value)}
                    placeholder="Systems & Network Engineer"
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  About Us Short Pitch
                </label>
                <textarea
                  rows={3}
                  value={config.footerAboutText}
                  onChange={(e) => handleChange("footerAboutText", e.target.value)}
                  className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl p-4 text-xs text-slate-200 leading-relaxed resize-none"
                />
              </div>

              {/* Phone, Email, Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    type="text"
                    value={config.footerContactPhone}
                    onChange={(e) => handleChange("footerContactPhone", e.target.value)}
                    placeholder="+880 1601-501775"
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Contact Email</span>
                  </label>
                  <input
                    type="text"
                    value={config.footerContactEmail}
                    onChange={(e) => handleChange("footerContactEmail", e.target.value)}
                    placeholder="mdtanvirkhan.nt@gmail.com"
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={config.footerLocation}
                    onChange={(e) => handleChange("footerLocation", e.target.value)}
                    placeholder="Kuril, Bhatara, Dhaka-1229"
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Newsletter Box Customizer */}
              <div className="border-t border-cyan-500/20 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>Newsletter Subscription Box (Column 4)</span>
                  </h4>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-xs font-mono text-slate-400">Show Newsletter Box</span>
                    <input
                      type="checkbox"
                      checked={config.footerShowNewsletter}
                      onChange={(e) => handleChange("footerShowNewsletter", e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Box Title
                    </label>
                    <input
                      type="text"
                      value={config.footerNewsletterTitle}
                      onChange={(e) => handleChange("footerNewsletterTitle", e.target.value)}
                      placeholder="Subscribe More Info"
                      className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Input Placeholder
                    </label>
                    <input
                      type="text"
                      value={config.footerNewsletterPlaceholder}
                      onChange={(e) => handleChange("footerNewsletterPlaceholder", e.target.value)}
                      placeholder="Enter your Email"
                      className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={config.footerNewsletterBtnText}
                      onChange={(e) => handleChange("footerNewsletterBtnText", e.target.value)}
                      placeholder="Subscribe"
                      className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Multiple Social Media Profiles Manager */}
              <div className="border-t border-cyan-500/20 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      <span>Multiple Social Media Profiles</span>
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Add, remove, and reorder any number of social media profiles (WhatsApp, YouTube, GitHub, Telegram, LinkedIn, etc.)
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <span className="text-xs font-mono text-slate-400">Show Social Icons</span>
                      <input
                        type="checkbox"
                        checked={config.footerShowSocials}
                        onChange={(e) => handleChange("footerShowSocials", e.target.checked)}
                        className="w-4 h-4 accent-cyan-500 rounded"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={addSocialProfile}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-mono font-bold hover:opacity-90 transition-all flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Profile</span>
                    </button>
                  </div>
                </div>

                {/* Profiles List */}
                <div className="space-y-3">
                  {(config.footerSocialProfiles || []).length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#141444] border border-slate-700/60 text-center text-xs font-mono text-slate-400">
                      No social profiles added yet. Click &quot;Add Profile&quot; to add your first social link.
                    </div>
                  ) : (
                    (config.footerSocialProfiles || []).map((profile, idx) => (
                      <div
                        key={profile.id}
                        className="p-3.5 rounded-2xl bg-[#141444] border border-cyan-500/20 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all hover:border-cyan-500/40"
                      >
                        {/* Platform Selector */}
                        <div className="w-full md:w-44 shrink-0">
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">
                            Platform
                          </label>
                          <select
                            value={profile.platform}
                            onChange={(e) => updateSocialProfile(profile.id, "platform", e.target.value)}
                            className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                          >
                            <option value="github">GitHub</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="facebook">Facebook</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                            <option value="telegram">Telegram</option>
                            <option value="discord">Discord</option>
                            <option value="website">Personal Website</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Label */}
                        <div className="w-full md:w-40 shrink-0">
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">
                            Display Label / Tooltip
                          </label>
                          <input
                            type="text"
                            value={profile.label || ""}
                            onChange={(e) => updateSocialProfile(profile.id, "label", e.target.value)}
                            placeholder={profile.platform}
                            className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                          />
                        </div>

                        {/* URL */}
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">
                            Target URL (e.g. https://...)
                          </label>
                          <input
                            type="text"
                            value={profile.url}
                            onChange={(e) => updateSocialProfile(profile.id, "url", e.target.value)}
                            placeholder={`https://${profile.platform === "whatsapp" ? "wa.me/..." : profile.platform + ".com/..."}`}
                            className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                          />
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center space-x-1.5 self-end md:self-center shrink-0 pt-2 md:pt-4">
                          <button
                            type="button"
                            onClick={() => moveSocialProfile(idx, "up")}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-2 rounded-lg bg-[#0e0e34] border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSocialProfile(idx, "down")}
                            disabled={idx === (config.footerSocialProfiles || []).length - 1}
                            title="Move Down"
                            className="p-2 rounded-lg bg-[#0e0e34] border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSocialProfile(profile.id)}
                            title="Delete Profile"
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Copyright & Back-to-Top */}
              <div className="border-t border-cyan-500/20 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-mono">
                    Copyright &amp; Bottom Bar
                  </h4>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-xs font-mono text-slate-400">Show Back to Top Button</span>
                    <input
                      type="checkbox"
                      checked={config.footerShowScrollTop}
                      onChange={(e) => handleChange("footerShowScrollTop", e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300 font-semibold block">
                    Copyright Notice Text (Use &#123;year&#125; for dynamic current year)
                  </label>
                  <input
                    type="text"
                    value={config.footerCopyrightText}
                    onChange={(e) => handleChange("footerCopyrightText", e.target.value)}
                    placeholder="{year} © MD Tanvir Khan. All rights reserved."
                    className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 rounded-2xl bg-[#141444]/90 border border-cyan-500/30 flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            <span>Updates will immediately reflect across all public pages and navigation bars</span>
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || isSaving}
              className="px-4 py-2 rounded-xl bg-[#0e0e34] border border-slate-700 text-slate-300 text-xs font-mono hover:text-white transition-all disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Header &amp; Footer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Header Logo Media Picker Modal */}
      <MediaPickerModal
        isOpen={isHeaderLogoPickerOpen}
        onClose={() => setIsHeaderLogoPickerOpen(false)}
        onSelect={(selectedUrl) => handleChange("headerSiteLogo", selectedUrl)}
        currentValue={config.headerSiteLogo}
        title="Select Header Logo from Media Library"
      />

      {/* Footer Logo Media Picker Modal */}
      <MediaPickerModal
        isOpen={isFooterLogoPickerOpen}
        onClose={() => setIsFooterLogoPickerOpen(false)}
        onSelect={(selectedUrl) => handleChange("footerBrandLogo", selectedUrl)}
        currentValue={config.footerBrandLogo}
        title="Select Footer Logo from Media Library"
      />
    </div>
  );
}
