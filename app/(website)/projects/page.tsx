
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { ProjectCard } from "@/components/website/project-card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Network,
  Globe,
  Layers,
  Server,
  Terminal,
  Cpu,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Industry Projects & Architecture Portfolio | MD Tanvir Khan",
  description:
    "Curated network engineering, enterprise systems, VoIP telephony, cybersecurity, and infrastructure automation architectures.",
};

const CATEGORIES = [
  {
    id: "network-infra",
    label: "Network Infrastructure",
    description:
      "Core routing, multi-WAN load balancing, enterprise VLANs, and high-availability gateway topologies.",
    icon: Network,
  },
  {
    id: "systems-virtualization",
    label: "Systems & Virtualization",
    description:
      "Hypervisor clusters, bare-metal Linux servers, centralized identity, and high-throughput SAN/NAS storage.",
    icon: Server,
  },
  {
    id: "telephony-voip",
    label: "VoIP & Telephony",
    description:
      "Carrier-grade SIP proxies, enterprise IP-PBX dial plans, WebRTC bridging, and unified communications.",
    icon: Globe,
  },
  {
    id: "network-security",
    label: "Perimeter Defense & Security",
    description:
      "Next-gen edge firewalls, deep packet inspection (IDS/IPS), Zero Trust tunnels, and access controls.",
    icon: ShieldCheck,
  },
  {
    id: "soc-hardening",
    label: "SOC Telemetry & Hardening",
    description:
      "Centralized SIEM monitoring, log ingestion, CIS benchmark host hardening, and proactive mitigation.",
    icon: Cpu,
  },
  {
    id: "devops-automation",
    label: "DevOps & Infrastructure as Code",
    description:
      "Containerized operational services, configuration management playbooks, and continuous observability.",
    icon: Terminal,
  },
];

interface PageProps {
  searchParams?: Promise<{ category?: string }> | { category?: string };
}

export default async function IndustryProjectsPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams || {};

  const currentCategory = resolvedSearchParams?.category || "all";

  const [dbProjects, categorySetting, typeSetting, environmentSetting] = await Promise.all([
    prisma.project.findMany({
      where: { status: "PUBLISHED" },
      include: { caseStudy: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.siteSetting.findUnique({ where: { key: "project_categories" }, select: { value: true } }),
    prisma.siteSetting.findUnique({ where: { key: "project_types" }, select: { value: true } }),
    prisma.siteSetting.findUnique({ where: { key: "project_environments" }, select: { value: true } }),
  ]);

  const readTaxonomy = (value: unknown, fallback: { id: string; label: string }[]) => {
    if (!Array.isArray(value)) return fallback;
    const items = value.filter(
      (item: any) => item && typeof item.id === "string" && typeof item.label === "string"
    );
    return items.length ? items : fallback;
  };

  const savedCategories = readTaxonomy(
    categorySetting?.value,
    CATEGORIES.map(({ id, label }) => ({ id, label }))
  );
  const projectTypes = readTaxonomy(typeSetting?.value, [
    { id: "lab", label: "Lab" },
    { id: "personal", label: "Personal Project" },
    { id: "client", label: "Client Project" },
    { id: "production", label: "Production" },
  ]);
  const projectEnvironments = readTaxonomy(environmentSetting?.value, [
    { id: "physical", label: "Physical" },
    { id: "virtual", label: "Virtual" },
    { id: "cloud", label: "Cloud" },
    { id: "hybrid", label: "Hybrid" },
  ]);

  const displayCategories = savedCategories.map((saved) => {
    const preset = CATEGORIES.find((item) => item.id === saved.id);
    return {
      ...saved,
      description: preset?.description || "Infrastructure engineering projects, implementation notes, architecture decisions, and verified outcomes.",
      icon: preset?.icon || Layers,
    };
  });


  function getProjectCategory(project: any): string {
    if (project.category) return project.category;

    if (
      project.attachments &&
      typeof project.attachments === "object" &&
      (project.attachments as any).category
    ) {
      return (project.attachments as any).category;
    }

    const text =
      `${project.title || ""} ${project.summary || ""} ${(project.stack || []).join(" ")}`.toLowerCase();

    if (
      text.includes("kamailio") ||
      text.includes("voip") ||
      text.includes("sip") ||
      text.includes("freepbx") ||
      text.includes("telephony") ||
      text.includes("grandstream") ||
      text.includes("pbx") ||
      text.includes("ivr") ||
      text.includes("webrtc")
    ) {
      return "telephony-voip";
    }

    if (
      text.includes("proxmox") ||
      text.includes("virtualization") ||
      text.includes("truenas") ||
      text.includes("directory") ||
      text.includes("vmware") ||
      text.includes("samba") ||
      text.includes("active directory") ||
      text.includes("ldap") ||
      text.includes("esxi") ||
      text.includes("san") ||
      text.includes("zfs")
    ) {
      return "systems-virtualization";
    }

    if (
      text.includes("pfsense") ||
      text.includes("suricata") ||
      text.includes("ids") ||
      text.includes("ips") ||
      text.includes("firewall") ||
      text.includes("fortigate") ||
      text.includes("zero trust") ||
      text.includes("perimeter") ||
      text.includes("pci-dss")
    ) {
      return "network-security";
    }

    if (
      text.includes("wazuh") ||
      text.includes("siem") ||
      text.includes("soc") ||
      text.includes("cis") ||
      text.includes("hardening") ||
      text.includes("fail2ban") ||
      text.includes("audit") ||
      text.includes("telemetry")
    ) {
      return "soc-hardening";
    }

    if (
      text.includes("docker") ||
      text.includes("ansible") ||
      text.includes("prometheus") ||
      text.includes("grafana") ||
      text.includes("devops") ||
      text.includes("automation") ||
      text.includes("iac") ||
      text.includes("kuma")
    ) {
      return "devops-automation";
    }

    return "network-infra";
  }

  const rawProjects = dbProjects;

  const normalizedProjects = rawProjects.map((project: any) => {
    const attachments =
      project.attachments &&
        typeof project.attachments === "object" &&
        !Array.isArray(project.attachments)
        ? (project.attachments as Record<string, any>)
        : {};

    const projectTypeId = attachments.projectType || "";
    const environmentId = attachments.projectEnvironment || "";

    return {
      ...project,
      category: getProjectCategory(project),
      projectTypeLabel:
        projectTypes.find(
          (item) => item.id.toLowerCase() === String(projectTypeId).toLowerCase()
        )?.label || projectTypeId,
      projectEnvironmentLabel:
        projectEnvironments.find(
          (item) => item.id.toLowerCase() === String(environmentId).toLowerCase()
        )?.label || environmentId,
      completionDate: attachments.completionDate || "",
    };
  });

  const activeCategories =
    currentCategory === "all"
      ? displayCategories
      : displayCategories.filter((category) => category.id === currentCategory);

  const totalVisibleProjects =
    currentCategory === "all"
      ? normalizedProjects.length
      : normalizedProjects.filter(
        (project: any) => project.category === currentCategory
      ).length;

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Curated Engineering Portfolio ({totalVisibleProjects} Architecture Builds)
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Projects &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
              Architectures
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Enterprise network systems, VoIP telephony topologies, cybersecurity firewalls, and modern high-availability software architectures.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none border-b border-purple-500/20">
          <Link
            href="/projects"
            scroll={false}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${currentCategory === "all"
              ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30 scale-105"
              : "bg-[#141444]/70 border-purple-500/20 text-slate-300 hover:border-purple-500/50 hover:text-white hover:bg-[#191952]"
              }`}
          >
            <Layers
              className={`w-3.5 h-3.5 ${currentCategory === "all"
                ? "text-cyan-300"
                : "text-cyan-400"
                }`}
            />
            <span>All Architectures</span>
          </Link>

          {displayCategories.map((category) => {
            const Icon = category.icon;
            const isActive = currentCategory === category.id;

            return (
              <Link
                key={category.id}
                href={`/projects?category=${category.id}`}
                scroll={false}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${isActive
                  ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30 scale-105"
                  : "bg-[#141444]/70 border-purple-500/20 text-slate-300 hover:border-purple-500/50 hover:text-white hover:bg-[#191952]"
                  }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? "text-cyan-300" : "text-cyan-400"
                    }`}
                />
                <span>{category.label}</span>
              </Link>
            );
          })}
        </div>

        {normalizedProjects.length === 0 ? (
          <div className="rounded-3xl border border-purple-500/20 bg-[#141444]/50 px-6 py-14 text-center">
            <Layers className="mx-auto mb-4 h-10 w-10 text-cyan-400/50" />
            <h2 className="font-heading text-xl font-bold text-white">
              No published projects yet
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              Publish a project from the admin panel and it will appear here directly from the database.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {activeCategories.map((category) => {
              const SectionIcon = category.icon;

              const sectionProjects = normalizedProjects.filter(
                (project: any) => project.category === category.id
              );

              if (
                currentCategory === "all" &&
                sectionProjects.length === 0
              ) {
                return null;
              }

              return (
                <section key={category.id} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-purple-500/20">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-cyan-400">
                          <SectionIcon className="w-5 h-5" />
                        </div>

                        <h2 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {category.label}
                        </h2>

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {sectionProjects.length}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
                        {category.description}
                      </p>
                    </div>

                    {currentCategory === "all" && (
                      <Link
                        href={`/projects?category=${category.id}`}
                        className="text-xs font-semibold text-cyan-400 hover:text-white inline-flex items-center space-x-1 whitespace-nowrap self-start sm:self-auto"
                      >
                        <span>Filter Category</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {sectionProjects.length === 0 ? (
                    <div className="rounded-2xl border border-purple-500/20 bg-[#141444]/40 p-8 text-center space-y-2">
                      <Layers className="w-8 h-8 text-slate-500 mx-auto opacity-40" />
                      <p className="text-xs text-slate-400">
                        No deployed architectures recorded in this category yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sectionProjects.map((project: any) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          categoryLabel={category.label}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
