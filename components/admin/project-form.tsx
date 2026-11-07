"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  Github,
  Tag,
  Sparkles,
  Zap,
  CheckCircle2,
  Network,
  Server,
  Globe,
  ShieldCheck,
  Cpu,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { saveProjectAction } from "@/actions/project-admin-actions";
import { getProjectCategoriesAction } from "@/actions/project-admin-actions";
import { FileUploadInput } from "@/components/admin/file-upload-input";
import { CATEGORY_OPTIONS } from "@/components/admin/project-manager";

interface ProjectFormProps {
  initialData?: any;
  mode: "create" | "edit";
}

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");

  const foundCat =
    initialData?.category ||
    (initialData?.attachments && typeof initialData?.attachments === "object"
      ? (initialData.attachments as any).category
      : "network-infra");
  const [category, setCategory] = useState<string>(foundCat || "network-infra");
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    CATEGORY_OPTIONS.map(({ id, label }) => ({ id, label }))
  );

  useEffect(() => {
    let active = true;
    getProjectCategoriesAction().then((result) => {
      if (!active || !result.success) return;
      setCategories(result.categories);
      setCategory((current: string) => {
        if (result.categories.some((item) => item.id === current)) return current;
        return result.categories[0]?.id || current;
      });
    }).catch(() => {
      // Keep the built-in categories as a fallback if loading fails.
    });
    return () => { active = false; };
  }, []);

  const [summary, setSummary] = useState(initialData?.summary || "");
  const [stackInput, setStackInput] = useState(
    Array.isArray(initialData?.stack) ? initialData.stack.join(", ") : ""
  );
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || "");
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || "");
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl || "");
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");

  const [hasCaseStudy, setHasCaseStudy] = useState(Boolean(initialData?.caseStudy));
  const [caseStudyProblem, setCaseStudyProblem] = useState(
    initialData?.caseStudy?.problem || ""
  );
  const [caseStudySolution, setCaseStudySolution] = useState(
    initialData?.caseStudy?.solution || ""
  );
  const [caseStudyOutcome, setCaseStudyOutcome] = useState(
    initialData?.caseStudy?.outcome || ""
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (mode === "create") {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (initialData?.id) {
        formData.append("id", initialData.id);
      }
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("category", category);
      formData.append("summary", summary);
      formData.append("stack", stackInput);
      formData.append("coverUrl", coverUrl);
      formData.append("liveUrl", liveUrl);
      formData.append("repoUrl", repoUrl);
      formData.append("featured", String(featured));
      formData.append("status", status);

      formData.append("hasCaseStudy", String(hasCaseStudy));
      if (hasCaseStudy) {
        formData.append("caseStudyProblem", caseStudyProblem);
        formData.append("caseStudySolution", caseStudySolution);
        formData.append("caseStudyOutcome", caseStudyOutcome);
      }

      const res = await saveProjectAction(formData);
      if (res.success) {
        router.push("/admin/projects");
        router.refresh();
      } else {
        setError(res.error || "Failed to save project.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/projects"
            className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>
                {mode === "create"
                  ? "Create New Architecture Blueprint"
                  : `Edit Blueprint: ${title}`}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure parameters, network topologies, and case study triad.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project / Architecture Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Zero-Downtime Multi-WAN Failover & Enterprise Core VLAN Routing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="enterprise-multi-wan-failover"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category Taxonomy <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#0b0f19] text-white">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Architecture Overview / Summary
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Detailed summary explaining the topology, core protocols, and throughput outcomes..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tech Stacks &amp; Hardware (Comma Separated)
          </label>
          <input
            type="text"
            value={stackInput}
            onChange={(e) => setStackInput(e.target.value)}
            placeholder="MikroTik RouterOS, BGP, 802.1Q VLANs, WireGuard, QoS"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <FileUploadInput
            label="Architecture Topology / Cover Image"
            name="coverUrl"
            value={coverUrl}
            onChange={(val) => setCoverUrl(val)}
            placeholder="https://... or upload architecture diagram"
            helpText="Supported formats: SVG, PNG, WEBP, JPG topologies."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Live URL / Portal</label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://portal.example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub / Config Repo URL</label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Publishing Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
            >
              <option value="PUBLISHED" className="bg-[#0b0f19]">Published (Live on Website)</option>
              <option value="DRAFT" className="bg-[#0b0f19]">Draft (Hidden)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="featuredCheckboxForm"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary bg-surface-50 border-border-subtle cursor-pointer"
            />
            <label htmlFor="featuredCheckboxForm" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Feature this build on homepage &amp; hero highlights
            </label>
          </div>
        </div>

        {/* Case Study Triad Section */}
        <div className="pt-4 border-t border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Case Study Triad (Challenge, Solution, Outcome)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Enable this to publish this project directly into the Industry Case Studies page.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hasCaseStudy}
              onChange={(e) => setHasCaseStudy(e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary bg-surface-50 border-border-subtle cursor-pointer"
            />
          </div>

          {hasCaseStudy && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-surface-50/50 border border-border-subtle animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-red-400 mb-1">
                  1. The Challenge / Operational Bottleneck
                </label>
                <textarea
                  rows={2}
                  value={caseStudyProblem}
                  onChange={(e) => setCaseStudyProblem(e.target.value)}
                  placeholder="e.g. ISP packet drops and routing convergence loops causing recurring SLA violations..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-400 mb-1">
                  2. Architectural Solution
                </label>
                <textarea
                  rows={2}
                  value={caseStudySolution}
                  onChange={(e) => setCaseStudySolution(e.target.value)}
                  placeholder="e.g. Deployed dual BGP upstream peering with automated route dampening and VRRP backup..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  3. Measurable Outcome &amp; Verified Metric
                </label>
                <textarea
                  rows={2}
                  value={caseStudyOutcome}
                  onChange={(e) => setCaseStudyOutcome(e.target.value)}
                  placeholder="e.g. 99.99% network uptime achieved with sub-second failover recorded across 1,000+ endpoints."
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border-subtle flex justify-end space-x-3">
          <Link
            href="/admin/projects"
            className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{mode === "create" ? "Save & Publish" : "Update Blueprint"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
