"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ContactPageConfig, defaultContactPageConfig } from "@/lib/contact-page-config";

/**
 * Get current contact page configuration from PageContent table or fallback to default
 */
export async function getContactPageConfig(): Promise<ContactPageConfig> {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "contact" },
    });

    if (page && page.content) {
      const stored = page.content as unknown as Partial<ContactPageConfig>;
      return { ...defaultContactPageConfig, ...stored };
    }

    // Try reading profile data if available for fallback email / location
    const profile =
      (await prisma.profile.findFirst({
        where: { id: "default-owner-profile" },
      })) || (await prisma.profile.findFirst());

    if (profile) {
      return {
        ...defaultContactPageConfig,
        email: profile.email || defaultContactPageConfig.email,
        location: profile.location || defaultContactPageConfig.location,
      };
    }
  } catch (error) {
    console.error("Error reading contact page config:", error);
  }

  return defaultContactPageConfig;
}

/**
 * Save / Update contact page configuration
 */
export async function saveContactPageConfig(
  newConfig: Partial<ContactPageConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const current = await getContactPageConfig();
    const merged = { ...current, ...newConfig };

    await prisma.pageContent.upsert({
      where: { slug: "contact" },
      update: {
        title: "Contact Page Configuration",
        content: merged as any,
        updatedAt: new Date(),
      },
      create: {
        slug: "contact",
        title: "Contact Page Configuration",
        content: merged as any,
      },
    });

    // Revalidate public contact page and admin routes
    revalidatePath("/contact");
    revalidatePath("/admin/contact");

    return { success: true };
  } catch (error: any) {
    console.error("Error saving contact page config:", error);
    return { success: false, error: error.message || "Failed to save configuration" };
  }
}
