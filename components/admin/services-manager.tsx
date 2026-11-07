"use client";

import { useState } from "react";
import {
  Wrench,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Settings,
  Workflow,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Check,
  Radio,
  ShieldCheck,
  Server,
  Lock,
  Activity,
  Calculator,
} from "lucide-react";
import {
  saveServiceAction,
  deleteServiceAction,
  savePageSettingsAction,
} from "@/actions/services-admin-actions";
import { ServicesPageConfig, EstimatorTier } from "@/lib/services-page-config";
import Link from "next/link";

interface ServicesManagerProps {
  initialServices: any[];
  initialConfig: ServicesPageConfig;
}

export function ServicesManager({ initialServices, initialConfig }: ServicesManagerProps) {
  const [services, setServices] = useState<any[]>(initialServices);
  const [activeTab, setActiveTab] = useState<"SERVICE" | "SOLUTION" | "ESTIMATOR" | "SETTINGS">("SERVICE");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHidden, setShowHidden] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States for Item
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    icon: "Network",
    category: "SERVICE",
    sortOrder: "1",
    active: true,
    tags: "",
  });

  // Form States for Page Settings & Estimator
  const [config, setConfig] = useState<ServicesPageConfig>(initialConfig);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Estimator editing state
  const [editingTier, setEditingTier] = useState<EstimatorTier | null>(null);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [tierForm, setTierForm] = useState({
    id: "",
    name: "",
    category: "VoIP & Telecom",
    basePrice: 450,
    deliveryDays: 5,
    description: "",
    features: "",
  });

  // Dashboard Stats
  const totalItems = services.length;
  const activeItems = services.filter((s) => s.active).length;
  const hiddenItems = totalItems - activeItems;
  const totalServices = services.filter((s) => s.category === "SERVICE").length;
  const totalSolutions = services.filter((s) => s.category === "SOLUTION").length;

  const openModal = (item: any = null, type: "SERVICE" | "SOLUTION" = "SERVICE") => {
    setEditingItem(item);
    setFormData({
      title: item?.title || "",
      slug: item?.slug || "",
      description: item?.description || "",
      icon: item?.icon || "Network",
      category: item?.category || type,
      sortOrder: String(
        item?.sortOrder || Math.max(0, ...services.map((x) => x.sortOrder || 0)) + 1
      ),
      active: item?.active ?? true,
      tags: item?.attachments ? item.attachments.join(", ") : "",
    });
    setIsModalOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    if (editingItem?.id) data.append("id", editingItem.id);
    Object.entries(formData).forEach(([key, val]) => data.append(key, String(val)));

    const res = await saveServiceAction(data);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSavedNotice(false);

    const data = new FormData();
    Object.entries(config).forEach(([key, val]) => {
      if (key === "estimatorTiers") {
        data.append(key, JSON.stringify(val));
      } else {
        data.append(key, String(val));
      }
    });

    const res = await savePageSettingsAction(data);
    if (res.success) {
      setConfigSavedNotice(true);
      setTimeout(() => setConfigSavedNotice(false), 3000);
    } else {
      alert(res.error || "Failed to save settings.");
    }
    setIsSavingConfig(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const res = await deleteServiceAction(id);
    if (res.success) {
      setServices(services.filter((s) => s.id !== id));
    } else {
      alert(res.error);
    }
  };

  const toggleVisibility = async (item: any) => {
    const data = new FormData();
    data.append("id", item.id);
    data.append("title", item.title);
    data.append("description", item.description);
    data.append("category", item.category);
    data.append("active", String(!item.active));
    data.append("icon", item.icon || "Network");
    data.append("sortOrder", String(item.sortOrder || 1));
    if (item.attachments) {
      data.append("tags", item.attachments.join(", "));
    }

    const res = await saveServiceAction(data);
    if (res.success) {
      setServices(
        services.map((x) => (x.id === item.id ? { ...x, active: !item.active } : x))
      );
    }
  };

  // Estimator Tier Handlers
  const openTierModal = (tier: EstimatorTier | null = null) => {
    setEditingTier(tier);
    if (tier) {
      setTierForm({
        id: tier.id,
        name: tier.name,
        category: tier.category,
        basePrice: tier.basePrice,
        deliveryDays: tier.deliveryDays,
        description: tier.description,
        features: tier.features.join(", "),
      });
    } else {
      setTierForm({
        id: `tier-${Date.now()}`,
        name: "",
        category: "Network Infrastructure",
        basePrice: 500,
        deliveryDays: 5,
        description: "",
        features: "",
      });
    }
    setIsTierModalOpen(true);
  };

  const handleTierSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTier: EstimatorTier = {
      id: tierForm.id || `tier-${Date.now()}`,
      name: tierForm.name,
      category: tierForm.category,
      basePrice: Number(tierForm.basePrice),
      deliveryDays: Number(tierForm.deliveryDays),
      description: tierForm.description,
      features: tierForm.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    let updatedTiers: EstimatorTier[];
    if (editingTier) {
      updatedTiers = config.estimatorTiers.map((t) => (t.id === editingTier.id ? newTier : t));
    } else {
      updatedTiers = [...config.estimatorTiers, newTier];
    }

    const newConfig = { ...config, estimatorTiers: updatedTiers };
    setConfig(newConfig);
    setIsTierModalOpen(false);

    // Save to server
    const data = new FormData();
    Object.entries(newConfig).forEach(([key, val]) => {
      if (key === "estimatorTiers") {
        data.append(key, JSON.stringify(val));
      } else {
        data.append(key, String(val));
      }
    });
    await savePageSettingsAction(data);
  };

  const handleTierDelete = async (tierId: string) => {
    if (!confirm("Are you sure you want to remove this calculator module?")) return;
    const updatedTiers = config.estimatorTiers.filter((t) => t.id !== tierId);
    const newConfig = { ...config, estimatorTiers: updatedTiers };
    setConfig(newConfig);

    const data = new FormData();
    Object.entries(newConfig).forEach(([key, val]) => {
      if (key === "estimatorTiers") {
        data.append(key, JSON.stringify(val));
      } else {
        data.append(key, String(val));
      }
    });
    await savePageSettingsAction(data);
  };

  const filteredItems = services
    .filter(
      (s) =>
        s.category === activeTab &&
        (showHidden || s.active) &&
        (s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="space-y-6 text-slate-300 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b0b2b] via-[#10103e] to-[#16164d] border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full CMS Control • Public /services Page Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <Wrench className="w-5 h-5" />
              </div>
              <span>Services &amp; Solutions Console</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Control client-facing services, infrastructure packages, technical solutions, cost estimator pricing &amp; timeline modules in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/services"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0e0e34] border border-cyan-500/30 text-xs font-mono font-bold text-cyan-400 hover:text-white transition-all shadow-md"
            >
              <span>View Public /services</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => openModal(null, "SERVICE")}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
            <button
              onClick={() => openModal(null, "SOLUTION")}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-purple-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Solution</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-purple-500/20">
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-purple-500/20">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Total Offerings</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">{totalItems}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block">Active Public</span>
            <span className="text-xl font-black text-cyan-400 font-mono mt-0.5 block">{activeItems}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-slate-700/40">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Draft / Hidden</span>
            <span className="text-xl font-black text-slate-400 font-mono mt-0.5 block">{hiddenItems}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block">Services</span>
            <span className="text-xl font-black text-cyan-400 font-mono mt-0.5 block">{totalServices}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e34]/70 border border-purple-500/20">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Solutions</span>
            <span className="text-xl font-black text-purple-400 font-mono mt-0.5 block">{totalSolutions}</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("SERVICE")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === "SERVICE"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                : "bg-[#0e0e34] border border-cyan-500/20 text-slate-400 hover:text-white"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Professional Services ({totalServices})</span>
          </button>

          <button
            onClick={() => setActiveTab("SOLUTION")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === "SOLUTION"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-[#0e0e34] border border-purple-500/20 text-slate-400 hover:text-white"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Technical Solutions ({totalSolutions})</span>
          </button>

          <button
            onClick={() => setActiveTab("ESTIMATOR")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === "ESTIMATOR"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-[#0e0e34] border border-emerald-500/20 text-slate-400 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Cost Estimator ({config.estimatorTiers?.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === "SETTINGS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-[#0e0e34] border border-indigo-500/20 text-slate-400 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Page Content &amp; Toggles</span>
          </button>
        </div>

        {activeTab !== "SETTINGS" && activeTab !== "ESTIMATOR" && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0e0e34] border border-purple-500/25 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono w-44 sm:w-56"
              />
            </div>
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showHidden
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  : "bg-[#0e0e34] border-slate-700 text-slate-400"
              }`}
              title={showHidden ? "Showing all items" : "Hiding inactive"}
            >
              {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1 & 2: ITEMS GRID (Services or Solutions) */}
      {(activeTab === "SERVICE" || activeTab === "SOLUTION") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 bg-[#0e0e34] border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl ${
                item.active
                  ? activeTab === "SERVICE"
                    ? "border-cyan-500/25 hover:border-cyan-500/50"
                    : "border-purple-500/25 hover:border-purple-500/50"
                  : "border-slate-800 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-[#141444] border flex items-center justify-center ${
                        activeTab === "SERVICE"
                          ? "border-cyan-500/30 text-cyan-400"
                          : "border-purple-500/30 text-purple-400"
                      }`}
                    >
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-white line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        Priority Order: #{item.sortOrder || 1} • /{item.slug}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${
                      item.active
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                    }`}
                  >
                    {item.active ? "Published" : "Hidden"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {item.attachments && item.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.attachments.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[#141444] border border-purple-500/15 text-[10px] font-mono text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleVisibility(item)}
                  className="text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  {item.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{item.active ? "Hide" : "Show"}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openModal(item, activeTab)}
                    className="p-1.5 rounded-lg bg-[#141444] hover:bg-[#1a1a52] border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-1 px-2.5 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono p-2 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ESTIMATOR TIERS CUSTOMIZATION */}
      {activeTab === "ESTIMATOR" && (
        <div className="rounded-3xl bg-[#0e0e34] border border-emerald-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <span>Interactive Cost &amp; Timeline Estimator Modules</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Customize prices, delivery turnaround days, descriptions, and feature checklists displayed on the public calculator.
              </p>
            </div>
            <button
              onClick={() => openTierModal(null)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Estimator Module</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(config.estimatorTiers || []).map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl bg-[#141444]/60 border border-purple-500/20 p-5 space-y-3 font-mono flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                        {tier.category}
                      </span>
                      <h3 className="text-sm font-bold text-white">{tier.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        ${tier.basePrice}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ~{tier.deliveryDays} Days
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {tier.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tier.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[#0e0e34] border border-emerald-500/20 text-[10px] text-emerald-300"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-500/15 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openTierModal(tier)}
                    className="p-1.5 px-3 rounded-lg bg-[#0e0e34] hover:bg-[#1a1a52] border border-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Module</span>
                  </button>
                  <button
                    onClick={() => handleTierDelete(tier.id)}
                    className="p-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAGE CONTENT & SETTINGS */}
      {activeTab === "SETTINGS" && (
        <form onSubmit={handleConfigSubmit} className="rounded-3xl bg-[#0e0e34] border border-indigo-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Public /services Page Content Controls</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Update banners, titles, descriptions, and feature toggles displayed on the public services page.
              </p>
            </div>

            {configSavedNotice && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Saved Live!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Top Badge Text
              </label>
              <input
                type="text"
                value={config.badgeText}
                onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Hero Heading Primary
              </label>
              <input
                type="text"
                value={config.heroHeading}
                onChange={(e) => setConfig({ ...config, heroHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Hero Heading Gradient Highlight
              </label>
              <input
                type="text"
                value={config.heroHeadingHighlight}
                onChange={(e) => setConfig({ ...config, heroHeadingHighlight: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Hero Subtitle Description
              </label>
              <input
                type="text"
                value={config.heroSubtitle}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Estimator Banner Title
              </label>
              <input
                type="text"
                value={config.estimatorTitle}
                onChange={(e) => setConfig({ ...config, estimatorTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Estimator Banner Subtitle
              </label>
              <input
                type="text"
                value={config.estimatorSubtitle}
                onChange={(e) => setConfig({ ...config, estimatorSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="pt-4 border-t border-indigo-500/20 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Section Visibility Toggles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#141444] border border-purple-500/15 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={config.showCostEstimator}
                  onChange={(e) => setConfig({ ...config, showCostEstimator: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-white">Show Interactive Estimator</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#141444] border border-purple-500/15 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={config.showServices}
                  onChange={(e) => setConfig({ ...config, showServices: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-white">Show Services Grid</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#141444] border border-purple-500/15 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={config.showSolutions}
                  onChange={(e) => setConfig({ ...config, showSolutions: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-white">Show Solutions Grid</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSavingConfig ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Live Settings...</span>
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

      {/* Edit/Create Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e0e34] border border-purple-500/30 p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="text-base font-bold text-white font-mono">
                {editingItem ? "Edit Service Offering" : `Create New ${formData.category === "SERVICE" ? "Service" : "Solution"}`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Enterprise VoIP & Grandstream PBX"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="SERVICE">Service</option>
                    <option value="SOLUTION">Solution</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">Priority Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of the service and capabilities..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Key Technologies / Bullet Points (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Grandstream PBX, FXO/FXS, IVR Routing, SIP Trunking"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <label htmlFor="activeCheck" className="text-slate-300 cursor-pointer">
                  Publish to Live Website
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center space-x-1.5 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estimator Tier Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e0e34] border border-emerald-500/30 p-6 sm:p-7 space-y-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="text-base font-bold text-white">
                {editingTier ? "Edit Estimator Module" : "Add Estimator Module"}
              </h2>
              <button
                onClick={() => setIsTierModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTierSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Module Name</label>
                <input
                  type="text"
                  required
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  placeholder="e.g. Grandstream IP PBX Deployment"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Category</label>
                  <input
                    type="text"
                    required
                    value={tierForm.category}
                    onChange={(e) => setTierForm({ ...tierForm, category: e.target.value })}
                    placeholder="VoIP & Telecom"
                    className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Base Price ($)</label>
                  <input
                    type="number"
                    required
                    value={tierForm.basePrice}
                    onChange={(e) => setTierForm({ ...tierForm, basePrice: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Days (Timeline)</label>
                  <input
                    type="number"
                    required
                    value={tierForm.deliveryDays}
                    onChange={(e) => setTierForm({ ...tierForm, deliveryDays: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Description</label>
                <textarea
                  rows={2}
                  required
                  value={tierForm.description}
                  onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                  placeholder="Short explanation of scope..."
                  className="w-full px-4 py-2 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-emerald-400 font-sans text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  Included Features (comma-separated checklist)
                </label>
                <input
                  type="text"
                  value={tierForm.features}
                  onChange={(e) => setTierForm({ ...tierForm, features: e.target.value })}
                  placeholder="Custom IVR, Extensions, Call Recording"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141444] border border-purple-500/20 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Module</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
