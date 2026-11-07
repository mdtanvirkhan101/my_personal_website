import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { AnimatedStatCard } from "@/components/website/animated-stat-card";
import { prisma } from "@/lib/prisma";
import {
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  Network,
  Lock,
  Server,
  FolderLock,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  BadgeCheck,
  Target,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const [titleSetting, descriptionSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "certificationPageSeoTitle" } }),
    prisma.siteSetting.findUnique({ where: { key: "certificationPageMetaDescription" } }),
  ]);
  return {
    title: typeof titleSetting?.value === "string" && titleSetting.value
      ? titleSetting.value
      : "Certifications & Credentials | MD Tanvir Khan",
    description: typeof descriptionSetting?.value === "string" && descriptionSetting.value
      ? descriptionSetting.value
      : "Professional certifications and technical learning in networking, cybersecurity, systems infrastructure, and software development.",
  };
}

type Certification = {
  id: string;
  name: string;
  issuer: string;
  category: string;
  credentialUrl?: string | null;
  issuedAt?: Date | string | null;
  skills?: string[] | null;
  logo?: string | null;
  imageUrl?: string | null;
};

const categories = [
  {
    key: "Network Engineering",
    id: "network-engineering",
    title: "Network Engineering",
    icon: Network,
    desc: "Routing, switching, enterprise topologies, and network hardware.",
  },
  {
    key: "Cybersecurity & Firewalls",
    id: "cybersecurity-firewalls",
    title: "Cybersecurity & Firewalls",
    icon: Lock,
    desc: "Perimeter security, next-generation firewalls, and ethical hacking.",
  },
  {
    key: "Systems & Infrastructure",
    id: "systems-infrastructure",
    title: "Systems & Infrastructure",
    icon: Server,
    desc: "Cloud architecture, Linux systems, and container infrastructure.",
  },
  {
    key: "Others & Specialized",
    id: "others-specialized",
    title: "Others & Specialized",
    icon: FolderLock,
    desc: "Database architecture, frontend engineering, and specialized skills.",
  },
];

function belongsToCategory(cert: Certification, categoryKey: string) {
  const category = (cert.category || "").toLowerCase();
  if (category === categoryKey.toLowerCase()) return true;
  const name = (cert.name || "").toLowerCase();
  const issuer = (cert.issuer || "").toLowerCase();
  const isNetwork =
    category.includes("network") ||
    ["ccna", "ccnp", "mikrotik", "mtcna", "grandstream", "ruijie", "rcna", "routing"].some((term) => name.includes(term)) ||
    ["cisco", "mikrotik", "grandstream", "ruijie"].some((term) => issuer.includes(term));
  const isSecurity =
    category.includes("cybersecurity") || category.includes("security") ||
    ["fortinet", "fcac", "ceh", "security+", "cyber", "firewall"].some((term) => name.includes(term)) ||
    ["fortinet", "ec-council", "comptia"].some((term) => issuer.includes(term));
  const isSystems =
    category.includes("systems") ||
    ["aws", "kubernetes", "rhcsa", "google", "linux", "server", "cloud"].some((term) => name.includes(term)) ||
    ["amazon", "red hat", "linux foundation", "google"].some((term) => issuer.includes(term));

  if (categoryKey === "Network Engineering") return isNetwork;
  if (categoryKey === "Cybersecurity & Firewalls") return isSecurity && !isNetwork;
  if (categoryKey === "Systems & Infrastructure") return isSystems && !isNetwork && !isSecurity;
  return !isNetwork && !isSecurity && !isSystems;
}

function formatYear(value?: Date | string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
}

function CertificationCard({ cert }: { cert: Certification }) {
  const logo = cert.imageUrl || cert.logo;
  const year = formatYear(cert.issuedAt);

  return (
    <article className="group flex h-full flex-col justify-between space-y-5 rounded-2xl border border-purple-500/20 bg-[#141444]/70 p-5 shadow-xl transition-all duration-300 hover:border-purple-400/50 hover:shadow-purple-500/10 sm:p-6 w-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-[#0e0e34] p-2 shadow-inner transition-transform group-hover:scale-105">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={`${cert.issuer} logo`} className="h-full w-full object-contain" />
            ) : (
              <Award className="h-5 w-5 text-cyan-400" />
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-[#0e0e34] px-2.5 py-1 font-mono text-[10px] font-semibold text-cyan-300">
            <ShieldCheck className="h-3 w-3" /> Credential
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-400">
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{cert.issuer}</span>
          </div>
          <h3 className="font-heading text-base font-bold leading-snug text-white line-clamp-2">{cert.name}</h3>
          <p className="text-xs text-slate-400 truncate">{cert.category}</p>
        </div>

        {cert.skills && cert.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {cert.skills.map((skill) => (
              <span key={skill} className="rounded-md border border-purple-500/20 bg-[#0e0e34] px-2 py-1 font-mono text-[10px] text-slate-300">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-purple-500/20 pt-3 text-xs mt-auto">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
          <span>{year ? `Issued ${year}` : "Issue date not listed"}</span>
        </div>
        {cert.credentialUrl && (
          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 transition-colors hover:text-cyan-200 hover:underline">
            Verify <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export default async function CertificationsPage() {
  const [dbCerts, settingsRows] = await Promise.all([
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "certificationPageFeaturedIds",
            "certificationPageHeroBadge",
            "certificationPageHeroTitle",
            "certificationPageHeroDescription",
            "certificationPageExploreLabel",
            "certificationPageCategoriesLabel",
            "certificationPageShowHero",
            "certificationPageShowStats",
            "certificationPageShowFeatured",
            "certificationPageShowCategories",
            "certificationPageShowAllCerts",
            "certificationPageShowAchievements",
            "certificationPageShowLearning",
            "certificationPageAchievements",
            "certificationPageLearningItems",
          ],
        },
      },
    }),
  ]);
  const pageSettings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value])) as Record<string, any>;
  const allCerts: Certification[] = dbCerts as Certification[];
  const savedFeaturedIds: string[] = Array.isArray(pageSettings.certificationPageFeaturedIds)
    ? pageSettings.certificationPageFeaturedIds
    : [];
  const hasSavedFeaturedSelection = settingsRows.some((row) => row.key === "certificationPageFeaturedIds");
  const featuredCerts = hasSavedFeaturedSelection
    ? savedFeaturedIds.map((id) => allCerts.find((cert) => cert.id === id)).filter(Boolean) as Certification[]
    : [...allCerts].sort((a, b) => (formatYear(b.issuedAt) ?? 0) - (formatYear(a.issuedAt) ?? 0)).slice(0, 3);
  const achievements = Array.isArray(pageSettings.certificationPageAchievements)
    ? pageSettings.certificationPageAchievements
    : [];
  const learningItems = Array.isArray(pageSettings.certificationPageLearningItems)
    ? pageSettings.certificationPageLearningItems
    : [];
  const pageCategories = Array.isArray(pageSettings.certificationPageCategories)
    ? pageSettings.certificationPageCategories.map((item: any) => {
      const name = typeof item === "string" ? item : item.name;
      const existing = categories.find((category) => category.key === name || category.title === name);
      const slug = String(typeof item === "string" ? item : item.id || name)
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return existing
        ? { ...existing, key: name, title: name }
        : { key: name, id: slug, title: name, icon: FolderLock, desc: "Explore credentials in this category." };
    })
    : categories;
  const organizations = new Set(allCerts.map((cert) => cert.issuer).filter(Boolean));
  const skillSet = new Set(allCerts.flatMap((cert) => cert.skills ?? []));

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0e0e34] text-slate-300 selection:bg-purple-500/40 selection:text-white">
      <PremiumBackground />
      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-[1720px] flex-1 space-y-14 px-4 py-10 sm:space-y-16 sm:px-6 sm:py-16 lg:px-8">
        {/* 1. HERO SECTION */}
        {pageSettings.certificationPageShowHero !== false && (<>

          <section className="max-w-3xl space-y-5" aria-labelledby="certifications-heading">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>{pageSettings.certificationPageHeroBadge ?? "Professional Development & Credentials"}</span>
            </div>
            <h1 id="certifications-heading" className="font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {String(pageSettings.certificationPageHeroTitle ?? "Professional Certifications").split(" ").slice(0, -1).join(" ")} <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">{String(pageSettings.certificationPageHeroTitle ?? "Professional Certifications").split(" ").slice(-1).join("")}</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {pageSettings.certificationPageHeroDescription ?? "A collection of technical credentials, professional learning, and specialized skills across networking, cybersecurity, cloud infrastructure, and software development."}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href="#all-certifications" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:brightness-110">
                {pageSettings.certificationPageExploreLabel ?? "Explore Certifications"} <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href="#certification-categories" className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-[#141444]/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-300">
                {pageSettings.certificationPageCategoriesLabel ?? "Browse Categories"}
              </a>
            </div>
          </section>


        </>)}

        {/* 2. CERTIFICATION STATISTICS */}
        {pageSettings.certificationPageShowStats !== false && (<>

          <section className="space-y-5" aria-labelledby="statistics-heading">
            <SectionHeading eyebrow="AT A GLANCE" title="Certification Overview" description="A snapshot of the credentials and technical topics represented here." />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <AnimatedStatCard icon={<Award className="h-5 w-5" />} value={allCerts.length} label="Listed Credentials" />
              <AnimatedStatCard icon={<Building className="h-5 w-5" />} value={organizations.size} label="Issuing Organizations" />
              <AnimatedStatCard icon={<Network className="h-5 w-5" />} value={pageCategories.filter((category) => allCerts.some((cert) => belongsToCategory(cert, category.key))).length} label="Technical Categories" />
              <AnimatedStatCard icon={<BadgeCheck className="h-5 w-5" />} value={skillSet.size} label="Skill Tags" />
            </div>
          </section>


        </>)}

        {/* 3. FEATURED CERTIFICATIONS */}
        {pageSettings.certificationPageShowFeatured !== false && (<>

          <section className="space-y-5" aria-labelledby="featured-heading">
            <SectionHeading eyebrow="HIGHLIGHTS" title="Featured Certifications" description="A quick look at selected credentials from the collection." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCerts.map((cert) => <CertificationCard key={cert.id} cert={cert} />)}
            </div>
          </section>



        </>)}

        {/* 5. ALL CERTIFICATIONS */}
        {pageSettings.certificationPageShowAllCerts !== false && (<>

          <section id="all-certifications" className="scroll-mt-24 space-y-12" aria-labelledby="all-certifications-heading">
            <SectionHeading eyebrow="THE FULL COLLECTION" title="All Certifications" description="Browse the full list, organized by technical domain." />
            {pageCategories.map((category) => {
              const certs = allCerts.filter((cert) => belongsToCategory(cert, category.key));
              if (certs.length === 0) return null;
              const Icon = category.icon;
              return (
                <div key={category.key} id={category.id} className="scroll-mt-24 space-y-5">
                  <div className="flex flex-col gap-3 border-b border-purple-500/20 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/30 bg-[#141444] text-cyan-400"><Icon className="h-5 w-5" /></div>
                      <div><h3 className="font-heading text-lg font-bold text-white">{category.title}</h3><p className="mt-0.5 text-xs text-slate-400">{category.desc}</p></div>
                    </div>
                    {/* Dynamic certificate counts next to category name */}
                    <span className="w-fit rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 font-mono text-xs text-cyan-300">
                      {certs.length} {certs.length === 1 ? "certificate" : "certificates"}
                    </span>
                  </div>
                  {/* Strict 3 cards per row responsive grid layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
                    {certs.map((cert) => <CertificationCard key={cert.id} cert={cert} />)}
                  </div>
                </div>
              );
            })}
          </section>


        </>)}

        {/* 6. LEARNING & ACHIEVEMENTS */}
        {pageSettings.certificationPageShowAchievements !== false && (<>

          <section className="space-y-5" aria-labelledby="learning-achievements-heading">
            <SectionHeading eyebrow="GROWTH & PROGRESS" title="Learning & Achievements" description="Technical areas reflected in this certification collection." />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(achievements.length ? achievements : [
                { id: "network", title: "Network Foundations", description: "Routing, switching, subnetting, and enterprise network operations." },
                { id: "security", title: "Security Practices", description: "Firewall concepts, access control, threat awareness, and security testing." },
                { id: "infrastructure", title: "Infrastructure & Cloud", description: "Linux administration, cloud services, containers, and deployment concepts." },
              ]).map((item: any, index: number) => (
                <AchievementCard key={item.id ?? item.title} icon={index === 0 ? <Network className="h-5 w-5" /> : index === 1 ? <ShieldCheck className="h-5 w-5" /> : <Server className="h-5 w-5" />} title={item.title} text={item.description ?? item.text ?? ""} />
              ))}
            </div>
          </section>


        </>)}

        {/* 7. CURRENTLY LEARNING */}
        {pageSettings.certificationPageShowLearning !== false && (<>

          <section className="space-y-5" aria-labelledby="currently-learning-heading">
            <SectionHeading eyebrow="KEEP MOVING FORWARD" title="Currently Learning" description="Use this section to highlight courses and certifications you are actively working toward." />
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-[#171747]/95 via-[#141444]/90 to-[#0e0e34]/95 p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />
              <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2">
                {learningItems.length ? learningItems.map((item: any) => (
                  <div key={item.id ?? item.title} className="rounded-2xl border border-purple-500/20 bg-[#0e0e34]/70 p-4">
                    <div className="flex items-start gap-3"><BookOpen className="mt-1 h-5 w-5 shrink-0 text-cyan-300" /><div className="min-w-0"><h3 className="font-heading text-base font-bold text-white">{item.title}</h3><p className="mt-1 text-xs text-slate-400">{item.provider || "Provider not specified"} · {item.status}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(0, Math.min(100, Number(item.progress) || 0))}%` }} /></div><p className="mt-1 text-right text-[10px] text-slate-500">{Math.max(0, Math.min(100, Number(item.progress) || 0))}%</p>{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400">Open course <ExternalLink className="h-3 w-3" /></a>}</div></div>
                  </div>
                )) : <div className="flex items-center gap-4"><GraduationCap className="h-8 w-8 text-purple-300" /><p className="text-sm text-slate-400">No current learning items have been published yet.</p></div>}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-purple-500/15 bg-[#141444]/40 p-4 text-xs leading-relaxed text-slate-400"><Target className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /><p><span className="font-semibold text-slate-200">Tip:</span> Only mark a certification as completed after you have earned it. Use official verification links wherever available.</p></div>
          </section>

        </>)}

      </main>

      <Footer />
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl space-y-2">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">{eyebrow}</p>
      <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-purple-500/20 bg-[#141444]/65 p-4 sm:p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/25 bg-[#0e0e34] text-cyan-400">{icon}</div>
      <p className="font-heading text-2xl font-bold text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function AchievementCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-purple-500/20 bg-[#141444]/65 p-5 transition hover:border-purple-400/40">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/25 bg-[#0e0e34] text-cyan-400">{icon}</div>
      <h3 className="font-heading text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
    </article>
  );
}