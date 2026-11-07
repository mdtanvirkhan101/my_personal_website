import { BaseAIProvider, AICompletionOptions, AICompletionResult } from "./provider";

export class ClaudeProvider implements BaseAIProvider {
  providerKey = "claude";
  name = "Anthropic Claude";

  async testConnection(apiKey: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    try {
      // Send a minimal message to verify API key
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        }),
      });

      const latencyMs = Date.now() - start;
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error?.message || `HTTP ${res.status}: Failed to authenticate with Anthropic`,
          latencyMs,
        };
      }

      return {
        success: true,
        message: "Successfully connected to Anthropic Claude API.",
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error while connecting to Anthropic",
        latencyMs: Date.now() - start,
      };
    }
  }

  async generateCompletion(apiKey: string, options: AICompletionOptions): Promise<AICompletionResult> {
    const start = Date.now();
    const model = options.model || "claude-3-5-sonnet-20241022";

    try {
      const systemMessage = options.messages.find((m) => m.role === "system")?.content;
      const userAndAssistantMessages = options.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const bodyPayload: any = {
        model,
        max_tokens: options.maxTokens ?? 1000,
        messages: userAndAssistantMessages,
        temperature: options.temperature ?? 0.7,
      };

      if (systemMessage) {
        bodyPayload.system = systemMessage;
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      const durationMs = Date.now() - start;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `Claude error: HTTP ${res.status}`);
      }

      const content = data.content?.[0]?.text || "";
      const promptTokens = data.usage?.input_tokens || 0;
      const completionTokens = data.usage?.output_tokens || 0;
      const totalTokens = promptTokens + completionTokens;

      // Approximate cost estimate for Sonnet ($3.00/1M in, $15.00/1M out)
      const estimatedCost = (promptTokens * 0.003 + completionTokens * 0.015) / 1000;

      return {
        success: true,
        content,
        provider: "claude",
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
        provider: "claude",
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

