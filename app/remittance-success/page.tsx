'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const operationNumber = 'RIA-20261008-018'

export default function RemittanceSuccessPage() {
  const router = useRouter()
  const [showReceipt, setShowReceipt] = useState(false)

  function downloadReceipt() {
    const receipt = `Comprobante de remesa\nOperación: ${operationNumber}\nTotal enviado: 18,01 USD`
    const url = URL.createObjectURL(new Blob([receipt], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${operationNumber}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  function printReceipt() {
    window.print()
  }

  return (
    <main className="min-h-screen bg-[#f4f5fb] px-4 py-5 text-[#17233f] sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[980px] items-center justify-center rounded-[18px] bg-white p-6 shadow-[0_12px_35px_rgba(24,37,73,0.05)] sm:p-12">
        <div className="flex w-full max-w-[620px] flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e1f7e9] text-4xl font-bold text-[#218052]" aria-hidden="true">✓</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#218052]">Envío confirmado</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-[#17233f]">La remesa fue enviada correctamente</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#687790]">Entrega este número al cliente: el beneficiario lo necesita para cobrar.</p>
          <div className="mt-8 w-full max-w-md rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5 text-left">
            <div className="flex items-center justify-between border-b border-[#e4e8ef] pb-4">
              <span className="text-sm text-[#73809a]">Número de operación</span>
              <strong className="font-mono text-xl text-[#17233f]">RIA-20261008-018</strong>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-[#73809a]">Total enviado</span>
              <strong className="text-lg text-[#465bc2]">18,01 USD</strong>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setShowReceipt((visible) => !visible)} className="rounded-full border border-[#dce3ee] px-5 py-3 text-sm font-bold text-[#17233f] transition-colors hover:border-[#465bc2] hover:text-[#465bc2]">Ver comprobantes</button>
            <button type="button" onClick={printReceipt} className="rounded-full border border-[#dce3ee] px-5 py-3 text-sm font-bold text-[#17233f] transition-colors hover:border-[#465bc2] hover:text-[#465bc2]">Imprimir</button>
            <button type="button" onClick={downloadReceipt} className="rounded-full border border-[#dce3ee] px-5 py-3 text-sm font-bold text-[#17233f] transition-colors hover:border-[#465bc2] hover:text-[#465bc2]">Descargar</button>
          </div>
          {showReceipt && <div className="mt-5 w-full max-w-md rounded-xl border border-[#dce3ee] bg-white p-5 text-left text-sm"><h2 className="font-bold text-[#17233f]">Comprobante de remesa</h2><p className="mt-2 text-[#687790]">Operación: <span className="font-mono text-[#17233f]">{operationNumber}</span></p><p className="mt-1 text-[#687790]">Estado: <span className="font-semibold text-[#218052]">Completada</span></p></div>}
          <button type="button" onClick={() => router.push('/')} className="mt-8 rounded-lg bg-[#465bc2] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#394ba9]">Nueva transacción</button>
        </div>
      </section>
    </main>
  )
}
