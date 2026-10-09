import { Bell } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex h-[4.625rem] items-center justify-between bg-[#503F93] px-6 text-white sm:px-10 lg:px-12">
      <div className="flex items-center gap-5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE500] text-lg font-black text-[#503F93]"
          aria-label="Logo"
        >
          <img src="/icon.svg" alt="Logo" />
        </div>
        <div className="flex items-center gap-5 rounded-full bg-white px-4 py-2 text-xs text-[#263653] shadow-sm">
          <span>
            <strong>Agente:</strong> JoacoDev
          </span>
          <span>
            <strong>Perfil:</strong> Desarrollo - Super Usuario - BO
          </span>
          <span>
            <strong>Agencia:</strong> #1939 TEST
          </span>
          <span>
            <strong>Caja:</strong> 1
          </span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative text-white/80">
          <Bell className="h-5 w-5" aria-label="Notificaciones" />
          <span className="absolute -right-2 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFE500] px-1 text-[0.625rem] font-bold text-[#503F93]">
            11
          </span>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE500] font-bold text-[#503F93]"
          aria-label="Usuario"
        >
          J
        </div>
      </div>
    </header>
  );
}
