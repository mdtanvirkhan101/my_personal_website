export interface EstimatorTier {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  deliveryDays: number;
  description: string;
  features: string[];
}

export interface ServicesPageConfig {
  badgeText: string;
  heroHeading: string;
  heroHeadingHighlight: string;
  heroSubtitle: string;
  servicesTitle: string;
  servicesDescription: string;
  solutionsTitle: string;
  solutionsDescription: string;
  showCostEstimator: boolean;
  showServices: boolean;
  showSolutions: boolean;
  estimatorBadge: string;
  estimatorTitle: string;
  estimatorSubtitle: string;
  estimatorTiers: EstimatorTier[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
}

export const defaultEstimatorTiers: EstimatorTier[] = [
  {
    id: "voip-setup",
    name: "Grandstream IP PBX & Telephony Deployment",
    category: "VoIP & Telecom",
    basePrice: 450,
    deliveryDays: 5,
    description: "Complete VoIP setup, IVR tree, SIP trunks, FXO/FXS gateway integration and high-uptime call routing.",
    features: ["Custom IVR Menu Tree", "Extensions & Ring Groups", "FXO/FXS Failover", "Call Recording & CDR"],
  },
  {
    id: "network-routing",
    name: "Enterprise LAN/WAN & MikroTik Routing",
    category: "Network Infrastructure",
    basePrice: 600,
    deliveryDays: 7,
    description: "VLAN design, inter-VLAN routing, BGP/OSPF dynamic routing, and multi-WAN failover configuration.",
    features: ["VLAN Segmentation", "Multi-WAN Load Balancing", "QoS Voice Prioritization", "Full Topology Map"],
  },
  {
    id: "perimeter-security",
    name: "Firewall & VPN Security Hardening",
    category: "Security & Firewalls",
    basePrice: 500,
    deliveryDays: 4,
    description: "Fortinet/pfSense firewall setup, IPS/IDS rules, IPsec & WireGuard site-to-site tunnels.",
    features: ["Site-to-Site WireGuard VPN", "Stateful Firewall Rules", "Intrusion Prevention (IPS)", "Security Audit Report"],
  },
  {
    id: "monitoring-automation",
    name: "Infrastructure Telemetry & Automated Backups",
    category: "Cloud & DevOps",
    basePrice: 350,
    deliveryDays: 3,
    description: "Automated Prometheus/Grafana or Zabbix telemetry alerts, automated backup scripts to cloud.",
    features: ["SNMP Live Telemetry", "Telegram/Email Alerts", "Automated Daily Backups", "SLA Monitoring Dashboard"],
  },
];

export const defaultServicesPageConfig: ServicesPageConfig = {
  badgeText: "Professional IT Services & Infrastructure Solutions",
  heroHeading: "Services &",
  heroHeadingHighlight: "Technical Solutions",
  heroSubtitle:
    "Professional IT and network services with practical solutions for reliable, secure and maintainable infrastructure.",
  servicesTitle: "My Services",
  servicesDescription:
    "Professional IT and network services for building, managing and optimizing reliable infrastructure.",
  solutionsTitle: "Technical Solutions",
  solutionsDescription:
    "Practical approaches to network, communication, systems and infrastructure challenges.",
  showCostEstimator: true,
  showServices: true,
  showSolutions: true,
  estimatorBadge: "Interactive Quotation Tool",
  estimatorTitle: "Project Cost & Timeline Estimator",
  estimatorSubtitle: "Select one or multiple infrastructure and VoIP modules to generate an instant estimate.",
  estimatorTiers: defaultEstimatorTiers,
  ctaTitle: "Need a custom network, server, VoIP or security solution?",
  ctaDescription:
    "Share your requirement and let's discuss a practical, secure and maintainable technical approach.",
  ctaButtonText: "Get in Touch",
};
