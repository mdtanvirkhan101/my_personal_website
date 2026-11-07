import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ProjectForm } from "@/components/admin/project-form";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { caseStudy: true },
  });

  if (!project) {
    notFound();
  }

  return <ProjectForm mode="edit" initialData={project} />;
}
