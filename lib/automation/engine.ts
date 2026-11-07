import { prisma } from "@/lib/prisma";
import { WorkflowTriggerType, WorkflowStatus } from "@prisma/client";
import { aiManager } from "@/lib/ai";
import { sendTelegramMessage } from "./integrations/telegram";
import { sendEmailNotification } from "./integrations/email";
import { dispatchOutboundWebhook } from "./integrations/webhook";
import { decryptSecret } from "@/lib/crypto";

/**
 * Executes all active workflows associated with a given trigger
 */
export async function executeTriggerWorkflows(
  triggerType: WorkflowTriggerType,
  event: { source: string; data: Record<string, any> }
): Promise<void> {
  const workflows = await prisma.automationWorkflow.findMany({
    where: {
      triggerType,
      isActive: true,
    },
    include: {
      steps: {
        orderBy: { stepOrder: "asc" },
      },
    },
  });

  for (const workflow of workflows) {
    await executeWorkflow(workflow.id, event.source, event.data);
  }
}

/**
 * Executes a single workflow by ID
 */
export async function executeWorkflow(
  workflowId: string,
  triggerSource: string,
  inputData: Record<string, any>
): Promise<{ success: boolean; executionId: string; error?: string }> {
  const workflow = await prisma.automationWorkflow.findUnique({
    where: { id: workflowId },
    include: {
      steps: { orderBy: { stepOrder: "asc" } },
    },
  });

  if (!workflow) {
    return { success: false, executionId: "", error: "Workflow not found" };
  }

  // Create execution record
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId: workflow.id,
      status: WorkflowStatus.RUNNING,
      triggerSource,
      startedAt: new Date(),
    },
  });

  const startTime = Date.now();
  const stepResults: Array<{ stepOrder: number; actionType: string; success: boolean; result?: any; error?: string }> = [];
  let workflowSuccess = true;
  let finalError = "";

  // Evaluate conditions if configured
  if (Array.isArray(workflow.conditions) && workflow.conditions.length > 0) {
    const passed = evaluateConditions(workflow.conditions, inputData);
    if (!passed) {
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowStatus.SKIPPED,
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          stepResults: [{ status: "SKIPPED", reason: "Conditions not met" }],
        },
      });
      return { success: true, executionId: execution.id };
    }
  }

  // Execute steps sequentially
  let currentContext = { ...inputData };

  for (const step of workflow.steps) {
    const stepStart = Date.now();
    try {
      const config = (step.actionConfig as any) || {};
      const actionResult = await executeAction(step.actionType, config, currentContext);

      stepResults.push({
        stepOrder: step.stepOrder,
        actionType: step.actionType,
        success: actionResult.success,
        result: actionResult.data,
        error: actionResult.error,
      });

      if (!actionResult.success) {
        workflowSuccess = false;
        finalError = actionResult.error || `Step ${step.stepOrder} failed`;
        break;
      }

      // Merge step outputs into running context
      if (actionResult.data && typeof actionResult.data === "object") {
        currentContext = { ...currentContext, ...actionResult.data };
      }
    } catch (err: any) {
      stepResults.push({
        stepOrder: step.stepOrder,
        actionType: step.actionType,
        success: false,
        error: err.message || "Execution exception",
      });
      workflowSuccess = false;
      finalError = err.message;
      break;
    }
  }

  const durationMs = Date.now() - startTime;

  await prisma.workflowExecution.update({
    where: { id: execution.id },
    data: {
      status: workflowSuccess ? WorkflowStatus.SUCCESS : WorkflowStatus.FAILED,
      completedAt: new Date(),
      durationMs,
      stepResults: stepResults as any,
      errorMessage: finalError || null,
    },
  });

  // Log in automation logs
  await prisma.automationLog.create({
    data: {
      level: workflowSuccess ? "INFO" : "ERROR",
      category: "WORKFLOW",
      message: `Workflow "${workflow.name}" ${workflowSuccess ? "completed successfully" : `failed: ${finalError}`}`,
      context: { executionId: execution.id, workflowId: workflow.id, durationMs },
    },
  });

  return {
    success: workflowSuccess,
    executionId: execution.id,
    error: finalError || undefined,
  };
}

/**
 * Action execution router
 */
async function executeAction(
  actionType: string,
  config: Record<string, any>,
  context: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  switch (actionType) {
    case "GENERATE_AI_CONTENT": {
      const prompt = interpolate(config.prompt || "", context);
      const systemPrompt = config.systemPrompt || "You are an automated assistant.";
      const res = await aiManager.generateCompletion({
        purpose: "workflow_step",
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      });
      return { success: res.success, data: { aiOutput: res.content }, error: res.error };
    }

    case "SEND_TELEGRAM": {
      const telegramIntegration = await prisma.integration.findUnique({
        where: { serviceKey: "telegram" },
      });
      const creds = telegramIntegration?.encryptedConfig ? JSON.parse(decryptSecret(telegramIntegration.encryptedConfig)) : {};
      const text = interpolate(config.message || "Workflow notification", context);
      const res = await sendTelegramMessage({ botToken: creds.botToken, chatId: creds.chatId }, text);
      return res;
    }

    case "SEND_EMAIL": {
      const emailIntegration = await prisma.integration.findUnique({
        where: { serviceKey: "smtp" },
      });
      const creds = emailIntegration?.encryptedConfig ? JSON.parse(decryptSecret(emailIntegration.encryptedConfig)) : {};
      const subject = interpolate(config.subject || "Workflow Alert", context);
      const body = interpolate(config.body || "", context);
      const res = await sendEmailNotification(creds, subject, body);
      return res;
    }

    case "CREATE_NOTIFICATION": {
      const title = interpolate(config.title || "Workflow Alert", context);
      const message = interpolate(config.message || "", context);
      await prisma.systemNotification.create({
        data: {
          title,
          message,
          type: config.type || "INFO",
          sourceModule: "WORKFLOW",
        },
      });
      return { success: true };
    }

    case "CALL_WEBHOOK": {
      if (config.endpointId) {
        const res = await dispatchOutboundWebhook(config.endpointId, "workflow.action", context);
        return { success: res.success, error: res.error };
      }
      return { success: false, error: "No endpointId specified" };
    }

    default:
      return { success: false, error: `Unsupported action type: ${actionType}` };
  }
}

/**
 * Basic template interpolation e.g. {{name}} -> context.name
 */
function interpolate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (_, key) => {
    return context[key] !== undefined ? String(context[key]) : "";
  });
}

/**
 * Condition evaluation engine
 */
function evaluateConditions(conditions: any[], context: Record<string, any>): boolean {
  for (const cond of conditions) {
    const val = context[cond.field];
    if (cond.operator === "equals" && String(val) !== String(cond.value)) return false;
    if (cond.operator === "contains" && !String(val).includes(String(cond.value))) return false;
  }
  return true;
}

