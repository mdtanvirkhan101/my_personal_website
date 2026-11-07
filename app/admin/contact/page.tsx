import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { MessagesManager } from "@/components/admin/messages-manager";
import { getContactPageConfig } from "@/actions/contact-page";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Inquiries Console | Admin CMS",
  description: "View and manage incoming client consultation inquiries, messages, and contact page settings.",
};

export default async function AdminContactPage() {
  await getAdminSession();

  const [messages, contactConfig] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
    getContactPageConfig(),
  ]);

  return (
    <MessagesManager
      initialMessages={messages as any}
      initialConfig={contactConfig}
    />
  );
}
