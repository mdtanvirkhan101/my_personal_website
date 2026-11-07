/* app/api/admin/services/[id]/route.ts */
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

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const current = await prisma.service.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.description !== undefined)
      data.description = String(body.description).trim();
    if (body.icon !== undefined) data.icon = body.icon;
    if (body.attachments !== undefined)
      data.attachments = normalizeAttachments(body.attachments);
    if (body.active !== undefined) data.active = Boolean(body.active);
    if (body.sortOrder !== undefined)
      data.sortOrder = Number(body.sortOrder);

    if (body.category !== undefined) {
      data.category =
        body.category === "SOLUTION" ? "SOLUTION" : "SERVICE";
    }

    if (body.slug !== undefined && String(body.slug).trim()) {
      data.slug = slugify(String(body.slug));
    } else if (body.title !== undefined) {
      data.slug = slugify(String(body.title));
    }

    if (data.slug && data.slug !== current.slug) {
      const duplicate = await prisma.service.findUnique({
        where: { slug: String(data.slug) },
      });

      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: "Another service already uses this slug." },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.service.update({
      where: { id },
      data: data as any,
    });

    return NextResponse.json({
      ...updated,
      attachments: normalizeAttachments(updated.attachments),
      category: (updated as any).category || "SERVICE",
    });
  } catch (error) {
    console.error("PUT /api/admin/services/[id]", error);
    return NextResponse.json(
      { error: "Could not update service." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const current = await prisma.service.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/services/[id]", error);
    return NextResponse.json(
      { error: "Could not delete service." },
      { status: 500 }
    );
  }
}
