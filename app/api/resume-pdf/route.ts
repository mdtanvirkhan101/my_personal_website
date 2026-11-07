import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Check if user configured a custom URL in profile or site settings
    const [profile, setting] = await Promise.all([
      prisma.profile.findFirst({ where: { id: "default-owner-profile" } }).then((p) => p || prisma.profile.findFirst()),
      prisma.siteSetting.findUnique({ where: { key: "resume_pdf_url" } }),
    ]);

    let configuredUrl = (profile?.resumeUrl || setting?.value || "").toString().trim();

    // Candidates on local disk in priority order:
    const candidates = [
      configuredUrl ? path.join(process.cwd(), "public", configuredUrl.replace(/^\/+/, "")) : null,
      path.join(process.cwd(), "public", "uploads", "1793964968919-CV_of_MD_Tanvir_Khan.pdf"),
      path.join(process.cwd(), "public", "uploads", "1793963886770-CV_of_MD_Tanvir_Khan.pdf"),
      path.join(process.cwd(), "public", "CV of MD Tanvir Khan.pdf"),
      path.join(process.cwd(), "public", "resume.pdf"),
      path.join(process.cwd(), "public", "cv.pdf"),
    ].filter(Boolean) as string[];

    let targetFile: string | null = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        targetFile = p;
        break;
      }
    }

    if (!targetFile) {
      return new NextResponse("CV PDF file not found on server", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="CV_of_MD_Tanvir_Khan.pdf"',
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error serving CV PDF: ${error.message}`, { status: 500 });
  }
}

