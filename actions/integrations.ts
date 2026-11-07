"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface AIIntegrationConfig {
  provider: "openai" | "gemini" | "anthropic" | "custom";
  apiKey: string;
  model: string;
  customEndpoint?: string;
  autoDraftReply: boolean;
  autoBlogAssist: boolean;
  systemPrompt?: string;
}

export interface WebhookConfig {
  webhookSecret: string;
  allowedTypes: string[]; // ["blog", "project", "service", "inbox"]
  notifyDiscordUrl?: string;
  notifyTelegramBotToken?: string;
  notifyTelegramChatId?: string;
}

/**
 * Get AI and Webhook integration settings
 */
export async function getIntegrationSettings() {
  try {
    await requireAdmin();

    const [aiSetting, webhookSetting, channelCreds] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "ai_integration_config" } }),
      prisma.siteSetting.findUnique({ where: { key: "content_webhook_config" } }),
      prisma.siteSetting.findUnique({ where: { key: "channel_api_credentials" } }),
    ]);

    const defaultAI: AIIntegrationConfig = {
      provider: "gemini",
      apiKey: "",
      model: "gemini-1.5-flash",
      autoDraftReply: true,
      autoBlogAssist: true,
      systemPrompt: "You are an expert AI assistant for Tanvir's portfolio website. You write polished, professional, developer-focused content.",
    };

    const defaultWebhook: WebhookConfig = {
      webhookSecret: "portfolio_content_secret_2026",
      allowedTypes: ["blog", "project", "service", "inbox"],
    };

    const defaultChannelCreds = {
      whatsapp: {
        accessToken: "",
        phoneNumberId: "",
        businessAccountId: "",
      },
      facebook: {
        pageAccessToken: "",
        appSecret: "",
        pageId: "",
      },
      instagram: {
        accessToken: "",
        accountId: "",
      },
      telegram: {
        botToken: "",
        chatId: "",
      },
      wechat: {
        appId: "",
        appSecret: "",
      },
    };

    return {
      success: true,
      aiConfig: (aiSetting?.value as unknown as AIIntegrationConfig) || defaultAI,
      webhookConfig: (webhookSetting?.value as unknown as WebhookConfig) || defaultWebhook,
      channelCreds: (channelCreds?.value as unknown as typeof defaultChannelCreds) || defaultChannelCreds,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load integration settings" };
  }
}

/**
 * Save AI integration configuration
 */
export async function saveAIIntegrationConfig(config: AIIntegrationConfig) {
  try {
    await requireAdmin();

    await prisma.siteSetting.upsert({
      where: { key: "ai_integration_config" },
      update: { value: config as any },
      create: { key: "ai_integration_config", value: config as any },
    });

    revalidatePath("/admin/integrations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save AI config" };
  }
}

/**
 * Save Webhook integration configuration
 */
export async function saveWebhookConfig(config: WebhookConfig) {
  try {
    await requireAdmin();

    await prisma.siteSetting.upsert({
      where: { key: "content_webhook_config" },
      update: { value: config as any },
      create: { key: "content_webhook_config", value: config as any },
    });

    revalidatePath("/admin/integrations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save webhook config" };
  }
}

/**
 * Save multi-channel API credentials (WhatsApp, Facebook, Telegram, etc.)
 */
export async function saveChannelCredentials(credentials: any) {
  try {
    await requireAdmin();

    await prisma.siteSetting.upsert({
      where: { key: "channel_api_credentials" },
      update: { value: credentials },
      create: { key: "channel_api_credentials", value: credentials },
    });

    revalidatePath("/admin/integrations");
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save channel credentials" };
  }
}
