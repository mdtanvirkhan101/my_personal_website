"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { contactSchema, ContactInput } from "@/lib/validations/contact";
import { MessageStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getContactPageConfig } from "./contact-page";
import { dispatchPlatformEvent } from "@/lib/automation/events";
import { WorkflowTriggerType } from "@prisma/client";
import { checkRateLimit } from "@/lib/rate-limit";

export type ContactSubmitResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Public action: submit contact form
 */
export async function submitContactMessage(input: ContactInput): Promise<ContactSubmitResult> {
  try {
    // 1. Anti-spam rate limiting by email/identifier (max 4 per 2 minutes)
    const normalizedEmail = (input.email || "").toLowerCase().trim();
    const rateCheck = checkRateLimit(`contact:${normalizedEmail || "anon"}`, {
      limit: 4,
      windowMs: 2 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return {
        success: false,
        error: `Too many submissions. Please wait ${rateCheck.resetInSec} seconds before sending another message.`,
      };
    }

    const config = await getContactPageConfig();
    if (config.isFormActive === false) {
      return {
        success: false,
        error: config.formInactiveNotice || "Inquiries are temporarily paused.",
      };
    }

    const validated = contactSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Please correct the form fields.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, email, subject, message, phone, channel } = validated.data;

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        senderPhone: phone?.trim() || null,
        channel: channel?.trim() || "WEBSITE",
        subject: subject || null,
        message,
        status: MessageStatus.NEW,
      },
    });

    // Trigger Centralized AI & Automation workflows asynchronously
    dispatchPlatformEvent(WorkflowTriggerType.NEW_CONTACT_MESSAGE, "contact_form", {
      id: savedMessage.id,
      name: savedMessage.name,
      email: savedMessage.email,
      phone: savedMessage.senderPhone || "",
      subject: savedMessage.subject || "Website Inquiry",
      message: savedMessage.message,
      channel: savedMessage.channel,
    }).catch((err) => console.error("Workflow trigger error:", err));

    revalidatePath("/admin/contact");
    revalidatePath("/contact");
    return { success: true };
  } catch (err: any) {
    console.error("submitContactMessage error:", err);
    return { success: false, error: "Failed to send message. Please try again later." };
  }
}

/**
 * Admin action: update message status (NEW, READ, REPLIED, ARCHIVED)
 */
export async function updateMessageStatus(
  id: string,
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
) {
  try {
    await requireAdmin();

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: status as MessageStatus },
    });

    revalidatePath("/admin/contact");
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update status." };
  }
}

/**
 * Admin action: bulk update status for multiple messages
 */
export async function bulkUpdateMessageStatus(
  ids: string[],
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
) {
  try {
    await requireAdmin();

    if (!ids.length) return { success: true };

    await prisma.contactMessage.updateMany({
      where: { id: { in: ids } },
      data: { status: status as MessageStatus },
    });

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to bulk update messages." };
  }
}

/**
 * Admin action: delete contact message
 */
export async function deleteContactMessage(id: string) {
  try {
    await requireAdmin();

    await prisma.contactMessage.delete({ where: { id } });

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete message." };
  }
}

/**
 * Admin action: bulk delete multiple contact messages
 */
export async function bulkDeleteContactMessages(ids: string[]) {
  try {
    await requireAdmin();

    if (!ids.length) return { success: true };

    await prisma.contactMessage.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete messages." };
  }
}

/**
 * Admin action: create / log multi-channel message
 */
export async function createMultiChannelMessage(data: {
  name: string;
  email?: string;
  senderPhone?: string;
  channel: string;
  subject?: string;
  message: string;
  platformSenderId?: string;
}) {
  try {
    await requireAdmin();

    if (!data.name || !data.message) {
      return { success: false, error: "Sender name and message content are required." };
    }

    const created = await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email?.toLowerCase().trim() || "no-email@channel.local",
        senderPhone: data.senderPhone?.trim() || null,
        channel: data.channel || "WEBSITE",
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
        platformSenderId: data.platformSenderId?.trim() || null,
        status: MessageStatus.NEW,
      },
    });

    revalidatePath("/admin/contact");
    return { success: true, data: created };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create message." };
  }
}
