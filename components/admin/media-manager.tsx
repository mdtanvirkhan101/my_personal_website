"use client";

import { useState, useRef, useTransition, useMemo } from "react";
import {
  Images,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  FileText,
  File,
  Eye,
  X,
  AlertCircle,
  HardDrive,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { MediaFileItem, deleteUploadedMediaFile, getUploadedMediaFiles } from "@/actions/media";

interface MediaManagerProps {
  initialMedia: MediaFileItem[];
}

export function MediaManager({ initialMedia }: MediaManagerProps) {
  const [mediaList, setMediaList] = useState<MediaFileItem[]>(initialMedia);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "images" | "documents">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "largest" | "name">("newest");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaFileItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const refreshed = await getUploadedMediaFiles();
      setMediaList(refreshed);
      showToast("Media library refreshed");
    });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast("File URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Refresh list after upload
      const updated = await getUploadedMediaFiles();
      setMediaList(updated);
      showToast(`Uploaded ${files.length} file(s) successfully!`);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileName: string) => {
    setDeletingFile(fileName);
    try {
      const res = await deleteUploadedMediaFile(fileName);
      if (res.success) {
        setMediaList((prev) => prev.filter((m) => m.fileName !== fileName));
        setDeleteConfirm(null);
        showToast("File deleted permanently");
      } else {
        alert(res.error || "Failed to delete file");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete file");
    } finally {
      setDeletingFile(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Metrics calculations
  const totalCount = mediaList.length;
  const imageCount = mediaList.filter((m) => m.isImage).length;
  const docCount = mediaList.filter((m) => !m.isImage).length;
  const totalBytes = mediaList.reduce((acc, m) => acc + m.size, 0);

  // Filtered & sorted media
  const filteredMedia = useMemo(() => {
    return mediaList
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.fileName.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterType === "images") return item.isImage;
        if (filterType === "documents") return !item.isImage;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "largest") {
          return b.size - a.size;
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [mediaList, searchQuery, filterType, sortBy]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/90 border border-purple-500/40 text-purple-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
            <Images className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Universal Media Library</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                {totalCount} Files
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Upload once, use anywhere! Any image uploaded here or anywhere across the Admin Panel is permanently saved and instantly reusable in Hero Photo, Logos, Projects, Blogs, and Services without uploading duplicates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
            title="Refresh Media List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? "Uploading..." : "Upload New Files"}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.zip"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-border-subtle flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Files</div>
            <div className="text-base font-bold text-white font-mono">{totalCount}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-border-subtle flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Images className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Images &amp; Icons</div>
            <div className="text-base font-bold text-white font-mono">{imageCount}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-border-subtle flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Documents / PDFs</div>
            <div className="text-base font-bold text-white font-mono">{docCount}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-border-subtle flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Storage Used</div>
            <div className="text-base font-bold text-white font-mono">{formatBytes(totalBytes)}</div>
          </div>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Dropzone Quick Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-6 rounded-2xl border-2 border-dashed border-border-subtle hover:border-emerald-500/50 bg-surface-50/50 hover:bg-surface-100/50 transition-all cursor-pointer text-center space-y-2 group"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto group-hover:scale-110 transition-transform">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
        </div>
        <div className="text-xs font-semibold text-white">
          {uploading ? "Uploading files..." : "Click or drag & drop to upload new images & assets"}
        </div>
        <p className="text-[11px] text-slate-400">
          Supports PNG, JPG, WEBP, SVG, GIF, PDF, ZIP up to 50MB. Upload once to make available anywhere.
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media by file name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills & Sort Selector */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-surface-100 border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterType === "all"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("images")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterType === "images"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Images ({imageCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("documents")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterType === "documents"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Docs ({docCount})
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-surface-100 border border-border-subtle text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="largest">Largest Size</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-border-subtle text-center space-y-3">
          <Images className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No media found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No media matches "${searchQuery}". Try clearing your search.`
              : "No media files uploaded yet. Upload your first image or document above!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filteredMedia.map((item) => (
            <div
              key={item.fileName}
              className="group relative rounded-2xl bg-surface-50 border border-border-subtle hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Media Thumbnail Container */}
              <div
                onClick={() => (item.isImage ? setPreviewMedia(item) : window.open(item.url, "_blank"))}
                className="relative aspect-square w-full bg-slate-950/60 overflow-hidden cursor-pointer flex items-center justify-center p-2"
              >
                {item.isImage ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                    <FileText className="w-8 h-8 text-sky-400" />
                    <span className="text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
                      {item.fileName.split(".").pop() || "FILE"}
                    </span>
                  </div>
                )}

                {/* Hover Quick Overlay */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMedia(item);
                    }}
                    className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all"
                    title="Preview Media"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.url);
                    }}
                    className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all"
                    title="Copy URL"
                  >
                    {copiedUrl === item.url ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Media Info Footer */}
              <div className="p-2.5 border-t border-border-subtle bg-surface-100/40">
                <span className="font-semibold text-xs text-white truncate block" title={item.name}>
                  {item.name}
                </span>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>{formatBytes(item.size)}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.url)}
                      className="text-slate-400 hover:text-white"
                      title="Copy URL"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(item.fileName)}
                      className="text-slate-400 hover:text-red-400 ml-1"
                      title="Delete File"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-border-subtle p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white pr-8 truncate">{previewMedia.name}</h3>

            <div className="relative aspect-video w-full rounded-2xl bg-slate-950/90 border border-border-subtle flex items-center justify-center overflow-hidden p-4">
              {previewMedia.isImage ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center space-y-2">
                  <FileText className="w-16 h-16 text-sky-400 mx-auto" />
                  <p className="text-xs text-slate-300">{previewMedia.fileName}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border-subtle">
              <div className="text-xs text-slate-400 space-y-0.5">
                <div className="font-mono text-[11px] text-emerald-400">{previewMedia.url}</div>
                <div>Size: {formatBytes(previewMedia.size)}</div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(previewMedia.url)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-semibold text-white border border-border-subtle"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Path</span>
                </button>
                <a
                  href={previewMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-primary text-slate-950 text-xs font-bold shadow-glow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Original</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-3xl border border-red-500/30 p-6 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Delete file permanently?</h3>
              <p className="text-xs text-slate-400 mt-1 break-all">
                "{deleteConfirm}" will be removed from disk. If this image is currently used on your site, it will no longer display.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={Boolean(deletingFile)}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5"
              >
                {deletingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
