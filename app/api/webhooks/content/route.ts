import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { PublishStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const token = authHeader?.replace(/^Bearer\s+/i, "") || searchParams.get("secret");

    // Fetch saved webhook secret or use default
    const webhookSetting = await prisma.siteSetting.findUnique({
      where: { key: "content_webhook_config" },
    });
    const expectedSecret =
      (webhookSetting?.value as any)?.webhookSecret || "portfolio_content_secret_2026";

    if (!token || token !== expectedSecret) {
      return NextResponse.json({ error: "Invalid or missing webhook secret" }, { status: 401 });
    }

    const body = await req.json();
    const type = (body.type || "blog").toLowerCase();

    // 1. Ingest Blog Post from external API
    if (type === "blog") {
      const title = body.title?.trim();
      if (!title) return NextResponse.json({ error: "Title is required for blog" }, { status: 400 });

      const slug = body.slug ? slugify(body.slug) : slugify(title);
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

      const created = await prisma.blogPost.create({
        data: {
          title,
          slug: finalSlug,
          excerpt: body.excerpt || body.summary || null,
          content: body.content || body.body || "Imported article via Webhook",
          coverUrl: body.coverUrl || body.imageUrl || null,
          status: (body.status?.toUpperCase() as PublishStatus) || PublishStatus.PUBLISHED,
          publishedAt: new Date(),
          attachments: body.attachments || [],
        },
      });

      return NextResponse.json({
        success: true,
        type: "blog",
        message: "Blog post imported successfully",
        id: created.id,
        slug: created.slug,
      });
    }

    // 2. Ingest Project from external API / GitHub sync
    if (type === "project") {
      const title = body.title?.trim();
      if (!title) return NextResponse.json({ error: "Title is required for project" }, { status: 400 });

      const slug = body.slug ? slugify(body.slug) : slugify(title);
      const existing = await prisma.project.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

      const created = await prisma.project.create({
        data: {
          title,
          slug: finalSlug,
          summary: body.summary || body.description || "Imported project via Webhook",
          content: body.content || null,
          coverUrl: body.coverUrl || null,
          stack: Array.isArray(body.stack) ? body.stack : ["TypeScript", "API"],
          liveUrl: body.liveUrl || null,
          repoUrl: body.repoUrl || null,
          featured: body.featured ?? false,
          status: (body.status?.toUpperCase() as PublishStatus) || PublishStatus.PUBLISHED,
          attachments: body.attachments || [],
          ...(body.caseStudy && {
            caseStudy: {
              create: {
                problem: body.caseStudy.problem || "Automated sync problem description",
                process: body.caseStudy.process || null,
                solution: body.caseStudy.solution || "Automated sync solution",
                outcome: body.caseStudy.outcome || null,
              },
            },
          }),
        },
      });

      return NextResponse.json({
        success: true,
        type: "project",
        message: "Project imported successfully",
        id: created.id,
        slug: created.slug,
      });
    }

    // 3. Ingest Service from external API
    if (type === "service") {
      const title = body.title?.trim();
      if (!title) return NextResponse.json({ error: "Title is required for service" }, { status: 400 });

      const slug = body.slug ? slugify(body.slug) : slugify(title);
      const created = await prisma.service.create({
        data: {
          title,
          slug,
          description: body.description || "Imported service via Webhook",
          icon: body.icon || "Code",
          active: body.active ?? true,
          attachments: body.attachments || [],
        },
      });

      return NextResponse.json({
        success: true,
        type: "service",
        message: "Service imported successfully",
        id: created.id,
      });
    }

    return NextResponse.json({ error: `Unsupported type: ${type}` }, { status: 400 });
  } catch (err: any) {
    console.error("Content webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
