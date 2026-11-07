"use server";

import fs from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

export interface MediaFileItem {
  url: string;
  name: string;
  fileName: string;
  size: number;
  createdAt: string;
  isImage: boolean;
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif", ".ico"]);

/**
 * Fetch all previously uploaded media files from public/uploads
 */
export async function getUploadedMediaFiles(): Promise<MediaFileItem[]> {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileNames = await fs.readdir(uploadDir);
    const mediaList: MediaFileItem[] = [];

    for (const fileName of fileNames) {
      // Ignore hidden files like .gitkeep or .DS_Store
      if (fileName.startsWith(".")) continue;

      try {
        const fullPath = path.join(uploadDir, fileName);
        const stats = await fs.stat(fullPath);

        if (!stats.isFile()) continue;

        const ext = path.extname(fileName).toLowerCase();
        const isImage = IMAGE_EXTENSIONS.has(ext);

        // Friendly name: remove timestamp prefix if present (e.g. 1792479936335-name.png -> name.png)
        const friendlyName = fileName.replace(/^\d+-/, "").replace(/_/g, " ");

        mediaList.push({
          url: `/uploads/${fileName}`,
          name: friendlyName,
          fileName,
          size: stats.size,
          createdAt: stats.mtime.toISOString(),
          isImage,
        });
      } catch (err) {
        // Skip unreadable files
      }
    }

    // Sort newest first
    mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return mediaList;
  } catch (error) {
    console.error("Error reading uploads directory:", error);
    return [];
  }
}

/**
 * Delete an uploaded media file safely
 */
export async function deleteUploadedMediaFile(
  fileNameOrUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const cleanName = path.basename(fileNameOrUrl);
    if (!cleanName || cleanName.includes("..") || cleanName.startsWith(".")) {
      return { success: false, error: "Invalid file name" };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const targetPath = path.join(uploadDir, cleanName);

    try {
      await fs.unlink(targetPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "File not found" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete file" };
  }
}
