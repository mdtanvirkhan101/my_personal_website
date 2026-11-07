"use client";

import React, { useState, useRef } from "react";
import { HomePageConfig } from "@/lib/home-page-config";
import { saveHomePageConfig, resetHomePageConfig } from "@/actions/home-page";
import {
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  LayoutTemplate,
  Sliders,
  Type,
  PhoneCall,
  User,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Award,
  FlaskConical,
  Briefcase,
  FolderGit2,
  BookOpen,
  MessageSquare,
  Wrench,
  Check,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Images,
} from "lucide-react";
import { MediaPickerModal } from "./media-picker-modal";

interface HomePageManagerProps {
  initialConfig: HomePageConfig;
}

export function HomePageManager({ initialConfig }: HomePageManagerProps) {
  const [config, setConfig] = useState<HomePageConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<
    "hero" | "metrics" | "sections" | "titles" | "contact"
  >("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Avatar upload states
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // Field change handler
  const handleChange = (field: keyof HomePageConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Avatar file upload handler
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setAvatarUploadError(null);
    setAvatarUploadSuccess(false);

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

      handleChange("heroAvatarUrl", data.url);
      setAvatarUploadSuccess(true);
      setTimeout(() => setAvatarUploadSuccess(false), 3000);
    } catch (err: any) {
      setAvatarUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = "";
      }
    }
  };

  // Save handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await saveHomePageConfig(config);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Home page configuration successfully saved & live site updated!",
        });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to save configuration",
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

  // Reset handler
  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all Home Page settings to default values?")) {
      return;
    }

    setIsResetting(true);
    setStatusMessage(null);

    try {
      const res = await resetHomePageConfig();
      if (res.success) {
        window.location.reload();
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to reset configuration",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to reset",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const tabs = [
    { id: "hero", label: "Hero & Pitch", icon: Sparkles },
    { id: "metrics", label: "Key Metrics", icon: Sliders },
    { id: "sections", label: "Section Toggles", icon: LayoutTemplate },
    { id: "titles", label: "Titles & Limits", icon: Type },
    { id: "contact", label: "Contact CTA", icon: PhoneCall },
  ];

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141444] via-[#10103b] to-[#0e0e34] border border-purple-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Landing Page CMS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Home Page Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Customize and manage all content on your public home page. Control hero headings, CTA buttons, metrics counters, section visibility toggles, and contact callouts in real time.
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white text-xs font-mono font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Home Page</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`mt-6 p-4 rounded-2xl flex items-center space-x-3 text-xs font-mono border animate-in fade-in slide-in-from-top-2 duration-200 ${
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

      {/* Tabs Bar */}
      <div className="flex border-b border-purple-500/20 gap-2 overflow-x-auto pb-px scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-t-2xl font-mono text-xs font-semibold whitespace-nowrap transition-all border-t border-x ${
                isActive
                  ? "bg-[#141444] border-purple-500/40 text-purple-300 shadow-lg border-b-transparent"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#141444]/40"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} noValidate className="space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: HERO & PITCH SECTION                              */}
        {/* ========================================================= */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-purple-500/20 pb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Hero Pitch &amp; Top Branding</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Manage the very first banner visitors see when they open your website.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Greeting Tag
                  </label>
                  <input
                    type="text"
                    value={config.heroGreeting}
                    onChange={(e) => handleChange("heroGreeting", e.target.value)}
                    placeholder="e.g. 👋 Hello, I'm"
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    Shown inside the top pill badge
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    First Name(s)
                  </label>
                  <input
                    type="text"
                    value={config.heroName}
                    onChange={(e) => handleChange("heroName", e.target.value)}
                    placeholder="e.g. MD Tanvir"
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Highlighted Word (Gradient)
                  </label>
                  <input
                    type="text"
                    value={config.heroNameHighlight}
                    onChange={(e) => handleChange("heroNameHighlight", e.target.value)}
                    placeholder="e.g. Khan"
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Professional Headline / Subtitle
                </label>
                <input
                  type="text"
                  value={config.heroRole}
                  onChange={(e) => handleChange("heroRole", e.target.value)}
                  placeholder="e.g. Associate Engineer & Full Stack Developer"
                  className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-cyan-400 font-mono font-semibold focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Hero Pitch / Short Bio
                </label>
                <textarea
                  rows={3}
                  value={config.heroDescription}
                  onChange={(e) => handleChange("heroDescription", e.target.value)}
                  placeholder="Describe your expertise and what makes your solutions stand out..."
                  className="w-full bg-[#141444] border border-purple-500/20 rounded-xl p-4 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-400 transition-colors resize-none"
                />
              </div>

              {/* Call-to-Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Primary Button */}
                <div className="p-5 rounded-2xl bg-[#141444]/60 border border-purple-500/20 space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Primary CTA Button</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={config.heroPrimaryBtnText}
                        onChange={(e) => handleChange("heroPrimaryBtnText", e.target.value)}
                        placeholder="Hire Me"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Link URL / Anchor
                      </label>
                      <input
                        type="text"
                        value={config.heroPrimaryBtnUrl}
                        onChange={(e) => handleChange("heroPrimaryBtnUrl", e.target.value)}
                        placeholder="#contact"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="p-5 rounded-2xl bg-[#141444]/60 border border-purple-500/20 space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Secondary CTA Button</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={config.heroSecondaryBtnText}
                        onChange={(e) => handleChange("heroSecondaryBtnText", e.target.value)}
                        placeholder="View Projects"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Link URL / Anchor
                      </label>
                      <input
                        type="text"
                        value={config.heroSecondaryBtnUrl}
                        onChange={(e) => handleChange("heroSecondaryBtnUrl", e.target.value)}
                        placeholder="#projects"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Metric Badges on Profile Photo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-[#141444]/60 border border-purple-500/20 space-y-3">
                  <span className="text-xs font-mono font-bold text-purple-300 block">
                    Left Floating Badge (on Photo)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Badge Value
                      </label>
                      <input
                        type="text"
                        value={config.heroBadge1Value}
                        onChange={(e) => handleChange("heroBadge1Value", e.target.value)}
                        placeholder="5+"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Badge Label
                      </label>
                      <input
                        type="text"
                        value={config.heroBadge1Label}
                        onChange={(e) => handleChange("heroBadge1Label", e.target.value)}
                        placeholder="Years Experience"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#141444]/60 border border-purple-500/20 space-y-3">
                  <span className="text-xs font-mono font-bold text-cyan-300 block">
                    Right Floating Badge (on Photo)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Badge Value
                      </label>
                      <input
                        type="text"
                        value={config.heroBadge2Value}
                        onChange={(e) => handleChange("heroBadge2Value", e.target.value)}
                        placeholder="50+"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Badge Label
                      </label>
                      <input
                        type="text"
                        value={config.heroBadge2Label}
                        onChange={(e) => handleChange("heroBadge2Label", e.target.value)}
                        placeholder="Projects Completed"
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar URL & File Upload */}
              <div className="space-y-3 pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 font-semibold block">
                    Hero Profile Photo
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    Upload image from device or paste URL
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#141444]/60 border border-purple-500/20">
                  {/* Avatar Circular Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-purple-500/50 shrink-0 bg-[#0e0e34] shadow-lg shadow-purple-500/20">
                      <img
                        src={config.heroAvatarUrl}
                        alt="Hero Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Input & Upload Button */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={config.heroAvatarUrl}
                        onChange={(e) => handleChange("heroAvatarUrl", e.target.value)}
                        placeholder="https://... or click Upload Image"
                        className="flex-1 bg-[#0e0e34] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 transition-colors font-mono"
                      />

                      {/* Hidden File Input */}
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelect}
                        className="hidden"
                      />

                      {/* Upload Button */}
                      <button
                        type="button"
                        disabled={isUploadingAvatar}
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white text-xs font-mono font-bold transition-all flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-purple-500/25 disabled:opacity-50"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Uploading...</span>
                          </>
                        ) : avatarUploadSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Uploaded!</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-white" />
                            <span>Upload Image</span>
                          </>
                        )}
                      </button>

                      {/* Choose from Library Button */}
                      <button
                        type="button"
                        onClick={() => setIsAvatarPickerOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 shadow-sm"
                        title="Choose from previously uploaded images"
                      >
                        <Images className="w-3.5 h-3.5 text-purple-400" />
                        <span>Choose from Library</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono">
                      {avatarUploadError ? (
                        <span className="text-rose-400 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{avatarUploadError}</span>
                        </span>
                      ) : avatarUploadSuccess ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Photo uploaded and set successfully!</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Supports PNG, JPG, JPEG, WEBP (Max 50MB)
                        </span>
                      )}

                      {config.heroAvatarUrl && (
                        <a
                          href={config.heroAvatarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-white flex items-center space-x-1"
                        >
                          <span>Open Image</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: KEY METRICS COUNTER STRIP                         */}
        {/* ========================================================= */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-purple-500/20 pb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <span>Key Summary Metrics (Counter Bar)</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  The 4 animated metric boxes displayed right below the hero section.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="p-5 rounded-2xl bg-[#141444] border border-purple-500/30 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Metric 1 (Experience)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        value={config.metric1Value}
                        onChange={(e) => handleChange("metric1Value", parseInt(e.target.value) || 0)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Suffix
                      </label>
                      <input
                        type="text"
                        value={config.metric1Suffix}
                        onChange={(e) => handleChange("metric1Suffix", e.target.value)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={config.metric1Label}
                      onChange={(e) => handleChange("metric1Label", e.target.value)}
                      className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-5 rounded-2xl bg-[#141444] border border-cyan-500/30 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>Metric 2 (Projects)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        value={config.metric2Value}
                        onChange={(e) => handleChange("metric2Value", parseInt(e.target.value) || 0)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Suffix
                      </label>
                      <input
                        type="text"
                        value={config.metric2Suffix}
                        onChange={(e) => handleChange("metric2Suffix", e.target.value)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={config.metric2Label}
                      onChange={(e) => handleChange("metric2Label", e.target.value)}
                      className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-5 rounded-2xl bg-[#141444] border border-amber-500/30 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Metric 3 (Clients)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        value={config.metric3Value}
                        onChange={(e) => handleChange("metric3Value", parseInt(e.target.value) || 0)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Suffix
                      </label>
                      <input
                        type="text"
                        value={config.metric3Suffix}
                        onChange={(e) => handleChange("metric3Suffix", e.target.value)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={config.metric3Label}
                      onChange={(e) => handleChange("metric3Label", e.target.value)}
                      className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="p-5 rounded-2xl bg-[#141444] border border-pink-500/30 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-pink-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    <span>Metric 4 (Tech Stack)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        value={config.metric4Value}
                        onChange={(e) => handleChange("metric4Value", parseInt(e.target.value) || 0)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Suffix
                      </label>
                      <input
                        type="text"
                        value={config.metric4Suffix}
                        onChange={(e) => handleChange("metric4Suffix", e.target.value)}
                        className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={config.metric4Label}
                      onChange={(e) => handleChange("metric4Label", e.target.value)}
                      className="w-full bg-[#0e0e34] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SECTION VISIBILITY TOGGLES                        */}
        {/* ========================================================= */}
        {activeTab === "sections" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-purple-500/20 pb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                  <span>Section Visibility &amp; Display Toggles</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Turn sections ON or OFF on the public landing page with one click.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    key: "showHero",
                    label: "1. Hero Pitch Section",
                    desc: "Main introduction, avatar & CTAs",
                    icon: Sparkles,
                    color: "text-purple-400",
                  },
                  {
                    key: "showMetrics",
                    label: "2. Key Metrics Strip",
                    desc: "4 animated statistic counters",
                    icon: Sliders,
                    color: "text-cyan-400",
                  },
                  {
                    key: "showAbout",
                    label: "3. About Me Preview",
                    desc: "Bio summary & More About Me button",
                    icon: User,
                    color: "text-blue-400",
                  },
                  {
                    key: "showSkills",
                    label: "4. My Skills Preview",
                    desc: "Interactive progress bar skill list",
                    icon: Wrench,
                    color: "text-indigo-400",
                  },
                  {
                    key: "showServices",
                    label: "5. Services / What I Do",
                    desc: "Specialized offerings & cards",
                    icon: Briefcase,
                    color: "text-violet-400",
                  },
                  {
                    key: "showProjects",
                    label: "6. Featured Projects",
                    desc: "Portfolio grid with live demo links",
                    icon: FolderGit2,
                    color: "text-cyan-400",
                  },
                  {
                    key: "showExperience",
                    label: "7. Experience Timeline",
                    desc: "Job roles & responsibilities",
                    icon: Layers,
                    color: "text-amber-400",
                  },
                  {
                    key: "showLabs",
                    label: "8. R&D Sandbox Labs",
                    desc: "Virtual test lab environments",
                    icon: FlaskConical,
                    color: "text-pink-400",
                  },
                  {
                    key: "showCertifications",
                    label: "9. Accredited Certifications",
                    desc: "Cisco, MikroTik & VoIP badges",
                    icon: Award,
                    color: "text-yellow-400",
                  },
                  {
                    key: "showClients",
                    label: "10. What Clients Say",
                    desc: "Testimonial cards & reviews",
                    icon: MessageSquare,
                    color: "text-teal-400",
                  },
                  {
                    key: "showBlog",
                    label: "11. Latest Blog Posts",
                    desc: "Recent articles & technical notes",
                    icon: BookOpen,
                    color: "text-emerald-400",
                  },
                  {
                    key: "showContact",
                    label: "12. Contact & Project Pitch",
                    desc: "Direct message form & phone card",
                    icon: PhoneCall,
                    color: "text-rose-400",
                  },
                ].map((sec) => {
                  const Icon = sec.icon;
                  const isVisible = (config as any)[sec.key];
                  return (
                    <div
                      key={sec.key}
                      onClick={() => handleChange(sec.key as any, !isVisible)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between select-none ${
                        isVisible
                          ? "bg-[#141444] border-purple-500/40 shadow-lg shadow-purple-500/10 hover:border-purple-400"
                          : "bg-[#0e0e34]/60 border-slate-800 opacity-60 hover:opacity-90 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1.5 pr-2">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${sec.color}`} />
                          <span className="text-xs font-bold text-white">{sec.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{sec.desc}</p>
                      </div>

                      <div
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                          isVisible ? "bg-gradient-to-r from-purple-600 to-cyan-500" : "bg-slate-700"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            isVisible ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SECTION HEADINGS & ITEM LIMITS                    */}
        {/* ========================================================= */}
        {activeTab === "titles" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-purple-500/20 pb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Type className="w-5 h-5 text-amber-400" />
                  <span>Section Titles &amp; Maximum Item Counts</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Adjust custom titles, badges, and how many items to display on the home page.
                </p>
              </div>

              {/* Titles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    About Section Title
                  </label>
                  <input
                    type="text"
                    value={config.aboutTitle}
                    onChange={(e) => handleChange("aboutTitle", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    About Button Label
                  </label>
                  <input
                    type="text"
                    value={config.aboutButtonText}
                    onChange={(e) => handleChange("aboutButtonText", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Services Section Title
                  </label>
                  <input
                    type="text"
                    value={config.servicesTitle}
                    onChange={(e) => handleChange("servicesTitle", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Services Top Badge
                  </label>
                  <input
                    type="text"
                    value={config.servicesBadge}
                    onChange={(e) => handleChange("servicesBadge", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Projects Section Title
                  </label>
                  <input
                    type="text"
                    value={config.projectsTitle}
                    onChange={(e) => handleChange("projectsTitle", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Experience Section Title
                  </label>
                  <input
                    type="text"
                    value={config.experienceTitle}
                    onChange={(e) => handleChange("experienceTitle", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    R&amp;D Labs Section Title
                  </label>
                  <input
                    type="text"
                    value={config.labsTitle}
                    onChange={(e) => handleChange("labsTitle", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Certifications Section Title
                  </label>
                  <input
                    type="text"
                    value={config.certificationsTitle}
                    onChange={(e) => handleChange("certificationsTitle", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Item Limits Sub-section */}
              <div className="border-t border-purple-500/20 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Home Page Display Item Limits</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Projects Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.projectsLimit}
                      onChange={(e) =>
                        handleChange("projectsLimit", parseInt(e.target.value) || 4)
                      }
                      className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Services Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.servicesLimit}
                      onChange={(e) =>
                        handleChange("servicesLimit", parseInt(e.target.value) || 4)
                      }
                      className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Skills Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={config.skillsLimit ?? 9}
                      onChange={(e) =>
                        handleChange("skillsLimit", parseInt(e.target.value) || 9)
                      }
                      className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Experience Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.experiencesLimit}
                      onChange={(e) =>
                        handleChange("experiencesLimit", parseInt(e.target.value) || 3)
                      }
                      className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Labs Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.labsLimit}
                      onChange={(e) => handleChange("labsLimit", parseInt(e.target.value) || 3)}
                      className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Certifications Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.certificationsLimit}
                      onChange={(e) =>
                        handleChange("certificationsLimit", parseInt(e.target.value) || 3)
                      }
                      className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Blog Posts Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.blogPostsLimit}
                      onChange={(e) =>
                        handleChange("blogPostsLimit", parseInt(e.target.value) || 3)
                      }
                      className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CONTACT CTA BANNER                                */}
        {/* ========================================================= */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-purple-500/20 pb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <PhoneCall className="w-5 h-5 text-rose-400" />
                  <span>Contact CTA &amp; Project Inquiries Banner</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Customize the closing conversion callout, guarantee bullet points, and form title.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Top Badge Tagline
                  </label>
                  <input
                    type="text"
                    value={config.contactBadge}
                    onChange={(e) => handleChange("contactBadge", e.target.value)}
                    placeholder="e.g. Let's connect"
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-purple-400 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Main Callout Heading
                  </label>
                  <input
                    type="text"
                    value={config.contactTitle}
                    onChange={(e) => handleChange("contactTitle", e.target.value)}
                    placeholder="e.g. Have a Project in Mind?"
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Supporting Pitch
                </label>
                <textarea
                  rows={2}
                  value={config.contactDescription}
                  onChange={(e) => handleChange("contactDescription", e.target.value)}
                  className="w-full bg-[#141444] border border-purple-500/20 rounded-xl p-4 text-xs text-slate-200 resize-none"
                />
              </div>

              {/* 3 Bullet Guarantees */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-mono text-slate-300 font-semibold block">
                  3 Commitment / Guarantee Bullet Points
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-mono shrink-0">
                      1
                    </span>
                    <input
                      type="text"
                      value={config.contactBullet1}
                      onChange={(e) => handleChange("contactBullet1", e.target.value)}
                      placeholder="e.g. Expect response within 6 hours"
                      className="flex-1 bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-mono shrink-0">
                      2
                    </span>
                    <input
                      type="text"
                      value={config.contactBullet2}
                      onChange={(e) => handleChange("contactBullet2", e.target.value)}
                      placeholder="e.g. Get a dedicated specialist for clear next steps"
                      className="flex-1 bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-mono shrink-0">
                      3
                    </span>
                    <input
                      type="text"
                      value={config.contactBullet3}
                      onChange={(e) => handleChange("contactBullet3", e.target.value)}
                      placeholder="e.g. We are ready to sign NDA prior to your idea."
                      className="flex-1 bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Form title & submit text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Contact Form Box Title
                  </label>
                  <input
                    type="text"
                    value={config.contactFormTitle}
                    onChange={(e) => handleChange("contactFormTitle", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Submit Button Text
                  </label>
                  <input
                    type="text"
                    value={config.contactSubmitText}
                    onChange={(e) => handleChange("contactSubmitText", e.target.value)}
                    className="w-full bg-[#141444] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 rounded-2xl bg-[#141444]/90 border border-purple-500/30 flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            <span>Changes will immediately update the live home page at </span>
            <span className="text-cyan-400 font-bold">/</span>
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white text-xs font-mono font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Home Page</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Hero Avatar Media Picker Modal */}
      <MediaPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelect={(selectedUrl) => handleChange("heroAvatarUrl", selectedUrl)}
        currentValue={config.heroAvatarUrl}
        title="Select Hero Photo from Media Library"
      />
    </div>
  );
}
