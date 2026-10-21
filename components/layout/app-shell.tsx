"use client";

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { DemoQuoteLayoutContext } from "@/components/layout/demo-quote-layout";

export function AppShell() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [partiesAboveShipping, setPartiesAboveShipping] = useState(false);
  const { pathname } = useLocation();
  const demoQuoteLayout: DemoQuoteLayoutContext = {
    partiesAboveShipping,
    setPartiesAboveShipping,
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <AppHeader
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((current) => !current)}
        partiesAboveShipping={partiesAboveShipping}
        onPartiesAboveShippingChange={setPartiesAboveShipping}
      />
      <div className="private-chrome private-h-screen flex w-full min-w-0">
        <AppSidebar expanded={sidebarExpanded} />
        <main className="private-content-shell relative z-0 flex min-h-0 min-w-0 flex-1 flex-col p-6 text-foreground">
          <div
            key={pathname}
            className="route-fade flex min-h-0 min-w-0 flex-1 flex-col"
          >
            <Outlet context={demoQuoteLayout} />
          </div>
        </main>
      </div>
    </div>
  );
}
