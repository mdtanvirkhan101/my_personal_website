export interface RolePrivileges {
  // Core Sections
  canManageHome: boolean;
  canManageAbout: boolean;
  canManageServices: boolean;
  canManageProjects: boolean;
  canManageCaseStudies: boolean;
  canManageExperience: boolean;
  canManageSkills: boolean;
  canManageCertifications: boolean;
  canManageClients: boolean;
  canManageLabs: boolean;
  canManageBlog: boolean;
  canManageResume: boolean;
  canManageContact: boolean;
  canManageMedia: boolean;

  // System & Administration
  canManageHeaderFooter: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canManageAIAutomation: boolean;
  canManageDatabaseApiHub: boolean;
  canManageBackupRestore: boolean;
  canManageSidebarOrder: boolean;
}

export interface CustomRoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean; // System roles (ADMIN, EDITOR) cannot be deleted
  privileges: RolePrivileges;
  createdAt: string;
}

export const ALL_PRIVILEGES_KEYS: (keyof RolePrivileges)[] = [
  "canManageHome",
  "canManageAbout",
  "canManageServices",
  "canManageProjects",
  "canManageCaseStudies",
  "canManageExperience",
  "canManageSkills",
  "canManageCertifications",
  "canManageClients",
  "canManageLabs",
  "canManageBlog",
  "canManageResume",
  "canManageContact",
  "canManageMedia",
  "canManageHeaderFooter",
  "canManageSettings",
  "canManageUsers",
  "canManageAIAutomation",
  "canManageDatabaseApiHub",
  "canManageBackupRestore",
  "canManageSidebarOrder",
];

export const PRIVILEGE_LABELS: Record<keyof RolePrivileges, { title: string; category: "Content & Portfolio" | "System & Operations" }> = {
  canManageHome: { title: "Home Page Hero & Sections", category: "Content & Portfolio" },
  canManageAbout: { title: "About & Profile Bio", category: "Content & Portfolio" },
  canManageServices: { title: "Services & Solutions", category: "Content & Portfolio" },
  canManageProjects: { title: "Projects & Portfolio", category: "Content & Portfolio" },
  canManageCaseStudies: { title: "Case Studies Console", category: "Content & Portfolio" },
  canManageExperience: { title: "Experience & Timeline", category: "Content & Portfolio" },
  canManageSkills: { title: "Tree Skills & Tech Stack", category: "Content & Portfolio" },
  canManageCertifications: { title: "Certifications & Credentials", category: "Content & Portfolio" },
  canManageClients: { title: "Clients & Reviews", category: "Content & Portfolio" },
  canManageLabs: { title: "Labs & Sandboxes", category: "Content & Portfolio" },
  canManageBlog: { title: "Blog Posts, Articles & Notes", category: "Content & Portfolio" },
  canManageResume: { title: "Resume & CV Viewer", category: "Content & Portfolio" },
  canManageContact: { title: "Contact Messages & Inquiries", category: "Content & Portfolio" },
  canManageMedia: { title: "Media Library & Uploads", category: "Content & Portfolio" },

  canManageHeaderFooter: { title: "Header & Footer Navigation", category: "System & Operations" },
  canManageSettings: { title: "Site Settings & SEO Branding", category: "System & Operations" },
  canManageUsers: { title: "User Management & Role Privileges", category: "System & Operations" },
  canManageAIAutomation: { title: "AI & Automation Hub", category: "System & Operations" },
  canManageDatabaseApiHub: { title: "Database & API Hub", category: "System & Operations" },
  canManageBackupRestore: { title: "Backup & Restore Operations", category: "System & Operations" },
  canManageSidebarOrder: { title: "Sidebar Menu Layout Order", category: "System & Operations" },
};

export const DEFAULT_ADMIN_PRIVILEGES: RolePrivileges = {
  canManageHome: true,
  canManageAbout: true,
  canManageServices: true,
  canManageProjects: true,
  canManageCaseStudies: true,
  canManageExperience: true,
  canManageSkills: true,
  canManageCertifications: true,
  canManageClients: true,
  canManageLabs: true,
  canManageBlog: true,
  canManageResume: true,
  canManageContact: true,
  canManageMedia: true,
  canManageHeaderFooter: true,
  canManageSettings: true,
  canManageUsers: true,
  canManageAIAutomation: true,
  canManageDatabaseApiHub: true,
  canManageBackupRestore: true,
  canManageSidebarOrder: true,
};

export const DEFAULT_EDITOR_PRIVILEGES: RolePrivileges = {
  canManageHome: true,
  canManageAbout: true,
  canManageServices: true,
  canManageProjects: true,
  canManageCaseStudies: true,
  canManageExperience: true,
  canManageSkills: true,
  canManageCertifications: true,
  canManageClients: true,
  canManageLabs: true,
  canManageBlog: true,
  canManageResume: true,
  canManageContact: true,
  canManageMedia: true,
  canManageHeaderFooter: false,
  canManageSettings: false,
  canManageUsers: false,
  canManageAIAutomation: false,
  canManageDatabaseApiHub: false,
  canManageBackupRestore: false,
  canManageSidebarOrder: false,
};

export const DEFAULT_SYSTEM_ROLES: CustomRoleDefinition[] = [
  {
    id: "ADMIN",
    name: "Administrator (Full Access)",
    description: "Complete unrestricted access to all portfolio content, system settings, user accounts, and database hubs.",
    isSystem: true,
    privileges: DEFAULT_ADMIN_PRIVILEGES,
    createdAt: new Date().toISOString(),
  },
  {
    id: "EDITOR",
    name: "Content Editor",
    description: "Can create, edit and publish all portfolio content, skills, projects, and blogs, but cannot manage users or core system settings.",
    isSystem: true,
    privileges: DEFAULT_EDITOR_PRIVILEGES,
    createdAt: new Date().toISOString(),
  },
];

