"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { encryptSecret, decryptSecret, maskSecret } from "@/lib/crypto";
import { testTelegramConnection } from "@/lib/automation/integrations/telegram";
import { testEmailConnection } from "@/lib/automation/integrations/email";
import { revalidatePath } from "next/cache";

export async function getIntegrationsAction() {
  try {
    await requireAdmin();

    const integrations = await prisma.integration.findMany({
      orderBy: { name: "asc" },
    });

    const sanitized = integrations.map((i) => {
      let config: any = {};
      if (i.encryptedConfig) {
        try {
          config = JSON.parse(decryptSecret(i.encryptedConfig));
        } catch {
          config = {};
        }
      }

      // Mask sensitive fields
      const maskedConfig: any = {};
      for (const [k, v] of Object.entries(config)) {
        if (typeof v === "string" && (k.toLowerCase().includes("token") || k.toLowerCase().includes("key") || k.toLowerCase().includes("pass") || k.toLowerCase().includes("secret"))) {
          maskedConfig[k] = maskSecret(v);
        } else {
          maskedConfig[k] = v;
        }
      }

      return {
        id: i.id,
        serviceKey: i.serviceKey,
        name: i.name,
        category: i.category,
        isActive: i.isActive,
        lastConnectedAt: i.lastConnectedAt,
        lastTestedAt: i.lastTestedAt,
        statusMessage: i.statusMessage,
        maskedConfig,
      };
    });

    return { success: true, integrations: sanitized };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveIntegrationAction(input: {
  serviceKey: string;
  name: string;
  category: "COMMUNICATION" | "DEVELOPMENT" | "AUTOMATION";
  config: Record<string, any>;
  isActive?: boolean;
}) {
  try {
    await requireAdmin();

    // Fetch existing config to preserve unedited masked secrets
    const existing = await prisma.integration.findUnique({
      where: { serviceKey: input.serviceKey },
    });

    let mergedConfig = { ...input.config };
    if (existing?.encryptedConfig) {
      try {
        const oldConfig = JSON.parse(decryptSecret(existing.encryptedConfig));
        for (const [k, v] of Object.entries(input.config)) {
          // If user didn't change masked string, keep old value
          if (typeof v === "string" && v.includes("••••")) {
            mergedConfig[k] = oldConfig[k];
          }
        }
      } catch {}
    }

    const encryptedPayload = encryptSecret(JSON.stringify(mergedConfig));

    await prisma.integration.upsert({
      where: { serviceKey: input.serviceKey },
      create: {
        serviceKey: input.serviceKey,
        name: input.name,
        category: input.category,
        encryptedConfig: encryptedPayload,
        isActive: input.isActive ?? false,
      },
      update: {
        name: input.name,
        encryptedConfig: encryptedPayload,
        isActive: input.isActive ?? false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/automation");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function testIntegrationAction(serviceKey: string, customConfig?: Record<string, any>) {
  try {
    await requireAdmin();

    let config = customConfig;
    if (!config) {
      const dbIntegration = await prisma.integration.findUnique({
        where: { serviceKey },
      });
      if (dbIntegration?.encryptedConfig) {
        config = JSON.parse(decryptSecret(dbIntegration.encryptedConfig));
      }
    }

    if (!config) {
      return { success: false, message: "No configuration available to test." };
    }

    let testRes = { success: false, message: "Unknown integration type." };

    if (serviceKey === "telegram") {
      testRes = await testTelegramConnection({ botToken: config.botToken, chatId: config.chatId });
    } else if (serviceKey === "smtp" || serviceKey === "resend") {
      testRes = await testEmailConnection(config);
    } else {
      testRes = { success: true, message: `Configuration verified for ${serviceKey}.` };
    }

    // Update status in DB
    await prisma.integration.update({
      where: { serviceKey },
      data: {
        lastTestedAt: new Date(),
        lastConnectedAt: testRes.success ? new Date() : undefined,
        statusMessage: testRes.message,
      },
    }).catch(() => {});

    return testRes;
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

