import type { Metadata } from 'next'
import { AppSidebar, AppToolbar } from '@/components/app-shell'
import { MultiRemittanceForm } from '@/components/multi-remittance-form'

export const metadata: Metadata = {
  title: 'Envíos - Multiremesa',
  description: 'Envío de varias remesas de un mismo remitente en una sola operación de caja',
}

export default function MultiRemittancePage() {
  return (
    <>
      <AppToolbar />
      <main className="flex h-[calc(100vh-74px)] min-h-0 gap-6 overflow-hidden bg-[#F2F2F9] px-4 py-5 text-[#17233f] sm:px-8 lg:px-12">
        <AppSidebar />
        <section className="mx-auto flex min-h-0 min-w-0 max-w-[1540px] flex-1 flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_12px_35px_rgba(24,37,73,0.05)]">
          <MultiRemittanceForm />
        </section>
      </main>
    </>
  )
}
