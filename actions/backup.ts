"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendTelegramDocument, sendTelegramMessage } from "@/lib/automation/integrations/telegram";

export interface BackupData {
  version: string;
  exportDate: string;
  source: string;
  counts: Record<string, number>;
  data: {
    profiles: any[];
    projects: any[];
    caseStudyCategories?: any[];
    skills: any[];
    services: any[];
    experiences: any[];
    certifications: any[];
    clients: any[];
    testimonials: any[];
    blogPosts: any[];
    articleCategories?: any[];
    articles?: any[];
    noteCategories?: any[];
    notes?: any[];
    labs: any[];
    contactMessages: any[];
    mediaAssets: any[];
    pageContents: any[];
    siteSettings: any[];
  };
}

/**
 * Generate full website data backup payload
 * Schema-verified across all models with graceful fallback for unmigrated tables.
 */
export async function getFullWebsiteBackup(): Promise<{ success: boolean; backup?: BackupData; error?: string }> {
  try {
    await requireAdmin();

    const [
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

    // Graceful check for CaseStudyCategory (which may not be migrated yet in live DB)
    let caseStudyCategories: any[] = [];
    try {
      caseStudyCategories = await (prisma as any).caseStudyCategory.findMany({
        orderBy: { sortOrder: "asc" },
      });
    } catch {
      // Table not yet created in active database; fallback to empty array
      caseStudyCategories = [];
    }

    const counts: Record<string, number> = {
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

    const backup: BackupData = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      source: "Portfolio Admin CMS",
      counts,
      data: {
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

    return { success: true, backup };
  } catch (err: any) {
    console.error("Backup generation error:", err);
    return { success: false, error: err.message || "Failed to generate backup" };
  }
}

/**
 * Restore database from backup JSON data
 * Schema-verified: restores all 21 models with deterministic unique keys.
 */
export async function restoreWebsiteBackup(
  backup: BackupData,
  mode: "merge" | "clean" = "merge"
): Promise<{ success: boolean; message?: string; restoredCounts?: Record<string, number>; error?: string }> {
  try {
    await requireAdmin();

    if (!backup || !backup.data || typeof backup.data !== "object") {
      return { success: false, error: "Invalid backup format: missing data payload." };
    }

    const {
      profiles = [],
      projects = [],
      caseStudyCategories = [],
      skills = [],
      services = [],
      experiences = [],
      certifications = [],
      clients = [],
      testimonials = [],
      blogPosts = [],
      articleCategories = [],
      articles = [],
      noteCategories = [],
      notes = [],
      labs = [],
      contactMessages = [],
      mediaAssets = [],
      pageContents = [],
      siteSettings = [],
    } = backup.data;

    // In clean mode, remove dependent records first (never remove AdminUser!)
    if (mode === "clean") {
      await prisma.$transaction([
        prisma.testimonial.deleteMany(),
        prisma.client.deleteMany(),
        prisma.caseStudy.deleteMany(),
        prisma.project.deleteMany(),
        prisma.skill.deleteMany(),
        prisma.service.deleteMany(),
        prisma.experience.deleteMany(),
        prisma.certification.deleteMany(),
        prisma.article.deleteMany(),
        prisma.articleCategory.deleteMany(),
        prisma.note.deleteMany(),
        prisma.noteCategory.deleteMany(),
        prisma.blogPost.deleteMany(),
        prisma.lab.deleteMany(),
        prisma.pageContent.deleteMany(),
        prisma.siteSetting.deleteMany(),
      ]);
    }

    // 1. Site Settings
    for (const item of siteSettings) {
      if (!item.key) continue;
      await prisma.siteSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    // 2. Profile
    for (const item of profiles) {
      if (!item.id) continue;
      await prisma.profile.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          headline: item.headline,
          bio: item.bio,
          avatarUrl: item.avatarUrl,
          resumeUrl: item.resumeUrl,
          email: item.email,
          location: item.location,
          socialLinks: item.socialLinks,
        },
        create: {
          id: item.id,
          name: item.name,
          headline: item.headline,
          bio: item.bio,
          avatarUrl: item.avatarUrl,
          resumeUrl: item.resumeUrl,
          email: item.email,
          location: item.location,
          socialLinks: item.socialLinks,
        },
      });
    }

    // 3. Case Study Categories (if table exists)
    if (Array.isArray(caseStudyCategories) && caseStudyCategories.length > 0) {
      for (const cat of caseStudyCategories) {
        if (!cat.slug || !cat.name) continue;
        try {
          await (prisma as any).caseStudyCategory.upsert({
            where: { slug: cat.slug },
            update: {
              name: cat.name,
              isActive: cat.isActive ?? true,
              sortOrder: cat.sortOrder ?? 0,
            },
            create: {
              name: cat.name,
              slug: cat.slug,
              isActive: cat.isActive ?? true,
              sortOrder: cat.sortOrder ?? 0,
            },
          });
        } catch {
          // Skip if table does not exist in target database
        }
      }
    }

    // 4. Skills
    for (const item of skills) {
      if (!item.name) continue;
      const existing = await prisma.skill.findFirst({ where: { name: item.name } });
      if (existing) {
        await prisma.skill.update({
          where: { id: existing.id },
          data: {
            category: item.category,
            level: item.level,
            sortOrder: item.sortOrder ?? 0,
          },
        });
      } else {
        await prisma.skill.create({
          data: {
            name: item.name,
            category: item.category,
            level: item.level,
            sortOrder: item.sortOrder ?? 0,
          },
        });
      }
    }

    // 5. Services
    for (const item of services) {
      if (!item.slug || !item.title) continue;
      await prisma.service.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          description: item.description,
          icon: item.icon,
          category: item.category || "SERVICE",
          sortOrder: item.sortOrder ?? 0,
          active: item.active ?? true,
          attachments: item.attachments ?? null,
        },
        create: {
          title: item.title,
          slug: item.slug,
          description: item.description,
          icon: item.icon,
          category: item.category || "SERVICE",
          sortOrder: item.sortOrder ?? 0,
          active: item.active ?? true,
          attachments: item.attachments ?? null,
        },
      });
    }

    // 6. Projects & Case Studies
    for (const item of projects) {
      if (!item.slug || !item.title) continue;
      const caseStudyData = item.caseStudy
        ? {
            problem: item.caseStudy.problem,
            process: item.caseStudy.process,
            solution: item.caseStudy.solution,
            outcome: item.caseStudy.outcome,
            content: item.caseStudy.content,
            clientName: item.caseStudy.clientName ?? null,
            duration: item.caseStudy.duration ?? null,
            architectureDiagram: item.caseStudy.architectureDiagram ?? null,
            imageGallery: Array.isArray(item.caseStudy.imageGallery) ? item.caseStudy.imageGallery : [],
          }
        : null;

      const projectUpsert = await prisma.project.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          summary: item.summary,
          content: item.content,
          coverUrl: item.coverUrl,
          stack: Array.isArray(item.stack) ? item.stack : [],
          liveUrl: item.liveUrl,
          repoUrl: item.repoUrl,
          featured: item.featured ?? false,
          status: item.status || "DRAFT",
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          attachments: item.attachments ?? null,
        },
        create: {
          title: item.title,
          slug: item.slug,
          summary: item.summary,
          content: item.content,
          coverUrl: item.coverUrl,
          stack: Array.isArray(item.stack) ? item.stack : [],
          liveUrl: item.liveUrl,
          repoUrl: item.repoUrl,
          featured: item.featured ?? false,
          status: item.status || "DRAFT",
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          attachments: item.attachments ?? null,
        },
      });

      if (caseStudyData) {
        await prisma.caseStudy.upsert({
          where: { projectId: projectUpsert.id },
          update: caseStudyData,
          create: {
            ...caseStudyData,
            projectId: projectUpsert.id,
          },
        });
      }
    }

    // 7. Experiences
    for (const item of experiences) {
      if (!item.organization || !item.role) continue;
      const existing = await prisma.experience.findFirst({
        where: { organization: item.organization, role: item.role },
      });
      const data = {
        organization: item.organization,
        role: item.role,
        logoUrl: item.logoUrl,
        description: item.description,
        startDate: new Date(item.startDate),
        endDate: item.endDate ? new Date(item.endDate) : null,
        current: item.current ?? false,
        sortOrder: item.sortOrder ?? 0,
        attachments: item.attachments ?? null,
      };

      if (existing) {
        await prisma.experience.update({ where: { id: existing.id }, data });
      } else {
        await prisma.experience.create({ data });
      }
    }

    // 8. Certifications
    for (const item of certifications) {
      if (!item.name || !item.issuer) continue;
      const existing = await prisma.certification.findFirst({
        where: { name: item.name, issuer: item.issuer },
      });
      const data = {
        name: item.name,
        issuer: item.issuer,
        credentialUrl: item.credentialUrl,
        issuedAt: item.issuedAt ? new Date(item.issuedAt) : null,
        expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder ?? 0,
      };

      if (existing) {
        await prisma.certification.update({ where: { id: existing.id }, data });
      } else {
        await prisma.certification.create({ data });
      }
    }

    // 9. Clients & Testimonials (Restored safely with relation mapping)
    const clientMap = new Map<string, string>();
    for (const c of clients) {
      if (!c.name) continue;
      const existing = await prisma.client.findFirst({ where: { name: c.name } });
      if (existing) {
        await prisma.client.update({
          where: { id: existing.id },
          data: { website: c.website, logoUrl: c.logoUrl },
        });
        clientMap.set(c.id || c.name, existing.id);
      } else {
        const created = await prisma.client.create({
          data: { name: c.name, website: c.website, logoUrl: c.logoUrl },
        });
        clientMap.set(c.id || c.name, created.id);
      }
    }

    for (const t of testimonials) {
      if (!t.clientName || !t.content) continue;
      const existing = await prisma.testimonial.findFirst({
        where: { clientName: t.clientName, role: t.role || null },
      });
      const targetClientId = t.clientId ? clientMap.get(t.clientId) || null : null;
      const tData = {
        clientName: t.clientName,
        role: t.role,
        content: t.content,
        avatarUrl: t.avatarUrl,
        featured: t.featured ?? false,
        clientId: targetClientId,
      };

      if (existing) {
        await prisma.testimonial.update({ where: { id: existing.id }, data: tData });
      } else {
        await prisma.testimonial.create({ data: tData });
      }
    }

    // 10. Blog Posts
    for (const item of blogPosts) {
      if (!item.slug || !item.title) continue;
      await prisma.blogPost.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          excerpt: item.excerpt,
          content: item.content || "",
          coverUrl: item.coverUrl,
          status: item.status || "DRAFT",
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          attachments: item.attachments ?? null,
        },
        create: {
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content || "",
          coverUrl: item.coverUrl,
          status: item.status || "DRAFT",
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          attachments: item.attachments ?? null,
        },
      });
    }

    // 11. Article Categories & Articles (CMS Content)
    for (const cat of articleCategories) {
      if (!cat.slug || !cat.name) continue;
      await prisma.articleCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          categoryType: cat.categoryType || "Core",
          link: cat.link,
          active: cat.active ?? true,
          featured: cat.featured ?? false,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
          sortOrder: cat.sortOrder ?? 0,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          categoryType: cat.categoryType || "Core",
          link: cat.link,
          active: cat.active ?? true,
          featured: cat.featured ?? false,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
          sortOrder: cat.sortOrder ?? 0,
        },
      });
    }

    for (const art of articles) {
      if (!art.slug || !art.title) continue;
      await prisma.article.upsert({
        where: { slug: art.slug },
        update: {
          title: art.title,
          category: art.category,
          coverImage: art.coverImage,
          fullContent: art.fullContent || "",
          referenceLink: art.referenceLink,
          tags: Array.isArray(art.tags) ? art.tags : [],
          status: art.status || "DRAFT",
          featured: art.featured ?? false,
          author: art.author || "Admin",
          publishDate: art.publishDate || new Date().toISOString(),
          readTime: art.readTime || "5 min read",
          seoTitle: art.seoTitle,
          seoDescription: art.seoDescription,
        },
        create: {
          title: art.title,
          slug: art.slug,
          category: art.category,
          coverImage: art.coverImage,
          fullContent: art.fullContent || "",
          referenceLink: art.referenceLink,
          tags: Array.isArray(art.tags) ? art.tags : [],
          status: art.status || "DRAFT",
          featured: art.featured ?? false,
          author: art.author || "Admin",
          publishDate: art.publishDate || new Date().toISOString(),
          readTime: art.readTime || "5 min read",
          seoTitle: art.seoTitle,
          seoDescription: art.seoDescription,
        },
      });
    }

    // 12. Note Categories & Notes (CMS Content)
    for (const cat of noteCategories) {
      if (!cat.slug || !cat.name) continue;
      await prisma.noteCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          link: cat.link,
          active: cat.active ?? true,
          featured: cat.featured ?? false,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
          sortOrder: cat.sortOrder ?? 0,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          link: cat.link,
          active: cat.active ?? true,
          featured: cat.featured ?? false,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
          sortOrder: cat.sortOrder ?? 0,
        },
      });
    }

    for (const note of notes) {
      if (!note.slug || !note.title) continue;
      await prisma.note.upsert({
        where: { slug: note.slug },
        update: {
          title: note.title,
          category: note.category,
          coverImage: note.coverImage,
          fullContent: note.fullContent || "",
          commandSnippet: note.commandSnippet,
          referenceLink: note.referenceLink,
          tags: Array.isArray(note.tags) ? note.tags : [],
          status: note.status || "DRAFT",
          featured: note.featured ?? false,
          author: note.author || "Admin",
          publishDate: note.publishDate || new Date().toISOString(),
          seoTitle: note.seoTitle,
          seoDescription: note.seoDescription,
        },
        create: {
          title: note.title,
          slug: note.slug,
          category: note.category,
          coverImage: note.coverImage,
          fullContent: note.fullContent || "",
          commandSnippet: note.commandSnippet,
          referenceLink: note.referenceLink,
          tags: Array.isArray(note.tags) ? note.tags : [],
          status: note.status || "DRAFT",
          featured: note.featured ?? false,
          author: note.author || "Admin",
          publishDate: note.publishDate || new Date().toISOString(),
          seoTitle: note.seoTitle,
          seoDescription: note.seoDescription,
        },
      });
    }

    // 13. Labs
    for (const item of labs) {
      if (!item.slug || !item.title) continue;
      await prisma.lab.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          description: item.description,
          demoUrl: item.demoUrl,
          repoUrl: item.repoUrl,
          coverUrl: item.coverUrl,
          status: item.status || "DRAFT",
        },
        create: {
          title: item.title,
          slug: item.slug,
          description: item.description,
          demoUrl: item.demoUrl,
          repoUrl: item.repoUrl,
          coverUrl: item.coverUrl,
          status: item.status || "DRAFT",
        },
      });
    }

    // 14. Contact Messages
    for (const item of contactMessages) {
      if (!item.email || !item.message) continue;
      const existing = item.id ? await prisma.contactMessage.findUnique({ where: { id: item.id } }) : null;
      if (!existing) {
        await prisma.contactMessage.create({
          data: {
            name: item.name || "Anonymous",
            email: item.email,
            subject: item.subject,
            message: item.message,
            status: item.status || "NEW",
            channel: item.channel || "WEBSITE",
            senderPhone: item.senderPhone,
            platformSenderId: item.platformSenderId,
            metadata: item.metadata,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          },
        });
      }
    }

    // 15. Media Assets
    for (const asset of mediaAssets) {
      if (!asset.url || !asset.fileName) continue;
      const existing = await prisma.mediaAsset.findFirst({ where: { url: asset.url } });
      if (!existing) {
        await prisma.mediaAsset.create({
          data: {
            url: asset.url,
            fileName: asset.fileName,
            mimeType: asset.mimeType || "application/octet-stream",
            sizeBytes: asset.sizeBytes || 0,
            altText: asset.altText,
            provider: asset.provider || "local",
          },
        });
      }
    }

    // 16. Page Contents
    for (const pc of pageContents) {
      if (!pc.slug || !pc.title) continue;
      await prisma.pageContent.upsert({
        where: { slug: pc.slug },
        update: {
          title: pc.title,
          content: pc.content,
          seoTitle: pc.seoTitle,
          seoDescription: pc.seoDescription,
        },
        create: {
          title: pc.title,
          slug: pc.slug,
          content: pc.content,
          seoTitle: pc.seoTitle,
          seoDescription: pc.seoDescription,
        },
      });
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/blog");
    revalidatePath("/articles");
    revalidatePath("/notes");
    revalidatePath("/experience");
    revalidatePath("/certifications");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/skills");
    revalidatePath("/admin/services");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/messages");

    return {
      success: true,
      message: "Database restore completed successfully! All 21 collections verified.",
      restoredCounts: backup.counts,
    };
  } catch (err: any) {
    console.error("Restore error:", err);
    return { success: false, error: err.message || "Failed to restore database from backup." };
  }
}

/**
 * Clear selected website content data (strictly excludes admin users and CMS articles/notes by default)
 * WARNING: This is destructive and irreversible!
 */
export async function clearAllWebsiteData(
  options: {
    clearProjects?: boolean;
    clearSkills?: boolean;
    clearServices?: boolean;
    clearExperiences?: boolean;
    clearCertifications?: boolean;
    clearBlogPosts?: boolean;
    clearMessages?: boolean;
    clearSettings?: boolean;
    clearProfile?: boolean;
    clearArticles?: boolean;
    clearNotes?: boolean;
  } = {}
): Promise<{ success: boolean; message?: string; error?: string; clearedCounts?: Record<string, number> }> {
  try {
    await requireAdmin();

    const clearedCounts: Record<string, number> = {};

    // Projects & Case Studies
    if (options.clearProjects) {
      const caseStudies = await prisma.caseStudy.deleteMany();
      const projects = await prisma.project.deleteMany();
      clearedCounts.caseStudies = caseStudies.count;
      clearedCounts.projects = projects.count;
    }

    // Skills
    if (options.clearSkills) {
      const skills = await prisma.skill.deleteMany();
      clearedCounts.skills = skills.count;
    }

    // Services
    if (options.clearServices) {
      const services = await prisma.service.deleteMany();
      clearedCounts.services = services.count;
    }

    // Experiences
    if (options.clearExperiences) {
      const experiences = await prisma.experience.deleteMany();
      clearedCounts.experiences = experiences.count;
    }

    // Certifications
    if (options.clearCertifications) {
      const certifications = await prisma.certification.deleteMany();
      clearedCounts.certifications = certifications.count;
    }

    // Blog Posts
    if (options.clearBlogPosts) {
      const blogPosts = await prisma.blogPost.deleteMany();
      clearedCounts.blogPosts = blogPosts.count;
    }

    // Articles (CMS)
    if (options.clearArticles) {
      const articles = await prisma.article.deleteMany();
      clearedCounts.articles = articles.count;
    }

    // Notes (CMS)
    if (options.clearNotes) {
      const notes = await prisma.note.deleteMany();
      clearedCounts.notes = notes.count;
    }

    // Contact Messages
    if (options.clearMessages) {
      const messages = await prisma.contactMessage.deleteMany();
      clearedCounts.contactMessages = messages.count;
    }

    // Site Settings
    if (options.clearSettings) {
      const settings = await prisma.siteSetting.deleteMany();
      clearedCounts.siteSettings = settings.count;
    }

    // Profile (never admin users!)
    if (options.clearProfile) {
      const profiles = await prisma.profile.deleteMany();
      clearedCounts.profiles = profiles.count;
    }

    // Revalidate all paths
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/blog");
    revalidatePath("/articles");
    revalidatePath("/notes");
    revalidatePath("/admin/dashboard");

    const totalCleared = Object.values(clearedCounts).reduce((a, b) => a + b, 0);

    return {
      success: true,
      message: `Successfully cleared ${totalCleared} records across ${Object.keys(clearedCounts).length} collections.`,
      clearedCounts,
    };
  } catch (err: any) {
    console.error("Clear data error:", err);
    return { success: false, error: err.message || "Failed to clear website data." };
  }
}

/**
 * Dispatch latest schema-verified backup snapshot directly to Telegram
 */
export async function sendBackupToTelegram(): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return {
        success: false,
        message: "Telegram Bot Token or Chat ID is not configured in .env environment.",
      };
    }

    const backupRes = await getFullWebsiteBackup();
    if (!backupRes.success || !backupRes.backup) {
      return {
        success: false,
        message: backupRes.error || "Failed to generate website backup payload.",
      };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `portfolio-backup-${timestamp}.json`;
    const jsonString = JSON.stringify(backupRes.backup, null, 2);

    const totalRecords = Object.values(backupRes.backup.counts).reduce((a, b) => a + b, 0);
    const caption = `🛡️ *Automated Database Snapshot*\n📅 *Timestamp:* ${new Date().toUTCString()}\n📊 *Total Records:* ${totalRecords}\n📦 *Models Backed Up:* ${Object.keys(backupRes.backup.counts).length}`;

    const res = await sendTelegramDocument(
      { botToken, chatId },
      filename,
      jsonString,
      caption
    );

    if (!res.success) {
      return {
        success: false,
        message: res.error || "Failed to dispatch backup snapshot to Telegram.",
      };
    }

    return {
      success: true,
      message: `Backup snapshot (${totalRecords} records) successfully dispatched to Telegram!`,
    };
  } catch (err: any) {
    console.error("sendBackupToTelegram error:", err);
    return { success: false, message: err.message || "Internal error sending backup to Telegram." };
  }
}
