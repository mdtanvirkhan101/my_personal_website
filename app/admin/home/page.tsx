import { getHomePageConfig } from "@/actions/home-page";
import { getAdminSession } from "@/lib/auth";
import { HomePageManager } from "@/components/admin/home-page-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home Page Manager | Admin CMS",
  description: "Customize and control the public home page content, banners, metrics counters, and section toggles.",
};

export default async function AdminHomePage() {
  await getAdminSession();
  const config = await getHomePageConfig();

  return <HomePageManager initialConfig={config} />;
}
