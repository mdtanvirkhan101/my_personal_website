import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sparkles, ArrowUpRight, Layers, Zap, CheckCircle2, Star } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Industry Case Studies | MD Tanvir Khan – Network & Security Engineer",
  description: "Engineering deconstructions, network architecture breakdowns, and security case studies categorized by industry sectors.",
};

export default async function IndustryCaseStudiesPage() {
  // Fetch from Project model where status is PUBLISHED and a caseStudy exists
  const publishedProjects = await prisma.project.findMany({
    where: {
      status: "PUBLISHED",
      caseStudy: { isNot: null },
    },
    include: {
      caseStudy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const featuredProjects = publishedProjects.filter((p) => p.featured);
  const regularProjects = publishedProjects.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10 space-y-16">

        {/* Header Section */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architectural Deconstructions ({publishedProjects.length} Studies)</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Case Studies</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            In-depth retrospectives dissecting real-world network challenges, infrastructure hardening, and measurable security outcomes.
          </p>
        </div>

        {/* Empty State */}
        {publishedProjects.length === 0 && (
          <div className="text-center py-20 rounded-3xl border border-purple-500/20 bg-[#141444]/40">
            <h2 className="text-xl font-bold text-white">No published case studies yet.</h2>
            <p className="text-slate-400 mt-2 text-sm">Check back later for deep-dive architectural breakdowns.</p>
          </div>
        )}

        {/* Featured Studies Section */}
        {featuredProjects.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              <h2 className="text-2xl font-bold text-white font-heading">Featured Deployments</h2>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {featuredProjects.map((project, idx) => (
                <CaseStudyCard key={project.id} project={project} index={idx} isFeatured />
              ))}
            </div>
          </div>
        )}

        {/* All / Regular Case Studies Section */}
        {regularProjects.length > 0 && (
          <div className="space-y-8 pt-6 border-t border-purple-500/20">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold text-white font-heading">
                {featuredProjects.length > 0 ? "All Case Studies" : "Engineering Deconstructions"}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {regularProjects.map((project, idx) => (
                <CaseStudyCard
                  key={project.id}
                  project={project}
                  index={featuredProjects.length + idx}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Reusable Component for Case Study Cards
function CaseStudyCard({ project, index, isFeatured = false }: { project: any, index: number, isFeatured?: boolean }) {
  return (
    <article className={`rounded-3xl border ${isFeatured ? 'border-cyan-500/40 bg-[#141444]/90 shadow-cyan-500/10' : 'border-purple-500/20 bg-[#141444]/70 shadow-purple-500/5'} p-6 sm:p-10 shadow-xl hover:border-purple-500/40 transition-all duration-300 space-y-6 group`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-cyan-400 bg-[#0e0e34] px-2.5 py-1 rounded-full border border-purple-500/20 font-semibold">
              CASE STUDY #{String(index + 1).padStart(2, "0")}
            </span>
            {project.stack?.slice(0, 4).map((tech: string) => (
              <span key={tech} className="text-[10px] font-mono text-slate-300 bg-[#0e0e34] px-2.5 py-1 rounded-full border border-purple-500/20">
                {tech}
              </span>
            ))}
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
            <Link href={`/case-studies/${project.slug}`}>{project.title}</Link>
          </h3>
        </div>

        <Link
          href={`/case-studies/${project.slug}`}
          className="min-h-[44px] inline-flex items-center space-x-2 text-xs font-heading font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 px-5 py-2.5 rounded-2xl shadow-lg shadow-purple-500/20 transition-all shrink-0 hover:scale-105"
        >
          <span>Read Breakdown</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl font-normal">
        {project.summary}
      </p>

      {/* Triad Breakdown */}
      {project.caseStudy && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e34] border border-purple-500/20 space-y-1.5 shadow-inner">
            <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5" /><span>The Challenge</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{project.caseStudy.problem}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e34] border border-purple-500/20 space-y-1.5 shadow-inner">
            <span className="text-[11px] font-mono uppercase text-purple-300 font-bold flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5" /><span>The Solution</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{project.caseStudy.solution}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e34] border border-purple-500/20 space-y-1.5 shadow-inner">
            <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /><span>Measurable Outcome</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{project.caseStudy.outcome || "Measurable outcomes achieved."}</p>
          </div>
        </div>
      )}
    </article>
  );
}