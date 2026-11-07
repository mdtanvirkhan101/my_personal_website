import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertCircle,
  Compass,
  Trophy,
  Sparkles,
  Network,
  Server,
  ShieldCheck,
  MonitorCog,
  HardDrive,
  BookOpen,
  CalendarDays,
  Boxes,
  ListChecks,
  Wrench,
  UserRoundCog,
  FileText,
  ImageIcon,
  Clock3,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

type TaxonomyItem = {
  id: string;
  label: string;
};

type ProjectAttachments = {
  category?: string;
  projectType?: string;
  projectEnvironment?: string;
  objective?: string;
  roleResponsibilities?: string;
  osPlatform?: string;
  protocolsServices?: string;
  keyFeatures?: string;
  implementationSteps?: string;
  securityMeasures?: string;
  monitoringLogging?: string;
  backupRecovery?: string;
  gallery?: string[] | string;
  architectureDiagram?: string;
  documentationUrl?: string;
  startDate?: string;
  completionDate?: string;
  lessonsLearned?: string;
};

const FALLBACK_CATEGORIES: TaxonomyItem[] = [
  { id: "network-infra", label: "Network Infrastructure" },
  { id: "systems-virtualization", label: "Systems & Virtualization" },
  { id: "telephony-voip", label: "VoIP & Telephony" },
  { id: "network-security", label: "Perimeter Defense & Security" },
  { id: "soc-hardening", label: "SOC Telemetry & Hardening" },
  { id: "devops-automation", label: "DevOps & Infrastructure as Code" },
];

const FALLBACK_TYPES: TaxonomyItem[] = [
  { id: "lab", label: "Lab" },
  { id: "personal", label: "Personal Project" },
  { id: "client", label: "Client Project" },
  { id: "production", label: "Production" },
];

const FALLBACK_ENVIRONMENTS: TaxonomyItem[] = [
  { id: "physical", label: "Physical" },
  { id: "virtual", label: "Virtual" },
  { id: "cloud", label: "Cloud" },
  { id: "hybrid", label: "Hybrid" },
];

function parseTaxonomy(value: unknown, fallback: TaxonomyItem[]) {
  if (!Array.isArray(value)) return fallback;

  const items = value.filter(
    (item): item is TaxonomyItem =>
      !!item &&
      typeof item === "object" &&
      typeof (item as TaxonomyItem).id === "string" &&
      typeof (item as TaxonomyItem).label === "string"
  );

  return items.length ? items : fallback;
}

function parseAttachments(value: unknown): ProjectAttachments {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as ProjectAttachments;
}

function parseGallery(value: ProjectAttachments["gallery"]): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && !!item.trim());
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function DetailCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (!value) return null;

  return (
    <div className="glass-panel rounded-2xl border border-[#5A7FC8]/25 bg-[#141444]/55 p-5 space-y-3">
      <div className="flex items-center gap-2 text-[#789BE0]">
        <Icon className="h-4 w-4" />
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-[#DCE3F6] whitespace-pre-line">{value}</p>
    </div>
  );
}

function ContentSection({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (!value) return null;

  return (
    <section className="glass-panel rounded-3xl border border-[#5A7FC8]/30 bg-[#141444]/55 p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00D2D3]/25 bg-[#00D2D3]/10 text-[#2DD4BF]">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-heading text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="text-sm leading-7 text-[#DCE3F6] whitespace-pre-line">{value}</div>
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      summary: true,
      seoTitle: true,
      seoDescription: true,
      coverUrl: true,
    },
  });

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.seoTitle || project.title} | MD Tanvir Khan`,
    description: project.seoDescription || project.summary,
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      images: project.coverUrl ? [{ url: project.coverUrl }] : undefined,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  const [project, categorySetting, typeSetting, environmentSetting] =
    await Promise.all([
      prisma.project.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: { caseStudy: true },
      }),
      prisma.siteSetting.findUnique({
        where: { key: "project_categories" },
        select: { value: true },
      }),
      prisma.siteSetting.findUnique({
        where: { key: "project_types" },
        select: { value: true },
      }),
      prisma.siteSetting.findUnique({
        where: { key: "project_environments" },
        select: { value: true },
      }),
    ]);

  if (!project) notFound();

  const details = parseAttachments(project.attachments);
  const categories = parseTaxonomy(categorySetting?.value, FALLBACK_CATEGORIES);
  const projectTypes = parseTaxonomy(typeSetting?.value, FALLBACK_TYPES);
  const environments = parseTaxonomy(
    environmentSetting?.value,
    FALLBACK_ENVIRONMENTS
  );

  const categoryLabel =
    categories.find((item) => item.id === details.category)?.label ||
    details.category ||
    "Infrastructure Project";

  const typeLabel =
    projectTypes.find((item) => item.id === details.projectType)?.label ||
    details.projectType ||
    "";

  const environmentLabel =
    environments.find((item) => item.id === details.projectEnvironment)?.label ||
    details.projectEnvironment ||
    "";

  const gallery = parseGallery(details.gallery);
  const caseStudy = project.caseStudy;

  const quickFacts = [
    { label: "Category", value: categoryLabel, icon: Network },
    { label: "Project Type", value: typeLabel, icon: Boxes },
    { label: "Environment", value: environmentLabel, icon: Server },
    { label: "OS / Platform", value: details.osPlatform, icon: MonitorCog },
    {
      label: "Completed",
      value: formatDate(details.completionDate),
      icon: CalendarDays,
    },
    {
      label: "Started",
      value: formatDate(details.startDate),
      icon: Clock3,
    },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-[#0E0E34] text-[#F7F6F7] relative selection:bg-[#00D2D3]/40 selection:text-white flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-10 sm:space-y-12">
        <Link
          href="/projects"
          className="inline-flex min-h-[44px] items-center gap-2 text-xs font-mono text-[#789BE0] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all projects</span>
        </Link>

        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {details.category && (
              <span className="rounded-full border border-[#00D2D3]/30 bg-[#00D2D3]/10 px-3 py-1 text-[11px] font-mono font-bold text-[#2DD4BF]">
                {categoryLabel}
              </span>
            )}
            {typeLabel && (
              <span className="rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-[11px] font-mono font-bold text-purple-200">
                {typeLabel}
              </span>
            )}
            {environmentLabel && (
              <span className="rounded-full border border-[#5A7FC8]/30 bg-[#141444] px-3 py-1 text-[11px] font-mono font-bold text-[#789BE0]">
                {environmentLabel}
              </span>
            )}
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-mono font-bold text-amber-200">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <h1 className="max-w-4xl font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {project.title}
          </h1>

          <p className="max-w-3xl text-base sm:text-lg leading-relaxed text-[#DCE3F6]">
            {project.summary}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.stack?.map((tech: string) => (
              <span
                key={tech}
                className="rounded-lg border border-[#5A7FC8]/30 bg-[#141444] px-3 py-1 text-xs font-mono font-semibold text-[#789BE0]"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#252E8A] to-[#00D2D3] px-5 py-2.5 text-xs font-heading font-bold text-white transition-transform hover:scale-[1.03]"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Live Project</span>
              </a>
            )}

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#5A7FC8]/35 bg-[#141444] px-5 py-2.5 text-xs font-semibold text-[#DCE3F6] transition-colors hover:bg-[#1A1A52] hover:text-white"
              >
                <Github className="h-4 w-4" />
                <span>View Repository</span>
              </a>
            )}

            {details.documentationUrl && (
              <a
                href={details.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#00D2D3]/30 bg-[#00D2D3]/5 px-5 py-2.5 text-xs font-semibold text-[#2DD4BF] transition-colors hover:text-white"
              >
                <FileText className="h-4 w-4" />
                <span>Documentation</span>
              </a>
            )}
          </div>
        </header>

        {project.coverUrl && (
          <div className="overflow-hidden rounded-3xl border border-[#5A7FC8]/30 bg-[#141444] shadow-card">
            <img
              src={project.coverUrl}
              alt={project.title}
              className="aspect-video max-h-[560px] w-full object-cover"
            />
          </div>
        )}

        {quickFacts.length > 0 && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickFacts.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-[#5A7FC8]/25 bg-[#141444]/60 p-4"
              >
                <Icon className="mb-3 h-4 w-4 text-[#2DD4BF]" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#789BE0]">
                  {label}
                </p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-white">
                  {value}
                </p>
              </div>
            ))}
          </section>
        )}

        <ContentSection
          title="Project Overview & Architecture"
          value={project.content || undefined}
          icon={BookOpen}
        />

        {(details.objective || details.roleResponsibilities) && (
          <section className="grid gap-5 md:grid-cols-2">
            <DetailCard
              title="Project Objective"
              value={details.objective}
              icon={Compass}
            />
            <DetailCard
              title="Role & Responsibilities"
              value={details.roleResponsibilities}
              icon={UserRoundCog}
            />
          </section>
        )}

        {(details.osPlatform || details.protocolsServices) && (
          <section className="grid gap-5 md:grid-cols-2">
            <DetailCard
              title="OS / Platform"
              value={details.osPlatform}
              icon={Server}
            />
            <DetailCard
              title="Protocols & Services"
              value={details.protocolsServices}
              icon={Network}
            />
          </section>
        )}

        <ContentSection
          title="Key Features & Implementations"
          value={details.keyFeatures}
          icon={ListChecks}
        />

        <ContentSection
          title="Implementation Steps"
          value={details.implementationSteps}
          icon={Wrench}
        />

        {details.architectureDiagram && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00D2D3]/25 bg-[#00D2D3]/10 text-[#2DD4BF]">
                <Network className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-xl font-bold text-white">
                Network / Architecture Diagram
              </h2>
            </div>
            <div className="overflow-hidden rounded-3xl border border-[#5A7FC8]/30 bg-[#141444] p-2">
              <img
                src={details.architectureDiagram}
                alt={`${project.title} architecture diagram`}
                className="w-full rounded-2xl object-contain"
              />
            </div>
          </section>
        )}

        {(details.securityMeasures ||
          details.monitoringLogging ||
          details.backupRecovery) && (
            <section className="space-y-5">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#2DD4BF]">
                  Security & Operations
                </span>
                <h2 className="mt-2 font-heading text-2xl font-bold text-white">
                  Protection, Visibility & Recovery
                </h2>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <DetailCard
                  title="Security Measures"
                  value={details.securityMeasures}
                  icon={ShieldCheck}
                />
                <DetailCard
                  title="Monitoring & Logging"
                  value={details.monitoringLogging}
                  icon={MonitorCog}
                />
                <DetailCard
                  title="Backup & Recovery"
                  value={details.backupRecovery}
                  icon={HardDrive}
                />
              </div>
            </section>
          )}

        {gallery.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-[#2DD4BF]" />
              <h2 className="font-heading text-2xl font-bold text-white">
                Project Gallery
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className="overflow-hidden rounded-2xl border border-[#5A7FC8]/25 bg-[#141444]"
                >
                  <img
                    src={imageUrl}
                    alt={`${project.title} screenshot ${index + 1}`}
                    className="aspect-video w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {caseStudy && (
          <section className="space-y-8 border-t border-[#5A7FC8]/20 pt-8">
            <div className="mx-auto max-w-xl space-y-2 text-center">
              <span className="rounded-full border border-[#5A7FC8]/20 bg-[#141444] px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-[#789BE0]">
                Case Study
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                Challenge, Process & Outcome
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DetailCard
                title="The Challenge"
                value={caseStudy.problem}
                icon={AlertCircle}
              />
              <DetailCard
                title="The Solution"
                value={caseStudy.solution}
                icon={CheckCircle2}
              />
              <DetailCard
                title="Process & Methodology"
                value={caseStudy.process || undefined}
                icon={Compass}
              />
              <DetailCard
                title="Measurable Impact"
                value={caseStudy.outcome || undefined}
                icon={Trophy}
              />
            </div>
          </section>
        )}

        <ContentSection
          title="Lessons Learned"
          value={details.lessonsLearned}
          icon={Sparkles}
        />

        <div className="border-t border-[#5A7FC8]/20 pt-8">
          <Link
            href="/projects"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#5A7FC8]/30 bg-[#141444] px-5 py-2.5 text-xs font-semibold text-[#DCE3F6] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Explore More Projects</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
