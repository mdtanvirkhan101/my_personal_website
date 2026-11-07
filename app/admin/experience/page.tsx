import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ExperienceManager } from "@/components/admin/experience-manager";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  await getAdminSession();

  const experiences = await prisma.experience.findMany({
    orderBy: { startDate: "desc" },
  });

  return <ExperienceManager initialExperiences={experiences} />;
}