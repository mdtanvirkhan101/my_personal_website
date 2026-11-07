import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getRecentVisitorLogs } from "@/actions/network-telemetry";
import { VisitorTelemetryTable } from "@/components/admin/visitor-telemetry-table";
import type { Metadata } from "next";
import { Radio, ShieldCheck, Globe, Server, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Security Telemetry & Live Traffic | Admin CMS",
  description: "Monitor real-time network traffic packets, global visitor geolocations, IP filtering, and perimeter audit logs.",
};

export default async function AdminTelemetryPage() {
  await getAdminSession();
  const logs = await getRecentVisitorLogs();

  return (
    <div className="space-y-6 max-w-[1780px] 2xl:max-w-[1920px] mx-auto w-full">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-[#141444] via-[#10103b] to-[#0e0e34] border border-purple-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              <span>Perimeter Defense &amp; Traffic Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Network Security Engineer — Live Traffic &amp; Visitor Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Capture, analyze, and manage real-time inbound traffic packets, geolocation routes, ISP origin data, and date-wise firewall audit records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2.5 rounded-xl bg-[#0e0e34] hover:bg-[#18184a] border border-purple-500/30 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shadow-md"
            >
              <span>Back to Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Interactive Telemetry Console Table */}
      <VisitorTelemetryTable initialLogs={logs} />
    </div>
  );
}

