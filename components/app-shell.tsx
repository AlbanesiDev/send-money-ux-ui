"use client";

import { useState, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <AppHeader
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((current) => !current)}
      />
      <div className="private-chrome private-h-screen flex w-full min-w-0">
        <AppSidebar expanded={sidebarExpanded} />
        <main className="private-content-shell relative z-0 flex min-h-0 min-w-0 flex-1 flex-col p-6 text-[#17233f]">
          {children}
        </main>
      </div>
    </div>
  );
}
