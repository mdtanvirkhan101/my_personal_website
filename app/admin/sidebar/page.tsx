import { getAdminSidebarItems } from "@/actions/admin-sidebar";
import { getAdminSession } from "@/lib/auth";
import { SidebarManager } from "@/components/admin/sidebar-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sidebar Order & Layout Manager | Admin CMS",
  description: "Reorder, show, hide, and customize navigation items in the Admin Panel sidebar.",
};

export default async function AdminSidebarPage() {
  await getAdminSession();
  const items = await getAdminSidebarItems();

  return <SidebarManager initialItems={items} />;
}
