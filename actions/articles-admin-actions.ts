"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { PublishStatus } from "@prisma/client";

type ContentType = "ARTICLE" | "NOTE";
type CategoryType = ContentType;

const CONTENT_PATHS = [
  "/", "/blog", "/blog/articles", "/blog/notes", "/admin/blog",
];

function revalidateContent(type?: ContentType) {
  for (const path of CONTENT_PATHS) revalidatePath(path);
  if (!type || type === "ARTICLE") revalidatePath("/blog/articles");
  if (!type || type === "NOTE") revalidatePath("/blog/notes");
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function slugify(value: string) {
  return value.toLowerCase().trim()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function safeStatus(value: unknown): PublishStatus {
  const status = String(value ?? "DRAFT").toUpperCase();
  return status === "PUBLISHED" || status === "ARCHIVED" ? status : "DRAFT";
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string")
    .map((item) => item.trim()).filter(Boolean).slice(0, 100);
}

function revalidateCategory(type: CategoryType) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(type === "ARTICLE" ? "/blog/articles" : "/blog/notes");
}

export async function savePageSettingsAction(formData: FormData) {
  try {
    await requireAdmin();
    const settingsData = {
      pageLabel: cleanText(formData.get("pageLabel")),
      mainTitle: cleanText(formData.get("mainTitle")),
      subtitle: cleanText(formData.get("subtitle")),
      showHero: formData.get("showHero") === "true",
      articlesTitle: cleanText(formData.get("articlesTitle")),
      articlesDesc: cleanText(formData.get("articlesDesc")),
      notesTitle: cleanText(formData.get("notesTitle")),
      notesDesc: cleanText(formData.get("notesDesc")),
    };
    await prisma.siteSetting.upsert({
      where: { key: "articles_page_settings" },
      update: { value: settingsData },
      create: { key: "articles_page_settings", value: settingsData },
    });
    revalidateContent();
    return { success: true };
  } catch (error) {
    console.error("Failed to save page settings:", error);
    return { success: false, error: "Unable to save page settings. Check your admin session and database connection." };
  }
}

export async function getPageSettingsAction() {
  try {
    await requireAdmin();
    const setting = await prisma.siteSetting.findUnique({ where: { key: "articles_page_settings" } });
    return setting?.value ?? null;
  } catch (error) {
    console.error("Failed to fetch page settings:", error);
    return null;
  }
}

async function saveContent(type: ContentType, data: any) {
  await requireAdmin();
  if (!data || typeof data !== "object") return { success: false, error: "Invalid content payload." };
  const title = cleanText(data.title);
  if (!title) return { success: false, error: "Title is required." };
  const slug = slugify(cleanText(data.slug) || title);
  if (!slug) return { success: false, error: "A valid title or slug is required." };
  const category = cleanText(data.category);
  if (!category) return { success: false, error: "Category is required." };

  const common = {
    title,
    slug,
    category,
    coverImage: cleanText(data.coverImage) || null,
    fullContent: cleanText(data.fullContent),
    referenceLink: cleanText(data.referenceLink) || null,
    tags: stringArray(data.tags),
    status: safeStatus(data.status),
    featured: data.featured === true || data.featured === "true",
    author: cleanText(data.author, "Admin") || "Admin",
    publishDate: /^\d{4}-\d{2}-\d{2}$/.test(cleanText(data.publishDate))
      ? cleanText(data.publishDate) : new Date().toISOString().slice(0, 10),
    seoTitle: cleanText(data.seoTitle) || null,
    seoDescription: cleanText(data.seoDescription || data.description) || null,
  };

  if (type === "ARTICLE") {
    const payload = { ...common, readTime: `${Math.max(1, Math.min(240, Number.parseInt(String(data.readingTime ?? data.readTime ?? 5), 10) || 5))} min read` };
    if (typeof data.id === "string" && data.id.length >= 20) {
      const existing = await prisma.article.findUnique({ where: { id: data.id }, select: { id: true } });
      if (existing) await prisma.article.update({ where: { id: data.id }, data: payload });
      else await prisma.article.create({ data: payload });
    } else {
      await prisma.article.upsert({ where: { slug }, update: payload, create: payload });
    }
  } else {
    const payload = { ...common, commandSnippet: cleanText(data.commandSnippet) || null };
    if (typeof data.id === "string" && data.id.length >= 20) {
      const existing = await prisma.note.findUnique({ where: { id: data.id }, select: { id: true } });
      if (existing) await prisma.note.update({ where: { id: data.id }, data: payload });
      else await prisma.note.create({ data: payload });
    } else {
      await prisma.note.upsert({ where: { slug }, update: payload, create: payload });
    }
  }
  revalidateContent(type);
  return { success: true };
}

export async function saveArticleAction(data: any) {
  try { return await saveContent("ARTICLE", data); }
  catch (error: any) {
    console.error("Error saving article:", error);
    if (error?.code === "P2002") return { success: false, error: "An article with this slug already exists." };
    return { success: false, error: "Failed to save article. Please check the fields and database connection." };
  }
}

export async function saveNoteAction(data: any) {
  try { return await saveContent("NOTE", data); }
  catch (error: any) {
    console.error("Error saving note:", error);
    if (error?.code === "P2002") return { success: false, error: "A note with this slug already exists." };
    return { success: false, error: "Failed to save note. Please check the fields and database connection." };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    await requireAdmin();
    if (!id || id.length < 10) return { success: false, error: "Invalid article ID." };
    await prisma.article.delete({ where: { id } });
    revalidateContent("ARTICLE");
    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: "Failed to delete article." };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    await requireAdmin();
    if (!id || id.length < 10) return { success: false, error: "Invalid note ID." };
    await prisma.note.delete({ where: { id } });
    revalidateContent("NOTE");
    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    return { success: false, error: "Failed to delete note." };
  }
}

export async function saveContentCategoryAction(type: CategoryType, data: any) {
  try {
    await requireAdmin();
    if (type !== "ARTICLE" && type !== "NOTE") return { success: false, error: "Invalid category type." };
    const name = cleanText(data?.name);
    const slug = slugify(cleanText(data?.slug) || name);
    if (!name || !slug) return { success: false, error: "Category name is required." };
    const payload = {
      name, slug,
      description: cleanText(data.description) || null,
      icon: cleanText(data.icon) || null,
      link: cleanText(data.link) || null,
      active: data.active !== false,
      featured: data.featured === true,
      seoTitle: cleanText(data.seoTitle) || null,
      seoDescription: cleanText(data.seoDescription) || null,
      sortOrder: Math.max(0, Number.parseInt(String(data.sortOrder ?? 0), 10) || 0),
      ...(type === "ARTICLE" ? { categoryType: cleanText(data.categoryType, "Core") || "Core" } : {}),
    };
    const model: any = type === "ARTICLE" ? prisma.articleCategory : prisma.noteCategory;
    const id = cleanText(data.id);
    let savedCategory: any;
    if (id) {
      const existing = await model.findUnique({ where: { id }, select: { id: true } });
      if (existing) {
        const previous = await model.findUnique({ where: { id }, select: { name: true } });
        if (previous && previous.name !== name) {
          if (type === "ARTICLE") {
            savedCategory = await prisma.$transaction(async (tx) => {
              await tx.article.updateMany({ where: { category: previous.name }, data: { category: name } });
              return tx.articleCategory.update({ where: { id }, data: payload });
            });
          } else {
            savedCategory = await prisma.$transaction(async (tx) => {
              await tx.note.updateMany({ where: { category: previous.name }, data: { category: name } });
              return tx.noteCategory.update({ where: { id }, data: payload });
            });
          }
        } else {
          savedCategory = await model.update({ where: { id }, data: payload });
        }
      } else savedCategory = await model.upsert({ where: { slug }, update: payload, create: payload });
    } else {
      savedCategory = await model.upsert({ where: { slug }, update: payload, create: payload });
    }
    revalidateCategory(type);
    return { success: true, category: savedCategory };
  } catch (error: any) {
    console.error("Error saving category:", error);
    if (error?.code === "P2002") return { success: false, error: "A category with this name or slug already exists." };
    return { success: false, error: "Failed to save category." };
  }
}

export async function deleteContentCategoryAction(type: CategoryType, id: string, slug?: string) {
  try {
    await requireAdmin();

    if (type !== "ARTICLE" && type !== "NOTE") {
      return { success: false, error: "Invalid category type." };
    }

    const categoryId = cleanText(id);
    const categorySlug = cleanText(slug);

    if (!categoryId && !categorySlug) {
      return { success: false, error: "Category ID or slug is required." };
    }

    // Resolve by ID first, then by slug. Some older CMS rows only send a slug.
    const category =
      type === "ARTICLE"
        ? (categoryId
            ? await prisma.articleCategory.findUnique({ where: { id: categoryId } })
            : null) ??
          (categorySlug
            ? await prisma.articleCategory.findUnique({ where: { slug: categorySlug } })
            : null)
        : (categoryId
            ? await prisma.noteCategory.findUnique({ where: { id: categoryId } })
            : null) ??
          (categorySlug
            ? await prisma.noteCategory.findUnique({ where: { slug: categorySlug } })
            : null);

    if (!category) {
      return {
        success: false,
        error: "Category not found. Refresh the admin page and try again.",
      };
    }

    // Article/Note.category is a string, not a foreign-key relation. Reassign
    // existing content before removing the category so published pages remain valid.
    if (type === "ARTICLE") {
      const fallback = await prisma.articleCategory.findFirst({
        where: { id: { not: category.id }, active: true },
        orderBy: { sortOrder: "asc" },
        select: { name: true },
      });
      await prisma.$transaction([
        prisma.article.updateMany({
          where: { category: category.name },
          data: { category: fallback?.name ?? "Uncategorized" },
        }),
        prisma.articleCategory.delete({ where: { id: category.id } }),
      ]);
    } else {
      const fallback = await prisma.noteCategory.findFirst({
        where: { id: { not: category.id }, active: true },
        orderBy: { sortOrder: "asc" },
        select: { name: true },
      });
      await prisma.$transaction([
        prisma.note.updateMany({
          where: { category: category.name },
          data: { category: fallback?.name ?? "Uncategorized" },
        }),
        prisma.noteCategory.delete({ where: { id: category.id } }),
      ]);
    }

    revalidateCategory(type);
    revalidateContent(type);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);

    if (error?.code === "P2025") {
      return {
        success: false,
        error: "Category not found. Refresh the admin page and try again.",
      };
    }

    return {
      success: false,
      error: "Failed to delete category. Check the server log for details.",
    };
  }
}
