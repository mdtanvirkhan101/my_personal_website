"use client";

import { useState } from "react";
import { User, Save, Loader2, Plus, Trash2, Edit2, Link as LinkIcon, Check, X } from "lucide-react";
import { updateProfileWithSocials } from "@/actions/module-actions";
import { FileUploadInput } from "@/components/admin/file-upload-input";

interface SocialLinkItem {
  platform: string;
  url: string;
}

interface ProfileManagerProps {
  initialProfile: any;
}

export function ProfileManager({ initialProfile }: ProfileManagerProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Core profile fields
  const [name, setName] = useState(initialProfile?.name || "MD Tanvir Khan");
  const [headline, setHeadline] = useState(
    initialProfile?.headline || "Full-Stack Software Engineer & Creative Technologist"
  );
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [email, setEmail] = useState(initialProfile?.email || "contact@example.com");
  const [location, setLocation] = useState(initialProfile?.location || "Dhaka, Bangladesh");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || "");
  const [resumeUrl, setResumeUrl] = useState(initialProfile?.resumeUrl || "/resume.pdf");

  // Social Links List
  const initialSocials: SocialLinkItem[] = Array.isArray(initialProfile?.socialLinks)
    ? initialProfile.socialLinks
    : initialProfile?.socialLinks && typeof initialProfile.socialLinks === "object"
    ? Object.entries(initialProfile.socialLinks).map(([k, v]) => ({
        platform: k,
        url: String(v),
      }))
    : [
        { platform: "GitHub", url: "https://github.com" },
        { platform: "LinkedIn", url: "https://linkedin.com" },
        { platform: "Twitter", url: "https://twitter.com" },
      ];

  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(initialSocials);

  // Social Links Add/Edit Modal
  const [newPlatform, setNewPlatform] = useState("GitHub");
  const [newUrl, setNewUrl] = useState("");
  const [editingSocialIdx, setEditingSocialIdx] = useState<number | null>(null);
  const [showSocialModal, setShowSocialModal] = useState(false);

  const commonPlatforms = ["GitHub", "LinkedIn", "Twitter", "YouTube", "Discord", "Facebook", "Instagram", "Portfolio"];

  const openAddSocialModal = () => {
    setEditingSocialIdx(null);
    setNewPlatform("GitHub");
    setNewUrl("");
    setShowSocialModal(true);
  };

  const openEditSocialModal = (idx: number) => {
    setEditingSocialIdx(idx);
    setNewPlatform(socialLinks[idx].platform);
    setNewUrl(socialLinks[idx].url);
    setShowSocialModal(true);
  };

  const handleSaveSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    if (editingSocialIdx !== null) {
      const updated = [...socialLinks];
      updated[editingSocialIdx] = { platform: newPlatform.trim(), url: newUrl.trim() };
      setSocialLinks(updated);
    } else {
      setSocialLinks([...socialLinks, { platform: newPlatform.trim(), url: newUrl.trim() }]);
    }

    setShowSocialModal(false);
  };

  const handleDeleteSocial = (idx: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== idx));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateProfileWithSocials({
        name,
        headline,
        bio,
        email,
        location,
        avatarUrl,
        resumeUrl,
        socialLinks,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <User className="w-6 h-6 text-sky-400" />
            <span>Owner Profile & Social CMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update avatar, resume file, personal bio, and manage all public social media connections.
          </p>
        </div>

        {success && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Profile Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Core Profile Fields */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Public Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Professional Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Avatar Upload */}
          <div>
            <FileUploadInput
              label="Avatar / Headshot URL (URL or Direct Image File Upload)"
              name="avatarUrl"
              value={avatarUrl}
              onChange={(val) => setAvatarUrl(val)}
              accept="image/*"
              placeholder="https://images.unsplash.com/... or click Upload File"
              helpText="Upload a square headshot image directly or enter an image URL."
            />
          </div>

          {/* Resume PDF / Document Upload */}
          <div>
            <FileUploadInput
              label="Resume Download File (PDF File Upload or Download Link)"
              name="resumeUrl"
              value={resumeUrl}
              onChange={(val) => setResumeUrl(val)}
              accept=".pdf,.doc,.docx"
              placeholder="/resume.pdf or click Upload File to upload PDF"
              helpText="Upload your latest PDF resume directly or enter a hosted resume URL."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Biography</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your professional story..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Dynamic Social Media Links Manager */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
                Social Media Links ({socialLinks.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, edit, or delete external profile links (GitHub, LinkedIn, Twitter, etc.).
              </p>
            </div>

            <button
              type="button"
              onClick={openAddSocialModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-sky-400 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Social Link</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialLinks.map((s, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-surface-50 border border-border-subtle flex items-center justify-between gap-3 hover:border-slate-600 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="font-bold text-white text-xs">{s.platform}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {s.url}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditSocialModal(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-surface-100 transition-colors"
                    title="Edit Link"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSocial(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-7 py-3 rounded-2xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Profile Changes</span>
          </button>
        </div>
      </form>

      {/* Social Link Add/Edit Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-border-subtle shadow-card space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-white">
                {editingSocialIdx !== null ? "Edit Social Link" : "Add Social Link"}
              </h2>
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSocialLink} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Platform Name</label>
                <div className="space-y-2">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                  >
                    {commonPlatforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="Other">Other / Custom</option>
                  </select>
                  {newPlatform === "Other" && (
                    <input
                      type="text"
                      placeholder="Type custom platform name (e.g. Medium, Dribbble)..."
                      onChange={(e) => setNewPlatform(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-50 border border-sky-500/40 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Profile Link (URL) <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
