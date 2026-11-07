"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const SKILL_CATEGORY_IMAGES_KEY = "skills_category_images";

type SkillCategoryImages = Record<string, string>;

function categoryImageKey(type: "CORE" | "TOOL", category: string) {
    return `${type}:${category.trim()}`;
}

export async function getSkillCategoryImagesAction() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: SKILL_CATEGORY_IMAGES_KEY },
            select: { value: true },
        });
        const value = setting?.value;
        const images: SkillCategoryImages =
            value && typeof value === "object" && !Array.isArray(value)
                ? Object.fromEntries(
                    Object.entries(value as Record<string, unknown>).filter(
                        ([key, url]) => typeof key === "string" && typeof url === "string"
                    ) as [string, string][]
                  )
                : {};
        return { success: true as const, images };
    } catch (error: any) {
        return { success: false as const, images: {} as SkillCategoryImages, error: error.message || "Could not load category images." };
    }
}

export async function saveSkillCategoryImageAction(
    category: string,
    type: "CORE" | "TOOL",
    imageUrl: string
) {
    try {
        const cleanCategory = category.trim();
        const cleanUrl = imageUrl.trim();
        if (!cleanCategory) throw new Error("Category name is required.");
        if (cleanUrl && !/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith("/")) {
            throw new Error("Please select a valid image from the Media Library.");
        }

        const setting = await prisma.siteSetting.findUnique({
            where: { key: SKILL_CATEGORY_IMAGES_KEY },
            select: { value: true },
        });
        const current = setting?.value;
        const images: SkillCategoryImages =
            current && typeof current === "object" && !Array.isArray(current)
                ? { ...(current as SkillCategoryImages) }
                : {};
        const key = categoryImageKey(type, cleanCategory);
        if (cleanUrl) images[key] = cleanUrl;
        else delete images[key];

        await prisma.siteSetting.upsert({
            where: { key: SKILL_CATEGORY_IMAGES_KEY },
            create: { key: SKILL_CATEGORY_IMAGES_KEY, value: images as any },
            update: { value: images as any },
        });

        revalidatePath("/");
        revalidatePath("/skills");
        revalidatePath("/admin/skills");
        return { success: true as const, images };
    } catch (error: any) {
        return { success: false as const, error: error.message || "Could not save category image." };
    }
}

const allowedIconName = (value: FormDataEntryValue | null, fallback: string) => {
    const name = typeof value === "string" ? value.trim() : "";
    // Lucide component export names only; prevents arbitrary content being stored.
    return /^[A-Za-z][A-Za-z0-9]{0,40}$/.test(name) ? name : fallback;
};

export async function saveSkillAction(formData: FormData) {
    try {
        const id = formData.get("id") as string | null;
        const name = (formData.get("name") as string)?.trim();
        const category = (formData.get("category") as string)?.trim();
        const type = (formData.get("type") as string)?.trim() || "CORE";
        const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
        const showOnSite = formData.get("showOnSite") === "true";
        const rootIcon = allowedIconName(formData.get("rootIcon"), type === "TOOL" ? "Layers" : "Code2");
        const categoryIcon = allowedIconName(formData.get("categoryIcon"), "Network");
        const percentage = Number(formData.get("percentage") ?? 85);

        if (!name || !category) throw new Error("Name and Category are required.");
        if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
            throw new Error("Percentage must be a whole number between 0 and 100.");
        }
        if (!Number.isFinite(sortOrder)) throw new Error("Priority order must be a valid number.");

        // level 1 = Technical Skills, level 2 = Tools & Tech Stack, level 0 = Hidden
        const level = showOnSite ? (type === "TOOL" ? 2 : 1) : 0;
        const data = { name, category, level, sortOrder, rootIcon, categoryIcon, percentage };

        if (id) {
            await prisma.skill.update({ where: { id }, data });
        } else {
            await prisma.skill.create({ data });
        }

        // Keep the section root and category icon consistent for all skills in that group.
        await prisma.skill.updateMany({
            where: { category, level },
            data: { categoryIcon },
        });
        if (showOnSite) {
            await prisma.skill.updateMany({
                where: { level },
                data: { rootIcon },
            });
        }

        revalidatePath("/");
        revalidatePath("/skills");
        revalidatePath("/admin/skills");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to save record." };
    }
}

export async function renameSkillCategoryAction(oldName: string, newName: string, type: "CORE" | "TOOL") {
    try {
        const oldCategory = oldName.trim();
        const nextCategory = newName.trim();
        if (!oldCategory || !nextCategory) throw new Error("Category names are required.");
        if (oldCategory === nextCategory) return { success: true };

        const level = type === "TOOL" ? 2 : 1;
        await prisma.skill.updateMany({
            where: { category: oldCategory, level },
            data: { category: nextCategory },
        });

        // Keep the category image attached to the renamed category.
        const setting = await prisma.siteSetting.findUnique({
            where: { key: SKILL_CATEGORY_IMAGES_KEY },
            select: { value: true },
        });
        const current = setting?.value;
        if (current && typeof current === "object" && !Array.isArray(current)) {
            const images = { ...(current as SkillCategoryImages) };
            const oldKey = categoryImageKey(type, oldCategory);
            const newKey = categoryImageKey(type, nextCategory);
            if (images[oldKey]) {
                images[newKey] = images[oldKey];
                delete images[oldKey];
                await prisma.siteSetting.upsert({
                    where: { key: SKILL_CATEGORY_IMAGES_KEY },
                    create: { key: SKILL_CATEGORY_IMAGES_KEY, value: images as any },
                    update: { value: images as any },
                });
            }
        }
        revalidatePath("/");
        revalidatePath("/skills");
        revalidatePath("/admin/skills");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Could not rename category." };
    }
}

export async function deleteSkillAction(id: string) {
    try {
        await prisma.skill.delete({ where: { id } });
        revalidatePath("/");
        revalidatePath("/skills");
        revalidatePath("/admin/skills");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete record." };
    }
}
