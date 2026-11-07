
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ProjectsManager } from "@/components/admin/project-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProjectsPage() {
  await getAdminSession();

  const projects = await prisma.project.findMany({
    include: { caseStudy: true },
    orderBy: { createdAt: "desc" },
  });

  return <ProjectsManager initialProjects={projects} />;
}
