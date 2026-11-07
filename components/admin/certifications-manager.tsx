"use client";

import { useMemo, useState } from "react";
import {
  Award, Plus, Trash2, Edit2, X, Save, Loader2, ExternalLink, Calendar,
  Tag, Settings, Check, LayoutDashboard, PanelTop, Star, GraduationCap,
  BookOpen, Search, Eye, EyeOff, Activity, Layers,
} from "lucide-react";
import {
  createCertification,
  updateCertification,
  deleteCertification,
  updateSettingsBatch,
  renameCertificationCategory,
  removeCertificationCategory,
} from "@/actions/module-actions";
import { FileUploadInput } from "@/components/admin/file-upload-input";
import { formatDate } from "@/lib/utils";

type Certification = {
  id: string;
  name: string;
  issuer: string;
  category?: string | null;
  credentialUrl: string | null;
  issuedAt: string | Date | null;
  expiresAt: string | Date | null;
  imageUrl: string | null;
  sortOrder: number;
  featured?: boolean;
};

type Category = { id: string; name: string };
type LearningItem = {
  id: string;
  title: string;
  provider: string;
  status: "Planned" | "In Progress" | "Completed";
  progress: number;
  url: string;
};

type Props = {
  initialCertifications: Certification[];
  initialCategories?: Category[];
  initialSettings?: Record<string, any>;
};

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-surface-50 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-slate-300";
const buttonClass =
  "inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-100 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-surface-200 hover:text-white";
const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-background shadow-glow transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50";
const panelClass = "glass-panel rounded-3xl border border-border-subtle p-5 sm:p-6";

const navItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "hero", label: "Hero Section", icon: PanelTop },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "featured", label: "Featured", icon: Star },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "achievements", label: "Learning & Achievements", icon: GraduationCap },
  { id: "learning", label: "Currently Learning", icon: BookOpen },
  { id: "settings", label: "Page Settings", icon: Settings },
];

export function CertificationsManager({
  initialCertifications,
  initialCategories,
  initialSettings = {},
}: Props) {
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications ?? []);
  const [categories, setCategories] = useState<Category[]>(
    initialCategories ??
    (Array.isArray(initialSettings.certificationPageCategories)
      ? initialSettings.certificationPageCategories
      : Array.from(new Set((initialCertifications ?? []).map((c) => c.category).filter((c): c is string => Boolean(c))))
        .map((name: string, index: number) => ({ id: `category-${index}`, name })))
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [notice, setNotice] = useState("");

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [category, setCategory] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [featuredIds, setFeaturedIds] = useState<string[]>(
    Array.isArray(initialSettings.certificationPageFeaturedIds)
      ? initialSettings.certificationPageFeaturedIds
      : (initialCertifications ?? []).filter((c) => c.featured).map((c) => c.id)
  );

  // These content fields are editable in this UI. Persist them with your page-settings server action/API.
  const [heroBadge, setHeroBadge] = useState(initialSettings.certificationPageHeroBadge ?? "Professional Development & Credentials");
  const [heroTitle, setHeroTitle] = useState(initialSettings.certificationPageHeroTitle ?? "Professional Certifications");
  const [heroDescription, setHeroDescription] = useState(initialSettings.certificationPageHeroDescription ?? "A collection of technical credentials, professional learning, and specialized skills across networking, cybersecurity, cloud infrastructure, and software development.");
  const [exploreLabel, setExploreLabel] = useState(initialSettings.certificationPageExploreLabel ?? "Explore Certifications");
  const [categoriesLabel, setCategoriesLabel] = useState(initialSettings.certificationPageCategoriesLabel ?? "Browse Categories");
  const [pageTitle, setPageTitle] = useState(initialSettings.certificationPageSeoTitle ?? "Certifications | Tanvir Khan");
  const [metaDescription, setMetaDescription] = useState(initialSettings.certificationPageMetaDescription ?? "Explore professional certifications, technical credentials, and ongoing learning.");
  const [showHero, setShowHero] = useState(initialSettings.certificationPageShowHero ?? true);
  const [showStats, setShowStats] = useState(initialSettings.certificationPageShowStats ?? true);
  const [showFeatured, setShowFeatured] = useState(initialSettings.certificationPageShowFeatured ?? true);
  const [showCategories, setShowCategories] = useState(initialSettings.certificationPageShowCategories ?? true);
  const [showAllCerts, setShowAllCerts] = useState(initialSettings.certificationPageShowAllCerts ?? true);
  const [showAchievements, setShowAchievements] = useState(initialSettings.certificationPageShowAchievements ?? true);
  const [showLearning, setShowLearning] = useState(initialSettings.certificationPageShowLearning ?? true);
  const [achievementTitle, setAchievementTitle] = useState("");
  const [achievementDescription, setAchievementDescription] = useState("");
  const [achievements, setAchievements] = useState<{ id: string; title: string; description: string }[]>(Array.isArray(initialSettings.certificationPageAchievements) ? initialSettings.certificationPageAchievements : []);
  const [learningItems, setLearningItems] = useState<LearningItem[]>(Array.isArray(initialSettings.certificationPageLearningItems) ? initialSettings.certificationPageLearningItems : []);
  const [learningTitle, setLearningTitle] = useState("");
  const [learningProvider, setLearningProvider] = useState("");
  const [learningUrl, setLearningUrl] = useState("");
  const [learningStatus, setLearningStatus] = useState<LearningItem["status"]>("In Progress");
  const [learningProgress, setLearningProgress] = useState("0");

  const uniqueOrganizations = useMemo(
    () => new Set(certifications.map((c) => c.issuer.trim()).filter(Boolean)).size,
    [certifications]
  );
  const uniqueSkills = useMemo(
    () => new Set(certifications.flatMap((c: any) => Array.isArray(c.skills) ? c.skills : []).filter(Boolean)).size,
    [certifications]
  );
  const usedCategories = useMemo(
    () => new Set(certifications.map((c) => c.category).filter(Boolean)).size,
    [certifications]
  );
  const filteredCertifications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certifications
      .filter((c) => filterCategory === "All" || c.category === filterCategory)
      .filter((c) => !q || `${c.name} ${c.issuer} ${c.category ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [certifications, search, filterCategory]);

  const toInputDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
  };

  const openCreateModal = () => {
    setEditingCert(null);
    setName(""); setIssuer(""); setCategory(""); setCredentialUrl(""); setImageUrl("");
    setIssuedAt(""); setExpiresAt(""); setSortOrder("0");
    setIsEditing(true);
  };

  const openEditModal = (cert: Certification) => {
    setEditingCert(cert);
    setName(cert.name ?? ""); setIssuer(cert.issuer ?? ""); setCategory(cert.category ?? "");
    setCredentialUrl(cert.credentialUrl ?? ""); setImageUrl(cert.imageUrl ?? "");
    setIssuedAt(toInputDate(cert.issuedAt)); setExpiresAt(toInputDate(cert.expiresAt));
    setSortOrder(String(cert.sortOrder ?? 0));
    setIsEditing(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !issuer.trim()) return;
    setLoading(true);
    setNotice("");
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("issuer", issuer.trim());
      formData.append("category", category.trim());
      formData.append("credentialUrl", credentialUrl.trim());
      formData.append("imageUrl", imageUrl.trim());
      formData.append("issuedAt", issuedAt);
      formData.append("expiresAt", expiresAt);
      formData.append("sortOrder", sortOrder || "0");
      if (editingCert) {
        formData.append("id", editingCert.id);
        await updateCertification(formData);
      } else {
        await createCertification(formData);
      }
      setIsEditing(false);
      window.location.reload();
    } catch (error: any) {
      setNotice(error?.message || "Could not save certification.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this certification?")) return;
    try {
      await deleteCertification(id);
      setCertifications((current) => current.filter((c) => c.id !== id));
      setFeaturedIds((current) => current.filter((featuredId) => featuredId !== id));
      setNotice("Certification deleted.");
    } catch (error: any) {
      setNotice(error?.message || "Could not delete certification.");
    }
  };

  const addCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setNotice("That category already exists.");
      return;
    }
    const next = [...categories, { id: `category-${Date.now()}`, name: trimmed }];
    try {
      await updateSettingsBatch({ certificationPageCategories: next });
      setCategories(next);
      setNewCategoryName("");
      setNotice("Category saved.");
    } catch (error: any) {
      setNotice(error?.message || "Could not save category.");
    }
  };

  const updateCategory = async (id: string) => {
    const trimmed = editingCategoryName.trim();
    if (!trimmed) return;
    const old = categories.find((c) => c.id === id);
    if (!old) return;
    const next = categories.map((c) => c.id === id ? { ...c, name: trimmed } : c);
    try {
      await renameCertificationCategory(old.name, trimmed);
      await updateSettingsBatch({ certificationPageCategories: next });
      setCategories(next);
      setCertifications((current) => current.map((cert) => cert.category === old.name ? { ...cert, category: trimmed } : cert));
      if (category === old.name) setCategory(trimmed);
      setEditingCategoryId(null);
      setEditingCategoryName("");
      setNotice("Category updated.");
    } catch (error: any) {
      setNotice(error?.message || "Could not update category.");
    }
  };

  const deleteCategory = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target || !window.confirm(`Delete category "${target.name}"? Certificates in this category will become uncategorized.`)) return;
    const next = categories.filter((c) => c.id !== id);
    try {
      await removeCertificationCategory(target.name);
      await updateSettingsBatch({ certificationPageCategories: next });
      setCategories(next);
      setCertifications((current) => current.map((cert) => cert.category === target.name ? { ...cert, category: null } : cert));
      if (category === target.name) setCategory("");
      setNotice("Category deleted.");
    } catch (error: any) {
      setNotice(error?.message || "Could not delete category.");
    }
  };

  const toggleFeatured = async (id: string) => {
    const next = featuredIds.includes(id) ? featuredIds.filter((x) => x !== id) : [...featuredIds, id];
    setFeaturedIds(next);
    try {
      await updateSettingsBatch({ certificationPageFeaturedIds: next });
      setNotice("Featured selection saved.");
    } catch (error: any) {
      setNotice(error?.message || "Could not save featured selection.");
    }
  };

  const addAchievement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!achievementTitle.trim()) return;
    const next = [...achievements, {
      id: `achievement-${Date.now()}`, title: achievementTitle.trim(), description: achievementDescription.trim()
    }];
    try {
      await updateSettingsBatch({ certificationPageAchievements: next });
      setAchievements(next);
      setAchievementTitle("");
      setAchievementDescription("");
      setNotice("Achievement saved.");
    } catch (error: any) {
      setNotice(error?.message || "Could not save achievement.");
    }
  };

  const addLearningItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!learningTitle.trim()) return;
    const next = [...learningItems, {
      id: `learning-${Date.now()}`, title: learningTitle.trim(), provider: learningProvider.trim(),
      status: learningStatus, progress: Math.max(0, Math.min(100, Number(learningProgress) || 0)), url: learningUrl.trim()
    }];
    try {
      await updateSettingsBatch({ certificationPageLearningItems: next });
      setLearningItems(next);
      setLearningTitle(""); setLearningProvider(""); setLearningUrl(""); setLearningProgress("0");
      setNotice("Learning item saved.");
    } catch (error: any) {
      setNotice(error?.message || "Could not save learning item.");
    }
  };

  const Stat = ({ icon: Icon, value, label }: { icon: any; value: number; label: string }) => (
    <div className="rounded-2xl border border-border-subtle bg-surface-50/70 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sky-400">
            <Award className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Portfolio CMS</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Certifications Page Manager</h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-400">
            Manage certification records and edit the page content from one workspace.
          </p>
        </div>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-xs text-sky-200">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={Award} value={certifications.length} label="Listed Credentials" />
        <Stat icon={Layers} value={uniqueOrganizations} label="Issuing Organizations" />
        <Stat icon={Tag} value={usedCategories || categories.length} label="Technical Categories" />
        <Stat icon={Activity} value={uniqueSkills} label="Skill Tags" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className={`${panelClass} h-fit space-y-1 !p-3`}>
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Page Sections</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${activeTab === id ? "border border-sky-500/20 bg-sky-500/10 text-sky-300" : "text-slate-400 hover:bg-surface-100 hover:text-white"
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {id === "certifications" && <span className="ml-auto text-[10px] text-slate-500">{certifications.length}</span>}
            </button>
          ))}
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-200/80">
            Hero, featured items, categories, achievements, learning items, and page visibility are saved to the database.
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          {activeTab === "overview" && (
            <>
              <section className={panelClass}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Page Overview</h2>
                    <p className="mt-1 text-xs text-slate-400">A quick summary of the Certifications page content.</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">Admin workspace</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Hero Section", showHero, setShowHero],
                    ["Statistics", showStats, setShowStats],
                    ["Featured Certifications", showFeatured, setShowFeatured],
                    ["Categories", showCategories, setShowCategories],
                    ["All Certifications", showAllCerts, setShowAllCerts],
                    ["Learning & Achievements", showAchievements, setShowAchievements],
                    ["Currently Learning", showLearning, setShowLearning],
                  ].map(([label, enabled, setter]: any) => (
                    <button key={label} type="button" onClick={() => setter(!enabled)} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-50/60 px-4 py-3 text-left">
                      <span className="text-xs font-medium text-slate-200">{label}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] ${enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-slate-400"}`}>
                        {enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {enabled ? "Visible" : "Hidden"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <section className={panelClass}>
                <h2 className="text-base font-bold text-white">Recent Certifications</h2>
                <div className="mt-4 space-y-3">
                  {certifications.slice(0, 5).map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-50/50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-sky-500/10 text-sky-400">
                        {cert.imageUrl ? <img src={cert.imageUrl} alt="" className="h-full w-full object-cover" /> : <Award className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-white">{cert.name}</p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">{cert.issuer}</p>
                      </div>
                      <button type="button" onClick={() => { openEditModal(cert); }} className={buttonClass}><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                    </div>
                  ))}
                  {certifications.length === 0 && <p className="py-5 text-center text-xs text-slate-500">No certifications yet. Add your first credential.</p>}
                </div>
              </section>
            </>
          )}

          {activeTab === "hero" && (
            <section className={panelClass}>
              <div className="mb-5">
                <h2 className="text-base font-bold text-white">Hero Section</h2>
                <p className="mt-1 text-xs text-slate-400">Edit the badge, heading, description, and button labels shown at the top of the public page.</p>
              </div>
              <div className="space-y-4">
                <div><label className={labelClass}>Badge / Subtitle</label><input className={inputClass} value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} /></div>
                <div><label className={labelClass}>Page Title</label><input className={inputClass} value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} /></div>
                <div><label className={labelClass}>Description</label><textarea rows={4} className={inputClass} value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className={labelClass}>Primary Button Label</label><input className={inputClass} value={exploreLabel} onChange={(e) => setExploreLabel(e.target.value)} /></div>
                  <div><label className={labelClass}>Secondary Button Label</label><input className={inputClass} value={categoriesLabel} onChange={(e) => setCategoriesLabel(e.target.value)} /></div>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-surface-50/50 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Preview</p>
                  <span className="text-[10px] font-semibold text-sky-400">{heroBadge}</span>
                  <h3 className="mt-2 text-xl font-bold text-white">{heroTitle}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{heroDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-background">{exploreLabel}</span><span className="rounded-lg border border-border-subtle px-3 py-2 text-xs text-slate-300">{categoriesLabel}</span></div>
                </div>
                <button type="button" onClick={async () => { try { await updateSettingsBatch({ certificationPageHeroBadge: heroBadge, certificationPageHeroTitle: heroTitle, certificationPageHeroDescription: heroDescription, certificationPageExploreLabel: exploreLabel, certificationPageCategoriesLabel: categoriesLabel }); setNotice("Hero content saved."); } catch (error: any) { setNotice(error?.message || "Could not save hero content."); } }} className={primaryButtonClass}><Save className="h-4 w-4" /> Save Hero Content</button>
              </div>
            </section>
          )}

          {activeTab === "certifications" && (
            <section className={panelClass}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-base font-bold text-white">All Certifications</h2><p className="mt-1 text-xs text-slate-400">Create, edit, search, filter, and remove credentials.</p></div>
                <button type="button" onClick={openCreateModal} className={primaryButtonClass}><Plus className="h-4 w-4" /> Add Certification</button>
              </div>
              <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_190px]">
                <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input className={`${inputClass} pl-9`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, organization, category..." /></div>
                <select className={inputClass} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}><option>All</option>{categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCertifications.map((cert) => (
                  <article key={cert.id} className="flex flex-col justify-between space-y-4 rounded-2xl border border-border-subtle bg-surface-50/40 p-4 transition hover:border-slate-600">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-sky-500/10 text-sky-400">
                          {cert.imageUrl ? <img src={cert.imageUrl} alt={cert.name} className="h-full w-full object-cover" /> : <Award className="h-5 w-5" />}
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => openEditModal(cert)} className="rounded-lg p-2 text-slate-400 hover:bg-surface-100 hover:text-sky-400" title="Edit"><Edit2 className="h-4 w-4" /></button>
                          <button type="button" onClick={() => handleDelete(cert.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      {cert.category && <span className="mt-3 inline-flex items-center gap-1 rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-400"><Tag className="h-3 w-3" />{cert.category}</span>}
                      <h3 className="mt-3 text-sm font-bold leading-snug text-white">{cert.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-sky-400">{cert.issuer}</p>
                      <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-400"><Calendar className="h-3.5 w-3.5" /> Issued: {formatDate(cert.issuedAt)}{cert.expiresAt ? ` · Expires: ${formatDate(cert.expiresAt)}` : " · No Expiration"}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                      <button type="button" onClick={() => toggleFeatured(cert.id)} className={`inline-flex items-center gap-1 text-[10px] font-semibold ${featuredIds.includes(cert.id) ? "text-amber-300" : "text-slate-500 hover:text-amber-300"}`}><Star className="h-3.5 w-3.5" />{featuredIds.includes(cert.id) ? "Featured" : "Mark Featured"}</button>
                      {cert.credentialUrl ? <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400 hover:text-sky-300">View Credential <ExternalLink className="h-3 w-3" /></a> : <span className="text-[10px] text-slate-500">Order: {cert.sortOrder ?? 0}</span>}
                    </div>
                  </article>
                ))}
                {filteredCertifications.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border-subtle p-10 text-center"><Award className="mx-auto mb-2 h-8 w-8 text-slate-500" /><p className="text-xs text-slate-400">No matching certifications found.</p></div>}
              </div>
            </section>
          )}

          {activeTab === "featured" && (
            <section className={panelClass}>
              <h2 className="text-base font-bold text-white">Featured Certifications</h2>
              <p className="mt-1 text-xs text-slate-400">Choose which certificates should appear in the featured area.</p>
              <div className="mt-4 space-y-2">
                {certifications.map((cert) => (
                  <label key={cert.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-subtle bg-surface-50/50 p-3">
                    <input type="checkbox" checked={featuredIds.includes(cert.id)} onChange={() => toggleFeatured(cert.id)} className="h-4 w-4 accent-sky-400" />
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-sky-500/10 text-sky-400">{cert.imageUrl ? <img src={cert.imageUrl} alt="" className="h-full w-full object-cover" /> : <Award className="h-4 w-4" />}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{cert.name}</p><p className="mt-1 text-[10px] text-slate-400">{cert.issuer}</p></div>
                    {featuredIds.includes(cert.id) && <Star className="h-4 w-4 text-amber-300" />}
                  </label>
                ))}
                {!certifications.length && <p className="py-6 text-center text-xs text-slate-500">Add certifications before selecting featured items.</p>}
              </div>
              <button type="button" onClick={async () => { try { await updateSettingsBatch({ certificationPageFeaturedIds: featuredIds }); setNotice("Featured selection saved."); } catch (error: any) { setNotice(error?.message || "Could not save featured selection."); } }} className={`${primaryButtonClass} mt-4`}><Save className="h-4 w-4" /> Save Featured Selection</button>
            </section>
          )}

          {activeTab === "categories" && (
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="text-base font-bold text-white">Certification Categories</h2><p className="mt-1 text-xs text-slate-400">Manage category names used to organize credentials.</p></div>
                <button type="button" onClick={() => setIsCategoryModalOpen(true)} className={primaryButtonClass}><Plus className="h-4 w-4" /> Manage Categories</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {categories.map((cat) => <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-50/50 p-4"><div><p className="text-xs font-semibold text-white">{cat.name}</p><p className="mt-1 text-[10px] text-slate-400">{certifications.filter((c) => c.category === cat.name).length} certificates</p></div><Tag className="h-4 w-4 text-sky-400" /></div>)}
              </div>
            </section>
          )}

          {activeTab === "achievements" && (
            <section className={panelClass}>
              <h2 className="text-base font-bold text-white">Learning & Achievements</h2>
              <p className="mt-1 text-xs text-slate-400">Add training milestones or professional learning achievements.</p>
              <form onSubmit={addAchievement} className="mt-4 space-y-3 rounded-2xl border border-border-subtle bg-surface-50/40 p-4">
                <div><label className={labelClass}>Achievement Title</label><input required className={inputClass} value={achievementTitle} onChange={(e) => setAchievementTitle(e.target.value)} placeholder="e.g. Completed Advanced Networking Training" /></div>
                <div><label className={labelClass}>Description</label><textarea rows={3} className={inputClass} value={achievementDescription} onChange={(e) => setAchievementDescription(e.target.value)} placeholder="Brief details..." /></div>
                <button className={primaryButtonClass} type="submit"><Plus className="h-4 w-4" /> Add Achievement</button>
              </form>
              <div className="mt-4 space-y-2">{achievements.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border-subtle p-4"><div><p className="text-xs font-semibold text-white">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.description || "No description provided."}</p></div><button type="button" onClick={async () => { const next = achievements.filter((x) => x.id !== item.id); await updateSettingsBatch({ certificationPageAchievements: next }); setAchievements(next); }} className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>)}{!achievements.length && <p className="py-5 text-center text-xs text-slate-500">No achievements added in this session.</p>}</div>
            </section>
          )}

          {activeTab === "learning" && (
            <section className={panelClass}>
              <h2 className="text-base font-bold text-white">Currently Learning</h2>
              <p className="mt-1 text-xs text-slate-400">Track courses or certifications currently in progress.</p>
              <form onSubmit={addLearningItem} className="mt-4 grid gap-3 rounded-2xl border border-border-subtle bg-surface-50/40 p-4 sm:grid-cols-2">
                <div><label className={labelClass}>Course / Certification Name</label><input required className={inputClass} value={learningTitle} onChange={(e) => setLearningTitle(e.target.value)} placeholder="Course name" /></div>
                <div><label className={labelClass}>Provider</label><input className={inputClass} value={learningProvider} onChange={(e) => setLearningProvider(e.target.value)} placeholder="Provider / platform" /></div>
                <div><label className={labelClass}>Course URL</label><input type="url" className={inputClass} value={learningUrl} onChange={(e) => setLearningUrl(e.target.value)} placeholder="https://..." /></div>
                <div><label className={labelClass}>Status</label><select className={inputClass} value={learningStatus} onChange={(e) => setLearningStatus(e.target.value as LearningItem["status"])}><option>Planned</option><option>In Progress</option><option>Completed</option></select></div>
                <div><label className={labelClass}>Progress (%)</label><input type="number" min="0" max="100" className={inputClass} value={learningProgress} onChange={(e) => setLearningProgress(e.target.value)} /></div>
                <div className="flex items-end"><button type="submit" className={primaryButtonClass}><Plus className="h-4 w-4" /> Add Learning Item</button></div>
              </form>
              <div className="mt-4 space-y-3">
                {learningItems.map((item) => <div key={item.id} className="rounded-xl border border-border-subtle bg-surface-50/50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-white">{item.title}</p><p className="mt-1 text-[10px] text-slate-400">{item.provider || "Provider not specified"} · {item.status}</p></div><button type="button" onClick={async () => { const next = learningItems.filter((x) => x.id !== item.id); await updateSettingsBatch({ certificationPageLearningItems: next }); setLearningItems(next); }} className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-sky-400" style={{ width: `${item.progress}%` }} /></div><p className="mt-1 text-right text-[10px] text-slate-500">{item.progress}%</p>{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-sky-400">Open course <ExternalLink className="h-3 w-3" /></a>}</div>)}
                {!learningItems.length && <p className="py-5 text-center text-xs text-slate-500">No learning items added in this session.</p>}
              </div>
            </section>
          )}

          {activeTab === "settings" && (
            <section className={panelClass}>
              <h2 className="text-base font-bold text-white">Page Settings & SEO</h2>
              <p className="mt-1 text-xs text-slate-400">Control search metadata and visibility of each public page section.</p>
              <div className="mt-4 space-y-4">
                <div><label className={labelClass}>SEO Page Title</label><input className={inputClass} value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} /></div>
                <div><label className={labelClass}>Meta Description</label><textarea rows={3} className={inputClass} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /></div>
                <div className="space-y-2">
                  {[
                    ["Hero Section", showHero, setShowHero], ["Statistics", showStats, setShowStats],
                    ["Featured Certifications", showFeatured, setShowFeatured], ["Categories", showCategories, setShowCategories],
                    ["All Certifications", showAllCerts, setShowAllCerts], ["Learning & Achievements", showAchievements, setShowAchievements],
                    ["Currently Learning", showLearning, setShowLearning],
                  ].map(([label, enabled, setter]: any) => <button key={label} type="button" onClick={() => setter(!enabled)} className="flex w-full items-center justify-between rounded-xl border border-border-subtle bg-surface-50/50 px-4 py-3"><span className="text-xs text-slate-200">{label}</span><span className={`text-[10px] font-semibold ${enabled ? "text-emerald-300" : "text-slate-500"}`}>{enabled ? "VISIBLE" : "HIDDEN"}</span></button>)}
                </div>
                <button type="button" onClick={async () => { try { await updateSettingsBatch({ certificationPageSeoTitle: pageTitle, certificationPageMetaDescription: metaDescription, certificationPageShowHero: showHero, certificationPageShowStats: showStats, certificationPageShowFeatured: showFeatured, certificationPageShowCategories: showCategories, certificationPageShowAllCerts: showAllCerts, certificationPageShowAchievements: showAchievements, certificationPageShowLearning: showLearning }); setNotice("Page settings saved."); } catch (error: any) { setNotice(error?.message || "Could not save page settings."); } }} className={primaryButtonClass}><Save className="h-4 w-4" /> Save Page Settings</button>
              </div>
            </section>
          )}
        </main>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[90vh] w-full max-w-xl space-y-5 overflow-y-auto rounded-3xl border border-border-subtle p-6 shadow-card sm:p-8">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div><h2 className="text-base font-bold text-white">{editingCert ? "Edit Certification" : "Add New Certification"}</h2><p className="mt-1 text-[11px] text-slate-400">Required fields are marked with *.</p></div>
              <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className={labelClass}>Certification Name *</label><input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AWS Certified Solutions Architect" /></div>
              <div><label className={labelClass}>Issuing Organization *</label><input required className={inputClass} value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="e.g. Amazon Web Services" /></div>
              <div><div className="mb-1 flex items-center justify-between"><label className={labelClass}>Category</label><button type="button" onClick={() => setIsCategoryModalOpen(true)} className="text-[10px] font-semibold text-sky-400"><Settings className="mr-1 inline h-3 w-3" /> Manage</button></div><select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">No category</option>{categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select></div>
              <div><label className={labelClass}>Credential Verification URL</label><input type="url" className={inputClass} value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://..." /></div>
              <div><FileUploadInput label="Certificate Badge / Image" name="imageUrl" value={imageUrl} onChange={setImageUrl} placeholder="https://... or upload file" helpText="Upload a certificate badge or image." /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Issue Date</label><input type="date" className={inputClass} value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} /></div><div><label className={labelClass}>Expiry Date</label><input type="date" className={inputClass} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></div></div>
              <div><label className={labelClass}>Sort Order</label><input type="number" className={inputClass} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></div>
              <div className="flex justify-end gap-2 border-t border-border-subtle pt-4"><button type="button" onClick={() => setIsEditing(false)} className={buttonClass}>Cancel</button><button type="submit" disabled={loading} className={primaryButtonClass}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editingCert ? "Update Certificate" : "Save Certificate"}</button></div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md space-y-5 rounded-3xl border border-border-subtle p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3"><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-sky-400" /><h2 className="text-base font-bold text-white">Manage Categories</h2></div><button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button></div>
            <form onSubmit={addCategory} className="flex gap-2"><input className={inputClass} value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Enter category name..." /><button type="submit" disabled={!newCategoryName.trim()} className={primaryButtonClass}><Plus className="h-4 w-4" /> Add</button></form>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {categories.map((cat) => <div key={cat.id} className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-50/50 p-2.5">
                {editingCategoryId === cat.id ? <><input autoFocus className={inputClass} value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} /><button type="button" onClick={() => updateCategory(cat.id)} className="rounded-lg bg-primary p-2 text-background"><Check className="h-4 w-4" /></button><button type="button" onClick={() => setEditingCategoryId(null)} className="p-2 text-slate-400"><X className="h-4 w-4" /></button></> : <><span className="text-xs text-slate-200">{cat.name}</span><div className="flex gap-1"><button type="button" onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} className="rounded-lg p-2 text-slate-400 hover:text-sky-400" title="Edit category"><Edit2 className="h-3.5 w-3.5" /></button><button type="button" onClick={() => deleteCategory(cat.id)} className="rounded-lg p-2 text-slate-500 hover:text-red-400" title="Delete category"><Trash2 className="h-3.5 w-3.5" /></button></div></>}
              </div>)}
              {!categories.length && <p className="py-4 text-center text-xs text-slate-500">No categories added.</p>}
            </div>
            <div className="flex justify-end border-t border-border-subtle pt-3"><button type="button" onClick={() => setIsCategoryModalOpen(false)} className={buttonClass}>Done</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
