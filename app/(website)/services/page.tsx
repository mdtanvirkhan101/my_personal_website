import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import { ServiceCostEstimator } from "@/components/website/service-cost-estimator";
import { getServicesPageConfig } from "@/actions/services-admin-actions";
import Link from "next/link";
import {
  Sparkles,
  Network,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Database,
  Terminal,
  Server,
  Lock,
  Activity,
  Radio,
  Workflow,
  Wrench,
  Settings2,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Services & Technical Solutions | MD Tanvir Khan",
  description:
    "Professional IT, network, infrastructure, VoIP, server and security services delivered with practical technical solutions.",
};

type ServiceCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  attachments: string[];
};

function getServiceIcon(iconName?: string | null) {
  const icon = (iconName || "").toLowerCase();
  const cls = "w-6 h-6";
  switch (icon) {
    case "network":
      return <Network className={cls} />;
    case "radio":
      return <Radio className={cls} />;
    case "security":
    case "shieldcheck":
      return <ShieldCheck className={cls} />;
    case "lock":
      return <Lock className={cls} />;
    case "server":
      return <Server className={cls} />;
    case "terminal":
      return <Terminal className={cls} />;
    case "cpu":
      return <Cpu className={cls} />;
    case "activity":
      return <Activity className={cls} />;
    case "database":
      return <Database className={cls} />;
    case "workflow":
      return <Workflow className={cls} />;
    case "wrench":
      return <Wrench className={cls} />;
    case "code":
      return <Code2 className={cls} />;
    default:
      return <Layers className={cls} />;
  }
}

function ServiceItem({
  service,
  accent,
}: {
  service: ServiceCard;
  accent: "cyan" | "purple";
}) {
  const cyan = accent === "cyan";

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border p-6 sm:p-7 bg-[#141444]/70 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${
        cyan
          ? "border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/10"
          : "border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/10"
      }`}
    >
      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-[#0e0e34] transition-transform group-hover:scale-105 ${
              cyan
                ? "border-cyan-500/30 text-cyan-400"
                : "border-purple-500/30 text-purple-400"
            }`}
          >
            {getServiceIcon(service.icon)}
          </div>
          <h3 className="pt-1 font-heading text-lg sm:text-xl font-bold leading-snug text-white">
            {service.title}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-slate-300/90">{service.description}</p>

        {service.attachments?.length > 0 && (
          <div className="mt-5 space-y-3">
            <div
              className={`flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider ${
                cyan ? "text-cyan-400" : "text-purple-400"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Key Areas &amp; Technologies</span>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {service.attachments.slice(0, 6).map((tag, index) => (
                <li
                  key={`${service.id}-${index}`}
                  className="flex items-start gap-2 text-xs leading-relaxed text-slate-300"
                >
                  <CheckCircle2
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      cyan ? "text-cyan-400" : "text-purple-400"
                    }`}
                  />
                  <span>{tag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Link
            href={`/contact?subject=${encodeURIComponent(service.title)}`}
            className={`inline-flex items-center gap-2 text-xs font-bold transition-colors ${
              cyan ? "text-cyan-300 hover:text-cyan-100" : "text-purple-300 hover:text-purple-100"
            }`}
          >
            Learn More <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ServiceSection({
  title,
  description,
  services,
  accent,
}: {
  title: string;
  description: string;
  services: ServiceCard[];
  accent: "cyan" | "purple";
}) {
  const cyan = accent === "cyan";
  return (
    <section className="space-y-8">
      <div
        className={`flex items-center justify-between gap-4 border-b pb-3 ${
          cyan ? "border-cyan-500/20" : "border-purple-500/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-[#141444] shadow-md ${
              cyan
                ? "border-cyan-500/30 text-cyan-400"
                : "border-purple-500/30 text-purple-400"
            }`}
          >
            {cyan ? <Wrench className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          </div>
        </div>
        <span
          className={`hidden rounded-full border px-3 py-1 text-[10px] font-mono font-bold sm:inline-flex ${
            cyan
              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
              : "border-purple-500/30 bg-purple-500/10 text-purple-300"
          }`}
        >
          {services.length} {services.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {services.map((service) => (
            <ServiceItem key={service.id} service={service} accent={accent} />
          ))}
        </div>
      ) : (
        <div
          className={`rounded-3xl border bg-[#141444]/60 px-6 py-12 text-center ${
            cyan ? "border-cyan-500/20" : "border-purple-500/20"
          }`}
        >
          <Settings2
            className={`mx-auto mb-3 h-7 w-7 ${cyan ? "text-cyan-400" : "text-purple-400"}`}
          />
          <p className="text-xs font-mono text-slate-400">
            No items added yet. Please add from Admin Panel.
          </p>
        </div>
      )}
    </section>
  );
}

export default async function ServicesPage() {
  const [dbServicesData, pageConfig] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    getServicesPageConfig(),
  ]);

  const normalize = (item: any): ServiceCard => ({
    ...item,
    attachments: Array.isArray(item.attachments) ? (item.attachments as string[]) : [],
  });

  const services = dbServicesData
    .filter((item: any) => item.category === "SERVICE")
    .map(normalize);

  const solutions = dbServicesData
    .filter((item: any) => item.category === "SOLUTION")
    .map(normalize);

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col overflow-x-hidden">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10 space-y-16">
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{pageConfig.badgeText || "Professional IT Services & Infrastructure Solutions"}</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {pageConfig.heroHeading}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
                {pageConfig.heroHeadingHighlight}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {pageConfig.heroSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="group relative p-6 rounded-[2rem] bg-[#141444]/60 border border-purple-500/20 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 hover:border-cyan-500/30 transition-all duration-500 flex items-center space-x-6 overflow-hidden backdrop-blur-md">
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-[#0e0e34] border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-all duration-500 z-10">
                <Wrench className="w-7 h-7" />
              </div>
              <div className="z-10 flex flex-col space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-purple-300/70">
                  Professional Services
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-cyan-400 tracking-tight">
                  {services.length}
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  Active Service{services.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="group relative p-6 rounded-[2rem] bg-[#141444]/60 border border-purple-500/20 shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-500 flex items-center space-x-6 overflow-hidden backdrop-blur-md">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-[#0e0e34] border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-all duration-500 z-10">
                <Workflow className="w-7 h-7" />
              </div>
              <div className="z-10 flex flex-col space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-cyan-300/70">
                  Technical Solutions
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-400 tracking-tight">
                  {solutions.length}
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  Active Solution{solutions.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Cost Estimator */}
        {pageConfig.showCostEstimator && (
          <div className="pt-4 pb-2">
            <ServiceCostEstimator
              badge={pageConfig.estimatorBadge}
              title={pageConfig.estimatorTitle}
              subtitle={pageConfig.estimatorSubtitle}
              tiers={pageConfig.estimatorTiers}
            />
          </div>
        )}

        {pageConfig.showServices && (
          <ServiceSection
            title={pageConfig.servicesTitle || "My Services"}
            description={pageConfig.servicesDescription || "Professional IT and network services for building, managing and optimizing reliable infrastructure."}
            services={services}
            accent="cyan"
          />
        )}

        {pageConfig.showSolutions && (
          <div className="pt-8 border-t border-purple-500/20">
            <ServiceSection
              title={pageConfig.solutionsTitle || "Technical Solutions"}
              description={pageConfig.solutionsDescription || "Practical approaches to network, communication, systems and infrastructure challenges."}
              services={solutions}
              accent="purple"
            />
          </div>
        )}

        <div className="rounded-[2.5rem] border border-purple-500/30 p-10 sm:p-14 bg-gradient-to-r from-[#141444] via-[#1a1a52] to-[#141444] text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <h3 className="relative font-heading text-2xl sm:text-3xl font-bold text-white z-10">
            {pageConfig.ctaTitle || "Need a custom network, server, VoIP or security solution?"}
          </h3>
          <p className="relative text-sm text-slate-300/90 max-w-xl mx-auto font-normal z-10 leading-relaxed">
            {pageConfig.ctaDescription || "Share your requirement and let's discuss a practical, secure and maintainable technical approach."}
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 z-10">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {pageConfig.ctaButtonText || "Get in Touch"} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0e0e34] hover:bg-slate-800 border border-purple-500/50 text-sm font-bold text-slate-200 hover:text-white hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              View Projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
