'use client'

import { useId, useState, type FormEvent } from 'react'
import { CheckCircle2, Plus, Search, Trash2 } from 'lucide-react'
import countriesCatalog from '../public/catalog-countries.json'

const countryOptions = Array.from(
  new Set(countriesCatalog.result.items.filter((item) => item.country.ctyActive).map((item) => item.country.ctyName.trim()).filter(Boolean)),
).sort((a, b) => a.localeCompare(b, 'es'))

const FEE_PER_REMITTANCE = 5
const TAX_RATE = 0.182
const MAX_BENEFICIARIES = 10

const usdFormatter = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatUsd = (value: number) => `${usdFormatter.format(value)} USD`

type Beneficiary = { id: number; name: string; country: string; amount: string }

const inputClass =
  'h-11 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm font-semibold text-[#263653] outline-none placeholder:font-normal placeholder:text-[#a2adbf] focus:border-[#5368c8] focus:ring-2 focus:ring-[#5368c8]/20 disabled:bg-[#f4f6fa]'
const labelClass = 'whitespace-nowrap text-xs font-semibold text-[#66718a]'

const sanitizeAmount = (value: string) => {
  const [integerPart, ...decimals] = value.replace(/,/g, '.').replace(/[^0-9.]/g, '').split('.')
  return decimals.length === 0 ? integerPart : `${integerPart || '0'}.${decimals.join('').slice(0, 2)}`
}

let nextId = 1
const emptyBeneficiary = (): Beneficiary => ({ id: nextId++, name: '', country: '', amount: '' })

function BeneficiaryRow({ index, beneficiary, canRemove, onChange, onRemove }: { index: number; beneficiary: Beneficiary; canRemove: boolean; onChange: (field: keyof Omit<Beneficiary, 'id'>, value: string) => void; onRemove: () => void }) {
  const id = useId()
  return (
    <li className="grid grid-cols-1 items-end gap-3 rounded-xl border border-[#e1e6ef] bg-[#fbfcfe] p-4 sm:grid-cols-[2rem_1fr_1fr_2.75rem]">
      <span className="flex h-11 items-center text-sm font-bold text-[#503F93]" aria-hidden="true">{index + 1}</span>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor={`${id}-name`} className={labelClass}>Nombre completo *</label>
        <input id={`${id}-name`} value={beneficiary.name} onChange={(e) => onChange('name', e.target.value.toUpperCase())} placeholder="Nombre y apellido" className={inputClass} autoComplete="off" />
      </div>
      <button type="button" onClick={onRemove} disabled={!canRemove} aria-label={`Quitar beneficiario ${index + 1}`} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#e1e6ef] bg-white text-[#9aa5b8] hover:border-[#e4b4b4] hover:text-[#c0392b] disabled:cursor-not-allowed disabled:opacity-40">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex flex-col gap-1.5 sm:col-start-2">
        <label htmlFor={`${id}-country`} className={labelClass}>País de destino *</label>
        <select id={`${id}-country`} value={beneficiary.country} onChange={(e) => onChange('country', e.target.value)} className={inputClass}>
          <option value="">Seleccione un país</option>
          {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-amount`} className={labelClass}>Monto (USD) *</label>
        <input id={`${id}-amount`} inputMode="decimal" value={beneficiary.amount} onChange={(e) => onChange('amount', sanitizeAmount(e.target.value))} placeholder="0,00" className={`${inputClass} text-right tabular-nums`} />
      </div>
    </li>
  )
}

export function MultiRemittanceForm() {
  const [docType, setDocType] = useState('CÉDULA')
  const [docNumber, setDocNumber] = useState('')
  const [sender, setSender] = useState<string | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => [emptyBeneficiary(), emptyBeneficiary()])
  const [operations, setOperations] = useState<string[] | null>(null)

  const amounts = beneficiaries.map((b) => Number(b.amount) || 0)
  const subtotal = amounts.reduce((sum, value) => sum + value, 0)
  const validRows = beneficiaries.filter((b) => b.name.trim() && b.country && Number(b.amount) > 0)
  const fees = validRows.length * FEE_PER_REMITTANCE
  const tax = fees * TAX_RATE
  const total = subtotal + fees + tax
  const allValid = sender !== null && validRows.length === beneficiaries.length

  const searchSender = (event: FormEvent) => {
    event.preventDefault()
    if (docNumber.trim()) setSender('ELIANA ANTEZANA OVANDO')
  }

  const updateRow = (id: number, field: keyof Omit<Beneficiary, 'id'>, value: string) =>
    setBeneficiaries((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!allValid) return
    setOperations(beneficiaries.map((_, index) => `1203007${String(1000 + index * 37).padStart(4, '0')}`))
  }

  const reset = () => {
    setSender(null)
    setDocNumber('')
    setBeneficiaries([emptyBeneficiary(), emptyBeneficiary()])
    setOperations(null)
  }

  if (operations) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-[#2fb36b]" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h2 className="text-balance text-2xl font-bold text-[#503F93]">Multiremesa realizada</h2>
          <p className="text-pretty text-sm leading-relaxed text-[#66718a]">Se generaron {operations.length} operaciones para {sender}. Total cobrado: <strong className="text-[#17233f]">{formatUsd(total)}</strong></p>
        </div>
        <ul className="flex w-full max-w-xl flex-col divide-y divide-[#e4e8ef] rounded-xl border border-[#e1e6ef] text-left text-sm">
          {beneficiaries.map((b, index) => (
            <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-semibold text-[#17233f]">{b.name}</span>
                <span className="text-xs text-[#73809a]">{b.country} · {formatUsd(Number(b.amount))}</span>
              </div>
              <span className="font-mono text-base font-bold tabular-nums text-[#17233f]">{operations[index]}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={reset} className="h-11 cursor-pointer rounded-full bg-[#FFE500] px-8 text-sm font-bold text-[#17233f] hover:brightness-95">Nueva multiremesa</button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="border-b border-[#e4e8ef] px-6 py-5 sm:px-8">
        <h1 className="text-balance text-xl font-bold text-[#503F93]">Envíos - Multiremesa</h1>
        <p className="mt-1 text-sm leading-relaxed text-[#66718a]">Un remitente, varios beneficiarios, un solo cobro en caja.</p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="sender-title" className="flex flex-col gap-4">
            <h2 id="sender-title" className="font-bold text-[#17233f]">1. Remitente</h2>
            <form onSubmit={searchSender} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1.5 sm:w-48">
                <label htmlFor="doc-type" className={labelClass}>Tipo de identificación *</label>
                <select id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)} className={inputClass}>
                  <option>CÉDULA</option>
                  <option>PASAPORTE</option>
                  <option>CARNET DE EXTRANJERO</option>
                </select>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="doc-number" className={labelClass}>Nro. de identificación *</label>
                <input id="doc-number" value={docNumber} onChange={(e) => { setDocNumber(e.target.value); setSender(null) }} placeholder="Ej. 7807365" className={inputClass} autoFocus />
              </div>
              <button type="submit" disabled={!docNumber.trim()} className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#503F93] px-6 text-sm font-bold text-white hover:bg-[#45367f] disabled:cursor-not-allowed disabled:opacity-40">
                <Search className="h-4 w-4" aria-hidden="true" />
                Buscar
              </button>
            </form>
            <p role="status" aria-live="polite" className="text-sm">
              {sender ? <span className="inline-flex items-center gap-2 rounded-full bg-[#eef9f2] px-3 py-1 font-semibold text-[#1f7a4a]"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{sender} · {docType} {docNumber}</span> : <span className="text-[#73809a]">Busca al remitente para habilitar el envío.</span>}
            </p>
          </section>

          <form id="multi-form" onSubmit={submit} aria-labelledby="beneficiaries-title" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 id="beneficiaries-title" className="font-bold text-[#17233f]">2. Beneficiarios <span className="font-normal text-[#73809a]">({beneficiaries.length}/{MAX_BENEFICIARIES})</span></h2>
              <button type="button" onClick={() => setBeneficiaries((rows) => [...rows, emptyBeneficiary()])} disabled={beneficiaries.length >= MAX_BENEFICIARIES} className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-[#eeebf8] px-4 text-sm font-bold text-[#503F93] hover:bg-[#e3def4] disabled:cursor-not-allowed disabled:opacity-40">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar beneficiario
              </button>
            </div>
            <ul className="flex flex-col gap-3">
              {beneficiaries.map((beneficiary, index) => (
                <BeneficiaryRow key={beneficiary.id} index={index} beneficiary={beneficiary} canRemove={beneficiaries.length > 1} onChange={(field, value) => updateRow(beneficiary.id, field, value)} onRemove={() => setBeneficiaries((rows) => rows.filter((row) => row.id !== beneficiary.id))} />
              ))}
            </ul>
          </form>
        </div>

        <aside aria-label="Resumen de cobro" className="flex h-fit flex-col gap-4 rounded-xl border border-[#e1e6ef] bg-[#fbfcfe] p-5 xl:sticky xl:top-0">
          <h2 className="border-b border-[#e4e8ef] pb-4 font-bold text-[#17233f]">Resumen</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-[#73809a]">Remesas válidas</dt><dd className="font-semibold tabular-nums">{validRows.length} de {beneficiaries.length}</dd></div>
            <div className="flex justify-between"><dt className="text-[#73809a]">Dinero a enviar</dt><dd className="font-semibold tabular-nums">{formatUsd(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#73809a]">Cargos ({FEE_PER_REMITTANCE} USD c/u)</dt><dd className="font-semibold tabular-nums">{formatUsd(fees)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#73809a]">IVA</dt><dd className="font-semibold tabular-nums">{formatUsd(tax)}</dd></div>
            <div className="flex justify-between border-t border-[#e4e8ef] pt-4 text-base"><dt className="font-bold">Total a cobrar</dt><dd className="font-bold tabular-nums text-[#503F93]">{formatUsd(total)}</dd></div>
          </dl>
          <button type="submit" form="multi-form" disabled={!allValid} className="h-12 cursor-pointer rounded-full bg-[#FFE500] text-sm font-bold text-[#17233f] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40">
            Procesar multiremesa
          </button>
          {!allValid && <p className="text-xs leading-relaxed text-[#73809a]">{sender ? 'Completa nombre, país y monto de cada beneficiario.' : 'Primero busca al remitente.'}</p>}
        </aside>
      </div>
    </div>
  )
}
