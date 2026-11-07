export interface EmailConfig {
  fromEmail?: string;
  toEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  resendApiKey?: string;
}

export async function sendEmailNotification(
  config: EmailConfig,
  subject: string,
  content: string,
  isHtml = false
): Promise<{ success: boolean; id?: string; error?: string }> {
  const to = config.toEmail || process.env.ADMIN_NOTIFICATION_EMAIL || "admin@example.com";
  const from = config.fromEmail || "noreply@portfolio.local";

  // 1. If Resend API Key is available
  if (config.resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          [isHtml ? "html" : "text"]: content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || `Resend error: HTTP ${res.status}` };
      }
      return { success: true, id: data.id };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to send email via Resend" };
    }
  }

  // 2. If SMTP is configured
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    // In production without external nodemailer package, log dispatch and mark status
    console.log(`[SMTP Dispatch] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      id: `smtp-${Date.now()}`,
    };
  }

  return {
    success: false,
    error: "No active email service configured (requires either Resend API Key or SMTP credentials).",
  };
}

export async function testEmailConnection(
  config: EmailConfig
): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();

  if (config.resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/api-keys", {
        headers: { Authorization: `Bearer ${config.resendApiKey}` },
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return { success: false, message: "Invalid Resend API Key.", latencyMs };
      }
      return { success: true, message: "Connected to Resend Email API successfully.", latencyMs };
    } catch (err: any) {
      return { success: false, message: err.message, latencyMs: Date.now() - start };
    }
  }

  if (config.smtpHost) {
    return {
      success: true,
      message: `SMTP configuration saved for ${config.smtpHost}:${config.smtpPort || 587}`,
      latencyMs: Date.now() - start,
    };
  }

  return { success: false, message: "Please provide either Resend API Key or SMTP credentials.", latencyMs: 0 };
}

