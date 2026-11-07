"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  Loader2,
  Check,
  Search,
  Globe,
  PanelBottom,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  ShieldCheck,
  FileText,
  Lock,
  Sparkles,
} from "lucide-react";
import { updateSettingsBatch } from "@/actions/module-actions";
import { FileUploadInput } from "@/components/admin/file-upload-input";

interface FooterLinkItem {
  label: string;
  url: string;
}

interface SettingsManagerProps {
  initialSettings: Record<string, any>;
}

const DEFAULT_TERMS_TEMPLATE = `### 1. Acceptance of Terms
By accessing or using this portfolio website and associated engineering services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue use immediately.

### 2. Intellectual Property Rights
All source code, project architectures, interface designs, articles, graphics, and technical documentation displayed on this website are the intellectual property of the author, unless explicitly marked as third-party open-source (e.g. MIT, Apache 2.0). Reproduction or commercial redistribution without prior written consent is strictly prohibited.

### 3. Engineering Engagements & Client Services
Professional engineering consultations, full-stack software development, and technical advisory services are performed subject to executed Statements of Work (SOW), service contracts, and mutual nondisclosure agreements (NDAs).

### 4. Third-Party Links & Services
This website may feature links to external platforms (such as GitHub, live demo deployments, and professional publications). We do not control or assume liability for the content, security, or practices of third-party platforms.

### 5. Limitation of Liability
The materials on this website are provided on an 'as is' basis. In no event shall the author be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this site.

### 6. Governing Law & Contact
These terms are governed by applicable local and international commercial laws. For licensing or contractual inquiries, please contact us via the contact form.`;

const DEFAULT_PRIVACY_TEMPLATE = `### 1. Information Collection
We collect minimal personal information strictly necessary to provide an optimal browsing and communication experience. When you submit the contact form, we collect your name, email address, subject, and message content.

### 2. Usage of Collected Information
Your information is exclusively utilized to:
- Respond to direct inquiries, engineering project proposals, and consultation requests.
- Ensure website security, integrity, and abuse prevention.
- Review aggregated, anonymous visitor statistics to improve overall site experience.

### 3. Cookies & Session Storage
This website utilizes essential cookies to maintain secure administrator session states. We do not use third-party advertising cookies, and we never sell, rent, or trade your personal data.

### 4. Data Security & Storage
We employ industry-standard encryption protocols (SSL/TLS), parameterized database querying (PostgreSQL), and secure server configurations to protect your personal inquiries against unauthorized access.

### 5. Your Rights & Data Retention
You retain full rights to request access to, correction of, or permanent deletion of any personal information provided to us through the contact form. Contact us anytime to exercise your privacy rights.

### 6. Updates to This Policy
We reserve the right to revise this Privacy Policy periodically. The effective revision date will always be reflected at the top of this document.`;

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "seo" | "footer" | "legal">("branding");

  // Website Branding & Identity
  const [siteTitle, setSiteTitle] = useState(
    initialSettings["site_title"] || "MD Tanvir Khan | Full-Stack Software Engineer"
  );
  const [siteTagline, setSiteTagline] = useState(
    initialSettings["site_tagline"] || "Engineering Scalable Systems with Creative Precision"
  );
  const [siteLogo, setSiteLogo] = useState(initialSettings["site_logo"] || "");
  const [siteFavicon, setSiteFavicon] = useState(initialSettings["site_favicon"] || "");
  const [siteAuthor, setSiteAuthor] = useState(
    initialSettings["site_author"] || "MD Tanvir Khan"
  );
  const [contactAvailable, setContactAvailable] = useState(
    initialSettings["contact_available"] !== false
  );
  const [badgeText, setBadgeText] = useState(
    initialSettings["site_badge_text"] || "Available for Senior Roles & High-Impact Projects"
  );

  // Admin Panel Branding
  const [adminName, setAdminName] = useState(
    initialSettings["admin_name"] || "Admin CMS"
  );
  const [adminTagline, setAdminTagline] = useState(
    initialSettings["admin_tagline"] || "v1.0 Suite"
  );
  const [adminLogo, setAdminLogo] = useState(initialSettings["admin_logo"] || "");

  // Comprehensive SEO Settings
  const [seoDescription, setSeoDescription] = useState(
    initialSettings["seo_description"] ||
      "Personal portfolio and custom CMS built with Next.js App Router, PostgreSQL, Prisma, and Tailwind CSS."
  );
  const [seoKeywords, setSeoKeywords] = useState(
    initialSettings["seo_keywords"] ||
      "software engineer, full stack developer, next.js, react, typescript, postgresql, prisma, tailwind css"
  );
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(
    initialSettings["seo_canonical_url"] || "https://example.com"
  );
  const [seoOgImage, setSeoOgImage] = useState(initialSettings["seo_og_image"] || "");
  const [seoTwitterHandle, setSeoTwitterHandle] = useState(
    initialSettings["seo_twitter_handle"] || "@tanvir_dev"
  );
  const [seoRobotsIndex, setSeoRobotsIndex] = useState(
    initialSettings["seo_robots_index"] !== false
  );
  const [googleVerification, setGoogleVerification] = useState(
    initialSettings["seo_google_verification"] || ""
  );

  // Footer Settings
  const [footerCopyright, setFooterCopyright] = useState(
    initialSettings["footer_copyright"] ||
      `© ${new Date().getFullYear()} MD Tanvir Khan. All rights reserved.`
  );
  const [footerTagline, setFooterTagline] = useState(
    initialSettings["footer_tagline"] ||
      "Engineered with Next.js App Router, Prisma ORM, and PostgreSQL."
  );
  const [footerShowSocials, setFooterShowSocials] = useState(
    initialSettings["footer_show_socials"] !== false
  );

  // Dynamic Footer Links
  const defaultFooterLinks: FooterLinkItem[] = Array.isArray(initialSettings["footer_links"])
    ? initialSettings["footer_links"]
    : [
        { label: "Home", url: "/" },
        { label: "Projects", url: "/projects" },
        { label: "Blog", url: "/blog" },
        { label: "Contact", url: "/contact" },
      ];
  const [footerLinks, setFooterLinks] = useState<FooterLinkItem[]>(defaultFooterLinks);

  // Terms & Conditions and Privacy Policy Content
  const [termsContent, setTermsContent] = useState(
    initialSettings["terms_content"] || DEFAULT_TERMS_TEMPLATE
  );
  const [privacyContent, setPrivacyContent] = useState(
    initialSettings["privacy_content"] || DEFAULT_PRIVACY_TEMPLATE
  );

  // Footer Link Add/Edit Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLinkIdx, setEditingLinkIdx] = useState<number | null>(null);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const openAddLinkModal = () => {
    setEditingLinkIdx(null);
    setLinkLabel("");
    setLinkUrl("/");
    setShowLinkModal(true);
  };

  const openEditLinkModal = (idx: number) => {
    setEditingLinkIdx(idx);
    setLinkLabel(footerLinks[idx].label);
    setLinkUrl(footerLinks[idx].url);
    setShowLinkModal(true);
  };

  const handleSaveFooterLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkLabel.trim() || !linkUrl.trim()) return;

    if (editingLinkIdx !== null) {
      const updated = [...footerLinks];
      updated[editingLinkIdx] = { label: linkLabel.trim(), url: linkUrl.trim() };
      setFooterLinks(updated);
    } else {
      setFooterLinks([...footerLinks, { label: linkLabel.trim(), url: linkUrl.trim() }]);
    }
    setShowLinkModal(false);
  };

  const handleDeleteFooterLink = (idx: number) => {
    setFooterLinks(footerLinks.filter((_, i) => i !== idx));
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const payload: Record<string, any> = {
        // Website Branding
        site_title: siteTitle,
        site_tagline: siteTagline,
        site_logo: siteLogo,
        site_favicon: siteFavicon,
        footer_brand_logo: siteLogo,
        site_author: siteAuthor,
        contact_available: contactAvailable,
        site_badge_text: badgeText,

        // Admin Panel Branding
        admin_name: adminName,
        admin_tagline: adminTagline,
        admin_logo: adminLogo,

        // SEO
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
        seo_canonical_url: seoCanonicalUrl,
        seo_og_image: seoOgImage,
        seo_twitter_handle: seoTwitterHandle,
        seo_robots_index: seoRobotsIndex,
        seo_google_verification: googleVerification,

        // Footer
        footer_copyright: footerCopyright,
        footer_tagline: footerTagline,
        footer_show_socials: footerShowSocials,
        footer_links: footerLinks,

        // Legal
        terms_content: termsContent,
        privacy_content: privacyContent,
      };

      await updateSettingsBatch(payload);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Settings className="w-6 h-6 text-sky-400" />
            <span>Site Settings & Identity Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize website branding, admin panel appearance, SEO tags, footer navigation, and legal policies.
          </p>
        </div>

        {success && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>All Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "branding"
              ? "bg-primary text-background shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-100"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Branding & Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "seo"
              ? "bg-primary text-background shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-100"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>SEO & Metadata</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "footer"
              ? "bg-primary text-background shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-100"
          }`}
        >
          <PanelBottom className="w-4 h-4" />
          <span>Footer Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("legal")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "legal"
              ? "bg-primary text-background shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms & Privacy Policies</span>
        </button>
      </div>

      <form onSubmit={handleSaveAllSettings} className="space-y-8">
        {/* ================= TAB 1: BRANDING & IDENTITY ================= */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            {/* Website Public Branding */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
                    Website Public Branding & Identity
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls public site header logo, title, tagline, and availability status.
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Globe className="w-4 h-4" />
                </div>
              </div>

              {/* Website Brand Logo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FileUploadInput
                    label="Website Brand Logo / Image"
                    name="siteLogo"
                    value={siteLogo}
                    onChange={(val) => setSiteLogo(val)}
                    placeholder="https://... or click Upload File"
                    helpText="Square brand image or logo displayed in the main website header and footer."
                  />
                </div>
                <div>
                  <FileUploadInput
                    label="Website Browser Tab Favicon (.ico / .png / .svg)"
                    name="siteFavicon"
                    value={siteFavicon}
                    onChange={(val) => setSiteFavicon(val)}
                    placeholder="https://... or click Upload File"
                    helpText="Small icon shown on the browser tab next to website title."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Website Site Title (Brand Name) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    placeholder="e.g. MD Tanvir Khan | Full-Stack Software Engineer"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Website Brand Tagline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    placeholder="e.g. Engineering Scalable Systems with Creative Precision"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Author / Portfolio Owner Full Name
                </label>
                <input
                  type="text"
                  value={siteAuthor}
                  onChange={(e) => setSiteAuthor(e.target.value)}
                  placeholder="e.g. MD Tanvir Khan"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Availability Badge */}
              <div className="pt-3 border-t border-border-subtle space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="avail-toggle"
                    checked={contactAvailable}
                    onChange={(e) => setContactAvailable(e.target.checked)}
                    className="w-4 h-4 rounded bg-surface-50 border-border-subtle text-primary focus:ring-primary"
                  />
                  <label htmlFor="avail-toggle" className="text-xs font-medium text-slate-300 cursor-pointer">
                    Display &quot;Available for Work / New Projects&quot; badge on homepage hero
                  </label>
                </div>

                {contactAvailable && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Badge Display Text
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. Available for Senior Roles & High-Impact Projects"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Admin Panel Customization */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/20 bg-sky-950/10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
                    Admin Panel Branding & Appearance
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize the admin panel name, subtitle tagline, and uploaded console logo.
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Admin Panel Logo Upload */}
              <div>
                <FileUploadInput
                  label="Admin Panel Logo / Avatar Image"
                  name="adminLogo"
                  value={adminLogo}
                  onChange={(val) => setAdminLogo(val)}
                  placeholder="https://... or click Upload File"
                  helpText="Upload a custom square logo or avatar for the Admin CMS sidebar header. If empty, the default security shield icon will be used."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Admin Panel Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Admin CMS or Tanvir Workspace"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed in the admin sidebar header and management console bars.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Admin Panel Subtitle / Tagline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminTagline}
                    onChange={(e) => setAdminTagline(e.target.value)}
                    placeholder="e.g. v1.0 Suite, Executive Console, or Dev Studio"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Small uppercase subtitle shown beneath the admin panel name.
                  </p>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-3 border-t border-border-subtle">
                <span className="text-xs font-medium text-slate-400 mb-2 block">
                  Admin Sidebar Header Live Preview:
                </span>
                <div className="p-4 rounded-2xl bg-surface-100 border border-border-subtle inline-flex items-center space-x-3">
                  {adminLogo ? (
                    <img
                      src={adminLogo}
                      alt={adminName}
                      className="w-9 h-9 rounded-lg object-cover border border-sky-500/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-sm tracking-tight text-white block">
                      {adminName || "Admin CMS"}
                    </span>
                    <span className="block text-[10px] text-sky-400 uppercase tracking-widest font-semibold">
                      {adminTagline || "v1.0 Suite"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SEO & METADATA ================= */}
        {activeTab === "seo" && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
              Search Engine Optimization (SEO) & Social Sharing
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Global Meta Description (Google Search Snippet)
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="High-impact description appearing in search results..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Meta Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="software engineer, full stack, nextjs, react, prisma"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={seoCanonicalUrl}
                  onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Twitter / X Creator Handle
                </label>
                <input
                  type="text"
                  value={seoTwitterHandle}
                  onChange={(e) => setSeoTwitterHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Social Share Preview Image with File Upload */}
            <div>
              <FileUploadInput
                label="Social Share Image (OpenGraph / Twitter Card Banner)"
                name="seoOgImage"
                value={seoOgImage}
                onChange={(val) => setSeoOgImage(val)}
                placeholder="https://... or click Upload File"
                helpText="Recommended: 1200x630px image displayed when your portfolio is shared on Twitter, LinkedIn, or Facebook."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Google Search Console Verification Tag
              </label>
              <input
                type="text"
                value={googleVerification}
                onChange={(e) => setGoogleVerification(e.target.value)}
                placeholder="google-site-verification token..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary font-mono text-xs"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="robots-toggle"
                checked={seoRobotsIndex}
                onChange={(e) => setSeoRobotsIndex(e.target.checked)}
                className="w-4 h-4 rounded bg-surface-50 border-border-subtle text-primary focus:ring-primary"
              />
              <label htmlFor="robots-toggle" className="text-xs font-medium text-slate-300 cursor-pointer">
                Allow Search Engine Indexing (robots index, follow)
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FOOTER MANAGEMENT ================= */}
        {activeTab === "footer" && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
              Footer Content & Navigation Links
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={footerCopyright}
                onChange={(e) => setFooterCopyright(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Footer Subheading / Bio Note
              </label>
              <input
                type="text"
                value={footerTagline}
                onChange={(e) => setFooterTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="footer-social-toggle"
                checked={footerShowSocials}
                onChange={(e) => setFooterShowSocials(e.target.checked)}
                className="w-4 h-4 rounded bg-surface-50 border-border-subtle text-primary focus:ring-primary"
              />
              <label htmlFor="footer-social-toggle" className="text-xs font-medium text-slate-300 cursor-pointer">
                Display Social Media Icons in Footer
              </label>
            </div>

            {/* Custom Footer Links CRUD */}
            <div className="pt-4 border-t border-border-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Footer Quick Links ({footerLinks.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add, edit, or remove navigation links rendered in the public footer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddLinkModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-sky-400 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {footerLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-surface-50 border border-border-subtle flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-xs">{link.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{link.url}</div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditLinkModal(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400"
                        title="Edit link"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFooterLink(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: LEGAL (TERMS & PRIVACY) ================= */}
        {activeTab === "legal" && (
          <div className="space-y-6">
            {/* Terms and Conditions */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border-subtle">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Terms & Conditions (Terms of Service)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Displayed on public route{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-primary hover:underline inline-flex items-center space-x-1"
                    >
                      <span>/terms</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTermsContent(DEFAULT_TERMS_TEMPLATE)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Insert Recommended Template</span>
                </button>
              </div>

              <div>
                <textarea
                  rows={12}
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  placeholder="Enter Terms and Conditions markdown content..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-primary resize-y"
                />
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border-subtle">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-sky-400" />
                    <span>Privacy Policy</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Displayed on public route{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-primary hover:underline inline-flex items-center space-x-1"
                    >
                      <span>/privacy</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyContent(DEFAULT_PRIVACY_TEMPLATE)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Insert Recommended Template</span>
                </button>
              </div>

              <div>
                <textarea
                  rows={12}
                  value={privacyContent}
                  onChange={(e) => setPrivacyContent(e.target.value)}
                  placeholder="Enter Privacy Policy markdown content..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-primary resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All CMS Settings</span>
          </button>
        </div>
      </form>

      {/* Footer Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl border border-border-subtle shadow-card space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h2 className="text-sm font-bold text-white">
                {editingLinkIdx !== null ? "Edit Footer Link" : "Add Footer Link"}
              </h2>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFooterLink} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Link Label <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="e.g. Case Studies, GitHub, Contact"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  URL / Path <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. /projects or https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 border-t border-border-subtle flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-100 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow"
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
