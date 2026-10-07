'use client'

import { useRef, useState } from 'react'

const steps = [
  'Transacción a realizar',
  'Cotización',
  'Datos Remitente',
  'Datos Beneficiario',
  'Información Adicional',
  'Método de Pago',
  'Visualizar Información',
]

export default function Page() {
  const [documentNumber, setDocumentNumber] = useState('')
  const [result, setResult] = useState<'success' | 'empty' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const continueButtonRef = useRef<HTMLButtonElement>(null)

  function searchClient() {
    const value = documentNumber.trim()
    if (!value || isLoading) return

    setIsLoading(true)
    setResult(null)
    window.setTimeout(() => {
      const found = value === '7807365'
      setResult(found ? 'success' : 'empty')
      setIsLoading(false)
      window.setTimeout(() => continueButtonRef.current?.focus(), 0)
    }, 650)
  }

  return (
    <main className="min-h-screen bg-[#f4f5fb] px-4 py-5 text-[#17233f] sm:px-8 lg:px-12">
      <section className="mx-auto max-w-[1540px] overflow-hidden rounded-[18px] bg-white shadow-[0_12px_35px_rgba(24,37,73,0.05)]">
        <nav aria-label="Progreso de la transacción" className="overflow-x-auto border-b border-[#e9edf5] px-6 py-6 sm:px-10 lg:px-12">
          <ol className="flex min-w-[900px] items-center gap-3 text-[12px] font-medium text-[#96a2b8]">
            {steps.map((step, index) => (
              <li key={step} className="flex flex-1 items-center gap-3 whitespace-nowrap last:flex-none">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold ${index === 0 ? 'border-[#17233f] bg-[#17233f] text-white' : 'border-[#dce3ee] bg-white text-[#60718e]'}`} aria-current={index === 0 ? 'step' : undefined}>{index + 1}</span>
                <span className={index === 0 ? 'font-bold text-[#17233f]' : ''}>{step}</span>
                {index < steps.length - 1 && <span className="mx-1 h-px flex-1 bg-[#dfe5ef]" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mx-auto max-w-[680px] px-6 py-10 sm:px-10 sm:py-12">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5368c8]">Paso 1 de 7</p>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#17233f]">Identifica al beneficiario</h1>
            <p className="mt-2 text-sm leading-6 text-[#687790]">Ingresa los datos para buscar un cliente existente antes de continuar.</p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); searchClient() }} className="space-y-5" aria-describedby="form-help">
            <div>
              <label htmlFor="transaction" className="mb-2 block text-sm font-semibold text-[#263653]">Tipo de transacción <span className="text-[#c73750]" aria-hidden="true">*</span></label>
              <select id="transaction" className="h-12 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#263653] outline-none transition focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10" defaultValue="ria">
                <option value="ria">Envío de Remesa RIA - S&amp;L - Bolivia</option>
              </select>
            </div>
            <div>
              <label htmlFor="document-type" className="mb-2 block text-sm font-semibold text-[#263653]">Tipo de documento <span className="text-[#c73750]" aria-hidden="true">*</span></label>
              <select id="document-type" className="h-12 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#263653] outline-none transition focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10" defaultValue="ci">
                <option value="ci">Cédula</option>
              </select>
            </div>
            <div>
              <label htmlFor="document-number" className="mb-2 block text-sm font-semibold text-[#263653]">Número de documento <span className="text-[#c73750]" aria-hidden="true">*</span></label>
              <input id="document-number" inputMode="numeric" autoComplete="off" value={documentNumber} onChange={(event) => { setDocumentNumber(event.target.value.replace(/\D/g, '')); setResult(null) }} placeholder="Ingresa el número de documento" aria-describedby="document-help" className="h-12 w-full rounded-lg border border-[#cdd5e1] px-3 text-sm text-[#263653] outline-none transition placeholder:text-[#a2adbf] focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10" />
              <p id="document-help" className="mt-2 text-xs text-[#7b879b]">Solo números, sin espacios.</p>
            </div>
            <button type="submit" disabled={!documentNumber.trim() || isLoading} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#465bc2] text-sm font-bold text-white transition hover:bg-[#3d50b0] focus:outline-none focus:ring-4 focus:ring-[#465bc2]/20 disabled:cursor-not-allowed disabled:bg-[#b8c1dc]">
              {isLoading ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />Buscando cliente…</> : 'Buscar'}
            </button>
          </form>

          <div className="mt-9 min-h-[164px] border-t border-[#e9edf5] pt-6" aria-live="polite" aria-atomic="true">
            {result === 'success' && <div className="rounded-xl border border-[#cde8db] bg-[#f1faf5] p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#23815d]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#23815d] text-white">✓</span> Cliente encontrado</div>
                  <h2 className="text-xl font-bold text-[#1f6d55]">Eliana Antezana Ovando</h2>
                  <dl className="mt-3 grid gap-1 text-sm text-[#5d7c72]"><div><dt className="inline font-semibold">Documento: </dt><dd className="inline">{documentNumber}</dd></div><div><dt className="inline font-semibold">Correo: </dt><dd className="inline">j***@cislatam.com</dd></div></dl>
                </div>
                <div className="flex shrink-0 gap-3 sm:pt-8"><button type="button" className="rounded-lg border border-[#b8d8c9] bg-white px-4 py-2.5 text-sm font-bold text-[#28694f] focus:outline-none focus:ring-4 focus:ring-[#23815d]/20">Ver perfil</button><button ref={continueButtonRef} type="button" className="rounded-lg bg-[#465bc2] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-[#465bc2]/20">Continuar</button></div>
              </div>
            </div>}
            {result === 'empty' && <div className="rounded-xl border border-[#eadcae] bg-[#fffaf0] p-5"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#9b7214]">Sin coincidencias</div><h2 className="text-base font-bold text-[#5d4b19]">No encontramos un cliente asociado a este documento.</h2><p className="mt-1 text-sm text-[#8a7740]">Puedes registrar un nuevo cliente para continuar.</p></div><div className="flex shrink-0 gap-3"><button type="button" className="rounded-lg bg-[#465bc2] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-[#465bc2]/20">Registrar cliente</button><button ref={continueButtonRef} type="button" className="rounded-lg border border-[#d6c688] bg-white px-4 py-2.5 text-sm font-bold text-[#765d12] focus:outline-none focus:ring-4 focus:ring-[#9b7214]/20">Continuar</button></div></div></div>}
            {!result && !isLoading && <p id="form-help" className="text-center text-sm text-[#98a3b6]">El resultado de la búsqueda aparecerá aquí.</p>}
          </div>
        </div>
      </section>
    </main>
  )
}
