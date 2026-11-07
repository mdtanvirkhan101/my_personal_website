import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getRecentVisitorLogs } from "@/actions/network-telemetry";
import { VisitorTelemetryTable } from "@/components/admin/visitor-telemetry-table";
import Link from "next/link";
import {
  FolderGit2,
  Layers,
  Mail,
  Wrench,
  Briefcase,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Clock,
  Users,
  Award,
  BookOpen,
  Building2,
  FlaskConical,
  FileText,
  History,
  Zap,
  TrendingUp,
  Activity,
  Home,
  Sparkles,
  Globe,
  Radio,
  Server,
  Network,
  Cpu,
  RefreshCw,
  Database,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Settings,
  HardDrive,
  Bot,
  UserCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await getAdminSession();

  const [
    totalProjects,
    publishedProjects,
    totalCaseStudies,
    totalSkills,
    totalServices,
    unreadMessages,
    totalExperiences,
    totalCertifications,
    totalBlogPosts,
    totalClients,
    totalLabs,
    recentProjects,
    recentMessages,
    totalUsers,
    recentVisitors,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.caseStudy.count(),
    prisma.skill.count(),
    prisma.service.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.experience.count(),
    prisma.certification.count(),
    prisma.blogPost.count(),
    prisma.client.count(),
    prisma.lab.count(),
    prisma.project.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.adminUser.count(),
    getRecentVisitorLogs(),
  ]);

  const kpiCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      sub: `${publishedProjects} Active on live site`,
      subColor: "text-emerald-400",
      icon: FolderGit2,
      iconColor: "text-cyan-400",
      iconBg: "from-cyan-600/20 to-blue-600/20",
      iconBorder: "border-cyan-500/30",
      href: "/admin/projects",
      glow: "rgba(34, 211, 238, 0.2)",
    },
    {
      label: "Case Studies",
      value: totalCaseStudies,
      sub: "In-depth architectures →",
      subColor: "text-purple-300",
      icon: Layers,
      iconColor: "text-purple-300",
      iconBg: "from-purple-600/20 to-indigo-600/20",
      iconBorder: "border-purple-500/30",
      href: "/admin/case-studies",
      glow: "rgba(139, 92, 246, 0.2)",
    },
    {
      label: "Experiences",
      value: totalExperiences,
      sub: "Career timeline records →",
      subColor: "text-blue-400",
      icon: History,
      iconColor: "text-blue-400",
      iconBg: "from-blue-600/20 to-indigo-600/20",
      iconBorder: "border-blue-500/30",
      href: "/admin/experience",
      glow: "rgba(59, 130, 246, 0.2)",
    },
    {
      label: "Skills Listed",
      value: totalSkills,
      sub: "Technical taxonomy →",
      subColor: "text-indigo-400",
      icon: Wrench,
      iconColor: "text-indigo-400",
      iconBg: "from-indigo-600/20 to-violet-600/20",
      iconBorder: "border-indigo-500/30",
      href: "/admin/skills",
      glow: "rgba(99, 102, 241, 0.2)",
    },
    {
      label: "Services",
      value: totalServices,
      sub: "Client infrastructure offerings →",
      subColor: "text-violet-400",
      icon: Briefcase,
      iconColor: "text-violet-400",
      iconBg: "from-violet-600/20 to-purple-600/20",
      iconBorder: "border-violet-500/30",
      href: "/admin/services",
      glow: "rgba(139, 92, 246, 0.2)",
    },
    {
      label: "Blog Posts",
      value: totalBlogPosts,
      sub: "Engineering knowledge-base →",
      subColor: "text-emerald-400",
      icon: BookOpen,
      iconColor: "text-emerald-400",
      iconBg: "from-emerald-600/20 to-teal-600/20",
      iconBorder: "border-emerald-500/30",
      href: "/admin/blog",
      glow: "rgba(52, 211, 153, 0.2)",
    },
    {
      label: "Certifications",
      value: totalCertifications,
      sub: "Fortinet, MikroTik, Cisco →",
      subColor: "text-amber-400",
      icon: Award,
      iconColor: "text-amber-400",
      iconBg: "from-amber-600/20 to-orange-600/20",
      iconBorder: "border-amber-500/30",
      href: "/admin/certifications",
      glow: "rgba(245, 158, 11, 0.2)",
    },
    {
      label: "Corporate Clients",
      value: totalClients,
      sub: "Partners & reviews →",
      subColor: "text-teal-400",
      icon: Building2,
      iconColor: "text-teal-400",
      iconBg: "from-teal-600/20 to-emerald-600/20",
      iconBorder: "border-teal-500/30",
      href: "/admin/clients",
      glow: "rgba(45, 212, 191, 0.2)",
    },
    {
      label: "Labs & Sandboxes",
      value: totalLabs,
      sub: "Live prototypes & R&D →",
      subColor: "text-pink-400",
      icon: FlaskConical,
      iconColor: "text-pink-400",
      iconBg: "from-pink-600/20 to-purple-600/20",
      iconBorder: "border-pink-500/30",
      href: "/admin/labs",
      glow: "rgba(244, 114, 182, 0.2)",
    },
    {
      label: "Resume & CV",
      value: "ATS Ready",
      sub: "Dynamic print & download →",
      subColor: "text-cyan-400",
      icon: FileText,
      iconColor: "text-cyan-400",
      iconBg: "from-cyan-600/20 to-blue-600/20",
      iconBorder: "border-cyan-500/30",
      href: "/admin/resume",
      glow: "rgba(34, 211, 238, 0.2)",
    },
    {
      label: "New Inquiries",
      value: unreadMessages,
      sub: `${unreadMessages} unread in inbox →`,
      subColor: "text-rose-400",
      icon: Mail,
      iconColor: "text-rose-400",
      iconBg: "from-rose-600/20 to-pink-600/20",
      iconBorder: "border-rose-500/30",
      href: "/admin/contact",
      glow: "rgba(251, 113, 133, 0.2)",
    },
    {
      label: "Admin Users",
      value: totalUsers,
      sub: "Role-based access & 2FA →",
      subColor: "text-orange-400",
      icon: Users,
      iconColor: "text-orange-400",
      iconBg: "from-orange-600/20 to-red-600/20",
      iconBorder: "border-orange-500/30",
      href: "/admin/users",
      glow: "rgba(251, 146, 60, 0.2)",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1780px] 2xl:max-w-[1920px] mx-auto w-full">
      {/* 1. Ultra-Premium Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-[#141444] via-[#10103b] to-[#0e0e34] border border-purple-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Full Command &amp; Control Operations Suite</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Enterprise Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time synchronization across your personal portfolio, Network Security telemetry, database management, and autonomous AI pipelines.
            </p>
          </div>

          {/* Quick Hub Navigation Shortcuts */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/home"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 shadow-lg shadow-amber-500/10 transition-all"
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Home Page Manager</span>
            </Link>
            <Link
              href="/admin/database-api-hub"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 transition-all"
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Database &amp; API Hub</span>
            </Link>
            <Link
              href="/admin/automation"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 shadow-lg shadow-purple-500/10 transition-all"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Automation Hub</span>
            </Link>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Telemetry & System Health Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { label: "Public Site Active Rate", value: `${totalProjects > 0 ? Math.round((publishedProjects / totalProjects) * 100) : 0}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25" },
          { label: "New Inquiries Waiting", value: `${unreadMessages} Unread`, icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25" },
          { label: "Live Visitor Packets", value: `${recentVisitors.length} Captured`, icon: Radio, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
          { label: "Accredited Credentials", value: `${totalCertifications} Certified`, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`px-4 py-3.5 rounded-2xl flex items-center space-x-3.5 ${stat.bg} border ${stat.border} shadow-md backdrop-blur-md`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#0e0e34] border border-white/10 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{stat.value}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. KPI Cards Grid - All 12 Sections with High-Contrast Micro-Interactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="p-5 rounded-3xl group transition-all duration-300 block bg-[#141444]/80 border border-purple-500/20 hover:border-cyan-400/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.iconBg} border ${card.iconBorder} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1.5 font-heading">
                {card.value}
              </div>
              <p className={`text-[11px] font-medium ${card.subColor} flex items-center gap-1`}>
                <span>{card.sub}</span>
              </p>
            </Link>
          );
        })}
      </div>

      {/* 4. Two-Column Live Activity Feeds: Recent Projects & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#141444]/80 border border-purple-500/25 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                  Recent Projects
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Live portfolio showcase</span>
              </div>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs text-cyan-400 hover:text-white font-mono font-bold flex items-center space-x-1 transition-colors"
            >
              <span>View All ({totalProjects})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-purple-500/10">
            {recentProjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center font-mono">No projects yet. Create your first project!</p>
            ) : (
              recentProjects.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{p.title}</div>
                    <div className="text-[11px] text-cyan-400/80 font-mono truncate">/{p.slug}</div>
                  </div>
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase ${
                        p.status === "PUBLISHED"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {p.status}
                    </span>
                    <Link
                      href={`/admin/projects/${p.id}/edit`}
                      className="px-2.5 py-1 rounded-lg bg-[#0e0e34] border border-purple-500/30 text-purple-300 hover:text-white hover:border-cyan-400 text-xs font-mono font-bold transition-all"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#141444]/80 border border-purple-500/25 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                  <span>Recent Inquiries</span>
                  {unreadMessages > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
                      {unreadMessages} new
                    </span>
                  )}
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Client contact messages</span>
              </div>
            </div>
            <Link
              href="/admin/contact"
              className="text-xs text-cyan-400 hover:text-white font-mono font-bold flex items-center space-x-1 transition-colors"
            >
              <span>Inbox ({unreadMessages} unread)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-purple-500/10">
            {recentMessages.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center font-mono">No messages received yet.</p>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="py-3.5 flex items-start justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{msg.name}</span>
                      {msg.status === "NEW" && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-cyan-400/80 font-mono truncate">{msg.email}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {msg.message}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Network Security Engineer - Real-Time Visitor Telemetry Console with Date Filter & Delete */}
      <VisitorTelemetryTable initialLogs={recentVisitors} />
    </div>
  );
}
