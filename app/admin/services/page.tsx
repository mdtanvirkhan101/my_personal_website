import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ServicesManager } from "@/components/admin/services-manager";
import { getServicesPageConfig } from "@/actions/services-admin-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & Solutions Manager | Admin CMS",
  description: "Complete control over services, technical solutions, cost estimator, and page content.",
};

export default async function AdminServicesPage() {
  await getAdminSession();

  const [dbServices, pageConfig] = await Promise.all([
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    getServicesPageConfig(),
  ]);

  return (
    <div className="space-y-6">
      <ServicesManager
        initialServices={dbServices}
        initialConfig={pageConfig}
      />
    </div>
  );
}
