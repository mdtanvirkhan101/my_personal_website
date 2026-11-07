/* app/api/admin/services/route.ts */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeAttachments(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(
    services.map((item) => ({
      ...item,
      attachments: normalizeAttachments(item.attachments),
      category: (item as any).category || "SERVICE",
    }))
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    const category = body.category === "SOLUTION" ? "SOLUTION" : "SERVICE";
    const slug = slugify(body.slug || body.title);

    const existing = await prisma.service.findUnique({ where: { slug } });

    if (existing) {
      return NextResponse.json(
        { error: "A service with this slug already exists." },
        { status: 409 }
      );
    }

    const item = await prisma.service.create({
      data: {
        title: body.title.trim(),
        slug,
        description: body.description?.trim() || "",
        icon: body.icon || "Network",
        attachments: normalizeAttachments(body.attachments),
        active: body.active !== false,
        sortOrder: Number(body.sortOrder) || 1,
        ...( { category } as any ),
      },
    });

    return NextResponse.json(
      {
        ...item,
        attachments: normalizeAttachments(item.attachments),
        category: (item as any).category || category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/services", error);
    return NextResponse.json(
      { error: "Could not create service." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.order)) {
      return NextResponse.json(
        { error: "order must be an array." },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      body.order.map((item: { id: string; sortOrder: number }) =>
        prisma.service.update({
          where: { id: item.id },
          data: { sortOrder: Number(item.sortOrder) },
        })
      )
    );

    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      items: services.map((item) => ({
        ...item,
        attachments: normalizeAttachments(item.attachments),
        category: (item as any).category || "SERVICE",
      })),
    });
  } catch (error) {
    console.error("PATCH /api/admin/services", error);
    return NextResponse.json(
      { error: "Could not save display order." },
      { status: 500 }
    );
  }
}
