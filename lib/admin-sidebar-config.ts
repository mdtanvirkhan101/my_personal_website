export interface AdminSidebarItemConfig {
  key: string;       // unique href/key
  name: string;
  href: string;
  iconName: string;
  color: string;
  bg: string;
  border: string;
  visible: boolean;
}

export const defaultSidebarItems: AdminSidebarItemConfig[] = [
  { key: "/admin/dashboard", name: "Dashboard", href: "/admin/dashboard", iconName: "LayoutDashboard", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", visible: true },
  { key: "/admin/media", name: "Media Library", href: "/admin/media", iconName: "Images", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", visible: true },
  { key: "/admin/home", name: "Home Page Manager", href: "/admin/home", iconName: "Home", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", visible: true },
  { key: "/admin/header-footer", name: "Header & Footer", href: "/admin/header-footer", iconName: "PanelTop", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", visible: true },
  { key: "/admin/sidebar", name: "Sidebar Order", href: "/admin/sidebar", iconName: "Sliders", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", visible: true },
  { key: "/admin/projects", name: "Projects", href: "/admin/projects", iconName: "FolderGit2", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", visible: true },
  { key: "/admin/case-studies", name: "Case Studies", href: "/admin/case-studies", iconName: "Layers", color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/20", visible: true },
  { key: "/admin/experience", name: "Experience", href: "/admin/experience", iconName: "History", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", visible: true },
  { key: "/admin/skills", name: "Skills", href: "/admin/skills", iconName: "Wrench", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", visible: true },
  { key: "/admin/services", name: "Services", href: "/admin/services", iconName: "Briefcase", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", visible: true },
  { key: "/admin/blog", name: "Blog Posts", href: "/admin/blog", iconName: "BookOpen", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", visible: true },
  { key: "/admin/about", name: "About Page", href: "/admin/about", iconName: "UserCheck", color: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/20", visible: true },
  { key: "/admin/certifications", name: "Certifications", href: "/admin/certifications", iconName: "Award", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", visible: true },
  { key: "/admin/clients", name: "Clients & Reviews", href: "/admin/clients", iconName: "Building2", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", visible: true },
  { key: "/admin/labs", name: "Labs & Sandboxes", href: "/admin/labs", iconName: "FlaskConical", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", visible: true },
  { key: "/admin/resume", name: "Resume & CV", href: "/admin/resume", iconName: "FileText", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", visible: true },
  { key: "/admin/contact", name: "Contact & Inbox", href: "/admin/contact", iconName: "Mail", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", visible: true },
  { key: "/admin/profile", name: "Owner Profile", href: "/admin/profile", iconName: "User", color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/20", visible: true },
  { key: "/admin/telemetry", name: "Security & Telemetry", href: "/admin/telemetry", iconName: "Radio", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", visible: true },
  { key: "/admin/database-api-hub", name: "Database & API Hub", href: "/admin/database-api-hub", iconName: "Server", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", visible: true },
  { key: "/admin/automation", name: "AI & Automation Hub", href: "/admin/automation", iconName: "Bot", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", visible: true },
  { key: "/admin/users", name: "User Management", href: "/admin/users", iconName: "Users", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", visible: true },
  { key: "/admin/settings", name: "Site Settings", href: "/admin/settings", iconName: "Settings", color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/20", visible: true },
  { key: "/admin/backup", name: "Backup & Restore", href: "/admin/backup", iconName: "Database", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", visible: true },
];
