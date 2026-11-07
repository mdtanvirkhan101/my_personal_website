import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { SettingsManager } from "@/components/admin/settings-manager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await getAdminSession();

  const settings = await prisma.siteSetting.findMany();
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  return <SettingsManager initialSettings={settingsMap} />;
}
