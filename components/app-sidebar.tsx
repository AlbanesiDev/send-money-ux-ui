"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  FileText,
  Landmark,
  List,
  Menu,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Administración de Límites Financieros", icon: List },
  { label: "Administración", icon: SlidersHorizontal },
  { label: "Anulaciones", icon: X },
  { label: "Cupos", icon: List },
  { label: "Datos Maestros", icon: SlidersHorizontal },
  { label: "Finanzas", icon: Landmark },
  { label: "Informes", icon: FileText },
  { label: "Liquidaciones / Comisiones", icon: SlidersHorizontal },
  { label: "Precios", icon: Wallet },
];

const slItems: { label: string; href?: string }[] = [
  { label: "Envíos", href: "/" },
  { label: "Pagos" },
  { label: "Release" },
  { label: "S&P" },
];

export function AppSidebar({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const subItemClass = (active: boolean) =>
    `flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[#f5f7ff] ${active ? "bg-[#f5f7ff] font-bold text-[#17233f]" : "text-[#7d88a0]"}`;

  return (
    <aside
      aria-label="Menú principal"
      aria-expanded={expanded}
      className={`hidden h-full shrink-0 overflow-x-hidden overflow-y-auto rounded-[14px] bg-white shadow-[0_12px_35px_rgba(24,37,73,0.05)] transition-[width] duration-300 ease-out lg:block ${
        expanded
          ? "w-[var(--app-sidebar-width)] p-3"
          : "w-[var(--app-sidebar-width-collapsed)] p-2"
      }`}
    >
      {expanded ? (
        <label className="relative block">
          <span className="sr-only">Buscar</span>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa5b8]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar"
            className="h-9 w-full rounded-lg border border-[#cdd5e1] bg-[#fbfcfe] pl-8 pr-2 text-sm font-semibold text-[#263653] outline-none placeholder:text-[#a2adbf] focus:border-[#5368c8]"
          />
        </label>
      ) : (
        <div
          className="flex h-9 items-center justify-center text-[#9aa5b8]"
          title="Buscar"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Buscar</span>
        </div>
      )}
      <nav className={`mt-3 flex flex-col gap-0.5 ${expanded ? "" : "items-center"}`}>
        {menuItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            className={`flex cursor-pointer items-center rounded-lg text-left text-sm text-[#66718a] hover:bg-[#f5f7ff] ${
              expanded
                ? "w-full gap-3 px-2.5 py-2"
                : "h-9 w-9 justify-center"
            }`}
          >
            <Icon
              className="h-4 w-4 shrink-0 text-[#7d88a0]"
              aria-hidden="true"
            />
            {expanded && (
              <>
                <span className="flex-1 leading-4">{label}</span>
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-[#a8b1c1]"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        ))}
        <div className={`mt-1 ${expanded ? "" : "flex flex-col items-center"}`}>
          <button
            type="button"
            aria-expanded={expanded}
            title="S&L"
            aria-label="S&L"
            className={`flex cursor-pointer items-center rounded-lg text-left text-sm font-bold text-[#17233f] hover:bg-[#f5f7ff] ${
              expanded
                ? "w-full gap-3 px-2.5 py-2"
                : "h-9 w-9 justify-center"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {expanded && (
              <>
                <span className="flex-1">S&L</span>
                <ChevronRight
                  className="h-3.5 w-3.5 rotate-90"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
          {expanded && (
            <div className="ml-6 border-l border-[#dce3ee] pl-3">
              {slItems.map(({ label, href }) => {
                const active = href === pathname;
                if (!href) {
                  return (
                    <button
                      key={label}
                      type="button"
                      className={subItemClass(false)}
                    >
                      <Menu className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={label}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={
                      active
                        ? (event) => {
                            event.preventDefault();
                            window.location.reload();
                          }
                        : undefined
                    }
                    className={subItemClass(active)}
                  >
                    <Menu className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
          {!expanded && (
            <Link
              href="/"
              title="Envíos"
              aria-label="Envíos"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#f5f7ff] ${
                pathname === "/"
                  ? "bg-[#f5f7ff] text-[#17233f]"
                  : "text-[#7d88a0]"
              }`}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        <button
          type="button"
          title="Turnero"
          aria-label="Turnero"
          className={`mt-1 flex cursor-pointer items-center rounded-lg text-left text-sm text-[#66718a] hover:bg-[#f5f7ff] ${
            expanded ? "w-full gap-3 px-2.5 py-2" : "h-9 w-9 justify-center"
          }`}
        >
          <Wallet className="h-4 w-4" aria-hidden="true" />
          {expanded && <span className="flex-1">Turnero</span>}
          {expanded && (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          title="Wallets"
          aria-label="Wallets"
          className={`flex cursor-pointer items-center rounded-lg text-left text-sm text-[#66718a] hover:bg-[#f5f7ff] ${
            expanded ? "w-full gap-3 px-2.5 py-2" : "h-9 w-9 justify-center"
          }`}
        >
          <Wallet className="h-4 w-4" aria-hidden="true" />
          {expanded && <span className="flex-1">Wallets</span>}
          {expanded && (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </nav>
    </aside>
  );
}
