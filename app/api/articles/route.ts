import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, articles });
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        return NextResponse.json({ success: false, articles: [] }, { status: 500 });
    }
}