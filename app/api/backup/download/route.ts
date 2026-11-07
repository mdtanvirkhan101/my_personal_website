import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getFullWebsiteBackup } from "@/actions/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getFullWebsiteBackup();
    if (!result.success || !result.backup) {
      return NextResponse.json({ error: result.error || "Failed to generate backup" }, { status: 500 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `portfolio-backup-${timestamp}.json`;

    return new NextResponse(JSON.stringify(result.backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Backup download route error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
