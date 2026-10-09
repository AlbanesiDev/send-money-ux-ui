"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Landmark,
  List,
  Send,
  SlidersHorizontal,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

type MenuChild = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
};

type MenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: MenuChild[];
};

const menuItems: MenuItem[] = [
  {
    key: "limits",
    label: "Administración de Límites Financieros",
    icon: List,
  },
  { key: "admin", label: "Administración", icon: SlidersHorizontal },
  { key: "voids", label: "Anulaciones", icon: X },
  { key: "quotas", label: "Cupos", icon: List },
  { key: "masters", label: "Datos Maestros", icon: SlidersHorizontal },
  { key: "finance", label: "Finanzas", icon: Landmark },
  { key: "reports", label: "Informes", icon: FileText },
  {
    key: "settlements",
    label: "Liquidaciones / Comisiones",
    icon: SlidersHorizontal,
  },
  { key: "pricing", label: "Precios", icon: Wallet },
  {
    key: "sl",
    label: "S&L",
    icon: SlidersHorizontal,
    children: [
      { key: "transfers", label: "Envíos", icon: Send, href: "/" },
      { key: "payments", label: "Pagos", icon: Wallet },
      { key: "release", label: "Release", icon: List },
      { key: "sp", label: "S&P", icon: List },
    ],
  },
  { key: "queue", label: "Turnero", icon: Wallet },
  { key: "wallets", label: "Wallets", icon: Wallet },
];

export function AppSidebar({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(["sl"]),
  );

  const isGroupOpen = (key: string) => openGroups.has(key);

  const toggleGroup = (event: MouseEvent<HTMLButtonElement>, key: string) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
        return next;
      }
      next.add(key);
      return next;
    });
  };

  return (
    <aside
      className={`private-chrome private-sidebar private-h-screen relative z-10 shrink-0 transition-[width] duration-300 ease-out ${
        expanded ? "private-sidebar-width" : "private-sidebar-width-collapsed"
      }`}
      aria-expanded={expanded}
      aria-label="Menú principal"
    >
      <nav
        className={`sidebar-nav flex h-full flex-col gap-1 overflow-x-hidden overflow-y-auto py-4 ${
          expanded ? "private-sidebar-rail-expanded" : "private-sidebar-rail"
        }`}
        aria-label="Navegación del dashboard"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.children?.length);
          const groupOpen = isGroupOpen(item.key);

          return (
            <div key={item.key} className="flex flex-col gap-1">
              <button
                type="button"
                className={`sidebar-link ${
                  expanded ? "sidebar-link-expanded" : "sidebar-link-collapsed"
                }`}
                title={expanded ? undefined : item.label}
                aria-label={item.label}
                onClick={
                  hasChildren && expanded
                    ? (event) => toggleGroup(event, item.key)
                    : undefined
                }
              >
                <Icon className="sidebar-link-icon" aria-hidden="true" />
                {expanded && (
                  <>
                    <span className="sidebar-link-label">{item.label}</span>
                    {hasChildren && (
                      <span
                        className="sidebar-chevron"
                        aria-expanded={groupOpen}
                        aria-label={`Expandir ${item.label}`}
                      >
                        {groupOpen ? (
                          <ChevronDown className="size-3" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="size-3" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </>
                )}
              </button>

              {expanded && hasChildren && groupOpen && (
                <div className="ml-3 flex flex-col gap-1 border-l border-white/10 pl-2">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const active = child.href === pathname;
                    const childClass = `sidebar-link sidebar-link-child sidebar-link-expanded ${
                      active ? "sidebar-link-active" : ""
                    }`;

                    if (!child.href) {
                      return (
                        <button
                          key={child.key}
                          type="button"
                          className={childClass}
                        >
                          <ChildIcon
                            className="sidebar-link-icon"
                            aria-hidden="true"
                          />
                          <span className="sidebar-link-label">
                            {child.label}
                          </span>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={child.key}
                        href={child.href}
                        aria-current={active ? "page" : undefined}
                        onClick={
                          active
                            ? (event) => {
                                event.preventDefault();
                                window.location.reload();
                              }
                            : undefined
                        }
                        className={childClass}
                      >
                        <ChildIcon
                          className="sidebar-link-icon"
                          aria-hidden="true"
                        />
                        <span className="sidebar-link-label">
                          {child.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {!expanded &&
                item.key === "sl" &&
                item.children?.map((child) => {
                  if (!child.href) return null;
                  const ChildIcon = child.icon;
                  const active = child.href === pathname;
                  return (
                    <Link
                      key={child.key}
                      href={child.href}
                      title={child.label}
                      aria-label={child.label}
                      aria-current={active ? "page" : undefined}
                      className={`sidebar-link sidebar-link-collapsed ${
                        active ? "sidebar-link-active" : ""
                      }`}
                    >
                      <ChildIcon
                        className="sidebar-link-icon"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
