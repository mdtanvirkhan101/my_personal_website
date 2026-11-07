import { BaseAIProvider, AICompletionOptions, AICompletionResult } from "./provider";

export class GeminiProvider implements BaseAIProvider {
  providerKey = "gemini";
  name = "Google Gemini";

  async testConnection(apiKey: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
      const res = await fetch(endpoint, {
        method: "GET",
      });

      const latencyMs = Date.now() - start;
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error?.message || `HTTP ${res.status}: Failed to authenticate with Google Gemini`,
          latencyMs,
        };
      }

      return {
        success: true,
        message: "Successfully connected to Google Gemini API.",
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error while connecting to Gemini",
        latencyMs: Date.now() - start,
      };
    }
  }

  async generateCompletion(apiKey: string, options: AICompletionOptions): Promise<AICompletionResult> {
    const start = Date.now();
    const model = options.model || "gemini-1.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      // Map OpenAI messages format to Gemini contents
      const systemInstruction = options.messages.find((m) => m.role === "system")?.content;
      const conversationMessages = options.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const bodyPayload: any = {
        contents: conversationMessages.length > 0 ? conversationMessages : [{ role: "user", parts: [{ text: "Hello" }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 1000,
        },
      };

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const durationMs = Date.now() - start;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `Gemini error: HTTP ${res.status}`);
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const promptTokens = data.usageMetadata?.promptTokenCount || 0;
      const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;
      const totalTokens = data.usageMetadata?.totalTokenCount || promptTokens + completionTokens;

      // Approximate cost estimate for gemini-1.5-flash ($0.075/1M in, $0.30/1M out)
      const estimatedCost = (promptTokens * 0.000075 + completionTokens * 0.0003) / 1000;

      return {
        success: true,
        content,
        provider: "gemini",
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
        provider: "gemini",
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

