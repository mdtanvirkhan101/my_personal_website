export interface FooterLinkItem {
  name: string;
  href: string;
}

export interface SocialProfileItem {
  id: string;
  platform: string; // "github" | "linkedin" | "twitter" | "facebook" | "youtube" | "instagram" | "discord" | "whatsapp" | "telegram" | "website" | "other"
  url: string;
  label?: string;
}

export interface HeaderFooterConfig {
  // ================= HEADER (NAVBAR) =================
  headerSiteTitle: string;
  headerSiteTagline: string;
  headerSiteLogo: string;
  headerCta1Text: string;
  headerCta1Url: string;
  headerShowCta1: boolean;
  headerCta2Text: string;
  headerCta2Url: string;
  headerShowCta2: boolean;

  // ================= FOOTER =================
  footerBrandTitle: string;
  footerBrandTagline: string;
  footerBrandLogo: string;
  footerShowLogo: boolean;
  footerAboutTitle: string;
  footerAboutText: string;
  footerContactPhone: string;
  footerContactEmail: string;
  footerLocation: string;

  // Newsletter Section
  footerShowNewsletter: boolean;
  footerNewsletterTitle: string;
  footerNewsletterPlaceholder: string;
  footerNewsletterBtnText: string;

  // Copyright & Back to Top
  footerCopyrightText: string;
  footerShowSocials: boolean;
  footerShowScrollTop: boolean;

  // Social Links & Multiple Profiles
  footerFacebookUrl: string;
  footerGithubUrl: string;
  footerTwitterUrl: string;
  footerLinkedinUrl: string;
  footerSocialProfiles: SocialProfileItem[];

  // Footer Navigation Columns
  footerCol2Title: string;
  footerCol2Links: FooterLinkItem[];
  footerCol3Title: string;
  footerCol3Links: FooterLinkItem[];
}

export const defaultHeaderFooterConfig: HeaderFooterConfig = {
  // Header
  headerSiteTitle: "MD Tanvir Khan",
  headerSiteTagline: "SYSTEM & NETWORK ENGINEER",
  headerSiteLogo: "",
  headerCta1Text: "CV",
  headerCta1Url: "/resume",
  headerShowCta1: true,
  headerCta2Text: "Let's Talk",
  headerCta2Url: "/contact",
  headerShowCta2: true,

  // Footer
  footerBrandTitle: "MD Tanvir Khan",
  footerBrandTagline: "Systems & Network Engineer",
  footerBrandLogo: "",
  footerShowLogo: true,
  footerAboutTitle: "About Us",
  footerAboutText:
    "Specialized in high-performance enterprise networking, FortiGate security firewalls, VoIP infrastructures, and full-stack software architecture.",
  footerContactPhone: "+880 1601-501775",
  footerContactEmail: "mdtanvirkhan.nt@gmail.com",
  footerLocation: "Kuril, Bhatara, Dhaka-1229",

  footerShowNewsletter: true,
  footerNewsletterTitle: "Subscribe More Info",
  footerNewsletterPlaceholder: "Enter your Email",
  footerNewsletterBtnText: "Subscribe",

  footerCopyrightText: "{year} © MD Tanvir Khan. All Rights Reserved.",
  footerShowSocials: true,
  footerShowScrollTop: true,

  footerFacebookUrl: "https://facebook.com",
  footerGithubUrl: "https://github.com",
  footerTwitterUrl: "https://twitter.com",
  footerLinkedinUrl: "https://linkedin.com/in/mdtanvirkhan101/",
  footerSocialProfiles: [
    { id: "sp-1", platform: "github", url: "https://github.com", label: "GitHub" },
    { id: "sp-2", platform: "linkedin", url: "https://linkedin.com/in/mdtanvirkhan101/", label: "LinkedIn" },
    { id: "sp-3", platform: "twitter", url: "https://twitter.com", label: "Twitter / X" },
    { id: "sp-4", platform: "facebook", url: "https://facebook.com", label: "Facebook" },
    { id: "sp-5", platform: "whatsapp", url: "https://wa.me/8801601501775", label: "WhatsApp" },
  ],

  footerCol2Title: "Information",
  footerCol2Links: [
    { name: "About Us", href: "/about" },
    { name: "Project Archive", href: "/projects" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Blog & Insights", href: "/blog" },
    { name: "Certifications", href: "/certifications" },
    { name: "R&D Labs & Sandboxes", href: "/labs" },
  ],

  footerCol3Title: "Helpful Links",
  footerCol3Links: [
    { name: "Services", href: "/services" },
    { name: "Skills & Tools", href: "/skills" },
    { name: "Client Reviews", href: "/clients" },
    { name: "Resume & CV", href: "/resume" },
    { name: "Supports & Contact", href: "/contact" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};
