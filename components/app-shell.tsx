'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronRight, FileText, Landmark, List, Menu, Search, SlidersHorizontal, Wallet, X } from 'lucide-react'

const menuItems = [
  { label: 'Administración de Límites Financieros', icon: List },
  { label: 'Administración', icon: SlidersHorizontal },
  { label: 'Anulaciones', icon: X },
  { label: 'Cupos', icon: List },
  { label: 'Datos Maestros', icon: SlidersHorizontal },
  { label: 'Finanzas', icon: Landmark },
  { label: 'Informes', icon: FileText },
  { label: 'Liquidaciones / Comisiones', icon: SlidersHorizontal },
  { label: 'Precios', icon: Wallet },
]

const slItems: { label: string; href?: string }[] = [
  { label: 'Envíos', href: '/' },
  { label: 'Envíos - Multiremesa', href: '/envios-multiremesa' },
  { label: 'Pagos' },
  { label: 'Release' },
  { label: 'S&P' },
]

export function AppToolbar() {
  return (
    <header className="flex h-[74px] items-center justify-between bg-[#503F93] px-6 text-white sm:px-10 lg:px-12">
      <div className="flex items-center gap-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE500] text-lg font-black text-[#503F93]" aria-label="Logo">A</div>
        <div className="flex items-center gap-5 rounded-full bg-white px-4 py-2 text-xs text-[#263653] shadow-sm">
          <span><strong>Agente:</strong> JoacoDev</span>
          <span><strong>Perfil:</strong> Desarrollo - Super Usuario - BO</span>
          <span><strong>Agencia:</strong> #1939 TEST</span>
          <span><strong>Caja:</strong> 1</span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative text-white/80">
          <Bell className="h-5 w-5" aria-label="Notificaciones" />
          <span className="absolute -right-2 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFE500] px-1 text-[10px] font-bold text-[#503F93]">11</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE500] font-bold text-[#503F93]" aria-label="Usuario">J</div>
      </div>
    </header>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const subItemClass = (active: boolean) =>
    `flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#f5f7ff] ${active ? 'bg-[#f5f7ff] font-bold text-[#17233f]' : 'text-[#7d88a0]'}`

  return (
    <aside aria-label="Menú principal" className="hidden h-full w-[300px] shrink-0 overflow-y-auto rounded-[18px] bg-white p-4 shadow-[0_12px_35px_rgba(24,37,73,0.05)] lg:block">
      <label className="relative block">
        <span className="sr-only">Buscar</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa5b8]" aria-hidden="true" />
        <input type="search" placeholder="Buscar" className="h-11 w-full rounded-lg border border-[#cdd5e1] bg-[#fbfcfe] pl-10 pr-3 text-sm font-semibold text-[#263653] outline-none placeholder:text-[#a2adbf] focus:border-[#5368c8]" />
      </label>
      <nav className="mt-4 flex flex-col gap-1">
        {menuItems.map(({ label, icon: Icon }) => (
          <button key={label} type="button" className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] text-[#66718a] hover:bg-[#f5f7ff]">
            <Icon className="h-5 w-5 shrink-0 text-[#7d88a0]" aria-hidden="true" />
            <span className="flex-1 leading-5">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#a8b1c1]" aria-hidden="true" />
          </button>
        ))}
        <div className="mt-2">
          <button type="button" aria-expanded="true" className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] font-bold text-[#17233f] hover:bg-[#f5f7ff]">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            <span className="flex-1">S&L</span>
            <ChevronRight className="h-4 w-4 rotate-90" aria-hidden="true" />
          </button>
          <div className="ml-8 border-l border-[#dce3ee] pl-4">
            {slItems.map(({ label, href }) => {
              const active = href === pathname
              if (!href) {
                return (
                  <button key={label} type="button" className={subItemClass(false)}>
                    <Menu className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                )
              }
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={active ? (event) => { event.preventDefault(); window.location.reload() } : undefined}
                  className={subItemClass(active)}
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
        <button type="button" className="mt-2 flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] text-[#66718a] hover:bg-[#f5f7ff]">
          <Wallet className="h-5 w-5" aria-hidden="true" />
          <span className="flex-1">Turnero</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] text-[#66718a] hover:bg-[#f5f7ff]">
          <Wallet className="h-5 w-5" aria-hidden="true" />
          <span className="flex-1">Wallets</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </nav>
    </aside>
  )
}
