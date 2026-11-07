"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Images,
  Archive,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Loader2,
  Plus,
  FileCode,
  File,
  AlertCircle,
} from "lucide-react";
import { ProjectAttachment } from "@/lib/validations/project";
import { MediaPickerModal } from "./media-picker-modal";

interface MultiFileUploaderProps {
  label?: string;
  description?: string;
  attachments: ProjectAttachment[];
  onChange: (attachments: ProjectAttachment[]) => void;
  accept?: string;
  maxFiles?: number;
}

export function MultiFileUploader({
  label = "Project Files & PDF Documents",
  description = "Upload multiple files (PDFs, documentation, specifications, archives) or add external links (Google Drive, Figma, GitHub).",
  attachments = [],
  onChange,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.tar,.gz,.png,.jpg,.jpeg,.webp,.svg",
  maxFiles = 20,
}: MultiFileUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Link Tab Form State
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkType, setLinkType] = useState<"pdf" | "document" | "link" | "archive" | "image">("pdf");
  const [linkError, setLinkError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size
  const formatBytes = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Determine file type from extension or mime
  const detectFileType = (fileName: string, mime?: string): "pdf" | "image" | "archive" | "document" | "link" => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf" || mime?.includes("pdf")) return "pdf";
    if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext || "") || mime?.startsWith("image/")) return "image";
    if (["zip", "tar", "gz", "rar", "7z"].includes(ext || "")) return "archive";
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md"].includes(ext || "")) return "document";
    return "document";
  };

  // Multi-file upload handler
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload files");
      }

      const uploadedList = data.files || (data.url ? [data] : []);

      const newItems: ProjectAttachment[] = uploadedList.map((item: any) => {
        const type = detectFileType(item.originalName || item.fileName, item.mimeType);
        return {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: item.originalName || item.fileName,
          url: item.url,
          size: item.sizeBytes,
          sizeText: formatBytes(item.sizeBytes),
          type,
          isExternalLink: false,
          addedAt: new Date().toISOString(),
        };
      });

      onChange([...attachments, ...newItems]);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Select existing file from Media Library
  const handleMediaSelect = (url: string, asset?: any) => {
    const fileName = asset?.fileName || url.split("/").pop() || "media-file";
    const name = asset?.name || fileName;
    const type = detectFileType(fileName);
    const newAttachment: ProjectAttachment = {
      id: `lib-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      url,
      size: asset?.size || null,
      sizeText: asset?.size ? formatBytes(asset.size) : "",
      type,
      isExternalLink: false,
      addedAt: new Date().toISOString(),
    };
    onChange([...attachments, newAttachment]);
  };

  // Add external link handler
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);

    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) {
      setLinkError("URL is required.");
      return;
    }

    const title = linkName.trim() || trimmedUrl.replace(/^https?:\/\//, "").split("/")[0] || "External Link";

    const newAttachment: ProjectAttachment = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: title,
      url: trimmedUrl,
      size: null,
      sizeText: "External",
      type: linkType,
      isExternalLink: true,
      addedAt: new Date().toISOString(),
    };

    onChange([...attachments, newAttachment]);
    setLinkUrl("");
    setLinkName("");
  };

  const removeAttachment = (id?: string, index?: number) => {
    const updated = attachments.filter((item, idx) => (id ? item.id !== id : idx !== index));
    onChange(updated);
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderTypeIcon = (type?: string | null, isExternal?: boolean) => {
    if (type === "pdf") {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 font-bold text-[10px]">
          PDF
        </div>
      );
    }
    if (type === "image") {
      return (
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
          <ImageIcon className="w-4 h-4" />
        </div>
      );
    }
    if (type === "archive") {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Archive className="w-4 h-4" />
        </div>
      );
    }
    if (isExternal) {
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
          <ExternalLink className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-700/40 border border-border-subtle flex items-center justify-center text-slate-300 shrink-0">
        <File className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
            {label}
          </h2>
          <span className="text-[11px] text-slate-400">
            {attachments.length} {attachments.length === 1 ? "attachment" : "attachments"}
          </span>
        </div>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>

      {/* Mode Navigation Tabs: Upload Files VS Add External Link VS Media Library */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-surface-100 border border-border-subtle w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-primary text-background shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Local Files (PDFs / Docs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "link"
                ? "bg-primary text-background shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Add External Link (Google Drive / Figma)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMediaModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all shadow-sm"
        >
          <Images className="w-3.5 h-3.5 text-purple-400" />
          <span>Choose from Media Library</span>
        </button>
      </div>

      {/* Tab 1: Upload Local Files */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFilesUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-border-subtle hover:border-sky-500/50 bg-surface-50/70 hover:bg-surface-100 transition-colors cursor-pointer text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto group-hover:scale-105 transition-transform">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </div>
            <div className="text-xs font-semibold text-white">
              {uploading ? "Uploading files..." : "Click to select or drag & drop multiple files"}
            </div>
            <p className="text-[11px] text-slate-400">
              Supports PDF documents, Word/Excel, ZIP archives, images up to 50MB each
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs">
            <div className="flex items-center space-x-2 text-purple-300">
              <Images className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Already uploaded an image or file? Pick directly from your Media Library.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-all shrink-0"
            >
              Browse Library
            </button>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Add External Link */}
      {activeTab === "link" && (
        <div className="p-4 rounded-xl bg-surface-50 border border-border-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Link URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://drive.google.com/file/... or https://figma.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Document / Link Title
              </label>
              <input
                type="text"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="e.g. System Design Architecture (Google Drive PDF)"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Category:</span>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-surface-100 border border-border-subtle text-slate-300 text-xs focus:outline-none focus:border-primary"
              >
                <option value="pdf">PDF Document</option>
                <option value="document">General Doc / Specification</option>
                <option value="link">External Link / Demo / Figma</option>
                <option value="archive">Repository / Archive</option>
                <option value="image">Diagram / Image</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddLink}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach External Link</span>
            </button>
          </div>

          {linkError && <p className="text-xs text-red-400">{linkError}</p>}
        </div>
      )}

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Attached Project Files &amp; Resources ({attachments.length})
          </span>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {attachments.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-100/70 border border-border-subtle hover:border-sky-500/30 transition-colors gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {renderTypeIcon(item.type, item.isExternalLink)}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-white truncate max-w-[280px] sm:max-w-md block">
                        {item.name}
                      </span>
                      {item.type === "pdf" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 uppercase">
                          PDF
                        </span>
                      )}
                      {item.isExternalLink && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300">
                          Link
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-[320px]">
                      <span>{item.sizeText || (item.size ? formatBytes(item.size) : "")}</span>
                      <span>•</span>
                      <span className="truncate">{item.url}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-200 transition-colors"
                    title="Open or Download"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyUrl(item.id || `${idx}`, item.url)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-200 transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === (item.id || `${idx}`) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeAttachment(item.id, idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reusable Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        title="Select File / Image from Media Library"
        filterImagesOnly={false}
      />
    </div>
  );
}
