import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ProfileManager } from "@/components/admin/profile-manager";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  await getAdminSession();

  const profile =
    (await prisma.profile.findFirst({
      where: { id: "default-owner-profile" },
    })) || (await prisma.profile.findFirst());

  return <ProfileManager initialProfile={profile} />;
}
