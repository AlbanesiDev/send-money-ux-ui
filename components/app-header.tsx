"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Home, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";

export function AppHeader({
  sidebarExpanded,
  onToggleSidebar,
}: {
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (notificationsRoot.current?.contains(target)) return;
      setNotificationsOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [notificationsOpen]);

  return (
    <header className="private-chrome private-header-height sticky top-0 z-50 flex items-center">
      <div
        className={`private-header-toggle private-sidebar-rail flex h-full shrink-0 items-center justify-start transition-[width] duration-300 ease-out ${
          sidebarExpanded
            ? "private-sidebar-width"
            : "private-sidebar-width-collapsed"
        }`}
      >
        <button
          type="button"
          className="private-nav-button"
          aria-label={sidebarExpanded ? "Contraer menú" : "Expandir menú"}
          aria-expanded={sidebarExpanded}
          onClick={onToggleSidebar}
        >
          {sidebarExpanded ? (
            <X className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
          ) : (
            <Menu className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-3">
        <div className="flex min-w-0 items-center gap-3">
          <img className="h-7 w-7 shrink-0" src="/icon.svg" alt="" />
          <nav
            className="hidden min-w-0 items-center gap-1 text-sm md:flex"
            aria-label="Miga de pan"
          >
            <Link
              href="/"
              className="inline-flex size-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-50"
              aria-label="Inicio"
            >
              <Home className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
            </Link>
            <span className="text-slate-500" aria-hidden="true">
              /
            </span>
            <span
              className="truncate font-medium text-slate-50"
              aria-current="page"
            >
              Envíos
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="private-operator-status flex items-center justify-center">
            <span
              className="private-status-dot animate-pulse mt-[0.15rem]"
              aria-hidden="true"
            />
            Turno activo
            <strong>·</strong>
            Cis Ariana Mejia
            <strong>·</strong>
            Caja: 1<strong>·</strong>
            Saldo virtual USD: $700,00
            <strong>·</strong>
            Saldo virtual BOB: $6.000,00
          </div>

          <div className="relative" ref={notificationsRoot}>
            <button
              type="button"
              className="private-nav-button relative"
              aria-label="Notificaciones"
              aria-haspopup="dialog"
              aria-controls="private-notifications-panel"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#FFE500]" />
            </button>
            {notificationsOpen && (
              <div
                id="private-notifications-panel"
                className="absolute top-[calc(100%+0.55rem)] right-0 z-60 w-[22rem] rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_10px_15px_-3px_rgb(15_23_42_/_0.12),0_4px_6px_-4px_rgb(15_23_42_/_0.08)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="private-notifications-heading"
              >
                <div className="border-b border-border px-4 py-3">
                  <h2
                    id="private-notifications-heading"
                    className="text-sm font-semibold"
                  >
                    Notificaciones
                  </h2>
                </div>
                <p className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No hay notificaciones
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="private-nav-button"
            aria-label="Cerrar sesión"
          >
            <User className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
