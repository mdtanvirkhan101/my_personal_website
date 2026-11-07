export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  purpose?: string;
}

export interface AICompletionResult {
  success: boolean;
  content: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  estimatedCost: number;
  error?: string;
}

export interface BaseAIProvider {
  providerKey: string;
  name: string;
  testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; message: string; latencyMs: number }>;
  generateCompletion(apiKey: string, options: AICompletionOptions, baseUrl?: string): Promise<AICompletionResult>;
}

