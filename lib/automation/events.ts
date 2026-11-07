import { WorkflowTriggerType } from "@prisma/client";
import { executeTriggerWorkflows } from "./engine";

export interface PlatformEvent {
  type: WorkflowTriggerType;
  source: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Dispatches a platform event to any listening workflows asynchronously
 */
export async function dispatchPlatformEvent(
  triggerType: WorkflowTriggerType,
  source: string,
  eventData: Record<string, any>
): Promise<void> {
  const event: PlatformEvent = {
    type: triggerType,
    source,
    data: eventData,
    timestamp: new Date().toISOString(),
  };

  // Trigger matching workflows in background without blocking caller
  executeTriggerWorkflows(triggerType, event).catch((err) => {
    console.error(`[Event Pipeline] Error processing event ${triggerType}:`, err);
  });
}

