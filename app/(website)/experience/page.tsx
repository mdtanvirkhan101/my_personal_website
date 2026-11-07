import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Clock,
  Award,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Work Experience & Training | MD Tanvir Khan",
  description:
    "Professional work history, network engineering milestones, VoIP deployments, and professional training by MD Tanvir Khan.",
};

const calculateDuration = (start: Date | null, end: Date | null, isCurrent?: boolean) => {
  if (!start) return "";
  const startDate = new Date(start);
  const endDate = isCurrent || !end ? new Date() : new Date(end);

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += previousMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  let durationStr = "";
  if (years > 0) durationStr += `${years} yr${years > 1 ? "s" : ""} `;
  if (months > 0) durationStr += `${months} mo${months > 1 ? "s" : ""} `;
  if (days > 0 && years === 0) durationStr += `${days} day${days > 1 ? "s" : ""}`;

  return durationStr.trim() || "0 days";
};

const getTotalWorkExperience = (experiences: Array<{
  startDate: Date | null;
  endDate: Date | null;
  current?: boolean | null;
  logoUrl?: string | null;
}>) => {
  const now = new Date();

  // Only paid/professional work entries count; training is excluded.
  // Use UTC day numbers to avoid daylight-saving/timezone rounding errors.
  const intervals = experiences
    .filter((exp) => exp.logoUrl !== "training" && exp.startDate)
    .map((exp) => {
      const startDate = new Date(exp.startDate as Date);
      const endDate =
        exp.current || !exp.endDate ? now : new Date(exp.endDate);

      const start = Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ) / 86400000;
      const end = Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
      ) / 86400000;

      return { start, end };
    })
    .filter(
      (interval) =>
        Number.isFinite(interval.start) &&
        Number.isFinite(interval.end) &&
        interval.end >= interval.start,
    )
    .sort((a, b) => a.start - b.start);

  if (intervals.length === 0) return "0 Years";

  // Merge overlapping or adjacent work periods to avoid double-counting.
  const merged: Array<{ start: number; end: number }> = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];

    if (last && interval.start <= last.end + 1) {
      last.end = Math.max(last.end, interval.end);
    } else {
      merged.push({ ...interval });
    }
  }

  const totalDays = merged.reduce(
    (total, interval) => total + interval.end - interval.start + 1,
    0,
  );

  if (totalDays <= 0) return "0 Years";

  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);

  if (years > 0) {
    return months > 0
      ? `${years}+ Years`
      : `${years} ${years === 1 ? "Year" : "Years"}`;
  }

  if (months > 0) {
    return `${months} ${months === 1 ? "Month" : "Months"}`;
  }

  return `${totalDays} ${totalDays === 1 ? "Day" : "Days"}`;
};

const formatExpDate = (date: Date | null, isCurrent?: boolean) => {
  if (isCurrent || !date) return "Present";
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export default async function ExperiencePage() {
  const dbExperiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
  });

  // Use database records only so the summary reflects the experiences managed in Admin.
  // An empty database therefore produces 0 Years instead of hard-coded sample experience.
  const rawExperiences = dbExperiences.map((e) => ({
    ...e,
    highlights:
      Array.isArray(e.attachments) && e.attachments.length > 0
        ? (e.attachments as string[])
        : e.description
          ? [e.description]
          : [],
    stack: ["Enterprise Networking", "Systems Architecture"],
  }));

  // Corrected Filtering based on logoUrl column storing "training" or "work"
  const workExperiences = rawExperiences.filter((exp: any) => exp.logoUrl !== "training");
  const trainingExperiences = rawExperiences.filter((exp: any) => exp.logoUrl === "training");
  const totalWorkExperience = getTotalWorkExperience(workExperiences);

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col overflow-x-hidden">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10 space-y-16">
        {/* Header & Metrics Banner */}
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Career Milestones &amp; Certifications</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Work Experience &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Training</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              A comprehensive record of professional engineering roles, specialized training programs, and hands-on system deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="group relative p-6 rounded-[2rem] bg-[#141444]/60 border border-purple-500/20 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 hover:border-cyan-500/30 transition-all duration-500 flex items-center space-x-6 overflow-hidden backdrop-blur-md">
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />

              <div className="w-16 h-16 rounded-2xl bg-[#0e0e34] border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-all duration-500 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)] z-10">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="z-10 flex flex-col space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-purple-300/70">
                  Total Work Experience
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-cyan-400 tracking-tight">
                  {totalWorkExperience}
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  (Engineering &amp; IT)
                </span>
              </div>
            </div>

            <div className="group relative p-6 rounded-[2rem] bg-[#141444]/60 border border-purple-500/20 shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-500 flex items-center space-x-6 overflow-hidden backdrop-blur-md">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />

              <div className="w-16 h-16 rounded-2xl bg-[#0e0e34] border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-all duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)] z-10">
                <Award className="w-7 h-7" />
              </div>
              <div className="z-10 flex flex-col space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-cyan-300/70">
                  Professional Training
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-400 tracking-tight">
                  IT Scholarship
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  (Network &amp; Systems Admin)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: WORK EXPERIENCE TIMELINE */}
        {workExperiences.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center space-x-3 pb-3 border-b border-purple-500/20">
              <div className="w-10 h-10 rounded-xl bg-[#141444] border border-purple-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-heading">
                  Work Experience
                </h2>
                <p className="text-xs text-slate-400">Professional engineering roles and hands-on system deployments.</p>
              </div>
            </div>

            <div className="relative border-l-2 border-purple-500/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
              {workExperiences.map((exp: any, idx: number) => (
                <div key={exp.id || idx} className="relative group">
                  <div
                    className={`absolute -left-[35px] sm:-left-[51px] top-1.5 w-6 h-6 rounded-full border-4 border-[#0e0e34] transition-all duration-300 ${exp.current
                      ? "bg-cyan-400 shadow-lg shadow-cyan-500/50 scale-110 animate-pulse"
                      : "bg-slate-800 group-hover:bg-purple-500"
                      }`}
                  />

                  <div className="rounded-3xl border border-purple-500/20 p-6 sm:p-8 bg-[#141444]/70 shadow-xl space-y-5 hover:border-purple-500/40 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-purple-500/20 pb-5">
                      <div className="space-y-1.5">
                        <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {exp.role}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-cyan-400 font-mono">
                          <Building className="w-4 h-4" />
                          <span className="font-bold tracking-wide">{exp.organization}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0 mt-2 md:mt-0">
                        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-mono font-bold tracking-wide">
                            {calculateDuration(exp.startDate, exp.endDate, exp.current)}
                          </span>
                        </div>

                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0e0e34] border border-cyan-500/30 text-cyan-50 shadow-inner">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-mono font-bold tracking-wide">
                            {formatExpDate(exp.startDate)} — {formatExpDate(exp.endDate, exp.current)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-sm text-slate-300/90 leading-relaxed font-medium">
                        {exp.description}
                      </p>
                    )}

                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider font-bold flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Key Responsibilities &amp; Deployments</span>
                      </div>
                      <ul className="space-y-3 text-sm text-slate-300/90">
                        {exp.highlights?.map((h: string, hIdx: number) => (
                          <li key={hIdx} className="flex items-start space-x-3">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {exp.stack && exp.stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {exp.stack.map((tech: string) => (
                          <span
                            key={tech}
                            className="text-[11px] font-mono text-slate-200 bg-[#0e0e34]/80 px-3 py-1.5 rounded-lg border border-purple-500/20 font-semibold shadow-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: PROFESSIONAL TRAINING TIMELINE */}
        {trainingExperiences.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-purple-500/20">
            <div className="flex items-center space-x-3 pb-3 border-b border-purple-500/20">
              <div className="w-10 h-10 rounded-xl bg-[#141444] border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-heading">
                  Professional Training
                </h2>
                <p className="text-xs text-slate-400">Specialized technical training and certification programs.</p>
              </div>
            </div>

            <div className="relative border-l-2 border-cyan-500/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
              {trainingExperiences.map((exp: any, idx: number) => (
                <div key={exp.id || idx} className="relative group">
                  <div
                    className={`absolute -left-[35px] sm:-left-[51px] top-1.5 w-6 h-6 rounded-full border-4 border-[#0e0e34] transition-all duration-300 bg-slate-800 group-hover:bg-cyan-500`}
                  />

                  <div className="rounded-3xl border border-cyan-500/20 p-6 sm:p-8 bg-[#141444]/70 shadow-xl space-y-5 hover:border-cyan-500/40 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-cyan-500/20 pb-5">
                      <div className="space-y-1.5">
                        <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {exp.role}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-purple-400 font-mono">
                          <Building className="w-4 h-4" />
                          <span className="font-bold tracking-wide">{exp.organization}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0 mt-2 md:mt-0">
                        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-mono font-bold tracking-wide">
                            {calculateDuration(exp.startDate, exp.endDate, exp.current)}
                          </span>
                        </div>

                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0e0e34] border border-purple-500/30 text-purple-50 shadow-inner">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-mono font-bold tracking-wide">
                            {formatExpDate(exp.startDate)} — {formatExpDate(exp.endDate, exp.current)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-sm text-slate-300/90 leading-relaxed font-medium">
                        {exp.description}
                      </p>
                    )}

                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] font-mono uppercase text-purple-400 tracking-wider font-bold flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>Key Skills Acquired</span>
                      </div>
                      <ul className="space-y-3 text-sm text-slate-300/90">
                        {exp.highlights?.map((h: string, hIdx: number) => (
                          <li key={hIdx} className="flex items-start space-x-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {exp.stack && exp.stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {exp.stack.map((tech: string) => (
                          <span
                            key={tech}
                            className="text-[11px] font-mono text-slate-200 bg-[#0e0e34]/80 px-3 py-1.5 rounded-lg border border-cyan-500/20 font-semibold shadow-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-[2.5rem] border border-purple-500/30 p-10 sm:p-14 bg-gradient-to-r from-[#141444] via-[#1a1a52] to-[#141444] text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>

          <h3 className="relative font-heading text-2xl sm:text-3xl font-bold text-white z-10">
            Interested in my network engineering skills for your enterprise?
          </h3>
          <p className="relative text-sm text-slate-300/90 max-w-xl mx-auto font-normal z-10 leading-relaxed">
            Review my complete career history on the interactive ATS-friendly resume page or download the verified PDF document.
          </p>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 z-10">
            <Link
              href="/resume"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center"
            >
              View Interactive Resume
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0e0e34] hover:bg-slate-800 border border-purple-500/50 text-sm font-bold text-slate-200 hover:text-white hover:-translate-y-1 transition-all flex items-center justify-center"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}