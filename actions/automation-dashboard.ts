"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getAutomationOverviewAction() {
  try {
    await requireAdmin();

    const [
      totalWorkflows,
      activeWorkflows,
      executions,
      aiLogs,
      integrations,
      notifications,
    ] = await Promise.all([
      prisma.automationWorkflow.count(),
      prisma.automationWorkflow.count({ where: { isActive: true } }),
      prisma.workflowExecution.findMany({
        orderBy: { startedAt: "desc" },
        take: 20,
        include: { workflow: { select: { name: true } } },
      }),
      prisma.aIUsageLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.integration.findMany(),
      prisma.systemNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const successfulExecutions = executions.filter((e) => e.status === "SUCCESS").length;
    const failedExecutions = executions.filter((e) => e.status === "FAILED").length;

    // AI Usage aggregates
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalEstimatedCost = 0;

    for (const log of aiLogs) {
      totalPromptTokens += log.promptTokens;
      totalCompletionTokens += log.completionTokens;
      totalEstimatedCost += log.estimatedCost;
    }

    return {
      success: true,
      stats: {
        totalWorkflows,
        activeWorkflows,
        pausedWorkflows: totalWorkflows - activeWorkflows,
        successfulExecutions,
        failedExecutions,
        totalAiTokens: totalPromptTokens + totalCompletionTokens,
        totalEstimatedCost: Number(totalEstimatedCost.toFixed(4)),
        totalIntegrations: integrations.length,
        activeIntegrations: integrations.filter((i) => i.isActive).length,
      },
      recentExecutions: executions.slice(0, 8).map((e) => ({
        id: e.id,
        workflowName: e.workflow?.name || "Workflow",
        status: e.status,
        triggerSource: e.triggerSource,
        durationMs: e.durationMs,
        startedAt: e.startedAt.toISOString(),
        errorMessage: e.errorMessage,
      })),
      recentNotifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

