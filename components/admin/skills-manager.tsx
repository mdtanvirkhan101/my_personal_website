"use client";

import { useEffect, useState } from "react";
import { Wrench, Plus, Trash2, Edit3, X, Save, Loader2, Tag, Layers, Search, Eye, EyeOff, FolderPlus } from "lucide-react";
import { saveSkillAction, deleteSkillAction, renameSkillCategoryAction, getSkillCategoryImagesAction, saveSkillCategoryImageAction } from "@/actions/skills-admin-actions";
import { FileUploadInput } from "@/components/admin/file-upload-input";

interface SkillsManagerProps {
  initialSkills: any[];
}

export function SkillsManager({ initialSkills }: SkillsManagerProps) {
  const [skills, setSkills] = useState<any[]>(initialSkills);
  const [selectedTab, setSelectedTab] = useState<"CORE" | "TOOL">("CORE");
  const [searchQuery, setSearchQuery] = useState("");

  const defaultCoreCategories = ["Network Infrastructure & Routing", "VoIP & Telephony Tools"];
  const defaultToolCategories = ["Network Tools", "Systems & Servers", "Development & Workflow"];

  // Categories are represented by the category field on Skill records.
  // Include defaults plus categories already present in the database.
  const [coreCategories, setCoreCategories] = useState<string[]>(() =>
    Array.from(new Set([
      ...defaultCoreCategories,
      ...initialSkills.filter((s) => s.level === 1).map((s) => s.category).filter(Boolean),
    ]))
  );
  const [toolCategories, setToolCategories] = useState<string[]>(() =>
    Array.from(new Set([
      ...defaultToolCategories,
      ...initialSkills.filter((s) => s.level === 2).map((s) => s.category).filter(Boolean),
    ]))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryOld, setEditingCategoryOld] = useState<string | null>(null);
  const [editingCategoryNew, setEditingCategoryNew] = useState("");
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [savingCategoryImage, setSavingCategoryImage] = useState<string | null>(null);

  const getCategoryImageKey = (cat: string, tab: "CORE" | "TOOL") => `${tab}:${cat}`;

  useEffect(() => {
    let active = true;
    getSkillCategoryImagesAction().then((result) => {
      if (active && result.success) setCategoryImages(result.images || {});
    }).catch(() => {
      // Keep the manager usable if category image settings cannot be loaded.
    });
    return () => { active = false; };
  }, []);

  const handleCategoryImageChange = async (cat: string, tab: "CORE" | "TOOL", imageUrl: string) => {
    const key = getCategoryImageKey(cat, tab);
    const previous = categoryImages[key] || "";
    setCategoryImages((current) => {
      const next = { ...current };
      if (imageUrl) next[key] = imageUrl;
      else delete next[key];
      return next;
    });
    setSavingCategoryImage(key);
    try {
      const result = await saveSkillCategoryImageAction(cat, tab, imageUrl);
      if (!result.success) {
        setCategoryImages((current) => {
          const next = { ...current };
          if (previous) next[key] = previous;
          else delete next[key];
          return next;
        });
        alert(result.error || "Could not save category image.");
      } else {
        setCategoryImages(result.images || {});
      }
    } catch {
      setCategoryImages((current) => {
        const next = { ...current };
        if (previous) next[key] = previous;
        else delete next[key];
        return next;
      });
      alert("Could not save category image. Please try again.");
    } finally {
      setSavingCategoryImage(null);
    }
  };

  const [name, setName] = useState("");
  const [category, setCategory] = useState(coreCategories[0]);
  const [type, setType] = useState<"CORE" | "TOOL">("CORE");
  const [sortOrder, setSortOrder] = useState("0");
  const [showOnSite, setShowOnSite] = useState(true);
  const [rootIcon, setRootIcon] = useState("Code2");
  const [categoryIcon, setCategoryIcon] = useState("Network");
  const [percentage, setPercentage] = useState("85");

  const openCreateModal = (targetType: "CORE" | "TOOL") => {
    setEditingSkill(null);
    setName("");
    setType(targetType);
    setSelectedTab(targetType);
    setCategory((targetType === "CORE" ? coreCategories[0] : toolCategories[0]) || "");
    setSortOrder("0");
    setShowOnSite(true);
    setRootIcon(targetType === "CORE" ? "Code2" : "Layers");
    setCategoryIcon("Network");
    setPercentage("85");
    setIsModalOpen(true);
  };

  const openEditModal = (skill: any) => {
    setEditingSkill(skill);
    setName(skill.name || "");
    // Hidden records use level 0. Infer their section from the category
    // when that category is known to belong to the Tools & Tech Stack.
    const isTool =
      skill.level === 2 ||
      (skill.level === 0 &&
        toolCategories.includes(skill.category || "") &&
        !coreCategories.includes(skill.category || ""));
    setType(isTool ? "TOOL" : "CORE");
    setSelectedTab(isTool ? "TOOL" : "CORE");
    setCategory(skill.category || (isTool ? toolCategories[0] : coreCategories[0]) || "");
    setSortOrder(String(skill.sortOrder || 0));
    setShowOnSite(skill.level !== 0);
    setRootIcon(skill.rootIcon || (isTool ? "Layers" : "Code2"));
    setCategoryIcon(skill.categoryIcon || "Network");
    setPercentage(String(skill.percentage ?? 85));
    setIsModalOpen(true);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const current = selectedTab === "CORE" ? coreCategories : toolCategories;
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("This category already exists.");
      return;
    }

    if (selectedTab === "CORE") {
      setCoreCategories((prev) => [...prev, trimmed]);
    } else {
      setToolCategories((prev) => [...prev, trimmed]);
    }
    setNewCategoryName("");
  };

  const handleUpdateCategory = async (oldName: string) => {
    const trimmed = editingCategoryNew.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategoryOld(null);
      setEditingCategoryNew("");
      return;
    }

    const currentCategories = selectedTab === "CORE" ? coreCategories : toolCategories;
    if (currentCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("A category with this name already exists.");
      return;
    }

    try {
      const result = await renameSkillCategoryAction(oldName, trimmed, selectedTab);
      if (!result.success) {
        alert(result.error || "Could not rename category.");
        return;
      }

      setSkills((prev) =>
        prev.map((skill) =>
          skill.category === oldName &&
          (selectedTab === "CORE" ? skill.level === 1 : skill.level === 2)
            ? { ...skill, category: trimmed }
            : skill
        )
      );

      setCategoryImages((current) => {
        const next = { ...current };
        const oldKey = getCategoryImageKey(oldName, selectedTab);
        const newKey = getCategoryImageKey(trimmed, selectedTab);
        if (next[oldKey]) {
          next[newKey] = next[oldKey];
          delete next[oldKey];
        }
        return next;
      });

      if (selectedTab === "CORE") {
        setCoreCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
      } else {
        setToolCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
      }

      setEditingCategoryOld(null);
      setEditingCategoryNew("");
    } catch {
      alert("Could not rename category. Please try again.");
    }
  };

  const handleDeleteCategory = (catName: string) => {
    const usedBySkills = skills.some(
      (skill) =>
        skill.category === catName &&
        (selectedTab === "CORE" ? skill.level === 1 : skill.level === 2)
    );

    if (usedBySkills) {
      alert("This category still contains skills. Move or delete those skills before removing the category.");
      return;
    }

    if (!confirm(`Remove category "${catName}"?`)) return;

    if (selectedTab === "CORE") {
      setCoreCategories((prev) => prev.filter((c) => c !== catName));
    } else {
      setToolCategories((prev) => prev.filter((c) => c !== catName));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (editingSkill?.id) formData.append("id", editingSkill.id);
      formData.append("name", name);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("sortOrder", sortOrder);
      formData.append("showOnSite", String(showOnSite));
      formData.append("rootIcon", rootIcon);
      formData.append("categoryIcon", categoryIcon);
      formData.append("percentage", percentage);

      const res = await saveSkillAction(formData);
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

  const handleDelete = async (id: string, skillName: string) => {
    if (!confirm(`Delete "${skillName}"?`)) return;
    try {
      const res = await deleteSkillAction(id);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert("Could not delete record.");
    }
  };

  const activeCategoriesList = selectedTab === "CORE" ? coreCategories : toolCategories;

  const filteredSkills = skills.filter((s) => {
    const isToolItem = s.level === 2;
    const isHiddenCore =
      s.level === 0 &&
      coreCategories.includes(s.category || "") &&
      !toolCategories.includes(s.category || "");
    const isHiddenTool =
      s.level === 0 &&
      toolCategories.includes(s.category || "") &&
      !coreCategories.includes(s.category || "");
    const matchesTab =
      selectedTab === "TOOL"
        ? isToolItem || isHiddenTool
        : s.level === 1 || isHiddenCore;
    const matchesSearch =
      (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 w-full font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-purple-500/20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Wrench className="w-6 h-6 text-cyan-400" />
            <span>Tree Skills &amp; Stack CMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage Technical Skills and Tool &amp; Tech Stack separately.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold border border-purple-500/20 transition-all"
          >
            <FolderPlus className="w-4 h-4 text-cyan-400" />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={() => openCreateModal("CORE")}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#00E5FF] text-black text-xs font-bold shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technical Skill</span>
          </button>
          <button
            onClick={() => openCreateModal("TOOL")}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#B84DFF] text-white text-xs font-bold shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool &amp; Stack</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedTab("CORE")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedTab === "CORE" ? "bg-[#00E5FF] text-black shadow-md font-bold" : "bg-[#141444] text-slate-400 hover:text-white"
              }`}
          >
            Technical Skills
          </button>
          <button
            onClick={() => setSelectedTab("TOOL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedTab === "TOOL" ? "bg-[#B84DFF] text-white shadow-md font-bold" : "bg-[#141444] text-slate-400 hover:text-white"
              }`}
          >
            Tool &amp; Tech Stack
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141444]/60 border border-purple-500/20 text-white text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full p-12 rounded-3xl text-center border border-purple-500/20 bg-[#141444]/40">
            <Layers className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-40" />
            <p className="text-xs text-slate-400">No records found.</p>
          </div>
        ) : (
          filteredSkills.map((skill) => {
            const isVisible = skill.level !== 0;

            return (
              <div
                key={skill.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 bg-[#141444]/60 backdrop-blur-md transition-all ${isVisible ? "border-purple-500/20" : "border-red-500/30 opacity-60 bg-red-500/5"
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Tag className="w-2.5 h-2.5 mr-1" />
                      {skill.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center space-x-1 ${isVisible
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                    >
                      {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isVisible ? "Visible" : "Hidden"}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm sm:text-base font-mono">{skill.name}</h3>
                  <p className="mt-1 text-[10px] text-slate-400 font-mono">Icon: {skill.categoryIcon || "Network"} · {skill.percentage ?? 85}%</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-purple-500/20 text-[11px] text-slate-400">
                  <span className="font-mono">Priority: {skill.sortOrder || 0}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(skill)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 bg-[#0b0f19] transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id, skill.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 bg-[#0b0f19] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#141444] border border-purple-500/30 space-y-5">
            <div className="flex justify-between pb-3 border-b border-purple-500/20">
              <h2 className="text-base font-bold text-white">Manage Categories ({selectedTab})</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
              {activeCategoriesList.map((cat) => (
                <div key={cat} className="flex flex-col gap-3 p-3 rounded-xl bg-[#0b0f19] border border-purple-500/20">
                  <div className="flex items-center justify-between gap-2">
                    {editingCategoryOld === cat ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingCategoryNew}
                          onChange={(e) => setEditingCategoryNew(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs rounded bg-[#141444] border border-cyan-400 text-white"
                          autoFocus
                        />
                        <button type="button" onClick={() => handleUpdateCategory(cat)} className="px-2 py-1 text-xs rounded bg-cyan-600 text-white font-bold">Save</button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-slate-200 font-medium">{cat}</span>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => { setEditingCategoryOld(cat); setEditingCategoryNew(cat); }} className="p-1 rounded text-slate-400 hover:text-cyan-400" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteCategory(cat)} className="p-1 rounded text-slate-400 hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-t border-purple-500/15 pt-2">
                    <FileUploadInput
                      label="Category Image (Media Library)"
                      name={`category-image-${selectedTab}-${cat}`}
                      value={categoryImages[getCategoryImageKey(cat, selectedTab)] || ""}
                      onChange={(url) => handleCategoryImageChange(cat, selectedTab, url)}
                      placeholder="Choose an image from Media Library"
                      accept="image/*"
                      helpText={savingCategoryImage === getCategoryImageKey(cat, selectedTab) ? "Saving category image..." : "Select, change or clear the image used in this category node."}
                    />
                    {categoryImages[getCategoryImageKey(cat, selectedTab)] && (
                      <button type="button" onClick={() => handleCategoryImageChange(cat, selectedTab, "")} className="mt-2 text-[10px] font-semibold text-red-400 hover:text-red-300">Remove category image</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-purple-500/20 flex justify-end">
              <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-100 text-slate-300 text-xs font-semibold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Skill Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#141444] border border-purple-500/30 space-y-5">
            <div className="flex justify-between pb-3 border-b border-purple-500/20">
              <h2 className="text-base font-bold text-white">{editingSkill ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section Type</label>
                <select
                  value={type}
                  onChange={(e) => {
                    const t = e.target.value as "CORE" | "TOOL";
                    setType(t);
                    setSelectedTab(t);
                    setCategory((t === "CORE" ? coreCategories[0] : toolCategories[0]) || "");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs cursor-pointer"
                >
                  <option value="CORE">Technical Skills</option>
                  <option value="TOOL">Tool &amp; Tech Stack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs cursor-pointer"
                >
                  {Array.from(new Set([
                    ...(type === "CORE" ? coreCategories : toolCategories),
                    ...(category ? [category] : []),
                  ])).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Next.js or Docker"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Root Logo (Lucide Icon)</label>
                  <input
                    type="text"
                    value={rootIcon}
                    onChange={(e) => setRootIcon(e.target.value)}
                    placeholder="Code2 / Layers / ShieldCheck"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category Logo (Lucide Icon)</label>
                  <input
                    type="text"
                    value={categoryIcon}
                    onChange={(e) => setCategoryIcon(e.target.value)}
                    placeholder="Network / Server / Shield"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Percentage (0–100)</label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-purple-500/30 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Visibility</label>
                  <button
                    type="button"
                    onClick={() => setShowOnSite(!showOnSite)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${showOnSite ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                  >
                    {showOnSite ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showOnSite ? "Visible" : "Hidden"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0b0f19] text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}