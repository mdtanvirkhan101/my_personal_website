export interface ContactPageConfig {
  // Page Hero & Header
  badgeText: string;
  headingMain: string;
  headingHighlight: string;
  description: string;

  // Contact Information Details
  email: string;
  emailLabel: string;
  phone: string;
  phoneLabel: string;
  location: string;
  locationLabel: string;
  responseWindow: string;
  responseWindowLabel: string;

  // Quick Direct Communication Links
  whatsappNumber: string;
  telegramUsername: string;
  showDirectChatButtons: boolean;

  // Security & Trust Banner
  securityBadgeTitle: string;
  securityDescription: string;
  securityFooterNote: string;

  // Portal Form Settings
  formPortalTitle: string;
  formPortalSubtitle: string;
  formStatusBadge: string;
  isFormActive: boolean;
  formInactiveNotice: string;
  formSuccessMessage: string;

  // Notification Email (Admin)
  adminNotificationEmail: string;
}

export const defaultContactPageConfig: ContactPageConfig = {
  badgeText: "Secure Communication Channel",
  headingMain: "Get in",
  headingHighlight: "Touch",
  description:
    "Whether you need an enterprise network architecture audit, cybersecurity consultation, or want to discuss a complex infrastructure project, let's connect securely.",

  email: "contact@tanvirkhan.com",
  emailLabel: "Professional Domain Email",
  phone: "+880 1700-000000",
  phoneLabel: "Direct Phone / WhatsApp",
  location: "Dhaka, Bangladesh • UTC+6 (Remote Friendly)",
  locationLabel: "Location & Timezone",
  responseWindow: "Typically within 12–24 business hours",
  responseWindowLabel: "Response Window",

  whatsappNumber: "+8801700000000",
  telegramUsername: "",
  showDirectChatButtons: true,

  securityBadgeTitle: "Security & Encryption Standard",
  securityDescription:
    "All infrastructure briefings, network topology disclosures, and security audits are processed under strict confidentiality protocols. NDA agreements are welcomed and available upon request.",
  securityFooterNote: "Protected by reCAPTCHA Enterprise & TLS 1.3 Encryption",

  formPortalTitle: "Secure Inquiry Portal",
  formPortalSubtitle: "Fill out the form below to initiate direct communication.",
  formStatusBadge: "Secure Node Active",
  isFormActive: true,
  formInactiveNotice:
    "Direct inquiries are temporarily paused for pending client deliveries. Please reach out via email directly.",
  formSuccessMessage:
    "Thank you for reaching out. Your communication has been dispatched directly to my inbox. I will review and reply within 24 hours.",

  adminNotificationEmail: "contact@tanvirkhan.com",
};
