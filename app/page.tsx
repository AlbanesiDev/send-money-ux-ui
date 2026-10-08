'use client'

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Bell, Ban, ChevronRight, FileText, Landmark, List, Menu, Search, SlidersHorizontal, Wallet, X } from 'lucide-react'
import countriesCatalog from '../public/catalog-countries.json'
import payoutPartnersCatalog from '../public/calog-payout-partners.json'
import payoutPartnerLocationsCatalog from '../public/GetPayoutPartnerLocations.json'

const uniqueSorted = (values: string[]) => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))

const destinationCountryOptions = uniqueSorted(countriesCatalog.result.items.filter((item) => item.country.ctyActive).map((item) => item.country.ctyName))
const countryIsoByName = new Map(countriesCatalog.result.items.map((item) => [item.country.ctyName.trim(), item.country.ctyIsoCode.toLowerCase()]))
const CountryFlag = ({ country }: { country: string }) => {
  const iso = countryIsoByName.get(country)
  if (!iso) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://flagcdn.com/w40/${iso}.png`} alt="" width={24} height={16} loading="lazy" className="h-4 w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-[#17233f]/10" />
}
const payoutPartnerOptions = uniqueSorted(payoutPartnersCatalog.result.payoutPartners.map((partner) => partner.name))
const payoutLocationOptions = uniqueSorted(payoutPartnerLocationsCatalog.result.payoutPartnerLocations.map((location) => location.address.address))

const steps = ['Transacción', 'Cotización', 'Remitente', 'Beneficiario', 'Información adicional', 'Método de pago', 'Revisión']

const Field = ({ label, value, required = false, placeholder = '', disabled = false }: { label: string; value?: string; required?: boolean; placeholder?: string; disabled?: boolean }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-[#263653]">{label} {required && <span className="text-[#c73750]">*</span>}</span>
    <input defaultValue={value} placeholder={placeholder} disabled={disabled} className="h-12 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#263653] outline-none transition placeholder:text-[#a2adbf] focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10 disabled:bg-[#f7f8fb] disabled:text-[#73809a]" />
  </label>
)

function SearchableSelect({ label, value, options, onChange, disabled = false, loading = false, fieldRef, nextRef, showFlags = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; disabled?: boolean; loading?: boolean; fieldRef: RefObject<HTMLButtonElement | null>; nextRef?: RefObject<HTMLElement | null>; showFlags?: boolean }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const filterRef = useRef<HTMLInputElement>(null)
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(filter.toLowerCase()))
  const choose = (option: string) => {
    onChange(option)
    setOpen(false)
    setFilter('')
    window.requestAnimationFrame(() => (nextRef ?? fieldRef).current?.focus())
  }
  useEffect(() => {
    if (open) window.requestAnimationFrame(() => filterRef.current?.focus())
  }, [open])
  return <div className="relative block"><span className="mb-2 block text-sm font-semibold">{label} <span className="text-[#c73750]">*</span></span><button ref={fieldRef} type="button" disabled={disabled || loading} aria-busy={loading} onClick={() => setOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={open} className="flex h-12 w-full items-center justify-between rounded-lg border border-[#cdd5e1] bg-white px-3 text-left text-sm text-[#17233f] outline-none focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10 disabled:bg-[#f3f5f9] disabled:text-[#8a96aa]">{loading ? <span role="status" className="flex items-center gap-2 text-[#5368c8]"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-[#c9d1f0] border-t-[#465bc2]" />Cargando {label.toLowerCase()}...</span> : <span className={`flex min-w-0 items-center gap-2 ${value ? '' : 'text-[#8a96aa]'}`}>{showFlags && value && <CountryFlag country={value} />}<span className="truncate">{value || `Selecciona ${label.toLowerCase()}`}</span></span>}<span aria-hidden="true">⌄</span></button>{open && <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-[#cdd5e1] bg-white p-2 shadow-lg"><input ref={filterRef} value={filter} onChange={(event) => setFilter(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (filteredOptions[0]) choose(filteredOptions[0]) } if (event.key === 'Escape') { setOpen(false); fieldRef.current?.focus() } }} placeholder="Filtrar opciones" aria-label={`Filtrar ${label.toLowerCase()}`} className="h-10 w-full rounded-md border border-[#dce3ee] px-3 text-sm outline-none focus:border-[#5368c8]" /> <div role="listbox" aria-label={label} className="mt-1 max-h-48 overflow-y-auto">{filteredOptions.map((option) => <button key={option} type="button" role="option" aria-selected={value === option} onClick={() => choose(option)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-[#f4f6ff] ${value === option ? 'bg-[#eef1ff] font-semibold text-[#465bc2]' : ''}`}>{showFlags && <CountryFlag country={option} />}<span className="truncate">{option}</span></button>)}{filteredOptions.length === 0 && <p className="px-3 py-2 text-sm text-[#8a96aa]">Sin resultados</p>}</div></div>}</div>
}

function useAltFieldNavigation() {
  useEffect(() => {
    function advanceOnEnter(event: KeyboardEvent) {
      if (event.key !== 'Enter' || event.defaultPrevented || event.altKey || event.shiftKey || event.ctrlKey || event.metaKey || event.isComposing || event.keyCode === 229) return
      const target = event.target as HTMLElement
      if (!target.matches('input, select')) return
      const container = target.closest('[data-enter-advance]')
      if (!container) return
      const fields = Array.from(container.querySelectorAll<HTMLElement>('input:not([disabled]):not([readonly]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[aria-haspopup="listbox"]:not([disabled])'))
      const current = fields.indexOf(target)
      if (current < 0) return
      event.preventDefault()
      const nextField = fields[current + 1]
      if (nextField) nextField.focus()
      else document.querySelector<HTMLButtonElement>('[data-next-button]')?.focus()
    }
    function moveBetweenFields(event: KeyboardEvent) {
      advanceOnEnter(event)
      if (!event.altKey || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
      const target = event.target as HTMLElement
      if (!target.matches('input, select, textarea')) return
      const container = target.closest('[data-form-fields]')
      if (!container) return
      const fields = Array.from(container.querySelectorAll<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])'))
      const current = fields.indexOf(target)
      if (current < 0) return
      const currentRect = target.getBoundingClientRect()
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight'
      const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
      const candidates = fields.filter((field, index) => {
        if (index === current) return false
        const rect = field.getBoundingClientRect()
        return horizontal ? (direction < 0 ? rect.right <= currentRect.left : rect.left >= currentRect.right) : (direction < 0 ? rect.bottom <= currentRect.top : rect.top >= currentRect.bottom)
      })
      if (!candidates.length) return
      const next = candidates.reduce((best, field) => {
        const rect = field.getBoundingClientRect()
        const bestRect = best.getBoundingClientRect()
        const distance = horizontal ? Math.abs(rect.left - currentRect.left) + Math.abs(rect.top - currentRect.top) : Math.abs(rect.top - currentRect.top) + Math.abs(rect.left - currentRect.left)
        const bestDistance = horizontal ? Math.abs(bestRect.left - currentRect.left) + Math.abs(bestRect.top - currentRect.top) : Math.abs(bestRect.top - currentRect.top) + Math.abs(bestRect.left - currentRect.left)
        return distance < bestDistance ? field : best
      })
      event.preventDefault()
      next.focus()
    }
    document.addEventListener('keydown', moveBetweenFields)
    return () => document.removeEventListener('keydown', moveBetweenFields)
  }, [])
}

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

function VisualToolbar() {
  return <header className="flex h-[74px] items-center justify-between bg-[#503F93] px-6 text-white sm:px-10 lg:px-12"><div className="flex items-center gap-5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE500] text-lg font-black text-[#503F93]" aria-label="Logo">A</div><div className="flex items-center gap-5 rounded-full bg-white px-4 py-2 text-xs text-[#263653] shadow-sm"><span><strong>Agente:</strong> JoacoDev</span><span><strong>Perfil:</strong> Desarrollo - Super Usuario - BO</span><span><strong>Agencia:</strong> #1939 TEST</span><span><strong>Caja:</strong> 1</span></div></div><div className="flex items-center gap-5"><div className="relative text-white/80"><Bell className="h-5 w-5" aria-label="Notificaciones" /><span className="absolute -right-2 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFE500] px-1 text-[10px] font-bold text-[#503F93]">11</span></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE500] font-bold text-[#503F93]" aria-label="Usuario">J</div></div></header>
}

function VisualSidebar() {
  return <aside aria-label="Menú principal" className="hidden h-full w-[300px] shrink-0 overflow-y-auto rounded-[18px] bg-white p-4 shadow-[0_12px_35px_rgba(24,37,73,0.05)] lg:block"><label className="relative block"><span className="sr-only">Buscar</span><Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa5b8]" aria-hidden="true" /><input type="search" placeholder="Buscar" className="h-11 w-full rounded-lg border border-[#cdd5e1] bg-[#fbfcfe] pl-10 pr-3 text-sm font-semibold text-[#263653] outline-none placeholder:text-[#a2adbf] focus:border-[#5368c8]" /></label><nav className="mt-4 space-y-1">{menuItems.map(({ label, icon: Icon }) => <button key={label} type="button" className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] text-[#66718a] hover:bg-[#f5f7ff]"><Icon className="h-5 w-5 shrink-0 text-[#7d88a0]" aria-hidden="true" /><span className="flex-1 leading-5">{label}</span><ChevronRight className="h-4 w-4 shrink-0 text-[#a8b1c1]" aria-hidden="true" /></button>)}<div className="mt-2"><button type="button" className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] font-bold text-[#17233f] hover:bg-[#f5f7ff]"><SlidersHorizontal className="h-5 w-5" aria-hidden="true" /><span className="flex-1">S&L</span><ChevronRight className="h-4 w-4 rotate-90" aria-hidden="true" /></button><div className="ml-8 border-l border-[#dce3ee] pl-4">{['Envíos', 'Pagos', 'Release', 'S&P'].map((label, index) => <button key={label} type="button" onClick={label === 'Envíos' ? () => window.location.reload() : undefined} className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${index === 0 ? 'font-bold text-[#17233f]' : 'text-[#7d88a0]'} hover:bg-[#f5f7ff]`}><Menu className="h-4 w-4" aria-hidden="true" />{label}</button>)}</div></div><button type="button" className="mt-2 flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] text-[#66718a] hover:bg-[#f5f7ff]"><Wallet className="h-5 w-5" aria-hidden="true" /><span className="flex-1">Turnero</span><ChevronRight className="h-4 w-4" aria-hidden="true" /></button><button type="button" className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] text-[#66718a] hover:bg-[#f5f7ff]"><Wallet className="h-5 w-5" aria-hidden="true" /><span className="flex-1">Wallets</span><ChevronRight className="h-4 w-4" aria-hidden="true" /></button></nav></aside>
}

type Quote = { amount: number; fee: number; tax: number }

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

function sanitizeAmount(value: string) {
  const [integerPart, ...decimalParts] = value.replace(/,/g, '.').replace(/[^0-9.]/g, '').split('.')
  if (decimalParts.length === 0) return integerPart
  return `${integerPart || '0'}.${decimalParts.join('').slice(0, 2)}`
}

function normalizeAmount(value: string) {
  if (!value) return ''
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(2) : ''
}

const usdFormatter = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })
const formatUsd = (value: number) => `${usdFormatter.format(value)} USD`

function Summary({ provider, quote, loading }: { provider: string; quote: Quote | null; loading: boolean }) {
  const amount = quote?.amount ?? 0
  const fee = quote?.fee ?? 0
  const tax = quote?.tax ?? 0
  const rows = [
    { label: 'Dinero a enviar', value: amount },
    { label: 'Cargo de envío', value: fee },
    { label: 'IVA', value: tax },
  ]
  const valueClass = `font-semibold tabular-nums transition-opacity ${loading ? 'animate-pulse opacity-40' : ''}`
  return <aside aria-busy={loading} className="rounded-xl border border-[#e1e6ef] bg-[#fbfcfe] p-5 lg:sticky lg:top-6 lg:h-fit"><div className="flex items-center justify-between border-b border-[#e4e8ef] pb-4"><h2 className="font-bold text-[#17233f]">Resumen</h2><span aria-label="Ticket" title="Ticket" className="flex h-7 w-7 items-center justify-center rounded-full border border-[#cfd7e6] bg-white text-sm font-bold text-[#465bc2]">▤</span></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-[#73809a]">Proveedor</dt><dd className="text-right font-semibold text-[#263653]">{provider}</dd></div>{rows.map((row) => <div key={row.label} className="flex justify-between"><dt className="text-[#73809a]">{row.label}</dt><dd className={valueClass}>{formatUsd(row.value)}</dd></div>)}<div className="mt-4 flex justify-between border-t border-[#e4e8ef] pt-4 text-base"><dt className="font-bold">Total</dt><dd className={`font-bold tabular-nums text-[#465bc2] ${loading ? 'animate-pulse opacity-40' : ''}`}>{formatUsd(amount + fee + tax)}</dd></div></dl><p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-[#73809a]">{loading ? 'Calculando cotización…' : quote ? '' : 'Ingresa un monto y presiona Enter para cotizar.'}</p></aside>
}

export default function Page() {
  useAltFieldNavigation()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [documentNumber, setDocumentNumber] = useState('')
  const [provider, setProvider] = useState('RIA')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [payingPartner, setPayingPartner] = useState('')
  const [location, setLocation] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const quoteRequestRef = useRef(0)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const clearAmount = () => { quoteRequestRef.current += 1; setSendAmount(''); setQuote(null); setQuoteLoading(false) }
  const requestQuote = () => {
    const normalizedAmount = normalizeAmount(sendAmount)
    setSendAmount(normalizedAmount)
    const amount = Number(normalizedAmount)
    if (!Number.isFinite(amount) || amount <= 0) return
    const requestId = ++quoteRequestRef.current
    setQuoteLoading(true)
    window.setTimeout(() => {
      if (requestId !== quoteRequestRef.current) return
      setQuote({ amount, fee: 5, tax: 0.91 })
      setQuoteLoading(false)
      window.requestAnimationFrame(() => nextButtonRef.current?.focus())
    }, 900)
  }
  const [result, setResult] = useState<'success' | 'empty' | 'error' | null>(null)
  const isKnownClient = result === 'success'
  const known = (value?: string) => (isKnownClient ? value : undefined)
  const continueRef = useRef<HTMLButtonElement>(null)
  const destinationCountryRef = useRef<HTMLButtonElement>(null)
  const payingPartnerRef = useRef<HTMLButtonElement>(null)
  const locationRef = useRef<HTMLButtonElement>(null)
  const sendAmountRef = useRef<HTMLInputElement>(null)
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const optionsRequestRef = useRef(0)
  const simulateOptionsLoad = (setLoadingState: (value: boolean) => void, target: RefObject<HTMLButtonElement | null>) => {
    const requestId = ++optionsRequestRef.current
    setPartnerLoading(false)
    setLocationLoading(false)
    setLoadingState(true)
    window.setTimeout(() => {
      if (requestId !== optionsRequestRef.current) return
      flushSync(() => setLoadingState(false))
      target.current?.focus()
    }, 900)
  }
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [additionalChecks, setAdditionalChecks] = useState<Record<string, boolean>>({ '¿Es una Persona Expuesta Políticamente (PEP)?': true })
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(0)
  const beneficiaries = [
    { name: 'Joaco Test Devv Test', document: '78073652', city: 'Acerani', phone: '4554545454', email: 'beneficiario@example.com' },
    { name: 'María Fernanda López', document: '6543210', city: 'La Paz', phone: '712345678', email: 'm***@example.com' },
    { name: 'Carlos Alberto Rojas', document: '9876543', city: 'Cochabamba', phone: '765432109', email: 'c***@example.com' },
  ]
  const beneficiary = beneficiaries[selectedBeneficiary]

  function trapDocumentFocus(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Tab') return
    const form = event.currentTarget.form
    if (!form) return
    const focusable = Array.from(form.querySelectorAll<HTMLElement>('button, input, select, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  function searchClient() {
    const value = documentNumber.trim()
    if (!value || loading) return
    setLoading(true); setResult(null)
    window.setTimeout(() => { setResult(value === '0000000' ? 'error' : value === '7807365' ? 'success' : 'empty'); setLoading(false) }, 550)
  }

  useEffect(() => {
    if (result === 'success' || result === 'empty') {
      setAdditionalChecks(result === 'success' ? { '¿Es una Persona Expuesta Políticamente (PEP)?': true } : {})
      continueRef.current?.focus()
    }
  }, [result])

  useEffect(() => {
    if (step === 2) {
      window.requestAnimationFrame(() => destinationCountryRef.current?.focus())
    }
    if (step === 3 || step === 4) {
      window.requestAnimationFrame(() => {
        const fields = Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-enter-advance] input:not([disabled]):not([readonly]):not([type=hidden]):not([type=checkbox]):not([type=radio]), [data-enter-advance] select:not([disabled]), [data-enter-advance] textarea:not([disabled]):not([readonly])'))
        fields.find((field) => !field.value.trim())?.focus()
      })
    }
    if (step === 5) {
      window.requestAnimationFrame(() => {
        const checkboxes = Array.from(document.querySelectorAll<HTMLInputElement>('[data-additional-check]'))
        if (checkboxes.length > 0 && checkboxes.every((checkbox) => !checkbox.checked)) checkboxes[0].focus()
      })
    }
  }, [step])

  function next() { setStep((current) => Math.min(7, current + 1)) }
  function back() { setStep((current) => Math.max(1, current - 1)) }
  function goToStep(target: number) { if (target < step) setStep(target) }
  function handleContinue() { if (step === 7) router.push('/remittance-success'); else next() }

  useEffect(() => {
    function handleStepperShortcut(event: KeyboardEvent) {
      if (!event.shiftKey) return
      const number = Number(event.key)
      if (number >= 1 && number <= 7) {
        event.preventDefault()
        goToStep(number)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        back()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', handleStepperShortcut)
    return () => window.removeEventListener('keydown', handleStepperShortcut)
  }, [step])

  return <><VisualToolbar /><main className="flex h-[calc(100vh-74px)] min-h-0 gap-6 overflow-hidden bg-[#F2F2F9] px-4 py-5 text-[#17233f] sm:px-8 lg:px-12"><VisualSidebar /><section className="mx-auto flex min-h-0 min-w-0 max-w-[1540px] flex-1 flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_12px_35px_rgba(24,37,73,0.05)]">
    <header className="shrink-0 px-6 py-4 sm:px-10 lg:px-12"><nav aria-label="Progreso de la transacción"><ol className="flex w-full flex-wrap items-center gap-x-3 gap-y-3 overflow-hidden">{steps.map((name, index) => { const number = index + 1; const completed = number < step; const active = number === step; const clickable = number < step; return <li key={name} className={`flex min-w-0 flex-1 items-center gap-2 ${number === 7 ? 'last:flex-none' : ''}`}><button type="button" onClick={() => goToStep(number)} disabled={!clickable} aria-current={active ? 'step' : undefined} aria-label={`${name}, paso ${number}${completed ? ', volver a este paso' : active ? ', paso actual' : ', pendiente'}`} className={`group flex min-w-0 shrink-0 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-4 focus-visible:ring-[#5368c8]/20 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border text-sm font-bold transition-colors ${completed ? 'border-[#b8e8cc] bg-[#e1f7e9] text-[#218052] group-hover:border-[#74cf98] group-hover:bg-[#d4f2df]' : active ? 'border-[#17233f] bg-[#17233f] text-white' : 'border-[#dce3ee] bg-white text-[#73809a]'}`}>{completed ? '✓' : number}</span><span className={`whitespace-nowrap text-sm font-bold ${active ? 'text-[#17233f]' : completed ? 'text-[#263653]' : 'text-[#96a2b8]'}`}>{name}</span></button>{number < 7 && <span aria-hidden="true" className={`h-0.5 min-w-8 flex-1 ${completed ? 'bg-[#74cf98]' : 'bg-[#dfe5ef]'}`} />}</li>})}</ol></nav><div aria-hidden="true" className="mt-3 h-px w-[calc(100%+3rem)] -translate-x-6 bg-[#e9edf5] sm:w-[calc(100%+5rem)] sm:-translate-x-10 lg:w-[calc(100%+6rem)] lg:-translate-x-12" />{step > 1 && <div className="mt-3 rounded-xl border border-[#dce3ee] bg-[#fbfcfe] px-4 py-2"><div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1"><div className="flex items-center gap-3 leading-none"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#73809a]">Remitente</p><p className="text-sm font-bold text-[#17233f]">{isKnownClient ? 'Eliana Antezana Ovando' : 'Nuevo cliente'}</p><p className="text-xs text-[#687790]">Cédula: {documentNumber}{isKnownClient && ' · j***@cislatam.com'}</p>{isKnownClient && <p className="mt-1 text-sm font-semibold text-[#5368c8]">PEP: Sí</p>}</div><div className="flex items-center gap-2 text-sm text-[#687790]"><span className={`h-2 w-2 rounded-full ${isKnownClient ? 'bg-[#38b878]' : 'bg-[#d9a520]'}`} aria-hidden="true" /> {isKnownClient ? 'Cliente identificado' : 'Cliente no registrado'}</div></div></div>}</header>
    <div className={`grid min-h-0 flex-1 gap-8 overflow-y-auto px-6 pb-6 pt-1 sm:px-10 sm:pb-10 sm:pt-2 lg:px-12 lg:pb-12 lg:pt-3 ${step > 1 && !sent ? 'lg:grid-cols-[minmax(0,1fr)_330px]' : ''}`}>
      <div className={`min-w-0 ${step === 1 || sent ? 'mx-auto w-full max-w-[820px]' : ''}`} data-form-fields data-enter-advance={step >= 3 && step <= 5 ? '' : undefined}><div><div className="mb-5"><p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#5368c8]">Paso {step} de 7</p><h1 className="text-2xl font-bold tracking-[-0.02em] text-[#17233f]">{['Identifica al beneficiario','Cotización de la remesa','Datos del remitente','Datos del beneficiario','Información adicional','Método de pago','Revisa y confirma'][step - 1]}</h1><p className="mt-2 text-sm leading-6 text-[#687790]">Completa la información necesaria para continuar con la operación.</p></div>
        {step === 1 && <form onSubmit={(e) => { e.preventDefault(); searchClient() }} className="mx-auto max-w-[680px] space-y-5"><label className="block"><span className="mb-2 block text-sm font-semibold">Tipo de transacción <span className="text-[#c73750]">*</span></span><select value={provider} onChange={(e) => setProvider(e.target.value)} required className="h-12 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#17233f] outline-none focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10"><option value="WU">WU</option><option value="RIA">RIA</option><option value="QPAY">QPAY</option></select></label><label className="block"><span className="mb-2 block text-sm font-semibold">Tipo de documento <span className="text-[#c73750]">*</span></span><select defaultValue="ci" className="h-12 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm outline-none focus:border-[#5368c8]"><option value="ci">Cédula</option></select></label><label className="block"><span className="mb-2 block text-sm font-semibold">Número de documento <span className="text-[#c73750]">*</span></span><input autoFocus onKeyDown={trapDocumentFocus} inputMode="numeric" value={documentNumber} onChange={(e) => { setDocumentNumber(e.target.value.replace(/\D/g, '')); setResult(null) }} placeholder="Ingresa el número de documento" className="h-12 w-full rounded-lg border border-[#cdd5e1] px-3 text-sm outline-none focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10" /><span className="mt-2 block text-xs text-[#7b879b]">Solo números, sin espacios.</span></label><button disabled={!documentNumber || loading} className="h-12 w-full rounded-lg bg-[#465bc2] text-sm font-bold text-white disabled:bg-[#b8c1dc]">{loading ? 'Buscando cliente…' : 'Buscar'}</button><div aria-live="polite" className="min-h-[150px] border-t border-[#e9edf5] pt-6">{result === 'success' && <div className="rounded-xl border border-[#cde8db] bg-[#f1faf5] p-5"><p className="text-xs font-bold uppercase text-[#23815d]">✓ Cliente encontrado</p><h2 className="mt-2 text-xl font-bold text-[#1f6d55]">Eliana Antezana Ovando</h2><p className="mt-2 text-sm text-[#5d7c72]">Documento: {documentNumber} · j***@cislatam.com</p><div className="mt-4 flex justify-end gap-3"><button type="button" className="rounded-lg border border-[#b8d8c9] px-4 py-2 text-sm font-bold text-[#28694f]">Ver perfil</button><button type="button" ref={continueRef} onClick={next} className="rounded-lg bg-[#465bc2] px-4 py-2 text-sm font-bold text-white">Continuar</button></div></div>}{result === 'empty' && <div className="rounded-xl border border-[#eadcae] bg-[#fffaf0] p-5"><p className="font-bold text-[#5d4b19]">No encontramos un cliente asociado a este documento.</p><p className="mt-1 text-sm text-[#8a7740]">Puedes registrar un nuevo cliente para continuar.</p><div className="mt-4 flex justify-end gap-3"><button type="button" className="rounded-lg bg-[#465bc2] px-4 py-2 text-sm font-bold text-white">Registrar cliente</button><button type="button" ref={continueRef} onClick={next} className="rounded-lg border border-[#d6c688] px-4 py-2 text-sm font-bold text-[#765d12]">Continuar</button></div></div>}{result === 'error' && <div role="alert" className="rounded-xl border border-[#f0c8cf] bg-[#fff5f6] p-5"><p className="font-bold text-[#7f2638]">No pudimos completar la b��squeda</p><p className="mt-1 text-sm text-[#a34f60]">Ocurrió un problema temporal. Verifica tu conexión e inténtalo nuevamente.</p><button type="button" onClick={searchClient} className="mt-4 rounded-lg bg-[#b52e45] px-4 py-2 text-sm font-bold text-white">Reintentar</button></div>}</div></form>}
        {step === 2 && <div className="space-y-6"><h2 className="font-bold">Datos de la cotización</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="Moneda de origen" value="USD" disabled required /><SearchableSelect label="País de destino" showFlags value={destinationCountry} options={destinationCountryOptions} fieldRef={destinationCountryRef} onChange={(value) => { setDestinationCountry(value); setPayingPartner(''); setLocation(''); clearAmount(); simulateOptionsLoad(setPartnerLoading, payingPartnerRef) }} /><SearchableSelect label="Socio pagador" value={payingPartner} options={payoutPartnerOptions} fieldRef={payingPartnerRef} loading={partnerLoading} disabled={!destinationCountry} onChange={(value) => { setPayingPartner(value); setLocation(''); clearAmount(); simulateOptionsLoad(setLocationLoading, locationRef) }} /><SearchableSelect label="Locación" value={location} options={payoutLocationOptions} fieldRef={locationRef} nextRef={sendAmountRef} loading={locationLoading} disabled={!payingPartner} onChange={(value) => { setLocation(value); clearAmount() }} /><div><label className="block"><span className="mb-2 block text-sm font-semibold">Monto a enviar <span className="text-[#c73750]">*</span></span><span className="relative block"><span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold ${location ? 'text-[#465bc2]' : 'text-[#a3adbd]'}`}>USD $</span><input ref={sendAmountRef} value={sendAmount} aria-describedby="send-amount-currency" onChange={(event) => { quoteRequestRef.current += 1; setSendAmount(sanitizeAmount(event.target.value)); setQuote(null); setQuoteLoading(false) }} onBlur={() => setSendAmount((current) => normalizeAmount(current))} onKeyDown={(event) => { if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return; event.preventDefault(); requestQuote() }} disabled={!location} placeholder="0.00" inputMode="decimal" className="h-12 w-full rounded-lg border border-[#cdd5e1] pl-16 pr-3 text-sm text-[#17233f] outline-none disabled:bg-[#f3f5f9] disabled:text-[#8a96aa] focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10" /><span id="send-amount-currency" className="sr-only">Dólares estadounidenses, máximo dos decimales</span></span></label><div role="group" aria-label="Montos rápidos" className="mt-3 flex flex-wrap gap-2">{QUICK_AMOUNTS.map((amount) => { const selected = normalizeAmount(sendAmount) === amount.toFixed(2); return <button key={amount} type="button" aria-pressed={selected} disabled={!location || quoteLoading} onClick={() => { quoteRequestRef.current += 1; setSendAmount(amount.toFixed(2)); setQuote(null); setQuoteLoading(false); sendAmountRef.current?.focus() }} className={`h-8 rounded-full border px-3 text-xs font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20 disabled:cursor-not-allowed disabled:border-[#e2e7ef] disabled:bg-transparent disabled:text-[#a3adbd] ${selected ? 'border-[#465bc2] bg-[#465bc2] text-white' : 'border-[#cdd5e1] bg-white text-[#465bc2] hover:border-[#465bc2] hover:bg-[#f1f3fc]'}`}>${amount}</button> })}</div></div><Field label="Monto que recibe" value={sendAmount ? formatUsd(Number(normalizeAmount(sendAmount))) : ''} disabled required /><div><button type="button" onClick={requestQuote} disabled={!location || !sendAmount || quoteLoading} className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#465bc2] px-6 text-sm font-bold text-[#465bc2] transition-colors hover:bg-[#f1f3fc] disabled:cursor-not-allowed disabled:border-[#cdd5e1] disabled:text-[#8a96aa] disabled:hover:bg-transparent focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20">{quoteLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}{quoteLoading ? 'Cotizando...' : 'Cotizar'}</button></div></div></div>}
        {step === 3 && <div className="space-y-6"><h2 className="font-bold">Datos personales</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="Tipo de documento" value="Cédula" disabled required /><Field label="Número de documento" value={documentNumber} disabled required /><Field label="Nombre" value={known("Eliana")} required /><Field label="Segundo nombre" /><Field label="Primer apellido" value={known("Antezana")} required /><Field label="Segundo apellido" value={known("Ovando")} /><Field label="Dirección e-mail" value={known("jorge.gimenez@cislatam.com")} required /><Field label="Documento" value="Cédula de identidad" disabled required /></div><h2 className="pt-4 font-bold">Datos de dirección</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="País de residencia" value="Bolivia" disabled required /><Field label="Estado" value={known("La Paz")} required /><Field label="Ciudad" value={known("Acarapiri")} required /><Field label="Calle / Número" value={known("Fabian Vaca 3712")} /><Field label="Dirección" value={known("Fabian Vaca 3712")} required /><Field label="Número de teléfono" value={known("45545454")} /></div></div>}
        {step === 4 && <div className="space-y-6">{isKnownClient && <div><h2 className="font-bold">Beneficiarios frecuentes</h2><label className="relative mt-3 block"><span className="sr-only">Buscar beneficiario</span><span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#8a96aa]">⌕</span><input type="search" placeholder="Buscar beneficiario" className="h-11 w-full rounded-lg border border-[#cdd5e1] bg-white pl-9 pr-3 text-sm text-[#17233f] outline-none placeholder:text-[#8a96aa] focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10" /></label><div className="mt-3 grid gap-3 sm:grid-cols-3">{beneficiaries.map((person, index) => <button key={person.document} type="button" onClick={() => setSelectedBeneficiary(index)} className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${selectedBeneficiary === index ? 'border-[#5368c8] bg-[#f4f6ff]' : 'border-[#dce3ee] bg-white hover:border-[#aebcf0]'}`}><p className="text-sm font-bold text-[#17233f]">{person.name}</p><p className="mt-1 text-xs text-[#687790]">{person.city} · ***{person.phone.slice(-3)}</p></button>)}</div></div>}<h2 className="font-bold">Datos personales</h2><div key={isKnownClient ? beneficiary.document : "new-beneficiary"} className="grid gap-5 sm:grid-cols-2"><Field label="Completar con los mismos datos del Remitente" value={known("No")} required /><Field label="Tipo Documento" value="Cédula" disabled required /><Field label="Nro. de Documento" value={known(beneficiary.document)} required /><Field label="Nombre" value={known(beneficiary.name.split(' ')[0])} required /><Field label="Segundo Nombre" value={known(beneficiary.name.split(' ')[1])} /><Field label="Primer Apellido" value={known(beneficiary.name.split(' ')[2])} required /><Field label="Segundo Apellido" value={known(beneficiary.name.split(' ')[3])} /><Field label="Dir. e-mail" value={known(beneficiary.email)} required /><Field label="Documento" value="Cédula de identidad" disabled required /><Field label="País Residencia" value={known("Bolivia")} required /><Field label="Nacionalidad" value={known("Boliviana")} required /></div><h2 className="pt-4 font-bold">Datos de dirección</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="Calle/Numero" value={known("Calle 123")} required /><Field label="Dirección" value={known("Calle 123")} required /><Field label="Estado" value={known("La Paz")} required /><Field label="Ciudad" value={known(beneficiary.city)} required /><Field label="Nro. Teléfono" value={known(beneficiary.phone)} required /></div><label className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked className="h-5 w-5 accent-[#465bc2]" /> Guardar en mi lista de beneficiarios frecuentes</label><div className="rounded-lg bg-[#f8faff] p-4 text-sm text-[#687790]">Los datos del beneficiario se guardan para agilizar futuros envíos.</div></div>}
        {step === 5 && <div className="space-y-5"><h2 className="font-bold">Declaraciones de la operación</h2>{['Información adicional','¿Es una Persona Expuesta Políticamente (PEP)?','¿Es allegado a una PEP?','Transacción sospechosa o inusual'].map((label) => { const checked = Boolean(additionalChecks[label]); return <div key={label} className="space-y-4"><label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-colors ${checked ? 'border-[#aebcf0] bg-[#f5f7ff]' : 'border-[#e1e6ef]'}`}><input type="checkbox" data-additional-check checked={checked} onChange={(event) => setAdditionalChecks((current) => ({ ...current, [label]: event.target.checked }))} className="h-5 w-5 accent-[#465bc2]" />{label}</label>{checked && <div className="rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5"><div className="grid gap-5 sm:grid-cols-2">{label === 'Información adicional' && <><Field label="Ocupación" value={known("Comerciante")} required /><Field label="Nivel de Posición de Empleo" value={known("Empleado")} required /><Field label="Nombre Institución/Empresa Trabajo" value={known("Comercio Sol & Luna")} required /><Field label="Cargo" value={known("Propietaria")} required /><Field label="Dirección Trabajo" value={known("Av. Principal 123")} required /><Field label="Ingreso Mensual" value={known("5.000 USD")} required /><Field label="Fecha Ingreso Trabajo" value={known("01/01/2020")} required /><Field label="Actividad Econ��mica" value={known("Comercio")} required /><Field label="Origen de los Fondos" value={known("Salario")} required /><Field label="Destino recursos" value={known("Gastos personales")} required /><Field label="Lugar de extensión identificación" value={known("La Paz")} required /><Field label="Relación Remitente" value={known("Titular")} required /><Field label="Zona" value={known("Zona Sur")} required /><Field label="Propósito Transacción" value={known("Manutención")} required /><Field label="Estado Civil" value={known("Soltera")} required /><Field label="Nombre(s) y Apellidos del cónyugue" /><Field label="Cargos Públicos" value={known("Ninguno")} required /></>}{label === '¿Es una Persona Expuesta Políticamente (PEP)?' && <><Field label="Ocupación" value={known("Comerciante")} required /><Field label="Nivel de Posición de Empleo" value={known("Empleado")} required /><Field label="Nombre de PEP" value={known("Eliana Antezana Ovando")} required /><Field label="Cargo de PEP" value={known("Propietaria")} required /><Field label="Zona" value={known("Zona Sur")} required /><Field label="Propósito Transacción" value={known("Manutención")} required /><Field label="Nombre Institución/Empresa Trabajo" required /><Field label="Cargo" required /><Field label="Dirección Trabajo" required /><Field label="Ingreso Mensual" required /><Field label="Fecha Ingreso Trabajo" required /><Field label="Cargos Públicos" required /></>}{label === '¿Es allegado a una PEP?' && <><Field label="Tipo de Relación con PEP" value={known("Familiar")} required /><Field label="Ocupación" value={known("Comerciante")} required /><Field label="Nivel de Posición de Empleo" value={known("Empleado")} required /><Field label="Nombre de PEP" value={known("Eliana Antezana Ovando")} required /><Field label="Cargo de PEP" value={known("Propietaria")} required /><Field label="Zona" value={known("Zona Sur")} required /><Field label="Propósito Transacci��n" value={known("Manutención")} required /><Field label="Nombre Institución/Empresa Trabajo" required /><Field label="Cargo" required /><Field label="Dirección Trabajo" required /><Field label="Ingreso Mensual" required /><Field label="Fecha Ingreso Trabajo" required /><Field label="Cargos Públicos" required /></>}{label === 'Transacción sospechosa o inusual' && <><Field label="Motivo de la sospecha y/o inusualidad (Detalle de su actividad económica)" required /><Field label="Nombres y Apellidos Referencia Personal" required /><Field label="Teléfono Referencia Personal" required /><Field label="Nro NIT" /></>}</div></div>}</div>})}</div>}
        {step === 6 && <div className="space-y-6"><h2 className="font-bold">Registra el pago recibido</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="Total a cobrar" value={formatUsd(quote ? quote.amount + quote.fee + quote.tax : 0)} disabled required /><Field label="Método de pago" value="Pago en efectivo" disabled required /><Field label="Monto recibido" placeholder="Ingresa el monto recibido" required /></div><div className="rounded-xl border border-[#cde8db] bg-[#f1faf5] p-5"><div className="flex justify-between font-semibold"><span>Vuelto</span><span className="text-[#23815d]">0,00 USD</span></div><p className="mt-2 text-sm text-[#5d7c72]">El saldo pendiente se actualizará automáticamente.</p></div></div>}
        {step === 7 && <div className="space-y-6"><div className="rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5"><h2 className="font-bold">Resumen de la operación</h2><div className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><Field label="Remitente" value={isKnownClient ? 'Eliana Antezana Ovando' : 'Nuevo remitente'} disabled /><Field label="Beneficiario" value={isKnownClient ? beneficiary.name : 'Nuevo beneficiario'} disabled /><Field label="Destino" value="Bolivia · Acerani" disabled /><Field label="Total a pagar" value={formatUsd(quote ? quote.amount + quote.fee + quote.tax : 0)} disabled /></div></div><p className="rounded-lg bg-[#fffaf0] p-4 text-sm text-[#765d12]">Confirma con el cliente el monto, el beneficiario y el lugar de pago antes de enviar.</p></div>}
        </div></div>
      {step > 1 && <div className="sticky top-6 self-start"><Summary provider={provider} quote={quote} loading={quoteLoading} /></div>}
    </div>
    {step > 1 && <div className="shrink-0 border-t border-[#e9edf5] bg-white px-6 py-5 sm:px-10 lg:px-12"><div className="flex w-full justify-between"><button type="button" onClick={back} className="rounded-lg border border-[#dce3ee] px-8 py-3 text-sm font-bold text-[#687790]">Volver</button><button type="button" ref={nextButtonRef} data-next-button onClick={handleContinue} className="rounded-lg bg-[#465bc2] px-8 py-3 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-[#5368c8]/30">{step === 7 ? 'Confirmar y enviar' : 'Siguiente'}</button></div></div>}
    </section></main></>
}
