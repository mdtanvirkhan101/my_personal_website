"use client";

import React, { useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Server,
  Network,
  ShieldCheck,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { EstimatorTier, defaultEstimatorTiers } from "@/lib/services-page-config";

interface ServiceCostEstimatorProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  tiers?: EstimatorTier[];
}

export function ServiceCostEstimator({
  badge = "Interactive Quotation Tool",
  title = "Project Cost & Timeline Estimator",
  subtitle = "Select one or multiple infrastructure and VoIP modules to generate an instant estimate.",
  tiers = defaultEstimatorTiers,
}: ServiceCostEstimatorProps) {
  const activeTiers = tiers && tiers.length > 0 ? tiers : defaultEstimatorTiers;
  const [selectedIds, setSelectedIds] = useState<string[]>([activeTiers[0]?.id || "voip-setup"]);
  const [priorityTier, setPriorityTier] = useState<"standard" | "express">("standard");

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = activeTiers.filter((s) => selectedIds.includes(s.id));
  const subtotal = selectedServices.reduce((sum, s) => sum + s.basePrice, 0);
  const multiplier = priorityTier === "express" ? 1.25 : 1.0;
  const totalPrice = Math.round(subtotal * multiplier);
  const maxDays = Math.max(...selectedServices.map((s) => s.deliveryDays), 3);
  const totalDays = priorityTier === "express" ? Math.max(Math.round(maxDays * 0.65), 2) : maxDays;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#141444] via-[#10103b] to-[#0e0e34] border border-cyan-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>{badge}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-mono leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Delivery speed selector */}
          <div className="flex items-center space-x-2 bg-[#0a0a24] p-1.5 rounded-2xl border border-purple-500/30 shrink-0 font-mono text-xs">
            <button
              type="button"
              onClick={() => setPriorityTier("standard")}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                priorityTier === "standard"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Standard Speed
            </button>
            <button
              type="button"
              onClick={() => setPriorityTier("express")}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                priorityTier === "express"
                  ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Express Delivery (+25%)
            </button>
          </div>
        </div>

        {/* Services Multi-Select Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTiers.map((tier) => {
            const isSelected = selectedIds.includes(tier.id);
            return (
              <div
                key={tier.id}
                onClick={() => toggleService(tier.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? "bg-[#16164d] border-cyan-400 shadow-lg shadow-cyan-500/10"
                    : "bg-[#0e0e34]/60 border-purple-500/20 hover:border-purple-500/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                      {tier.category}
                    </span>
                    <h4 className="font-heading text-base font-bold text-white">
                      {tier.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-mono font-bold text-cyan-300">
                      ${tier.basePrice}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      ~{tier.deliveryDays} days
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3 font-mono">
                  {tier.description}
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-purple-500/15">
                  {tier.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-300"
                    >
                      <CheckCircle2
                        className={`w-3 h-3 shrink-0 ${
                          isSelected ? "text-cyan-400" : "text-slate-500"
                        }`}
                      />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary & Consultation CTA */}
        <div className="p-6 rounded-2xl bg-[#0a0a24] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Estimated Project Total
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400 font-mono">
                ${totalPrice}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                / approx. {totalDays} business days
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {selectedServices.length} module(s) selected • {priorityTier.toUpperCase()} schedule
            </p>
          </div>

          <Link
            href={`/contact?subject=Service Quotation: $${totalPrice}&details=${encodeURIComponent(
              selectedServices.map((s) => s.name).join(", ")
            )}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
          >
            <span>Request Quote with this Estimate</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
