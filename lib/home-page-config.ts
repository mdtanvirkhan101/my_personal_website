export interface HomePageConfig {
  // Hero Section
  heroGreeting: string;
  heroName: string;
  heroNameHighlight: string;
  heroRole: string;
  heroDescription: string;
  heroPrimaryBtnText: string;
  heroPrimaryBtnUrl: string;
  heroSecondaryBtnText: string;
  heroSecondaryBtnUrl: string;
  heroSocialText: string;
  heroBadge1Value: string;
  heroBadge1Label: string;
  heroBadge2Value: string;
  heroBadge2Label: string;
  heroAvatarUrl: string;

  // Key Metrics Strip
  metric1Value: number;
  metric1Suffix: string;
  metric1Label: string;
  metric2Value: number;
  metric2Suffix: string;
  metric2Label: string;
  metric3Value: number;
  metric3Suffix: string;
  metric3Label: string;
  metric4Value: number;
  metric4Suffix: string;
  metric4Label: string;

  // Section Visibilities
  showHero: boolean;
  showMetrics: boolean;
  showAbout: boolean;
  showSkills: boolean;
  showServices: boolean;
  showProjects: boolean;
  showExperience: boolean;
  showLabs: boolean;
  showCertifications: boolean;
  showClients: boolean;
  showBlog: boolean;
  showContact: boolean;

  // Section Titles & Subtitles
  aboutTitle: string;
  aboutButtonText: string;
  skillsTitle: string;
  servicesBadge: string;
  servicesTitle: string;
  projectsTitle: string;
  projectsLinkText: string;
  experienceTitle: string;
  labsTitle: string;
  certificationsTitle: string;
  clientsTitle: string;
  blogTitle: string;

  // Display Item Limits
  projectsLimit: number;
  servicesLimit: number;
  skillsLimit: number;
  experiencesLimit: number;
  labsLimit: number;
  certificationsLimit: number;
  blogPostsLimit: number;

  // Contact CTA Banner
  contactBadge: string;
  contactTitle: string;
  contactDescription: string;
  contactBullet1: string;
  contactBullet2: string;
  contactBullet3: string;
  contactFormTitle: string;
  contactSubmitText: string;
}

export const defaultHomePageConfig: HomePageConfig = {
  heroGreeting: "👋 Hello, I'm",
  heroName: "MD Tanvir",
  heroNameHighlight: "Khan",
  heroRole: "Network & VoIP Engineer | Security & Infrastructure Specialist",
  heroDescription:
    "Network & VoIP Engineer with hands-on experience in Grandstream IP PBX, FXO/FXS gateways, IVR design & IP telephony deployment. Experienced in managing LAN/WAN infrastructure, configuring network devices & troubleshooting real-world voice and data issues to maintain high system uptime.",
  heroPrimaryBtnText: "Hire Me",
  heroPrimaryBtnUrl: "#contact",
  heroSecondaryBtnText: "View Projects",
  heroSecondaryBtnUrl: "#projects",
  heroSocialText: "Follow me on",
  heroBadge1Value: "5+",
  heroBadge1Label: "Years Experience",
  heroBadge2Value: "50+",
  heroBadge2Label: "Projects Completed",
  heroAvatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",

  metric1Value: 5,
  metric1Suffix: "+",
  metric1Label: "Years Experience",
  metric2Value: 50,
  metric2Suffix: "+",
  metric2Label: "Projects Completed",
  metric3Value: 30,
  metric3Suffix: "+",
  metric3Label: "Happy Clients",
  metric4Value: 25,
  metric4Suffix: "+",
  metric4Label: "Technologies & Tools",

  showHero: true,
  showMetrics: true,
  showAbout: true,
  showSkills: true,
  showServices: true,
  showProjects: true,
  showExperience: true,
  showLabs: true,
  showCertifications: true,
  showClients: true,
  showBlog: true,
  showContact: true,

  aboutTitle: "About Me",
  aboutButtonText: "More About Me",
  skillsTitle: "My Skills",
  servicesBadge: "Capabilities",
  servicesTitle: "Services / What I Do",
  projectsTitle: "Featured Projects",
  projectsLinkText: "View All Projects",
  experienceTitle: "Experience Timeline",
  labsTitle: "R&D Sandbox Labs",
  certificationsTitle: "Accredited Certifications",
  clientsTitle: "What Clients Say",
  blogTitle: "Latest Blog Posts",

  projectsLimit: 4,
  servicesLimit: 4,
  skillsLimit: 9,
  experiencesLimit: 3,
  labsLimit: 3,
  certificationsLimit: 3,
  blogPostsLimit: 3,

  contactBadge: "Let's connect",
  contactTitle: "Have a Project in Mind?",
  contactDescription:
    "Tell us about your project—whether it's VoIP, web systems, enterprise routing, or automation.",
  contactBullet1: "Expect response within 6 hours",
  contactBullet2: "Get a dedicated specialist for clear next steps",
  contactBullet3: "We are ready to sign NDA prior to your idea.",
  contactFormTitle: "We are just One-click away!",
  contactSubmitText: "Send Direct Message",
};
