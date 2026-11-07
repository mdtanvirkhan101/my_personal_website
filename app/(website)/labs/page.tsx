import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FlaskConical,
  Sparkles,
  Github,
  Network,
  ShieldCheck,
  Terminal,
  Lock,
  ArrowUpRight,
  Workflow,
  ImageIcon,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Labs & Security Sandboxes | MD Tanvir Khan",
  description:
    "Experimental network sandboxes, zero-trust micro-proxies, packet analysis engines, and security prototypes by MD Tanvir Khan.",
};

export default async function LabsPage() {
  const dbLabs = await prisma.lab.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  const fallbackCategories = [
    {
      categoryTitle: "Network Simulation Labs",
      categoryDesc: "Virtualized BGP/OSPF topologies, routing protocol failure models, and transit gateway simulations.",
      icon: <Network className="w-5 h-5 text-cyan-400" />,
      labs: [
        {
          id: "ns-1",
          title: "BGP Route Leak & Hijack Simulation Sandbox",
          status: "Live Simulation",
          summary:
            "Virtualized Autonomous System (AS) routing simulator testing path validation algorithms and RPKI route filtering policies under synthetic attack conditions.",
          tech: ["BGP", "Quagga/FRR", "Docker", "GNS3 Topology"],
          metrics: "16 Node Active Topology",
          githubUrl: "https://github.com",
          demoUrl: "https://github.com",
          diagramType: "AS-100 (Core) <---> AS-200 (Transit) [RPKI Filter Enabled] ---> AS-666 (Leak Target)",
          imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "ns-2",
          title: "Multi-Region MPLS & VXLAN Fabric Mesh",
          status: "Topology R&D",
          summary:
            "Simulated data center overlay network utilizing VXLAN encapsulation over an underlying OSPF/MPLS core for seamless tenant isolation.",
          tech: ["VXLAN", "MPLS", "BGP-EVPN", "Linux Bridges"],
          metrics: "Sub-millisecond Convergence",
          githubUrl: "https://github.com",
          demoUrl: "https://github.com",
          diagramType: "Spine-Leaf Core [BGP-EVPN] <==> VTEP Gateway <==> Encrypted Overlay Tunnels",
          imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        },
      ],
    },
    {
      categoryTitle: "Cybersecurity & Pentesting Labs",
      categoryDesc: "Automated threat intelligence honeypots, vulnerability scanners, and packet inspection sandboxes.",
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      labs: [
        {
          id: "cp-1",
          title: "Automated Threat Intel Honeypot Telemetry",
          status: "Interactive Lab",
          summary:
            "Containerized SSH/Telnet low-interaction honeypot logging credential stuffing attacks, recording attacker keystrokes, and mapping brute-force GeoIP vectors.",
          tech: ["Docker", "Node.js", "GeoIP DB", "Elastic Stack"],
          metrics: "Real-time Attack Vector Stream",
          githubUrl: "https://github.com",
          demoUrl: "https://github.com",
          diagramType: "Internet Brute-Force ---> DMZ Honeypot Node ---> Isolated Log Aggregator & Telemetry",
          imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "cp-2",
          title: "High-Frequency Packet Capture & Sniffer Engine",
          status: "Performance Sandbox",
          summary:
            "Optimized ring-buffer packet inspection tool capable of parsing layer-4 headers and flagging anomalous payload signatures at line rate.",
          tech: ["Rust", "libpcap", "Ring Buffers", "Zero-Copy"],
          metrics: "100k Packets/sec Parsed",
          githubUrl: "https://github.com",
          demoUrl: "https://github.com",
          diagramType: "NIC Ring Buffer ---> eBPF Filter Hook ---> Userspace Parser ---> Metrics Dashboard",
          imageUrl: "https://images.unsplash.com/photo-1510519138161-5364d9cd7bb4?auto=format&fit=crop&w=800&q=80",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-7xl 2xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span>Security Engineering R&amp;D Lab ({dbLabs.length || 4} Sandboxes)</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Labs &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Security Sandboxes</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            A structured repository of virtualized network topologies, eBPF zero-trust proxies, automated Python playbooks, and high-performance security prototypes.
          </p>
        </div>

        {/* Dynamic Database Labs (if any published in DB) */}
        {dbLabs.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-purple-500/20">
              <div className="w-10 h-10 rounded-xl bg-[#141444] border border-purple-500/30 flex items-center justify-center shadow-md">
                <FlaskConical className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  Active Sandbox Prototypes
                </h2>
                <p className="text-xs text-slate-400">Production-grade simulations and experimental repositories.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dbLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="rounded-3xl border border-purple-500/20 p-6 sm:p-7 bg-[#141444]/70 shadow-xl hover:border-purple-500/40 hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between space-y-6 group overflow-hidden"
                >
                  <div className="space-y-4">
                    {lab.coverUrl && (
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-purple-500/20 bg-[#0e0e34]">
                        <img
                          src={lab.coverUrl}
                          alt={lab.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141444] via-transparent to-transparent opacity-80" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider bg-[#0e0e34] px-2.5 py-1 rounded-full border border-purple-500/20 font-semibold">
                        /{lab.slug}
                      </span>
                      <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>Live Sandbox</span>
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {lab.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {lab.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs">
                    {lab.demoUrl ? (
                      <a
                        href={lab.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 font-semibold text-xs text-cyan-400 hover:text-cyan-300 transition-colors min-h-[36px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch Lab</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">Interactive Simulation</span>
                    )}

                    {lab.repoUrl && (
                      <a
                        href={lab.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 font-semibold text-xs text-slate-300 hover:text-white transition-colors min-h-[36px] group-hover:underline"
                      >
                        <Github className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect Code</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorized Sections */}
        <div className="space-y-16">
          {fallbackCategories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-purple-500/20">
                <div className="w-10 h-10 rounded-xl bg-[#141444] border border-purple-500/30 flex items-center justify-center shadow-md">
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">
                    {cat.categoryTitle}
                  </h2>
                  <p className="text-xs text-slate-400">{cat.categoryDesc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cat.labs.map((lab) => (
                  <div
                    key={lab.id}
                    className="rounded-3xl border border-purple-500/20 p-6 sm:p-7 bg-[#141444]/70 shadow-xl hover:border-purple-500/40 hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between space-y-6 group overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-purple-500/20 bg-[#0e0e34]">
                        <img
                          src={lab.imageUrl}
                          alt={lab.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141444] via-transparent to-transparent opacity-80" />
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#0e0e34]/80 backdrop-blur-md border border-purple-500/30 text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-cyan-400" />
                          <span>Topology Preview</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider bg-[#0e0e34] px-2.5 py-1 rounded-full border border-purple-500/20 font-semibold">
                          {lab.metrics}
                        </span>
                        <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>{lab.status}</span>
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {lab.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {lab.summary}
                      </p>

                      <div className="p-3 rounded-xl bg-[#0e0e34] border border-purple-500/20 space-y-1.5 shadow-inner">
                        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400 font-semibold">
                          <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Architecture Diagram Scope:</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-none py-1 px-2 bg-[#141444]/80 rounded border border-purple-500/20">
                          {lab.diagramType}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {lab.tech.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono text-slate-300 bg-[#0e0e34] px-2 py-0.5 rounded-md border border-purple-500/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs">
                      <a
                        href={lab.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 font-semibold text-xs text-cyan-400 hover:text-cyan-300 transition-colors min-h-[36px]"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Learn More</span>
                      </a>

                      <a
                        href={lab.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 font-semibold text-xs text-slate-300 hover:text-white transition-colors min-h-[36px] group-hover:underline"
                      >
                        <Github className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect Code</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#141444] via-[#1a1a52] to-[#141444] border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="font-heading text-2xl font-bold text-white">
              Have a complex network security or simulation challenge?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal">
              I collaborate on custom protocol filters, automated orchestration scripts, and enterprise firewall topologies.
            </p>
          </div>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-heading font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <span>Start Lab Collaboration</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}