"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; // Cache validation er jonno add kora holo

export async function createCertification(data: any) {
    try {
        const result = await prisma.certification.create({
            data: {
                name: data.name,
                issuer: data.issuer,
                issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                credentialUrl: data.credentialUrl,
                imageUrl: data.imageUrl,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            }
        });

        // Caching invalidate korchi jate shathe shathe website-e update ashe
        revalidatePath("/certifications");
        revalidatePath("/admin/certifications");

        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to create certification:", error);
        return { success: false, error: "Failed to create certification" };
    }
}

export async function updateCertification(id: string, data: any) {
    try {
        const result = await prisma.certification.update({
            where: { id },
            data: {
                name: data.name,
                issuer: data.issuer,
                issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                credentialUrl: data.credentialUrl,
                imageUrl: data.imageUrl,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            }
        });

        // Caching invalidate korchi
        revalidatePath("/certifications");
        revalidatePath("/admin/certifications");

        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to update certification:", error);
        return { success: false, error: "Failed to update certification" };
    }
}

export async function deleteCertification(id: string) {
    try {
        await prisma.certification.delete({
            where: { id }
        });

        // Caching invalidate korchi
        revalidatePath("/certifications");
        revalidatePath("/admin/certifications");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete certification:", error);
        return { success: false, error: "Failed to delete certification" };
    }
}