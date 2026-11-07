"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Layers,
  Zap,
  Search,
} from "lucide-react";
import { upsertCaseStudy, deleteCaseStudy } from "@/actions/case-study";

interface ProjectOption {
  id: string;
  title: string;
  slug: string;
}

interface CaseStudyItem {
  id: string;
  projectId: string;
  problem: string;
  process: string | null;
  solution: string;
  outcome: string | null;
  content: string | null;
  project: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
}

interface CaseStudiesManagerProps {
  initialCaseStudies: CaseStudyItem[];
  availableProjects: ProjectOption[];
}

export function CaseStudiesManager({
  initialCaseStudies,
  availableProjects,
}: CaseStudiesManagerProps) {
  const [studies, setStudies] = useState(initialCaseStudies);
  const [editingStudy, setEditingStudy] = useState<CaseStudyItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredStudies = studies.filter(
    (s) =>
      s.project.title.toLowerCase().includes(search.toLowerCase()) ||
      s.problem.toLowerCase().includes(search.toLowerCase()) ||
      s.solution.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingStudy(null);
    setIsFormOpen(true);
    setStatusMessage(null);
  };

  const handleOpenEdit = (study: CaseStudyItem) => {
    setEditingStudy(study);
    setIsFormOpen(true);
    setStatusMessage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      await upsertCaseStudy(formData);
      setStatusMessage({ type: "success", text: "Case study saved successfully!" });
      setIsFormOpen(false);
      window.location.reload();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save case study." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    setLoading(true);

    try {
      await deleteCaseStudy(id);
      setStudies(studies.filter((s) => s.id !== id));
      setStatusMessage({ type: "success", text: "Case study deleted." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete case study." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141444]/80 border border-purple-500/25 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architectural Deconstructions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Case Studies Management
          </h1>
          <p className="text-xs text-slate-400">
            Deconstruct deep architectural challenges, engineered solutions, and quantifiable metrics for projects.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Case Study</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${statusMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case studies by project title, problem, or solution..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
        />
      </div>

      {/* Modal / Form Drawer */}
      {isFormOpen && (
        <div className="p-6 rounded-3xl bg-[#141444] border border-cyan-500/30 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <h2 className="text-base font-bold text-white font-heading">
              {editingStudy ? `Edit Case Study: ${editingStudy.project.title}` : "Create New Case Study"}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-[#0e0e34] border border-purple-500/20"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Target Project */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Project <span className="text-rose-400">*</span>
              </label>
              {editingStudy ? (
                <input
                  type="hidden"
                  name="projectId"
                  value={editingStudy.projectId}
                />
              ) : null}
              <select
                name={editingStudy ? undefined : "projectId"}
                defaultValue={editingStudy?.projectId || ""}
                disabled={!!editingStudy}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0e0e34] border border-purple-500/30 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-60"
                required={!editingStudy}
              >
                <option value="" disabled>
                  Select a project to link case study...
                </option>
                {availableProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title} (/{proj.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Problem Statement */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                01. The Problem & Challenge <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="problem"
                defaultValue={editingStudy?.problem || ""}
                rows={3}
                required
                placeholder="Describe the architectural friction, latency spike, or network vulnerability faced..."
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Engineering Process */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                02. Engineering & Research Process (Optional)
              </label>
              <textarea
                name="process"
                defaultValue={editingStudy?.process || ""}
                rows={3}
                placeholder="Benchmarking, topology redesign, protocol selection, iterative testing..."
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Implemented Solution */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                03. Implemented Solution <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="solution"
                defaultValue={editingStudy?.solution || ""}
                rows={3}
                required
                placeholder="Architectural solution: Next-Gen Firewalls, IP PBX deployment, zero-trust tunnels, Next.js monolith..."
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Quantifiable Outcomes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                04. Measurable Outcomes & Metrics (Optional)
              </label>
              <textarea
                name="outcome"
                defaultValue={editingStudy?.outcome || ""}
                rows={2}
                placeholder="e.g. 99.99% uptime, latency reduced from 12s to 45ms, zero security intrusions..."
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Full Markdown/Content (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Extended Technical Narrative (Optional Markdown)
              </label>
              <textarea
                name="content"
                defaultValue={editingStudy?.content || ""}
                rows={4}
                placeholder="Detailed technical breakdown, code snippets, or configuration topology notes..."
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Case Study"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Case Studies List */}
      <div className="space-y-4">
        {filteredStudies.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#141444]/40 border border-purple-500/20 space-y-3">
            <BookOpen className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Case Studies Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first case study by attaching an architectural breakdown to any published project.
            </p>
          </div>
        ) : (
          filteredStudies.map((study) => (
            <div
              key={study.id}
              className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-4 hover:border-purple-500/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      Case Study
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      /{study.project.slug}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading mt-1">
                    {study.project.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`/case-studies/${study.project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-cyan-400 hover:text-white hover:border-cyan-500/40 transition-colors"
                    title="View live case study"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(study)}
                    className="p-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors"
                    title="Edit case study"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(study.id)}
                    className="p-2 rounded-xl bg-[#0e0e34] border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                    title="Delete case study"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3-Column Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0e0e34] border border-purple-500/15 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Problem / Challenge</span>
                  </span>
                  <p className="text-slate-300 line-clamp-3 leading-relaxed">
                    {study.problem}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0e0e34] border border-purple-500/15 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-purple-300 font-bold block flex items-center space-x-1">
                    <Layers className="w-3 h-3" />
                    <span>Engineered Solution</span>
                  </span>
                  <p className="text-slate-300 line-clamp-3 leading-relaxed">
                    {study.solution}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0e0e34] border border-purple-500/15 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Outcomes &amp; Impact</span>
                  </span>
                  <p className="text-slate-300 line-clamp-3 leading-relaxed">
                    {study.outcome || "Measurable metrics recorded."}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
