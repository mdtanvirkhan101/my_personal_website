import { BaseAIProvider, AICompletionOptions, AICompletionResult } from "./provider";

export class CustomAIProvider implements BaseAIProvider {
  providerKey = "custom";
  name = "Custom OpenAI-Compatible";

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    if (!baseUrl) {
      return { success: false, message: "Custom endpoint Base URL is required.", latencyMs: 0 };
    }

    const endpoint = baseUrl.replace(/\/+$/, "") + "/models";
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      });

      const latencyMs = Date.now() - start;
      return {
        success: res.ok,
        message: res.ok ? "Successfully reached custom endpoint." : `HTTP ${res.status}: Failed to reach custom endpoint.`,
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to custom API",
        latencyMs: Date.now() - start,
      };
    }
  }

  async generateCompletion(apiKey: string, options: AICompletionOptions, baseUrl?: string): Promise<AICompletionResult> {
    const start = Date.now();
    if (!baseUrl) {
      throw new Error("Base URL is required for custom provider.");
    }

    const endpoint = baseUrl.replace(/\/+$/, "") + "/chat/completions";
    const model = options.model || "custom-model";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
        }),
      });

      const durationMs = Date.now() - start;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `Custom API error: HTTP ${res.status}`);
      }

      const content = data.choices?.[0]?.message?.content || "";
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || promptTokens + completionTokens;

      return {
        success: true,
        content,
        provider: "custom",
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        durationMs,
        estimatedCost: 0,
      };
    } catch (err: any) {
      return {
        success: false,
        content: "",
        provider: "custom",
        model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        durationMs: Date.now() - start,
        estimatedCost: 0,
        error: err.message,
      };
    }
  }
}

