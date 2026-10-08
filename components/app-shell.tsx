import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex h-[calc(100vh-74px)] min-h-0 gap-6 overflow-hidden bg-[#F2F2F9] px-4 py-5 text-[#17233f] sm:px-8 lg:px-12">
        <AppSidebar />
        {children}
      </main>
    </>
  );
}
