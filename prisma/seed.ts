import { PrismaClient, UserRole, PublishStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const rawPassword = process.env.ADMIN_PASSWORD || "admin_secure_password_123!";
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      active: true,
    },
    create: {
      name: "MD Tanvir Khan",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      active: true,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Seed Profile
  const profile = await prisma.profile.upsert({
    where: { id: "default-owner-profile" },
    update: {},
    create: {
      id: "default-owner-profile",
      name: "MD Tanvir Khan",
      headline: "Full-Stack Software Engineer & Creative Technologist",
      bio: "Crafting modern, scalable web applications, custom CMS architectures, and fluid interactive digital experiences.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      resumeUrl: "/resume.pdf",
      email: "contact@example.com",
      location: "Dhaka, Bangladesh",
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    },
  });
  console.log(`✅ Profile seeded: ${profile.name}`);

  // 3. Seed Skills
  const skillsData = [
    { name: "TypeScript", category: "Languages", level: 5, sortOrder: 1 },
    { name: "Next.js (App Router)", category: "Frontend", level: 5, sortOrder: 2 },
    { name: "React", category: "Frontend", level: 5, sortOrder: 3 },
    { name: "Tailwind CSS", category: "Frontend", level: 5, sortOrder: 4 },
    { name: "Motion for React", category: "Frontend", level: 4, sortOrder: 5 },
    { name: "Node.js", category: "Backend", level: 5, sortOrder: 6 },
    { name: "PostgreSQL", category: "Database", level: 4, sortOrder: 7 },
    { name: "Prisma ORM", category: "Database", level: 5, sortOrder: 8 },
    { name: "REST & GraphQL", category: "Backend", level: 4, sortOrder: 9 },
    { name: "Docker", category: "DevOps", level: 3, sortOrder: 10 },
  ];

  for (const s of skillsData) {
    const existing = await prisma.skill.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.skill.create({ data: s });
    }
  }
  console.log(`✅ Skills seeded (${skillsData.length} items)`);

  // 4. Seed Services
  const servicesData = [
    {
      title: "Full-Stack Web Development",
      slug: "full-stack-web-development",
      description: "End-to-end web applications built with Next.js, Node.js, and PostgreSQL for maximum performance and reliability.",
      icon: "Code",
      sortOrder: 1,
    },
    {
      title: "Custom CMS & Admin Panels",
      slug: "custom-cms-admin-panels",
      description: "Bespoke, secure content management systems designed specifically around your data workflow.",
      icon: "Layers",
      sortOrder: 2,
    },
    {
      title: "Interactive UI & Micro-Animations",
      slug: "interactive-ui-micro-animations",
      description: "Fluid, high-performance web experiences using Tailwind CSS and Motion for React that captivate users.",
      icon: "Sparkles",
      sortOrder: 3,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`✅ Services seeded (${servicesData.length} items)`);

  // 5. Seed Network / System / Security demo projects
  const project1 = await prisma.project.upsert({
    where: { slug: "enterprise-network-security-lab" },
    update: {
      title: "Enterprise Network Security & Multi-VLAN Lab",
      summary: "A complete enterprise-style network lab featuring VLAN segmentation, inter-VLAN routing, VPN access, firewall policies, monitoring, and backup planning.",
      content: "Designed and implemented a segmented enterprise network architecture for users, servers, management, guest access, and security services. The build demonstrates routing, switching, secure remote access, monitoring, logging, hardening, and recovery practices.",
      coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      stack: ["MikroTik RouterOS", "VLAN", "OSPF", "WireGuard", "Firewall", "Zabbix", "Syslog"],
      liveUrl: null,
      repoUrl: "https://github.com/example/enterprise-network-security-lab",
      featured: true,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Enterprise Network Security & Multi-VLAN Lab",
      seoDescription: "Enterprise network lab covering VLANs, routing, VPN, firewall security, monitoring, logging, and backup.",
      attachments: {
        category: "network-security",
        projectType: "lab",
        projectEnvironment: "virtual",
        objective: "Build a realistic enterprise network lab with segmentation, secure remote access, centralized monitoring, and documented recovery procedures.",
        roleResponsibilities: "Designed the topology, IP plan, VLAN structure, routing, firewall policies, VPN access, monitoring, testing, and documentation.",
        osPlatform: "MikroTik RouterOS, Linux Server, Windows Client",
        protocolsServices: "802.1Q VLAN, OSPF, DHCP, DNS, NAT, WireGuard, SNMP, Syslog, SSH",
        keyFeatures: "Department VLAN segmentation; inter-VLAN routing; secure management network; WireGuard remote-access VPN; firewall filtering; centralized monitoring and logging.",
        implementationSteps: "Planned the IP addressing and VLANs; created trunk/access ports; configured gateways and DHCP; enabled routing; applied firewall rules; deployed VPN; added monitoring/logging; tested isolation, failover, and remote access.",
        securityMeasures: "Default-deny inter-VLAN policy, least-privilege firewall rules, isolated management access, encrypted WireGuard VPN, restricted administrative services, and centralized logging.",
        monitoringLogging: "SNMP monitoring with Zabbix plus centralized Syslog for network and security events.",
        backupRecovery: "Scheduled RouterOS configuration exports and binary backups with documented restore procedures.",
        gallery: [],
        architectureDiagram: "",
        documentationUrl: "",
        startDate: "2026-09-01",
        completionDate: "2026-10-15",
        lessonsLearned: "Improved practical understanding of segmentation, routing policy, firewall rule ordering, secure remote access, observability, and recovery planning."
      },
    },
    create: {
      title: "Enterprise Network Security & Multi-VLAN Lab",
      slug: "enterprise-network-security-lab",
      summary: "A complete enterprise-style network lab featuring VLAN segmentation, inter-VLAN routing, VPN access, firewall policies, monitoring, and backup planning.",
      content: "Designed and implemented a segmented enterprise network architecture for users, servers, management, guest access, and security services. The build demonstrates routing, switching, secure remote access, monitoring, logging, hardening, and recovery practices.",
      coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      stack: ["MikroTik RouterOS", "VLAN", "OSPF", "WireGuard", "Firewall", "Zabbix", "Syslog"],
      liveUrl: null,
      repoUrl: "https://github.com/example/enterprise-network-security-lab",
      featured: true,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Enterprise Network Security & Multi-VLAN Lab",
      seoDescription: "Enterprise network lab covering VLANs, routing, VPN, firewall security, monitoring, logging, and backup.",
      attachments: {
        category: "network-security",
        projectType: "lab",
        projectEnvironment: "virtual",
        objective: "Build a realistic enterprise network lab with segmentation, secure remote access, centralized monitoring, and documented recovery procedures.",
        roleResponsibilities: "Designed the topology, IP plan, VLAN structure, routing, firewall policies, VPN access, monitoring, testing, and documentation.",
        osPlatform: "MikroTik RouterOS, Linux Server, Windows Client",
        protocolsServices: "802.1Q VLAN, OSPF, DHCP, DNS, NAT, WireGuard, SNMP, Syslog, SSH",
        keyFeatures: "Department VLAN segmentation; inter-VLAN routing; secure management network; WireGuard remote-access VPN; firewall filtering; centralized monitoring and logging.",
        implementationSteps: "Planned the IP addressing and VLANs; created trunk/access ports; configured gateways and DHCP; enabled routing; applied firewall rules; deployed VPN; added monitoring/logging; tested isolation, failover, and remote access.",
        securityMeasures: "Default-deny inter-VLAN policy, least-privilege firewall rules, isolated management access, encrypted WireGuard VPN, restricted administrative services, and centralized logging.",
        monitoringLogging: "SNMP monitoring with Zabbix plus centralized Syslog for network and security events.",
        backupRecovery: "Scheduled RouterOS configuration exports and binary backups with documented restore procedures.",
        gallery: [],
        architectureDiagram: "",
        documentationUrl: "",
        startDate: "2026-09-01",
        completionDate: "2026-10-15",
        lessonsLearned: "Improved practical understanding of segmentation, routing policy, firewall rule ordering, secure remote access, observability, and recovery planning."
      },
      caseStudy: {
        create: {
          problem: "A flat network provides weak isolation, broad broadcast domains, and excessive lateral movement opportunities.",
          process: "Designed VLAN and IP plans, built routing and security policy, deployed VPN and monitoring, then validated segmentation and access paths.",
          solution: "Implemented segmented VLANs with controlled inter-VLAN routing, restrictive firewall rules, WireGuard VPN, SNMP monitoring, and centralized logging.",
          outcome: "Produced a repeatable enterprise lab where network zones are isolated by policy and administrative access is protected and observable.",
        },
      },
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: "windows-server-infrastructure-lab" },
    update: {
      title: "Windows Server Infrastructure Lab",
      summary: "A system administration lab demonstrating Active Directory, DNS, DHCP, Group Policy, file services, virtualization, monitoring, and backup.",
      content: "Built a Windows Server environment to demonstrate centralized identity, endpoint policy, core infrastructure services, permissions, monitoring, and recovery.",
      coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      stack: ["Windows Server", "Active Directory", "DNS", "DHCP", "Group Policy", "Hyper-V"],
      liveUrl: null,
      repoUrl: null,
      featured: true,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Windows Server Infrastructure Lab",
      seoDescription: "Windows Server lab with Active Directory, DNS, DHCP, Group Policy, virtualization, monitoring, and backup.",
      attachments: {
        category: "systems-virtualization",
        projectType: "lab",
        projectEnvironment: "virtual",
        objective: "Create a manageable Windows domain environment for identity, policy, infrastructure services, and recovery testing.",
        roleResponsibilities: "Installed servers, configured AD DS, DNS, DHCP, organizational units, users, groups, Group Policy, file permissions, monitoring, and backups.",
        osPlatform: "Windows Server and Windows Client",
        protocolsServices: "Active Directory, DNS, DHCP, SMB, RDP, NTP",
        keyFeatures: "Centralized authentication, Group Policy, DHCP scopes, DNS zones, shared folders, role-based permissions, virtualization, and backup.",
        implementationSteps: "Created virtual machines; installed Windows Server; promoted the domain controller; configured DNS/DHCP; created OUs/users/groups; applied GPOs; configured file services; tested client joins and permissions.",
        securityMeasures: "Least-privilege groups, restricted administrative access, password/account policies, endpoint policies, and controlled file permissions.",
        monitoringLogging: "Windows Event Viewer and service-health monitoring.",
        backupRecovery: "System-state and configuration backup plan with restore testing.",
        gallery: [],
        architectureDiagram: "",
        documentationUrl: "",
        startDate: "2026-08-01",
        completionDate: "2026-08-25",
        lessonsLearned: "Strengthened understanding of Windows identity, DNS dependency, Group Policy processing, permissions, and recovery."
      },
    },
    create: {
      title: "Windows Server Infrastructure Lab",
      slug: "windows-server-infrastructure-lab",
      summary: "A system administration lab demonstrating Active Directory, DNS, DHCP, Group Policy, file services, virtualization, monitoring, and backup.",
      content: "Built a Windows Server environment to demonstrate centralized identity, endpoint policy, core infrastructure services, permissions, monitoring, and recovery.",
      coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      stack: ["Windows Server", "Active Directory", "DNS", "DHCP", "Group Policy", "Hyper-V"],
      liveUrl: null,
      repoUrl: null,
      featured: true,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Windows Server Infrastructure Lab",
      seoDescription: "Windows Server lab with Active Directory, DNS, DHCP, Group Policy, virtualization, monitoring, and backup.",
      attachments: {
        category: "systems-virtualization",
        projectType: "lab",
        projectEnvironment: "virtual",
        objective: "Create a manageable Windows domain environment for identity, policy, infrastructure services, and recovery testing.",
        roleResponsibilities: "Installed servers, configured AD DS, DNS, DHCP, organizational units, users, groups, Group Policy, file permissions, monitoring, and backups.",
        osPlatform: "Windows Server and Windows Client",
        protocolsServices: "Active Directory, DNS, DHCP, SMB, RDP, NTP",
        keyFeatures: "Centralized authentication, Group Policy, DHCP scopes, DNS zones, shared folders, role-based permissions, virtualization, and backup.",
        implementationSteps: "Created virtual machines; installed Windows Server; promoted the domain controller; configured DNS/DHCP; created OUs/users/groups; applied GPOs; configured file services; tested client joins and permissions.",
        securityMeasures: "Least-privilege groups, restricted administrative access, password/account policies, endpoint policies, and controlled file permissions.",
        monitoringLogging: "Windows Event Viewer and service-health monitoring.",
        backupRecovery: "System-state and configuration backup plan with restore testing.",
        gallery: [],
        architectureDiagram: "",
        documentationUrl: "",
        startDate: "2026-08-01",
        completionDate: "2026-08-25",
        lessonsLearned: "Strengthened understanding of Windows identity, DNS dependency, Group Policy processing, permissions, and recovery."
      },
    },
  });

  console.log(`✅ Portfolio demo projects seeded (${project1.title}, ${project2.title})`);

  // 6. Seed Site Settings + Admin Project Taxonomies
  const defaultSettings = [
    { key: "site_title", value: "MD Tanvir Khan — Network, System & Security Portfolio" },
    { key: "site_tagline", value: "Designing secure networks, reliable systems, and practical infrastructure solutions." },
    { key: "contact_available", value: true },
    { key: "theme_default", value: "dark" },
    {
      key: "project_categories",
      value: [
        { id: "network-infra", label: "Network Infrastructure" },
        { id: "systems-virtualization", label: "Systems & Virtualization" },
        { id: "telephony-voip", label: "VoIP & Telephony" },
        { id: "network-security", label: "Perimeter Defense & Security" },
        { id: "soc-hardening", label: "SOC Telemetry & Hardening" },
        { id: "devops-automation", label: "DevOps & Infrastructure as Code" },
      ],
    },
    {
      key: "project_types",
      value: [
        { id: "lab", label: "Lab" },
        { id: "personal", label: "Personal Project" },
        { id: "client", label: "Client Project" },
        { id: "production", label: "Production" },
      ],
    },
    {
      key: "project_environments",
      value: [
        { id: "physical", label: "Physical" },
        { id: "virtual", label: "Virtual" },
        { id: "cloud", label: "Cloud" },
        { id: "hybrid", label: "Hybrid" },
      ],
    },
  ];

  for (const set of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: set.key },
      update: { value: set.value },
      create: { key: set.key, value: set.value },
    });
  }

  console.log("✅ Site Settings and project taxonomies seeded");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
