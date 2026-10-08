'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Download, Eye, Printer, RotateCcw, Users } from 'lucide-react'

type RemittanceSuccessProps = {
  operationNumber: string
  totalSent: string
  onNewTransaction: () => void
  onRepeatClient: () => void
  onSameBeneficiary: () => void
}

const secondaryButton = 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#dce3ee] px-5 py-3 text-sm font-bold text-[#17233f] transition-colors hover:border-[#465bc2] hover:text-[#465bc2] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5368c8]/20'

export function RemittanceSuccess({ operationNumber, totalSent, onNewTransaction, onRepeatClient, onSameBeneficiary }: RemittanceSuccessProps) {
  const newTransactionRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    window.requestAnimationFrame(() => newTransactionRef.current?.focus())
  }, [])

  async function copyOperationNumber() {
    await navigator.clipboard?.writeText(operationNumber)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6 sm:p-12">
      <div className="flex w-full max-w-[620px] flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e1f7e9] text-[#218052]" aria-hidden="true"><Check className="h-9 w-9" strokeWidth={2.5} /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#218052]">Envío confirmado</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.02em] text-[#17233f]">La remesa fue enviada correctamente</h1>
        <p className="mt-3 max-w-lg text-pretty text-sm leading-6 text-[#687790]">Entrega este número al cliente: el beneficiario lo necesita para cobrar.</p>

        <dl className="mt-8 w-full max-w-md rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5 text-left">
          <div className="flex items-center justify-between gap-4 border-b border-[#e4e8ef] pb-4">
            <dt className="text-sm text-[#73809a]">Número de operación</dt>
            <dd className="flex items-center gap-2">
              <strong className="font-mono text-xl text-[#17233f]">{operationNumber}</strong>
              <button type="button" onClick={copyOperationNumber} aria-label={copied ? 'Número copiado' : 'Copiar número de operación'} className="cursor-pointer rounded-md p-2 text-[#465bc2] hover:bg-[#eef0ff] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5368c8]/20">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <dt className="text-sm text-[#73809a]">Total enviado</dt>
            <dd className="text-lg font-bold tabular-nums text-[#465bc2]">{totalSent}</dd>
          </div>
        </dl>
        <p role="status" aria-live="polite" className="sr-only">{copied ? 'Número de operación copiado' : ''}</p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" className={secondaryButton}><Eye className="h-4 w-4" aria-hidden="true" />Ver comprobantes</button>
          <button type="button" onClick={() => window.print()} className={secondaryButton}><Printer className="h-4 w-4" aria-hidden="true" />Imprimir</button>
          <button type="button" className={secondaryButton}><Download className="h-4 w-4" aria-hidden="true" />Descargar</button>
        </div>
        <button type="button" className={`mt-4 bg-[#f8f9fc] ${secondaryButton}`}><Download className="h-4 w-4" aria-hidden="true" />Descargar factura electrónica</button>

        <div className="mt-8 flex w-full flex-col items-center gap-4 border-t border-[#dce3ee] pt-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onRepeatClient} className={secondaryButton}><Users className="h-4 w-4" aria-hidden="true" />Repetir con el mismo cliente</button>
            <button type="button" onClick={onSameBeneficiary} className={secondaryButton}><Users className="h-4 w-4" aria-hidden="true" />Mismo beneficiario</button>
          </div>
          <button type="button" ref={newTransactionRef} onClick={onNewTransaction} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#465bc2] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#394ba9] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5368c8]/30"><RotateCcw className="h-4 w-4" aria-hidden="true" />Nueva transacción</button>
        </div>
      </div>
    </div>
  )
}
