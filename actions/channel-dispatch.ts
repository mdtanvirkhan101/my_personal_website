"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { MessageStatus } from "@prisma/client";

export interface OutgoingMessageResult {
  success: boolean;
  dispatchedViaApi: boolean;
  message?: string;
  error?: string;
  deepLink?: string;
}

/**
 * Dispatch outgoing message directly via external platform API
 */
export async function sendOutgoingChannelMessage(params: {
  messageId: string;
  channel: string;
  replyText: string;
  recipientPhone?: string | null;
  platformSenderId?: string | null;
  recipientEmail?: string | null;
}): Promise<OutgoingMessageResult> {
  try {
    await requireAdmin();

    const {
      messageId,
      channel,
      replyText,
      recipientPhone,
      platformSenderId,
      recipientEmail,
    } = params;

    if (!replyText || !replyText.trim()) {
      return { success: false, dispatchedViaApi: false, error: "Reply message text cannot be empty." };
    }

    // Load configured credentials
    const credsSetting = await prisma.siteSetting.findUnique({
      where: { key: "channel_api_credentials" },
    });
    const creds = (credsSetting?.value as any) || {};

    const cleanChannel = (channel || "WEBSITE").toUpperCase();
    let dispatchedViaApi = false;
    let dispatchError: string | null = null;
    let fallbackLink: string | undefined = undefined;

    // 1. WhatsApp Cloud API Dispatch
    if (cleanChannel === "WHATSAPP") {
      const waCreds = creds.whatsapp || {};
      const targetPhone = (recipientPhone || platformSenderId || "").replace(/[^0-9]/g, "");

      fallbackLink = targetPhone
        ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(replyText)}`
        : `https://web.whatsapp.com`;

      if (waCreds.accessToken && waCreds.phoneNumberId && targetPhone) {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${waCreds.phoneNumberId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${waCreds.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: targetPhone,
                type: "text",
                text: { body: replyText.trim() },
              }),
            }
          );

          const data = await res.json();
          if (res.ok && data.messages) {
            dispatchedViaApi = true;
          } else {
            dispatchError = data.error?.message || "WhatsApp API error";
          }
        } catch (e: any) {
          dispatchError = e.message || "Failed to reach WhatsApp Cloud API";
        }
      }
    }

    // 2. Facebook Page Messenger Dispatch
    else if (cleanChannel.startsWith("FACEBOOK")) {
      const fbCreds = creds.facebook || {};
      const targetId = platformSenderId;

      fallbackLink = targetId
        ? `https://m.me/${targetId}`
        : "https://www.facebook.com/messages";

      if (fbCreds.pageAccessToken && targetId) {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${fbCreds.pageAccessToken}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipient: { id: targetId },
                message: { text: replyText.trim() },
              }),
            }
          );

          const data = await res.json();
          if (res.ok && data.message_id) {
            dispatchedViaApi = true;
          } else {
            dispatchError = data.error?.message || "Facebook Graph API error";
          }
        } catch (e: any) {
          dispatchError = e.message || "Failed to reach Facebook API";
        }
      }
    }

    // 3. Telegram Bot Dispatch
    else if (cleanChannel === "TELEGRAM") {
      const tgCreds = creds.telegram || {};
      const targetChatId = platformSenderId || tgCreds.chatId;

      fallbackLink = `https://t.me/`;

      if (tgCreds.botToken && targetChatId) {
        try {
          const res = await fetch(
            `https://api.telegram.org/bot${tgCreds.botToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: targetChatId,
                text: replyText.trim(),
              }),
            }
          );

          const data = await res.json();
          if (res.ok && data.ok) {
            dispatchedViaApi = true;
          } else {
            dispatchError = data.description || "Telegram API error";
          }
        } catch (e: any) {
          dispatchError = e.message || "Failed to reach Telegram API";
        }
      }
    }

    // 4. Email / Website Dispatch
    else {
      fallbackLink = recipientEmail
        ? `mailto:${recipientEmail}?subject=Re: Portfolio Inquiry&body=${encodeURIComponent(replyText)}`
        : undefined;
    }

    // Record the sent reply into message metadata & update status to REPLIED
    const current = await prisma.contactMessage.findUnique({ where: { id: messageId } });
    const existingMeta = (current?.metadata as any) || {};
    const existingReplies = Array.isArray(existingMeta.replies) ? existingMeta.replies : [];

    const newReplyEntry = {
      text: replyText.trim(),
      channel: cleanChannel,
      dispatchedViaApi,
      apiError: dispatchError,
      sentAt: new Date().toISOString(),
    };

    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: MessageStatus.REPLIED,
        metadata: {
          ...existingMeta,
          replies: [...existingReplies, newReplyEntry],
        },
      },
    });

    revalidatePath("/admin/contact");

    return {
      success: true,
      dispatchedViaApi,
      deepLink: fallbackLink,
      message: dispatchedViaApi
        ? `Message sent automatically via ${cleanChannel} API!`
        : `Reply recorded in CMS! ${dispatchError ? `(API Note: ${dispatchError})` : ""}`,
    };
  } catch (err: any) {
    console.error("sendOutgoingChannelMessage error:", err);
    return { success: false, dispatchedViaApi: false, error: err.message || "Failed to send message" };
  }
}
