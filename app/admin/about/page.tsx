import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { AboutManager } from "@/components/admin/about-manager";
import { getAboutPageConfig } from "@/actions/about-page";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Page & Profile Console | Admin CMS",
  description: "Complete control over about page biography, mission pillars, live metrics, and visual toggles.",
};

export default async function AdminAboutPage() {
  await getAdminSession();

  const [profile, config, skillsCount, certsCount] = await Promise.all([
    (await prisma.profile.findFirst({
      where: { id: "default-owner-profile" },
    })) || (await prisma.profile.findFirst()),
    getAboutPageConfig(),
    prisma.skill.count({ where: { level: { not: 0 } } }),
    prisma.certification.count(),
  ]);

  return (
    <AboutManager
      initialProfile={profile}
      initialConfig={config}
      skillsCount={skillsCount}
      certsCount={certsCount}
    />
  );
}
