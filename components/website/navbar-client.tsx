"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Sparkles,
  FileText,
  Code2,
  ArrowUpRight,
  Search,
} from "lucide-react";

interface NavbarClientProps {
  siteTitle: string;
  siteTagline: string;
  siteLogo: string;
  adminName: string;
  cta1Text?: string;
  cta1Url?: string;
  showCta1?: boolean;
  cta2Text?: string;
  cta2Url?: string;
  showCta2?: boolean;
}

const primaryNav = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Case Studies", href: "/case-studies" },
  { name: "Experience", href: "/experience" },
  { name: "Skills", href: "/skills" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
];

const moreNav = [
  { name: "About", href: "/about" },
  { name: "Certifications", href: "/certifications" },
  { name: "Clients", href: "/clients" },
  { name: "Labs", href: "/labs" },
  { name: "Resume", href: "/resume" },
  { name: "Contact", href: "/contact" },
];

export function NavbarClient({
  siteTitle,
  siteTagline,
  siteLogo,
  cta1Text = "CV",
  cta1Url = "/resume",
  showCta1 = true,
  cta2Text = "Let's Talk",
  cta2Url = "/contact",
  showCta2 = true,
}: NavbarClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0e0e34] border-b border-slate-800/80 shadow-2xl transition-all">
      {/* Main Navbar Container */}
      <div className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo & Title with Subtitle */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          {siteLogo ? (
            <img
              src={siteLogo}
              alt={siteTitle}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-cyan-500/30 group-hover:border-cyan-400 transition-colors"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-all">
              <Code2 className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors block truncate max-w-[180px] sm:max-w-xs">
              {siteTitle || "MD Tanvir Khan"}
            </span>
            <span className="hidden sm:block text-[10px] text-cyan-400 font-mono tracking-widest uppercase truncate max-w-xs">
              {siteTagline || "SYSTEM & NETWORK ENGINEER"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1 text-xs font-semibold text-slate-300 bg-[#0e0e34] p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
          {primaryNav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-white font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#141444]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbarActiveIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 rounded-lg shadow-inner -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-xs hover:text-white hover:bg-[#141444] transition-all text-slate-400 font-semibold"
              aria-expanded={dropdownOpen}
            >
              <span>More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 text-cyan-400 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0e0e34] border border-cyan-500/30 p-2 shadow-2xl z-50 backdrop-blur-xl"
                >
                  <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold border-b border-slate-800">
                    Additional Options
                  </div>
                  <div className="py-1">
                    {moreNav.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            isActive
                              ? "bg-cyan-500/10 border border-cyan-500/30 text-white font-bold"
                              : "text-slate-300 hover:bg-[#141444] hover:text-white"
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Search Shortcut Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            className="hidden md:inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0e0e34] hover:bg-[#141444] border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-xs font-mono transition-all shadow-inner"
            title="Search portfolio (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Search</span>
            <kbd className="text-[10px] bg-[#141444] border border-purple-500/30 px-1.5 py-0.5 rounded text-cyan-300">
              Ctrl+K
            </kbd>
          </button>

          {showCta1 && (
            <Link
              href={cta1Url || "/resume"}
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white bg-[#0e0e34] hover:bg-[#141444] border border-slate-800 hover:border-cyan-500/40 px-3.5 py-2 rounded-xl transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{cta1Text}</span>
            </Link>
          )}

          {showCta2 && (
            <Link
              href={cta2Url || "/contact"}
              className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-[#0e0e34] hover:bg-[#141444] border border-cyan-500/40 hover:border-cyan-400 px-4 py-2 rounded-xl transition-all shadow-md shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>{cta2Text}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-[#0e0e34] border border-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden absolute top-full left-0 right-0 bg-[#0e0e34] border-b border-cyan-500/30 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="w-full space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2 font-bold">
                  Main Navigation
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {primaryNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        pathname === item.href
                          ? "bg-cyan-500/10 border border-cyan-500/40 text-white font-bold"
                          : "bg-[#0e0e34] text-slate-300 hover:text-white border border-slate-800"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-bold">
                  More Pages
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {moreNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        pathname === item.href
                          ? "bg-cyan-500/10 border border-cyan-500/40 text-white font-bold"
                          : "bg-[#0e0e34] text-slate-300 hover:text-white border border-slate-800"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-500" />
                    </Link>
                  ))}
                </div>
              </div>

              {(showCta1 || showCta2) && (
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  {showCta2 && (
                    <Link
                      href={cta2Url || "/contact"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-center rounded-xl bg-[#0e0e34] border border-cyan-500/40 text-white font-bold text-xs shadow-md shadow-cyan-500/10"
                    >
                      {cta2Text}
                    </Link>
                  )}
                  {showCta1 && (
                    <Link
                      href={cta1Url || "/resume"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-4 text-center rounded-xl bg-[#0e0e34] border border-slate-800 text-xs text-slate-300 font-mono font-bold"
                    >
                      {cta1Text}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}