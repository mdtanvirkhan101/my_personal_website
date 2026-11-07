export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export async function sendTelegramMessage(
  config: TelegramConfig,
  text: string,
  parseMode: "Markdown" | "HTML" = "Markdown"
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  if (!config.botToken || !config.chatId) {
    return { success: false, error: "Telegram Bot Token and Chat ID are required." };
  }

  const endpoint = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        success: false,
        error: data.description || `Telegram API error: HTTP ${res.status}`,
      };
    }

    return { success: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to dispatch Telegram message." };
  }
}

export async function testTelegramConnection(
  config: TelegramConfig
): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  if (!config.botToken) {
    return { success: false, message: "Bot Token is required.", latencyMs: 0 };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
    const data = await res.json();
    const latencyMs = Date.now() - start;

    if (!res.ok || !data.ok) {
      return {
        success: false,
        message: data.description || "Invalid Bot Token.",
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Connected successfully to Telegram bot: @${data.result?.username} (${data.result?.first_name})`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Network error connecting to Telegram.",
      latencyMs: Date.now() - start,
    };
  }
}

export async function sendTelegramDocument(
  config: TelegramConfig,
  filename: string,
  content: string | Uint8Array,
  caption?: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  if (!config.botToken || !config.chatId) {
    return { success: false, error: "Telegram Bot Token and Chat ID are required." };
  }

  const endpoint = `https://api.telegram.org/bot${config.botToken}/sendDocument`;

  try {
    const formData = new FormData();
    formData.append("chat_id", config.chatId);
    if (caption) {
      formData.append("caption", caption);
      formData.append("parse_mode", "Markdown");
    }

    const blobPart = typeof content === "string" ? content : (content as any);
    const blob = new Blob([blobPart], { type: "application/json" });
    formData.append("document", blob, filename);

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        success: false,
        error: data.description || `Telegram API error: HTTP ${res.status}`,
      };
    }

    return { success: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to dispatch Telegram document." };
  }
}

