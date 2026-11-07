"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Upload,
  Check,
  Trash2,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  ExternalLink,
  FolderOpen,
  Filter,
} from "lucide-react";
import { MediaFileItem } from "@/actions/media";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, item?: MediaFileItem) => void;
  currentValue?: string;
  title?: string;
  filterImagesOnly?: boolean;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
  title = "Media Library & Uploaded Files",
  filterImagesOnly = true,
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentValue || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Failed to fetch media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentValue || "");
      fetchFiles();
    }
  }, [isOpen, currentValue]);

  if (!isOpen) return null;

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Automatically select the newly uploaded file
      setSelectedUrl(data.url);
      await fetchFiles();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${fileName}"?`)) {
      return;
    }

    setDeletingFile(fileName);
    try {
      const res = await fetch(`/api/upload?fileName=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setFiles((prev) => prev.filter((f) => f.fileName !== fileName));
        if (selectedUrl.includes(fileName)) {
          setSelectedUrl("");
        }
      } else {
        alert(data.error || "Failed to delete file");
      }
    } catch (err: any) {
      alert("Error deleting file: " + err.message);
    } finally {
      setDeletingFile(null);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      const selectedItem = files.find((f) => f.url === selectedUrl);
      onSelect(selectedUrl, selectedItem);
      onClose();
    }
  };

  const filteredFiles = files.filter((f) => {
    if (filterImagesOnly && !f.isImage) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.fileName.toLowerCase().includes(q);
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0e0e34] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between shrink-0 bg-[#141444]/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">{title}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Select an existing uploaded file or upload a new one
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0e0e34] border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search & Upload New */}
        <div className="p-4 border-b border-cyan-500/15 bg-[#10103b] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded files by name..."
              className="w-full bg-[#0e0e34] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept={filterImagesOnly ? "image/*" : "*"}
              onChange={handleUploadNew}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New</span>
                </>
              )}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="px-6 py-2 bg-red-500/10 border-b border-red-500/20 text-xs font-mono text-red-400">
            {uploadError}
          </div>
        )}

        {/* Media Grid Body */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[300px] scrollbar-thin">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-2 text-slate-400 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Loading uploaded media files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400 font-mono text-xs">
              <ImageIcon className="w-10 h-10 text-slate-600" />
              <span>No uploaded files found{searchQuery ? ` matching "${searchQuery}"` : ""}.</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-mono transition-colors"
              >
                Upload your first image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredFiles.map((file) => {
                const isSelected = selectedUrl === file.url;
                return (
                  <div
                    key={file.fileName}
                    onClick={() => setSelectedUrl(file.url)}
                    className={`group relative rounded-2xl border p-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                        : "bg-[#141444]/60 border-slate-700/60 hover:border-cyan-500/40 hover:bg-[#141444]"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-full aspect-square rounded-xl bg-[#0b0b26] border border-slate-800 flex items-center justify-center overflow-hidden relative">
                      {file.isImage ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-slate-500" />
                      )}

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Delete Quick Action on Hover */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, file.fileName)}
                        disabled={deletingFile === file.fileName}
                        title="Delete file"
                        className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        {deletingFile === file.fileName ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="pt-2 px-1">
                      <p className="text-[11px] font-bold text-white font-mono truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cyan-500/20 bg-[#141444]/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-slate-400 truncate max-w-md">
            {selectedUrl ? (
              <span className="flex items-center space-x-1.5">
                <span className="text-cyan-400 font-bold">Selected:</span>
                <span className="truncate text-white">{selectedUrl}</span>
              </span>
            ) : (
              <span>Click on any image above to select it</span>
            )}
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#0e0e34] border border-slate-700 text-slate-300 text-xs font-mono hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleConfirmSelect}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40"
            >
              Use Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
