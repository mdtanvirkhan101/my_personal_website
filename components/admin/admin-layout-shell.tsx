"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebarItemConfig } from "@/lib/admin-sidebar-config";

interface AdminLayoutShellProps {
  adminName: string;
  adminTagline: string;
  adminLogo: string;
  sidebarItems: AdminSidebarItemConfig[];
  userSession: any;
  children: React.ReactNode;
}

export function AdminLayoutShell({
  adminName,
  adminTagline,
  adminLogo,
  sidebarItems,
  userSession,
  children,
}: AdminLayoutShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0e0e34] text-slate-100 overflow-x-hidden relative">
      {/* Desktop Sidebar (hidden on mobile/tablet < lg) */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar
          adminName={adminName}
          adminTagline={adminTagline}
          adminLogo={adminLogo}
          sidebarItems={sidebarItems}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          adminName={adminName}
          adminTagline={adminTagline}
          adminLogo={adminLogo}
          sidebarItems={sidebarItems}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <AdminHeader
          adminName={adminName}
          userSession={userSession}
          onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1780px] 2xl:max-w-[1920px] w-full mx-auto overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

