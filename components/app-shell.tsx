"use client";

import { useState, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <>
      <AppHeader
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((current) => !current)}
      />
      <main className="flex h-[calc(100vh-var(--app-header-height))] min-h-0 gap-3 overflow-hidden bg-[#F2F2F9] px-3 py-3 text-[#17233f] sm:px-4 sm:py-3 lg:px-5">
        <AppSidebar expanded={sidebarExpanded} />
        {children}
      </main>
    </>
  );
}
