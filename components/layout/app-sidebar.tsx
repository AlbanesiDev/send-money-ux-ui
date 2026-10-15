"use client";

import { useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRightCircle,
  BadgeDollarSign,
  BadgePercent,
  BanknoteArrowDown,
  BanknoteArrowUp,
  ChevronDown,
  ChevronRight,
  CreditCardPlus,
  Database,
  FileSliders,
  FileText,
  Landmark,
  List,
  RotateCcw,
  ShieldCogCorner,
  SlidersHorizontal,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    icon: FileSliders,
  },
  { key: "admin", label: "Administración", icon: ShieldCogCorner },
  { key: "voids", label: "Anulaciones", icon: RotateCcw },
  { key: "quotas", label: "Cupos", icon: CreditCardPlus },
  { key: "masters", label: "Datos Maestros", icon: Database },
  { key: "finance", label: "Finanzas", icon: Landmark },
  { key: "reports", label: "Informes", icon: FileText },
  {
    key: "settlements",
    label: "Liquidaciones / Comisiones",
    icon: BadgePercent,
  },
  { key: "pricing", label: "Precios", icon: BadgeDollarSign },
  {
    key: "sl",
    label: "Operaciones",
    icon: SlidersHorizontal,
    children: [
      { key: "transfers", label: "Envíos", icon: BanknoteArrowUp, href: "/remittences" },
      { key: "payments", label: "Pagos", icon: BanknoteArrowDown, href: "/payments" },
      { key: "release", label: "Release", icon: List },
      { key: "sp", label: "S&P", icon: List },
    ],
  },
  { key: "queue", label: "Turnero", icon: ArrowRightCircle },
  { key: "wallets", label: "Wallets", icon: Wallet },
];

export function AppSidebar({ expanded }: { expanded: boolean }) {
  const { pathname } = useLocation();

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
      <TooltipProvider delay={300}>
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
                <Tooltip disabled={expanded}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        className={`sidebar-link ${
                          expanded
                            ? "sidebar-link-expanded"
                            : "sidebar-link-collapsed"
                        }`}
                        aria-label={item.label}
                        onClick={
                          hasChildren && expanded
                            ? (event) => toggleGroup(event, item.key)
                            : undefined
                        }
                      />
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
                              <ChevronDown
                                className="size-3"
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronRight
                                className="size-3"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        )}
                      </>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>

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
                          to={child.href}
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
                      <Tooltip key={child.key}>
                        <TooltipTrigger
                          render={
                            <Link
                              to={child.href}
                              aria-label={child.label}
                              aria-current={active ? "page" : undefined}
                              className={`sidebar-link sidebar-link-collapsed ${
                                active ? "sidebar-link-active" : ""
                              }`}
                            />
                          }
                        >
                          <ChildIcon
                            className="sidebar-link-icon"
                            aria-hidden="true"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {child.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
              </div>
            );
          })}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
