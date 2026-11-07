"use client";

import { useState } from "react";
import {
  FlaskConical,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Github,
  CheckCircle2,
  Search,
  Sparkles,
  Layers,
  Globe,
} from "lucide-react";
import { createLab, updateLab, deleteLab, toggleLabStatus } from "@/actions/lab";

interface LabItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  demoUrl: string | null;
  repoUrl: string | null;
  coverUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: Date;
}

interface LabsManagerProps {
  initialLabs: LabItem[];
}

export function LabsManager({ initialLabs }: LabsManagerProps) {
  const [labs, setLabs] = useState<LabItem[]>(initialLabs);
  const [editingLab, setEditingLab] = useState<LabItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredLabs = labs.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingLab(null);
    setIsModalOpen(true);
    setStatusMessage(null);
  };

  const handleOpenEdit = (lab: LabItem) => {
    setEditingLab(lab);
    setIsModalOpen(true);
    setStatusMessage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    const formData = new FormData(e.currentTarget);

    try {
      if (editingLab) {
        await updateLab(formData);
        setStatusMessage({ type: "success", text: "Lab sandbox updated successfully!" });
      } else {
        await createLab(formData);
        setStatusMessage({ type: "success", text: "Lab sandbox created successfully!" });
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save lab sandbox." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lab sandbox?")) return;
    setLoading(true);

    try {
      await deleteLab(id);
      setLabs(labs.filter((l) => l.id !== id));
      setStatusMessage({ type: "success", text: "Lab sandbox deleted." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete lab." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (lab: LabItem) => {
    const nextStatus = lab.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setLoading(true);

    try {
      await toggleLabStatus(lab.id, nextStatus);
      setLabs(
        labs.map((l) => (l.id === lab.id ? { ...l, status: nextStatus } : l))
      );
      setStatusMessage({
        type: "success",
        text: `Lab status updated to ${nextStatus}.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update status." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141444]/80 border border-purple-500/25 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>R&amp;D Prototypes &amp; Network Sandboxes</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Labs &amp; Sandboxes Console
          </h1>
          <p className="text-xs text-slate-400">
            Publish interactive network topologies, eBPF security sandboxes, and experimental CLI automation prototypes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/labs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#0e0e34] border border-purple-500/30 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Public Page</span>
          </a>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lab Sandbox</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            statusMessage.type === "success"
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
          placeholder="Search labs by title, slug, or technical scope..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Modal / Form Drawer */}
      {isModalOpen && (
        <div className="p-6 rounded-3xl bg-[#141444] border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <h2 className="text-base font-bold text-white font-heading">
              {editingLab ? `Edit Lab: ${editingLab.title}` : "Create New Lab Sandbox"}
            </h2>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-[#0e0e34] border border-purple-500/20"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {editingLab && <input type="hidden" name="id" value={editingLab.id} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Lab Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingLab?.title || ""}
                  required
                  placeholder="e.g. BGP Route Leak & Hijack Simulation Sandbox"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  URL Slug <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingLab?.slug || ""}
                  required
                  placeholder="e.g. bgp-route-leak-simulator"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Technical Description &amp; Scope <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="description"
                defaultValue={editingLab?.description || ""}
                rows={3}
                required
                placeholder="Explain the simulation architecture, protocols tested, and experimental objectives..."
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Live Demo / Interactive Lab URL
                </label>
                <input
                  type="url"
                  name="demoUrl"
                  defaultValue={editingLab?.demoUrl || ""}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  name="repoUrl"
                  defaultValue={editingLab?.repoUrl || ""}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cover Image / Topology Diagram URL
                </label>
                <input
                  type="text"
                  name="coverUrl"
                  defaultValue={editingLab?.coverUrl || ""}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Publish Status
                </label>
                <select
                  name="status"
                  defaultValue={editingLab?.status || "DRAFT"}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="PUBLISHED">Published Live</option>
                  <option value="DRAFT">Draft Mode</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Lab Sandbox"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLabs.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-[#141444]/40 border border-purple-500/20 space-y-2">
            <FlaskConical className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Labs Found</h3>
            <p className="text-xs text-slate-400">Add virtual network topologies and R&amp;D sandboxes.</p>
          </div>
        ) : (
          filteredLabs.map((lab) => (
            <div
              key={lab.id}
              className="p-5 rounded-2xl bg-[#141444]/70 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {lab.coverUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0e0e34] border border-purple-500/20">
                    <img src={lab.coverUrl} alt={lab.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      lab.status === "PUBLISHED"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                        : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {lab.status}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(lab)}
                      className="px-2 py-1 rounded-lg bg-[#0e0e34] border border-purple-500/20 text-[10px] font-mono text-slate-300 hover:text-white"
                      title="Toggle status"
                    >
                      {lab.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lab)}
                      className="p-1.5 rounded-lg bg-[#0e0e34] border border-purple-500/20 text-slate-300 hover:text-white"
                      title="Edit lab"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lab.id)}
                      className="p-1.5 rounded-lg bg-[#0e0e34] border border-rose-500/20 text-rose-400 hover:text-rose-300"
                      title="Delete lab"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    {lab.title}
                  </h3>
                  <div className="text-[10px] font-mono text-cyan-400">
                    /{lab.slug}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2 line-clamp-3">
                    {lab.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {lab.repoUrl && (
                    <a
                      href={lab.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#0e0e34] border border-purple-500/20 text-slate-300 hover:text-white inline-flex items-center space-x-1"
                    >
                      <Github className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-mono">Code</span>
                    </a>
                  )}
                  {lab.demoUrl && (
                    <a
                      href={lab.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#0e0e34] border border-purple-500/20 text-cyan-400 hover:text-white inline-flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono">Demo</span>
                    </a>
                  )}
                </div>

                <a
                  href="/labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-slate-400 hover:text-cyan-400"
                >
                  View on site →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
