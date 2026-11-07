import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { configureScriptEnvironment, DatabaseTargetInfo } from "./env-config";

let globalPrisma: PrismaClient | null = null;

export interface BackupOptions {
  outputDir?: string;
  allowProductionExport?: boolean;
  staging?: boolean;
  targetPrisma?: PrismaClient;
}

export async function createDatabaseBackup(options: BackupOptions = {}) {
  const { targetInfo, loadedFrom } = configureScriptEnvironment();
  const outputDir = options.outputDir || path.join(process.cwd(), "scripts", "backups");

  console.log("📦 Starting schema-verified database backup...");
  console.log(`   Source Env File       : ${loadedFrom}`);
  console.log(`   Target Host           : ${targetInfo.hostname}:${targetInfo.port}/${targetInfo.database}`);
  console.log(`   Target Classification : ${targetInfo.classification}`);

  // Safety Check: Require explicit approval flag for production data export
  const allowProd =
    options.allowProductionExport ||
    process.argv.includes("--allow-production-export") ||
    process.env.ALLOW_PRODUCTION_EXPORT === "true";

  if (targetInfo.isProduction && !allowProd) {
    throw new Error(
      `🚨 SAFETY BLOCKED: Exporting production database records to local files requires explicit operator approval.\n` +
      `   Pass '--allow-production-export' if you explicitly intend to export production records.`
    );
  }

  const prisma = options.targetPrisma || new PrismaClient();
  globalPrisma = prisma;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const [
    adminUsers,
    profiles,
    projects,
    skills,
    services,
    experiences,
    certifications,
    clients,
    testimonials,
    blogPosts,
    articleCategories,
    articles,
    noteCategories,
    notes,
    labs,
    contactMessages,
    mediaAssets,
    pageContents,
    siteSettings,
  ] = await Promise.all([
    prisma.adminUser.findMany({
      select: { id: true, name: true, email: true, passwordHash: true, role: true, active: true, createdAt: true, updatedAt: true },
    }),
    prisma.profile.findMany(),
    prisma.project.findMany({ include: { caseStudy: true } }),
    prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.client.findMany({ include: { testimonials: true } }),
    prisma.testimonial.findMany(),
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.articleCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.noteCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.note.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lab.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.pageContent.findMany(),
    prisma.siteSetting.findMany(),
  ]);

  let caseStudyCategories: any[] = [];
  try {
    caseStudyCategories = await (prisma as any).caseStudyCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    console.log("ℹ️ Note: case_study_categories table not found in database; recorded as empty.");
    caseStudyCategories = [];
  }

  const counts: Record<string, number> = {
    adminUsers: adminUsers.length,
    profiles: profiles.length,
    projects: projects.length,
    caseStudyCategories: caseStudyCategories.length,
    skills: skills.length,
    services: services.length,
    experiences: experiences.length,
    certifications: certifications.length,
    clients: clients.length,
    testimonials: testimonials.length,
    blogPosts: blogPosts.length,
    articleCategories: articleCategories.length,
    articles: articles.length,
    noteCategories: noteCategories.length,
    notes: notes.length,
    labs: labs.length,
    contactMessages: contactMessages.length,
    mediaAssets: mediaAssets.length,
    pageContents: pageContents.length,
    siteSettings: siteSettings.length,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.json`;
  const filePath = path.join(outputDir, filename);

  const payload = {
    version: "2.0",
    exportDate: new Date().toISOString(),
    source: "Portfolio CLI Snapshot",
    targetClassification: targetInfo.classification,
    counts,
    data: {
      adminUsers,
      profiles,
      projects,
      caseStudyCategories,
      skills,
      services,
      experiences,
      certifications,
      clients,
      testimonials,
      blogPosts,
      articleCategories,
      articles,
      noteCategories,
      notes,
      labs,
      contactMessages,
      mediaAssets,
      pageContents,
      siteSettings,
    },
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`✅ Backup successfully saved to: ${filename}`);
  console.log(`📊 Total records captured across ${Object.keys(counts).length} models: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);

  return { filePath, counts };
}

// Only execute directly when run as CLI script
if (require.main === module || process.argv[1]?.includes("backup-database.ts")) {
  createDatabaseBackup()
    .catch((err) => {
      console.error("❌ Backup halted:", err.message);
      process.exit(1);
    })
    .finally(async () => {
      if (globalPrisma) {
        await globalPrisma.$disconnect();
      }
    });
}
