import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminSidebarItems } from "@/actions/admin-sidebar";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata = {
  title: "Admin CMS Management Console",
  description: "Manage portfolio content, projects, skills, services, and contact inquiries.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings, sidebarItems] = await Promise.all([
    getAdminSession(),
    prisma.siteSetting.findMany(),
    getAdminSidebarItems(),
  ]);

  // If user is unauthenticated (e.g. on /admin/login), render without sidebar
  if (!session) {
    return (
      <div className="min-h-screen" style={{ background: "#0e0e34" }}>
        {children}
      </div>
    );
  }

  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const adminName = settingsMap["admin_name"] || "Admin CMS";
  const adminTagline = settingsMap["admin_tagline"] || "v1.0 Suite";
  const adminLogo = settingsMap["admin_logo"] || "";

  return (
    <AdminLayoutShell
      adminName={adminName}
      adminTagline={adminTagline}
      adminLogo={adminLogo}
      sidebarItems={sidebarItems}
      userSession={session}
    >
      {children}
    </AdminLayoutShell>
  );
}
