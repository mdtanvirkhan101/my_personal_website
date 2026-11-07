import { prisma } from "@/lib/prisma";
import { getHomePageConfig } from "@/actions/home-page";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { AIAssistantWidget } from "@/components/website/ai-assistant-widget";
import { PremiumBackground } from "@/components/website/premium-background";
import { AnimatedCounter } from "@/components/website/animated-counter";
import { ContactForm } from "@/components/website/contact-form";
import { CyberNetwork3D } from "@/components/website/cyber-network-3d";
import Link from "next/link";
import {
  ArrowUpRight,
  FolderGit2,
  Code2,
  Layers,
  ExternalLink,
  Users,
  Award,
  FlaskConical,
  CheckCircle2,
  Phone,
  User,
  Github,
  Linkedin,
  Twitter,
  CheckCircle,
  Network,
  ShieldCheck,
  Lock,
  Server,
  Terminal,
  Cpu,
  Activity,
  Database,
  Radio,
  Workflow,
  Wrench,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const homeConfig = await getHomePageConfig();

  const [
    profile,
    projects,
    skills,
    services,
    experiences,
    labs,
    certifications,
    testimonials,
    blogPosts,
    settings,
  ] = await Promise.all([
    prisma.profile.findFirst({ where: { id: "default-owner-profile" } }).then((p) => p || prisma.profile.findFirst()),
    prisma.project.findMany({
      where: { status: "PUBLISHED" },
      include: { caseStudy: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: homeConfig.projectsLimit || 4,
    }),
    prisma.skill.findMany({
      where: { level: { not: 0 } },
      orderBy: [{ sortOrder: "asc" }, { percentage: "desc" }, { name: "asc" }],
      take: homeConfig.skillsLimit || 12,
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: homeConfig.servicesLimit || 4,
    }),
    prisma.experience.findMany({
      orderBy: { startDate: "desc" },
      take: homeConfig.experiencesLimit || 3,
    }),
    prisma.lab.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: homeConfig.labsLimit || 3,
    }),
    prisma.certification.findMany({
      orderBy: { sortOrder: "asc" },
      take: homeConfig.certificationsLimit || 3,
    }),
    prisma.testimonial.findMany({
      where: { featured: true },
      include: { client: true },
      take: 3,
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: homeConfig.blogPostsLimit || 3,
    }),
    prisma.siteSetting.findMany(),
  ]);

  const siteSettings = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const name = profile?.name || "MD Tanvir Khan";
  const bio = profile?.bio || homeConfig.heroDescription;
  const phone =
    siteSettings["contact_phone"] ||
    siteSettings["whatsapp_number"] ||
    ((profile?.socialLinks as any)?.phone) ||
    "+8801601501775";

  const avatarUrl =
    homeConfig.heroAvatarUrl ||
    profile?.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="min-h-screen bg-[#0e0e34] text-[#F7F6F7] relative selection:bg-purple-500/40 selection:text-white overflow-x-hidden flex flex-col font-sans">
      {/* 1. Living Background Mesh */}
      <PremiumBackground />

      {/* 2. Navigation Bar */}
      <Navbar />

      {/* 3. Main Content Flow */}
      <main className="flex-1 relative z-10 space-y-16 sm:space-y-24 pt-8">

        {/* ======================================================== */}
        {/* 1. HERO SECTION                                          */}
        {/* ======================================================== */}
        {homeConfig.showHero && (
          <section id="home" className="relative pt-12 sm:pt-20 pb-10 max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Info Column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141444] border border-purple-500/30 text-xs font-mono text-purple-300">
                  <span>{homeConfig.heroGreeting}</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                    {homeConfig.heroName}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
                      {homeConfig.heroNameHighlight}
                    </span>
                  </h1>
                  <h2 className="text-lg sm:text-xl font-mono text-cyan-400 font-bold">
                    {homeConfig.heroRole}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed pt-2">
                    {homeConfig.heroDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href={homeConfig.heroPrimaryBtnUrl || "#contact"}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center space-x-2"
                  >
                    <span>{homeConfig.heroPrimaryBtnText}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={homeConfig.heroSecondaryBtnUrl || "#projects"}
                    className="px-6 py-3.5 rounded-2xl bg-[#141444] hover:bg-[#1a1a4a] border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center space-x-2"
                  >
                    <FolderGit2 className="w-4 h-4 text-cyan-400" />
                    <span>{homeConfig.heroSecondaryBtnText}</span>
                  </Link>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center lg:justify-start space-x-4 pt-4 text-slate-400 text-xs font-mono">
                  <span>{homeConfig.heroSocialText}</span>
                  <div className="flex items-center space-x-3 text-slate-300">
                    <a
                      href={siteSettings["github_url"] || "https://github.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-purple-400 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href={siteSettings["linkedin_url"] || "https://linkedin.com/in/mdtanvirkhan101/"}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-purple-400 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href={siteSettings["twitter_url"] || "https://twitter.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-purple-400 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right 3D Interactive Column */}
              <div className="lg:col-span-5 flex justify-center relative">
                <CyberNetwork3D
                  centerImage={avatarUrl}
                  centerTitle={name}
                  badge1Value={homeConfig.heroBadge1Value}
                  badge1Label={homeConfig.heroBadge1Label}
                  badge2Value={homeConfig.heroBadge2Value}
                  badge2Label={homeConfig.heroBadge2Label}
                />
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 2. SUMMARY / METRICS STRIP                               */}
        {/* ======================================================== */}
        {homeConfig.showMetrics && (
          <section className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="rounded-3xl bg-[#141444]/80 border border-purple-500/25 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="text-left font-mono">
                  <AnimatedCounter
                    target={homeConfig.metric1Value}
                    suffix={homeConfig.metric1Suffix}
                    className="text-xl font-bold text-white"
                  />
                  <div className="text-[10px] text-slate-400 uppercase">
                    {homeConfig.metric1Label}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-left font-mono">
                  <AnimatedCounter
                    target={homeConfig.metric2Value}
                    suffix={homeConfig.metric2Suffix}
                    className="text-xl font-bold text-white"
                  />
                  <div className="text-[10px] text-slate-400 uppercase">
                    {homeConfig.metric2Label}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left font-mono">
                  <AnimatedCounter
                    target={homeConfig.metric3Value}
                    suffix={homeConfig.metric3Suffix}
                    className="text-xl font-bold text-white"
                  />
                  <div className="text-[10px] text-slate-400 uppercase">
                    {homeConfig.metric3Label}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-left font-mono">
                  <AnimatedCounter
                    target={homeConfig.metric4Value}
                    suffix={homeConfig.metric4Suffix}
                    className="text-xl font-bold text-white"
                  />
                  <div className="text-[10px] text-slate-400 uppercase">
                    {homeConfig.metric4Label}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 3. ABOUT ME                                              */}
        {/* ======================================================== */}
        {homeConfig.showAbout && (
          <section id="about" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 w-full">
            <div className="border-b border-purple-500/20 pb-3">
              <h2 className="font-heading text-3xl font-bold text-white">
                {homeConfig.aboutTitle}
              </h2>
            </div>
            <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-8 space-y-6">
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal text-justify">
                {bio}
              </p>
              <div>
                <Link
                  href="/about"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#141444] border border-purple-500/30 text-xs font-mono font-bold text-purple-300 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{homeConfig.aboutButtonText}</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 4. SERVICES / WHAT I DO                                  */}
        {/* ======================================================== */}
        {homeConfig.showServices && (
          <section id="services" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-purple-500/20 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
                  {homeConfig.servicesBadge || "ENGINEERING OFFERINGS"}
                </span>
                <h2 className="font-heading text-3xl font-bold text-white">
                  {homeConfig.servicesTitle || "Services & Solutions"}
                </h2>
              </div>
              <Link
                href="/services"
                className="text-xs font-mono font-bold text-purple-400 hover:text-white flex items-center space-x-1 transition-colors"
              >
                <span>View Full Service Catalog</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv, idx) => {
                const iconName = (srv.icon || "").toLowerCase();
                const renderIcon = () => {
                  switch (iconName) {
                    case "network": return <Network className="w-6 h-6 text-cyan-400" />;
                    case "radio": return <Radio className="w-6 h-6 text-purple-400" />;
                    case "security":
                    case "shieldcheck": return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
                    case "lock": return <Lock className="w-6 h-6 text-emerald-400" />;
                    case "server": return <Server className="w-6 h-6 text-cyan-400" />;
                    case "terminal": return <Terminal className="w-6 h-6 text-amber-400" />;
                    case "cpu": return <Cpu className="w-6 h-6 text-cyan-400" />;
                    case "activity": return <Activity className="w-6 h-6 text-rose-400" />;
                    case "database": return <Database className="w-6 h-6 text-purple-400" />;
                    case "workflow": return <Workflow className="w-6 h-6 text-indigo-400" />;
                    case "wrench": return <Wrench className="w-6 h-6 text-amber-400" />;
                    case "code": return <Code2 className="w-6 h-6 text-cyan-400" />;
                    default: return <Layers className="w-6 h-6 text-purple-400" />;
                  }
                };

                const tags = Array.isArray(srv.attachments) ? (srv.attachments as string[]) : [];

                return (
                  <div
                    key={srv.id}
                    className="rounded-3xl bg-[#0e0e34]/90 border border-purple-500/25 hover:border-cyan-400/50 p-6 sm:p-7 space-y-5 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[#141444] border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                          {renderIcon()}
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 uppercase tracking-wider">
                          {srv.category || "SERVICE"}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {srv.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed font-normal line-clamp-3">
                        {srv.description}
                      </p>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#141444] text-slate-300 border border-slate-700/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between">
                      <Link
                        href={`/services#${srv.slug || srv.id}`}
                        className="text-xs font-mono font-bold text-cyan-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Learn More</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/contact?subject=${encodeURIComponent(srv.title)}`}
                        className="text-xs font-mono text-purple-400 hover:text-purple-200"
                      >
                        Request Quote &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 5. FEATURED PROJECTS                                     */}
        {/* ======================================================== */}
        {homeConfig.showProjects && (
          <section id="projects" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8 w-full">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="font-heading text-3xl font-bold text-white">
                {homeConfig.projectsTitle}
              </h2>
              <Link
                href="/projects"
                className="text-xs font-mono font-bold text-purple-400 hover:text-white flex items-center space-x-1"
              >
                <span>{homeConfig.projectsLinkText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 overflow-hidden flex flex-col justify-between p-5 space-y-4 hover:border-purple-400 transition-all"
                >
                  <div className="space-y-3">
                    <div className="aspect-video w-full rounded-2xl bg-[#141444] overflow-hidden border border-slate-800">
                      {project.coverUrl ? (
                        <img
                          src={project.coverUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500">
                          [Project Preview]
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-bold text-white">{project.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{project.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-xs font-mono text-cyan-400 hover:text-white flex items-center space-x-1"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/case-studies/${project.slug}`}
                      className="text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Case Study
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 6. MY SKILLS & ACCREDITED CERTIFICATIONS                */}
        {/* ======================================================== */}
        <section id="skills-certifications" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12 w-full">

          {/* Skills Subsection */}
          {homeConfig.showSkills && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <h2 className="font-heading text-3xl font-bold text-white">
                  {homeConfig.skillsTitle || "My Skills"}
                </h2>
                <Link href="/skills" className="text-xs font-mono text-purple-400 hover:text-white">
                  View All Skills &rarr;
                </Link>
              </div>
              <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {skills.map((sk) => {
                    const rawPct = sk.percentage != null && sk.percentage > 0 ? sk.percentage : (sk.level != null && sk.level > 2 ? Math.min(100, sk.level * 20) : 85);
                    const pct = `${rawPct}%`;
                    return (
                      <div
                        key={sk.id}
                        className="space-y-2.5 font-mono text-xs bg-[#141444]/60 hover:bg-[#141444] p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between text-slate-300">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white truncate block">{sk.name}</span>
                            {sk.category && (
                              <span className="text-[10px] text-slate-400 block truncate">{sk.category}</span>
                            )}
                          </div>
                          <span className="text-cyan-400 font-bold shrink-0 text-xs">{pct}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0a0a24] overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: pct }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Accredited Certifications Subsection */}
          {homeConfig.showCertifications && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h2 className="font-heading text-2xl font-bold text-white">
                    {homeConfig.certificationsTitle || "Accredited Certifications"}
                  </h2>
                </div>
                <Link href="/certifications" className="text-xs font-mono text-purple-400 hover:text-white">
                  View All Credentials &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 space-y-3 hover:border-purple-400 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                        {cert.issuer}
                      </span>
                      <h3 className="font-heading text-base font-bold text-white">{cert.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {cert.issuedAt ? `Issued: ${new Date(cert.issuedAt).getFullYear()}` : "Certified"}
                      </p>
                    </div>
                    {cert.credentialUrl && (
                      <div className="pt-2">
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-mono text-purple-400 hover:text-white"
                        >
                          <span>Verify Credential</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* ======================================================== */}
        {/* 7. EXPERIENCE TIMELINE                                   */}
        {/* ======================================================== */}
        {homeConfig.showExperience && (
          <section id="experience" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 w-full">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="font-heading text-2xl font-bold text-white">
                {homeConfig.experienceTitle || "Experience Timeline"}
              </h2>
              <Link href="/experience" className="text-xs font-mono text-purple-400 hover:text-white">
                View Full Timeline &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 space-y-3 relative hover:border-purple-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-[#0e0e34]" />
                      <h3 className="font-heading text-base font-bold text-white">
                        {exp.role} <span className="text-purple-400">@ {exp.organization}</span>
                      </h3>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">
                      {new Date(exp.startDate).getFullYear()} -{" "}
                      {exp.endDate ? new Date(exp.endDate).getFullYear() : "Present"}
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 8. R&D SANDBOX LABS                                      */}
        {/* ======================================================== */}
        {homeConfig.showLabs && (
          <section id="labs" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 w-full">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-cyan-400" />
                <h2 className="font-heading text-2xl font-bold text-white">
                  {homeConfig.labsTitle || "R&D Sandbox Labs"}
                </h2>
              </div>
              <Link href="/labs" className="text-xs font-mono text-cyan-400 hover:text-white">
                View All Labs &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <div
                  key={lab.id}
                  className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 space-y-3 hover:border-purple-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h3 className="font-heading text-base font-bold text-white">{lab.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {lab.description}
                    </p>
                  </div>
                  {lab.demoUrl && (
                    <div className="pt-2">
                      <a
                        href={lab.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-white"
                      >
                        <span>Launch Sandbox</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 9. WHAT CLIENTS SAY                                      */}
        {/* ======================================================== */}
        {homeConfig.showClients && (
          <section id="clients" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 w-full">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="font-heading text-2xl font-bold text-white">
                {homeConfig.clientsTitle || "What Clients Say"}
              </h2>
              <Link href="/clients" className="text-xs font-mono text-purple-400 hover:text-white">
                View All Reviews &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 space-y-4 hover:border-purple-400 transition-all flex flex-col justify-between"
                >
                  <p className="text-xs text-[#d1d5db] italic leading-relaxed">
                    &quot;{t.content}&quot;
                  </p>
                  <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-xs">
                      {t.clientName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{t.clientName}</div>
                      <div className="text-[10px] text-slate-400">
                        {t.role || ""}
                        {t.client?.name ? `, ${t.client.name}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 10. LATEST BLOG POSTS                                    */}
        {/* ======================================================== */}
        {homeConfig.showBlog && (
          <section id="blog" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 w-full">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="font-heading text-2xl font-bold text-white">
                {homeConfig.blogTitle || "Latest Blog Posts"}
              </h2>
              <Link href="/blog" className="text-xs font-mono text-purple-400 hover:text-white">
                View All Posts &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 flex flex-col justify-between hover:border-purple-400 transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="text-[10px] text-cyan-400 font-mono">
                      {formatDate(post.createdAt)}
                    </div>
                    <h3 className="text-sm font-bold text-white hover:text-purple-300">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                  </div>
                  <div className="flex justify-end pt-2">
                    <ArrowUpRight className="w-4 h-4 text-purple-400" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 11. CONTACT SECTION                                      */}
        {/* ======================================================== */}
        {homeConfig.showContact && (
          <section id="contact" className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-16 w-full">
            <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                {/* Left Column: Form */}
                <div className="lg:col-span-6 bg-[#141444]/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-white">
                      {homeConfig.contactFormTitle}
                    </h3>
                  </div>

                  <ContactForm />
                </div>

                {/* Right Column: Title, Bullet Points, and Owner Profile Card */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">
                      {homeConfig.contactBadge}
                    </span>
                    <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white">
                      {homeConfig.contactTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      {homeConfig.contactDescription}
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 font-mono">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>{homeConfig.contactBullet1}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>{homeConfig.contactBullet2}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>{homeConfig.contactBullet3}</span>
                    </li>
                  </ul>

                  {/* Owner Profile Card */}
                  <div className="pt-4 flex items-center space-x-4 border-t border-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center overflow-hidden">
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-white font-bold text-sm">{name}</div>
                      <div className="text-slate-400 text-[11px]">{homeConfig.heroRole}</div>
                      <div className="flex items-center space-x-2 text-cyan-400 pt-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{phone}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </section>
        )}

      </main>

      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget />

      {/* Production Footer */}
      <Footer />
    </div>
  );
}
