"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upsertCaseStudy(formData: FormData) {
  await requireAdmin();

  const projectId = formData.get("projectId") as string;
  const problem = (formData.get("problem") as string)?.trim();
  const process = (formData.get("process") as string)?.trim() || null;
  const solution = (formData.get("solution") as string)?.trim();
  const outcome = (formData.get("outcome") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() || null;

  if (!projectId || !problem || !solution) {
    throw new Error("Project, Problem statement, and Solution are required.");
  }

  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!existingProject) {
    throw new Error("Selected project does not exist.");
  }

  const result = await prisma.caseStudy.upsert({
    where: { projectId },
    update: {
      problem,
      process,
      solution,
      outcome,
      content,
    },
    create: {
      projectId,
      problem,
      process,
      solution,
      outcome,
      content,
    },
  });

  revalidatePath("/admin/case-studies");
  revalidatePath("/admin/projects");
  revalidatePath("/case-studies");
  revalidatePath(`/case-studies/${existingProject.slug}`);
  revalidatePath("/");

  return result;
}

export async function deleteCaseStudy(caseStudyId: string) {
  await requireAdmin();

  const existing = await prisma.caseStudy.findUnique({
    where: { id: caseStudyId },
    include: { project: true },
  });

  if (!existing) {
    throw new Error("Case study not found.");
  }

  await prisma.caseStudy.delete({
    where: { id: caseStudyId },
  });

  revalidatePath("/admin/case-studies");
  revalidatePath("/admin/projects");
  revalidatePath("/case-studies");
  if (existing.project) {
    revalidatePath(`/case-studies/${existing.project.slug}`);
  }
  revalidatePath("/");
}
