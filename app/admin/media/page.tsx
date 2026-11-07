import { getUploadedMediaFiles } from "@/actions/media";
import { getAdminSession } from "@/lib/auth";
import { MediaManager } from "@/components/admin/media-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Library | Admin CMS",
  description: "Universal Media & Image Assets Hub. Upload once, browse, preview, and reuse anywhere across the portfolio.",
};

export default async function AdminMediaPage() {
  await getAdminSession();
  const mediaList = await getUploadedMediaFiles();

  return <MediaManager initialMedia={mediaList} />;
}
