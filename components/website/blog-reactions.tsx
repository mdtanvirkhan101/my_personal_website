"use client";

import React, { useState, useEffect } from "react";
import { Heart, Rocket, Lightbulb, Flame } from "lucide-react";

interface BlogReactionsProps {
  postSlug: string;
  initialCounts?: {
    likes?: number;
    rockets?: number;
    ideas?: number;
    fires?: number;
  };
}

export function BlogReactions({ postSlug, initialCounts }: BlogReactionsProps) {
  const [reactions, setReactions] = useState({
    likes: initialCounts?.likes || 12,
    rockets: initialCounts?.rockets || 8,
    ideas: initialCounts?.ideas || 15,
    fires: initialCounts?.fires || 9,
  });

  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`blog_reactions_${postSlug}`);
      if (stored) {
        try {
          setUserReacted(JSON.parse(stored));
        } catch {}
      }
    }
  }, [postSlug]);

  const handleReaction = (type: "likes" | "rockets" | "ideas" | "fires") => {
    const isAlready = userReacted[type];
    const newCount = isAlready ? reactions[type] - 1 : reactions[type] + 1;

    const nextReactions = {
      ...reactions,
      [type]: Math.max(0, newCount),
    };

    const nextUserReacted = {
      ...userReacted,
      [type]: !isAlready,
    };

    setReactions(nextReactions);
    setUserReacted(nextUserReacted);

    if (typeof window !== "undefined") {
      localStorage.setItem(`blog_reactions_${postSlug}`, JSON.stringify(nextUserReacted));
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#5A7FC8]/30 my-8 space-y-4 bg-gradient-to-br from-[#141444]/90 to-[#191954]/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-heading text-base font-bold text-white flex items-center gap-2">
            <span>Was this article insightful?</span>
          </h4>
          <p className="text-xs text-[#789BE0] font-mono">
            React to support this technical breakdown
          </p>
        </div>

        {/* Reaction Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Heart */}
          <button
            type="button"
            onClick={() => handleReaction("likes")}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 border ${
              userReacted.likes
                ? "bg-rose-500/20 border-rose-500/60 text-rose-300 scale-105"
                : "bg-[#0E0E34]/80 border-[#5A7FC8]/30 text-[#DCE3F6] hover:border-rose-400/40 hover:bg-[#1a1b52]"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                userReacted.likes ? "fill-rose-400 text-rose-400" : "text-rose-400"
              }`}
            />
            <span className="font-bold">{reactions.likes}</span>
          </button>

          {/* Rocket */}
          <button
            type="button"
            onClick={() => handleReaction("rockets")}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 border ${
              userReacted.rockets
                ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 scale-105"
                : "bg-[#0E0E34]/80 border-[#5A7FC8]/30 text-[#DCE3F6] hover:border-cyan-400/40 hover:bg-[#1a1b52]"
            }`}
          >
            <Rocket
              className={`w-4 h-4 ${
                userReacted.rockets ? "fill-cyan-400 text-cyan-400" : "text-cyan-400"
              }`}
            />
            <span className="font-bold">{reactions.rockets}</span>
          </button>

          {/* Lightbulb */}
          <button
            type="button"
            onClick={() => handleReaction("ideas")}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 border ${
              userReacted.ideas
                ? "bg-amber-500/20 border-amber-500/60 text-amber-300 scale-105"
                : "bg-[#0E0E34]/80 border-[#5A7FC8]/30 text-[#DCE3F6] hover:border-amber-400/40 hover:bg-[#1a1b52]"
            }`}
          >
            <Lightbulb
              className={`w-4 h-4 ${
                userReacted.ideas ? "fill-amber-400 text-amber-400" : "text-amber-400"
              }`}
            />
            <span className="font-bold">{reactions.ideas}</span>
          </button>

          {/* Flame */}
          <button
            type="button"
            onClick={() => handleReaction("fires")}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 border ${
              userReacted.fires
                ? "bg-orange-500/20 border-orange-500/60 text-orange-300 scale-105"
                : "bg-[#0E0E34]/80 border-[#5A7FC8]/30 text-[#DCE3F6] hover:border-orange-400/40 hover:bg-[#1a1b52]"
            }`}
          >
            <Flame
              className={`w-4 h-4 ${
                userReacted.fires ? "fill-orange-400 text-orange-400" : "text-orange-400"
              }`}
            />
            <span className="font-bold">{reactions.fires}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

