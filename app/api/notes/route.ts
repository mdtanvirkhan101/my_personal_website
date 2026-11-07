import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const notes = await prisma.note.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, notes });
    } catch (error) {
        console.error("Failed to fetch notes:", error);
        return NextResponse.json({ success: false, notes: [] }, { status: 500 });
    }
}