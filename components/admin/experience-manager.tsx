"use client";

import { useState } from "react";
import {
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Loader2,
  Tag,
  Building,
} from "lucide-react";
import { saveExperienceAction, deleteExperienceAction } from "@/actions/experience-actions";

interface ExperienceManagerProps {
  initialExperiences: any[];
}

export function ExperienceManager({ initialExperiences }: ExperienceManagerProps) {
  const [experiences, setExperiences] = useState<any[]>(initialExperiences);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState("work");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");

  // Format dates using local calendar values to avoid timezone date shifts.
  const toInputDate = (d: any) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const resetForm = () => {
    setEditingExp(null);
    setRole("");
    setOrganization("");
    setCategory("work");
    setStartDate("");
    setEndDate("");
    setCurrent(false);
    setDescription("");
    setHighlights("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (exp: any) => {
    setEditingExp(exp);
    setRole(exp.role || "");
    setOrganization(exp.organization || "");
    setCategory(exp.logoUrl === "training" ? "training" : "work");
    setStartDate(toInputDate(exp.startDate));
    setEndDate(toInputDate(exp.endDate));
    setCurrent(Boolean(exp.current));
    setDescription(exp.description || "");
    setHighlights(Array.isArray(exp.attachments) ? exp.attachments.join("\n") : "");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role.trim() || !organization.trim() || !startDate) {
      alert("Please fill in the role, organization, and start date.");
      return;
    }

    if (endDate && !current && endDate < startDate) {
      alert("End Date cannot be earlier than Start Date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (editingExp?.id) formData.append("id", editingExp.id);
      formData.append("role", role);
      formData.append("organization", organization);
      formData.append("category", category);
      formData.append("startDate", startDate);
      // A current role has no end date; the public page calculates its duration up to today.
      if (!current && endDate) formData.append("endDate", endDate);
      formData.append("current", String(current));
      formData.append("description", description);
      formData.append("highlights", highlights);

      const res = await saveExperienceAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, expRole: string) => {
    if (!confirm(`Are you sure you want to delete "${expRole}"?`)) return;
    try {
      const res = await deleteExperienceAction(id);
      if (res.success) {
        setExperiences((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert("Could not delete experience.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Briefcase className="w-6 h-6 text-sky-400" />
            <span>Experience & Training CMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish, edit categories (Work vs Training), and manage career milestones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Milestone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {experiences.length === 0 ? (
          <div className="col-span-full glass-panel p-12 rounded-3xl text-center border border-border-subtle">
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400">No milestones found.</p>
          </div>
        ) : (
          experiences.map((exp) => (
            <div
              key={exp.id}
              className="glass-panel p-5 rounded-2xl border border-border-subtle flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Tag className="w-2.5 h-2.5 mr-1" />
                    {exp.logoUrl === "training" ? "Professional Training" : "Work Experience"}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-2">{exp.role}</h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mt-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{exp.organization}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(exp)}
                  className="p-2 rounded-lg text-slate-400 hover:text-sky-400 bg-surface-50 transition-colors"
                  title="Edit Milestone"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id, exp.role)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 bg-surface-50 transition-colors"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-card max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex justify-between pb-4 border-b border-border-subtle mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingExp ? "Edit Milestone" : "Add Career Milestone"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update role details, dates, and customize work/training category.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Position Title <span className="text-red-400">*</span></label>
                  <input required type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Associate Engineer" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organization <span className="text-red-400">*</span></label>
                  <input required type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g. Excel Technology Ltd." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category Type <span className="text-red-400">*</span></label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="work" className="bg-[#0b0f19]">Work Experience</option>
                    <option value="training" className="bg-[#0b0f19]">Professional Training / Certification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date <span className="text-red-400">*</span></label>
                  <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input type="date" disabled={current} value={current ? "" : endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs disabled:opacity-30" />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="exp-current"
                  checked={current}
                  onChange={(e) => {
                    const isCurrent = e.target.checked;
                    setCurrent(isCurrent);
                    if (isCurrent) setEndDate("");
                  }}
                  className="w-4 h-4 rounded text-primary focus:ring-primary bg-surface-50 border-border-subtle cursor-pointer"
                />
                <label htmlFor="exp-current" className="text-xs font-semibold text-slate-300 cursor-pointer">Currently working/training here (Present)</label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Overview of your responsibilities..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Responsibilities / Highlights (One per line)</label>
                <textarea rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="- Configured Cisco routers&#10;- Managed IP PBX systems" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" />
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Milestone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}