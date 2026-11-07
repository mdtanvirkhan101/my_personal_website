import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Check for multiple files ("files") or fallback to ("file")
    const uploadedFiles: File[] = [];
    const filesList = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    if (filesList && filesList.length > 0) {
      uploadedFiles.push(...filesList.filter((f) => f && typeof f.arrayBuffer === "function"));
    } else if (singleFile && typeof singleFile.arrayBuffer === "function") {
      uploadedFiles.push(singleFile);
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const results = [];

    for (const file of uploadedFiles) {
      // Limit file size to 50MB per file (generous for PDFs, documents, archives)
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: `File "${file.name}" exceeds 50MB limit` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean file extension and name
      const ext = path.extname(file.name);
      const rawBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeName = `${Date.now()}-${rawBase || "file"}${ext}`;

      const filePath = path.join(uploadDir, safeName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeName}`;
      const mimeType = file.type || "application/octet-stream";

      // Record in MediaAsset table
      try {
        await prisma.mediaAsset.create({
          data: {
            url: publicUrl,
            fileName: file.name,
            mimeType,
            sizeBytes: file.size,
            altText: rawBase,
            provider: "local",
          },
        });
      } catch (e) {
        console.warn("MediaAsset tracking warning:", e);
      }

      results.push({
        url: publicUrl,
        fileName: safeName,
        originalName: file.name,
        sizeBytes: file.size,
        mimeType,
      });
    }

    // If single file, return both direct fields and array for full backward compatibility
    if (results.length === 1) {
      return NextResponse.json({
        success: true,
        url: results[0].url,
        fileName: results[0].fileName,
        originalName: results[0].originalName,
        sizeBytes: results[0].sizeBytes,
        mimeType: results[0].mimeType,
        files: results,
      });
    }

    return NextResponse.json({
      success: true,
      files: results,
      urls: results.map((r) => r.url),
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileNames = await fs.readdir(uploadDir);
    const files = [];

    const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif", ".ico"]);

    for (const fileName of fileNames) {
      if (fileName.startsWith(".")) continue;
      try {
        const fullPath = path.join(uploadDir, fileName);
        const stats = await fs.stat(fullPath);
        if (!stats.isFile()) continue;

        const ext = path.extname(fileName).toLowerCase();
        files.push({
          url: `/uploads/${fileName}`,
          fileName,
          name: fileName.replace(/^\d+-/, "").replace(/_/g, " "),
          size: stats.size,
          createdAt: stats.mtime.toISOString(),
          isImage: IMAGE_EXTENSIONS.has(ext),
        });
      } catch (err) {
        // Skip
      }
    }

    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load media files" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName") || searchParams.get("url");

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    const cleanName = path.basename(fileName);
    if (!cleanName || cleanName.includes("..") || cleanName.startsWith(".")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const targetPath = path.join(uploadDir, cleanName);

    await fs.unlink(targetPath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}

