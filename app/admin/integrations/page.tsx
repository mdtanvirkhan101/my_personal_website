import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminIntegrationsPage() {
  redirect("/admin/automation?tab=integrations");
}
