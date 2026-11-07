"use client";

import { useState } from "react";
import {
  User,
  Save,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Settings,
  Workflow,
  Wrench,
  Check,
  Award,
  Activity,
  Layers,
  FileText,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { updateProfileWithSocials } from "@/actions/module-actions";
import { saveAboutPageConfig } from "@/actions/about-page";
import { AboutPageConfig } from "@/lib/about-page-config";
import { FileUploadInput } from "@/components/admin/file-upload-input";
import Link from "next/link";

interface AboutManagerProps {
  initialProfile: any;
  initialConfig: AboutPageConfig;
  skillsCount: number;
  certsCount: number;
}

export function AboutManager({
  initialProfile,
  initialConfig,
  skillsCount,
  certsCount,
}: AboutManagerProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "page_content" | "pillars">("profile");

  // Profile form state
  const [name, setName] = useState(initialProfile?.name || "MD Tanvir Khan");
  const [headline, setHeadline] = useState(
    initialProfile?.headline ||
      "Network & VoIP Engineer | Security & Infrastructure Specialist"
  );
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [email, setEmail] = useState(initialProfile?.email || "mdtanvirkhan.nt@gmail.com");
  const [location, setLocation] = useState(initialProfile?.location || "Dhaka, Bangladesh");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || "");
  const [resumeUrl, setResumeUrl] = useState(
    initialProfile?.resumeUrl || "/CV of MD Tanvir Khan.pdf"
  );

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // About page config state
  const [config, setConfig] = useState<AboutPageConfig>(initialConfig);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedNotice(false);

    try {
      await updateProfileWithSocials({
        name,
        headline,
        bio,
        email,
        location,
        avatarUrl,
        resumeUrl,
        socialLinks: initialProfile?.socialLinks,
      });
      setProfileSavedNotice(true);
      setTimeout(() => setProfileSavedNotice(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSavedNotice(false);

    try {
      const res = await saveAboutPageConfig(config);
      if (res.success) {
        setConfigSavedNotice(true);
        setTimeout(() => setConfigSavedNotice(false), 3000);
      } else {
        alert(res.error || "Failed to update configuration.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-300 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b0b2b] via-[#10103e] to-[#16164d] border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Control Hub • Synced with Live /about Page</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <User className="w-5 h-5" />
              </div>
              <span>About &amp; Profile Central Console</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Customize candidate bio, career headline, avatar photo, metric counter strips, engineering pillars, and contact call-to-actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/about"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0e0e34] border border-cyan-500/30 text-xs font-mono font-bold text-cyan-400 hover:text-white transition-all shadow-md"
            >
              <span>View Live /about</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-500/20">
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-purple-500/20">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Candidate Name</span>
            <span className="text-base font-bold text-white font-mono mt-0.5 block truncate">{name}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block">Live Skills Matrix</span>
            <span className="text-xl font-black text-cyan-400 font-mono mt-0.5 block">{skillsCount} Techs</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-amber-500/20">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">Verified Credentials</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">{certsCount} Accredited</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-emerald-500/20">
            <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">Official Resume</span>
            <span className="text-xs font-bold text-emerald-400 font-mono mt-1.5 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>PDF Linked</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-purple-500/20 pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
            activeTab === "profile"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
              : "bg-[#0e0e34] border border-cyan-500/20 text-slate-400 hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Core Bio &amp; Avatar</span>
        </button>

        <button
          onClick={() => setActiveTab("page_content")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
            activeTab === "page_content"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "bg-[#0e0e34] border border-purple-500/20 text-slate-400 hover:text-white"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Headings, Metrics &amp; Toggles</span>
        </button>
      </div>

      {/* TAB 1: CORE BIO & AVATAR */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Personal Profile &amp; Biography</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These fields sync with /about, hero banners, and the public resume profile.
              </p>
            </div>

            {profileSavedNotice && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Profile Saved Live!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Full Legal / Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Professional Headline</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Primary Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Physical Location / Office</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                Professional Bio (Displayed in /about Hero &amp; Profile)
              </label>
              <textarea
                rows={4}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Avatar / Profile Picture URL</label>
              <FileUploadInput
                name="avatarUrl"
                value={avatarUrl}
                onChange={setAvatarUrl}
                placeholder="/profile.jpg or choose from media"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Official Resume PDF File URL</label>
              <FileUploadInput
                name="resumeUrl"
                value={resumeUrl}
                onChange={setResumeUrl}
                placeholder="/CV of MD Tanvir Khan.pdf"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Core Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PAGE CONTENT, METRICS & TOGGLES */}
      {activeTab === "page_content" && (
        <form onSubmit={handleConfigSubmit} className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Headings, Metrics &amp; Section Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize key metric counters, section headlines, and toggle public blocks.
              </p>
            </div>

            {configSavedNotice && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Saved Live!</span>
              </span>
            )}
          </div>

          {/* Metric Counters Strip */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              About Page 4-Metric Counter Strip
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Experience</label>
                <input
                  type="text"
                  value={config.yearsExperience}
                  onChange={(e) => setConfig({ ...config, yearsExperience: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Uptime Guarantee</label>
                <input
                  type="text"
                  value={config.uptimeGuarantee}
                  onChange={(e) => setConfig({ ...config, uptimeGuarantee: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Systems Handled</label>
                <input
                  type="text"
                  value={config.systemsHandled}
                  onChange={(e) => setConfig({ ...config, systemsHandled: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Credentials Count</label>
                <input
                  type="text"
                  value={config.credentialsCount}
                  onChange={(e) => setConfig({ ...config, credentialsCount: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section Headings */}
          <div className="pt-4 border-t border-purple-500/20 space-y-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Section Titles &amp; Highlights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Top Badge Text</label>
                <input
                  type="text"
                  value={config.badgeText}
                  onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Hero Heading</label>
                <input
                  type="text"
                  value={config.heroHeading}
                  onChange={(e) => setConfig({ ...config, heroHeading: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Hero Gradient Highlight
                </label>
                <input
                  type="text"
                  value={config.heroHeadingHighlight}
                  onChange={(e) =>
                    setConfig({ ...config, heroHeadingHighlight: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Methodology Section Title
                </label>
                <input
                  type="text"
                  value={config.methodologyTitle}
                  onChange={(e) => setConfig({ ...config, methodologyTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="pt-4 border-t border-purple-500/20 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Section Visibility Toggles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#141444] border border-purple-500/15 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={config.showMethodology}
                  onChange={(e) => setConfig({ ...config, showMethodology: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-white">Engineering Methodology</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#141444] border border-purple-500/15 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={config.showArsenal}
                  onChange={(e) => setConfig({ ...config, showArsenal: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-white">Technical Arsenal Grid</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#141444] border border-purple-500/15 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={config.showCertifications}
                  onChange={(e) => setConfig({ ...config, showCertifications: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-white">Verified Certifications</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md disabled:opacity-50"
            >
              {savingConfig ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Page Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
