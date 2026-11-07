"use client";

import React, { useState, useMemo } from "react";
import {
  Network,
  MapPin,
  Calendar,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  X,
  Radio,
} from "lucide-react";
import {
  VisitorLog,
  deleteVisitorLogAction,
  clearVisitorLogsAction,
} from "@/actions/network-telemetry";
import { formatDate } from "@/lib/utils";

interface VisitorTelemetryTableProps {
  initialLogs: VisitorLog[];
}

export function VisitorTelemetryTable({ initialLogs }: VisitorTelemetryTableProps) {
  const [logs, setLogs] = useState<VisitorLog[]>(initialLogs);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Extract unique available dates (YYYY-MM-DD) from logs for the dropdown
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    logs.forEach((log) => {
      try {
        const d = new Date(log.visitedAt).toISOString().split("T")[0];
        dates.add(d);
      } catch {}
    });
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [logs]);

  // Filter logs by date and search
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.visitedAt).toISOString().split("T")[0];
      const matchDate = dateFilter === "all" || logDate === dateFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.ip.toLowerCase().includes(q) ||
        log.city.toLowerCase().includes(q) ||
        log.country.toLowerCase().includes(q) ||
        log.path.toLowerCase().includes(q) ||
        (log.org && log.org.toLowerCase().includes(q));
      return matchDate && matchSearch;
    });
  }, [logs, dateFilter, searchQuery]);

  const handleDeleteSingle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visitor telemetry packet?")) return;
    setIsDeleting(id);
    try {
      const res = await deleteVisitorLogAction(id);
      if (res.success) {
        setLogs((prev) => prev.filter((item) => item.id !== id));
        setNotice("Packet deleted successfully.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch {
      alert("Failed to delete packet.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearFilteredOrAll = async () => {
    const msg =
      dateFilter === "all"
        ? "Purge ALL recorded visitor logs? This cannot be undone."
        : `Purge all visitor logs recorded on date: ${dateFilter}?`;
    if (!confirm(msg)) return;

    setIsClearing(true);
    try {
      const res = await clearVisitorLogsAction(dateFilter);
      if (res.success) {
        if (dateFilter === "all") {
          setLogs([]);
        } else {
          setLogs((prev) =>
            prev.filter(
              (item) => new Date(item.visitedAt).toISOString().split("T")[0] !== dateFilter
            )
          );
        }
        setNotice("Logs cleared successfully.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch {
      alert("Failed to clear logs.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div
      className="p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(14, 14, 52, 0.95) 0%, rgba(20, 20, 68, 0.90) 100%)",
        border: "1px solid rgba(34, 211, 238, 0.3)",
      }}
    >
      {/* Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Network className="w-4 h-4" />
            </div>
            <h2 className="font-heading text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Network Security Engineer — Live Traffic &amp; Visitor Telemetry</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 animate-pulse">
                LIVE PACKET STREAM
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Real-time inbound packet inspection: client IP addresses, geo-locations, Autonomous System Numbers (ASN), and target paths.
          </p>
        </div>

        {/* Date Filter & Clear Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {notice && (
            <div className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
              {notice}
            </div>
          )}

          {/* Date Selector */}
          <div className="flex items-center space-x-1.5 bg-[#090924] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#0e0e34]">All Dates ({logs.length})</option>
              {availableDates.map((date) => (
                <option key={date} value={date} className="bg-[#0e0e34]">
                  {date}
                </option>
              ))}
            </select>
          </div>

          {/* Purge / Delete Button */}
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleClearFilteredOrAll}
              disabled={isClearing}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Delete all logs matching the filter"
            >
              {isClearing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>{dateFilter === "all" ? "Purge All Logs" : `Delete ${dateFilter}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IP, location, ISP or visited path..."
            className="w-full bg-[#090924] border border-purple-500/30 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Showing:</span>
          <span className="text-cyan-300 font-bold">{filteredLogs.length}</span>
          <span>of {logs.length} packet probes</span>
        </div>
      </div>

      {/* Telemetry Stream Table */}
      <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#090924]/80">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-purple-500/20 bg-[#141444]/60 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Visitor Node (IP)</th>
              <th className="py-3 px-4">Geographic Location</th>
              <th className="py-3 px-4">Network ISP / ASN</th>
              <th className="py-3 px-4">Target Path</th>
              <th className="py-3 px-4">Packet Timestamp</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                  No telemetry packets match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((vis) => (
                <tr key={vis.id} className="hover:bg-cyan-500/5 transition-colors group">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow" />
                      <span>{vis.ip}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>
                        {vis.city}, {vis.country}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                      {vis.org || vis.asn}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {vis.path}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {formatDate(vis.visitedAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(vis.id)}
                      disabled={isDeleting === vis.id}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete this packet record"
                    >
                      {isDeleting === vis.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

