import { PrismaClient, UserRole, PublishStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { configureScriptEnvironment, assertNotProduction, assertSafeTarget } from "./env-config";

export interface SyncOptions {
  dryRun?: boolean;
  staging?: boolean;
}

export interface SyncPreviewStats {
  adminUser: { status: "PRESERVED" | "CREATE"; email: string };
  profile: { status: "UPSERT"; id: string };
  siteSettings: { total: number };
  skills: { total: number };
  services: { total: number };
  experiences: { total: number; trainingCount: number; workCount: number };
  certifications: { total: number };
  projects: { total: number; categoryBreakdown: Record<string, number> };
  blogPosts: { total: number };
  clients: { total: number };
  testimonials: { total: number };
  labs: { total: number };
  userManagedPreserved: {
    articles: number;
    articleCategories: number;
    notes: number;
    noteCategories: number;
    contactMessages: number;
  };
}

let globalPrisma: PrismaClient | null = null;

export async function syncDatabase(options: SyncOptions = {}): Promise<{ success: boolean; dryRun: boolean; preview?: SyncPreviewStats }> {
  const isStaging = options.staging ?? process.argv.includes("--staging");
  const envResult = configureScriptEnvironment({ staging: isStaging });

  if (isStaging && envResult.fileMissing) {
    throw new Error(
      `🚨 SAFETY BLOCKED: Staging mode requires '.env.staging', but the file does not exist.\n` +
      `   Please create '.env.staging' from '.env.staging.example' before running staging sync.`
    );
  }

  const { targetInfo, loadedFrom } = envResult;

  const isDryRun =
    options.dryRun ??
    process.argv.includes("--dry-run") ??
    process.argv.includes("--preview") ??
    process.env.DRY_RUN === "true";

  console.log(`\n======================================================`);
  console.log(`🚀 ${isDryRun ? "[DRY-RUN / PREVIEW MODE]" : "[LIVE SYNC MODE]"} Portfolio Data Synchronization`);
  console.log(`   Source Env File       : ${loadedFrom}`);
  console.log(`   Database Target       : ${targetInfo.hostname}:${targetInfo.port}/${targetInfo.database}`);
  console.log(`   Target Classification : ${targetInfo.classification}`);
  console.log(`   Safety Rules Enforced : Zero deleteMany, Admin Password Preserved`);
  console.log(`======================================================\n`);

  if (isStaging) {
    assertSafeTarget("Sync Data (Staging Mode)");
  }

  const prisma = new PrismaClient();
  globalPrisma = prisma;

  // 1. ADMIN USER PRESERVATION
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const rawPassword = process.env.ADMIN_PASSWORD || "admin_secure_password_123!";

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  let adminStatus: "PRESERVED" | "CREATE" = "PRESERVED";

  if (existingAdmin) {
    adminStatus = "PRESERVED";
    console.log(`🔒 [Admin User] Existing admin found for ${adminEmail}.`);
    console.log(`   -> SAFETY GUARANTEE: Existing passwordHash will NEVER be overwritten.`);
    if (!isDryRun) {
      // Safely update name and role without touching passwordHash
      await prisma.adminUser.update({
        where: { id: existingAdmin.id },
        data: {
          name: existingAdmin.name || "MD Tanvir Khan",
          role: UserRole.ADMIN,
          active: true,
        },
      });
      console.log(`   -> Verified admin status.`);
    }
  } else {
    adminStatus = "CREATE";
    console.log(`🆕 [Admin User] No existing admin user found. Creating initial admin: ${adminEmail}`);
    if (!isDryRun) {
      const passwordHash = await bcrypt.hash(rawPassword, 12);
      await prisma.adminUser.create({
        data: {
          name: "MD Tanvir Khan",
          email: adminEmail,
          passwordHash,
          role: UserRole.ADMIN,
          active: true,
        },
      });
      console.log(`   -> Initial admin created.`);
    }
  }

  // 2. OWNER PROFILE
  const profileData = {
    id: "default-owner-profile",
    name: "MD Tanvir Khan",
    headline: "Network & VoIP Engineer | Security & Infrastructure Specialist",
    bio: "Network & VoIP Engineer with hands-on experience in Grandstream IP PBX, FXO/FXS gateways, IVR design & IP telephony deployment. Experienced in managing LAN/WAN infrastructure, configuring network devices & troubleshooting real-world voice and data issues to maintain high system uptime. Strong in security hardening and project-based network rollouts.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    resumeUrl: "/CV of MD Tanvir Khan.pdf",
    email: "mdtanvirkhan.nt@gmail.com",
    location: "Kuril, Bhatara, Dhaka-1229",
    socialLinks: {
      phone: "+8801601501775",
      linkedin: "https://linkedin.com/in/mdtanvirkhan101/",
      github: "https://github.com",
    },
  };

  if (!isDryRun) {
    await prisma.profile.upsert({
      where: { id: profileData.id },
      update: profileData,
      create: profileData,
    });
  }
  console.log(`👤 [Profile] Owner profile synced (id: default-owner-profile)`);

  // 3. SITE SETTINGS
  const siteSettings = [
    { key: "site_title", value: "MD Tanvir Khan" },
    { key: "site_tagline", value: "SYSTEM & NETWORK ENGINEER" },
    { key: "admin_name", value: "MD Tanvir Khan CMS" },
    { key: "admin_tagline", value: "Network & Systems Suite v2.0" },
    { key: "contact_phone", value: "+8801601501775" },
    { key: "contact_email", value: "mdtanvirkhan.nt@gmail.com" },
    { key: "resume_pdf_url", value: "/CV of MD Tanvir Khan.pdf" },
    { key: "contact_available", value: true },
  ];

  if (!isDryRun) {
    for (const s of siteSettings) {
      await prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value },
      });
    }
  }
  console.log(`⚙️ [Site Settings] ${siteSettings.length} settings synced`);

  // 4. SKILLS
  const allSkills = [
    // Networking & VoIP
    { name: "Grandstream IP PBX & UCM", category: "Networking & VoIP", level: 10, sortOrder: 1 },
    { name: "Cisco Routing & Switching", category: "Networking & VoIP", level: 9, sortOrder: 2 },
    { name: "MikroTik RouterOS & Traffic Control", category: "Networking & VoIP", level: 9, sortOrder: 3 },
    { name: "FXO/FXS Gateways & IVR Routing", category: "Networking & VoIP", level: 9, sortOrder: 4 },
    { name: "LAN/WAN Infrastructure Design", category: "Networking & VoIP", level: 9, sortOrder: 5 },
    { name: "SIP Trunking & QoS Optimization", category: "Networking & VoIP", level: 8, sortOrder: 6 },
    // Security & Firewalls
    { name: "FortiGate Next-Gen Firewalls (NGFW)", category: "Security & Firewalls", level: 9, sortOrder: 7 },
    { name: "IPsec & SSL VPN Site Tunnels", category: "Security & Firewalls", level: 9, sortOrder: 8 },
    { name: "Network Hardening & ACL Rules", category: "Security & Firewalls", level: 9, sortOrder: 9 },
    { name: "PCI-DSS Compliance Auditing", category: "Security & Firewalls", level: 8, sortOrder: 10 },
    { name: "Wireshark Packet Inspection", category: "Security & Firewalls", level: 9, sortOrder: 11 },
    // Systems & Automation
    { name: "Windows Server & Active Directory", category: "Systems & DevOps", level: 9, sortOrder: 12 },
    { name: "Python Network Automation (Netmiko/NAPALM)", category: "Systems & DevOps", level: 8, sortOrder: 13 },
    { name: "Virtualization (VMware ESXi / Proxmox)", category: "Systems & DevOps", level: 8, sortOrder: 14 },
    { name: "Linux Administration & Bash", category: "Systems & DevOps", level: 8, sortOrder: 15 },
    // Audio-Visual & Hardware
    { name: "Logitech & Aver Video Conferencing", category: "Audio-Visual & Hardware", level: 9, sortOrder: 16 },
    { name: "Interactive Flat Panels (IFP)", category: "Audio-Visual & Hardware", level: 9, sortOrder: 17 },
    { name: "IP-PA Sound & Intercom Systems", category: "Audio-Visual & Hardware", level: 8, sortOrder: 18 },
    { name: "Hardware Diagnostics & BOQ Estimation", category: "Audio-Visual & Hardware", level: 9, sortOrder: 19 },
  ];

  if (!isDryRun) {
    for (const skill of allSkills) {
      const existing = await prisma.skill.findFirst({ where: { name: skill.name } });
      if (existing) {
        await prisma.skill.update({ where: { id: existing.id }, data: skill });
      } else {
        await prisma.skill.create({ data: skill });
      }
    }
  }
  console.log(`🛠️ [Skills] ${allSkills.length} skills processed`);

  // 5. SERVICES
  const allServices = [
    {
      title: "Enterprise IP Routing & Switching",
      slug: "enterprise-ip-routing-switching",
      description: "Designing resilient local & wide area networks with redundant links, dynamic routing, and sub-second failover.",
      icon: "Network",
      sortOrder: 1,
      active: true,
      attachments: ["Routing & Switching", "VLANs & Trunking", "OSPF & BGP", "MikroTik RouterOS"],
    },
    {
      title: "Grandstream IP PBX & SIP Trunking",
      slug: "grandstream-ip-pbx-sip-trunking",
      description: "Deploying enterprise-grade IP PBX systems, customized interactive voice responses, and unified call center setups.",
      icon: "Phone",
      sortOrder: 2,
      active: true,
      attachments: ["Grandstream UCM", "SIP Signaling", "IVR Design", "FXO/FXS Gateways"],
    },
    {
      title: "LAN/WAN Architecture & Cabling",
      slug: "lan-wan-architecture-cabling",
      description: "Complete physical and logical infrastructure setup with structured cabling, server rack assembly, and stress testing.",
      icon: "Layers",
      sortOrder: 3,
      active: true,
      attachments: ["Structured Cabling", "Rack Management", "Hardware BOQ", "Network Uptime"],
    },
    {
      title: "FortiGate NGFW Deployment",
      slug: "fortigate-ngfw-deployment",
      description: "Configuring perimeter defense policies, web filtering, application control, and intrusion prevention systems.",
      icon: "ShieldCheck",
      sortOrder: 4,
      active: true,
      attachments: ["FortiGate NGFW", "Security Policies", "DDoS Mitigation", "SSL Inspection"],
    },
    {
      title: "IPsec & SSL VPN Site Tunnels",
      slug: "ipsec-ssl-vpn-site-tunnels",
      description: "Establishing encrypted, high-performance VPN links connecting multi-branch offices and remote workforce securely.",
      icon: "Lock",
      sortOrder: 5,
      active: true,
      attachments: ["Site-to-Site VPN", "Remote Users", "Zero-Trust", "Multi-Branch Access"],
    },
    {
      title: "PCI-DSS & Network Security Audit",
      slug: "pci-dss-network-security-audit",
      description: "Comprehensive vulnerability auditing, port inspection, ACL hardening, and transactional network security compliance.",
      icon: "Activity",
      sortOrder: 6,
      active: true,
      attachments: ["PCI-DSS Standard", "Access Controls", "Log Auditing", "Port Scanning"],
    },
    {
      title: "Windows Server & Domain Services",
      slug: "windows-server-domain-services",
      description: "Enterprise domain controller setup, centralized identity management, security policies, and access provisioning.",
      icon: "Server",
      sortOrder: 7,
      active: true,
      attachments: ["Active Directory", "Group Policy (GPO)", "DNS/DHCP", "User Management"],
    },
    {
      title: "Hypervisor & VM Infrastructure",
      slug: "hypervisor-vm-infrastructure",
      description: "Building resilient virtualized environments with cluster failover, resource allocation, and automated snapshots.",
      icon: "Cpu",
      sortOrder: 8,
      active: true,
      attachments: ["VMware ESXi", "Proxmox VE", "VM Backups", "Storage Allocation"],
    },
    {
      title: "Python & Bash Scripting Pipeline",
      slug: "python-bash-scripting-pipeline",
      description: "Automating routine network configuration backups, bulk device provisioning, and system monitoring tasks.",
      icon: "Terminal",
      sortOrder: 9,
      active: true,
      attachments: ["Python Netmiko", "NAPALM", "CLI Automation", "Log Parsing"],
    },
    {
      title: "Logitech & Aver AV Room Setup",
      slug: "logitech-aver-av-room-setup",
      description: "Designing immersive corporate boardrooms with synchronized audio-visual hardware and multi-platform compatibility.",
      icon: "Video",
      sortOrder: 10,
      active: true,
      attachments: ["PTZ Cameras", "AV Sync", "Microphone Arrays", "Smart Display Integration"],
    },
    {
      title: "IP-PA Sound & Intercom Systems",
      slug: "ip-pa-sound-intercom-systems",
      description: "Deploying IP-based public address systems for multi-zone announcements, background audio, and emergency alerts.",
      icon: "Radio",
      sortOrder: 11,
      active: true,
      attachments: ["IP-PA Speaker", "Zone Paging", "Intercom Routing", "Emergency Broadcast"],
    },
    {
      title: "IT Infrastructure Diagnostics & BOQ",
      slug: "it-infrastructure-diagnostics-boq",
      description: "Comprehensive hardware health checks, bill of quantity (BOQ) preparation for new tenders, and technical documentation.",
      icon: "FileText",
      sortOrder: 12,
      active: true,
      attachments: ["Hardware BOQ", "Troubleshooting", "Vendor Sourcing", "Documentation"],
    },
  ];

  if (!isDryRun) {
    for (const s of allServices) {
      await prisma.service.upsert({
        where: { slug: s.slug },
        update: s,
        create: s,
      });
    }
  }
  console.log(`💼 [Services] ${allServices.length} services synced`);

  // 6. EXPERIENCES (NON-DESTRUCTIVE - NO deleteMany)
  // Fix: Explicitly sets logoUrl: "training" on ISDB-BISEW so experience/page.tsx separates it correctly!
  const allExperiences = [
    {
      organization: "Excel Technology Ltd.",
      role: "Associate Engineer",
      logoUrl: "work",
      startDate: new Date("2024-09-01"),
      endDate: null,
      current: true,
      description: "Deploying and configuring Grandstream Network Solutions, IP PBX systems, and enterprise video conferencing infrastructure with rigorous performance optimization.",
      sortOrder: 1,
      attachments: [
        "Successfully deployed and configured Grandstream Network Solutions and IP PBX Solutions.",
        "Set up, tested, and provided full technical deployment for Logitech and Aver Video Conferencing.",
        "Conducted continuous R&D and rigorous testing of new technical features to optimize uptime.",
        "Diagnosed and resolved network-level and system configuration issues.",
      ],
    },
    {
      organization: "Excel Technology Ltd.",
      role: "Technical Lead & Client Demos Coordinator",
      logoUrl: "work",
      startDate: new Date("2024-09-01"),
      endDate: null,
      current: true,
      description: "Leading client-facing technical demonstrations, technical BOQ preparations, and cross-functional deployment rollouts.",
      sortOrder: 2,
      attachments: [
        "Conducted live technical demonstrations for corporate clients.",
        "Actively participated in preparing Bill of Materials (BOQ).",
        "Mentored junior interns on routing device configuration.",
      ],
    },
    {
      organization: "Excel Technology Ltd.",
      role: "Intern",
      logoUrl: "work",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-08-31"),
      current: false,
      description: "Assisted senior engineers in setting up network routing devices, IP telephony systems, and conducting laboratory R&D tests.",
      sortOrder: 3,
      attachments: [
        "Configured and set up Cisco and MikroTik routers and switches.",
        "Assisted senior engineers in setting up and testing Grandstream IP PBX solutions.",
        "Installed and tested Logitech and Aver video conferencing hardware.",
      ],
    },
    {
      organization: "ISDB-BISEW IT Scholarship Programme",
      role: "Network Systems Administrator Trainee",
      logoUrl: "training", // CRITICAL FIX: required for training tab on /experience
      startDate: new Date("2023-06-06"),
      endDate: new Date("2023-10-25"),
      current: false,
      description: "Completed professional training on computer systems, networking basics, Windows Server administration, and MikroTik network configuration.",
      sortOrder: 4,
      attachments: [
        "Installed, set up & managed Windows Server and virtual machines.",
        "Managed system security, user access controls, and identified security threats.",
        "Worked with MikroTik to configure network devices, set up basic routing & manage bandwidth.",
      ],
    },
  ];

  if (!isDryRun) {
    // Non-destructive compound match: match by organization and role
    for (const exp of allExperiences) {
      const existing = await prisma.experience.findFirst({
        where: { organization: exp.organization, role: exp.role },
      });
      if (existing) {
        await prisma.experience.update({ where: { id: existing.id }, data: exp });
      } else {
        await prisma.experience.create({ data: exp });
      }
    }
  }
  console.log(`📜 [Experiences] ${allExperiences.length} roles synced non-destructively (1 training, 3 work)`);

  // 7. CERTIFICATIONS (NON-DESTRUCTIVE - NO deleteMany)
  const allCertifications = [
    {
      name: "Fortinet Certified Associate in Cybersecurity (FCAC)",
      issuer: "Fortinet Training Institute",
      credentialUrl: "https://www.fortinet.com/training-certification",
      imageUrl: "https://www.vectorlogo.zone/logos/fortinet/fortinet-icon.svg",
      issuedAt: new Date("2024-03-15"),
      sortOrder: 1,
    },
    {
      name: "MikroTik Certified Network Associate (MTCNA)",
      issuer: "MikroTik",
      credentialUrl: "https://mikrotik.com/training/about",
      imageUrl: "https://www.vectorlogo.zone/logos/mikrotik/mikrotik-icon.svg",
      issuedAt: new Date("2025-01-10"),
      sortOrder: 2,
    },
    {
      name: "Grandstream Certified Specialist: UC & Networking",
      issuer: "Grandstream Networks",
      credentialUrl: "https://www.grandstream.com",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
      issuedAt: new Date("2024-05-12"),
      sortOrder: 3,
    },
    {
      name: "Ruijie Certified Network Associate (RCNA-WLAN & R&S)",
      issuer: "Ruijie Networks",
      credentialUrl: "https://www.ruijienetworks.com",
      imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
      issuedAt: new Date("2024-06-18"),
      sortOrder: 4,
    },
    {
      name: "Cisco Certified Network Associate (CCNA 200-301)",
      issuer: "Cisco Systems",
      credentialUrl: "https://www.cisco.com/go/certifications",
      imageUrl: "https://www.vectorlogo.zone/logos/cisco/cisco-icon.svg",
      issuedAt: new Date("2023-05-10"),
      sortOrder: 5,
    },
    {
      name: "Cisco Network Support & Security Basics",
      issuer: "Cisco Networking Academy",
      credentialUrl: "https://www.netacad.com",
      imageUrl: "https://www.vectorlogo.zone/logos/cisco/cisco-icon.svg",
      issuedAt: new Date("2023-09-01"),
      sortOrder: 6,
    },
    {
      name: "Google IT Support Professional Specialization",
      issuer: "Google / Coursera",
      credentialUrl: "https://coursera.org/verify/professional-cert/J23GF9LG23BU",
      imageUrl: "https://www.vectorlogo.zone/logos/google/google-icon.svg",
      issuedAt: new Date("2023-08-20"),
      sortOrder: 7,
    },
    {
      name: "Certified Ethical Hacker (CEH v12)",
      issuer: "EC-Council",
      credentialUrl: "https://www.eccouncil.org",
      imageUrl: "https://www.vectorlogo.zone/logos/eccouncil/eccouncil-icon.svg",
      issuedAt: new Date("2024-01-12"),
      sortOrder: 8,
    },
    {
      name: "CompTIA Security+",
      issuer: "CompTIA",
      credentialUrl: "https://www.comptia.org",
      imageUrl: "https://www.vectorlogo.zone/logos/comptia/comptia-icon.svg",
      issuedAt: new Date("2023-04-18"),
      sortOrder: 9,
    },
    {
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services (AWS)",
      credentialUrl: "https://aws.amazon.com",
      imageUrl: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg",
      issuedAt: new Date("2024-03-15"),
      sortOrder: 10,
    },
  ];

  if (!isDryRun) {
    // Non-destructive deterministic match: match by name and issuer
    for (const cert of allCertifications) {
      const existing = await prisma.certification.findFirst({
        where: { name: cert.name, issuer: cert.issuer },
      });
      if (existing) {
        await prisma.certification.update({ where: { id: existing.id }, data: cert });
      } else {
        await prisma.certification.create({ data: cert });
      }
    }
  }
  console.log(`🏅 [Certifications] ${allCertifications.length} credentials synced non-destructively`);

  // 8. PROJECTS & CASE STUDIES (Aligned with Category Taxonomy & Showcase)
  // Categories:
  // 1. network-infra: Network Infrastructure
  // 2. systems-virtualization: Systems & Virtualization
  // 3. telephony-voip: VoIP & Telephony
  // 4. network-security: Perimeter Defense & Security
  // 5. soc-hardening: SOC Telemetry & Hardening
  // 6. devops-automation: DevOps & Infrastructure as Code
  const projectsData = [
    // 1. Network Infrastructure
    {
      title: "Zero-Downtime Multi-WAN Failover & Enterprise Core VLAN Routing",
      slug: "enterprise-multi-wan-failover-vlan-routing",
      summary: "High-throughput MikroTik PCC dual-ISP load balancing with automated ping watchdog failover, 802.1Q trunking, and isolated management/IoT subnets.",
      content: "Complete engineering blueprint for deploying dual-ISP load balancing with MikroTik RouterOS PCC, OSPF dynamic failover, and strict VLAN isolation.",
      coverUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
      stack: ["MikroTik RouterOS", "BGP", "802.1Q VLANs", "WireGuard", "QoS"],
      featured: true,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "network-infra" },
      caseStudy: {
        problem: "Frequent ISP fiber cuts and single point of failure caused critical call center and office downtime.",
        process: "Audited multi-homed ISP feeds, configured PCC load balancing algorithms, and tuned dynamic ping watchdogs.",
        solution: "Deployed dual-WAN PCC load distribution with automated VRRP failover and dedicated management VLANs.",
        outcome: "Achieved 99.99% network uptime with sub-second automated failover and zero packet loss.",
      },
    },
    {
      title: "Enterprise Multi-Site SD-WAN & Secure WireGuard Tunnel Mesh",
      slug: "enterprise-multi-site-sdwan-tunnel-mesh",
      summary: "Encrypted multi-branch interconnect leveraging site-to-site WireGuard and IPSec fallback with automated dynamic routing via OSPF.",
      content: "Full-mesh VPN topology interconnecting distributed corporate branches with automated path selection and encrypted data channels.",
      coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      stack: ["WireGuard", "IPsec", "OSPF", "MikroTik", "Linux Router"],
      featured: false,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "network-infra" },
      caseStudy: {
        problem: "High latency and expensive MPLS leased lines between remote branches limited inter-office collaboration.",
        process: "Designed an overlay SD-WAN mesh utilizing ChaCha20-Poly1305 WireGuard encryption with dynamic OSPF peering.",
        solution: "Built a high-performance WireGuard tunnel mesh with automated failover to route-based IPSec.",
        outcome: "Cut branch connectivity costs by 65% while boosting throughput by 3x.",
      },
    },

    // 2. Systems & Virtualization
    {
      title: "High-Availability Proxmox VE Cluster & SAN Storage Topology",
      slug: "ha-proxmox-ve-cluster-san-storage",
      summary: "Enterprise hypervisor virtualization with live VM migration, TrueNAS ZFS storage arrays over iSCSI, automated PBS snapshots, and hardened Debian nodes.",
      content: "Clustered hypervisor deployment utilizing Proxmox VE, Corosync quorum, dedicated 10GbE storage networks, and ZFS replication.",
      coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      stack: ["Proxmox VE", "Debian Linux", "ZFS", "TrueNAS", "iSCSI"],
      featured: true,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "systems-virtualization" },
      caseStudy: {
        problem: "Single-node hardware crashes caused catastrophic multi-hour application outages.",
        process: "Sized computing nodes, segmented dedicated 10GbE SAN storage networks, and configured automated ZFS snapshot schedules.",
        solution: "Deployed a 3-node Proxmox HA cluster connected to a redundant TrueNAS ZFS storage pool over multipath iSCSI.",
        outcome: "Zero downtime during physical host maintenance with seamless live VM migrations.",
      },
    },
    {
      title: "Centralized Directory Services & Automated Endpoint Management",
      slug: "directory-services-endpoint-management",
      summary: "Standardized corporate domain deployment using Windows Server AD & Samba4 with Kerberos authentication, centralized LDAP, and baseline group policies.",
      content: "Unified identity management across Windows and Linux workstations with automated software deployment and strict access control.",
      coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      stack: ["Active Directory", "Group Policy (GPO)", "LDAP", "Windows Server", "Kerberos"],
      featured: false,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "systems-virtualization" },
      caseStudy: {
        problem: "Unmanaged endpoints and decentralized credentials increased insider threat exposure and provisioning times.",
        process: "Structured organizational units (OUs), authored hardening GPOs, and integrated Kerberos single sign-on.",
        solution: "Engineered dual Active Directory Domain Controllers with automated password policies and centralized auditing.",
        outcome: "Cut user onboarding from 2 hours to 5 minutes with 100% compliance with security baselines.",
      },
    },

    // 3. VoIP & Telephony
    {
      title: "Enterprise VoIP & Grandstream IP PBX Deployment",
      slug: "enterprise-voip-pbx-deployment",
      summary: "Deconstructing a large-scale IP telephony rollout with Grandstream UCM, FXO/FXS gateways, and IVR routing for high system uptime.",
      content: "Complete deployment breakdown of Grandstream UCM IP PBX, multi-branch extension routing, FXO gateways, and QoS traffic priority.",
      coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      stack: ["Grandstream UCM", "SIP Trunking", "FXO/FXS Gateways", "IVR Design", "QoS"],
      featured: true,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "telephony-voip" },
      caseStudy: {
        problem: "Legacy analog telephony led to frequent dropped calls, poor voice clarity, and zero centralized management across distributed branches.",
        process: "Audited existing line quality, planned dedicated VLAN segmentations, and configured auto-attendant IVR trees.",
        solution: "Deployed Grandstream IP PBX systems with dedicated voice VLANs, custom IVR design, and QoS prioritization.",
        outcome: "Achieved 99.99% voice uptime, zero call jitter, and seamless multi-branch extension connectivity.",
      },
    },
    {
      title: "Carrier-Grade Kamailio SIP Proxy & FreePBX Telephony Softswitch",
      slug: "kamailio-sip-proxy-freepbx-telephony",
      summary: "Scalable IPTSP cloud telephony softswitch combining Asterisk/FreePBX with Kamailio edge proxies, WebRTC bridging, and high-concurrency dynamic IVR queues.",
      content: "High-density SIP proxy architecture designed for carrier-grade call routing, fraud detection, and multi-tenant billing.",
      coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      stack: ["FreePBX", "Asterisk", "Kamailio", "WebRTC", "SIP/RTP"],
      featured: false,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "telephony-voip" },
      caseStudy: {
        problem: "SIP DDoS floods and registration storms frequently crashed edge PBX services during peak traffic.",
        process: "Implemented Kamailio SIP load balancers with Pike anti-flood modules and dispatcher failover.",
        solution: "Deployed a decoupled architecture with Kamailio handling edge security and FreePBX processing media streams.",
        outcome: "Sustained 500+ concurrent audio sessions with zero packet loss under synthetic attack.",
      },
    },

    // 4. Perimeter Defense & Security
    {
      title: "Fortinet Next-Gen Firewall & Zero-Trust Hardening",
      slug: "fortinet-firewall-zero-trust-hardening",
      summary: "Architecting resilient perimeter security and IPsec VPN tunnels for multi-tenant financial transaction networks.",
      content: "Deep packet inspection, SSL-VPN portals, and zero-trust microsegmentation using FortiGate hardware firewalls.",
      coverUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      stack: ["FortiGate NGFW", "IPsec VPN", "PCI-DSS", "Deep Packet Inspection"],
      featured: true,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "network-security" },
      caseStudy: {
        problem: "Vulnerabilities in legacy perimeter rules exposed internal APIs to unauthorized external probes and brute-force attacks.",
        process: "Mapped perimeter surface, hardened firewall policies, and deployed dual SSL-VPN gateways.",
        solution: "Implemented FortiGate Next-Gen Firewalls with strict SSL/IPsec VPN tunnels and deep packet inspection (DPI).",
        outcome: "Neutralized unauthorized intrusion attempts by 100% and ensured full PCI-DSS regulatory compliance.",
      },
    },
    {
      title: "Perimeter NGFW, Suricata IDS/IPS & Zero Trust Network Access",
      slug: "perimeter-ngfw-suricata-zero-trust-mesh",
      summary: "Deep packet inspection perimeter firewall deployed on pfSense with automated Suricata signature rulesets, strict egress filtering, and encrypted mesh tunnels.",
      content: "Comprehensive intrusion detection and defense perimeter securing transactional applications from emerging exploits.",
      coverUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      stack: ["pfSense", "Suricata IDS/IPS", "HAProxy", "Snort", "Zero Trust"],
      featured: false,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "network-security" },
      caseStudy: {
        problem: "Automated vulnerability scanners and script kiddie exploits flooded web application entry points.",
        process: "Configured Suricata inline IPS mode with ET Open rulesets and geo-blocking IP feeds.",
        solution: "Integrated automated threat blocking on pfSense with HAProxy reverse proxy SSL termination.",
        outcome: "Blocked 99.8% of automated hostile traffic before reaching application servers.",
      },
    },

    // 5. SOC Telemetry & Hardening
    {
      title: "Centralized Wazuh SIEM Security Telemetry & System Hardening",
      slug: "wazuh-siem-telemetry-server-hardening",
      summary: "Host intrusion detection, CIS benchmark baseline auditing, centralized auth log aggregation, automated Fail2ban mitigation, and real-time security alerts.",
      content: "Full SOC monitoring framework with agent telemetry, compliance auditing, and automated incident escalation pipelines.",
      coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      stack: ["Wazuh SIEM", "Elasticsearch", "Auditd", "Fail2ban", "CIS Baselines"],
      featured: true,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "soc-hardening" },
      caseStudy: {
        problem: "Zero visibility into host-level authentication attempts and compliance drift across heterogeneous servers.",
        process: "Deployed Wazuh telemetry agents across all nodes, automated CIS benchmark audits, and piped alerts into Slack/Email.",
        solution: "Centralized SIEM monitoring with automated active response rules to drop attacker IPs immediately.",
        outcome: "Attained 100% audit compliance and reduced threat detection mean-time-to-respond (MTTR) to under 3 seconds.",
      },
    },

    // 6. DevOps & Infrastructure as Code
    {
      title: "Multi-Vendor Network Automation & Config Orchestrator",
      slug: "network-automation-orchestrator",
      summary: "Automating bulk device provisioning across Cisco, MikroTik, and Ruijie hardware using Python and NAPALM.",
      content: "Python automation pipeline using Netmiko, NAPALM, and Jinja2 templates to push atomic configuration changes across heterogeneous network gear.",
      coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      stack: ["Python", "NAPALM", "Netmiko", "Jinja2", "Cisco & MikroTik"],
      featured: true,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "devops-automation" },
      caseStudy: {
        problem: "Manual CLI provisioning across 100+ enterprise switches introduced human configuration drift and deployment delays.",
        process: "Designed Jinja2 configuration templates with schema validation and automated pre/post inspection diffs.",
        solution: "Built a Python-driven automation pipeline utilizing Jinja2 templates and atomic rollback safeguards.",
        outcome: "Reduced device provisioning time from 4 hours to under 12 seconds with zero configuration errors.",
      },
    },
    {
      title: "Automated Self-Hosted Operations Stack & Monitoring Telemetry",
      slug: "self-hosted-operations-monitoring-stack",
      summary: "Production-grade containerized infrastructure managed via Docker Compose, Prometheus metrics scraping, Grafana dashboards, and automated offsite backups.",
      content: "Complete observability pipeline monitoring network device interfaces, CPU usage, temperature, and container health.",
      coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      stack: ["Docker", "Prometheus", "Grafana", "Uptime Kuma", "Ansible"],
      featured: false,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "devops-automation" },
      caseStudy: {
        problem: "Silent service degradation went unnoticed until end-users complained about connectivity failures.",
        process: "Instrumented SNMP exporters and node exporters scraping metric endpoints every 15 seconds.",
        solution: "Constructed comprehensive Grafana dashboards with alert thresholds piped directly to engineer mobile apps.",
        outcome: "Prevented outages by flagging memory leaks and interface errors hours before failures.",
      },
    },
    {
      title: "Custom Headless CMS & Network Operations Portal",
      slug: "custom-headless-cms-portfolio",
      summary: "Bespoke self-hosted Next.js core portal with custom session cookies, Prisma ORM, PostgreSQL, and network telemetry.",
      content: "Complete full-stack monolith combining dynamic client showcases, fast Server Actions, and a private CMS dashboard.",
      coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS"],
      featured: true,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "devops-automation" },
      caseStudy: {
        problem: "Third-party CMS services created unpredictable latency spikes, vendor lock-in costs, and fragmented media management workflows.",
        process: "Designed a localized relational schema using PostgreSQL with Prisma ORM and secure Server Actions.",
        solution: "An integrated monolith architecture running Next.js App Router with unified admin CMS controls directly inside the app.",
        outcome: "Slashed TTFB to under 45ms with 100/100 Lighthouse performance and zero SaaS subscription costs.",
      },
    },
    {
      title: "FinTech Real-Time Analytics & Settlement Dashboard",
      slug: "fintech-real-time-analytics-dashboard",
      summary: "High-frequency financial monitoring dashboard handling real-time WebSocket ledger streams, encrypted telemetry, and low-latency transaction routing.",
      content: "Real-time canvas rendering, streaming WebSockets, and encrypted telemetry aggregation for high-throughput ledgers.",
      coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      stack: ["React", "TypeScript", "WebSockets", "Node.js", "Tailwind CSS"],
      featured: false,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "systems-virtualization" },
    },
    {
      title: "Cloud Ledger & Multi-Region Distributed API",
      slug: "cloud-ledger-distributed-api",
      summary: "High-availability backend engine featuring zero-downtime database failover, automated multi-tenant isolation, and encrypted Redis caching layers.",
      content: "Distributed backend architecture with multi-region failover and encrypted caching.",
      coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      stack: ["Node.js", "Docker", "PostgreSQL", "Redis", "AWS"],
      featured: false,
      status: PublishStatus.PUBLISHED,
      attachments: { category: "devops-automation" },
    },
  ];

  const categoryBreakdown: Record<string, number> = {};
  for (const p of projectsData) {
    const cat = (p.attachments as any)?.category || "uncategorized";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  }

  if (!isDryRun) {
    for (const p of projectsData) {
      const { caseStudy, ...projData } = p;
      const project = await prisma.project.upsert({
        where: { slug: projData.slug },
        update: projData,
        create: projData,
      });

      if (caseStudy) {
        await prisma.caseStudy.upsert({
          where: { projectId: project.id },
          update: caseStudy,
          create: {
            ...caseStudy,
            projectId: project.id,
          },
        });
      }
    }
  }
  console.log(`📁 [Projects] ${projectsData.length} projects synced across 6 categories:`);
  Object.entries(categoryBreakdown).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} project(s)`);
  });

  // 9. BLOG POSTS
  const allBlogPosts = [
    {
      title: "Architecting Grandstream IP PBX & High-Availability SIP Trunking",
      slug: "architecting-grandstream-ip-pbx-sip-trunking",
      excerpt: "A technical guide to configuring Grandstream UCM, FXO/FXS gateways, voice VLANs, and QoS prioritization for zero dropped calls.",
      content: "Enterprise voice over IP requires strict latency budgeting, jitter buffer tuning, and dedicated voice VLAN tagging to prevent voice packet collisions...",
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date("2024-04-10"),
    },
    {
      title: "Zero-Trust Perimeter Defense: Fortinet NGFW & IPsec Tunneling",
      slug: "zero-trust-perimeter-defense-fortinet-ngfw",
      excerpt: "Deep dive into hardening perimeter firewall rules, deploying dual IPsec tunnels, and enabling Deep Packet Inspection (DPI).",
      content: "Modern perimeter security cannot rely on simple port-based filtering. We explore FortiGate SSL-VPN and DPI configuration to isolate sensitive transactional assets...",
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date("2024-03-24"),
    },
    {
      title: "Automating Multi-Vendor Network Switches with Python & NAPALM",
      slug: "automating-network-switches-python-napalm",
      excerpt: "How to eliminate configuration drift and push atomic configuration changes across Cisco, Juniper, and MikroTik hardware.",
      content: "Managing hundreds of network switches manually via CLI inevitably causes human errors and configuration drift...",
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date("2024-02-15"),
    },
    {
      title: "Designing Fault-Tolerant LAN/WAN Infrastructure with BGP & OSPF",
      slug: "designing-fault-tolerant-lan-wan-bgp-ospf",
      excerpt: "Analyzing interior and exterior routing protocols, sub-second failover, and high-uptime enterprise network topologies.",
      content: "Dynamic routing protocols form the backbone of scalable enterprise infrastructure, ensuring traffic convergence during link dropouts...",
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date("2024-01-28"),
    },
  ];

  if (!isDryRun) {
    for (const blog of allBlogPosts) {
      await prisma.blogPost.upsert({
        where: { slug: blog.slug },
        update: blog,
        create: blog,
      });
    }
  }
  console.log(`📰 [Blog Posts] ${allBlogPosts.length} posts synced`);

  // 10. CLIENTS & TESTIMONIALS (NON-DESTRUCTIVE - NO deleteMany)
  const clientsData = [
    {
      name: "Excel Technology Ltd.",
      website: "https://exceltechnology.com.bd",
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Grandstream Networks Partner",
      website: "https://www.grandstream.com",
      logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Fortinet Security Ecosystem",
      website: "https://www.fortinet.com",
      logoUrl: "https://www.vectorlogo.zone/logos/fortinet/fortinet-icon.svg",
    },
    {
      name: "MikroTik Certified Network Partner",
      website: "https://mikrotik.com",
      logoUrl: "https://www.vectorlogo.zone/logos/mikrotik/mikrotik-icon.svg",
    },
  ];

  const createdClients: any[] = [];
  if (!isDryRun) {
    for (const c of clientsData) {
      const existing = await prisma.client.findFirst({ where: { name: c.name } });
      if (existing) {
        await prisma.client.update({
          where: { id: existing.id },
          data: { website: c.website, logoUrl: c.logoUrl },
        });
        createdClients.push(existing);
      } else {
        const created = await prisma.client.create({ data: c });
        createdClients.push(created);
      }
    }
  }

  const testimonialsData = [
    {
      clientName: "Infrastructure Operations Director",
      role: "Enterprise Telecom Partner",
      content: "Tanvir delivered our Grandstream IP PBX deployment and multi-tenant SIP trunking seamlessly. His VoIP troubleshooting and network configuration ensured 99.99% uptime across our branch offices.",
      featured: true,
      clientId: createdClients[0]?.id || null,
    },
    {
      clientName: "Senior Network Security Architect",
      role: "IT Solutions Directorate",
      content: "Exceptional competency in Fortinet Next-Gen Firewall policies and MikroTik routing. Highly disciplined in BOQ preparation, hardware testing, and technical documentation.",
      featured: true,
      clientId: createdClients[2]?.id || null,
    },
    {
      clientName: "Senior Systems Engineer",
      role: "ISDB-BISEW IT Community",
      content: "A diligent engineer with a deep grasp of Windows Server administration, Active Directory GPOs, and network segmentation.",
      featured: true,
      clientId: null,
    },
  ];

  if (!isDryRun) {
    // Non-destructive: findFirst by clientName and role
    for (const t of testimonialsData) {
      const existing = await prisma.testimonial.findFirst({
        where: { clientName: t.clientName, role: t.role || null },
      });
      if (existing) {
        await prisma.testimonial.update({
          where: { id: existing.id },
          data: {
            content: t.content,
            featured: t.featured,
            clientId: t.clientId || existing.clientId,
          },
        });
      } else {
        await prisma.testimonial.create({ data: t });
      }
    }
  }
  console.log(`💬 [Testimonials] ${testimonialsData.length} reviews synced non-destructively`);

  // 11. LABS & SANDBOXES
  const allLabs = [
    {
      title: "BGP Route Leak & Hijack Simulation Sandbox",
      slug: "bgp-route-leak-simulator",
      description: "Virtualized Autonomous System (AS) routing simulator testing path validation algorithms and RPKI route filtering policies under synthetic attack conditions.",
      demoUrl: "https://github.com",
      repoUrl: "https://github.com",
      coverUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
      status: PublishStatus.PUBLISHED,
    },
    {
      title: "Multi-Region MPLS & VXLAN Fabric Mesh",
      slug: "mpls-vxlan-fabric-mesh",
      description: "Simulated data center overlay network utilizing VXLAN encapsulation over an underlying OSPF/MPLS core for seamless tenant isolation.",
      demoUrl: "https://github.com",
      repoUrl: "https://github.com",
      coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      status: PublishStatus.PUBLISHED,
    },
    {
      title: "Automated Threat Intel Honeypot Telemetry",
      slug: "threat-intel-honeypot",
      description: "Containerized SSH/Telnet low-interaction honeypot logging credential stuffing attacks, recording attacker keystrokes, and mapping brute-force GeoIP vectors.",
      demoUrl: "https://github.com",
      repoUrl: "https://github.com",
      coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      status: PublishStatus.PUBLISHED,
    },
    {
      title: "High-Frequency Packet Capture & Sniffer Engine",
      slug: "packet-capture-engine",
      description: "Optimized ring-buffer packet inspection tool capable of parsing layer-4 headers and flagging anomalous payload signatures at line rate.",
      demoUrl: "https://github.com",
      repoUrl: "https://github.com",
      coverUrl: "https://images.unsplash.com/photo-1510519138161-5364d9cd7bb4?auto=format&fit=crop&w=800&q=80",
      status: PublishStatus.PUBLISHED,
    },
    {
      title: "Multi-Vendor CLI Config Orchestrator",
      slug: "cli-config-orchestrator",
      description: "Python automation engine utilizing Netmiko and NAPALM to push atomic configuration changes across Cisco, Juniper, and MikroTik gear with automated rollback.",
      demoUrl: "https://github.com",
      repoUrl: "https://github.com",
      coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      status: PublishStatus.PUBLISHED,
    },
    {
      title: "Zero-Trust Micro-Perimeter eBPF Proxy",
      slug: "zero-trust-ebpf-proxy",
      description: "Lightweight socket-level proxy inspecting layer-7 application payloads before kernel socket handshakes complete, ensuring strict identity verification.",
      demoUrl: "https://github.com",
      repoUrl: "https://github.com",
      coverUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      status: PublishStatus.PUBLISHED,
    },
  ];

  if (!isDryRun) {
    for (const lab of allLabs) {
      await prisma.lab.upsert({
        where: { slug: lab.slug },
        update: lab,
        create: lab,
      });
    }
  }
  console.log(`🧪 [Labs] ${allLabs.length} sandboxes synced`);

  // 12. USER-MANAGED CONTENT PRESERVATION VERIFICATION
  const [articlesCount, articleCategoriesCount, notesCount, noteCategoriesCount, contactMessagesCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.articleCategory.count(),
      prisma.note.count(),
      prisma.noteCategory.count(),
      prisma.contactMessage.count(),
    ]);

  console.log(`\n🛡️ [User Content Preservation Report]`);
  console.log(`   - Existing Articles: ${articlesCount} preserved (0 modified)`);
  console.log(`   - Existing Article Categories: ${articleCategoriesCount} preserved (0 modified)`);
  console.log(`   - Existing Notes: ${notesCount} preserved (0 modified)`);
  console.log(`   - Existing Note Categories: ${noteCategoriesCount} preserved (0 modified)`);
  console.log(`   - Contact Messages: ${contactMessagesCount} preserved (0 modified)`);

  const preview: SyncPreviewStats = {
    adminUser: { status: adminStatus, email: adminEmail },
    profile: { status: "UPSERT", id: profileData.id },
    siteSettings: { total: siteSettings.length },
    skills: { total: allSkills.length },
    services: { total: allServices.length },
    experiences: { total: allExperiences.length, trainingCount: 1, workCount: 3 },
    certifications: { total: allCertifications.length },
    projects: { total: projectsData.length, categoryBreakdown },
    blogPosts: { total: allBlogPosts.length },
    clients: { total: clientsData.length },
    testimonials: { total: testimonialsData.length },
    labs: { total: allLabs.length },
    userManagedPreserved: {
      articles: articlesCount,
      articleCategories: articleCategoriesCount,
      notes: notesCount,
      noteCategories: noteCategoriesCount,
      contactMessages: contactMessagesCount,
    },
  };

  if (isDryRun) {
    console.log(`\n======================================================`);
    console.log(`🔍 DRY-RUN PREVIEW COMPLETE — 0 DATABASE MUTATIONS EXECUTED`);
    console.log(`======================================================\n`);
  } else {
    console.log(`\n======================================================`);
    console.log(`🎉 LIVE SYNC COMPLETE — ALL OPERATIONS SAFELY APPLIED`);
    console.log(`======================================================\n`);
  }

  return { success: true, dryRun: isDryRun, preview };
}

// Only execute when run directly from CLI
if (require.main === module || process.argv[1]?.includes("sync-all-data.ts")) {
  syncDatabase()
    .catch((e) => {
      console.error("❌ Sync error:", e);
      process.exit(1);
    })
    .finally(async () => {
      if (globalPrisma) {
        await globalPrisma.$disconnect();
      }
    });
}
