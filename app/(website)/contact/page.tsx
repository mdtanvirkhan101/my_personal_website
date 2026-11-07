import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { ContactForm } from "@/components/website/contact-form";
import { PremiumBackground } from "@/components/website/premium-background";
import { Mail, MapPin, Clock, ShieldCheck, Lock, Terminal, MessageSquare, Phone, Send, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import { getContactPageConfig } from "@/actions/contact-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contact & Security Consultations | MD Tanvir Khan",
  description:
    "Direct communication channel for network architecture, cybersecurity audits, and enterprise infrastructure projects with MD Tanvir Khan.",
};

export default async function ContactPage() {
  const config = await getContactPageConfig();

  return (
    <div className="min-h-screen bg-[#0e0e34] text-[#94A3B8] relative selection:bg-[#a78bfa]/40 selection:text-[#FFFFFF] flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Contact Info & Security Value Prop */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#a78bfa]/15 border border-[#a78bfa]/35 text-[#a78bfa] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>{config.badgeText || "Secure Communication Channel"}</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#FFFFFF]">
              {config.headingMain || "Get in"}{" "}
              <span className="text-gradient-cyan">{config.headingHighlight || "Touch"}</span>
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-normal">
              {config.description ||
                "Whether you need an enterprise network architecture audit, cybersecurity consultation, or want to discuss a complex infrastructure project, let's connect securely."}
            </p>

            <div className="pt-2 sm:pt-4 space-y-4">
              {/* Professional Email */}
              {config.email && (
                <div className="flex items-center space-x-3.5 text-xs text-[#94A3B8]">
                  <div className="w-11 h-11 rounded-2xl bg-[#141444] border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 shadow-md">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#a78bfa] font-mono uppercase font-semibold">
                      {config.emailLabel || "Professional Domain Email"}
                    </div>
                    <a
                      href={`mailto:${config.email}`}
                      className="font-semibold text-[#FFFFFF] hover:text-[#a78bfa] transition-colors truncate block"
                    >
                      {config.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Direct Phone / WhatsApp if configured */}
              {config.phone && (
                <div className="flex items-center space-x-3.5 text-xs text-[#94A3B8]">
                  <div className="w-11 h-11 rounded-2xl bg-[#141444] border border-[#a78bfa]/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-emerald-400 font-mono uppercase font-semibold">
                      {config.phoneLabel || "Direct Phone / WhatsApp"}
                    </div>
                    <a
                      href={`tel:${config.phone.replace(/[^0-9+]/g, "")}`}
                      className="font-semibold text-[#FFFFFF] hover:text-emerald-400 transition-colors truncate block"
                    >
                      {config.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Location & Timezone */}
              {config.location && (
                <div className="flex items-center space-x-3.5 text-xs text-[#94A3B8]">
                  <div className="w-11 h-11 rounded-2xl bg-[#141444] border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#a78bfa] font-mono uppercase font-semibold">
                      {config.locationLabel || "Location & Timezone"}
                    </div>
                    <span className="font-semibold text-[#FFFFFF] truncate block">
                      {config.location}
                    </span>
                  </div>
                </div>
              )}

              {/* Response Window */}
              {config.responseWindow && (
                <div className="flex items-center space-x-3.5 text-xs text-[#94A3B8]">
                  <div className="w-11 h-11 rounded-2xl bg-[#141444] border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 shadow-md">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#a78bfa] font-mono uppercase font-semibold">
                      {config.responseWindowLabel || "Response Window"}
                    </div>
                    <span className="font-semibold text-[#FFFFFF] truncate block">
                      {config.responseWindow}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Instant Chat Buttons if enabled */}
            {config.showDirectChatButtons && (config.whatsappNumber || config.telegramUsername) && (
              <div className="pt-2 flex flex-wrap gap-2.5">
                {config.whatsappNumber && (
                  <a
                    href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi Tanvir, I would like to discuss a project.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                  >
                    <span>💬 Chat on WhatsApp</span>
                  </a>
                )}
                {config.telegramUsername && (
                  <a
                    href={`https://t.me/${config.telegramUsername.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-colors"
                  >
                    <span>✈️ Telegram Direct</span>
                  </a>
                )}
              </div>
            )}

            {/* Security & Confidentiality Note */}
            <div className="p-5 rounded-2xl bg-[#141444]/70 border border-[#a78bfa]/25 text-xs text-[#94A3B8] leading-relaxed space-y-2">
              <div className="flex items-center space-x-2 text-[#a78bfa] font-bold">
                <Lock className="w-4 h-4" />
                <span>{config.securityBadgeTitle || "Security & Encryption Standard"}</span>
              </div>
              <p>
                {config.securityDescription ||
                  "All infrastructure briefings, network topology disclosures, and security audits are processed under strict confidentiality protocols. NDA agreements are welcomed and available upon request."}
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] font-mono text-[#a78bfa]">
                <Terminal className="w-3.5 h-3.5" />
                <span>{config.securityFooterNote || "Protected by reCAPTCHA Enterprise & TLS 1.3 Encryption"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7 w-full">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#a78bfa]/25 bg-[#141444]/60 shadow-2xl relative">
              <div className="mb-6 pb-4 border-b border-[#a78bfa]/15 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#FFFFFF] font-heading">
                    {config.formPortalTitle || "Secure Inquiry Portal"}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {config.formPortalSubtitle || "Fill out the form below to initiate direct communication."}
                  </p>
                </div>
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0e0e34] border border-[#a78bfa]/30 text-[10px] text-[#a78bfa] font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${config.isFormActive !== false ? "bg-[#a78bfa] animate-pulse" : "bg-amber-400"}`} />
                  <span>{config.isFormActive !== false ? (config.formStatusBadge || "Secure Node Active") : "Paused"}</span>
                </div>
              </div>

              {/* Inactive Form Notification or Live Form */}
              {config.isFormActive === false ? (
                <div className="p-8 rounded-2xl bg-[#0E0E34]/80 border border-amber-500/30 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Inquiries Temporarily Paused</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {config.formInactiveNotice ||
                      "Direct inquiries are temporarily paused. Please reach out via email directly."}
                  </p>
                  {config.email && (
                    <a
                      href={`mailto:${config.email}`}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email Directly ({config.email})</span>
                    </a>
                  )}
                </div>
              ) : (
                <ContactForm successMessage={config.formSuccessMessage} />
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
