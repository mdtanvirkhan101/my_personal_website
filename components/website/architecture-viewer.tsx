"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, X, RefreshCw } from "lucide-react";

interface ArchitectureViewerProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export function ArchitectureViewer({
  src,
  alt,
  title = "Architecture & Topology Diagram",
  subtitle = "Click to expand & zoom into the full resolution schematic",
}: ArchitectureViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleOpen = () => {
    setIsOpen(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    setIsOpen(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.35, 0.75));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full my-6">
      {/* Thumbnail Card */}
      <div
        onClick={handleOpen}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#5A7FC8]/30 bg-[#141444]/60 backdrop-blur-md p-2 transition-all duration-300 hover:border-[#00D2D3]/60 hover:shadow-[0_0_25px_rgba(0,210,211,0.2)]"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#09091f]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E34]/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Hover Prompt Badge */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="flex items-center gap-2 rounded-full border border-[#00D2D3]/40 bg-[#0E0E34]/90 px-4 py-2 text-xs font-mono font-medium text-[#2DD4BF] shadow-lg backdrop-blur-md">
              <Maximize2 className="h-4 w-4" />
              <span>Expand & Zoom Diagram</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#DCE3F6]/90 font-mono">
            <span className="truncate pr-2 font-medium">{title}</span>
            <span className="text-[11px] text-[#789BE0]">Pinch / Zoomable</span>
          </div>
        </div>

        <p className="px-2 pt-2 text-[11px] text-[#789BE0] font-mono">{subtitle}</p>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#07071c]/95 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={handleClose}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Top Control Bar */}
          <div
            className="flex items-center justify-between border-b border-[#5A7FC8]/30 bg-[#0E0E34]/80 px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                {title}
              </h3>
              <p className="text-[11px] text-[#789BE0] font-mono hidden sm:block">
                Drag to pan when zoomed in. Scroll or use buttons to adjust scale.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5A7FC8]/30 bg-[#141444] text-[#DCE3F6] hover:bg-[#1f2066] hover:text-white transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[48px] text-center font-mono text-xs text-[#2DD4BF]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5A7FC8]/30 bg-[#141444] text-[#DCE3F6] hover:bg-[#1f2066] hover:text-white transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5A7FC8]/30 bg-[#141444] text-[#DCE3F6] hover:bg-[#1f2066] hover:text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-colors ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Pan & Zoom Canvas */}
          <div
            className="relative flex-1 overflow-hidden flex items-center justify-center p-4 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image element */}
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="max-h-[82vh] max-w-[90vw] rounded-xl border border-[#5A7FC8]/40 shadow-2xl object-contain bg-[#0a0a24]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

