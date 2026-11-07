import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { CertificationsManager } from "@/components/admin/certifications-manager";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  await getAdminSession();

  const [certifications, settingsRows] = await Promise.all([
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "certificationPageCategories",
            "certificationPageFeaturedIds",
            "certificationPageHeroBadge",
            "certificationPageHeroTitle",
            "certificationPageHeroDescription",
            "certificationPageExploreLabel",
            "certificationPageCategoriesLabel",
            "certificationPageSeoTitle",
            "certificationPageMetaDescription",
            "certificationPageShowHero",
            "certificationPageShowStats",
            "certificationPageShowFeatured",
            "certificationPageShowCategories",
            "certificationPageShowAllCerts",
            "certificationPageShowAchievements",
            "certificationPageShowLearning",
            "certificationPageAchievements",
            "certificationPageLearningItems",
          ],
        },
      },
    }),
  ]);

  const initialSettings = Object.fromEntries(
    settingsRows.map((row) => [row.key, row.value])
  ) as Record<string, any>;

  const storedCategories = initialSettings.certificationPageCategories;
  const initialCategories = Array.isArray(storedCategories)
    ? storedCategories
    : Array.from(new Set(certifications.map((cert) => cert.category).filter(Boolean)))
      .map((name, index) => ({ id: `category-${index}`, name: String(name) }));

  return (
    <CertificationsManager
      initialCertifications={certifications}
      initialCategories={initialCategories}
      initialSettings={initialSettings}
    />
  );
}
