import { BaseAIProvider, AICompletionOptions, AICompletionResult } from "./provider";

export class DeepSeekProvider implements BaseAIProvider {
  providerKey = "deepseek";
  name = "DeepSeek";

  async testConnection(apiKey: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch("https://api.deepseek.com/models", {
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
          message: errorData.error?.message || `HTTP ${res.status}: Failed to authenticate with DeepSeek`,
          latencyMs,
        };
      }

      return {
        success: true,
        message: "Successfully connected to DeepSeek API.",
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error while connecting to DeepSeek",
        latencyMs: Date.now() - start,
      };
    }
  }

  async generateCompletion(apiKey: string, options: AICompletionOptions): Promise<AICompletionResult> {
    const start = Date.now();
    const endpoint = "https://api.deepseek.com/chat/completions";
    const model = options.model || "deepseek-chat";

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
        throw new Error(data.error?.message || `DeepSeek error: HTTP ${res.status}`);
      }

      const content = data.choices?.[0]?.message?.content || "";
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || promptTokens + completionTokens;

      // Approximate cost estimate for deepseek-chat ($0.14/1M in, $0.28/1M out)
      const estimatedCost = (promptTokens * 0.00014 + completionTokens * 0.00028) / 1000;

      return {
        success: true,
        content,
        provider: "deepseek",
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
        provider: "deepseek",
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

