"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftToLine,
  Bell,
  Ellipsis,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type ColorTheme = "light" | "dark";

const ROUTE_LABELS: Record<string, string> = {
  "/remittences": "Envíos",
  "/payments": "Pagos",
};

export function AppHeader({
  sidebarExpanded,
  onToggleSidebar,
}: {
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}) {
  const { pathname } = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ColorTheme>("light");
  const notificationsRoot = useRef<HTMLDivElement>(null);
  const userMenuRoot = useRef<HTMLDivElement>(null);
  const routeLabel = ROUTE_LABELS[pathname];
  if (!routeLabel) {
    throw new Error(`Missing route label for pathname: ${pathname}`);
  }

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored !== "light" && stored !== "dark") return;
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
    document.documentElement.classList.toggle("light", stored === "light");
  }, []);

  useEffect(() => {
    if (!notificationsOpen && !userMenuOpen) return;
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (notificationsRoot.current?.contains(target)) return;
      if (userMenuRoot.current?.contains(target)) return;
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    };
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [notificationsOpen, userMenuOpen]);

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
            <ArrowLeftToLine className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
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
              to="/remittences"
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
              {routeLabel}
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

          <button
            type="button"
            className="private-nav-button"
            aria-label={
              theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
            aria-pressed={theme === "dark"}
            onClick={() => {
              const nextTheme: ColorTheme =
                theme === "dark" ? "light" : "dark";
              setTheme(nextTheme);
              document.documentElement.classList.toggle(
                "dark",
                nextTheme === "dark",
              );
              document.documentElement.classList.toggle(
                "light",
                nextTheme === "light",
              );
              window.localStorage.setItem("theme", nextTheme);
            }}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
            ) : (
              <Moon className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
            )}
          </button>

          <div className="relative" ref={notificationsRoot}>
            <button
              type="button"
              className="private-nav-button relative"
              aria-label="Notificaciones"
              aria-haspopup="dialog"
              aria-controls="private-notifications-panel"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setUserMenuOpen(false);
                setNotificationsOpen((open) => !open);
              }}
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

          <div className="relative" ref={userMenuRoot}>
            <button
              type="button"
              className="private-nav-button"
              aria-label="Menú de usuario"
              aria-haspopup="dialog"
              aria-controls="private-user-menu-panel"
              aria-expanded={userMenuOpen}
              onClick={() => {
                setNotificationsOpen(false);
                setUserMenuOpen((open) => !open);
              }}
            >
              <User className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
            </button>
            {userMenuOpen && (
              <div
                id="private-user-menu-panel"
                className="absolute top-[calc(100%+0.55rem)] right-0 z-60 w-[18rem] rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_10px_15px_-3px_rgb(15_23_42_/_0.12),0_4px_6px_-4px_rgb(15_23_42_/_0.08)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="private-user-menu-heading"
              >
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e8d5c4] text-[#a67c52]"
                    aria-hidden="true"
                  >
                    <User className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="private-user-menu-heading"
                      className="truncate text-sm font-semibold"
                    >
                      JoacoDev - Agente
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                      joaquin@dev.com
                    </p>
                  </div>
                </div>

                <div className="border-b border-border p-1.5">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[#e8f5e9] text-[#66bb6a]">
                      <Ellipsis className="h-4 w-4" aria-hidden="true" />
                    </span>
                    Cambiar contraseña
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[#f3e5f5] text-[#ab47bc]">
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    Cambiar foto de perfil
                  </button>
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[#eceff1] text-[#78909c]">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                    </span>
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
