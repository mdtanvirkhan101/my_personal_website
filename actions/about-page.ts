"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AboutPageConfig, defaultAboutPageConfig } from "@/lib/about-page-config";

/**
 * Fetch About Page content configuration
 */
export async function getAboutPageConfig(): Promise<AboutPageConfig> {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "about" },
    });

    if (page && page.content) {
      return { ...defaultAboutPageConfig, ...(page.content as any) };
    }
  } catch (error) {
    console.error("Error reading about page config:", error);
  }

  return defaultAboutPageConfig;
}

/**
 * Save About Page content configuration
 */
export async function saveAboutPageConfig(
  newConfig: Partial<AboutPageConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const current = await getAboutPageConfig();
    const updated = { ...current, ...newConfig };

    await prisma.pageContent.upsert({
      where: { slug: "about" },
      update: {
        title: "About Page Configuration",
        content: updated as any,
      },
      create: {
        slug: "about",
        title: "About Page Configuration",
        content: updated as any,
      },
    });

    revalidatePath("/about");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error saving about page config:", error);
    return { success: false, error: error.message || "Failed to save configuration." };
  }
}

