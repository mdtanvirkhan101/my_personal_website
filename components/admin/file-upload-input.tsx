"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Loader2, Check, ExternalLink, Images } from "lucide-react";
import { MediaPickerModal } from "./media-picker-modal";

interface FileUploadInputProps {
  name: string;
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  accept?: string;
  label?: string;
  helpText?: string;
}

export function FileUploadInput({
  name,
  value,
  onChange,
  placeholder = "https://... or click Upload",
  accept = "image/*",
  label,
  helpText,
}: FileUploadInputProps) {
  const [currentVal, setCurrentVal] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedSuccess, setUploadedSuccess] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep the input synchronized when its parent loads or clears a saved URL.
  useEffect(() => {
    setCurrentVal(value || "");
  }, [value]);

  const handleTextChange = (newVal: string) => {
    setCurrentVal(newVal);
    onChange?.(newVal);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadedSuccess(false);

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

      handleTextChange(data.url);
      setUploadedSuccess(true);
      setTimeout(() => setUploadedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isImage = Boolean(
    currentVal &&
      (currentVal.match(/\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i) ||
        currentVal.startsWith("/uploads/") ||
        currentVal.startsWith("http"))
  );

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            name={name}
            value={currentVal}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-3.5 pr-8 py-2 rounded-xl bg-surface-50 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary transition-colors"
          />
          {currentVal && (
            <a href={currentVal} target="_blank" rel="noopener noreferrer" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" title="Open link">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />

        <button type="button" onClick={() => setIsPickerOpen(true)} className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 hover:text-white text-xs font-medium transition-colors shrink-0 shadow-sm" title="Choose from previously uploaded images">
          <Images className="w-3.5 h-3.5 text-purple-400" />
          <span>Choose from Library</span>
        </button>

        <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-slate-200 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 shrink-0">
          {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" /><span>Uploading...</span></> : uploadedSuccess ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Uploaded!</span></> : <><Upload className="w-3.5 h-3.5 text-sky-400" /><span>Upload New</span></>}
        </button>
      </div>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(selectedUrl) => handleTextChange(selectedUrl)}
        currentValue={currentVal}
        title={label ? `Select ${label}` : "Select from Uploaded Images"}
      />

      {error && <p className="text-[11px] text-red-400">{error}</p>}
      {helpText && <p className="text-[11px] text-slate-400">{helpText}</p>}

      {isImage && (
        <div className="mt-2 flex items-center space-x-2 p-1.5 rounded-lg bg-surface-100 border border-border-subtle w-fit">
          <img src={currentVal} alt="Preview" className="w-10 h-10 object-cover rounded-md border border-border-subtle" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="text-[10px] text-slate-400 font-mono pr-2 truncate max-w-[200px]">{currentVal}</span>
        </div>
      )}
    </div>
  );
}
