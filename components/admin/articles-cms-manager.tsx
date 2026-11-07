"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, FileText, Settings, Layers, Plus, Trash2, Edit3, X, Save,
  Loader2, Search, Eye, EyeOff, LayoutDashboard, ChevronUp, ChevronDown, Sparkles, Star
} from "lucide-react";
import { savePageSettingsAction, saveArticleAction, saveNoteAction, deleteArticleAction, deleteNoteAction, saveContentCategoryAction, deleteContentCategoryAction } from "@/actions/articles-admin-actions";

interface ArticlesCMSManagerProps {
  initialSettings?: any;
  initialArticles?: any[];
  initialNotes?: any[];
  initialArticleCategories?: ArticleCategoryItem[];
  initialNoteCategories?: NoteCategoryItem[];
}

type ArticleCategoryItem = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  categoryType: string;
  link: string;
  active: boolean;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
};

type NoteCategoryItem = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  link: string;
  active: boolean;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
};

type ContentManagerItem = {
  id: string;
  title: string;
  description: string;
  author: string;
  readingTime: number;
  type: "ARTICLE" | "NOTE";
  category: string;
  coverImage: string;
  fullContent: string;
  referenceLink: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
};

export function ArticlesCMSManager({ initialSettings, initialArticles = [], initialNotes = [], initialArticleCategories = [], initialNoteCategories = [] }: ArticlesCMSManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "ARTICLES_CAT" | "NOTES_CAT" | "BOTTOM_STRIP" | "CONTENT_MANAGER">("CONTENT_MANAGER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState<"ALL" | "ARTICLE" | "NOTE">("ALL");
  const [contentStatusFilter, setContentStatusFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [contentPage, setContentPage] = useState(1);
  const CONTENT_PAGE_SIZE = 8;

  const [articleCategories, setArticleCategories] = useState<ArticleCategoryItem[]>(initialArticleCategories.length ? initialArticleCategories : [
    { name: "Networking", slug: "networking", description: "Routing, Switching, VLAN, VPN, Firewall and more.", icon: "Network", categoryType: "Core", link: "/blog/category/networking", active: true, featured: true, seoTitle: "Networking Articles", seoDescription: "Explore networking guides.", sortOrder: 1 },
    { name: "System Administration", slug: "system-administration", description: "Linux, Windows Server, Active Directory, backup.", icon: "Server", categoryType: "Core", link: "/blog/category/system-administration", active: true, featured: false, seoTitle: "SysAdmin", seoDescription: "System administration guides.", sortOrder: 2 },
    { name: "Cybersecurity", slug: "cybersecurity", description: "Threats, Hardening, Vulnerability, Security Practices.", icon: "ShieldCheck", categoryType: "Security", link: "/blog/category/cybersecurity", active: true, featured: true, seoTitle: "Cybersecurity", seoDescription: "Security practices.", sortOrder: 3 },
    { name: "Network Security", slug: "network-security", description: "Firewall, IDS/IPS, zero trust, access control.", icon: "Lock", categoryType: "Security", link: "/blog/category/network-security", active: true, featured: false, seoTitle: "Network Security", seoDescription: "Net security notes.", sortOrder: 4 },
    { name: "Cloud & Infrastructure", slug: "cloud-infrastructure", description: "AWS, Azure, Virtualization, Containers.", icon: "Cloud", categoryType: "Cloud", link: "/blog/category/cloud-infrastructure", active: true, featured: false, seoTitle: "Cloud & Infra", seoDescription: "Cloud guides.", sortOrder: 5 },
    { name: "Technology Trends", slug: "technology-trends", description: "Latest tech, tools, frameworks and emerging opportunities.", icon: "TrendingUp", categoryType: "General", link: "/blog/category/technology-trends", active: true, featured: false, seoTitle: "Tech Trends", seoDescription: "Latest tech notes.", sortOrder: 6 },
    { name: "Tools & Technologies", slug: "tools-technologies", description: "MikroTik, Cisco, FortiGate, VMware, Docker.", icon: "Wrench", categoryType: "Tools", link: "/blog/category/tools-technologies", active: true, featured: false, seoTitle: "Tools", seoDescription: "Essential tools.", sortOrder: 7 },
    { name: "Security Updates", slug: "security-updates", description: "CVE, vulnerability alerts and patches.", icon: "ShieldCheck", categoryType: "Security", link: "/blog/category/security-updates", active: true, featured: false, seoTitle: "Security Updates", seoDescription: "CVE alerts.", sortOrder: 8 },
    { name: "Best Practices", slug: "best-practices", description: "Proven methods, configuration tips and guidelines.", icon: "Lightbulb", categoryType: "General", link: "/blog/category/best-practices", active: true, featured: false, seoTitle: "Best Practices", seoDescription: "Configuration tips.", sortOrder: 9 },
    { name: "Industry Insights", slug: "industry-insights", description: "Market trends, career tips and professional growth.", icon: "Users", categoryType: "General", link: "/blog/category/industry-insights", active: true, featured: false, seoTitle: "Insights", seoDescription: "Career tips.", sortOrder: 10 },
  ]);

  const [noteCategories, setNoteCategories] = useState<NoteCategoryItem[]>(initialNoteCategories.length ? initialNoteCategories : [
    { name: "Troubleshooting", slug: "troubleshooting", description: "Common issues, error fixes and real-world problem solving.", icon: "Wrench", link: "/blog/notes/troubleshooting", active: true, featured: true, seoTitle: "Troubleshooting", seoDescription: "Fix common issues.", sortOrder: 1 },
    { name: "Configuration Guides", slug: "configuration-guides", description: "Step-by-step configuration for network, system and security.", icon: "FileText", link: "/blog/notes/configuration-guides", active: true, featured: true, seoTitle: "Configs", seoDescription: "Step by step guides.", sortOrder: 2 },
    { name: "How-To", slug: "how-to", description: "Detailed guides with clear steps and screenshots.", icon: "Terminal", link: "/blog/notes/how-to", active: true, featured: false, seoTitle: "How-To Guides", seoDescription: "Detailed notes.", sortOrder: 3 },
    { name: "Command & Cheat Sheets", slug: "command-cheat-sheets", description: "Useful commands, shortcuts and quick reference.", icon: "Code", link: "/blog/notes/command-cheat-sheets", active: true, featured: false, seoTitle: "Cheat Sheets", seoDescription: "Quick reference.", sortOrder: 4 },
    { name: "Network Configurations", slug: "network-configurations", description: "Router, switch, firewall and VPN configuration examples.", icon: "Network", link: "/blog/notes/network-configurations", active: true, featured: false, seoTitle: "Network Configs", seoDescription: "Router switch examples.", sortOrder: 5 },
    { name: "Firewall & Security Config", slug: "firewall-security-config", description: "Security policies, NAT, VPN and firewall rule examples.", icon: "ShieldCheck", link: "/blog/notes/firewall-security-config", active: true, featured: false, seoTitle: "Firewall Rules", seoDescription: "NAT and VPN examples.", sortOrder: 6 },
    { name: "Server Configuration", slug: "server-configuration", description: "Linux/Windows server setup, services and optimization.", icon: "Server", link: "/blog/notes/server-configuration", active: true, featured: false, seoTitle: "Server Setup", seoDescription: "Linux windows server.", sortOrder: 7 },
    { name: "Incident Analysis", slug: "incident-analysis", description: "Real incidents, root cause and resolution steps.", icon: "Activity", link: "/blog/notes/incident-analysis", active: true, featured: false, seoTitle: "Incident Analysis", seoDescription: "Root cause resolution.", sortOrder: 8 },
    { name: "Security Hardening", slug: "security-hardening", description: "System, network and application hardening techniques.", icon: "Lock", link: "/blog/notes/security-hardening", active: true, featured: false, seoTitle: "Hardening", seoDescription: "Security techniques.", sortOrder: 9 },
    { name: "Deployment Notes", slug: "deployment-notes", description: "Project implementation, architecture diagrams and deployment.", icon: "Cpu", link: "/blog/notes/deployment-notes", active: true, featured: false, seoTitle: "Deployments", seoDescription: "Architecture diagrams.", sortOrder: 10 },
    { name: "Lab Notes", slug: "lab-notes", description: "Hands-on lab setups, test configs and experiments.", icon: "Terminal", link: "/blog/notes/lab-notes", active: true, featured: false, seoTitle: "Lab Notes", seoDescription: "Hands-on labs.", sortOrder: 11 },
    { name: "Resources", slug: "resources", description: "Templates, checklists, diagrams, PDFs and useful links.", icon: "Folder", link: "/blog/notes/resources", active: true, featured: false, seoTitle: "Resources", seoDescription: "PDFs and templates.", sortOrder: 12 },
  ]);

  const [contents, setContents] = useState<ContentManagerItem[]>([]);
  useEffect(() => {
    setContents([
      ...initialArticles.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.seoDescription || a.fullContent?.substring(0, 100) || "",
        author: a.author || "MD Tanvir Khan",
        readingTime: parseInt(a.readTime) || 5,
        type: "ARTICLE" as const,
        category: a.category,
        coverImage: a.coverImage || "",
        fullContent: a.fullContent,
        referenceLink: a.referenceLink || "",
        tags: a.tags || [],
        status: a.status,
        featured: a.featured,
        publishDate: a.publishDate,
        seoTitle: a.seoTitle || "",
        seoDescription: a.seoDescription || ""
      })),
      ...initialNotes.map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.seoDescription || n.fullContent?.substring(0, 100) || "",
        author: n.author || "MD Tanvir Khan",
        readingTime: 5,
        type: "NOTE" as const,
        category: n.category,
        coverImage: n.coverImage || "",
        fullContent: n.fullContent,
        referenceLink: n.referenceLink || "",
        tags: n.tags || [],
        status: n.status,
        featured: n.featured,
        publishDate: n.publishDate,
        seoTitle: n.seoTitle || "",
        seoDescription: n.seoDescription || ""
      }))
    ]);
  }, [initialArticles, initialNotes]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"ARTICLE" | "NOTE">("ARTICLE");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [articleForm, setArticleForm] = useState<ArticleCategoryItem>({
    name: "", slug: "", description: "", icon: "Network", categoryType: "Core", link: "", active: true, featured: false, seoTitle: "", seoDescription: "", sortOrder: 1
  });

  const [noteForm, setNoteForm] = useState<NoteCategoryItem>({
    name: "", slug: "", description: "", icon: "FileText", link: "", active: true, featured: false, seoTitle: "", seoDescription: "", sortOrder: 1
  });

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null);
  const [contentForm, setContentForm] = useState<ContentManagerItem>({
    id: "", title: "", description: "", author: "MD Tanvir Khan", readingTime: 5, type: "ARTICLE", category: "", coverImage: "", fullContent: "", referenceLink: "", tags: [], status: "DRAFT", featured: false, publishDate: new Date().toISOString().split("T")[0], seoTitle: "", seoDescription: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [previewContent, setPreviewContent] = useState<ContentManagerItem | null>(null);

  const [settings, setSettings] = useState({
    pageLabel: initialSettings?.pageLabel || "EXPLORE • LEARN • BUILD",
    mainTitle: initialSettings?.mainTitle || "Articles & Engineering Notes",
    subtitle: initialSettings?.subtitle || "Practical knowledge, real-world solutions...",
    showHero: initialSettings?.showHero ?? true,
    articlesTitle: initialSettings?.articlesTitle || "Articles",
    articlesDesc: initialSettings?.articlesDesc || "In-depth articles and insights...",
    notesTitle: initialSettings?.notesTitle || "Engineering Notes",
    notesDesc: initialSettings?.notesDesc || "Step-by-step guides and solutions..."
  });

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(settings).forEach(([key, val]) => data.append(key, String(val)));

    const res = await savePageSettingsAction(data);
    if (res.success) {
      setMessage("Page settings updated successfully!");
    } else {
      setMessage("Failed to update settings.");
    }
    setIsSubmitting(false);
  };

  const openAddModal = (type: "ARTICLE" | "NOTE") => {
    setModalType(type);
    setEditingIndex(null);
    if (type === "ARTICLE") {
      setArticleForm({ name: "", slug: "", description: "", icon: "Network", categoryType: "Core", link: "/blog/category/", active: true, featured: false, seoTitle: "", seoDescription: "", sortOrder: articleCategories.length + 1 });
    } else {
      setNoteForm({ name: "", slug: "", description: "", icon: "FileText", link: "/blog/notes/", active: true, featured: false, seoTitle: "", seoDescription: "", sortOrder: noteCategories.length + 1 });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (type: "ARTICLE" | "NOTE", index: number, item: any) => {
    setModalType(type);
    setEditingIndex(index);
    if (type === "ARTICLE") setArticleForm({ ...item });
    else setNoteForm({ ...item });
    setIsModalOpen(true);
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isArticle = modalType === "ARTICLE";
    const source = isArticle ? articleForm : noteForm;
    if (!source.name.trim()) { setIsSubmitting(false); return; }
    const slugified = source.slug.trim() || source.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const payload = { ...source, slug: slugified };
    const result = await saveContentCategoryAction(modalType, payload);
    if (result.success) {
      const savedPayload: any = { ...payload, id: result.category?.id || payload.id };
      if (isArticle) {
        const list = [...articleCategories];
        if (editingIndex !== null) list[editingIndex] = { ...list[editingIndex], ...savedPayload };
        else list.push(savedPayload);
        setArticleCategories(list);
      } else {
        const list = [...noteCategories];
        if (editingIndex !== null) list[editingIndex] = { ...list[editingIndex], ...savedPayload };
        else list.push(savedPayload);
        setNoteCategories(list);
      }
      setIsModalOpen(false);
      setMessage("Category saved successfully.");
      router.refresh();
    } else {
      alert(result.error || "Failed to save category.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (type: "ARTICLE" | "NOTE", index: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const item = type === "ARTICLE" ? articleCategories[index] : noteCategories[index];
    const result = await deleteContentCategoryAction(type, item.id || "", item.slug);
    if (!result.success) { alert(result.error || "Failed to delete category."); return; }
    if (type === "ARTICLE") setArticleCategories(articleCategories.filter((_, i) => i !== index));
    else setNoteCategories(noteCategories.filter((_, i) => i !== index));
    router.refresh();
  };

  const toggleVisibility = async (type: "ARTICLE" | "NOTE", index: number) => {
    const list = type === "ARTICLE" ? [...articleCategories] : [...noteCategories];
    list[index] = { ...list[index], active: !list[index].active };
    const result = await saveContentCategoryAction(type, list[index]);
    if (!result.success) { alert(result.error || "Failed to update category."); return; }
    list[index] = { ...list[index], id: result.category?.id || list[index].id };
    if (type === "ARTICLE") setArticleCategories(list as ArticleCategoryItem[]);
    else setNoteCategories(list as NoteCategoryItem[]);
    router.refresh();
  };

  const toggleFeatured = async (type: "ARTICLE" | "NOTE", index: number) => {
    const list = type === "ARTICLE" ? [...articleCategories] : [...noteCategories];
    list[index] = { ...list[index], featured: !list[index].featured };
    const result = await saveContentCategoryAction(type, list[index]);
    if (!result.success) { alert(result.error || "Failed to update category."); return; }
    list[index] = { ...list[index], id: result.category?.id || list[index].id };
    if (type === "ARTICLE") setArticleCategories(list as ArticleCategoryItem[]);
    else setNoteCategories(list as NoteCategoryItem[]);
    router.refresh();
  };

  const moveOrder = async (type: "ARTICLE" | "NOTE", index: number, direction: -1 | 1) => {
    const list = type === "ARTICLE" ? [...articleCategories] : [...noteCategories];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
    list.forEach((item, idx) => { item.sortOrder = idx + 1; });
    for (let i = 0; i < list.length; i++) {
      const result = await saveContentCategoryAction(type, list[i]);
      if (!result.success) { alert(result.error || "Failed to save category order."); return; }
      list[i] = { ...list[i], id: result.category?.id || list[i].id };
    }
    if (type === "ARTICLE") setArticleCategories(list as ArticleCategoryItem[]);
    else setNoteCategories(list as NoteCategoryItem[]);
    router.refresh();
  };

  const openAddContentModal = () => {
    setEditingContentIndex(null);
    setContentForm({
      id: Date.now().toString(),
      title: "",
      description: "",
      author: "MD Tanvir Khan",
      readingTime: 5,
      type: "ARTICLE",
      category: articleCategories[0]?.name || "",
      coverImage: "",
      fullContent: "",
      referenceLink: "",
      tags: [],
      status: "DRAFT",
      featured: false,
      publishDate: new Date().toISOString().split("T")[0],
      seoTitle: "",
      seoDescription: ""
    });
    setTagInput("");
    setIsContentModalOpen(true);
  };

  const openEditContentModal = (index: number, item: ContentManagerItem) => {
    setEditingContentIndex(index);
    setContentForm({ ...item });
    setTagInput(item.tags.join(", "));
    setIsContentModalOpen(true);
  };

  // CORRECTED: Only one handleContentSave definition
  const handleContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm.title.trim()) return;

    const formattedTags = tagInput.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const payload = { ...contentForm, tags: formattedTags };

    // Note: remove 'id' if it's new content so the database auto-generates a real one
    if (editingContentIndex === null && payload.id.length < 15) {
      // @ts-ignore
      delete payload.id;
    }

    const res = payload.type === "ARTICLE"
      ? await saveArticleAction(payload)
      : await saveNoteAction(payload);

    if (res.success) {
      setActiveTab("CONTENT_MANAGER");
      setIsContentModalOpen(false);
      router.refresh();
    } else {
      alert("Failed to save content to database.");
    }
  };

  const handleDeleteContent = async (index: number) => {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    const item = contents[index];

    const res = item.type === "ARTICLE"
      ? await deleteArticleAction(item.id)
      : await deleteNoteAction(item.id);

    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to delete the content item. Id may be mismatched.");
    }
  };

  const filteredArticles = articleCategories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredNotes = noteCategories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredContents = contents.filter(c =>
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (contentTypeFilter === "ALL" || c.type === contentTypeFilter) &&
    (contentStatusFilter === "ALL" || c.status === contentStatusFilter)
  );
  const totalContentPages = Math.max(1, Math.ceil(filteredContents.length / CONTENT_PAGE_SIZE));
  const paginatedContents = filteredContents.slice((contentPage - 1) * CONTENT_PAGE_SIZE, contentPage * CONTENT_PAGE_SIZE);
  const totalArticles = contents.filter(c => c.type === "ARTICLE").length;
  const totalNotes = contents.filter(c => c.type === "NOTE").length;
  const categoryCounts = [...articleCategories.map(c => ({ name: c.name, type: "Article", count: contents.filter(x => x.type === "ARTICLE" && x.category === c.name).length })),
  ...noteCategories.map(c => ({ name: c.name, type: "Note", count: contents.filter(x => x.type === "NOTE" && x.category === c.name).length }))];

  return (
    <div className="-my-6 min-h-[calc(100vh+3rem)] bg-[#0e0e34] space-y-6 p-4 sm:p-6 font-sans text-slate-200">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-purple-500/20 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Admin CMS</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mt-1">
            <BookOpen className="w-7 h-7 text-cyan-400" /> Articles & Notes Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage categories, SEO data, visibility, layout settings, and full contents.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton active={activeTab === "SETTINGS"} onClick={() => setActiveTab("SETTINGS")} label="1. Page Settings" icon={Settings} color="cyan" />
        <TabButton active={activeTab === "ARTICLES_CAT"} onClick={() => setActiveTab("ARTICLES_CAT")} label="2. Article Categories" icon={Layers} color="cyan" />
        <TabButton active={activeTab === "NOTES_CAT"} onClick={() => setActiveTab("NOTES_CAT")} label="3. Note Categories" icon={FileText} color="purple" />
        <TabButton active={activeTab === "BOTTOM_STRIP"} onClick={() => setActiveTab("BOTTOM_STRIP")} label="4. Bottom Feature Strip" icon={Sparkles} color="purple" />
        <TabButton active={activeTab === "CONTENT_MANAGER"} onClick={() => setActiveTab("CONTENT_MANAGER")} label="Content Manager" icon={FileText} color="cyan" />
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-purple-500/30 text-cyan-300 text-xs font-mono">
          {message}
        </div>
      )}

      {/* TAB 1: PAGE SETTINGS */}
      {activeTab === "SETTINGS" && (
        <form onSubmit={handleSettingsSubmit} className="max-w-4xl bg-[#141444] border border-purple-500/30 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-cyan-400 border-b border-purple-500/20 pb-3 uppercase tracking-wider">Hero & Header Configuration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Small Label" value={settings.pageLabel} onChange={(v: string) => setSettings({ ...settings, pageLabel: v })} />
            <InputField label="Main Title" value={settings.mainTitle} onChange={(v: string) => setSettings({ ...settings, mainTitle: v })} />
            <div className="sm:col-span-2">
              <InputField label="Subtitle / Description" value={settings.subtitle} onChange={(v: string) => setSettings({ ...settings, subtitle: v })} isTextArea />
            </div>
          </div>

          <h3 className="text-sm font-bold text-purple-400 border-b border-purple-500/20 pb-3 uppercase tracking-wider pt-4">Section Headings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Articles Section Title" value={settings.articlesTitle} onChange={(v: string) => setSettings({ ...settings, articlesTitle: v })} />
            <InputField label="Notes Section Title" value={settings.notesTitle} onChange={(v: string) => setSettings({ ...settings, notesTitle: v })} />
            <InputField label="Articles Description" value={settings.articlesDesc} onChange={(v: string) => setSettings({ ...settings, articlesDesc: v })} isTextArea />
            <InputField label="Notes Description" value={settings.notesDesc} onChange={(v: string) => setSettings({ ...settings, notesDesc: v })} isTextArea />
          </div>

          <label className="flex items-center justify-between bg-[#10103d] border border-purple-500/20 p-4 rounded-xl cursor-pointer">
            <span className="text-xs font-bold text-slate-200">Show Hero Section on Website</span>
            <input type="checkbox" checked={settings.showHero} onChange={(e) => setSettings({ ...settings, showHero: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
          </label>

          <button type="submit" disabled={isSubmitting} className="bg-[#8b5cf6] text-[#09091f] px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:opacity-95">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Page Settings
          </button>
        </form>
      )}

      {/* TAB 2: ARTICLE CATEGORIES */}
      {activeTab === "ARTICLES_CAT" && (
        <div className="space-y-4 bg-[#141444] border border-purple-500/30 p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-purple-500/20 gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Article Categories Manager ({filteredArticles.length} Topics)</h2>
              <p className="text-xs text-slate-400">Add, edit, reorder or hide article category blocks.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none" />
              </div>
              <button type="button" onClick={() => openAddModal("ARTICLE")} className="bg-[#8b5cf6] text-[#09091f] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-[#9b6cff] shrink-0">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredArticles.map((cat, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-2xl bg-[#10103d] border ${cat.active ? "border-purple-500/20" : "border-red-500/30 opacity-60"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-purple-500/30 shrink-0">#{cat.sortOrder}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                      {cat.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{cat.slug} • Type: {cat.categoryType} • {cat.active ? "Active" : "Hidden"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button type="button" onClick={() => toggleFeatured("ARTICLE", index)} className={`p-1.5 rounded ${cat.featured ? "text-amber-400 bg-amber-500/10" : "text-slate-500 hover:text-amber-300"}`} title="Toggle Featured"><Star className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => moveOrder("ARTICLE", index, -1)} className="p-1.5 text-slate-400 hover:text-white" title="Move Up"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => moveOrder("ARTICLE", index, 1)} className="p-1.5 text-slate-400 hover:text-white" title="Move Down"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => toggleVisibility("ARTICLE", index)} className="p-1.5 text-slate-400 hover:text-cyan-400" title="Hide/Show">{cat.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}</button>
                  <button type="button" onClick={() => openEditModal("ARTICLE", index, cat)} className="p-1.5 text-cyan-300 hover:bg-white/5 rounded" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleDeleteCategory("ARTICLE", index)} className="p-1.5 text-red-400 hover:bg-white/5 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NOTE CATEGORIES */}
      {activeTab === "NOTES_CAT" && (
        <div className="space-y-4 bg-[#141444] border border-purple-500/30 p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-purple-500/20 gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Engineering Note Categories ({filteredNotes.length} Topics)</h2>
              <p className="text-xs text-slate-400">Manage practical guide modules and cheat sheets.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none" />
              </div>
              <button type="button" onClick={() => openAddModal("NOTE")} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-purple-500 shrink-0">
                <Plus className="w-4 h-4" /> Add Note Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredNotes.map((cat, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-2xl bg-[#10103d] border ${cat.active ? "border-purple-500/20" : "border-red-500/30 opacity-60"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/30 shrink-0">#{cat.sortOrder}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                      {cat.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{cat.slug} • {cat.active ? "Active" : "Hidden"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button type="button" onClick={() => toggleFeatured("NOTE", index)} className={`p-1.5 rounded ${cat.featured ? "text-amber-400 bg-amber-500/10" : "text-slate-500 hover:text-amber-300"}`} title="Toggle Featured"><Star className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => moveOrder("NOTE", index, -1)} className="p-1.5 text-slate-400 hover:text-white" title="Move Up"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => moveOrder("NOTE", index, 1)} className="p-1.5 text-slate-400 hover:text-white" title="Move Down"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => toggleVisibility("NOTE", index)} className="p-1.5 text-slate-400 hover:text-purple-400" title="Hide/Show">{cat.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}</button>
                  <button type="button" onClick={() => openEditModal("NOTE", index, cat)} className="p-1.5 text-purple-300 hover:bg-white/5 rounded" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleDeleteCategory("NOTE", index)} className="p-1.5 text-red-400 hover:bg-white/5 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BOTTOM STRIP */}
      {activeTab === "BOTTOM_STRIP" && (
        <div className="space-y-4 bg-[#141444] border border-purple-500/30 p-6 rounded-3xl backdrop-blur-xl">
          <h2 className="text-base font-bold text-white pb-3 border-b border-purple-500/20">Bottom Feature Strip Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Stay Updated", "Learn Continuously", "Solve Real Problems", "Share Knowledge"].map((item, idx) => (
              <div key={item} className="p-4 rounded-2xl bg-[#10103d] border border-purple-500/20 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400">Card #{idx + 1}</span>
                  <h4 className="text-sm font-bold text-white">{item}</h4>
                </div>
                <button type="button" className="text-xs bg-white/5 px-3 py-1.5 rounded-xl text-cyan-300 hover:bg-white/10">Configure</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTENT MANAGER */}
      {activeTab === "CONTENT_MANAGER" && (
        <div className="space-y-4 bg-[#141444] border border-purple-500/30 p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-purple-500/20 gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Content Manager ({filteredContents.length} Items)</h2>
              <p className="text-xs text-slate-400">Manage website articles, notes, categories, publishing, tags and previews from here.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none" />
              </div>
              <button type="button" onClick={openAddContentModal} className="bg-[#8b5cf6] text-[#09091f] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-[#9b6cff] shrink-0">
                <Plus className="w-4 h-4" /> Add Content
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-purple-500/20 bg-[#10103d] p-4"><p className="text-xs text-slate-400">Total Articles</p><p className="text-2xl font-black text-cyan-300">{totalArticles}</p></div>
            <div className="rounded-2xl border border-purple-500/20 bg-[#10103d] p-4"><p className="text-xs text-slate-400">Total Notes</p><p className="text-2xl font-black text-purple-300">{totalNotes}</p></div>
            <div className="rounded-2xl border border-emerald-500/20 bg-[#10103d] p-4"><p className="text-xs text-slate-400">Published / Drafts</p><p className="text-2xl font-black text-white">{contents.filter(c => c.status === "PUBLISHED").length} <span className="text-sm text-slate-500">/ {contents.filter(c => c.status === "DRAFT").length}</span></p></div>
          </div>
          <div className="rounded-2xl border border-purple-500/20 bg-[#10103d] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Category-wise Content Count</h3>
            <div className="flex flex-wrap gap-2">
              {categoryCounts.filter(c => c.count > 0).map(c => <span key={`${c.type}-${c.name}`} className={`rounded-lg border px-3 py-2 text-xs ${c.type === "Article" ? "border-purple-500/20 text-cyan-300 bg-cyan-500/5" : "border-purple-500/20 text-purple-300 bg-purple-500/5"}`}>{c.name}: <strong>{c.count}</strong></span>)}
              {categoryCounts.every(c => c.count === 0) && <p className="text-xs text-slate-500">No content assigned to categories yet.</p>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={contentTypeFilter} onChange={e => { setContentTypeFilter(e.target.value as any); setContentPage(1); }} className="bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"><option value="ALL">All content types</option><option value="ARTICLE">Articles</option><option value="NOTE">Notes & Commands</option></select>
            <select value={contentStatusFilter} onChange={e => { setContentStatusFilter(e.target.value as any); setContentPage(1); }} className="bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white"><option value="ALL">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select>
            <button type="button" onClick={() => { setContentTypeFilter("ARTICLE"); setContentStatusFilter("ALL"); setContentPage(1); }} className="text-xs px-3 py-2 rounded-xl border border-purple-500/20 text-cyan-300">Manage Articles</button>
            <button type="button" onClick={() => { setContentTypeFilter("NOTE"); setContentStatusFilter("ALL"); setContentPage(1); }} className="text-xs px-3 py-2 rounded-xl border border-purple-500/20 text-purple-300">Manage Notes & Commands</button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {paginatedContents.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#10103d] border border-purple-500/20 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border uppercase ${item.type === 'ARTICLE' ? 'text-cyan-400 bg-cyan-500/10 border-purple-500/30' : 'text-purple-400 bg-purple-500/10 border-purple-500/30'}`}>
                    {item.type}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      {item.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      By {item.author || "Admin"} • {item.readingTime || 5} min read • Category: {item.category} • Status: <span className={item.status === 'PUBLISHED' ? 'text-emerald-400' : 'text-amber-400'}>{item.status}</span> • Date: {item.publishDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button type="button" onClick={() => setPreviewContent(item)} className="p-1.5 text-cyan-300 hover:bg-white/5 rounded" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => openEditContentModal(contents.findIndex(c => c.id === item.id), item)} className="p-1.5 text-cyan-300 hover:bg-white/5 rounded" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleDeleteContent(contents.findIndex(c => c.id === item.id))} className="p-1.5 text-red-400 hover:bg-white/5 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
            <p className="text-xs text-slate-400">Showing {filteredContents.length ? (contentPage - 1) * CONTENT_PAGE_SIZE + 1 : 0}–{Math.min(contentPage * CONTENT_PAGE_SIZE, filteredContents.length)} of {filteredContents.length}</p>
            <div className="flex gap-2">
              <button type="button" disabled={contentPage <= 1} onClick={() => setContentPage(p => Math.max(1, p - 1))} className="px-3 py-2 rounded-lg border border-purple-500/20 text-xs text-slate-300 disabled:opacity-30">Previous</button>
              <span className="px-3 py-2 text-xs text-cyan-300">Page {contentPage} / {totalContentPages}</span>
              <button type="button" disabled={contentPage >= totalContentPages} onClick={() => setContentPage(p => Math.min(totalContentPages, p + 1))} className="px-3 py-2 rounded-lg border border-purple-500/20 text-xs text-slate-300 disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#09091f]/85 flex items-center justify-center p-4 backdrop-blur-md">
          <form onSubmit={handleCategorySave} className="w-full max-w-lg bg-[#141444] border border-purple-500/30 p-6 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
              <h2 className="text-base font-bold text-white">
                {editingIndex !== null ? "Edit Category" : `Add New ${modalType === "ARTICLE" ? "Article" : "Note"} Category`}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={modalType === "ARTICLE" ? articleForm.name : noteForm.name}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, name: e.target.value }) : setNoteForm({ ...noteForm, name: e.target.value })}
                  placeholder="e.g. Advanced Routing"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slug</label>
                <input
                  type="text"
                  value={modalType === "ARTICLE" ? articleForm.slug : noteForm.slug}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, slug: e.target.value }) : setNoteForm({ ...noteForm, slug: e.target.value })}
                  placeholder="advanced-routing"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={modalType === "ARTICLE" ? articleForm.description : noteForm.description}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, description: e.target.value }) : setNoteForm({ ...noteForm, description: e.target.value })}
                  placeholder="Short summary..."
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white resize-none outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Icon Identifier</label>
                <input
                  type="text"
                  value={modalType === "ARTICLE" ? articleForm.icon : noteForm.icon}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, icon: e.target.value }) : setNoteForm({ ...noteForm, icon: e.target.value })}
                  placeholder="Network, Server..."
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {modalType === "ARTICLE" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category Type</label>
                  <input
                    type="text"
                    value={articleForm.categoryType}
                    onChange={(e) => setArticleForm({ ...articleForm, categoryType: e.target.value })}
                    placeholder="Core, Security, etc."
                    className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Link</label>
                <input
                  type="text"
                  value={modalType === "ARTICLE" ? articleForm.link : noteForm.link}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, link: e.target.value }) : setNoteForm({ ...noteForm, link: e.target.value })}
                  placeholder="/blog/category/..."
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Serial / Order</label>
                <input
                  type="number"
                  value={modalType === "ARTICLE" ? articleForm.sortOrder : noteForm.sortOrder}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, sortOrder: Number(e.target.value) }) : setNoteForm({ ...noteForm, sortOrder: Number(e.target.value) })}
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalType === "ARTICLE" ? articleForm.active : noteForm.active}
                    onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, active: e.target.checked }) : setNoteForm({ ...noteForm, active: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400"
                  />
                  <span className="text-xs text-slate-300">Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalType === "ARTICLE" ? articleForm.featured : noteForm.featured}
                    onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, featured: e.target.checked }) : setNoteForm({ ...noteForm, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span className="text-xs text-slate-300">Featured</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SEO Title</label>
                <input
                  type="text"
                  value={modalType === "ARTICLE" ? articleForm.seoTitle : noteForm.seoTitle}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, seoTitle: e.target.value }) : setNoteForm({ ...noteForm, seoTitle: e.target.value })}
                  placeholder="SEO Meta Title"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Meta Description</label>
                <input
                  type="text"
                  value={modalType === "ARTICLE" ? articleForm.seoDescription : noteForm.seoDescription}
                  onChange={(e) => modalType === "ARTICLE" ? setArticleForm({ ...articleForm, seoDescription: e.target.value }) : setNoteForm({ ...noteForm, seoDescription: e.target.value })}
                  placeholder="SEO Meta Description"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-purple-500/20">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5">Cancel</button>
              <button type="submit" className="bg-[#8b5cf6] text-[#09091f] px-5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-[#9b6cff]">
                {editingIndex !== null ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENT MANAGER ADD / EDIT MODAL */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#09091f]/85 flex items-center justify-center p-4 backdrop-blur-md">
          <form onSubmit={handleContentSave} className="w-full max-w-2xl bg-[#141444] border border-purple-500/30 p-6 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
              <h2 className="text-base font-bold text-white">
                {editingContentIndex !== null ? "Edit Content" : "Add New Content"}
              </h2>
              <button type="button" onClick={() => setIsContentModalOpen(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="Enter title..."
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Short Description</label>
                <textarea rows={2} value={contentForm.description || ""} onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })} placeholder="Short card summary..." className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none resize-y" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Author Name</label>
                <input value={contentForm.author || ""} onChange={e => setContentForm({ ...contentForm, author: e.target.value })} placeholder="Author name" className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reading Time (minutes)</label>
                <input type="number" min={1} value={contentForm.readingTime || 5} onChange={e => setContentForm({ ...contentForm, readingTime: Math.max(1, Number(e.target.value)) })} className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</label>
                <select
                  value={contentForm.type}
                  onChange={(e) => setContentForm({ ...contentForm, type: e.target.value as "ARTICLE" | "NOTE" })}
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="ARTICLE">Article</option>
                  <option value="NOTE">Engineering Note</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={contentForm.category}
                  onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })}
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {contentForm.type === 'ARTICLE' ? (
                    articleCategories.map(cat => <option key={cat.slug} value={cat.name}>{cat.name}</option>)
                  ) : (
                    noteCategories.map(cat => <option key={cat.slug} value={cat.name}>{cat.name}</option>)
                  )}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={contentForm.coverImage}
                  onChange={(e) => setContentForm({ ...contentForm, coverImage: e.target.value })}
                  placeholder="https://... or upload below"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { alert("Please choose an image smaller than 5 MB."); return; } const reader = new FileReader(); reader.onload = () => setContentForm(prev => ({ ...prev, coverImage: String(reader.result || "") })); reader.readAsDataURL(file); }} className="mt-2 block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
                {contentForm.coverImage && <img src={contentForm.coverImage} alt="Cover preview" className="mt-2 h-24 w-full rounded-lg object-cover" />}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{contentForm.type === "NOTE" ? "Command / Configuration Code" : "Full Content / Body"}</label>
                <textarea
                  rows={5}
                  value={contentForm.fullContent}
                  onChange={(e) => setContentForm({ ...contentForm, fullContent: e.target.value })}
                  placeholder="Write full content here..."
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reference Link</label>
                <input
                  type="text"
                  value={contentForm.referenceLink}
                  onChange={(e) => setContentForm({ ...contentForm, referenceLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Network, Cisco, Guide"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={contentForm.status}
                  onChange={(e) => setContentForm({ ...contentForm, status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED" })}
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Publish Date</label>
                <input
                  type="date"
                  value={contentForm.publishDate}
                  onChange={(e) => setContentForm({ ...contentForm, publishDate: e.target.value })}
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentForm.featured}
                    onChange={(e) => setContentForm({ ...contentForm, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span className="text-xs text-slate-300">Featured</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SEO Title</label>
                <input
                  type="text"
                  value={contentForm.seoTitle}
                  onChange={(e) => setContentForm({ ...contentForm, seoTitle: e.target.value })}
                  placeholder="SEO Meta Title"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SEO Description</label>
                <input
                  type="text"
                  value={contentForm.seoDescription}
                  onChange={(e) => setContentForm({ ...contentForm, seoDescription: e.target.value })}
                  placeholder="SEO Meta Description"
                  className="w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-purple-500/20">
              <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5">Cancel</button>
              <button type="submit" className="bg-[#8b5cf6] text-[#09091f] px-5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-[#9b6cff]">
                {editingContentIndex !== null ? "Update Content" : "Save Content"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewContent && (
        <div className="fixed inset-0 z-50 bg-[#09091f]/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#141444] border border-purple-500/30 p-6 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" /> Content Preview
              </h2>
              <button type="button" onClick={() => setPreviewContent(null)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-purple-500/30">{previewContent.type}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{previewContent.category}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${previewContent.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{previewContent.status}</span>
              </div>

              <h3 className="text-lg font-bold text-white">{previewContent.title}</h3>
              {previewContent.description && <p className="text-sm text-slate-300">{previewContent.description}</p>}
              <p className="text-xs text-slate-500">By {previewContent.author || "Admin"} · {previewContent.readingTime || 5} min read · {previewContent.publishDate}</p>

              {previewContent.coverImage && (
                <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-900 border border-purple-500/20">
                  <img src={previewContent.coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#10103d] border border-purple-500/20 text-xs text-slate-300 whitespace-pre-wrap">
                {previewContent.fullContent || "No content provided."}
              </div>

              {previewContent.referenceLink && (
                <p className="text-xs text-cyan-400 truncate">
                  Reference: <a href={previewContent.referenceLink} target="_blank" rel="noreferrer" className="underline">{previewContent.referenceLink}</a>
                </p>
              )}

              {previewContent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {previewContent.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-300">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-purple-500/20">
              <button type="button" onClick={() => setPreviewContent(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8b5cf6] text-[#09091f] hover:bg-[#9b6cff]">Close Preview</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable UI components
function TabButton({ active, onClick, label, icon: Icon, color }: any) {
  const activeClass = color === "cyan" ? "bg-[#8b5cf6] text-[#09091f] shadow-lg shadow-cyan-500/20" : "bg-purple-600 text-white shadow-lg shadow-purple-500/20";
  return (
    <button type="button" onClick={onClick} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${active ? activeClass : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function InputField({ label, value, onChange, isTextArea }: any) {
  const cls = "w-full bg-[#10103d] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-colors";
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      {isTextArea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}