import { getAdminSession } from "@/lib/auth";
import { getDatabaseAndApiHubStatus } from "@/actions/database-api-hub";
import { DatabaseApiHubManager } from "@/components/admin/database-api-hub-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Database & API Hub | Admin CMS",
  description: "Centralized management console for external database clusters and third-party APIs.",
};

export default async function AdminDatabaseApiHubPage() {
  await getAdminSession();

  const status = await getDatabaseAndApiHubStatus();

  return (
    <DatabaseApiHubManager
      initialTelemetry={status.telemetry!}
      initialApiHub={status.apiHub!}
    />
  );
}

