import { prisma } from "@/lib/prisma";
import { executeWorkflow } from "./engine";

/**
 * Runs pending scheduled tasks that are due for execution
 */
export async function runDueScheduledTasks(): Promise<{ processed: number; errors: number }> {
  const now = new Date();

  // Find tasks ready to run
  const dueTasks = await prisma.scheduledTask.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { nextRunAt: { lte: now } },
        { nextRunAt: null },
      ],
    },
    take: 10,
  });

  let processed = 0;
  let errors = 0;

  for (const task of dueTasks) {
    try {
      const payload = (task.payload as any) || {};

      if (task.taskType === "WORKFLOW_EXECUTION" && payload.workflowId) {
        await executeWorkflow(payload.workflowId, "scheduler", { taskId: task.id, scheduledTime: now.toISOString() });
      }

      // Schedule next run (e.g. +1 hour by default if recurring)
      const nextRun = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.scheduledTask.update({
        where: { id: task.id },
        data: {
          lastRunAt: now,
          nextRunAt: nextRun,
          lastResult: "Executed successfully",
        },
      });

      processed++;
    } catch (err: any) {
      errors++;
      await prisma.scheduledTask.update({
        where: { id: task.id },
        data: {
          lastRunAt: now,
          lastResult: `Failed: ${err.message}`,
        },
      });
    }
  }

  return { processed, errors };
}

