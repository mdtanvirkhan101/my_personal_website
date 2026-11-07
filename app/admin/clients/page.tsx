import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ClientsManager } from "@/components/admin/clients-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clients & Testimonials Console | Admin CMS",
  description: "Manage partner clients, corporate logos, and client reviews.",
};

export default async function AdminClientsPage() {
  await getAdminSession();

  const [clients, testimonials] = await Promise.all([
    prisma.client.findMany({
      include: { testimonials: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.testimonial.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <ClientsManager
      initialClients={clients as any}
      initialTestimonials={testimonials as any}
    />
  );
}
