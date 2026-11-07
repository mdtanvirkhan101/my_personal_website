"use client";

import { useEffect, useState, type ReactNode } from "react";

type AnimatedStatCardProps = {
  icon: ReactNode;
  value: number;
  label: string;
  duration?: number;
};

export function AnimatedStatCard({
  icon,
  value,
  label,
  duration = 1400,
}: AnimatedStatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

    // Respect accessibility settings while still displaying the correct total.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || target === 0) {
      setCount(target);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;
    setCount(0);

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic: fast at first, then smoothly settles on the final value.
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.min(target, Math.round(target * easedProgress)));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, duration]);

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-[#141444]/65 p-4 sm:p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/25 bg-[#0e0e34] text-cyan-400">
        {icon}
      </div>
      <p className="font-heading text-2xl font-bold tabular-nums text-white sm:text-3xl" aria-label={`${value} ${label}`}>
        {count}
      </p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
