import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import Link from "next/link";
import {
  BookOpen, FileText, Network, Server, ShieldCheck, Lock, Cloud,
  TrendingUp, Wrench, Lightbulb, Users, Terminal, Code, Cpu,
  Activity, Folder, ArrowUpRight, Sparkles, Workflow, CheckCircle2,
  FolderGit2,
} from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog, Articles & Engineering Notes | MD Tanvir Khan",
  description: "Practical knowledge, real-world solutions, and hands-on guides for Network, System, and Security Engineering.",
};

const defaultArticleCategories = [
  { title: "Networking", desc: "Routing, Switching, VLAN, VPN, Firewall and more.", icon: Network, link: "/blog/articles?category=Networking", num: "01" },
  { title: "System Administration", desc: "Linux, Windows Server, Active Directory, backup.", icon: Server, link: "/blog/articles?category=System+Administration", num: "02" },
  { title: "Cybersecurity", desc: "Threats, Hardening, Vulnerability, Security Practices.", icon: ShieldCheck, link: "/blog/articles?category=Cybersecurity", num: "03" },
  { title: "Network Security", desc: "Firewall, IDS/IPS, zero trust, access control.", icon: Lock, link: "/blog/articles?category=Network+Security", num: "04" },
  { title: "Cloud & Infrastructure", desc: "AWS, Azure, Virtualization, Containers.", icon: Cloud, link: "/blog/articles?category=Cloud+%26+Infrastructure", num: "05" },
  { title: "Technology Trends", desc: "Latest tech, tools, frameworks and opportunities.", icon: TrendingUp, link: "/blog/articles?category=Technology+Trends", num: "06" },
  { title: "Tools & Technologies", desc: "MikroTik, Cisco, FortiGate, VMware, Docker.", icon: Wrench, link: "/blog/articles?category=Tools+%26+Technologies", num: "07" },
  { title: "Security Updates", desc: "CVE, vulnerability alerts and security patches.", icon: ShieldCheck, link: "/blog/articles?category=Security+Updates", num: "08" },
  { title: "Best Practices", desc: "Proven methods, configuration tips and guidelines.", icon: Lightbulb, link: "/blog/articles?category=Best+Practices", num: "09" },
  { title: "Industry Insights", desc: "Market trends, career tips and professional growth.", icon: Users, link: "/blog/articles?category=Industry+Insights", num: "10" },
];

const defaultNoteCategories = [
  { title: "Troubleshooting Notes", desc: "Common issues, error fixes and problem solving.", icon: Wrench, link: "/blog/notes?category=Troubleshooting", num: "01" },
  { title: "Configuration Guides", desc: "Step-by-step configuration for network & security.", icon: FileText, link: "/blog/notes?category=Configuration+Guides", num: "02" },
  { title: "How-To / Step-by-Step", desc: "Detailed guides with clear steps and screenshots.", icon: Terminal, link: "/blog/notes?category=How-To", num: "03" },
  { title: "Command & Cheat Sheets", desc: "Useful commands, shortcuts and quick reference.", icon: Code, link: "/blog/notes?category=Command+%26+Cheat+Sheets", num: "04" },
  { title: "Network Configurations", desc: "Router, switch, firewall and VPN config examples.", icon: Network, link: "/blog/notes?category=Network+Configurations", num: "05" },
  { title: "Firewall Rules & Config", desc: "Security policies, NAT, VPN and firewall rules.", icon: ShieldCheck, link: "/blog/notes?category=Firewall+Rules+%26+Config", num: "06" },
  { title: "Server Configuration", desc: "Linux/Windows server setup and optimization.", icon: Server, link: "/blog/notes?category=Server+Configuration", num: "07" },
  { title: "Incident Analysis", desc: "Real incidents, root cause and resolution steps.", icon: Activity, link: "/blog/notes?category=Incident+Analysis", num: "08" },
  { title: "Security Hardening", desc: "System, network and application hardening.", icon: Lock, link: "/blog/notes?category=Security+Hardening", num: "09" },
  { title: "Deployment Notes", desc: "Project implementation and architecture diagrams.", icon: Cpu, link: "/blog/notes?category=Project%2FDeployment+Notes", num: "10" },
  { title: "Lab Notes", desc: "Hands-on lab setups, test configs and experiments.", icon: Terminal, link: "/blog/notes?category=Lab+Notes", num: "11" },
  { title: "Resources", desc: "Templates, checklists, diagrams, PDFs and links.", icon: Folder, link: "/blog/notes?category=Resources", num: "12" },
];

const iconByName: Record<string, any> = {
  BookOpen, FileText, Network, Server, ShieldCheck, Lock, Cloud,
  TrendingUp, Wrench, Lightbulb, Users, Terminal, Code, Cpu,
  Activity, Folder, Workflow, Sparkles,
};

type CategoryItem = {
  title: string;
  desc: string;
  icon: any;
  link: string;
  num: string;
};

function BlogCardItem({
  item,
  accent,
}: {
  item: CategoryItem;
  accent: "cyan" | "purple";
}) {
  const cyan = accent === "cyan";
  const IconComp = item.icon;

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border p-6 sm:p-7 bg-[#141444]/70 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${
        cyan
          ? "border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/10"
          : "border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/10"
      }`}
    >
      <div className="relative flex h-full flex-col">
        {/* Top Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-[#0e0e34] transition-transform group-hover:scale-105 ${
                cyan
                  ? "border-cyan-500/30 text-cyan-400"
                  : "border-purple-500/30 text-purple-400"
              }`}
            >
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                  cyan
                    ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                    : "text-purple-400 bg-purple-500/10 border-purple-500/30"
                }`}
              >
                #{item.num}
              </span>
              <h3 className="pt-1.5 font-heading text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors">
                {item.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-300/90 mb-5">
          {item.desc}
        </p>

        {/* Bottom Link (matching Services Page style) */}
        <div className="mt-auto pt-4 border-t border-slate-800/80">
          <Link
            href={item.link}
            className={`inline-flex items-center gap-2 text-xs font-bold transition-colors ${
              cyan
                ? "text-cyan-300 hover:text-cyan-100"
                : "text-purple-300 hover:text-purple-100"
            }`}
          >
            <span>Browse Category</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogSection({
  title,
  description,
  items,
  accent,
  linkPath,
  linkText,
  icon: SectionIcon,
}: {
  title: string;
  description: string;
  items: CategoryItem[];
  accent: "cyan" | "purple";
  linkPath: string;
  linkText: string;
  icon: any;
}) {
  const cyan = accent === "cyan";

  return (
    <section className="space-y-8">
      {/* Section Header */}
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
            <SectionIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`hidden rounded-full border px-3 py-1 text-[10px] font-mono font-bold sm:inline-flex ${
              cyan
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                : "border-purple-500/30 bg-purple-500/10 text-purple-300"
            }`}
          >
            {items.length} {items.length === 1 ? "Category" : "Categories"}
          </span>

          <Link
            href={linkPath}
            className={`hidden shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold sm:inline-flex items-center gap-1.5 transition-all ${
              cyan
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                : "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
            }`}
          >
            {linkText} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {items.map((item, idx) => (
          <BlogCardItem key={`${item.title}-${idx}`} item={item} accent={accent} />
        ))}
      </div>
    </section>
  );
}

export default async function BlogDashboardPage() {
  const [allArticleCategories, allNoteCategories] = await Promise.all([
    prisma.articleCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.noteCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  const liveArticleCategories: CategoryItem[] = allArticleCategories.length
    ? allArticleCategories.filter((cat) => cat.active).map((cat, index) => ({
        title: cat.name,
        desc: cat.description || "Explore in-depth articles in this category.",
        icon: iconByName[cat.icon || ""] || BookOpen,
        link: `/blog/articles?category=${encodeURIComponent(cat.name)}`,
        num: String(index + 1).padStart(2, "0"),
      }))
    : defaultArticleCategories;

  const liveNoteCategories: CategoryItem[] = allNoteCategories.length
    ? allNoteCategories.filter((cat) => cat.active).map((cat, index) => ({
        title: cat.name,
        desc: cat.description || "Explore practical engineering notes and cheatsheets.",
        icon: iconByName[cat.icon || ""] || FileText,
        link: `/blog/notes?category=${encodeURIComponent(cat.name)}`,
        num: String(index + 1).padStart(2, "0"),
      }))
    : defaultNoteCategories;

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col overflow-x-hidden font-sans">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10 space-y-16">
        {/* Header Section (Identical Structure to Services Page) */}
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Knowledge Base, Articles &amp; Engineering Field Notes</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Blog &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
                Technical Knowledge
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Practical knowledge, real-world solutions, and hands-on guides for Network,
              System, Infrastructure, and Security Engineering.
            </p>
          </div>

          {/* Metric Stats Cards (Matching Services Page 2-column cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Card 1: Articles */}
            <div className="group relative p-6 rounded-[2rem] bg-[#141444]/60 border border-purple-500/20 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 hover:border-cyan-500/30 transition-all duration-500 flex items-center space-x-6 overflow-hidden backdrop-blur-md">
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-[#0e0e34] border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-all duration-500 z-10">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="z-10 flex flex-col space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-purple-300/70">
                  Technical Articles
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-cyan-400 tracking-tight">
                  {liveArticleCategories.length}
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  Active Topic{liveArticleCategories.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Card 2: Engineering Notes */}
            <div className="group relative p-6 rounded-[2rem] bg-[#141444]/60 border border-purple-500/20 shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-500 flex items-center space-x-6 overflow-hidden backdrop-blur-md">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-[#0e0e34] border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-all duration-500 z-10">
                <FileText className="w-7 h-7" />
              </div>
              <div className="z-10 flex flex-col space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-cyan-300/70">
                  Field Notes &amp; Cheatsheets
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-400 tracking-tight">
                  {liveNoteCategories.length}
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  Active Notebook{liveNoteCategories.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Explore Articles (Cyan Accent, 2-column grid cards) */}
        <BlogSection
          title="Technical Articles"
          description="In-depth breakdowns, industry insights and technical architectures to keep you updated."
          items={liveArticleCategories}
          accent="cyan"
          linkPath="/blog/articles"
          linkText="View All Articles"
          icon={BookOpen}
        />

        {/* Section 2: Engineering Notes (Purple Accent, 2-column grid cards) */}
        <div className="pt-8 border-t border-purple-500/20">
          <BlogSection
            title="Engineering Notes"
            description="Step-by-step guides, command cheat sheets, firewall configs and troubleshooting solutions."
            items={liveNoteCategories}
            accent="purple"
            linkPath="/blog/notes"
            linkText="View All Notes"
            icon={FileText}
          />
        </div>

        {/* Bottom CTA Card (Identical Structure to Services Page CTA) */}
        <div className="rounded-[2.5rem] border border-purple-500/30 p-10 sm:p-14 bg-gradient-to-r from-[#141444] via-[#1a1a52] to-[#141444] text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <h3 className="relative font-heading text-2xl sm:text-3xl font-bold text-white z-10">
            Have questions about a setup, network architecture or tutorial?
          </h3>
          <p className="relative text-sm text-slate-300/90 max-w-xl mx-auto font-normal z-10 leading-relaxed">
            Feel free to reach out. I frequently help peers and clients analyze incident logs, plan deployments, and architect robust networks.
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 z-10">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Ask a Question <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0e0e34] hover:bg-slate-800 border border-purple-500/50 text-sm font-bold text-slate-200 hover:text-white hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              View Services <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
