"use client";

import React, { useState } from "react";
import { AdminSidebarItemConfig } from "@/lib/admin-sidebar-config";
import {
  saveAdminSidebarItems,
  resetAdminSidebarItems,
} from "@/actions/admin-sidebar";
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";

interface SidebarManagerProps {
  initialItems: AdminSidebarItemConfig[];
}

export function SidebarManager({ initialItems }: SidebarManagerProps) {
  const [items, setItems] = useState<AdminSidebarItemConfig[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const toggleVisibility = (index: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], visible: !copy[index].visible };
      return copy;
    });
  };

  const updateLabel = (index: number, newName: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: newName };
      return copy;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await saveAdminSidebarItems(items);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Sidebar navigation order and visibility updated successfully!",
        });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to save sidebar configuration",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the sidebar navigation to the default order?")) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetAdminSidebarItems();
      if (res.success) {
        window.location.reload();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to reset" });
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141444] via-[#10103b] to-[#0e0e34] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Sliders className="w-3.5 h-3.5" />
              <span>NAVIGATION ARCHITECTURE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Sidebar Order &amp; Layout Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-2xl">
              Customize exactly where each menu item appears in the Admin Panel sidebar.
              Use the arrow buttons to prioritize routes, rename labels, or hide unused tools.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || isSaving}
              className="px-4 py-2.5 rounded-xl bg-[#0e0e34] border border-slate-700 text-slate-300 text-xs font-mono hover:text-white transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Order</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Sidebar Layout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-center space-x-2 transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Interactive Items Table */}
      <div className="rounded-3xl bg-[#0e0e34] border border-cyan-500/25 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
            <Layers className="w-4 h-4" />
            <span>TOTAL MODULES: {items.length} (Visible: {items.filter((i) => i.visible).length})</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click Up/Down arrows to shift position
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={item.key}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.visible
                  ? "bg-[#141444] border-cyan-500/20 hover:border-cyan-500/40"
                  : "bg-[#0b0b26] border-slate-800 opacity-60"
              }`}
            >
              {/* Left Info: Position badge & route */}
              <div className="flex items-center space-x-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateLabel(index, e.target.value)}
                      className="bg-[#0e0e34] border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-xs font-bold text-white font-mono focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-slate-500 truncate hidden md:inline">
                      {item.href}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Controls: Visibility & Reordering */}
              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => toggleVisibility(index)}
                  title={item.visible ? "Hide from Sidebar" : "Show on Sidebar"}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition-all ${
                    item.visible
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {item.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  title="Move Up"
                  className="p-2 rounded-xl bg-[#0e0e34] border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === items.length - 1}
                  title="Move Down"
                  className="p-2 rounded-xl bg-[#0e0e34] border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
