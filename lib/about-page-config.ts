export interface AboutPageConfig {
  badgeText: string;
  heroHeading: string;
  heroHeadingHighlight: string;
  storyHeading: string;
  storyParagraph1: string;
  storyParagraph2: string;
  yearsExperience: string;
  uptimeGuarantee: string;
  systemsHandled: string;
  credentialsCount: string;
  methodologyTitle: string;
  methodologySubtitle: string;
  arsenalTitle: string;
  arsenalSubtitle: string;
  showMethodology: boolean;
  showArsenal: boolean;
  showCertifications: boolean;
  showContactCTA: boolean;
  ctaHeading: string;
  ctaDescription: string;
}

export const defaultAboutPageConfig: AboutPageConfig = {
  badgeText: "Professional Biography & Engineering Profile",
  heroHeading: "Engineering High-Uptime Networks, VoIP &",
  heroHeadingHighlight: "Perimeter Security",
  storyHeading: "Engineering Journey & Mission",
  storyParagraph1:
    "With extensive hands-on experience across Grandstream IP PBX, Cisco routing, FortiGate firewalls, and enterprise systems, I engineer resilient, secure, and maintainable infrastructures that empower mission-critical business communications.",
  storyParagraph2:
    "My focus centers on high availability, packet-level traffic QoS optimization, zero-trust perimeter security, and seamless multi-branch voice interconnectivity.",
  yearsExperience: "4+ Years",
  uptimeGuarantee: "99.99%",
  systemsHandled: "24+ Systems",
  credentialsCount: "10+ Verified",
  methodologyTitle: "Engineering Methodology & Pillars",
  methodologySubtitle: "How I approach enterprise infrastructure and system design.",
  arsenalTitle: "Technical Arsenal & Tools",
  arsenalSubtitle: "Categorized technologies and hardware platforms.",
  showMethodology: true,
  showArsenal: true,
  showCertifications: true,
  showContactCTA: true,
  ctaHeading: "Need a custom network, server, VoIP or security solution?",
  ctaDescription:
    "Share your requirement and let's discuss a practical, secure and maintainable technical approach.",
};

