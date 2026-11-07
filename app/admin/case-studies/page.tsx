import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { CaseStudiesManager } from "@/components/admin/case-studies-manager";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCaseStudiesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const caseStudies = await prisma.caseStudy.findMany({
    include: {
      project: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const availableProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  return (
    <CaseStudiesManager
      initialCaseStudies={caseStudies}
      availableProjects={availableProjects}
    />
  );
}