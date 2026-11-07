"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Layers,
  Wrench,
  Briefcase,
  History,
  Award,
  BookOpen,
  Building2,
  FlaskConical,
  FileText,
  UserCheck,
  Mail,
  User,
  Settings,
  ShieldCheck,
  ExternalLink,
  Cpu,
  Database,
  Users,
  ChevronRight,
  Home,
  Sparkles,
  PanelTop,
  Sliders,
  Images,
  Bot,
  Server,
  Radio,
} from "lucide-react";
import { AdminSidebarItemConfig, defaultSidebarItems } from "@/lib/admin-sidebar-config";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Images,
  Bot,
  Server,
  Radio,
  Home,
  PanelTop,
  Sliders,
  FolderGit2,
  Layers,
  History,
  Wrench,
  Briefcase,
  BookOpen,
  UserCheck,
  Award,
  Building2,
  FlaskConical,
  FileText,
  Mail,
  User,
  Cpu,
  Users,
  Settings,
  Database,
};

interface AdminSidebarProps {
  adminName?: string;
  adminTagline?: string;
  adminLogo?: string;
  sidebarItems?: AdminSidebarItemConfig[];
  onClose?: () => void;
}

export function AdminSidebar({
  adminName = "Admin CMS",
  adminTagline = "v1.0 Suite",
  adminLogo = "",
  sidebarItems,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const itemsToRender = (sidebarItems && sidebarItems.length > 0 ? sidebarItems : defaultSidebarItems).filter(
    (item) => item.visible !== false
  );

  return (
    <aside className="w-64 sm:w-72 lg:w-64 shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0b0b2a 0%, #0e0e34 100%)",
        borderRight: "1px solid rgba(139, 92, 246, 0.2)",
      }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(139, 92, 246, 0.15)" }}
      >
        <Link href="/admin/dashboard" onClick={onClose} className="flex items-center space-x-3 min-w-0 group">
          {adminLogo ? (
            <img
              src={adminLogo}
              alt={adminName}
              className="w-9 h-9 rounded-xl object-cover border border-purple-500/40 shrink-0 shadow-lg shadow-purple-500/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight text-white block truncate">
              {adminName}
            </span>
            <span className="block text-[10px] text-purple-400 uppercase tracking-widest font-semibold truncate">
              {adminTagline}
            </span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180 text-purple-400" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {itemsToRender.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
          const Icon = ICON_MAP[item.iconName] || Layers;
          return (
            <Link
              key={item.key || item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                isActive
                  ? "text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)",
                      border: "1px solid rgba(139, 92, 246, 0.35)",
                      boxShadow: "0 0 20px -5px rgba(139, 92, 246, 0.3)",
                    }
                  : {
                      background: "transparent",
                      border: "1px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.08)";
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(139, 92, 246, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.border = "1px solid transparent";
                }
              }}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-purple-400 to-indigo-400" />
              )}

              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive
                    ? "bg-purple-500/20 border border-purple-500/40"
                    : `${item.bg} border ${item.border}`
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-purple-300" : item.color}`} />
              </div>
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-purple-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 shrink-0 space-y-2" style={{ borderTop: "1px solid rgba(139, 92, 246, 0.15)" }}>
        <Link
          href="/admin/sidebar"
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-medium transition-all group"
          style={{
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            color: "#c4b5fd",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.16)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(139, 92, 246, 0.45)";
            (e.currentTarget as HTMLElement).style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.08)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(139, 92, 246, 0.25)";
            (e.currentTarget as HTMLElement).style.color = "#c4b5fd";
          }}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Manage Sidebar Order</span>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all group"
          style={{
            background: "rgba(34, 211, 238, 0.07)",
            border: "1px solid rgba(34, 211, 238, 0.2)",
            color: "#94a3b8",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(34, 211, 238, 0.12)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(34, 211, 238, 0.35)";
            (e.currentTarget as HTMLElement).style.color = "#22d3ee";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(34, 211, 238, 0.07)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(34, 211, 238, 0.2)";
            (e.currentTarget as HTMLElement).style.color = "#94a3b8";
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
