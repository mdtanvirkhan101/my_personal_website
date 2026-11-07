"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PublishStatus } from "@prisma/client";

// ================= SKILLS =================
export async function createSkill(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "General";
  const level = parseInt((formData.get("level") as string) || "5", 10);
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

  if (!name) throw new Error("Skill name is required");

  await prisma.skill.create({
    data: { name, category, level, sortOrder },
  });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/about");
  revalidatePath("/resume");
}

export async function updateSkill(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "General";
  const level = parseInt((formData.get("level") as string) || "5", 10);
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

  if (!id || !name) throw new Error("Skill ID and name are required");

  await prisma.skill.update({
    where: { id },
    data: { name, category, level, sortOrder },
  });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/about");
  revalidatePath("/resume");
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await prisma.skill.delete({ where: { id } });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/about");
  revalidatePath("/resume");
}

export async function renameCategory(oldCategory: string, newCategory: string) {
  await requireAdmin();
  if (!oldCategory || !newCategory) throw new Error("Both category names are required");
  await prisma.skill.updateMany({
    where: { category: oldCategory },
    data: { category: newCategory },
  });
  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function deleteCategory(category: string) {
  await requireAdmin();
  if (!category) throw new Error("Category name is required");
  await prisma.skill.deleteMany({
    where: { category },
  });
  revalidatePath("/admin/skills");
  revalidatePath("/");
}

// ================= SERVICES =================
export async function createService(formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const description = (formData.get("description") as string)?.trim();
  const icon = (formData.get("icon") as string)?.trim() || "Code";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  const active = formData.get("active") !== "false";
  let attachments = [];
  try {
    const rawAtt = formData.get("attachments") as string;
    if (rawAtt) attachments = JSON.parse(rawAtt);
  } catch { }

  if (!title || !slug || !description) throw new Error("Missing required fields");

  await prisma.service.create({
    data: { title, slug, description, icon, sortOrder, active, attachments },
  });
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/about");
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const description = (formData.get("description") as string)?.trim();
  const icon = (formData.get("icon") as string)?.trim() || "Code";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  const active = formData.get("active") === "true" || formData.get("active") === "on";
  let attachments = [];
  try {
    const rawAtt = formData.get("attachments") as string;
    if (rawAtt) attachments = JSON.parse(rawAtt);
  } catch { }

  if (!id || !title || !slug || !description) throw new Error("Missing required fields");

  await prisma.service.update({
    where: { id },
    data: { title, slug, description, icon, sortOrder, active, attachments },
  });
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/about");
}

export async function deleteService(id: string) {
  await requireAdmin();
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/about");
}

// ================= EXPERIENCE =================
export async function createExperience(formData: FormData) {
  await requireAdmin();
  const organization = (formData.get("organization") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const current = formData.get("current") === "on" || formData.get("current") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  let attachments = [];
  try {
    const rawAtt = formData.get("attachments") as string;
    if (rawAtt) attachments = JSON.parse(rawAtt);
  } catch { }

  if (!organization || !role || !startDateStr) throw new Error("Missing required fields");

  await prisma.experience.create({
    data: {
      organization,
      role,
      logoUrl: logoUrl || null,
      description: description || null,
      startDate: new Date(startDateStr),
      endDate: current || !endDateStr ? null : new Date(endDateStr),
      current,
      sortOrder,
      attachments,
    },
  });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/resume");
  revalidatePath("/about");
}

export async function updateExperience(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const organization = (formData.get("organization") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const current = formData.get("current") === "on" || formData.get("current") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  let attachments = [];
  try {
    const rawAtt = formData.get("attachments") as string;
    if (rawAtt) attachments = JSON.parse(rawAtt);
  } catch { }

  if (!id || !organization || !role || !startDateStr) throw new Error("Missing required fields");

  await prisma.experience.update({
    where: { id },
    data: {
      organization,
      role,
      logoUrl: logoUrl || null,
      description: description || null,
      startDate: new Date(startDateStr),
      endDate: current || !endDateStr ? null : new Date(endDateStr),
      current,
      sortOrder,
      attachments,
    },
  });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/resume");
  revalidatePath("/about");
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  await prisma.experience.delete({ where: { id } });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/resume");
  revalidatePath("/about");
}

// ================= BLOG POSTS =================
export async function createBlogPost(formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const excerpt = (formData.get("excerpt") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const coverUrl = (formData.get("coverUrl") as string)?.trim();
  const status = (formData.get("status") as string) || "DRAFT";
  let attachments = [];
  try {
    const rawAtt = formData.get("attachments") as string;
    if (rawAtt) attachments = JSON.parse(rawAtt);
  } catch { }

  if (!title || !slug || !content) throw new Error("Title, slug, and content are required");

  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverUrl: coverUrl || null,
      status: status as PublishStatus,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      attachments,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/");
  revalidatePath("/blog");
}

export async function updateBlogPost(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const excerpt = (formData.get("excerpt") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const coverUrl = (formData.get("coverUrl") as string)?.trim();
  const status = (formData.get("status") as string) || "DRAFT";
  let attachments = [];
  try {
    const rawAtt = formData.get("attachments") as string;
    if (rawAtt) attachments = JSON.parse(rawAtt);
  } catch { }

  if (!id || !title || !slug || !content) throw new Error("Missing required fields");

  const existing = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverUrl: coverUrl || null,
      status: status as PublishStatus,
      publishedAt:
        status === "PUBLISHED" && !existing?.publishedAt ? new Date() : existing?.publishedAt,
      attachments,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/");
  revalidatePath("/blog");
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/");
  revalidatePath("/blog");
}

// ================= PROFILE & SOCIAL LINKS =================
export async function updateProfileWithSocials(data: {
  name: string;
  headline?: string;
  bio?: string;
  email?: string;
  location?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  socialLinks?: Array<{ platform: string; url: string; label?: string }>;
}) {
  await requireAdmin();

  await prisma.profile.upsert({
    where: { id: "default-owner-profile" },
    update: {
      name: data.name,
      headline: data.headline || null,
      bio: data.bio || null,
      email: data.email || null,
      location: data.location || null,
      avatarUrl: data.avatarUrl || null,
      resumeUrl: data.resumeUrl || null,
      socialLinks: data.socialLinks ? (data.socialLinks as any) : null,
    },
    create: {
      id: "default-owner-profile",
      name: data.name,
      headline: data.headline || null,
      bio: data.bio || null,
      email: data.email || null,
      location: data.location || null,
      avatarUrl: data.avatarUrl || null,
      resumeUrl: data.resumeUrl || null,
      socialLinks: data.socialLinks ? (data.socialLinks as any) : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/resume");
  revalidatePath("/contact");
  revalidatePath("/admin/profile");
  revalidatePath("/admin/about");
}

// ================= SITE SETTINGS & FOOTER =================
export async function updateSettingsBatch(settingsMap: Record<string, any>) {
  await requireAdmin();

  for (const [key, value] of Object.entries(settingsMap)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/terms");
  revalidatePath("/privacy");
  revalidatePath("/admin");
  revalidatePath("/certifications");
}

// ================= CERTIFICATIONS =================
export async function createCertification(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const issuer = (formData.get("issuer") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const credentialUrl = (formData.get("credentialUrl") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const issuedAtStr = formData.get("issuedAt") as string;
  const expiresAtStr = formData.get("expiresAt") as string;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

  if (!name || !issuer) throw new Error("Certificate name and issuer are required");

  await prisma.certification.create({
    data: {
      name,
      issuer,
      category: category || null,
      credentialUrl: credentialUrl || null,
      imageUrl: imageUrl || null,
      issuedAt: issuedAtStr ? new Date(issuedAtStr) : null,
      expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
      sortOrder,
    },
  });
  revalidatePath("/admin/certifications");
  revalidatePath("/");
  revalidatePath("/certifications");
  revalidatePath("/resume");
  revalidatePath("/about");
}

export async function updateCertification(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const issuer = (formData.get("issuer") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const credentialUrl = (formData.get("credentialUrl") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const issuedAtStr = formData.get("issuedAt") as string;
  const expiresAtStr = formData.get("expiresAt") as string;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

  if (!id || !name || !issuer) throw new Error("Missing required fields");

  await prisma.certification.update({
    where: { id },
    data: {
      name,
      issuer,
      category: category || null,
      credentialUrl: credentialUrl || null,
      imageUrl: imageUrl || null,
      issuedAt: issuedAtStr ? new Date(issuedAtStr) : null,
      expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
      sortOrder,
    },
  });
  revalidatePath("/admin/certifications");
  revalidatePath("/");
  revalidatePath("/certifications");
  revalidatePath("/resume");
  revalidatePath("/about");
}

export async function deleteCertification(id: string) {
  await requireAdmin();
  await prisma.certification.delete({ where: { id } });
  revalidatePath("/admin/certifications");
  revalidatePath("/");
  revalidatePath("/certifications");
  revalidatePath("/resume");
  revalidatePath("/about");
}

// ================= CERTIFICATION PAGE CONTENT =================
export async function renameCertificationCategory(oldName: string, newName: string) {
  await requireAdmin();
  const oldCategory = oldName.trim();
  const newCategory = newName.trim();
  if (!oldCategory || !newCategory) throw new Error("Both category names are required");
  if (oldCategory === newCategory) return;

  await prisma.certification.updateMany({
    where: { category: oldCategory },
    data: { category: newCategory },
  });

  revalidatePath("/admin/certifications");
  revalidatePath("/certifications");
}

export async function removeCertificationCategory(name: string) {
  await requireAdmin();
  const category = name.trim();
  if (!category) throw new Error("Category name is required");

  await prisma.certification.updateMany({
    where: { category },
    data: { category: null },
  });

  revalidatePath("/admin/certifications");
  revalidatePath("/certifications");
}

