import { NextRequest, NextResponse } from "next/server";
import { runDueScheduledTasks } from "@/lib/automation/scheduler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Basic secret token protection for cron triggers
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runDueScheduledTasks();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

