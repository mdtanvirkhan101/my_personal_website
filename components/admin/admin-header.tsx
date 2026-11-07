"use client";

import { logoutAction } from "@/actions/auth";
import { LogOut, UserCircle, Bell, Shield, Menu } from "lucide-react";

interface AdminHeaderProps {
  adminName?: string;
  userSession?: any;
  onToggleMobileMenu?: () => void;
}

export function AdminHeader({
  adminName = "Admin CMS",
  userSession,
  onToggleMobileMenu,
}: AdminHeaderProps) {
  return (
    <header
      className="h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 relative w-full"
      style={{
        background: "rgba(14, 14, 52, 0.95)",
        borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center space-x-2.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-1.5 min-w-0">
          <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-xs font-medium text-slate-400 truncate max-w-[120px] sm:max-w-none">
            {adminName}
          </span>
        </div>
        <span className="text-slate-600 hidden sm:inline">/</span>
        <span className="text-xs font-semibold text-white hidden sm:inline truncate">
          Management Console
        </span>
      </div>

      {/* Right: User Info + Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Notification Bell */}
        <button
          className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-400"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* Admin User Badge */}
        <div
          className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
            <UserCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="hidden sm:flex flex-col min-w-0 max-w-[140px] md:max-w-none">
            <span className="text-[11px] font-medium text-slate-200 leading-tight truncate">
              {userSession?.name || userSession?.email || "admin@example.com"}
            </span>
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider leading-tight">
              {userSession?.role || "ADMIN"}
            </span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase hidden md:inline bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {userSession?.role || "ADMIN"}
          </span>
        </div>

        {/* Logout Button */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center space-x-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
