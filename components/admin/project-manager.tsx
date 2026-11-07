"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Loader2,
  ExternalLink,
  Github,
  Tag,
  Search,
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
import {
  saveProjectAction,
  deleteProjectAction,
  getProjectCategoriesAction,
  saveProjectCategoryAction,
  deleteProjectCategoryAction,
  getProjectTypesAction,
  saveProjectTypeAction,
  deleteProjectTypeAction,
  getProjectEnvironmentsAction,
  saveProjectEnvironmentAction,
  deleteProjectEnvironmentAction,
} from "@/actions/project-admin-actions";
import { FileUploadInput } from "@/components/admin/file-upload-input";

export const CATEGORY_OPTIONS = [
  { id: "network-infra", label: "Network Infrastructure", icon: Network },
  { id: "systems-virtualization", label: "Systems & Virtualization", icon: Server },
  { id: "telephony-voip", label: "VoIP & Telephony", icon: Globe },
  { id: "network-security", label: "Perimeter Defense & Security", icon: ShieldCheck },
  { id: "soc-hardening", label: "SOC Telemetry & Hardening", icon: Cpu },
  { id: "devops-automation", label: "DevOps & Infrastructure as Code", icon: Terminal },
];

const DEFAULT_PROJECT_TYPES = [
  { id: "LAB", label: "Lab" },
  { id: "PERSONAL", label: "Personal" },
  { id: "CLIENT", label: "Client" },
  { id: "PRODUCTION", label: "Production" },
];

const DEFAULT_PROJECT_ENVIRONMENTS = [
  { id: "PHYSICAL", label: "Physical" },
  { id: "VIRTUAL", label: "Virtual" },
  { id: "CLOUD", label: "Cloud" },
  { id: "HYBRID", label: "Hybrid" },
];

const DEMO_PROJECT = {
  id: "__demo_project__",
  title: "Secure Enterprise Branch Network & Hybrid Infrastructure",
  slug: "secure-enterprise-branch-network",
  category: "network-security",
  summary: "Demo blueprint showing VLAN segmentation, dual-WAN failover, site-to-site VPN, centralized monitoring and hardened access controls.",
  stack: ["MikroTik RouterOS", "VLAN", "WireGuard", "Zabbix", "Ubuntu Server"],
  featured: true,
  status: "PUBLISHED",
  projectType: "LAB",
  projectEnvironment: "HYBRID",
  fullDescription: "A portfolio-ready demonstration project for a secure branch network connected to virtualized services and cloud resources.",
  objective: "Build a resilient and segmented network with secure remote connectivity and centralized visibility.",
  roleResponsibilities: "Designed topology, VLANs, firewall policy, VPN, monitoring and documentation.",
  osPlatform: "MikroTik RouterOS, Ubuntu Server",
  protocolsServices: "802.1Q VLAN, DHCP, DNS, WireGuard, SNMP, Syslog",
  keyFeatures: "Department VLANs, guest isolation, dual-WAN failover, VPN, monitoring and logging.",
  implementationSteps: "Planned addressing; created VLANs; configured routing/firewall; deployed VPN; enabled monitoring; validated failover.",
  securityMeasures: "Default-deny inter-VLAN policy, management ACLs, VPN encryption and hardened administrative access.",
  monitoringLogging: "Zabbix monitoring with centralized Syslog.",
  backupRecovery: "Scheduled configuration exports and documented restore procedure.",
  startDate: "2026-10-01",
  completionDate: "2026-10-20",
  lessonsLearned: "Validate segmentation and failover with repeatable test cases before production rollout.",
  caseStudy: {
    problem: "Flat network design and a single WAN created security and availability risks.",
    solution: "Segmented VLAN architecture with firewall policy, encrypted VPN, dual-WAN failover and monitoring.",
    outcome: "A documented lab blueprint with isolated traffic zones, tested failover and centralized visibility."
  },
  __demo: true,
};

interface ProjectsManagerProps {
  initialProjects: any[];
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<any[]>(initialProjects.length ? initialProjects : [DEMO_PROJECT]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    CATEGORY_OPTIONS.map(({ id, label }) => ({ id, label }))
  );
  const [projectTypes, setProjectTypes] = useState<{ id: string; label: string }[]>(DEFAULT_PROJECT_TYPES);
  const [projectEnvironments, setProjectEnvironments] = useState<{ id: string; label: string }[]>(DEFAULT_PROJECT_ENVIRONMENTS);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);
  const [typeLabel, setTypeLabel] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [environmentLabel, setEnvironmentLabel] = useState("");
  const [editingEnvironmentId, setEditingEnvironmentId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getProjectCategoriesAction().then((result) => {
      if (active && result.success) setCategories(result.categories);
    }).catch(() => {
      // Keep the built-in defaults available if loading fails.
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      getProjectTypesAction(),
      getProjectEnvironmentsAction(),
    ])
      .then(([typeResult, environmentResult]) => {
        if (!active) return;

        if (typeResult.success) {
          setProjectTypes(typeResult.projectTypes);
          setProjectType((current) => current || typeResult.projectTypes[0]?.id || "");
        }

        if (environmentResult.success) {
          setProjectEnvironments(environmentResult.projectEnvironments);
          setProjectEnvironment(
            (current) => current || environmentResult.projectEnvironments[0]?.id || ""
          );
        }
      })
      .catch(() => {
        // Keep built-in defaults if the database request fails.
      });

    return () => {
      active = false;
    };
  }, []);

  const saveProjectType = async () => {
    const label = typeLabel.trim();
    if (!label) return;

    try {
      const result = await saveProjectTypeAction({
        ...(editingTypeId ? { id: editingTypeId } : {}),
        label,
      });

      if (!result.success) {
        alert(result.error || "Could not save project type.");
        return;
      }

      setProjectTypes(result.projectTypes);
      setTypeLabel("");
      setEditingTypeId(null);

      if (!projectType) {
        setProjectType(result.projectTypes[0]?.id || "");
      }
    } catch (error: any) {
      alert(error?.message || "Could not save project type.");
    }
  };

  const deleteProjectType = async (id: string) => {
    if (!confirm("Delete this project type? Types assigned to projects cannot be deleted.")) return;

    try {
      const result = await deleteProjectTypeAction(id);

      if (!result.success) {
        alert(result.error || "Could not delete project type.");
        return;
      }

      setProjectTypes(result.projectTypes);
      if (projectType === id) setProjectType(result.projectTypes[0]?.id || "");
      if (editingTypeId === id) {
        setEditingTypeId(null);
        setTypeLabel("");
      }
    } catch (error: any) {
      alert(error?.message || "Could not delete project type.");
    }
  };

  const saveProjectEnvironment = async () => {
    const label = environmentLabel.trim();
    if (!label) return;

    try {
      const result = await saveProjectEnvironmentAction({
        ...(editingEnvironmentId ? { id: editingEnvironmentId } : {}),
        label,
      });

      if (!result.success) {
        alert(result.error || "Could not save project environment.");
        return;
      }

      setProjectEnvironments(result.projectEnvironments);
      setEnvironmentLabel("");
      setEditingEnvironmentId(null);

      if (!projectEnvironment) {
        setProjectEnvironment(result.projectEnvironments[0]?.id || "");
      }
    } catch (error: any) {
      alert(error?.message || "Could not save project environment.");
    }
  };

  const deleteProjectEnvironment = async (id: string) => {
    if (!confirm("Delete this project environment? Environments assigned to projects cannot be deleted.")) return;

    try {
      const result = await deleteProjectEnvironmentAction(id);

      if (!result.success) {
        alert(result.error || "Could not delete project environment.");
        return;
      }

      setProjectEnvironments(result.projectEnvironments);
      if (projectEnvironment === id) {
        setProjectEnvironment(result.projectEnvironments[0]?.id || "");
      }
      if (editingEnvironmentId === id) {
        setEditingEnvironmentId(null);
        setEnvironmentLabel("");
      }
    } catch (error: any) {
      alert(error?.message || "Could not delete project environment.");
    }
  };

  const refreshCategories = async () => {
    setIsCategoryLoading(true);
    try {
      const result = await getProjectCategoriesAction();
      if (result.success) setCategories(result.categories);
      else alert(result.error || "Could not load categories.");
    } catch (error: any) {
      alert(error?.message || "Could not load categories.");
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const startEditCategory = (item: { id: string; label: string }) => {
    setEditingCategoryId(item.id);
    setCategoryLabel(item.label);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryLabel("");
  };

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryLabel.trim()) return;
    setIsCategorySaving(true);
    try {
      const result = await saveProjectCategoryAction({
        ...(editingCategoryId ? { id: editingCategoryId } : {}),
        label: categoryLabel.trim(),
      });
      if (!result.success) {
        alert(result.error || "Could not save category.");
        return;
      }
      setCategories(result.categories);
      resetCategoryForm();
    } catch (error: any) {
      alert(error?.message || "Could not save category.");
    } finally {
      setIsCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (item: { id: string; label: string }) => {
    if (!confirm(`Delete category "${item.label}"? Categories assigned to projects cannot be deleted.`)) return;
    try {
      const result = await deleteProjectCategoryAction(item.id);
      if (!result.success) {
        alert(result.error || "Could not delete category.");
        return;
      }
      setCategories(result.categories);
      if (selectedFilterCategory === item.id) setSelectedFilterCategory("all");
      if (category === item.id) setCategory(result.categories[0]?.id || "");
      if (editingCategoryId === item.id) resetCategoryForm();
    } catch (error: any) {
      alert(error?.message || "Could not delete category.");
    }
  };

  // Modal & Loading States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("network-infra");
  const [summary, setSummary] = useState("");
  const [stackInput, setStackInput] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("PUBLISHED");
  const [fullDescription, setFullDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [roleResponsibilities, setRoleResponsibilities] = useState("");
  const [projectEnvironment, setProjectEnvironment] = useState("");
  const [osPlatform, setOsPlatform] = useState("");
  const [protocolsServices, setProtocolsServices] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [implementationSteps, setImplementationSteps] = useState("");
  const [securityMeasures, setSecurityMeasures] = useState("");
  const [monitoringLogging, setMonitoringLogging] = useState("");
  const [backupRecovery, setBackupRecovery] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");
  const [diagramUrl, setDiagramUrl] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [projectType, setProjectType] = useState("LAB");
  const [startDate, setStartDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoMetaDescription, setSeoMetaDescription] = useState("");

  // Case Study Triad States
  const [hasCaseStudy, setHasCaseStudy] = useState(false);
  const [caseStudyProblem, setCaseStudyProblem] = useState("");
  const [caseStudySolution, setCaseStudySolution] = useState("");
  const [caseStudyOutcome, setCaseStudyOutcome] = useState("");

  const resetForm = () => {
    setEditingProject(null);
    setTitle("");
    setSlug("");
    setCategory("network-infra");
    setSummary("");
    setStackInput("");
    setCoverUrl("");
    setLiveUrl("");
    setRepoUrl("");
    setFeatured(false);
    setStatus("PUBLISHED");
    setFullDescription("");
    setObjective("");
    setRoleResponsibilities("");
    setProjectEnvironment(projectEnvironments[0]?.id || "HYBRID");
    setOsPlatform("");
    setProtocolsServices("");
    setKeyFeatures("");
    setImplementationSteps("");
    setSecurityMeasures("");
    setMonitoringLogging("");
    setBackupRecovery("");
    setGalleryUrls("");
    setDiagramUrl("");
    setDocumentationUrl("");
    setProjectType(projectTypes[0]?.id || "LAB");
    setStartDate("");
    setCompletionDate("");
    setLessonsLearned("");
    setSeoTitle("");
    setSeoMetaDescription("");
    setHasCaseStudy(false);
    setCaseStudyProblem("");
    setCaseStudySolution("");
    setCaseStudyOutcome("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (project: any) => {
    setEditingProject(project.__demo ? null : project);
    setTitle(project.title || "");
    setSlug(project.slug || "");

    // Auto-detect assigned category
    const foundCat =
      project.category ||
      (project.attachments && typeof project.attachments === "object"
        ? (project.attachments as any).category
        : "network-infra");
    setCategory(foundCat || "network-infra");

    setSummary(project.summary || "");
    setStackInput(Array.isArray(project.stack) ? project.stack.join(", ") : "");
    setCoverUrl(project.coverUrl || "");
    setLiveUrl(project.liveUrl || "");
    setRepoUrl(project.repoUrl || "");
    setFeatured(Boolean(project.featured));
    setStatus(project.status || "PUBLISHED");
    const attachments =
      project.attachments &&
        typeof project.attachments === "object" &&
        !Array.isArray(project.attachments)
        ? (project.attachments as Record<string, any>)
        : {};

    setFullDescription(project.content || project.fullDescription || "");
    setObjective(attachments.objective || project.objective || "");
    setRoleResponsibilities(attachments.roleResponsibilities || project.roleResponsibilities || "");
    setProjectEnvironment(
      attachments.projectEnvironment ||
      project.projectEnvironment ||
      projectEnvironments[0]?.id ||
      ""
    );
    setOsPlatform(attachments.osPlatform || project.osPlatform || "");
    setProtocolsServices(attachments.protocolsServices || project.protocolsServices || "");
    setKeyFeatures(attachments.keyFeatures || project.keyFeatures || "");
    setImplementationSteps(attachments.implementationSteps || project.implementationSteps || "");
    setSecurityMeasures(attachments.securityMeasures || project.securityMeasures || "");
    setMonitoringLogging(attachments.monitoringLogging || project.monitoringLogging || "");
    setBackupRecovery(attachments.backupRecovery || project.backupRecovery || "");

    const savedGallery =
      attachments.galleryUrls ||
      attachments.gallery ||
      project.galleryUrls ||
      [];
    setGalleryUrls(
      Array.isArray(savedGallery) ? savedGallery.join("\n") : String(savedGallery || "")
    );

    setDiagramUrl(
      attachments.diagramUrl ||
      attachments.architectureDiagram ||
      project.diagramUrl ||
      ""
    );
    setDocumentationUrl(attachments.documentationUrl || project.documentationUrl || "");
    setProjectType(
      attachments.projectType ||
      project.projectType ||
      projectTypes[0]?.id ||
      "LAB"
    );
    setStartDate(
      attachments.startDate
        ? String(attachments.startDate).slice(0, 10)
        : project.startDate
          ? String(project.startDate).slice(0, 10)
          : ""
    );
    setCompletionDate(
      attachments.completionDate
        ? String(attachments.completionDate).slice(0, 10)
        : project.completionDate
          ? String(project.completionDate).slice(0, 10)
          : ""
    );
    setLessonsLearned(attachments.lessonsLearned || project.lessonsLearned || "");
    setSeoTitle(project.seoTitle || "");
    setSeoMetaDescription(project.seoDescription || project.seoMetaDescription || "");

    if (project.caseStudy) {
      setHasCaseStudy(true);
      setCaseStudyProblem(project.caseStudy.problem || "");
      setCaseStudySolution(project.caseStudy.solution || "");
      setCaseStudyOutcome(project.caseStudy.outcome || "");
    } else {
      setHasCaseStudy(false);
      setCaseStudyProblem("");
      setCaseStudySolution("");
      setCaseStudyOutcome("");
    }
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingProject) {
      // Auto generate slug
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (editingProject?.id) {
        formData.append("id", editingProject.id);
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
      formData.append("fullDescription", fullDescription);
      formData.append("objective", objective);
      formData.append("roleResponsibilities", roleResponsibilities);
      formData.append("projectEnvironment", projectEnvironment);
      formData.append("osPlatform", osPlatform);
      formData.append("protocolsServices", protocolsServices);
      formData.append("keyFeatures", keyFeatures);
      formData.append("implementationSteps", implementationSteps);
      formData.append("securityMeasures", securityMeasures);
      formData.append("monitoringLogging", monitoringLogging);
      formData.append("backupRecovery", backupRecovery);
      formData.append("galleryUrls", galleryUrls);
      formData.append("diagramUrl", diagramUrl);
      formData.append("documentationUrl", documentationUrl);
      formData.append("projectType", projectType);
      formData.append("startDate", startDate);
      formData.append("completionDate", completionDate);
      formData.append("lessonsLearned", lessonsLearned);
      formData.append("seoTitle", seoTitle);
      formData.append("seoMetaDescription", seoMetaDescription);

      formData.append("hasCaseStudy", String(hasCaseStudy));
      if (hasCaseStudy) {
        formData.append("caseStudyProblem", caseStudyProblem);
        formData.append("caseStudySolution", caseStudySolution);
        formData.append("caseStudyOutcome", caseStudyOutcome);
      }

      const res = await saveProjectAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        alert(res.error || "Failed to save project.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, projectTitle: string) => {
    if (id === "__demo_project__") { setProjects((prev) => prev.filter((p) => p.id !== id)); return; }
    if (!confirm(`Are you sure you want to permanently delete "${projectTitle}"?`)) return;

    try {
      const res = await deleteProjectAction(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error || "Failed to delete project.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete project.");
    }
  };

  // Search & Category Filtering for Admin Dashboard List
  const filteredProjects = projects.filter((p) => {
    const pCat =
      p.category ||
      (p.attachments && typeof p.attachments === "object"
        ? (p.attachments as any).category
        : "");
    const matchesCategory =
      selectedFilterCategory === "all" || pCat === selectedFilterCategory;
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.summary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.slug || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-sky-400" />
            <span>Projects &amp; Architecture Blueprints Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish, edit categories, configure case study triads, and manage live credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { resetCategoryForm(); setIsCategoryModalOpen(true); void refreshCategories(); }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-slate-200 text-xs font-semibold transition-all"
          >
            <Tag className="w-4 h-4" />
            <span>Manage Categories</span>
          </button>
          <button type="button" onClick={() => setIsTypeModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-slate-200 text-xs font-semibold transition-all"><Tag className="w-4 h-4" /><span>Project Types</span></button>
          <button type="button" onClick={() => setIsEnvironmentModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-slate-200 text-xs font-semibold transition-all"><Globe className="w-4 h-4" /><span>Environments</span></button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Architecture Build</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blueprints by title, summary, or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedFilterCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedFilterCategory === "all"
              ? "bg-primary text-background font-bold"
              : "bg-surface-50 text-slate-400 hover:text-white"
              }`}
          >
            All Tracks ({projects.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedFilterCategory === cat.id
                ? "bg-primary text-background font-bold"
                : "bg-surface-50 text-slate-400 hover:text-white"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full glass-panel p-12 rounded-3xl text-center border border-border-subtle">
            <Layers className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400">No projects found matching your query.</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const pCat =
              project.category ||
              (project.attachments && typeof project.attachments === "object"
                ? (project.attachments as any).category
                : "network-infra");
            const catObj = categories.find((c) => c.id === pCat);
            const pAttachments =
              project.attachments &&
                typeof project.attachments === "object" &&
                !Array.isArray(project.attachments)
                ? (project.attachments as Record<string, any>)
                : {};
            const pType = pAttachments.projectType || project.projectType || "";
            const pEnvironment =
              pAttachments.projectEnvironment || project.projectEnvironment || "";

            return (
              <div
                key={project.id}
                className="glass-panel p-5 rounded-3xl border border-border-subtle hover:border-slate-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <Tag className="w-2.5 h-2.5 mr-1" />
                        {catObj ? catObj.label : pCat}
                      </span>
                      {project.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          Featured
                        </span>
                      )}
                      {project.__demo && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">Demo</span>}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(project)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-surface-100 transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id, project.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base mt-3 leading-snug line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.summary}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.stack?.slice(0, 4).map((tech: string) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-slate-300 border border-border-subtle"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.stack?.length > 4 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-500">
                        +{project.stack.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-2">
                    {project.caseStudy && (
                      <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Case Study Ready</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {pType && <span>{projectTypes.find((x) => x.id === pType)?.label || pType}</span>}
                    {pType && pEnvironment && <span>•</span>}
                    {pEnvironment && <span>{projectEnvironments.find((x) => x.id === pEnvironment)?.label || pEnvironment}</span>}
                    <span className="font-mono">{project.status}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-7 rounded-3xl border border-border-subtle shadow-card space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-sky-400" /> Category Management
                </h2>
                <p className="text-xs text-slate-400 mt-1">Add, rename, and delete project categories. Category IDs remain stable when renaming.</p>
              </div>
              <button type="button" onClick={() => { setIsCategoryModalOpen(false); resetCategoryForm(); }} className="text-slate-400 hover:text-white" aria-label="Close category manager">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="project-category-name">Category name</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="project-category-name"
                  type="text"
                  required
                  maxLength={80}
                  value={categoryLabel}
                  onChange={(event) => setCategoryLabel(event.target.value)}
                  placeholder="e.g. Cloud & Platform Engineering"
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
                <button type="submit" disabled={isCategorySaving || !categoryLabel.trim()} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold disabled:opacity-50">
                  {isCategorySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingCategoryId ? "Update" : "Add Category"}</span>
                </button>
                {editingCategoryId && (
                  <button type="button" onClick={resetCategoryForm} className="px-3 py-2.5 rounded-xl bg-surface-100 text-slate-300 text-xs font-semibold">Cancel</button>
                )}
              </div>
            </form>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved categories ({categories.length})</h3>
                {isCategoryLoading && <Loader2 className="w-4 h-4 animate-spin text-sky-400" />}
              </div>
              {categories.length === 0 ? (
                <p className="text-xs text-slate-500 rounded-xl border border-border-subtle p-4">No categories yet. Add one above.</p>
              ) : categories.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-50 border border-border-subtle">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.label}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{item.id}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => startEditCategory(item)} className="p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-surface-100" title={`Edit ${item.label}`} aria-label={`Edit ${item.label}`}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => void handleDeleteCategory(item)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10" title={`Delete ${item.label}`} aria-label={`Delete ${item.label}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border-subtle flex justify-end">
              <button type="button" onClick={() => { setIsCategoryModalOpen(false); resetCategoryForm(); }} className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Project Type Management */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-border-subtle shadow-card space-y-4">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Project Type Management</h2><p className="text-xs text-slate-400 mt-1">Add, edit or delete the values used by the Project Type field.</p></div><button type="button" onClick={() => setIsTypeModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="flex gap-2"><input value={typeLabel} onChange={(e) => setTypeLabel(e.target.value)} placeholder="e.g. Client Deployment" className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /><button type="button" onClick={saveProjectType} className="px-4 py-2.5 rounded-xl bg-primary text-background text-xs font-bold">{editingTypeId ? "Update" : "Add"}</button></div>
            <div className="space-y-2 max-h-72 overflow-y-auto">{projectTypes.map((item) => <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-border-subtle"><div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-[10px] font-mono text-slate-500">{item.id}</p></div><div className="flex gap-1"><button type="button" onClick={() => { setEditingTypeId(item.id); setTypeLabel(item.label); }} className="p-2 text-sky-400"><Edit3 className="w-4 h-4" /></button><button type="button" onClick={() => deleteProjectType(item.id)} className="p-2 text-red-400"><Trash2 className="w-4 h-4" /></button></div></div>)}</div>
          </div>
        </div>
      )}

      {/* Project Environment Management */}
      {isEnvironmentModalOpen && (
        <div className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-border-subtle shadow-card space-y-4">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Project Environment Management</h2><p className="text-xs text-slate-400 mt-1">Add, edit or delete the values used by the Project Environment field.</p></div><button type="button" onClick={() => setIsEnvironmentModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="flex gap-2"><input value={environmentLabel} onChange={(e) => setEnvironmentLabel(e.target.value)} placeholder="e.g. On-Prem + Cloud" className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /><button type="button" onClick={saveProjectEnvironment} className="px-4 py-2.5 rounded-xl bg-primary text-background text-xs font-bold">{editingEnvironmentId ? "Update" : "Add"}</button></div>
            <div className="space-y-2 max-h-72 overflow-y-auto">{projectEnvironments.map((item) => <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-border-subtle"><div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-[10px] font-mono text-slate-500">{item.id}</p></div><div className="flex gap-1"><button type="button" onClick={() => { setEditingEnvironmentId(item.id); setEnvironmentLabel(item.label); }} className="p-2 text-sky-400"><Edit3 className="w-4 h-4" /></button><button type="button" onClick={() => deleteProjectEnvironment(item.id)} className="p-2 text-red-400"><Trash2 className="w-4 h-4" /></button></div></div>)}</div>
          </div>
        </div>
      )}

      {/* Full Customizable Form Modal (AtoZ) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-card space-y-6 animate-in fade-in zoom-in-95 overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <span>{editingProject ? "Edit Blueprint Specifications" : "Create New Architecture Blueprint"}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly customize all schema parameters without modifying code files.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Basic Meta */}
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

              {/* Summary Description */}
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

              {/* Tech Stack Pills Input */}
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

              {/* Extended Project Details */}
              <div className="pt-4 border-t border-border-subtle space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Full Project Details</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Detailed technical information for Network, System and Security projects.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">Full Project Description</label><textarea rows={5} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} placeholder="Complete project background, scope and architecture..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">Project Objective / Goal</label><textarea rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What was this project designed to achieve?" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">My Role & Responsibilities</label><textarea rows={3} value={roleResponsibilities} onChange={(e) => setRoleResponsibilities(e.target.value)} placeholder="Your responsibilities, ownership and contributions..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary" /></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">Project Environment</label><select value={projectEnvironment} onChange={(e) => setProjectEnvironment(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs"><option value="">Select environment</option>{projectEnvironments.map((item) => <option key={item.id} value={item.id} className="bg-[#0b0f19]">{item.label}</option>)}</select></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">Project Type</label><select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs">{projectTypes.map((item) => <option key={item.id} value={item.id} className="bg-[#0b0f19]">{item.label}</option>)}</select></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">OS / Platform</label><input value={osPlatform} onChange={(e) => setOsPlatform(e.target.value)} placeholder="Ubuntu, Windows Server, RouterOS, ESXi..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">Protocols & Services</label><input value={protocolsServices} onChange={(e) => setProtocolsServices(e.target.value)} placeholder="BGP, OSPF, VLAN, DNS, DHCP, VPN..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">Key Features / Implementations</label><textarea rows={3} value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)} placeholder="Major features and configurations..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">Implementation Steps</label><textarea rows={5} value={implementationSteps} onChange={(e) => setImplementationSteps(e.target.value)} placeholder="Step-by-step implementation and configuration..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">Security Measures</label><textarea rows={3} value={securityMeasures} onChange={(e) => setSecurityMeasures(e.target.value)} placeholder="Firewall, ACL, MFA, hardening, encryption..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">Monitoring & Logging</label><textarea rows={3} value={monitoringLogging} onChange={(e) => setMonitoringLogging(e.target.value)} placeholder="Zabbix, Grafana, Syslog, SIEM..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">Backup & Recovery</label><textarea rows={3} value={backupRecovery} onChange={(e) => setBackupRecovery(e.target.value)} placeholder="Backup, restore and DR strategy..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div><label className="block text-xs font-semibold text-slate-300 mb-1">Completion Date</label><input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">Lessons Learned</label><textarea rows={3} value={lessonsLearned} onChange={(e) => setLessonsLearned(e.target.value)} placeholder="Key lessons and improvements discovered during the project..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                </div>
              </div>

              {/* Project Media & Documentation */}
              <div className="pt-4 border-t border-border-subtle space-y-4">
                <h3 className="text-sm font-bold text-white">Media & Documentation</h3>
                <FileUploadInput label="Network / Architecture Diagram" name="diagramUrl" value={diagramUrl} onChange={(val) => setDiagramUrl(val)} placeholder="https://... or upload diagram" helpText="Upload a dedicated network topology or architecture diagram." />
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Project Gallery URLs</label><textarea rows={4} value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} placeholder={'One image URL per line\nhttps://.../screenshot-1.png\nhttps://.../screenshot-2.png'} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs font-mono" /><p className="text-[10px] text-slate-500 mt-1">Add one screenshot/image URL per line.</p></div>
                <FileUploadInput label="Documentation / PDF" name="documentationUrl" value={documentationUrl} onChange={(val) => setDocumentationUrl(val)} placeholder="https://... or upload documentation" helpText="Project documentation, runbook or PDF." />
              </div>

              {/* SEO */}
              <div className="pt-4 border-t border-border-subtle space-y-4">
                <h3 className="text-sm font-bold text-white">SEO</h3>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">SEO Title</label><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder="Search-friendly project title" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">SEO Meta Description</label><textarea rows={3} value={seoMetaDescription} onChange={(e) => setSeoMetaDescription(e.target.value)} maxLength={180} placeholder="Short description for search engines and social previews..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs" /></div>
              </div>

              {/* Cover Image Upload */}
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

              {/* Links & Visibility */}
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
                    id="featuredCheckbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary bg-surface-50 border-border-subtle cursor-pointer"
                  />
                  <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-subtle flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
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
                  <span>{editingProject ? "Update Blueprint" : "Save & Publish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { ProjectForm } from "./project-form";