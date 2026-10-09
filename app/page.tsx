"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import {
  RemittanceProcessing,
  RemittanceSuccess,
} from "@/components/remittance-success";
import { Field } from "@/components/send-money/field";
import {
  BASE_STEPS,
  buildActiveSteps,
  buildProviderQuotes,
  DELIVERY_TYPE_OPTIONS,
  deliveryTypeLabel,
  findStepNumber,
  getStepKey,
  QPAY_COMPANY_OPTIONS,
  quoteFieldVisibility,
  TERRAPAY_BANK_OPTIONS,
  TERRAPAY_WALLET_OPTIONS,
  WU_SERVICE_OPTIONS,
} from "@/components/send-money/provider-flows";
import { isQuoteAmountUnlocked } from "@/components/send-money/quote-delivery-fields";
import { ProviderStepContent } from "@/components/send-money/provider-step-content";
import { QuoteResults } from "@/components/send-money/quote-results";
import type {
  DeliveryTypeId,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import countriesCatalog from "../public/catalogs/catalog-countries.json";
import payoutPartnersCatalog from "../public/catalogs/catalog-payout-partners.json";
import payoutPartnerLocationsCatalog from "../public/catalogs/catalog-payout-partner-locations.json";

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "es"),
  );

const destinationCountryOptions = uniqueSorted(
  countriesCatalog.result.items
    .filter((item) => item.country.ctyActive)
    .map((item) => item.country.ctyName),
);
const countryIsoByName = new Map(
  countriesCatalog.result.items.map((item) => [
    item.country.ctyName.trim(),
    item.country.ctyIsoCode.toLowerCase(),
  ]),
);
const CountryFlag = ({ country }: { country: string }) => {
  const iso = countryIsoByName.get(country);
  if (!iso) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt=""
      width={24}
      height={16}
      loading="lazy"
      className="h-4 w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-[#17233f]/10"
    />
  );
};
const payoutPartnerOptions = uniqueSorted(
  payoutPartnersCatalog.result.payoutPartners.map((partner) => partner.name),
);
const payoutLocationOptions = uniqueSorted(
  payoutPartnerLocationsCatalog.result.payoutPartnerLocations.map(
    (location) => location.address.address,
  ),
);

function SearchableSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  fieldRef,
  nextRef,
  showFlags = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  fieldRef: RefObject<HTMLButtonElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  showFlags?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(filter.toLowerCase()),
  );
  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    setFilter("");
    window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active === filterRef.current)
        (nextRef ?? fieldRef).current?.focus();
    });
  };
  useEffect(() => {
    if (!open) return;
    const selectedIndex = filteredOptions.indexOf(value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    window.requestAnimationFrame(() => filterRef.current?.focus());
  }, [open]);
  useEffect(() => {
    setHighlightedIndex((current) => {
      if (filteredOptions.length === 0) return 0;
      if (current >= filteredOptions.length) return filteredOptions.length - 1;
      return current;
    });
  }, [filter, filteredOptions.length]);
  useEffect(() => {
    if (!open) return;
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);
  useEffect(() => {
    if (loading) setOpen(false);
  }, [loading]);
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
      setFilter("");
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);
  return (
    <div ref={rootRef} className={`relative block ${open ? "z-50" : "z-0"}`}>
      <span className="mb-1 block text-sm font-semibold text-[#263653]">
        {label}
      </span>
      <button
        ref={fieldRef}
        type="button"
        disabled={disabled}
        aria-disabled={loading || undefined}
        aria-busy={loading}
        onClick={() => {
          if (!loading) setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (loading || disabled) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-[#cdd5e1] bg-white px-3 text-left text-sm text-[#17233f] outline-none focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10 disabled:bg-[#f3f5f9] disabled:text-[#8a96aa]"
      >
        {loading ? (
          <span
            role="status"
            className="flex items-center gap-2 text-[#5368c8]"
          >
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-[#c9d1f0] border-t-[#465bc2]"
            />
            Cargando {label.toLowerCase()}...
          </span>
        ) : (
          <span
            className={`flex min-w-0 items-center gap-2 ${value ? "" : "text-[#8a96aa]"}`}
          >
            {showFlags && value && <CountryFlag country={value} />}
            <span className="truncate">
              {value || `Selecciona ${label.toLowerCase()}`}
            </span>
          </span>
        )}
        <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-lg border border-[#cdd5e1] bg-white p-2 shadow-lg">
          <input
            ref={filterRef}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                if (filteredOptions.length === 0) return;
                setHighlightedIndex(
                  (current) => (current + 1) % filteredOptions.length,
                );
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (filteredOptions.length === 0) return;
                setHighlightedIndex(
                  (current) =>
                    (current - 1 + filteredOptions.length) %
                    filteredOptions.length,
                );
                return;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                const option = filteredOptions[highlightedIndex];
                if (option) choose(option);
                return;
              }
              if (event.key === "Escape") {
                setOpen(false);
                fieldRef.current?.focus();
              }
            }}
            placeholder="Filtrar opciones"
            aria-label={`Filtrar ${label.toLowerCase()}`}
            aria-activedescendant={
              filteredOptions[highlightedIndex]
                ? `select-option-${highlightedIndex}`
                : undefined
            }
            className="h-10 w-full rounded-md border border-[#dce3ee] px-3 text-sm outline-none focus:border-[#5368c8]"
          />{" "}
          <div
            role="listbox"
            aria-label={label}
            className="mt-1 max-h-48 overflow-y-auto"
          >
            {filteredOptions.map((option, index) => (
              <button
                key={option}
                id={`select-option-${index}`}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="option"
                aria-selected={value === option}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => choose(option)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-[#f4f6ff] ${
                  index === highlightedIndex
                    ? "bg-[#eef1ff] font-semibold text-[#465bc2]"
                    : value === option
                      ? "font-semibold text-[#465bc2]"
                      : ""
                }`}
              >
                {showFlags && <CountryFlag country={option} />}
                <span className="truncate">{option}</span>
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <p className="px-3 py-2 text-sm text-[#8a96aa]">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function useAltFieldNavigation() {
  useEffect(() => {
    function advanceOnEnter(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        event.defaultPrevented ||
        event.altKey ||
        event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing ||
        event.keyCode === 229
      )
        return;
      const target = event.target as HTMLElement;
      if (!target.matches("input, select")) return;
      const container = target.closest("[data-enter-advance]");
      if (!container) return;
      const fields = Array.from(
        container.querySelectorAll<HTMLElement>(
          'input:not([disabled]):not([readonly]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[aria-haspopup="listbox"]:not([disabled])',
        ),
      );
      const current = fields.indexOf(target);
      if (current < 0) return;
      event.preventDefault();
      const nextField = fields[current + 1];
      if (nextField) nextField.focus();
      else
        document
          .querySelector<HTMLButtonElement>("[data-next-button]")
          ?.focus();
    }
    function moveBetweenFields(event: KeyboardEvent) {
      advanceOnEnter(event);
      if (
        !event.altKey ||
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      const target = event.target as HTMLElement;
      if (!target.matches("input, select, textarea")) return;
      const container = target.closest("[data-form-fields]");
      if (!container) return;
      const fields = Array.from(
        container.querySelectorAll<HTMLElement>(
          "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        ),
      );
      const current = fields.indexOf(target);
      if (current < 0) return;
      const currentRect = target.getBoundingClientRect();
      const horizontal =
        event.key === "ArrowLeft" || event.key === "ArrowRight";
      const direction =
        event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      const candidates = fields.filter((field, index) => {
        if (index === current) return false;
        const rect = field.getBoundingClientRect();
        return horizontal
          ? direction < 0
            ? rect.right <= currentRect.left
            : rect.left >= currentRect.right
          : direction < 0
            ? rect.bottom <= currentRect.top
            : rect.top >= currentRect.bottom;
      });
      if (!candidates.length) return;
      const next = candidates.reduce((best, field) => {
        const rect = field.getBoundingClientRect();
        const bestRect = best.getBoundingClientRect();
        const distance = horizontal
          ? Math.abs(rect.left - currentRect.left) +
            Math.abs(rect.top - currentRect.top)
          : Math.abs(rect.top - currentRect.top) +
            Math.abs(rect.left - currentRect.left);
        const bestDistance = horizontal
          ? Math.abs(bestRect.left - currentRect.left) +
            Math.abs(bestRect.top - currentRect.top)
          : Math.abs(bestRect.top - currentRect.top) +
            Math.abs(bestRect.left - currentRect.left);
        return distance < bestDistance ? field : best;
      });
      event.preventDefault();
      next.focus();
    }
    document.addEventListener("keydown", moveBetweenFields);
    return () => document.removeEventListener("keydown", moveBetweenFields);
  }, []);
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];
const AGENCY_USD_BALANCE = 700;

const usdFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

function sanitizeAmount(value: string) {
  const cleaned = value.replace(/\./g, "").replace(/[^0-9,]/g, "");
  const [integerPart, ...decimalParts] = cleaned.split(",");
  if (decimalParts.length === 0) return integerPart;
  return `${integerPart || "0"},${decimalParts.join("").slice(0, 2)}`;
}

function normalizeAmount(value: string) {
  if (!value) return "";
  const amount = Number(value.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(amount)) return "";
  return usdFormatter.format(amount);
}

const formatUsd = (value: number) => `${usdFormatter.format(value)} USD`;
const toCents = (value: number) => Math.round(value * 100);
const paymentMethodOptions = [
  "Pago en efectivo",
  "Tarjeta de débito",
  "Tarjeta de crédito",
  "Transferencia bancaria",
  "Pago QR",
];

function Summary({
  provider,
  quote,
  deliveryType,
  loading,
}: {
  provider: ProviderId | null;
  quote: ProviderQuote | null;
  deliveryType: DeliveryTypeId | "";
  loading: boolean;
}) {
  const amount = quote ? quote.amount : 0;
  const fee = quote ? quote.fee : 0;
  const tax = quote ? quote.tax : 0;
  const rows = [
    { label: "Dinero a enviar", value: amount },
    { label: "Cargo de envío", value: fee },
    { label: "IVA", value: tax },
  ];
  const valueClass = `font-semibold tabular-nums transition-opacity ${loading ? "animate-pulse opacity-40" : ""}`;
  let providerLabel = "Sin seleccionar";
  if (provider) providerLabel = provider;
  let deliveryLabel = "Sin seleccionar";
  if (deliveryType) deliveryLabel = deliveryTypeLabel(deliveryType);
  return (
    <aside
      aria-busy={loading}
      className="rounded-xl border border-[#e1e6ef] bg-[#fbfcfe] p-3"
    >
      <div className="flex items-center justify-between border-b border-[#e4e8ef] pb-2.5">
        <h2 className="font-bold text-[#17233f]">Resumen</h2>
        <span
          aria-label="Ticket"
          title="Ticket"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#cfd7e6] bg-white text-xs font-bold text-[#465bc2]"
        >
          ▤
        </span>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[#73809a]">Proveedor</dt>
          <dd className="text-right font-semibold text-[#263653]">
            {providerLabel}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#73809a]">Tipo de envío</dt>
          <dd className="text-right font-semibold text-[#263653]">
            {deliveryLabel}
          </dd>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <dt className="text-[#73809a]">{row.label}</dt>
            <dd className={valueClass}>{formatUsd(row.value)}</dd>
          </div>
        ))}
        <div className="mt-2.5 flex justify-between border-t border-[#e4e8ef] pt-2.5 text-base">
          <dt className="font-bold">Total</dt>
          <dd
            className={`font-bold tabular-nums text-[#17233f] ${loading ? "animate-pulse opacity-40" : ""}`}
          >
            {formatUsd(amount + fee + tax)}
          </dd>
        </div>
      </dl>
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-4 text-xs text-[#73809a] select-none"
      >
        {loading
          ? "Calculando cotización…"
          : quote
            ? ""
            : "Cotiza y selecciona un proveedor para continuar."}
      </p>
    </aside>
  );
}

export default function Page() {
  const [flowKey, setFlowKey] = useState(0);
  return (
    <TransactionFlow
      key={flowKey}
      onReset={() => setFlowKey((key) => key + 1)}
    />
  );
}

function BillingSummary({
  open,
  onToggle,
  name,
  nit,
  usingSender,
  onChange,
  onReset,
}: {
  open: boolean;
  onToggle: () => void;
  name: string;
  nit: string;
  usingSender: boolean;
  onChange: (field: "name" | "nit", value: string) => void;
  onReset: () => void;
}) {
  const inputClass =
    "h-10 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#263653] outline-none transition focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10";
  return (
    <section className="rounded-xl border border-[#dce3ee] bg-[#fbfcfe]">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#73809a]">
            Facturación
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#263653]">
            {name || "Sin nombre"} · NIT/CI {nit || "—"}
          </p>
          <p className="text-xs text-[#73809a]">
            {usingSender
              ? "Datos del remitente"
              : "Datos de facturación modificados"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="billing-fields"
          className="shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-[#465bc2] hover:bg-[#eef1fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#465bc2]"
        >
          {open ? "Cerrar" : "Cambiar"}
        </button>
      </div>
      {open && (
        <div
          id="billing-fields"
          className="flex flex-col gap-4 border-t border-[#e6ebf3] p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#263653]">
                Nombre o razón social
              </span>
              <input
                value={name}
                onChange={(e) => onChange("name", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#263653]">
                NIT / CI
              </span>
              <input
                value={nit}
                inputMode="numeric"
                onChange={(e) => onChange("nit", e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          {!usingSender && (
            <button
              type="button"
              onClick={onReset}
              className="self-start text-sm font-semibold text-[#465bc2] hover:underline"
            >
              Usar datos del remitente
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function TransactionFlow({ onReset }: { onReset: () => void }) {
  useAltFieldNavigation();
  const [step, setStep] = useState(1);
  const [activeSteps, setActiveSteps] = useState<string[]>([...BASE_STEPS]);
  const [documentNumber, setDocumentNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(
    null,
  );
  const [providerQuotes, setProviderQuotes] = useState<ProviderQuote[]>([]);
  const [destinationCountry, setDestinationCountry] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeId | "">("");
  const [payingPartner, setPayingPartner] = useState("");
  const [location, setLocation] = useState("");
  const [wuService, setWuService] = useState("");
  const [qpayCompany, setQpayCompany] = useState("");
  const [terraPayBank, setTerraPayBank] = useState("");
  const [terraPayWallet, setTerraPayWallet] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [amountExceedsBalance, setAmountExceedsBalance] = useState(false);
  const deliveryTypeRef = useRef<HTMLButtonElement>(null);
  const wuServiceRef = useRef<HTMLButtonElement>(null);
  const qpayCompanyRef = useRef<HTMLButtonElement>(null);
  const terraPayBankRef = useRef<HTMLButtonElement>(null);
  const terraPayWalletRef = useRef<HTMLButtonElement>(null);
  const quoteFields =
    deliveryType === "" ? null : quoteFieldVisibility(deliveryType);
  const showPartnerLocation = Boolean(quoteFields?.showRiaPartnerLocation);
  const showWuService = Boolean(
    quoteFields?.showWuService && deliveryType !== "",
  );
  const showQpayCompany = Boolean(quoteFields?.showQpayCompany);
  const showTerraPayBank = Boolean(quoteFields?.showTerraPayBank);
  const showTerraPayWallet = Boolean(quoteFields?.showTerraPayWallet);
  const amountUnlocked =
    deliveryType !== "" &&
    isQuoteAmountUnlocked(deliveryType, {
      payingPartner,
      location,
      wuService,
      qpayCompany,
    });

  const clearDeliveryExtras = () => {
    setPayingPartner("");
    setLocation("");
    setWuService("");
    setQpayCompany("");
    setTerraPayBank("");
    setTerraPayWallet("");
  };
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [quote, setQuote] = useState<ProviderQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quotesReady, setQuotesReady] = useState(false);
  const quoteRequestRef = useRef(0);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const lastStep = activeSteps.length;
  const clearAmount = () => {
    quoteRequestRef.current += 1;
    setSendAmount("");
    setAmountExceedsBalance(false);
    setQuote(null);
    setProviderQuotes([]);
    setQuotesReady(false);
    setSelectedProvider(null);
    setActiveSteps([...BASE_STEPS]);
    setQuoteLoading(false);
    setStep((current) => Math.min(current, 2));
  };
  const requestQuote = () => {
    if (!deliveryType) return;
    const normalizedAmount = normalizeAmount(sendAmount);
    setSendAmount(normalizedAmount);
    const amount = Number(
      normalizedAmount.replace(/\./g, "").replace(",", "."),
    );
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (toCents(amount) > toCents(AGENCY_USD_BALANCE)) {
      setAmountExceedsBalance(true);
      setQuote(null);
      setProviderQuotes([]);
      setQuotesReady(false);
      setSelectedProvider(null);
      setActiveSteps([...BASE_STEPS]);
      setQuoteLoading(false);
      setStep((current) => Math.min(current, 2));
      return;
    }
    setAmountExceedsBalance(false);
    const requestId = ++quoteRequestRef.current;
    setQuoteLoading(true);
    setQuote(null);
    setSelectedProvider(null);
    setProviderQuotes([]);
    setQuotesReady(false);
    setActiveSteps([...BASE_STEPS]);
    setStep((current) => Math.min(current, 2));
    window.setTimeout(() => {
      if (requestId !== quoteRequestRef.current) return;
      const quotes = buildProviderQuotes(amount, deliveryType);
      const cheapest = [...quotes].sort(
        (a, b) => a.amount + a.fee + a.tax - (b.amount + b.fee + b.tax),
      )[0];
      setProviderQuotes(quotes);
      setQuotesReady(true);
      setQuoteLoading(false);
      if (cheapest) {
        setSelectedProvider(cheapest.provider);
        setQuote(cheapest);
        setActiveSteps(buildActiveSteps(cheapest.provider));
      }
      window.requestAnimationFrame(() => nextButtonRef.current?.focus());
    }, 900);
  };
  const selectProviderQuote = (providerQuote: ProviderQuote) => {
    setSelectedProvider(providerQuote.provider);
    setQuote(providerQuote);
    setActiveSteps(buildActiveSteps(providerQuote.provider));
    window.requestAnimationFrame(() => nextButtonRef.current?.focus());
  };
  const resetQuoteSelection = () => {
    quoteRequestRef.current += 1;
    setQuote(null);
    setProviderQuotes([]);
    setQuotesReady(false);
    setSelectedProvider(null);
    setActiveSteps([...BASE_STEPS]);
    setStep((current) => Math.min(current, 2));
    setQuoteLoading(false);
  };
  const [result, setResult] = useState<
    "success" | "empty" | "error" | "blocked" | null
  >(null);
  const isKnownClient = result === "success";
  const known = (value?: string) => (isKnownClient ? value : undefined);
  const senderName = isKnownClient ? "Eliana Antezana Ovando" : "";
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingOverride, setBillingOverride] = useState<{
    name: string;
    nit: string;
  } | null>(null);
  const billingName = billingOverride ? billingOverride.name : senderName;
  const billingNit = billingOverride ? billingOverride.nit : documentNumber;
  const continueRef = useRef<HTMLButtonElement>(null);
  const destinationCountryRef = useRef<HTMLButtonElement>(null);
  const payingPartnerRef = useRef<HTMLButtonElement>(null);
  const locationRef = useRef<HTMLButtonElement>(null);
  const sendAmountRef = useRef<HTMLInputElement>(null);
  const paymentMethodRef = useRef<HTMLButtonElement>(null);
  const receivedAmountRef = useRef<HTMLInputElement>(null);
  const totalToCharge = quote ? quote.amount + quote.fee + quote.tax : 0;
  const receivedValue = receivedAmount
    ? Number(receivedAmount.replace(/\./g, "").replace(",", "."))
    : 0;
  const changeDue = Math.max(0, receivedValue - totalToCharge);
  const receivedInsufficient =
    receivedAmount !== "" && toCents(receivedValue) < toCents(totalToCharge);
  const isPaymentStep =
    selectedProvider !== null &&
    step >= 3 &&
    getStepKey(selectedProvider, step) === "payment";
  const isReviewStep =
    selectedProvider !== null &&
    step >= 3 &&
    getStepKey(selectedProvider, step) === "review";
  const paymentReady =
    selectedProvider === "TERRAPAY"
      ? true
      : paymentMethod !== "" && receivedAmount !== "" && !receivedInsufficient;
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const optionsRequestRef = useRef(0);
  const simulateOptionsLoad = (
    setLoadingState: (value: boolean) => void,
    target: RefObject<HTMLButtonElement | null>,
  ) => {
    const requestId = ++optionsRequestRef.current;
    setPartnerLoading(false);
    setLocationLoading(false);
    flushSync(() => setLoadingState(true));
    target.current?.focus();
    window.setTimeout(() => {
      if (requestId !== optionsRequestRef.current) return;
      flushSync(() => setLoadingState(false));
      target.current?.focus();
    }, 900);
  };
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingTimeoutRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(processingTimeoutRef.current), []);
  const [additionalChecks, setAdditionalChecks] = useState<
    Record<string, boolean>
  >({ "¿Es una Persona Expuesta Políticamente (PEP)?": true });
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(0);
  const beneficiaries = [
    {
      name: "Joaco Test Devv Test",
      document: "78073652",
      city: "Acerani",
      phone: "4554545454",
      email: "beneficiario@example.com",
    },
    {
      name: "María Fernanda López",
      document: "6543210",
      city: "La Paz",
      phone: "712345678",
      email: "m***@example.com",
    },
    {
      name: "Carlos Alberto Rojas",
      document: "9876543",
      city: "Cochabamba",
      phone: "765432109",
      email: "c***@example.com",
    },
  ];
  const beneficiary = beneficiaries[selectedBeneficiary];

  function trapDocumentFocus(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Tab") return;
    const form = event.currentTarget.form;
    if (!form) return;
    const focusable = Array.from(
      form.querySelectorAll<HTMLElement>(
        'button, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function searchClient() {
    const value = documentNumber.trim();
    if (!value || loading) return;
    setLoading(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(
        value === "0000000"
          ? "error"
          : value === "2222222"
            ? "blocked"
            : value === "7807365" || value === "1111111"
              ? "success"
              : "empty",
      );
      setLoading(false);
    }, 550);
  }

  useEffect(() => {
    if (result === "success" || result === "empty") {
      setAdditionalChecks(
        result === "success"
          ? { "¿Es una Persona Expuesta Políticamente (PEP)?": true }
          : {},
      );
      continueRef.current?.focus();
    }
  }, [result]);

  useEffect(() => {
    if (step !== 2) return;
    window.requestAnimationFrame(() => destinationCountryRef.current?.focus());
  }, [step]);

  useEffect(() => {
    if (isPaymentStep && selectedProvider !== "TERRAPAY") {
      window.requestAnimationFrame(() => paymentMethodRef.current?.focus());
    }
    if (
      selectedProvider &&
      step >= 3 &&
      (getStepKey(selectedProvider, step) === "remitter" ||
        getStepKey(selectedProvider, step) === "beneficiary")
    ) {
      window.requestAnimationFrame(() => {
        const fields = Array.from(
          document.querySelectorAll<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >(
            "[data-enter-advance] input[required]:not([disabled]):not([readonly]):not([type=hidden]):not([type=checkbox]):not([type=radio]), [data-enter-advance] select[required]:not([disabled]), [data-enter-advance] textarea[required]:not([disabled]):not([readonly])",
          ),
        );
        const firstEmptyRequired = fields.find((field) => !field.value.trim());
        if (firstEmptyRequired) {
          firstEmptyRequired.focus();
          return;
        }
        nextButtonRef.current?.focus();
      });
    }
    if (
      selectedProvider &&
      step >= 3 &&
      (getStepKey(selectedProvider, step) === "additionalInfo" ||
        getStepKey(selectedProvider, step) === "pep")
    ) {
      window.requestAnimationFrame(() => {
        const checkboxes = Array.from(
          document.querySelectorAll<HTMLInputElement>(
            "[data-additional-check]",
          ),
        );
        if (
          checkboxes.length > 0 &&
          checkboxes.every((checkbox) => !checkbox.checked)
        )
          checkboxes[0].focus();
      });
    }
    if (isReviewStep) {
      window.requestAnimationFrame(() => nextButtonRef.current?.blur());
    }
  }, [step, isPaymentStep, isReviewStep, selectedProvider]);

  function next() {
    if (step === 2 && !selectedProvider) return;
    if (isPaymentStep && !paymentReady) return;
    setStep((current) => Math.min(lastStep, current + 1));
  }
  function back() {
    setStep((current) => Math.max(1, current - 1));
  }
  function goToStep(target: number) {
    if (target < step) setStep(target);
  }
  function handleContinue() {
    if (!isReviewStep) return next();
    if (processing) return;
    setProcessing(true);
    processingTimeoutRef.current = window.setTimeout(() => {
      setProcessing(false);
      setSent(true);
    }, 2500);
  }
  function startAnotherQuote() {
    clearAmount();
    setPaymentMethod("");
    setReceivedAmount("");
    window.clearTimeout(processingTimeoutRef.current);
    setProcessing(false);
    setSent(false);
    setStep(2);
  }

  useEffect(() => {
    function handleStepperShortcut(event: KeyboardEvent) {
      if (!event.shiftKey) return;
      const number = Number(event.key);
      if (number >= 1 && number <= lastStep) {
        event.preventDefault();
        goToStep(number);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", handleStepperShortcut);
    return () => window.removeEventListener("keydown", handleStepperShortcut);
  }, [step, paymentReady, lastStep, selectedProvider, isPaymentStep]);

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-white text-[#17233f] shadow-[0_12px_35px_rgba(24,37,73,0.06)]">
      {processing ? (
        <RemittanceProcessing
          totalSent={formatUsd(
            quote ? quote.amount + quote.fee + quote.tax : 0,
          )}
        />
      ) : sent ? (
        <RemittanceSuccess
          operationNumber="12030070733"
          totalSent={formatUsd(
            quote ? quote.amount + quote.fee + quote.tax : 0,
          )}
          onNewTransaction={onReset}
          onRepeatClient={startAnotherQuote}
          onSameBeneficiary={startAnotherQuote}
        />
      ) : (
        <>
          {step > 0 && (
            <header className="shrink-0 px-4 py-3 sm:px-6 lg:px-8">
              <>
                <nav aria-label="Progreso de la transacción">
                  <ol className="flex w-full flex-wrap items-center gap-x-2 gap-y-2 overflow-hidden">
                    {activeSteps.map((name, index) => {
                      const number = index + 1;
                      const completed = number < step;
                      const active = number === step;
                      const clickable = number < step;
                      return (
                        <li
                          key={name}
                          className={`flex min-w-0 flex-1 items-center gap-2 ${number === lastStep ? "last:flex-none" : ""}`}
                        >
                          <button
                            type="button"
                            onClick={() => goToStep(number)}
                            disabled={!clickable}
                            aria-current={active ? "step" : undefined}
                            aria-label={`${name}, paso ${number}${completed ? ", volver a este paso" : active ? ", paso actual" : ", pendiente"}`}
                            className={`group flex min-w-0 shrink-0 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-4 focus-visible:ring-[#5368c8]/20 ${clickable ? "cursor-pointer" : "cursor-default"}`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${completed ? "border-[#b8e8cc] bg-[#e1f7e9] text-[#218052] group-hover:border-[#74cf98] group-hover:bg-[#d4f2df]" : active ? "border-[#17233f] bg-[#17233f] text-white" : "border-[#dce3ee] bg-white text-[#73809a]"}`}
                            >
                              {completed ? "✓" : number}
                            </span>
                            <span
                              className={`whitespace-nowrap text-sm font-bold ${active ? "text-[#17233f]" : completed ? "text-[#263653]" : "text-[#96a2b8]"}`}
                            >
                              {name}
                            </span>
                          </button>
                          {number < lastStep && (
                            <span
                              aria-hidden="true"
                              className={`h-0.5 min-w-8 flex-1 ${completed ? "bg-[#74cf98]" : "bg-[#dfe5ef]"}`}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </nav>
                <div
                  aria-hidden="true"
                  className="mt-2 h-px w-[calc(100%+2rem)] -translate-x-4 bg-[#e9edf5] sm:w-[calc(100%+3rem)] sm:-translate-x-6 lg:w-[calc(100%+4rem)] lg:-translate-x-8"
                />
              </>
            </header>
          )}
          <div
            className={`grid min-h-0 flex-1 gap-5 overflow-y-auto px-4 pb-4 pt-1 sm:px-6 sm:pb-5 sm:pt-1 lg:px-8 lg:pb-6 lg:pt-2 ${step > 1 && !isReviewStep && !sent ? "lg:grid-cols-[minmax(0,1fr)_18rem]" : ""}`}
          >
            <div
              className={`min-w-0 ${step === 1 || sent ? "mx-auto w-full max-w-[820px]" : ""}`}
              data-form-fields
              data-enter-advance={
                selectedProvider &&
                step >= 3 &&
                (getStepKey(selectedProvider, step) === "remitter" ||
                  getStepKey(selectedProvider, step) === "beneficiary" ||
                  getStepKey(selectedProvider, step) === "pep" ||
                  getStepKey(selectedProvider, step) === "additionalInfo")
                  ? ""
                  : undefined
              }
            >
              <div>
                {step === 1 && (
                  <div className="mb-4">
                    <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-[#5368c8]">
                      Paso {step} de {lastStep}
                    </p>
                    <h1 className="text-xl font-bold tracking-[-0.02em] text-[#17233f]">
                      {step === 1
                        ? "Identifica al remitente"
                        : step === 2
                          ? "Cotización de la remesa"
                          : activeSteps[step - 1]}
                    </h1>
                    <p className="mt-1 text-sm leading-5 text-[#687790]">
                      Completa la información necesaria para continuar.
                    </p>
                  </div>
                )}
                {step === 1 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      searchClient();
                    }}
                    className="mx-auto max-w-[680px] space-y-3"
                  >
                    <label className="block">
                      <span className="mb-1 mt-10 block text-sm font-semibold text-[#263653]">
                        Tipo de documento{" "}
                        <span className="text-[#c73750]">*</span>
                      </span>
                      <select
                        defaultValue="ci"
                        className="h-10 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#263653] outline-none focus:border-[#5368c8]"
                      >
                        <option value="cde">Carnet de extranjero</option>
                        <option value="ci">Cédula</option>
                        <option value="cdm">Cédula de mercosur</option>
                        <option value="p">Pasaporte</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-[#263653]">
                        Número de documento{" "}
                        <span className="text-[#c73750]">*</span>
                      </span>
                      <input
                        autoFocus
                        onKeyDown={trapDocumentFocus}
                        inputMode="numeric"
                        maxLength={7}
                        value={documentNumber}
                        onChange={(e) => {
                          setDocumentNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 7),
                          );
                          setResult(null);
                        }}
                        placeholder="Ingresa el número de documento"
                        className="h-10 w-full rounded-lg border border-[#cdd5e1] px-3 text-sm text-[#263653] outline-none placeholder:text-[#a2adbf] focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10"
                      />

                      <span className="mt-1 block text-xs text-[#7b879b]">
                        Solo números, sin espacios.
                      </span>
                    </label>
                    <button
                      disabled={!documentNumber || loading}
                      className="h-10 w-full rounded-lg bg-[#465bc2] text-sm font-bold mt-1 text-white disabled:bg-[#b8c1dc]"
                    >
                      {loading ? "Buscando cliente…" : "Buscar"}
                    </button>
                    <div
                      aria-live="polite"
                      className={
                        result
                          ? "mt-2 border-t border-[#e9edf5] pt-6"
                          : undefined
                      }
                    >
                      {result === "success" && (
                        <div className="rounded-xl border border-[#cde8db] bg-[#f1faf5] p-5">
                          <p className="text-xs font-bold uppercase text-[#23815d]">
                            ✓ Cliente encontrado
                          </p>
                          <h2 className="mt-2 text-xl font-bold text-[#1f6d55]">
                            Eliana Antezana Ovando
                          </h2>
                          <p className="mt-2 text-sm text-[#5d7c72]">
                            Documento: {documentNumber} · j***@cislatam.com
                          </p>
                          <div className="mt-4 flex justify-end gap-3">
                            <button
                              type="button"
                              className="rounded-lg border border-[#b8d8c9] px-4 py-2 text-sm font-bold text-[#28694f]"
                            >
                              Ver perfil
                            </button>
                            <button
                              type="button"
                              ref={continueRef}
                              onClick={next}
                              className="rounded-lg bg-[#465bc2] px-4 py-2 text-sm font-bold text-white"
                            >
                              Continuar
                            </button>
                          </div>
                        </div>
                      )}
                      {result === "empty" && (
                        <div className="rounded-xl border border-[#eadcae] bg-[#fffaf0] p-5">
                          <p className="font-bold text-[#5d4b19]">
                            No encontramos un cliente asociado a este documento.
                          </p>
                          <p className="mt-1 text-sm text-[#8a7740]">
                            Puedes registrar un nuevo cliente para continuar.
                          </p>
                          <div className="mt-4 flex justify-end gap-3">
                            <button
                              type="button"
                              className="rounded-lg bg-[#465bc2] px-4 py-2 text-sm font-bold text-white"
                            >
                              Registrar cliente
                            </button>
                            <button
                              type="button"
                              ref={continueRef}
                              onClick={next}
                              className="rounded-lg border border-[#d6c688] px-4 py-2 text-sm font-bold text-[#765d12]"
                            >
                              Continuar
                            </button>
                          </div>
                        </div>
                      )}
                      {result === "error" && (
                        <div
                          role="alert"
                          className="rounded-xl border border-[#f0c8cf] bg-[#fff5f6] p-5"
                        >
                          <p className="font-bold text-[#7f2638]">
                            No pudimos completar la búsqueda
                          </p>
                          <p className="mt-1 text-sm text-[#a34f60]">
                            Ocurrió un problema temporal. Verifica tu conexión e
                            inténtalo nuevamente.
                          </p>
                          <button
                            type="button"
                            onClick={searchClient}
                            className="mt-4 rounded-lg bg-[#b52e45] px-4 py-2 text-sm font-bold text-white"
                          >
                            Reintentar
                          </button>
                        </div>
                      )}
                      {result === "blocked" && (
                        <div
                          role="alert"
                          className="rounded-xl border border-[#f0c8cf] bg-[#fff5f6] p-5"
                        >
                          <p className="font-bold text-[#7f2638]">
                            Cliente bloqueado
                          </p>
                          <p className="mt-1 text-sm text-[#a34f60]">
                            Este cliente no puede continuar con la transacción.
                            Contacta a un supervisor si necesitas asistencia.
                          </p>
                        </div>
                      )}
                    </div>
                  </form>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-bold text-[#17233f]">
                      Datos de la cotización
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="Moneda de origen" value="USD" disabled />
                      <SearchableSelect
                        label="País de destino"
                        showFlags
                        value={destinationCountry}
                        options={destinationCountryOptions}
                        fieldRef={destinationCountryRef}
                        nextRef={deliveryTypeRef}
                        onChange={(value) => {
                          setDestinationCountry(value);
                          setDeliveryType("");
                          clearDeliveryExtras();
                          clearAmount();
                        }}
                      />
                      <SearchableSelect
                        label="Tipo de envío"
                        value={
                          deliveryType ? deliveryTypeLabel(deliveryType) : ""
                        }
                        options={DELIVERY_TYPE_OPTIONS.map(
                          (option) => option.label,
                        )}
                        fieldRef={deliveryTypeRef}
                        disabled={!destinationCountry}
                        onChange={(label) => {
                          const option = DELIVERY_TYPE_OPTIONS.find(
                            (item) => item.label === label,
                          );
                          if (!option) {
                            throw new Error(
                              `Unknown delivery type label: ${label}`,
                            );
                          }
                          setDeliveryType(option.id);
                          clearDeliveryExtras();
                          clearAmount();
                          const nextVisibility = quoteFieldVisibility(
                            option.id,
                          );
                          if (nextVisibility.showRiaPartnerLocation) {
                            simulateOptionsLoad(
                              setPartnerLoading,
                              payingPartnerRef,
                            );
                            return;
                          }
                          window.requestAnimationFrame(() => {
                            if (nextVisibility.showWuService) {
                              wuServiceRef.current?.focus();
                              return;
                            }
                            if (nextVisibility.showQpayCompany) {
                              qpayCompanyRef.current?.focus();
                              return;
                            }
                            sendAmountRef.current?.focus();
                          });
                        }}
                      />
                      <div>
                        <label className="block">
                          <span className="mb-1 block text-sm font-semibold text-[#263653]">
                            Monto a enviar
                          </span>
                          <span className="relative block">
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold ${amountUnlocked ? "text-[#465bc2]" : "text-[#a3adbd]"}`}
                            >
                              USD $
                            </span>
                            <input
                              ref={sendAmountRef}
                              value={sendAmount}
                              aria-describedby={
                                amountExceedsBalance
                                  ? "send-amount-currency send-amount-balance-error"
                                  : "send-amount-currency"
                              }
                              aria-invalid={amountExceedsBalance}
                              onChange={(event) => {
                                setSendAmount(
                                  sanitizeAmount(event.target.value),
                                );
                                setAmountExceedsBalance(false);
                                resetQuoteSelection();
                              }}
                              onBlur={() => {
                                const normalized = normalizeAmount(sendAmount);
                                setSendAmount(normalized);
                                const amount = Number(
                                  normalized
                                    .replace(/\./g, "")
                                    .replace(",", "."),
                                );
                                setAmountExceedsBalance(
                                  Number.isFinite(amount) &&
                                    amount > 0 &&
                                    toCents(amount) >
                                      toCents(AGENCY_USD_BALANCE),
                                );
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key !== "Enter" ||
                                  event.nativeEvent.isComposing ||
                                  event.keyCode === 229
                                )
                                  return;
                                event.preventDefault();
                                requestQuote();
                              }}
                              disabled={!amountUnlocked}
                              placeholder="0,00"
                              inputMode="decimal"
                              className={`h-10 w-full rounded-lg border pl-16 pr-3 text-sm text-[#17233f] outline-none disabled:bg-[#f3f5f9] disabled:text-[#8a96aa] focus:ring-4 ${amountExceedsBalance ? "border-[#e39aa8] focus:border-[#b52e45] focus:ring-[#b52e45]/15" : "border-[#cdd5e1] focus:border-[#5368c8] focus:ring-[#5368c8]/10"}`}
                            />
                            <span id="send-amount-currency" className="sr-only">
                              Dólares estadounidenses, máximo dos decimales
                            </span>
                          </span>
                        </label>
                        {amountExceedsBalance && (
                          <p
                            id="send-amount-balance-error"
                            role="alert"
                            className="mt-1 text-sm text-[#a34f60]"
                          >
                            El monto supera el saldo virtual de la agencia (
                            {formatUsd(AGENCY_USD_BALANCE)}). No es posible
                            cotizar.
                          </p>
                        )}
                        <div
                          role="group"
                          aria-label="Montos rápidos"
                          className="mt-2 flex flex-wrap gap-1.5"
                        >
                          {QUICK_AMOUNTS.map((amount) => {
                            const selected =
                              normalizeAmount(sendAmount) ===
                              usdFormatter.format(amount);
                            return (
                              <button
                                key={amount}
                                type="button"
                                aria-pressed={selected}
                                disabled={!amountUnlocked || quoteLoading}
                                onClick={() => {
                                  setSendAmount(usdFormatter.format(amount));
                                  setAmountExceedsBalance(
                                    toCents(amount) >
                                      toCents(AGENCY_USD_BALANCE),
                                  );
                                  resetQuoteSelection();
                                  sendAmountRef.current?.focus();
                                }}
                                className={`h-7 rounded-full border px-2.5 text-xs font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20 disabled:cursor-not-allowed disabled:border-[#e2e7ef] disabled:bg-transparent disabled:text-[#a3adbd] ${selected ? "border-[#5a6578] bg-white text-[#17233f]" : "border-[#d5dbe6] bg-white text-[#5a6578] hover:border-[#9aa3b5] hover:text-[#17233f]"}`}
                              >
                                ${amount}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Field
                        label="Monto que recibe"
                        value={
                          sendAmount
                            ? formatUsd(
                                Number(
                                  normalizeAmount(sendAmount)
                                    .replace(/\./g, "")
                                    .replace(",", "."),
                                ),
                              )
                            : ""
                        }
                        disabled
                      />
                      {showPartnerLocation && (
                        <>
                          <SearchableSelect
                            label="Socio pagador"
                            value={payingPartner}
                            options={payoutPartnerOptions}
                            fieldRef={payingPartnerRef}
                            loading={partnerLoading}
                            onChange={(value) => {
                              setPayingPartner(value);
                              setLocation("");
                              resetQuoteSelection();
                              setSendAmount("");
                              simulateOptionsLoad(
                                setLocationLoading,
                                locationRef,
                              );
                            }}
                          />
                          <SearchableSelect
                            label="Locación"
                            value={location}
                            options={payoutLocationOptions}
                            fieldRef={locationRef}
                            nextRef={
                              showWuService
                                ? wuServiceRef
                                : showQpayCompany
                                  ? qpayCompanyRef
                                  : sendAmountRef
                            }
                            loading={locationLoading}
                            disabled={!payingPartner}
                            onChange={(value) => {
                              setLocation(value);
                              resetQuoteSelection();
                              setSendAmount("");
                            }}
                          />
                        </>
                      )}
                      {showWuService && deliveryType !== "" && (
                        <SearchableSelect
                          label="Servicio de envío"
                          value={wuService}
                          options={WU_SERVICE_OPTIONS[deliveryType]}
                          fieldRef={wuServiceRef}
                          nextRef={
                            showQpayCompany
                              ? qpayCompanyRef
                              : showTerraPayBank
                                ? terraPayBankRef
                                : showTerraPayWallet
                                  ? terraPayWalletRef
                                  : sendAmountRef
                          }
                          onChange={(value) => {
                            setWuService(value);
                            resetQuoteSelection();
                            setSendAmount("");
                          }}
                        />
                      )}
                      {showQpayCompany && (
                        <SearchableSelect
                          label="Compañía"
                          value={qpayCompany}
                          options={QPAY_COMPANY_OPTIONS}
                          fieldRef={qpayCompanyRef}
                          nextRef={
                            showTerraPayBank
                              ? terraPayBankRef
                              : showTerraPayWallet
                                ? terraPayWalletRef
                                : sendAmountRef
                          }
                          onChange={(value) => {
                            setQpayCompany(value);
                            resetQuoteSelection();
                            setSendAmount("");
                          }}
                        />
                      )}
                      {showTerraPayBank && (
                        <SearchableSelect
                          label="Banco"
                          value={terraPayBank}
                          options={TERRAPAY_BANK_OPTIONS}
                          fieldRef={terraPayBankRef}
                          nextRef={sendAmountRef}
                          onChange={(value) => {
                            setTerraPayBank(value);
                            resetQuoteSelection();
                          }}
                        />
                      )}
                      {showTerraPayWallet && (
                        <SearchableSelect
                          label="Wallet"
                          value={terraPayWallet}
                          options={TERRAPAY_WALLET_OPTIONS}
                          fieldRef={terraPayWalletRef}
                          nextRef={sendAmountRef}
                          onChange={(value) => {
                            setTerraPayWallet(value);
                            resetQuoteSelection();
                          }}
                        />
                      )}

                      <div className="sm:col-span-2 sm:flex sm:items-end lg:col-span-3">
                        <button
                          type="button"
                          onClick={requestQuote}
                          disabled={
                            !amountUnlocked ||
                            !sendAmount ||
                            quoteLoading ||
                            amountExceedsBalance
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#c5cddb] px-5 text-sm font-bold text-[#3a4558] transition-colors hover:border-[#9aa3b5] hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:border-[#e2e7ef] disabled:text-[#a3adbd] disabled:hover:bg-transparent focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20"
                        >
                          {quoteLoading && (
                            <span
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                            />
                          )}
                          {quoteLoading ? "Cotizando..." : "Cotizar"}
                        </button>
                      </div>
                    </div>
                    {quotesReady && deliveryType && (
                      <QuoteResults
                        quotes={providerQuotes}
                        selectedProvider={selectedProvider}
                        deliveryType={deliveryType}
                        onSelect={selectProviderQuote}
                      />
                    )}
                  </div>
                )}
                {step >= 3 && selectedProvider && quote && (
                  <ProviderStepContent
                    provider={selectedProvider}
                    step={step}
                    documentNumber={documentNumber}
                    known={known}
                    isKnownClient={isKnownClient}
                    beneficiaries={beneficiaries}
                    selectedBeneficiary={selectedBeneficiary}
                    onSelectBeneficiary={setSelectedBeneficiary}
                    additionalChecks={additionalChecks}
                    onAdditionalCheckChange={(label, checked) =>
                      setAdditionalChecks((current) => ({
                        ...current,
                        [label]: checked,
                      }))
                    }
                    quote={quote}
                    totalToCharge={totalToCharge}
                    formatUsd={formatUsd}
                    destinationCountry={destinationCountry}
                    payingPartner={payingPartner}
                    location={location}
                    wuService={wuService}
                    qpayCompany={qpayCompany}
                    terraPayBank={terraPayBank}
                    terraPayWallet={terraPayWallet}
                    senderName={senderName}
                    paymentMethod={paymentMethod}
                    receivedValue={receivedValue}
                    changeDue={changeDue}
                    billingName={billingName}
                    billingNit={billingNit}
                    onEditQuote={() => setStep(2)}
                    onEditRemitter={() =>
                      setStep(findStepNumber(activeSteps, "Remitente"))
                    }
                    onEditBeneficiary={() =>
                      setStep(findStepNumber(activeSteps, "Beneficiario"))
                    }
                    onEditPayment={() =>
                      setStep(findStepNumber(activeSteps, "Método de pago"))
                    }
                    paymentMethodSlot={
                      <SearchableSelect
                        label="Método de pago"
                        value={paymentMethod}
                        options={paymentMethodOptions}
                        fieldRef={paymentMethodRef}
                        nextRef={receivedAmountRef}
                        onChange={setPaymentMethod}
                      />
                    }
                    receivedAmountRef={receivedAmountRef}
                    nextButtonRef={nextButtonRef}
                    receivedAmount={receivedAmount}
                    onReceivedAmountChange={setReceivedAmount}
                    onReceivedAmountBlur={() =>
                      setReceivedAmount((current) => normalizeAmount(current))
                    }
                    sanitizeAmount={sanitizeAmount}
                    receivedInsufficient={receivedInsufficient}
                    toCents={toCents}
                    paymentReady={paymentReady}
                    billingSlot={
                      <BillingSummary
                        open={billingOpen}
                        onToggle={() => setBillingOpen((current) => !current)}
                        name={billingName}
                        nit={billingNit}
                        usingSender={billingOverride === null}
                        onChange={(field, value) =>
                          setBillingOverride({
                            name: billingName,
                            nit: billingNit,
                            [field]: value,
                          })
                        }
                        onReset={() => {
                          setBillingOverride(null);
                          setBillingOpen(false);
                        }}
                      />
                    }
                  />
                )}
              </div>
            </div>
            {step > 1 && !isReviewStep && (
              <div className="sticky top-6 flex flex-col gap-3 self-start">
                <aside className="rounded-xl border border-[#e1e6ef] bg-[#fbfcfe] p-3">
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#73809a]">
                    Remitente
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-[#17233f]">
                    {isKnownClient ? "Eliana Antezana Ovando" : "Nuevo cliente"}
                  </p>
                  <p className="mt-1 text-xs text-[#687790]">
                    Cédula: {documentNumber}
                    {isKnownClient && " · j***@cislatam.com"}
                  </p>
                  {isKnownClient && (
                    <p className="mt-1 text-sm font-semibold text-[#5368c8]">
                      PEP: Sí
                    </p>
                  )}
                </aside>
                <Summary
                  provider={selectedProvider}
                  quote={quote}
                  deliveryType={deliveryType}
                  loading={quoteLoading}
                />
              </div>
            )}
          </div>
          {step > 1 && (
            <div className="flex h-[42px] shrink-0 items-center border-t border-[#e9edf5] bg-white px-4 sm:px-6 lg:px-8">
              <div className="flex w-full items-center justify-between">
                <button
                  type="button"
                  onClick={back}
                  className="rounded-md border border-[#dce3ee] px-4 py-1 text-sm font-bold text-[#687790]"
                >
                  Volver
                </button>
                <button
                  type="button"
                  ref={nextButtonRef}
                  data-next-button
                  onClick={handleContinue}
                  disabled={
                    (step === 2 && !selectedProvider) ||
                    (isPaymentStep && !paymentReady)
                  }
                  className="rounded-md bg-[#465bc2] px-4 py-1 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-[#5368c8]/30 disabled:cursor-not-allowed disabled:bg-[#b9c1e3]"
                >
                  {isReviewStep ? "Confirmar y enviar" : "Siguiente"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
