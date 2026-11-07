import { BaseAIProvider, AICompletionOptions, AICompletionResult } from "./provider";

export class OpenAIProvider implements BaseAIProvider {
  providerKey = "openai";
  name = "OpenAI";

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    const endpoint = (baseUrl ? baseUrl.replace(/\/+$/, "") : "https://api.openai.com/v1") + "/models";

    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const latencyMs = Date.now() - start;
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error?.message || `HTTP ${res.status}: Failed to authenticate with OpenAI`,
          latencyMs,
        };
      }

      return {
        success: true,
        message: "Successfully connected to OpenAI API.",
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error while connecting to OpenAI",
        latencyMs: Date.now() - start,
      };
    }
  }

  async generateCompletion(apiKey: string, options: AICompletionOptions, baseUrl?: string): Promise<AICompletionResult> {
    const start = Date.now();
    const endpoint = (baseUrl ? baseUrl.replace(/\/+$/, "") : "https://api.openai.com/v1") + "/chat/completions";
    const model = options.model || "gpt-4o-mini";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
        throw new Error(data.error?.message || `OpenAI error: HTTP ${res.status}`);
      }

      const content = data.choices?.[0]?.message?.content || "";
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || promptTokens + completionTokens;

      // Approximate cost estimate for gpt-4o-mini ($0.15/1M in, $0.60/1M out)
      const estimatedCost = (promptTokens * 0.00015 + completionTokens * 0.0006) / 1000;

      return {
        success: true,
        content,
        provider: "openai",
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        durationMs,
        estimatedCost,
      };
    } catch (err: any) {
      return {
        success: false,
        content: "",
        provider: "openai",
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

