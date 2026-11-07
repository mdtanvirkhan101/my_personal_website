"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FolderGit2,
  Layers,
  BookOpen,
  Briefcase,
  FileCode2,
  X,
  CornerDownLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { searchGlobalPortfolio, SearchResultItem } from "@/actions/global-search";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keydown Listener for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchGlobalPortfolio(query);
        setResults(res);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Navigate on Enter
  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  // Keyboard Navigation inside search list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0e0e34] border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-purple-500/20 bg-[#141444]/80">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleListKeyDown}
            placeholder="Search projects, case studies, blogs, skills... (ESC to close)"
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
          />
          {isLoading ? (
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          ) : (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-purple-500/10 font-mono text-xs">
          {query.trim().length < 2 ? (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <p className="text-xs">Type at least 2 characters to search across MD Tanvir Khan&apos;s portfolio.</p>
              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
                <span>Quick links:</span>
                <button
                  type="button"
                  onClick={() => handleSelect("/projects")}
                  className="text-cyan-400 hover:underline"
                >
                  Projects
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleSelect("/case-studies")}
                  className="text-purple-400 hover:underline"
                >
                  Case Studies
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleSelect("/blog")}
                  className="text-emerald-400 hover:underline"
                >
                  Blog
                </button>
              </div>
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-slate-400">
              No matching results found for &quot;<span className="text-cyan-300">{query}</span>&quot;
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-500/30 text-white shadow-md"
                      : "text-slate-300 hover:bg-[#141444]/60"
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span
                      className={`p-2 rounded-xl text-[10px] font-semibold uppercase shrink-0 ${
                        item.category === "Project"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : item.category === "Case Study"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : item.category === "Blog"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {item.category === "Project" && <FolderGit2 className="w-3.5 h-3.5" />}
                      {item.category === "Case Study" && <Layers className="w-3.5 h-3.5" />}
                      {item.category === "Blog" && <BookOpen className="w-3.5 h-3.5" />}
                      {item.category === "Service" && <Briefcase className="w-3.5 h-3.5" />}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pl-3">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] text-cyan-400">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-[#0a0a26] border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
          <span className="text-cyan-400 font-semibold">MD Tanvir Khan Portfolio</span>
        </div>
      </div>
    </div>
  );
}

