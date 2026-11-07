import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import { getAboutPageConfig } from "@/actions/about-page";
import Link from "next/link";
import {
  ShieldCheck,
  Server,
  Lock,
  Cpu,
  Terminal,
  Activity,
  Award,
  ArrowUpRight,
  Mail,
  Network,
  Radio,
  FileCheck2,
  ChevronRight,
  Download,
  CheckCircle2,
  Sparkles,
  Layers,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  Workflow,
  Wrench,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "About | MD Tanvir Khan – Network, VoIP & Security Engineer",
  description:
    "Engineering high-uptime enterprise networks, VoIP communications, and hardened security infrastructures.",
};

export default async function AboutPage() {
  const [profile, dbServices, dbSkills, dbCerts, settings, pageConfig] = await Promise.all([
    (await prisma.profile.findFirst({ where: { id: "default-owner-profile" } })) ||
      (await prisma.profile.findFirst()),
    prisma.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.skill.findMany({ where: { level: { not: 0 } }, orderBy: [{ sortOrder: "asc" }, { percentage: "desc" }] }),
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.siteSetting.findMany(),
    getAboutPageConfig(),
  ]);

  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const name = profile?.name || "MD Tanvir Khan";
  const headline = profile?.headline || "Network & VoIP Engineer | Security & Infrastructure Specialist";
  const bio =
    profile?.bio ||
    "Hello, I am MD Tanvir Khan — a Network & VoIP Engineer based in Dhaka, Bangladesh. With extensive hands-on experience across Grandstream IP PBX, Cisco routing, FortiGate firewalls, and enterprise systems, I engineer resilient, secure, and maintainable infrastructures that empower mission-critical business communications.";
  const location = profile?.location || "Dhaka, Bangladesh";
  const avatarUrl = profile?.avatarUrl;
  const resumeUrl = profile?.resumeUrl || settingsMap["resume_pdf_url"] || "/CV of MD Tanvir Khan.pdf";

  // Group skills by category
  const skillsByCategory: Record<string, string[]> = {};
  if (dbSkills.length > 0) {
    for (const sk of dbSkills) {
      const cat = sk.category || "General";
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(sk.name);
    }
  }

  const defaultSkillCategories: Record<string, string[]> = {
    "Network Infrastructure": ["Cisco Catalyst", "Cisco Nexus", "MikroTik RouterOS", "VLANs & Trunking", "BGP & OSPF"],
    "VoIP & Telephony": ["Grandstream UCM PBX", "FXO/FXS Gateways", "SIP Trunking", "IVR Call Flow", "Session Border Controllers"],
    "Perimeter Security": ["Fortinet FortiGate", "pfSense", "Palo Alto", "IPsec VPN / SSL-VPN", "Firewall NAT Policies"],
    "Systems & Cloud": ["Linux (Ubuntu/Debian)", "Windows Server", "VMware ESXi", "Docker", "Wireshark Telemetry"],
  };

  const finalSkillGroups = Object.keys(skillsByCategory).length > 0 ? skillsByCategory : defaultSkillCategories;

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col font-sans overflow-x-hidden">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10 space-y-16">
        
        {/* 1. HERO SECTION */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{pageConfig.badgeText || "Professional Biography & Engineering Profile"}</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                {pageConfig.heroHeading}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
                  {pageConfig.heroHeadingHighlight}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {bio}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3.5 items-center">
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                >
                  <span>Initiate Consultation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-[#141444] hover:bg-[#1f2066] border border-purple-500/40 text-slate-100 font-semibold text-xs transition-colors flex items-center space-x-2 shadow-md hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Resume (PDF)</span>
                </a>
                <Link
                  href="/resume"
                  className="px-5 py-3 rounded-2xl bg-[#0e0e34] hover:bg-[#141444] border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  View Interactive CV
                </Link>
              </div>
            </div>

            {/* Profile Avatar Frame */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 group">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-indigo-600 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="relative w-full h-full rounded-3xl border-2 border-purple-500/40 p-2 overflow-hidden bg-[#141444] shadow-2xl backdrop-blur-xl">
                  <img
                    src={avatarUrl || "/profile.jpg"}
                    alt={name}
                    className="w-full h-full rounded-2xl object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-[#0e0e34]/90 backdrop-blur-md rounded-xl p-2 border border-purple-500/30 text-center">
                    <span className="text-[11px] font-mono text-cyan-300 font-bold block">{name}</span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate">{headline}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              {
                label: "Experience",
                val: pageConfig.yearsExperience || "4+ Years",
                desc: "Enterprise Networking & VoIP",
                icon: Briefcase,
                color: "text-purple-400",
              },
              {
                label: "Service Uptime",
                val: pageConfig.uptimeGuarantee || "99.99%",
                desc: "High-Availability Topologies",
                icon: Activity,
                color: "text-cyan-400",
              },
              {
                label: "Hardware & Tools",
                val: pageConfig.systemsHandled || `${dbSkills.length || 24}+ Systems`,
                desc: "Cisco, Fortinet & MikroTik",
                icon: Wrench,
                color: "text-indigo-400",
              },
              {
                label: "Certifications",
                val: pageConfig.credentialsCount || `${dbCerts.length || 10}+ Verified`,
                desc: "Vendor-Accredited Credentials",
                icon: Award,
                color: "text-amber-400",
              },
            ].map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={i}
                  className="group relative p-5 rounded-2xl bg-[#141444]/60 border border-purple-500/20 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl sm:text-2xl font-bold font-heading text-white">{stat.val}</span>
                    <IconComp className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">{stat.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{stat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. CORE EXPERTISE & METHODOLOGY */}
        {pageConfig.showMethodology && (
          <section className="space-y-6">
            <div className="border-b border-purple-500/20 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#141444] text-cyan-400 shadow-md">
                  <Workflow className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">
                    {pageConfig.methodologyTitle || "Engineering Methodology & Pillars"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {pageConfig.methodologySubtitle || "How I approach enterprise infrastructure and system design."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <article className="group relative overflow-hidden rounded-3xl border border-purple-500/20 p-6 sm:p-7 bg-[#141444]/70 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0e0e34] text-cyan-400">
                    <Network className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">Enterprise VoIP &amp; LAN/WAN</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-300 mb-4">
                  Specialized in Grandstream UCM deployment, SIP Trunking, IVR call routing, and low-latency LAN/WAN topologies.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>High Voice Quality (QoS Prioritization)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>FXO/FXS Gateway &amp; Analog Integration</span>
                  </li>
                </ul>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-purple-500/20 p-6 sm:p-7 bg-[#141444]/70 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-purple-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-[#0e0e34] text-purple-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">Perimeter &amp; Firewall Hardening</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-300 mb-4">
                  Deploying FortiGate, pfSense, and Cisco ASA firewalls with zero-trust network segmentation and encrypted tunnels.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Site-to-Site IPsec &amp; Remote SSL-VPN</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Intrusion Prevention (IDS/IPS) &amp; NAT</span>
                  </li>
                </ul>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-purple-500/20 p-6 sm:p-7 bg-[#141444]/70 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0e0e34] text-cyan-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">Monitoring &amp; Incident Response</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-300 mb-4">
                  Continuous network telemetry, traffic flow analysis with Wireshark, SNMP traps, and proactive outage prevention.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Automated Telegram &amp; Email Alerting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Packet-Level Root Cause Diagnostics</span>
                  </li>
                </ul>
              </article>
            </div>
          </section>
        )}

        {/* 3. TECHNICAL ARSENAL (Grouped Skills) */}
        {pageConfig.showArsenal && (
          <section className="space-y-6">
            <div className="border-b border-purple-500/20 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-[#141444] text-purple-400 shadow-md">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">
                    {pageConfig.arsenalTitle || "Technical Arsenal & Tools"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {pageConfig.arsenalSubtitle || "Categorized technologies and hardware platforms."}
                  </p>
                </div>
              </div>
              <Link
                href="/skills"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 hover:text-white"
              >
                <span>View All Skills Matrix</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(finalSkillGroups).slice(0, 4).map(([category, items], idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={category}
                    className={`p-6 rounded-3xl border bg-[#141444]/70 backdrop-blur-md space-y-4 ${
                      isEven ? "border-cyan-500/20" : "border-purple-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-bold text-white">{category}</h3>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                        isEven ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" : "bg-purple-500/10 border-purple-500/30 text-purple-300"
                      }`}>
                        {items.length} Techs
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {items.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 rounded-xl bg-[#0e0e34] border border-slate-700/80 text-xs font-mono text-slate-200 hover:border-purple-500/50 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. VERIFIED CERTIFICATIONS PREVIEW */}
        {pageConfig.showCertifications && dbCerts.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-purple-500/20 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#141444] text-cyan-400 shadow-md">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">Accredited Certifications</h2>
                  <p className="mt-0.5 text-xs text-slate-400">Validated industry qualifications and credentials.</p>
                </div>
              </div>
              <Link
                href="/certifications"
                className="text-xs font-mono font-bold text-purple-400 hover:text-white flex items-center gap-1"
              >
                <span>View All ({dbCerts.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {dbCerts.slice(0, 4).map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl bg-[#141444]/60 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                      {cert.issuer}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-white line-clamp-2">{cert.name}</h4>
                  </div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-cyan-300 hover:text-white flex items-center space-x-1"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. CALL TO ACTION FOOTER BANNER */}
        <div className="rounded-[2.5rem] border border-purple-500/30 p-10 sm:p-14 bg-gradient-to-r from-[#141444] via-[#1a1a52] to-[#141444] text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <h3 className="relative font-heading text-2xl sm:text-3xl font-bold text-white z-10">
            {pageConfig.ctaHeading || "Need a custom network, server, VoIP or security solution?"}
          </h3>
          <p className="relative text-sm text-slate-300/90 max-w-xl mx-auto font-normal z-10 leading-relaxed">
            {pageConfig.ctaDescription || "Share your requirement and let's discuss a practical, secure and maintainable technical approach."}
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 z-10">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Initiate Consultation <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0e0e34] hover:bg-slate-800 border border-purple-500/50 text-sm font-bold text-slate-200 hover:text-white hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              View Engineering Projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
