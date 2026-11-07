"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { HomePageConfig, defaultHomePageConfig } from "@/lib/home-page-config";

/**
 * Get current home page configuration from PageContent table or fallback to default
 */
export async function getHomePageConfig(): Promise<HomePageConfig> {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "home" },
    });

    if (page && page.content) {
      const stored = page.content as unknown as Partial<HomePageConfig>;
      return { ...defaultHomePageConfig, ...stored };
    }

    // Try reading profile data if available
    const profile =
      (await prisma.profile.findFirst({
        where: { id: "default-owner-profile" },
      })) || (await prisma.profile.findFirst());

    if (profile) {
      return {
        ...defaultHomePageConfig,
        heroName: profile.name.split(" ")[0] || "MD Tanvir",
        heroNameHighlight: profile.name.split(" ").slice(1).join(" ") || "Khan",
        heroRole: profile.headline || defaultHomePageConfig.heroRole,
        heroDescription: profile.bio || defaultHomePageConfig.heroDescription,
        heroAvatarUrl: profile.avatarUrl || defaultHomePageConfig.heroAvatarUrl,
      };
    }
  } catch (error) {
    console.error("Error reading home page config:", error);
  }

  return defaultHomePageConfig;
}

/**
 * Save / Update home page configuration
 */
export async function saveHomePageConfig(
  newConfig: Partial<HomePageConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const current = await getHomePageConfig();
    const merged = { ...current, ...newConfig };

    await prisma.pageContent.upsert({
      where: { slug: "home" },
      update: {
        title: "Home Page Configuration",
        content: merged as any,
        updatedAt: new Date(),
      },
      create: {
        slug: "home",
        title: "Home Page Configuration",
        content: merged as any,
      },
    });

    // Revalidate public home page and admin routes
    revalidatePath("/");
    revalidatePath("/admin/home");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save home page config:", error);
    return { success: false, error: error?.message || "Failed to save configuration" };
  }
}

/**
 * Reset home page configuration to defaults
 */
export async function resetHomePageConfig(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.pageContent.upsert({
      where: { slug: "home" },
      update: {
        title: "Home Page Configuration",
        content: defaultHomePageConfig as any,
        updatedAt: new Date(),
      },
      create: {
        slug: "home",
        title: "Home Page Configuration",
        content: defaultHomePageConfig as any,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/home");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to reset" };
  }
}
