import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Gauge,
  Globe,
  LockKeyhole,
  Network,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Clients, Testimonials & Scope | MD Tanvir Khan",
  description:
    "Explore client collaborations, testimonials, technical service scope, and delivery approach.",
};

const scopeItems = [
  {
    title: "Network Design & Deployment",
    description:
      "Network planning, device configuration, connectivity setup, and deployment support based on project requirements.",
    tags: ["Network Planning", "Routing & Switching", "Deployment"],
    icon: Network,
  },
  {
    title: "VoIP & IP PBX Solutions",
    description:
      "IP telephony setup, SIP trunk configuration, extension planning, and call-quality troubleshooting.",
    tags: ["IP PBX", "SIP Trunking", "VoIP Support"],
    icon: Workflow,
  },
  {
    title: "Firewall & Network Security",
    description:
      "Security policy configuration, access control, VPN connectivity, and network hardening aligned with the agreed scope.",
    tags: ["Firewall Policies", "VPN", "Access Control"],
    icon: ShieldCheck,
  },
  {
    title: "Technical Documentation",
    description:
      "Project handover notes, configuration records, device inventories, and technical documentation for ongoing support.",
    tags: ["Documentation", "Inventory", "Handover"],
    icon: FileText,
  },
];

const deliveryOutcomes = [
  {
    title: "Reliable Connectivity",
    description:
      "Structured setup and troubleshooting focused on stable communication between the required systems and locations.",
    icon: Activity,
  },
  {
    title: "Security & Access Control",
    description:
      "Clear access rules and security configurations based on the project requirements and approved policies.",
    icon: LockKeyhole,
  },
  {
    title: "Clear Project Handover",
    description:
      "Useful configuration records and documentation to help teams understand and maintain the delivered solution.",
    icon: ClipboardList,
  },
  {
    title: "Practical Troubleshooting",
    description:
      "A structured approach to identifying issues, testing changes, and documenting the resolution where applicable.",
    icon: Gauge,
  },
];

export default async function ClientsTestimonialsScopePage() {
  const [dbClients, dbTestimonials] = await Promise.all([
    prisma.client.findMany({
      include: { testimonials: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.testimonial.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Use only database records. Do not display invented client names or reviews.
  const clients = dbClients;
  const testimonials = dbTestimonials;

  const summary = [
    {
      label: "Clients & Organizations",
      value: clients.length,
      icon: Building2,
      description: "Client records published from the database",
    },
    {
      label: "Testimonials",
      value: testimonials.length,
      icon: Quote,
      description: "Feedback entries available on this page",
    },
    {
      label: "Service Areas",
      value: scopeItems.length,
      icon: Network,
      description: "Core technical service categories shown below",
    },
    {
      label: "Delivery Outcomes",
      value: deliveryOutcomes.length,
      icon: CheckCircle2,
      description: "Ways project delivery is approached",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0e0e34] text-slate-300 selection:bg-purple-500/40 selection:text-white">
      <PremiumBackground />
      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-16 px-4 py-12 sm:space-y-20 sm:px-6 sm:py-16 lg:px-8">
        {/* 1. PAGE INTRO + SUMMARY */}
        <section className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-200">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Professional Collaboration &amp; Delivery</span>
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Clients, <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Testimonials</span> &amp; Scope
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              An overview of client collaborations, available feedback, technical services, and the approach used to deliver practical solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="group rounded-2xl border border-purple-500/20 bg-[#141444]/75 p-5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/20 bg-[#0e0e34] text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-3xl font-bold text-white">{item.value}</span>
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-white">{item.label}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. CLIENTS & ORGANIZATIONS */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-2 border-b border-purple-500/20 pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">01 / Collaborations</p>
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">Clients &amp; Organizations</h2>
              <p className="mt-2 text-sm text-slate-400">Organizations connected to published client records.</p>
            </div>
            <span className="text-xs font-mono text-cyan-300">{clients.length} {clients.length === 1 ? "CLIENT" : "CLIENTS"}</span>
          </div>

          {clients.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <article key={client.id} className="group flex items-center justify-between gap-4 rounded-2xl border border-purple-500/20 bg-[#141444]/75 p-5 transition duration-300 hover:border-cyan-400/40">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-purple-500/20 bg-[#0e0e34] p-2.5">
                      {client.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={client.logoUrl} alt={`${client.name} logo`} className="h-full w-full object-contain" />
                      ) : (
                        <Building2 className="h-6 w-6 text-cyan-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-white transition group-hover:text-cyan-200">{client.name}</h3>
                      {client.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-cyan-300">
                          Visit website <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="mt-1 block text-xs text-slate-500">Client organization</span>
                      )}
                    </div>
                  </div>
                  <BadgeCheck className="h-5 w-5 shrink-0 text-cyan-400/80" aria-label="Client record" />
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-purple-500/30 bg-[#141444]/40 px-6 py-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-500" />
              <h3 className="mt-3 font-semibold text-white">Client details will appear here</h3>
              <p className="mt-1 text-sm text-slate-400">No client records are currently available to display.</p>
            </div>
          )}
        </section>

        {/* 3. TESTIMONIALS */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-2 border-b border-purple-500/20 pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">02 / Client feedback</p>
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">Testimonials</h2>
              <p className="mt-2 text-sm text-slate-400">Feedback shared by clients and collaborators.</p>
            </div>
            <span className="text-xs font-mono text-purple-300">{testimonials.length} {testimonials.length === 1 ? "REVIEW" : "REVIEWS"}</span>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="flex h-full flex-col justify-between gap-5 rounded-3xl border border-purple-500/20 bg-[#141444]/75 p-6 shadow-xl transition hover:border-purple-400/40 sm:p-7">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-purple-500/30 bg-[#0e0e34] text-sm font-bold text-cyan-300">
                          {testimonial.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={testimonial.avatarUrl} alt={testimonial.clientName} className="h-full w-full object-cover" />
                          ) : (
                            testimonial.clientName?.trim()?.charAt(0)?.toUpperCase() || "C"
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-bold text-white">{testimonial.clientName}</h3>
                          {testimonial.role ? <p className="mt-1 text-xs text-slate-400">{testimonial.role}</p> : null}
                        </div>
                      </div>
                      <Quote className="h-6 w-6 shrink-0 text-purple-300/60" />
                    </div>
                    <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-300">“{testimonial.content}”</p>
                  </div>
                  {testimonial.client?.name ? (
                    <div className="border-t border-purple-500/20 pt-4 text-xs text-cyan-300">Organization: {testimonial.client.name}</div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-purple-500/30 bg-[#141444]/40 px-6 py-10 text-center">
              <Quote className="mx-auto h-8 w-8 text-slate-500" />
              <h3 className="mt-3 font-semibold text-white">No testimonials published yet</h3>
              <p className="mt-1 text-sm text-slate-400">Client feedback will appear here when it is added.</p>
            </div>
          )}
        </section>

        {/* 4. PROJECT SCOPE & SERVICES */}
        <section className="space-y-6">
          <div className="border-b border-purple-500/20 pb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">03 / What I do</p>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">Project Scope &amp; Services</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Example service areas and deliverables. The exact scope, tools, and timeline are agreed for each project.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {scopeItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group rounded-3xl border border-purple-500/20 bg-[#141444]/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-[#0e0e34] text-cyan-300 transition group-hover:border-cyan-400/40">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs text-slate-500">SCOPE / 0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white transition group-hover:text-cyan-200">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => <span key={tag} className="rounded-full border border-purple-500/20 bg-[#0e0e34]/80 px-3 py-1.5 text-xs text-slate-300">{tag}</span>)}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 5. DELIVERY OUTCOMES */}
        <section className="space-y-6">
          <div className="border-b border-purple-500/20 pb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">04 / Delivery approach</p>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">Results &amp; Delivery Outcomes</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">The outcomes below describe delivery priorities, not guaranteed or measured claims. Project-specific metrics should be added only when verified.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {deliveryOutcomes.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-emerald-400/15 bg-[#101b3d]/70 p-5 transition hover:border-emerald-300/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/5 text-emerald-300"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-[#141444] via-[#1a1a52] to-[#141444] p-7 shadow-2xl sm:p-10 lg:flex-row">
          <div className="max-w-2xl text-center lg:text-left">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300"><Globe className="h-4 w-4" /> Let’s collaborate</p>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">Have a project in mind?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Share your requirements and let’s discuss a practical solution, deliverables, and timeline.</p>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-cyan-500 sm:w-auto">
            Contact Me <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
