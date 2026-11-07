import { getHeaderFooterConfig } from "@/actions/header-footer";
import { getAdminSession } from "@/lib/auth";
import { HeaderFooterManager } from "@/components/admin/header-footer-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Header & Footer Manager | Admin CMS",
  description: "Customize and control the public website Header (Navbar) and Footer sections, branding, navigation links, and social links.",
};

export default async function AdminHeaderFooterPage() {
  await getAdminSession();
  const config = await getHeaderFooterConfig();

  return <HeaderFooterManager initialConfig={config} />;
}
