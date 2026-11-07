"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { encryptSecret, decryptSecret, maskSecret } from "@/lib/crypto";
import { aiManager } from "@/lib/ai";
import { revalidatePath } from "next/cache";

/**
 * Get all AI providers with masked secrets and model counts
 */
export async function getAIProvidersAction() {
  try {
    await requireAdmin();

    const providers = await prisma.aIProvider.findMany({
      include: {
        models: { orderBy: { displayName: "asc" } },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    const sanitized = providers.map((p: any) => {
      const raw = p.encryptedApiKey ? decryptSecret(p.encryptedApiKey) : "";
      return {
        id: p.id,
        providerKey: p.providerKey,
        name: p.name,
        baseUrl: p.baseUrl,
        maskedKey: maskSecret(raw),
        hasKey: Boolean(raw),
        isActive: p.isActive,
        isDefault: p.isDefault,
        models: p.models.map((m: any) => ({
          id: m.id,
          modelKey: m.modelKey,
          displayName: m.displayName,
          contextWindow: m.contextWindow,
          inputPricePer1k: m.inputPricePer1k,
          outputPricePer1k: m.outputPricePer1k,
          isDefault: m.isDefault,
          isActive: m.isActive,
        })),
      };
    });

    return { success: true, providers: sanitized };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save or update AI Provider credentials
 */
export async function saveAIProviderAction(input: {
  providerKey: string;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  isActive?: boolean;
  isDefault?: boolean;
}) {
  try {
    await requireAdmin();

    let updateData: any = {
      name: input.name,
      baseUrl: input.baseUrl || null,
      isActive: input.isActive ?? true,
      updatedAt: new Date(),
    };

    if (input.apiKey && input.apiKey.trim() !== "") {
      updateData.encryptedApiKey = encryptSecret(input.apiKey.trim());
    }

    if (input.isDefault) {
      // Unset any current default
      await prisma.aIProvider.updateMany({ data: { isDefault: false } });
      updateData.isDefault = true;
    }

    const provider = await prisma.aIProvider.upsert({
      where: { providerKey: input.providerKey.toLowerCase() },
      create: {
        providerKey: input.providerKey.toLowerCase(),
        name: input.name,
        baseUrl: input.baseUrl || null,
        encryptedApiKey: input.apiKey ? encryptSecret(input.apiKey.trim()) : null,
        isActive: input.isActive ?? true,
        isDefault: input.isDefault ?? false,
      },
      update: updateData,
    });

    revalidatePath("/admin/automation");
    return { success: true, providerId: provider.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Test AI Provider live connection
 */
export async function testAIProviderAction(providerKey: string, customApiKey?: string, baseUrl?: string) {
  try {
    await requireAdmin();

    let keyToTest = customApiKey;
    let urlToTest = baseUrl;

    if (!keyToTest) {
      const dbProvider = await prisma.aIProvider.findUnique({
        where: { providerKey: providerKey.toLowerCase() },
      });
      if (dbProvider?.encryptedApiKey) {
        keyToTest = decryptSecret(dbProvider.encryptedApiKey);
        urlToTest = dbProvider.baseUrl || undefined;
      }
    }

    if (!keyToTest && providerKey !== "custom") {
      return { success: false, message: "No API key provided or saved for this provider.", latencyMs: 0 };
    }

    const adapter = aiManager.getProvider(providerKey);
    if (!adapter) {
      return { success: false, message: `Provider '${providerKey}' is not supported.`, latencyMs: 0 };
    }

    const res = await adapter.testConnection(keyToTest || "", urlToTest);
    return res;
  } catch (err: any) {
    return { success: false, message: err.message, latencyMs: 0 };
  }
}
