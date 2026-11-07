import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { ArchitectureViewer } from "@/components/website/architecture-viewer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
  });

  return {
    title: project
      ? `${project.title} – Case Study | MD Tanvir Khan`
      : "Engineering Case Study | MD Tanvir Khan",
    description: project?.summary || "Architectural case study by MD Tanvir Khan.",
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: { caseStudy: true },
  });

  // Fallback realistic editorial data if slug is one of our defaults
  const fallbackStudies: Record<string, any> = {
    "custom-headless-cms-portfolio": {
      title: "Custom Headless CMS & High-Frequency Portfolio",
      summary:
        "Engineering a zero-external-dependency, self-hosted Next.js 14 monolith with custom JWT session cookies and Prisma ORM on PostgreSQL.",
      stack: ["Next.js 14", "TypeScript", "Prisma ORM", "PostgreSQL", "Tailwind CSS"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/example/portfolio",
      caseStudy: {
        problem:
          "Third-party headless CMS services created unpredictable latency spikes, recurring vendor lock-in costs, and fragmented media management workflows across external CDNs.",
        process:
          "Designed a localized schema using PostgreSQL with Prisma ORM. Replaced bloated node-crypto pipelines with web-standard subtle crypto for zero-overhead authentication. Implemented Next.js Server Actions with strict Zod schema validation.",
        solution:
          "An integrated monolith architecture running Next.js App Router with unified admin CMS controls directly inside the application, secured by HTTP-only session cookies and multi-layer role validations.",
        outcome:
          "Slashed Time-to-First-Byte (TTFB) to under 45ms. 100/100 Google Lighthouse across Performance, Accessibility, Best Practices, and SEO. Reduced infrastructure maintenance costs to zero additional SaaS subscriptions.",
      },
    },
    "fintech-real-time-analytics-dashboard": {
      title: "FinTech Real-Time Analytics & Settlement Dashboard",
      summary:
        "Architecting a low-latency financial monitoring dashboard handling high-frequency ledger events and streaming data visualization.",
      stack: ["React", "TypeScript", "Node.js", "WebSockets", "Tailwind CSS"],
      liveUrl: "https://example.com/demo",
      repoUrl: "https://github.com/example/fintech",
      caseStudy: {
        problem:
          "Traditional REST polling created server bottlenecks, increased cloud infrastructure bills exponentially, and delayed critical fraud detection alert triggers by up to 12 seconds.",
        process:
          "Conducted benchmarking of SSE vs. bidirectional WebSockets. Re-architected front-end canvas renderer to batch redraw requests during high volatility transaction spikes.",
        solution:
          "Deployed a high-throughput WebSocket streaming pipeline paired with web-worker offloaded data aggregation and optimistic UI updates for real-time ledger auditing.",
        outcome:
          "Reduced settlement event latency from 12 seconds to under 45ms and slashed server resource utilization by 68%.",
      },
    },
    "generative-design-system": {
      title: "Generative Design System & Component Library",
      summary:
        "Creating an accessible, mathematical design token architecture supporting high-contrast accessibility and fluid typography.",
      stack: ["Figma", "TypeScript", "Tailwind CSS", "Motion for React", "CSS Variables"],
      liveUrl: "https://example.com/system",
      repoUrl: "https://github.com/example/design-system",
      caseStudy: {
        problem:
          "Inconsistent component styles across multiple micro-apps led to brand drift and severe accessibility contrast failures.",
        process:
          "Analyzed design drift across 4 distinct web applications. Formulated mathematical color scales with strict APCA / WCAG contrast math and standardized spacing tokens.",
        solution:
          "Built a unified NPM package and Tailwind CSS plugin distributing design tokens, accessible components, and unified spring-motion curves.",
        outcome:
          "Accelerated feature release cycles by 55% while elevating accessibility audit scores to 100% across all company client portals.",
      },
    },
  };

  const data = project || fallbackStudies[params.slug];

  if (!data) {
    notFound();
  }

  const study = data.caseStudy || {
    problem: "Identifying architectural bottlenecks and user experience friction points.",
    process: "Iterative benchmarking, prototype wireframing, and rigorous code reviews.",
    solution: "Custom architectural design built with Next.js, TypeScript, and modern styling.",
    outcome: "Measurable gains in speed, accessibility, and user engagement.",
  };

  return (
    <div className="min-h-screen bg-[#0E0E34] text-[#F7F6F7] relative selection:bg-[#00D2D3]/40 selection:text-[#F7F6F7] flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-10 sm:space-y-12">
        {/* Back Link */}
        <Link
          href="/case-studies"
          className="inline-flex items-center space-x-2 text-xs font-mono text-[#789BE0] hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Studies Archive</span>
        </Link>

        {/* Case Study Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#2DD4BF] bg-[#141444] px-3 py-1 rounded-full border border-[#00D2D3]/30">
              Technical Case Study
            </span>
            {data.stack?.map((tech: string) => (
              <span
                key={tech}
                className="text-[11px] font-mono text-[#789BE0] bg-[#0E0E34] px-2.5 py-1 rounded-md border border-[#5A7FC8]/25"
              >
                {tech}
              </span>
            ))}
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {data.title}
          </h1>

          <p className="text-sm sm:text-base text-[#DCE3F6] leading-relaxed">
            {data.summary}
          </p>

          {(data.liveUrl || data.repoUrl) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {data.liveUrl && (
                <a
                  href={data.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#252E8A] to-[#00D2D3] px-4 py-2 rounded-xl shadow-glow-cyan hover:scale-105 transition-all"
                >
                  <span>Launch Live Build</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {data.repoUrl && (
                <a
                  href={data.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center space-x-1.5 text-xs font-semibold text-[#DCE3F6] bg-[#141444] border border-[#5A7FC8]/35 px-4 py-2 rounded-xl hover:bg-[#1A1A52] hover:text-white transition-colors"
                >
                  <span>Inspect Codebase</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </header>

        {/* Detailed Case Sections */}
        <div className="space-y-6 sm:space-y-8">
          {/* 1. Problem Statement */}
          <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#5A7FC8]/30 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#2DD4BF] font-bold">
              <Zap className="w-4 h-4" />
              <span>01. The Problem & Inefficiencies</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-white">
              The Core Friction
            </h2>
            <p className="text-xs sm:text-sm text-[#DCE3F6] leading-relaxed">
              {study.problem}
            </p>
          </section>

          {/* 2. Research & Engineering Process */}
          {study.process && (
            <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#5A7FC8]/30 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#789BE0] font-bold">
                <Layers className="w-4 h-4" />
                <span>02. Research, Benchmarking & Discovery</span>
              </div>
              <h2 className="font-heading text-xl font-bold text-white">
                Architectural Investigation
              </h2>
              <p className="text-xs sm:text-sm text-[#DCE3F6] leading-relaxed">
                {study.process}
              </p>
            </section>
          )}

          {/* 3. The Technical Solution */}
          <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#5A7FC8]/30 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#789BE0] font-bold">
              <Cpu className="w-4 h-4" />
              <span>03. Implemented Architecture</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-white">
              Engineered Solution
            </h2>
            <p className="text-xs sm:text-sm text-[#DCE3F6] leading-relaxed">
              {study.solution}
            </p>

            {/* Interactive Architecture Schematic */}
            <ArchitectureViewer
              src={data.imageUrl || "/images/projects/case-study-arch.svg"}
              alt={`${data.title} Architecture Diagram`}
              title={`${data.title} – Architecture Schematic`}
            />
          </section>

          {/* 4. Outcomes & Quantifiable Impact */}
          <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#5A7FC8]/30 space-y-3 bg-gradient-to-br from-[#141444]/90 to-[#222368]/50">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#DCE3F6] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#789BE0]" />
              <span>04. Quantifiable Outcomes</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-gradient-pearl">
              Results & Metrics
            </h2>
            <p className="text-xs sm:text-sm text-[#DCE3F6] leading-relaxed">
              {study.outcome}
            </p>
          </section>
        </div>

        {/* Next Case Study Navigation */}
        <div className="pt-8 border-t border-[#5A7FC8]/20 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/case-studies"
            className="min-h-[44px] inline-flex items-center text-xs font-mono text-[#789BE0] hover:text-white transition-colors"
          >
            ← View All Case Studies
          </Link>
          <Link
            href="/projects"
            className="min-h-[44px] inline-flex items-center text-xs font-mono text-[#789BE0] hover:text-white transition-colors"
          >
            Explore Projects Portfolio →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
