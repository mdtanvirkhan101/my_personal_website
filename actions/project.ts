"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PublishStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";

export async function saveProjectAction(formData: FormData) {
  try {
    await requireAdmin();

    const id = formData.get("id") as string | null;
    const title = (formData.get("title") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const summary = (formData.get("summary") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const coverUrl = (formData.get("coverUrl") as string)?.trim() || null;
    const liveUrl = (formData.get("liveUrl") as string)?.trim() || null;
    const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
    const featured = formData.get("featured") === "true";
    const statusRaw = ((formData.get("status") as string) || "PUBLISHED").toUpperCase();
    const status: PublishStatus =
      statusRaw === "DRAFT"
        ? PublishStatus.DRAFT
        : statusRaw === "ARCHIVED"
        ? PublishStatus.ARCHIVED
        : PublishStatus.PUBLISHED;

    const stackRaw = (formData.get("stack") as string) || "";
    const stack = stackRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const hasCaseStudy = formData.get("hasCaseStudy") === "true";
    const problem = (formData.get("caseStudyProblem") as string)?.trim() || "";
    const solution = (formData.get("caseStudySolution") as string)?.trim() || "";
    const outcome = (formData.get("caseStudyOutcome") as string)?.trim() || "";

    if (!title || !slug) {
      throw new Error("Title and Slug are required.");
    }

    if (id) {
      await prisma.project.update({
        where: { id },
        data: {
          title,
          slug,
          summary,
          coverUrl,
          liveUrl,
          repoUrl,
          featured,
          status,
          stack,
          attachments: { category },
          ...(hasCaseStudy
            ? {
              caseStudy: {
                upsert: {
                  create: { problem, solution, outcome },
                  update: { problem, solution, outcome },
                },
              },
            }
            : {
              caseStudy: {
                delete: true,
              },
            }),
        },
      });
    } else {
      await prisma.project.create({
        data: {
          title,
          slug,
          summary,
          coverUrl,
          liveUrl,
          repoUrl,
          featured,
          status,
          stack,
          attachments: { category },
          ...(hasCaseStudy && (problem || solution || outcome)
            ? {
              caseStudy: {
                create: { problem, solution, outcome },
              },
            }
            : {}),
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/case-studies");
    revalidatePath("/admin/projects");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to process project" };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await requireAdmin();

    await prisma.caseStudy.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/case-studies");
    revalidatePath("/admin/projects");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete project" };
  }
}