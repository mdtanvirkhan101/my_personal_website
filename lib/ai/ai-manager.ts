import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { BaseAIProvider, AICompletionOptions, AICompletionResult } from "./provider";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { ClaudeProvider } from "./claude";
import { DeepSeekProvider } from "./deepseek";
import { CustomAIProvider } from "./custom";

class AIManager {
  private providers: Map<string, BaseAIProvider> = new Map();

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new ClaudeProvider());
    this.registerProvider(new DeepSeekProvider());
    this.registerProvider(new CustomAIProvider());
  }

  private registerProvider(provider: BaseAIProvider) {
    this.providers.set(provider.providerKey.toLowerCase(), provider);
  }

  getProvider(providerKey: string): BaseAIProvider | undefined {
    return this.providers.get(providerKey.toLowerCase());
  }

  /**
   * Complete unified generation with fallback escalation and token logging
   */
  async generateCompletion(
    options: AICompletionOptions,
    preferredProviderKey?: string
  ): Promise<AICompletionResult> {
    const purpose = options.purpose || "general";

    // 1. Fetch active providers ordered by default first
    const dbProviders = await prisma.aIProvider.findMany({
      where: { isActive: true },
      include: {
        models: { where: { isActive: true } },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    if (dbProviders.length === 0) {
      // Check legacy SiteSetting fallback
      const legacySetting = await prisma.siteSetting.findUnique({
        where: { key: "ai_integration_config" },
      });

      if (legacySetting?.value) {
        const legacy = legacySetting.value as any;
        const adapter = this.getProvider(legacy.provider || "gemini");
        if (adapter && legacy.apiKey) {
          const res = await adapter.generateCompletion(
            legacy.apiKey,
            { ...options, model: options.model || legacy.model },
            legacy.customEndpoint
          );
          await this.logUsage(res, purpose);
          return res;
        }
      }

      return {
        success: false,
        content: "",
        provider: "none",
        model: "none",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        durationMs: 0,
        estimatedCost: 0,
        error: "No active AI provider configured. Please configure an API key in Admin -> AI & Automation -> AI Providers.",
      };
    }

    // 2. Select initial target provider
    let targetProviders: any[] = dbProviders;
    if (preferredProviderKey) {
      const match = dbProviders.find((p: any) => p.providerKey.toLowerCase() === preferredProviderKey.toLowerCase());
      if (match) {
        targetProviders = [match, ...dbProviders.filter((p: any) => p.id !== match.id)];
      }
    }

    let lastError = "";

    // 3. Attempt with fallback escalation
    for (const dbProvider of targetProviders) {
      const adapter = this.getProvider(dbProvider.providerKey);
      if (!adapter) continue;

      const rawApiKey = dbProvider.encryptedApiKey ? decryptSecret(dbProvider.encryptedApiKey) : "";
      if (!rawApiKey && dbProvider.providerKey !== "custom") continue;

      const defaultModel = dbProvider.models.find((m: any) => m.isDefault) || dbProvider.models[0];
      const selectedModel = options.model || defaultModel?.modelKey;

      try {
        const result = await adapter.generateCompletion(
          rawApiKey,
          { ...options, model: selectedModel },
          dbProvider.baseUrl || undefined
        );

        if (result.success) {
          // Adjust cost using DB model rates if available
          if (defaultModel && (defaultModel.inputPricePer1k || defaultModel.outputPricePer1k)) {
            result.estimatedCost =
              (result.promptTokens * (defaultModel.inputPricePer1k || 0) +
                result.completionTokens * (defaultModel.outputPricePer1k || 0)) /
              1000;
          }

          await this.logUsage(result, purpose);
          return result;
        } else {
          lastError = result.error || "Generation failed";
        }
      } catch (err: any) {
        lastError = err.message || "Adapter error";
      }
    }

    return {
      success: false,
      content: "",
      provider: "none",
      model: "none",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      durationMs: 0,
      estimatedCost: 0,
      error: lastError || "All configured AI providers failed to generate completion.",
    };
  }

  /**
   * Record usage metric to database
   */
  private async logUsage(result: AICompletionResult, purpose: string) {
    try {
      await prisma.aIUsageLog.create({
        data: {
          providerKey: result.provider,
          modelKey: result.model,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.totalTokens,
          estimatedCost: result.estimatedCost,
          purpose,
          status: result.success ? "SUCCESS" : "FAILED",
          durationMs: result.durationMs,
          errorDetails: result.error || null,
        },
      });
    } catch (err) {
      console.error("Failed to record AI usage log:", err);
    }
  }
}

export const aiManager = new AIManager();
