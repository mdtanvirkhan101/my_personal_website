import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mdtanvirkhan.com";
  const now = new Date();

  // Static standard public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/case-studies`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/experience`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/skills`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/certifications`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/clients`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/labs`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    // Dynamic projects
    const projects = await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    // Dynamic case studies
    const caseStudies = await prisma.caseStudy.findMany({
      include: {
        project: { select: { slug: true, updatedAt: true, status: true } },
      },
    });

    const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies
      .filter((c) => c.project && c.project.status === "PUBLISHED")
      .map((c) => ({
        url: `${baseUrl}/case-studies/${c.project.slug}`,
        lastModified: c.project.updatedAt,
        changeFrequency: "weekly",
        priority: 0.85,
      }));

    // Dynamic blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...projectRoutes, ...caseStudyRoutes, ...blogRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}

