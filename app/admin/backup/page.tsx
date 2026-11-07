import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { BackupManager } from "@/components/admin/backup-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Backup & Restore Vault | Admin CMS",
  description: "Enterprise disaster recovery, JSON snapshots, cloud restore, and database integrity management.",
};

export default async function AdminBackupPage() {
  await getAdminSession();

  const [
    projects,
    caseStudies,
    skills,
    services,
    experiences,
    certifications,
    clients,
    testimonials,
    blogPosts,
    articles,
    notes,
    labs,
    contactMessages,
    mediaAssets,
    settings,
  ] = await Promise.all([
    prisma.project.count().catch(() => 0),
    prisma.caseStudy.count().catch(() => 0),
    prisma.skill.count().catch(() => 0),
    prisma.service.count().catch(() => 0),
    prisma.experience.count().catch(() => 0),
    prisma.certification.count().catch(() => 0),
    prisma.client.count().catch(() => 0),
    prisma.testimonial.count().catch(() => 0),
    prisma.blogPost.count().catch(() => 0),
    prisma.article.count().catch(() => 0),
    prisma.note.count().catch(() => 0),
    prisma.lab.count().catch(() => 0),
    prisma.contactMessage.count().catch(() => 0),
    prisma.mediaAsset.count().catch(() => 0),
    prisma.siteSetting.count().catch(() => 0),
  ]);

  return (
    <BackupManager
      stats={{
        projects,
        caseStudies,
        skills,
        services,
        experiences,
        certifications,
        clients,
        testimonials,
        blogPosts,
        articles,
        notes,
        labs,
        contactMessages,
        mediaAssets,
        settings,
      }}
    />
  );
}
