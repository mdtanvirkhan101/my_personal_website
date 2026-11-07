"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ================= CLIENTS =================

export async function createClient(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const website = (formData.get("website") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

  if (!name) {
    throw new Error("Client name is required.");
  }

  const client = await prisma.client.create({
    data: {
      name,
      website,
      logoUrl,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  revalidatePath("/");

  return client;
}

export async function updateClient(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const website = (formData.get("website") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

  if (!id || !name) {
    throw new Error("Client ID and name are required.");
  }

  const updated = await prisma.client.update({
    where: { id },
    data: {
      name,
      website,
      logoUrl,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  revalidatePath("/");

  return updated;
}

export async function deleteClient(id: string) {
  await requireAdmin();

  await prisma.client.delete({
    where: { id },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  revalidatePath("/");
}

// ================= TESTIMONIALS =================

export async function createTestimonial(formData: FormData) {
  await requireAdmin();

  const clientName = (formData.get("clientName") as string)?.trim();
  const role = (formData.get("role") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim();
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;
  const clientId = (formData.get("clientId") as string)?.trim() || null;
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";

  if (!clientName || !content) {
    throw new Error("Client name and testimonial content are required.");
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      clientName,
      role,
      content,
      avatarUrl,
      clientId: clientId || null,
      featured,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  revalidatePath("/");

  return testimonial;
}

export async function updateTestimonial(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const clientName = (formData.get("clientName") as string)?.trim();
  const role = (formData.get("role") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim();
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;
  const clientId = (formData.get("clientId") as string)?.trim() || null;
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";

  if (!id || !clientName || !content) {
    throw new Error("Testimonial ID, client name and content are required.");
  }

  const updated = await prisma.testimonial.update({
    where: { id },
    data: {
      clientName,
      role,
      content,
      avatarUrl,
      clientId: clientId || null,
      featured,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  revalidatePath("/");

  return updated;
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();

  await prisma.testimonial.delete({
    where: { id },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  revalidatePath("/");
}
