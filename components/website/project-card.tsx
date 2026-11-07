"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  Layers,
  Tag,
  CalendarDays,
  Boxes,
  Server,
  Sparkles,
} from "lucide-react";

export type ProjectCardData = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverUrl?: string | null;
  stack?: string[] | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  featured?: boolean;
  caseStudy?: unknown;
  category?: string;
  categoryLabel?: string;
  projectTypeLabel?: string;
  projectEnvironmentLabel?: string;
  completionDate?: string;
};

export type ProjectCardProps = {
  project: ProjectCardData;
  categoryLabel?: string;
};

function formatDate(value?: string) {
  if (!value) return "";

  // Handles both YYYY-MM-DD and full ISO timestamps safely.
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
  }).format(parsed);
}

export function ProjectCard({
  project,
  categoryLabel,
}: ProjectCardProps) {
  const category =
    categoryLabel ||
    project.categoryLabel ||
    project.category ||
    "Infrastructure Project";

  const technologies = Array.isArray(project.stack)
    ? project.stack.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    : [];

  const visibleTechnologies = technologies.slice(0, 5);
  const remainingTechnologies = Math.max(technologies.length - 5, 0);

  const hasCaseStudy = Boolean(project.caseStudy);

  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/20 bg-[#141444]/70 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-purple-500/10">
      <div>
        <Link
          href={`/projects/${project.slug}`}
          className="relative block aspect-video w-full overflow-hidden border-b border-purple-500/20 bg-[#0e0e34]"
          aria-label={`View ${project.title}`}
        >
          {project.coverUrl ? (
            <img
              src={project.coverUrl}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="space-y-2 text-center">
                <Layers className="mx-auto h-9 w-9 text-cyan-400/70" />
                <span className="block text-xs font-mono text-cyan-400/80">
                  Architecture Topology
                </span>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e0e34]/80 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/90 px-3 py-1 text-[10px] font-mono font-bold text-white shadow-lg backdrop-blur-md">
                <Sparkles className="h-3 w-3" />
                Featured Build
              </span>
            )}
          </div>

          {hasCaseStudy && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-cyan-600/90 px-2.5 py-1 text-[10px] font-mono font-bold text-white shadow-lg backdrop-blur-md">
              <Layers className="h-3 w-3" />
              Case Study
            </span>
          )}
        </Link>

        <div className="space-y-4 p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-cyan-300">
              <Tag className="mr-1 h-2.5 w-2.5 text-cyan-400" />
              {category}
            </span>

            {project.projectTypeLabel && (
              <span className="inline-flex items-center rounded-md border border-purple-500/25 bg-purple-500/10 px-2 py-1 text-[10px] font-mono text-purple-200">
                <Boxes className="mr-1 h-3 w-3" />
                {project.projectTypeLabel}
              </span>
            )}

            {project.projectEnvironmentLabel && (
              <span className="inline-flex items-center rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[10px] font-mono text-cyan-200">
                <Server className="mr-1 h-3 w-3" />
                {project.projectEnvironmentLabel}
              </span>
            )}

            {project.completionDate && (
              <span className="inline-flex items-center rounded-md border border-purple-500/20 bg-[#0e0e34] px-2 py-1 text-[10px] font-mono text-slate-400">
                <CalendarDays className="mr-1 h-3 w-3" />
                {formatDate(project.completionDate)}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-heading text-lg font-bold tracking-tight text-white transition-colors group-hover:text-cyan-400">
              <Link href={`/projects/${project.slug}`}>
                {project.title}
              </Link>
            </h3>

            <p className="line-clamp-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
              {project.summary}
            </p>
          </div>

          {visibleTechnologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleTechnologies.map((tech, index) => (
                <span
                  key={`${tech}-${index}`}
                  className="rounded-md border border-purple-500/20 bg-[#0e0e34] px-2.5 py-0.5 text-[11px] font-mono text-slate-300"
                >
                  {tech}
                </span>
              ))}

              {remainingTechnologies > 0 && (
                <span className="rounded-md border border-purple-500/20 bg-[#0e0e34] px-2.5 py-0.5 text-[11px] font-mono text-slate-500">
                  +{remainingTechnologies}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-purple-500/20 px-6 pb-5 pt-4">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-heading font-bold text-cyan-400 transition-colors hover:text-white"
        >
          <span>View Project Specs</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>

        <div className="flex items-center gap-1">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label={`${project.title} GitHub repository`}
              title="GitHub Repository"
            >
              <Github className="h-4 w-4" />
            </a>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-cyan-400"
              aria-label={`${project.title} live project`}
              title="Live Project"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
