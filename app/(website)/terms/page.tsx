import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import Link from "next/link";
import { FileText, ArrowLeft, ArrowUpRight, ShieldCheck, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Conditions | Terms of Service | MD Tanvir Khan",
  description: "Terms and conditions regarding intellectual property, engineering deliverables, and site usage.",
};

const DEFAULT_TERMS = `### 1. Acceptance of Terms
By accessing or using this portfolio website and associated engineering services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue use immediately.

### 2. Intellectual Property Rights
All source code, project architectures, interface designs, articles, graphics, and technical documentation displayed on this website are the intellectual property of the author, unless explicitly marked as third-party open-source (e.g. MIT, Apache 2.0). Reproduction or commercial redistribution without prior written consent is strictly prohibited.

### 3. Engineering Engagements & Client Services
Professional engineering consultations, full-stack software development, and technical advisory services are performed subject to executed Statements of Work (SOW), service contracts, and mutual nondisclosure agreements (NDAs).

### 4. Third-Party Links & Services
This website may feature links to external platforms (such as GitHub, live demo deployments, and professional publications). We do not control or assume liability for the content, security, or practices of third-party platforms.

### 5. Limitation of Liability
The materials on this website are provided on an 'as is' basis. In no event shall the author be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this site.

### 6. Governing Law & Contact
These terms are governed by applicable commercial laws. For licensing, contract agreements, or inquiries, please reach out via our direct contact form.`;

export default async function TermsPage() {
  const [settings, profile] = await Promise.all([
    prisma.siteSetting.findMany(),
    (await prisma.profile.findFirst({ where: { id: "default-owner-profile" } })) || (await prisma.profile.findFirst()),
  ]);

  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const termsContent = (settingsMap["terms_content"] as string) || DEFAULT_TERMS;
  const siteAuthor = settingsMap["site_author"] || profile?.name || "MD Tanvir Khan";

  // Parse markdown-style sections (### Heading followed by paragraphs)
  const sections = termsContent
    .split(/\n(?=###?\s)/)
    .filter(Boolean)
    .map((chunk) => {
      const match = chunk.match(/^###?\s*(.+)\n([\s\S]*)$/);
      if (match) {
        return {
          title: match[1].trim(),
          body: match[2].trim(),
        };
      }
      return {
        title: "",
        body: chunk.trim(),
      };
    });

  return (
    <div className="min-h-screen bg-[#0E0E34] text-[#F7F6F7] relative selection:bg-[#00D2D3]/40 selection:text-[#F7F6F7] flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full relative z-10 space-y-10 sm:space-y-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#789BE0] hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </Link>

        {/* Hero Banner */}
        <div className="pb-8 border-b border-[#5A7FC8]/20 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#00D2D3]/15 border border-[#00D2D3]/35 text-[#DCE3F6] text-xs font-semibold">
            <FileText className="w-4 h-4 text-[#789BE0]" />
            <span>Legal Documentation</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Terms & Conditions
          </h1>

          <p className="text-sm sm:text-base text-[#DCE3F6] max-w-2xl leading-relaxed">
            Please read these terms and conditions carefully before utilizing this portfolio, its demonstration code repositories, or entering into software consulting agreements with {siteAuthor}.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9BB0DD] pt-2 font-mono">
            <span>Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <span>•</span>
            <span className="text-[#789BE0] font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Policy</span>
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#5A7FC8]/30 space-y-3"
            >
              {section.title && (
                <h2 className="font-heading text-lg font-bold text-white tracking-tight flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#789BE0] shrink-0" />
                  <span>{section.title}</span>
                </h2>
              )}
              <div className="text-xs sm:text-sm text-[#DCE3F6] leading-relaxed whitespace-pre-line font-normal pl-4 border-l border-[#5A7FC8]/30">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        {/* Inquiries Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#141444] to-[#222368]/60 border border-[#5A7FC8]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card">
          <div className="space-y-1.5">
            <h3 className="font-heading text-base font-bold text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#789BE0]" />
              <span>Questions Regarding Contract Terms?</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#DCE3F6]">
              For enterprise NDA requests, bespoke software licensing, or technical consulting proposals.
            </p>
          </div>

          <Link
            href="/contact"
            className="min-h-[44px] inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#252E8A] to-[#00D2D3] hover:opacity-95 text-white text-xs font-bold shadow-glow-cyan transition-all shrink-0 hover:scale-105"
          >
            <span>Contact Directly</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
