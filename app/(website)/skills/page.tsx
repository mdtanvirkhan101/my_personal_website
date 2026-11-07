import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import {
  Code2,
  Layers,
  Network,
  Wrench,
  Server,
  Terminal,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import type { Metadata } from "next";
import type { ComponentType, CSSProperties } from "react";
import * as LucideIcons from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Skills & Technologies | MD Tanvir Khan",
  description:
    "My technical skills, tools, platforms and technologies that help me build amazing solutions.",
};

// Read icon components by their Lucide export name saved from the Admin Panel.
const getSkillIcon = (name?: string | null, fallback = "Network") => {
  const icons = LucideIcons as unknown as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>;
  return icons[name || fallback] || icons[fallback] || Network;
};

const getPercentage = (skill: { percentage?: number | null }) =>
  Math.min(100, Math.max(0, skill.percentage ?? 85));

const corePalette = [
  {
    accent: "#F59E0B",
    soft: "rgba(245, 158, 11, 0.13)",
    border: "rgba(245, 158, 11, 0.38)",
    glow: "rgba(245, 158, 11, 0.22)",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  {
    accent: "#22D3EE",
    soft: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.38)",
    glow: "rgba(34, 211, 238, 0.20)",
    text: "text-cyan-300",
    dot: "bg-cyan-400",
  },
  {
    accent: "#C084FC",
    soft: "rgba(192, 132, 252, 0.12)",
    border: "rgba(192, 132, 252, 0.38)",
    glow: "rgba(192, 132, 252, 0.20)",
    text: "text-purple-300",
    dot: "bg-purple-400",
  },
  {
    accent: "#34D399",
    soft: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.38)",
    glow: "rgba(52, 211, 153, 0.20)",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
];

const toolPalette = [
  {
    accent: "#2DD4BF",
    soft: "rgba(45, 212, 191, 0.12)",
    border: "rgba(45, 212, 191, 0.38)",
    glow: "rgba(45, 212, 191, 0.20)",
    text: "text-teal-300",
    dot: "bg-teal-400",
  },
  {
    accent: "#A78BFA",
    soft: "rgba(167, 139, 250, 0.12)",
    border: "rgba(167, 139, 250, 0.38)",
    glow: "rgba(167, 139, 250, 0.20)",
    text: "text-violet-300",
    dot: "bg-violet-400",
  },
  {
    accent: "#F472B6",
    soft: "rgba(244, 114, 182, 0.12)",
    border: "rgba(244, 114, 182, 0.38)",
    glow: "rgba(244, 114, 182, 0.20)",
    text: "text-pink-300",
    dot: "bg-pink-400",
  },
];

export default async function SkillsPage() {
  const dbSkills = await prisma.skill.findMany({
    where: { level: { not: 0 } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const categoryImageSetting = await prisma.siteSetting.findUnique({
    where: { key: "skills_category_images" },
    select: { value: true },
  });
  const categoryImages =
    categoryImageSetting?.value &&
    typeof categoryImageSetting.value === "object" &&
    !Array.isArray(categoryImageSetting.value)
      ? (categoryImageSetting.value as Record<string, string>)
      : {};

  const coreSkillsList = dbSkills.filter((s: any) => s.level === 1);
  const toolSkillsList = dbSkills.filter((s: any) => s.level === 2);

  const groupByCategory = (items: typeof dbSkills) => {
    const map: Record<string, typeof dbSkills> = {};
    items.forEach((item) => {
      const cat = item.category || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  };

  const coreGrouped = groupByCategory(coreSkillsList);
  const toolGrouped = groupByCategory(toolSkillsList);

  const coreCategories = Object.keys(coreGrouped);
  const toolCategories = Object.keys(toolGrouped);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#02040a] font-sans text-slate-300 selection:bg-white/20 selection:text-white">
      {/* Existing premium background and ambient glass-theme lighting */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-48 top-[8%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute -right-48 top-[28%] h-[38rem] w-[38rem] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute bottom-[5%] left-[28%] h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-[150px]" />
        <PremiumBackground />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Page heading - retains the existing website style */}
        <header className="mb-14 flex w-full items-start gap-4 sm:mb-20 sm:gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:h-16 sm:w-16">
            <Layers className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </div>
          <div className="pt-1">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300/80">
              My capabilities
            </p>
            <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wide text-white drop-shadow-md sm:text-4xl">
              Skills &amp; Technologies
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400 sm:text-base">
              My technical skills and tools that help me build amazing solutions.
            </p>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1250px] flex-col items-center">
          {/* =========================================
              TREE 01 - TECHNICAL SKILLS
          ========================================= */}
          <section className="w-full" aria-labelledby="technical-skills-heading">
            {/* Root node */}
            <div className="relative z-10 mx-auto flex w-fit flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_35px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:h-16 sm:w-16">
                {(() => {
                  const RootIcon = getSkillIcon(coreSkillsList[0]?.rootIcon, "Code2");
                  return <RootIcon className="h-7 w-7 text-cyan-200 sm:h-8 sm:w-8" />;
                })()}
              </div>
              <div className="rounded-2xl border border-white/15 bg-[#111827]/90 px-6 py-4 text-center shadow-[0_12px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-9">
                <h2
                  id="technical-skills-heading"
                  className="text-sm font-black uppercase tracking-[0.2em] text-white sm:text-base"
                >
                  Technical Skills
                </h2>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-[10px]">
                  Build · Configure · Optimize
                </p>
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-cyan-300/70 to-white/20 sm:h-14" />
              <div className="h-2.5 w-2.5 rounded-full border-2 border-cyan-200 bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
            </div>

            {/* Main branch rail */}
            {coreCategories.length > 0 ? (
              <>
                <div className="mx-auto hidden h-8 w-px bg-white/20 md:block" />
                <div className="relative grid grid-cols-1 gap-8 pt-7 sm:grid-cols-2 sm:gap-x-7 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
                  {/* Horizontal branch rail on wider screens */}
                  <div className="absolute left-[16.66%] right-[16.66%] top-0 hidden h-px bg-gradient-to-r from-amber-400/40 via-cyan-400/40 to-purple-400/40 lg:block" />
                  {coreCategories.map((cat, index) => {
                    const palette = corePalette[index % corePalette.length];
                    const skills = coreGrouped[cat];

                    return (
                      <div key={cat} className="relative flex min-w-0 flex-col items-center">
                        {/* Branch connector */}
                        <div
                          className="absolute -top-7 hidden h-7 w-px lg:block"
                          style={{ backgroundColor: palette.border }}
                        />
                        <div
                          className="absolute -top-[31px] hidden h-2 w-2 rounded-full lg:block"
                          style={{
                            backgroundColor: palette.accent,
                            boxShadow: `0 0 12px ${palette.accent}`,
                          }}
                        />

                        {/* Category node */}
                        <div
                          className="relative z-10 flex min-h-[76px] w-full max-w-[340px] items-center gap-4 rounded-2xl border px-5 py-4 shadow-[0_10px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                          style={{
                            backgroundColor: palette.soft,
                            borderColor: palette.border,
                            boxShadow: `0 10px 35px rgba(0,0,0,0.22), 0 0 24px ${palette.glow}`,
                          }}
                        >
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                            style={{
                              borderColor: palette.border,
                              backgroundColor: "rgba(255,255,255,0.06)",
                            }}
                          >
                            {categoryImages[`CORE:${cat}`] ? (
                              <img src={categoryImages[`CORE:${cat}`]} alt={`${cat} category`} className="h-full w-full rounded-lg object-cover" />
                            ) : (() => {
                              const CategoryIcon = getSkillIcon(skills[0]?.categoryIcon, "Network");
                              return <CategoryIcon className="h-5 w-5" style={{ color: palette.accent }} />;
                            })()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-sm font-bold text-white">
                              {cat}
                            </h3>
                            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                              {skills.length} {skills.length === 1 ? "skill" : "skills"}
                            </p>
                          </div>
                          <GitBranch
                            className="h-4 w-4 shrink-0 opacity-70"
                            style={{ color: palette.accent }}
                          />
                        </div>

                        {/* Category-to-skill connector */}
                        <div
                          className="h-7 w-px"
                          style={{ backgroundColor: palette.border }}
                        />

                        {/* Skill leaf nodes */}
                        <div className="relative flex w-full max-w-[340px] flex-col gap-2.5 pl-5">
                          <div
                            className="absolute bottom-5 left-[7px] top-2 w-px"
                            style={{ backgroundColor: palette.border }}
                          />
                          {skills.map((skill) => (
                            <div
                              key={skill.id}
                              className="group relative flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-white/[0.09] bg-[#0b1220]/80 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                            >
                              <div
                                className="absolute -left-[13px] top-1/2 h-px w-3"
                                style={{ backgroundColor: palette.border }}
                              />
                              <div
                                className="absolute -left-[22px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#07111c]"
                                style={{
                                  backgroundColor: palette.accent,
                                  boxShadow: `0 0 10px ${palette.accent}`,
                                }}
                              />
                              <div className="flex min-w-0 items-center gap-2.5">
                                <CheckCircle2
                                  className="h-3.5 w-3.5 shrink-0"
                                  style={{ color: palette.accent }}
                                />
                                <span className="break-words text-xs font-semibold text-slate-200 transition-colors group-hover:text-white">
                                  {skill.name}
                                </span>
                              </div>
                              <span
                                className="shrink-0 font-mono text-[10px] font-bold"
                                style={{ color: palette.accent }}
                              >
                                {getPercentage(skill)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="mt-8 text-center text-sm text-slate-400">
                No technical skills have been added yet.
              </p>
            )}
          </section>

          {/* Divider between the two tree systems */}
          <div className="my-16 flex w-full max-w-md items-center gap-4 sm:my-20">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-purple-400/40" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
              <GitBranch className="h-4 w-4 text-slate-300" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-400/40 to-purple-400/40" />
          </div>

          {/* =========================================
              TREE 02 - TOOLS & TECH STACK
          ========================================= */}
          <section className="w-full" aria-labelledby="tools-stack-heading">
            {/* Second root node */}
            <div className="relative z-10 mx-auto flex w-fit flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/10 shadow-[0_0_35px_rgba(52,211,153,0.16)] backdrop-blur-xl sm:h-16 sm:w-16">
                {(() => {
                  const RootIcon = getSkillIcon(toolSkillsList[0]?.rootIcon, "Layers");
                  return <RootIcon className="h-7 w-7 text-emerald-200 sm:h-8 sm:w-8" />;
                })()}
              </div>
              <div className="rounded-2xl border border-white/15 bg-[#111827]/90 px-6 py-4 text-center shadow-[0_12px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-9">
                <h2
                  id="tools-stack-heading"
                  className="text-sm font-black uppercase tracking-[0.2em] text-white sm:text-base"
                >
                  Tools &amp; Tech Stack
                </h2>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-[10px]">
                  Tools · Platforms · Workflow
                </p>
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-emerald-300/70 to-white/20 sm:h-14" />
              <div className="h-2.5 w-2.5 rounded-full border-2 border-emerald-200 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
            </div>

            {toolCategories.length > 0 ? (
              <div className="relative grid grid-cols-1 gap-8 pt-7 sm:grid-cols-2 sm:gap-x-7 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
                <div className="absolute left-[16.66%] right-[16.66%] top-0 hidden h-px bg-gradient-to-r from-teal-400/40 via-violet-400/40 to-pink-400/40 lg:block" />
                {toolCategories.map((cat, index) => {
                  const palette = toolPalette[index % toolPalette.length];
                  const skills = toolGrouped[cat];
                  const IconBox = index % 3 === 0 ? Wrench : index % 3 === 1 ? Server : Terminal;

                  return (
                    <div key={cat} className="relative flex min-w-0 flex-col items-center">
                      <div
                        className="absolute -top-7 hidden h-7 w-px lg:block"
                        style={{ backgroundColor: palette.border }}
                      />
                      <div
                        className="absolute -top-[31px] hidden h-2 w-2 rounded-full lg:block"
                        style={{
                          backgroundColor: palette.accent,
                          boxShadow: `0 0 12px ${palette.accent}`,
                        }}
                      />

                      {/* Tool category node */}
                      <div
                        className="relative z-10 flex min-h-[76px] w-full max-w-[340px] items-center gap-4 rounded-2xl border px-5 py-4 shadow-[0_10px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                        style={{
                          backgroundColor: palette.soft,
                          borderColor: palette.border,
                          boxShadow: `0 10px 35px rgba(0,0,0,0.22), 0 0 24px ${palette.glow}`,
                        }}
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                          style={{
                            borderColor: palette.border,
                            backgroundColor: "rgba(255,255,255,0.06)",
                          }}
                        >
                          {categoryImages[`TOOL:${cat}`] ? (
                            <img src={categoryImages[`TOOL:${cat}`]} alt={`${cat} category`} className="h-full w-full rounded-lg object-cover" />
                          ) : (() => {
                            const CategoryIcon = getSkillIcon(skills[0]?.categoryIcon, IconBox.displayName || "Network");
                            return <CategoryIcon className="h-5 w-5" style={{ color: palette.accent }} />;
                          })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-bold text-white">
                            {cat}
                          </h3>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                            {skills.length} {skills.length === 1 ? "tool" : "tools"}
                          </p>
                        </div>
                        <GitBranch
                          className="h-4 w-4 shrink-0 opacity-70"
                          style={{ color: palette.accent }}
                        />
                      </div>

                      <div
                        className="h-7 w-px"
                        style={{ backgroundColor: palette.border }}
                      />

                      {/* Tool leaf nodes */}
                      <div className="relative flex w-full max-w-[340px] flex-col gap-2.5 pl-5">
                        <div
                          className="absolute bottom-5 left-[7px] top-2 w-px"
                          style={{ backgroundColor: palette.border }}
                        />
                        {skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="group relative flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-white/[0.09] bg-[#0b1220]/80 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                          >
                            <div
                              className="absolute -left-[13px] top-1/2 h-px w-3"
                              style={{ backgroundColor: palette.border }}
                            />
                            <div
                              className="absolute -left-[22px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#07111c]"
                              style={{
                                backgroundColor: palette.accent,
                                boxShadow: `0 0 10px ${palette.accent}`,
                              }}
                            />
                            <div className="flex min-w-0 items-center gap-2.5">
                              <CheckCircle2
                                className="h-3.5 w-3.5 shrink-0"
                                style={{ color: palette.accent }}
                              />
                              <span className="break-words text-xs font-semibold text-slate-200 transition-colors group-hover:text-white">
                                {skill.name}
                              </span>
                            </div>
                            <span
                              className="shrink-0 font-mono text-[10px] font-bold"
                              style={{ color: palette.accent }}
                            >
                              {getPercentage(skill)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-8 text-center text-sm text-slate-400">
                No tools or technologies have been added yet.
              </p>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
