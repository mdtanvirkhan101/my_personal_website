import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { SkillsManager } from "@/components/admin/skills-manager";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  await getAdminSession();

  const skills = await prisma.skill.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <SkillsManager initialSkills={skills} />;
}