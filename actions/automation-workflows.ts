"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { WorkflowTriggerType } from "@prisma/client";
import { executeWorkflow } from "@/lib/automation/engine";
import { revalidatePath } from "next/cache";

export async function getWorkflowsAction() {
  try {
    await requireAdmin();

    const workflows = await prisma.automationWorkflow.findMany({
      include: {
        steps: { orderBy: { stepOrder: "asc" } },
        executions: {
          orderBy: { startedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, workflows };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveWorkflowAction(input: {
  id?: string;
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  isActive?: boolean;
  steps: Array<{ stepOrder: number; actionType: string; actionConfig: Record<string, any> }>;
}) {
  try {
    await requireAdmin();

    if (input.id) {
      // Update
      await prisma.automationWorkflow.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          triggerType: input.triggerType,
          isActive: input.isActive ?? true,
          updatedAt: new Date(),
        },
      });

      // Replace steps
      await prisma.workflowStep.deleteMany({ where: { workflowId: input.id } });
      for (const step of input.steps) {
        await prisma.workflowStep.create({
          data: {
            workflowId: input.id,
            stepOrder: step.stepOrder,
            actionType: step.actionType,
            actionConfig: step.actionConfig as any,
          },
        });
      }

      revalidatePath("/admin/automation");
      return { success: true, id: input.id };
    } else {
      // Create
      const created = await prisma.automationWorkflow.create({
        data: {
          name: input.name,
          description: input.description,
          triggerType: input.triggerType,
          isActive: input.isActive ?? true,
          steps: {
            create: input.steps.map((s) => ({
              stepOrder: s.stepOrder,
              actionType: s.actionType,
              actionConfig: s.actionConfig as any,
            })),
          },
        },
      });

      revalidatePath("/admin/automation");
      return { success: true, id: created.id };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function triggerManualWorkflowAction(workflowId: string, testPayload: Record<string, any> = {}) {
  try {
    await requireAdmin();
    const result = await executeWorkflow(workflowId, "manual_test", testPayload);
    revalidatePath("/admin/automation");
    return result;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

