import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { LabsManager } from "@/components/admin/labs-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Labs & Sandboxes Console | Admin CMS",
  description: "Manage experimental network sandboxes and security prototypes.",
};

export default async function AdminLabsPage() {
  await getAdminSession();

  const labs = await prisma.lab.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <LabsManager initialLabs={labs as any} />;
}
