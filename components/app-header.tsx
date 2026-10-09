import { Bell, Menu, X } from "lucide-react";

export function AppHeader({
  sidebarExpanded,
  onToggleSidebar,
}: {
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="flex h-[var(--app-header-height)] items-center justify-between bg-[#503F93] px-3 text-white sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarExpanded ? "Contraer menú" : "Expandir menú"}
          aria-expanded={sidebarExpanded}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
        >
          {sidebarExpanded ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFE500] text-sm font-black text-[#503F93]"
          aria-label="Logo"
        >
          <img src="/icon.svg" alt="Logo" className="h-4 w-4" />
        </div>
        <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-full bg-white px-3 py-1 text-[0.6875rem] text-[#263653] shadow-sm sm:gap-3 sm:text-xs">
          <span className="truncate">
            <strong>Agente:</strong> JoacoDev
          </span>
          <span className="hidden truncate md:inline">
            <strong>Perfil:</strong> Desarrollo - Super Usuario - BO
          </span>
          <span className="truncate">
            <strong>Agencia:</strong> #1939 TEST
          </span>
          <span className="shrink-0">
            <strong>Caja:</strong> 1
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="relative text-white/80">
          <Bell className="h-4 w-4" aria-label="Notificaciones" />
          <span className="absolute -right-2 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFE500] px-1 text-[0.625rem] font-bold text-[#503F93]">
            11
          </span>
        </div>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE500] text-sm font-bold text-[#503F93]"
          aria-label="Usuario"
        >
          J
        </div>
      </div>
    </header>
  );
}
