"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ServicesPageConfig, defaultServicesPageConfig } from "@/lib/services-page-config";

export async function getServicesPageConfig(): Promise<ServicesPageConfig> {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "services" },
    });

    if (page && page.content) {
      return { ...defaultServicesPageConfig, ...(page.content as any) };
    }
  } catch (error) {
    console.error("Error reading services page config:", error);
  }

  return defaultServicesPageConfig;
}

export async function saveServicesPageConfig(
  newConfig: Partial<ServicesPageConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const current = await getServicesPageConfig();
    const updated = { ...current, ...newConfig };

    await prisma.pageContent.upsert({
      where: { slug: "services" },
      update: {
        title: "Services Page Configuration",
        content: updated as any,
      },
      create: {
        slug: "services",
        title: "Services Page Configuration",
        content: updated as any,
      },
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error saving services page config:", error);
    return { success: false, error: error.message || "Failed to save configuration." };
  }
}

export async function saveServiceAction(formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get("id") as string | null;
    const title = (formData.get("title") as string)?.trim();
    const slug =
      (formData.get("slug") as string)?.trim() ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const description = (formData.get("description") as string)?.trim();
    const icon = (formData.get("icon") as string)?.trim() || "Network";
    const category = (formData.get("category") as string)?.trim() || "SERVICE";
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "1", 10);
    const active = formData.get("active") === "true";

    const tagsRaw = formData.get("tags") as string;
    const attachments = tagsRaw
      ? tagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    if (!title || !description) throw new Error("Title and Description are required.");

    const data = {
      title,
      slug,
      description,
      icon,
      category,
      sortOrder,
      active,
      attachments,
    };

    if (id) {
      await prisma.service.update({ where: { id }, data });
    } else {
      await prisma.service.create({ data });
    }

    revalidatePath("/services");
    revalidatePath("/admin/services");
    revalidatePath("/about");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save record." };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    await requireAdmin();
    await prisma.service.delete({ where: { id } });
    revalidatePath("/services");
    revalidatePath("/admin/services");
    revalidatePath("/about");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete record." };
  }
}

export async function savePageSettingsAction(formData: FormData) {
  try {
    await requireAdmin();
    const newConfig: Partial<ServicesPageConfig> = {
      badgeText: (formData.get("badgeText") as string) || undefined,
      heroHeading: (formData.get("heroHeading") as string) || undefined,
      heroHeadingHighlight: (formData.get("heroHeadingHighlight") as string) || undefined,
      heroSubtitle: (formData.get("heroSubtitle") as string) || undefined,
      servicesTitle: (formData.get("servicesTitle") as string) || undefined,
      servicesDescription: (formData.get("servicesDescription") as string) || undefined,
      solutionsTitle: (formData.get("solutionsTitle") as string) || undefined,
      solutionsDescription: (formData.get("solutionsDescription") as string) || undefined,
      ctaTitle: (formData.get("ctaTitle") as string) || undefined,
      ctaDescription: (formData.get("ctaDescription") as string) || undefined,
      ctaButtonText: (formData.get("ctaButtonText") as string) || undefined,
      showCostEstimator: formData.get("showCostEstimator") === "true",
      showServices: formData.get("showServices") === "true",
      showSolutions: formData.get("showSolutions") === "true",
    };

    return await saveServicesPageConfig(newConfig);
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save settings." };
  }
}
