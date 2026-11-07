import { prisma } from "@/lib/prisma";
import { ArticlesCMSManager } from "@/components/admin/articles-cms-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin CMS | Articles & Engineering Notes",
};

export default async function AdminBlogCMSPage() {
  const [siteSetting, articles, notes, articleCategories, noteCategories] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "articles_page_settings" } }),
    prisma.article.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.note.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.articleCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.noteCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="min-h-full bg-[#0e0e34]">
      <ArticlesCMSManager
        initialSettings={siteSetting?.value}
        initialArticles={articles}
        initialNotes={notes}
        initialArticleCategories={articleCategories.map((item) => ({ ...item, description: item.description || "", icon: item.icon || "Network", link: item.link || "", seoTitle: item.seoTitle || "", seoDescription: item.seoDescription || "" }))}
        initialNoteCategories={noteCategories.map((item) => ({ ...item, description: item.description || "", icon: item.icon || "FileText", link: item.link || "", seoTitle: item.seoTitle || "", seoDescription: item.seoDescription || "" }))}
      />
    </div>
  );
}
