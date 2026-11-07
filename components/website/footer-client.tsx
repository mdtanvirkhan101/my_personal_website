"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HeaderFooterConfig } from "@/lib/header-footer-config";
import {
  Terminal,
  Phone,
  Mail,
  MapPin,
  Send,
  Github,
  Linkedin,
  Twitter,
  ChevronUp,
  CheckCircle2,
  Youtube,
  Instagram,
  MessageCircle,
  MessageSquare,
  Globe,
  Share2,
} from "lucide-react";

interface FooterClientProps {
  config: HeaderFooterConfig;
}

function renderSocialIcon(platform: string) {
  const p = (platform || "").toLowerCase();
  switch (p) {
    case "github":
      return <Github className="w-4 h-4" />;
    case "linkedin":
      return <Linkedin className="w-4 h-4" />;
    case "twitter":
    case "x":
      return <Twitter className="w-4 h-4" />;
    case "facebook":
      return <span className="font-bold text-xs font-mono">f</span>;
    case "youtube":
      return <Youtube className="w-4 h-4" />;
    case "instagram":
      return <Instagram className="w-4 h-4" />;
    case "whatsapp":
      return <MessageCircle className="w-4 h-4" />;
    case "telegram":
      return <Send className="w-4 h-4" />;
    case "discord":
      return <MessageSquare className="w-4 h-4" />;
    case "website":
      return <Globe className="w-4 h-4" />;
    default:
      return <Share2 className="w-4 h-4" />;
  }
}

export function FooterClient({ config }: FooterClientProps) {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  const copyrightText = (
    config.footerCopyrightText ||
    "{year} © " + (config.footerBrandTitle || "MD Tanvir Khan") + ". All Rights Reserved."
  ).replace("{year}", String(currentYear));

  const hasMultipleSocials =
    Array.isArray(config.footerSocialProfiles) && config.footerSocialProfiles.length > 0;

  return (
    <footer className="relative z-10 border-t border-cyan-500/20 bg-[#0e0e34] text-slate-300 font-sans shadow-2xl w-full">
      {/* Top Ambient Glass Glow Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      <div className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-14 space-y-8 relative">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand, About, Contact (Span 4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                {config.footerBrandLogo && config.footerShowLogo !== false ? (
                  <img
                    src={config.footerBrandLogo}
                    alt={config.footerBrandTitle || "Brand Logo"}
                    className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shadow-inner shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
                    <Terminal className="w-4 h-4" />
                  </div>
                )}
                <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white">
                  {config.footerBrandTitle || "MD Tanvir Khan"}
                </span>
              </div>
              {config.footerBrandTagline && (
                <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase pl-12">
                  {config.footerBrandTagline}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono font-extrabold tracking-widest text-cyan-400 uppercase">
                {config.footerAboutTitle || "About Us"}
              </h3>
              <p className="text-sm font-normal text-slate-300 leading-relaxed max-w-sm text-justify">
                {config.footerAboutText ||
                  "Specialized in high-performance enterprise networking, FortiGate security firewalls, VoIP infrastructures, and full-stack software architecture."}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-mono font-extrabold tracking-widest text-cyan-400 uppercase">
                Contact Us
              </h3>
              <div className="space-y-2 text-sm font-mono text-slate-300">
                {config.footerContactPhone && (
                  <a
                    href={`tel:${config.footerContactPhone.replace(/\s+/g, "")}`}
                    className="flex items-center space-x-2.5 hover:text-cyan-400 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{config.footerContactPhone}</span>
                  </a>
                )}
                {config.footerContactEmail && (
                  <a
                    href={`mailto:${config.footerContactEmail}`}
                    className="flex items-center space-x-2.5 hover:text-cyan-400 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{config.footerContactEmail}</span>
                  </a>
                )}
                {config.footerLocation && (
                  <div className="flex items-center space-x-2.5 text-slate-400 text-xs pt-0.5">
                    <MapPin className="w-4 h-4 text-cyan-400/80 shrink-0" />
                    <span>{config.footerLocation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links (Span 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-mono font-extrabold tracking-widest text-cyan-400 uppercase">
              {config.footerCol2Title || "Information"}
            </h3>
            <ul className="space-y-3 text-sm font-medium text-slate-300">
              {(config.footerCol2Links || []).map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="hover:text-cyan-400 transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Helpful Links (Span 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono font-extrabold tracking-widest text-cyan-400 uppercase">
              {config.footerCol3Title || "Helpful Links"}
            </h3>
            <ul className="space-y-3 text-sm font-medium text-slate-300">
              {(config.footerCol3Links || []).map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="hover:text-cyan-400 transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Subscribe Newsletter & Scroll Button (Span 3 cols) */}
          <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
            {config.footerShowNewsletter !== false && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-extrabold tracking-widest text-white uppercase">
                  {config.footerNewsletterTitle || "Subscribe More Info"}
                </h3>

                {subscribed ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Thank you for subscribing!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          config.footerNewsletterPlaceholder || "Enter your Email"
                        }
                        required
                        className="w-full bg-[#141444] border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/60 transition-colors shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>{config.footerNewsletterBtnText || "Subscribe"}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Back to Top Button */}
            {config.footerShowScrollTop !== false && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={scrollToTop}
                  type="button"
                  aria-label="Scroll to top"
                  className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Horizontal Divider & Credits */}
        <div className="border-t border-cyan-500/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social Icons */}
          {config.footerShowSocials !== false && (
            <div className="flex items-center flex-wrap gap-2.5 order-1 sm:order-2">
              {hasMultipleSocials ? (
                config.footerSocialProfiles.map((item) => {
                  if (!item.url) return null;
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label || item.platform}
                      title={item.label || item.platform}
                      className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-sm group"
                    >
                      {renderSocialIcon(item.platform)}
                    </a>
                  );
                })
              ) : (
                <>
                  {config.footerFacebookUrl && (
                    <a
                      href={config.footerFacebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-sm font-bold text-xs font-mono"
                    >
                      f
                    </a>
                  )}
                  {config.footerGithubUrl && (
                    <a
                      href={config.footerGithubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {config.footerTwitterUrl && (
                    <a
                      href={config.footerTwitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Twitter"
                      className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {config.footerLinkedinUrl && (
                    <a
                      href={config.footerLinkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </>
              )}
            </div>
          )}

          {/* Copyright */}
          <p className="text-xs sm:text-sm text-slate-400 order-2 sm:order-1 font-mono">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
