"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PublishStatus } from "@prisma/client";

export async function createLab(formData: FormData) {
  await requireAdmin();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const description = (formData.get("description") as string)?.trim();
  const demoUrl = (formData.get("demoUrl") as string)?.trim() || null;
  const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
  const coverUrl = (formData.get("coverUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";

  if (!title || !slug || !description) {
    throw new Error("Title, slug, and description are required.");
  }

  const existing = await prisma.lab.findUnique({
    where: { slug },
  });
  if (existing) {
    throw new Error(`A lab sandbox with slug "${slug}" already exists.`);
  }

  const lab = await prisma.lab.create({
    data: {
      title,
      slug,
      description,
      demoUrl,
      repoUrl,
      coverUrl,
      status: status as PublishStatus,
    },
  });

  revalidatePath("/admin/labs");
  revalidatePath("/labs");
  revalidatePath("/");

  return lab;
}

export async function updateLab(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const description = (formData.get("description") as string)?.trim();
  const demoUrl = (formData.get("demoUrl") as string)?.trim() || null;
  const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
  const coverUrl = (formData.get("coverUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";

  if (!id || !title || !slug || !description) {
    throw new Error("Lab ID, title, slug, and description are required.");
  }

  const existingSlug = await prisma.lab.findUnique({
    where: { slug },
  });
  if (existingSlug && existingSlug.id !== id) {
    throw new Error(`A lab sandbox with slug "${slug}" already exists.`);
  }

  const updated = await prisma.lab.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      demoUrl,
      repoUrl,
      coverUrl,
      status: status as PublishStatus,
    },
  });

  revalidatePath("/admin/labs");
  revalidatePath("/labs");
  revalidatePath("/");

  return updated;
}

export async function deleteLab(id: string) {
  await requireAdmin();

  await prisma.lab.delete({
    where: { id },
  });

  revalidatePath("/admin/labs");
  revalidatePath("/labs");
  revalidatePath("/");
}

export async function toggleLabStatus(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  await requireAdmin();

  const updated = await prisma.lab.update({
    where: { id },
    data: { status: status as PublishStatus },
  });

  revalidatePath("/admin/labs");
  revalidatePath("/labs");
  revalidatePath("/");

  return updated;
}
