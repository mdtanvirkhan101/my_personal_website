import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";

export interface OutboundWebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

export async function dispatchOutboundWebhook(
  endpointId: string,
  event: string,
  payloadData: any
): Promise<{ success: boolean; status?: number; durationMs: number; error?: string }> {
  const start = Date.now();

  try {
    const endpoint = await prisma.webhookEndpoint.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint || !endpoint.isActive || !endpoint.url) {
      return { success: false, durationMs: 0, error: "Endpoint not found or inactive" };
    }

    // Check event filter
    if (endpoint.eventFilters.length > 0 && !endpoint.eventFilters.includes(event) && !endpoint.eventFilters.includes("*")) {
      return { success: true, durationMs: 0 }; // skipped silently
    }

    const payload: OutboundWebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payloadData,
    };

    const bodyString = JSON.stringify(payload);
    const secret = endpoint.encryptedSecret ? decryptSecret(endpoint.encryptedSecret) : "";
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Antigravity-Portfolio-Webhook/1.0",
      "X-Webhook-Event": event,
    };

    if (secret) {
      const signature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const res = await fetch(endpoint.url, {
      method: "POST",
      headers,
      body: bodyString,
    });

    const durationMs = Date.now() - start;
    const responseBodyText = await res.text().catch(() => "");

    // Record delivery
    await prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        eventType: event,
        payload: payload as any,
        responseStatus: res.status,
        responseBody: responseBodyText.slice(0, 1000), // cap to 1000 chars
        durationMs,
        success: res.ok,
      },
    });

    return {
      success: res.ok,
      status: res.status,
      durationMs,
      error: res.ok ? undefined : `HTTP ${res.status}: ${responseBodyText.slice(0, 200)}`,
    };
  } catch (err: any) {
    const durationMs = Date.now() - start;
    return {
      success: false,
      durationMs,
      error: err.message || "Failed to deliver webhook",
    };
  }
}

