import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import Link from "next/link";
import { Lock, ArrowLeft, ArrowUpRight, ShieldCheck, Mail, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy | Data Protection & Cookies | MD Tanvir Khan",
  description: "Comprehensive privacy policy regarding inquiries, cookies, data storage, and user privacy rights.",
};

const DEFAULT_PRIVACY = `### 1. Information Collection
We collect minimal personal information strictly necessary to provide an optimal browsing and communication experience. When you submit the contact form, we collect your name, email address, subject, and message content.

### 2. Usage of Collected Information
Your information is exclusively utilized to:
- Respond to direct inquiries, engineering project proposals, and consultation requests.
- Ensure website security, integrity, and abuse prevention.
- Review aggregated, anonymous visitor statistics to improve overall site experience.

### 3. Cookies & Session Storage
This website utilizes essential cookies to maintain secure administrator session states. We do not use third-party advertising cookies, and we never sell, rent, or trade your personal data.

### 4. Data Security & Storage
We employ industry-standard encryption protocols (SSL/TLS), parameterized database querying (PostgreSQL), and secure server configurations to protect your personal inquiries against unauthorized access.

### 5. Your Rights & Data Retention
You retain full rights to request access to, correction of, or permanent deletion of any personal information provided to us through the contact form. Contact us anytime to exercise your privacy rights.

### 6. Updates to This Policy
We reserve the right to revise this Privacy Policy periodically. The effective revision date will always be reflected at the top of this document.`;

export default async function PrivacyPage() {
  const [settings, profile] = await Promise.all([
    prisma.siteSetting.findMany(),
    (await prisma.profile.findFirst({ where: { id: "default-owner-profile" } })) || (await prisma.profile.findFirst()),
  ]);

  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const privacyContent = (settingsMap["privacy_content"] as string) || DEFAULT_PRIVACY;
  const siteAuthor = settingsMap["site_author"] || profile?.name || "MD Tanvir Khan";

  // Parse markdown-style sections (### Heading followed by paragraphs)
  const sections = privacyContent
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
            <Lock className="w-4 h-4 text-[#789BE0]" />
            <span>Privacy & Data Protection</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-[#DCE3F6] max-w-2xl leading-relaxed">
            Your privacy and confidentiality are of paramount importance. This document details how {siteAuthor} handles inquiries, safeguards information, and respects visitor confidentiality.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9BB0DD] pt-2 font-mono">
            <span>Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <span>•</span>
            <span className="text-[#789BE0] font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Privacy Standard</span>
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
              <span>Request Data Removal or Inquire</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#DCE3F6]">
              You may submit a request to inspect or permanently wipe any contact messages stored in our database.
            </p>
          </div>

          <Link
            href="/contact"
            className="min-h-[44px] inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#252E8A] to-[#00D2D3] hover:opacity-95 text-white text-xs font-bold shadow-glow-cyan transition-all shrink-0 hover:scale-105"
          >
            <span>Contact Privacy Desk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
