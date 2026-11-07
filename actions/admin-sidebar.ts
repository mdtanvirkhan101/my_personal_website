"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  AdminSidebarItemConfig,
  defaultSidebarItems,
} from "@/lib/admin-sidebar-config";

/**
 * Fetch ordered Admin Sidebar items from Database
 */
export async function getAdminSidebarItems(): Promise<AdminSidebarItemConfig[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "admin_sidebar_config" },
    });

    if (!setting || !Array.isArray(setting.value)) {
      return defaultSidebarItems;
    }

    const savedList: Array<Partial<AdminSidebarItemConfig>> = setting.value as any;
    const defaultMap = new Map(defaultSidebarItems.map((item) => [item.key, item]));

    const result: AdminSidebarItemConfig[] = [];
    const seen = new Set<string>();

    // Add saved items in their saved order
    for (const saved of savedList) {
      if (saved.key && defaultMap.has(saved.key)) {
        const base = defaultMap.get(saved.key)!;
        result.push({
          ...base,
          name: saved.name || base.name,
          visible: saved.visible !== undefined ? saved.visible : true,
        });
        seen.add(saved.key);
      }
    }

    // Append any newly added default items that were not yet in the saved config
    for (const def of defaultSidebarItems) {
      if (!seen.has(def.key)) {
        result.push(def);
      }
    }

    return result;
  } catch (error) {
    console.error("Error loading admin sidebar items:", error);
    return defaultSidebarItems;
  }
}

/**
 * Save custom Admin Sidebar order & visibility
 */
export async function saveAdminSidebarItems(
  items: AdminSidebarItemConfig[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.siteSetting.upsert({
      where: { key: "admin_sidebar_config" },
      update: { value: items as any },
      create: { key: "admin_sidebar_config", value: items as any },
    });

    revalidatePath("/admin", "layout");
    revalidatePath("/admin/sidebar");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save admin sidebar config:", err);
    return { success: false, error: err.message || "Failed to save sidebar config" };
  }
}

/**
 * Reset Admin Sidebar order to factory defaults
 */
export async function resetAdminSidebarItems(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
    return await saveAdminSidebarItems(defaultSidebarItems);
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reset sidebar" };
  }
}
