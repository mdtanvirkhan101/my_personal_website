"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const getString = (formData: FormData, key: string): string => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
};

/**
 * Creates or updates an experience/training record.
 * The category is stored in the existing `logoUrl` field to match
 * the current Experience page and admin manager.
 */
export async function saveExperienceAction(formData: FormData) {
    try {
        const id = getString(formData, "id") || null;
        const role = getString(formData, "role");
        const organization = getString(formData, "organization");
        const startDateRaw = getString(formData, "startDate");
        const endDateRaw = getString(formData, "endDate");
        const current = getString(formData, "current") === "true";
        const description = getString(formData, "description") || null;

        // The UI sends one highlight per line; Prisma stores these in attachments.
        const highlightsRaw = getString(formData, "highlights");
        const attachments = highlightsRaw
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        // Keep the existing schema mapping: "work" or "training" in logoUrl.
        const submittedCategory = getString(formData, "category");
        const category =
            submittedCategory === "training" ? "training" : "work";

        if (!role || !organization || !startDateRaw) {
            return {
                success: false,
                error: "Role, Organization and Start Date are required.",
            };
        }

        // Parse date-only form values explicitly to avoid browser-local timezone shifts.
        const startDate = new Date(`${startDateRaw}T00:00:00.000Z`);
        if (Number.isNaN(startDate.getTime())) {
            return { success: false, error: "Please provide a valid Start Date." };
        }

        let endDate: Date | null = null;
        if (!current && endDateRaw) {
            endDate = new Date(`${endDateRaw}T00:00:00.000Z`);
            if (Number.isNaN(endDate.getTime())) {
                return { success: false, error: "Please provide a valid End Date." };
            }

            if (endDate.getTime() < startDate.getTime()) {
                return {
                    success: false,
                    error: "End Date cannot be earlier than Start Date.",
                };
            }
        }

        const data = {
            role,
            organization,
            startDate,
            endDate,
            current,
            description,
            attachments,
            logoUrl: category,
        };

        if (id) {
            await prisma.experience.update({
                where: { id },
                data,
            });
        } else {
            await prisma.experience.create({
                data,
            });
        }

        // Refresh both public and admin pages after a successful save.
        revalidatePath("/experience");
        revalidatePath("/admin/experience");

        return { success: true };
    } catch (error: unknown) {
        console.error("saveExperienceAction failed:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to save experience. Please try again.",
        };
    }
}

export async function deleteExperienceAction(id: string) {
    try {
        const experienceId = typeof id === "string" ? id.trim() : "";
        if (!experienceId) {
            return { success: false, error: "A valid experience ID is required." };
        }

        await prisma.experience.delete({
            where: { id: experienceId },
        });

        // Refresh both public and admin pages after a successful deletion.
        revalidatePath("/experience");
        revalidatePath("/admin/experience");

        return { success: true };
    } catch (error: unknown) {
        console.error("deleteExperienceAction failed:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete experience. Please try again.",
        };
    }
}
