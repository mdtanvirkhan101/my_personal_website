"use server";

import { prisma } from "@/lib/prisma";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Project" | "Case Study" | "Blog" | "Service" | "Page";
  url: string;
}

export async function searchGlobalPortfolio(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const [projects, caseStudies, blogPosts, services] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { summary: { contains: trimmed, mode: "insensitive" } },
            { stack: { hasSome: [trimmed] } },
          ],
        },
        take: 5,
        select: { id: true, title: true, summary: true, slug: true },
      }),
      prisma.caseStudy.findMany({
        where: {
          OR: [
            { problem: { contains: trimmed, mode: "insensitive" } },
            { solution: { contains: trimmed, mode: "insensitive" } },
            { project: { title: { contains: trimmed, mode: "insensitive" } } },
          ],
        },
        include: { project: { select: { title: true, slug: true } } },
        take: 4,
      }),
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { excerpt: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, title: true, excerpt: true, slug: true },
      }),
      prisma.service.findMany({
        where: {
          active: true,
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { description: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        take: 3,
        select: { id: true, title: true, description: true },
      }),
    ]);

    const results: SearchResultItem[] = [];

    // Projects
    projects.forEach((p) => {
      results.push({
        id: `p-${p.id}`,
        title: p.title,
        subtitle: p.summary || "Featured Project",
        category: "Project",
        url: `/projects/${p.slug}`,
      });
    });

    // Case Studies
    caseStudies.forEach((c) => {
      if (c.project) {
        results.push({
          id: `cs-${c.id}`,
          title: c.project.title,
          subtitle: "Technical Architecture Case Study",
          category: "Case Study",
          url: `/case-studies/${c.project.slug}`,
        });
      }
    });

    // Blogs
    blogPosts.forEach((b) => {
      results.push({
        id: `b-${b.id}`,
        title: b.title,
        subtitle: b.excerpt || "Blog Article",
        category: "Blog",
        url: `/blog/${b.slug}`,
      });
    });

    // Services
    services.forEach((s) => {
      results.push({
        id: `s-${s.id}`,
        title: s.title,
        subtitle: s.description || "Offered Capability",
        category: "Service",
        url: `/services`,
      });
    });

    return results;
  } catch (error) {
    console.error("Global search error:", error);
    return [];
  }
}
