import { useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "../field";
import type { PaymentCurrency, PaymentLine } from "../types";

export type SelectRenderer = (args: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  fieldRef: RefObject<HTMLButtonElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  hideLabel?: boolean;
}) => ReactNode;

const CURRENCIES: PaymentCurrency[] = ["USD", "BOB"];
const LINE_GRID =
  "sm:grid-cols-[minmax(0,2fr)_130px_minmax(0,1fr)_minmax(0,1fr)_40px]";
const cellLabel =
  "text-xs font-semibold uppercase tracking-wide text-[#73809a] sm:hidden";

const toUsdCents = (
  amount: number,
  currency: PaymentCurrency,
  bobPerUsd: number,
  toCents: (value: number) => number,
) =>
  currency === "USD"
    ? toCents(amount)
    : Math.round(toCents(amount) / bobPerUsd);

function ExtraPaymentRow({
  line,
  maxUsdCents,
  bobPerUsd,
  methodOptions,
  currencyOptions,
  renderSelect,
  formatUsd,
  formatAmount,
  sanitizeAmount,
  parseAmount,
  toCents,
  onUpdate,
  onRemove,
}: {
  line: PaymentLine;
  /** Lo que la línea puede llegar a cubrir: su monto actual + el saldo de la principal. */
  maxUsdCents: number;
  bobPerUsd: number;
  /** Opciones sin las combinaciones método + moneda ya usadas en otras líneas. */
  methodOptions: string[];
  currencyOptions: PaymentCurrency[];
  renderSelect: SelectRenderer;
  formatUsd: (value: number) => string;
  formatAmount: (value: number) => string;
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
  onUpdate: (patch: Omit<PaymentLine, "id">) => void;
  onRemove: () => void;
}) {
  const methodRef = useRef<HTMLButtonElement>(null);
  const currencyRef = useRef<HTMLButtonElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [amountDraft, setAmountDraft] = useState<string | null>(null);
  const [clamped, setClamped] = useState(false);

  const maxIn = (currency: PaymentCurrency) =>
    currency === "USD"
      ? maxUsdCents / 100
      : Math.floor(maxUsdCents * bobPerUsd) / 100;

  // Recalcula el equivalente USD y, si supera lo disponible, ajusta al máximo.
  const commit = (amount: number, currency: PaymentCurrency) => {
    const max = maxIn(currency);
    const exceeds =
      toUsdCents(amount, currency, bobPerUsd, toCents) > maxUsdCents;
    const next = exceeds ? max : amount;
    setClamped(exceeds);
    if (!(next > 0)) {
      setAmountDraft(null);
      return;
    }
    onUpdate({
      method: line.method,
      currency,
      amount: next,
      usdCents: Math.min(
        toUsdCents(next, currency, bobPerUsd, toCents),
        maxUsdCents,
      ),
    });
    setAmountDraft(null);
  };

  return (
    <li
      className={`grid gap-2 px-4 py-3 sm:items-center sm:gap-3 ${LINE_GRID}`}
    >
      <div>
        {renderSelect({
          label: "Forma de pago",
          options: methodOptions,
          value: line.method,
          onChange: (method) => onUpdate({ ...line, method }),
          fieldRef: methodRef,
          nextRef: currencyRef,
          hideLabel: true,
        })}
      </div>
      <div>
        {renderSelect({
          label: "Moneda",
          options: currencyOptions,
          value: line.currency,
          onChange: (value) => commit(line.amount, value as PaymentCurrency),
          fieldRef: currencyRef,
          nextRef: amountRef,
          hideLabel: true,
        })}
      </div>
      <div className="flex items-center justify-between gap-3 sm:block">
        <span className={cellLabel}>Monto</span>
        <input
          ref={amountRef}
          value={amountDraft ?? formatAmount(line.amount)}
          inputMode="decimal"
          autoComplete="off"
          aria-label={`Monto en ${line.currency} de ${line.method}`}
          aria-describedby={clamped ? `payment-${line.id}-clamped` : undefined}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            setClamped(false);
            setAmountDraft(sanitizeAmount(e.target.value));
          }}
          onBlur={() => {
            if (amountDraft !== null)
              commit(parseAmount(amountDraft), line.currency);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setAmountDraft(null);
              return;
            }
            if (
              e.key !== "Enter" ||
              e.nativeEvent.isComposing ||
              e.keyCode === 229
            )
              return;
            e.preventDefault();
            if (amountDraft !== null)
              commit(parseAmount(amountDraft), line.currency);
          }}
          className="h-10 w-36 rounded-lg border border-[#cdd5e1] bg-white px-3 text-right text-sm font-semibold text-[#263653] outline-none transition focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10 sm:w-full"
        />
        {clamped && (
          <p
            id={`payment-${line.id}-clamped`}
            role="status"
            className="mt-1 text-right text-xs text-[#b5622a]"
          >
            Ajustado al máximo disponible
          </p>
        )}
      </div>
      <div className="flex items-center justify-between sm:block sm:text-right">
        <span className={cellLabel}>Equivalente USD</span>
        <span className="text-sm text-[#5d6b85]">
          {formatUsd(line.usdCents / 100)}
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${line.method} ${formatAmount(line.amount)} ${line.currency}`}
        className="flex h-9 w-9 items-center justify-center justify-self-end rounded-lg text-[#c73750] transition hover:bg-[#fdf0f2] focus:outline-none focus:ring-4 focus:ring-[#c73750]/15"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </li>
  );
}

export function StandardPaymentStep({
  totalToCharge,
  formatUsd,
  formatAmount,
  bobPerUsd,
  primaryMethod,
  onPrimaryMethodChange,
  primaryMethodRef,
  primaryCurrency,
  onPrimaryCurrencyChange,
  primaryCents,
  extraPayments,
  onAddPayment,
  onUpdatePayment,
  onRemovePayment,
  renderSelect,
  paymentMethodOptions,
  sanitizeAmount,
  parseAmount,
  toCents,
  nextButtonRef,
  billingSlot,
}: {
  totalToCharge: number;
  formatUsd: (value: number) => string;
  formatAmount: (value: number) => string;
  bobPerUsd: number;
  primaryMethod: string;
  onPrimaryMethodChange: (value: string) => void;
  primaryMethodRef: RefObject<HTMLButtonElement | null>;
  primaryCurrency: PaymentCurrency;
  onPrimaryCurrencyChange: (value: PaymentCurrency) => void;
  primaryCents: number;
  extraPayments: PaymentLine[];
  onAddPayment: (line: Omit<PaymentLine, "id">) => void;
  onUpdatePayment: (id: number, line: Omit<PaymentLine, "id">) => void;
  onRemovePayment: (id: number) => void;
  renderSelect: SelectRenderer;
  paymentMethodOptions: string[];
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  billingSlot: ReactNode;
}) {
  const [draftMethod, setDraftMethod] = useState("");
  const [draftCurrency, setDraftCurrency] = useState<PaymentCurrency>("USD");
  const [draftAmount, setDraftAmount] = useState("");
  const draftMethodRef = useRef<HTMLButtonElement>(null);
  const draftCurrencyRef = useRef<HTMLButtonElement>(null);
  const primaryCurrencyRef = useRef<HTMLButtonElement>(null);
  const draftAmountRef = useRef<HTMLInputElement>(null);

  const draftValue = draftAmount ? parseAmount(draftAmount) : 0;
  const draftUsdCents = toUsdCents(
    draftValue,
    draftCurrency,
    bobPerUsd,
    toCents,
  );
  const draftExceeds = draftAmount !== "" && draftUsdCents > primaryCents;
  const availableBob = (primaryCents * bobPerUsd) / 100;
  const primaryAmount =
    primaryCurrency === "USD" ? primaryCents / 100 : availableBob;

  // Una forma de pago no puede repetirse con la misma moneda. id -1 = principal.
  const usedLines = [
    { id: -1, method: primaryMethod, currency: primaryCurrency },
    ...extraPayments,
  ].filter((line) => line.method !== "");
  const isTaken = (
    method: string,
    currency: PaymentCurrency,
    excludeId: number | null,
  ) =>
    usedLines.some(
      (line) =>
        line.id !== excludeId &&
        line.method === method &&
        line.currency === currency,
    );
  const methodOptionsFor = (currency: PaymentCurrency, id: number) =>
    paymentMethodOptions.filter((method) => !isTaken(method, currency, id));
  const currencyOptionsFor = (method: string, id: number) =>
    CURRENCIES.filter((currency) => !isTaken(method, currency, id));
  const draftDuplicate =
    draftMethod !== "" && isTaken(draftMethod, draftCurrency, null);
  const canAdd =
    draftMethod !== "" && draftUsdCents > 0 && !draftExceeds && !draftDuplicate;

  const addPayment = () => {
    if (!canAdd) return;
    onAddPayment({
      method: draftMethod,
      currency: draftCurrency,
      amount: draftValue,
      usdCents: draftUsdCents,
    });
    setDraftMethod("");
    setDraftAmount("");
    setDraftCurrency("USD");
    window.requestAnimationFrame(() => {
      if (primaryMethod === "" && primaryCents - draftUsdCents > 0)
        primaryMethodRef.current?.focus();
      else nextButtonRef.current?.focus();
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold">Registra el pago recibido</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Total a cobrar"
          value={formatUsd(totalToCharge)}
          disabled
          required
        />
        <Field
          label="Tipo de cambio"
          value={`1 USD = ${formatAmount(bobPerUsd)} BOB`}
          disabled
        />
      </div>

      <section
        aria-labelledby="payment-lines-title"
        className="rounded-xl border border-[#dce3ee] bg-white"
      >
        <div className="flex items-center justify-between border-b border-[#e6ebf3] px-4 py-3">
          <h3 id="payment-lines-title" className="text-sm font-bold">
            Formas de pago
          </h3>
          <span className="rounded-full bg-[#eef1ff] px-2.5 py-0.5 text-xs font-semibold text-[#465bc2]">
            {extraPayments.length + 1}{" "}
            {extraPayments.length === 0 ? "método" : "métodos"}
          </span>
        </div>
        <div
          className={`hidden gap-3 bg-[#f7f8fb] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#73809a] sm:grid ${LINE_GRID}`}
        >
          <span>Forma de pago</span>
          <span>Moneda</span>
          <span className="text-right">Monto</span>
          <span className="text-right">Equivalente USD</span>
          <span className="sr-only">Acciones</span>
        </div>
        <ul className="divide-y divide-[#e6ebf3]">
          <li
            className={`grid gap-2 px-4 py-3 sm:items-center sm:gap-3 ${LINE_GRID}`}
          >
            <div>
              {renderSelect({
                label: "Método de pago",
                options: methodOptionsFor(primaryCurrency, -1),
                value: primaryMethod,
                onChange: onPrimaryMethodChange,
                fieldRef: primaryMethodRef,
                nextRef: primaryCurrencyRef,
                hideLabel: true,
              })}
            </div>
            <div>
              {renderSelect({
                label: "Moneda",
                options: currencyOptionsFor(primaryMethod, -1),
                value: primaryCurrency,
                onChange: (value) =>
                  onPrimaryCurrencyChange(value as PaymentCurrency),
                fieldRef: primaryCurrencyRef,
                nextRef: nextButtonRef,
                hideLabel: true,
              })}
            </div>
            <div className="flex items-center justify-between sm:block sm:text-right">
              <span className={cellLabel}>Monto</span>
              <span className="text-sm font-semibold text-[#263653]">
                {formatAmount(primaryAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between sm:block sm:text-right">
              <span className={cellLabel}>Equivalente USD</span>
              <span className="text-sm text-[#5d6b85]" aria-live="polite">
                {formatUsd(primaryCents / 100)}
              </span>
            </div>
            <span aria-hidden="true" className="hidden sm:block" />
          </li>
          {extraPayments.map((line) => (
            <ExtraPaymentRow
              key={line.id}
              line={line}
              maxUsdCents={primaryCents + line.usdCents}
              bobPerUsd={bobPerUsd}
              methodOptions={methodOptionsFor(line.currency, line.id)}
              currencyOptions={currencyOptionsFor(line.method, line.id)}
              renderSelect={renderSelect}
              formatUsd={formatUsd}
              formatAmount={formatAmount}
              sanitizeAmount={sanitizeAmount}
              parseAmount={parseAmount}
              toCents={toCents}
              onUpdate={(patch) => onUpdatePayment(line.id, patch)}
              onRemove={() => onRemovePayment(line.id)}
            />
          ))}
        </ul>
        <div className="flex justify-between rounded-b-xl border-t border-[#e6ebf3] bg-[#f7f8fb] px-4 py-3 text-sm font-semibold">
          <span>Total asignado</span>
          <span>{formatUsd(totalToCharge)}</span>
        </div>
      </section>

      <section
        aria-labelledby="add-payment-title"
        className="rounded-xl border border-dashed border-[#cdd5e1] bg-[#fafbfd] p-4"
      >
        <h3 id="add-payment-title" className="text-sm font-bold">
          Agregar otra forma de pago
        </h3>
        <p className="mt-1 text-sm text-[#687790]">
          El monto se descuenta automáticamente de la forma de pago principal.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,2fr)_150px_minmax(0,1.4fr)_auto] sm:items-start">
          {renderSelect({
            label: "Forma de pago",
            options: paymentMethodOptions,
            value: draftMethod,
            onChange: setDraftMethod,
            fieldRef: draftMethodRef,
            nextRef: draftCurrencyRef,
          })}
          {renderSelect({
            label: "Moneda",
            options: CURRENCIES,
            value: draftCurrency,
            onChange: (value) => setDraftCurrency(value as PaymentCurrency),
            fieldRef: draftCurrencyRef,
            nextRef: draftAmountRef,
          })}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#263653]">
              Monto <span className="text-[#c73750]">*</span>
            </span>
            <div
              className={`flex h-10 items-center rounded-lg border bg-white transition focus-within:ring-4 ${
                draftExceeds
                  ? "border-[#c73750] focus-within:border-[#c73750] focus-within:ring-[#c73750]/10"
                  : "border-[#cdd5e1] focus-within:border-[#5368c8] focus-within:ring-[#5368c8]/10"
              }`}
            >
              <span className="shrink-0 whitespace-nowrap pl-3 text-sm font-semibold text-[#73809a]">
                {draftCurrency} $
              </span>
              <input
                ref={draftAmountRef}
                value={draftAmount}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0,00"
                aria-invalid={draftExceeds}
                aria-describedby="draft-amount-hint"
                onChange={(e) => setDraftAmount(sanitizeAmount(e.target.value))}
                onBlur={() =>
                  setDraftAmount((current) =>
                    current ? formatAmount(parseAmount(current)) : "",
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key !== "Enter" ||
                    e.nativeEvent.isComposing ||
                    e.keyCode === 229
                  )
                    return;
                  e.preventDefault();
                  if (canAdd) addPayment();
                  else if (draftMethod === "") draftMethodRef.current?.focus();
                }}
                className="h-full w-full rounded-lg bg-transparent px-2 text-sm text-[#263653] outline-none placeholder:text-[#a2adbf]"
              />
            </div>
            <p
              id="draft-amount-hint"
              role={draftExceeds ? "alert" : undefined}
              className={`mt-2 text-xs ${
                draftExceeds ? "font-medium text-[#c73750]" : "text-[#73809a]"
              }`}
            >
              {draftExceeds ? "Supera el saldo disponible. " : ""}
              Disponible:{" "}
              {draftCurrency === "USD"
                ? formatUsd(primaryCents / 100)
                : `${formatAmount(availableBob)} BOB`}
              {draftCurrency === "BOB" &&
                draftUsdCents > 0 &&
                !draftExceeds &&
                ` · Equivale a ${formatUsd(draftUsdCents / 100)}`}
            </p>
          </label>
          <div>
            <span aria-hidden="true" className="mb-1 hidden text-sm sm:block">
              &nbsp;
            </span>
            <button
              type="button"
              onClick={addPayment}
              disabled={!canAdd}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#17233f] px-4 text-sm font-semibold text-white transition hover:bg-[#25345a] focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20 disabled:cursor-not-allowed disabled:bg-[#cdd5e1] disabled:text-[#73809a] sm:w-auto"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
        {draftDuplicate && (
          <p role="alert" className="mt-3 text-sm font-medium text-[#c73750]">
            {draftMethod} en {draftCurrency} ya está registrado. Elige otra forma de pago o moneda.
          </p>
        )}
      </section>
      {billingSlot}
    </div>
  );
}

export function TerrapayPaymentStep({
  totalToCharge,
  formatUsd,
  billingSlot,
}: {
  totalToCharge: number;
  formatUsd: (value: number) => string;
  billingSlot: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-bold">Método de pago TerraPay</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Total a pagar"
          value={formatUsd(totalToCharge)}
          disabled
          required
        />
        <Field label="Saldo pendiente" value={formatUsd(0)} disabled required />
        <Field label="Casa de Cambio" value="Casa Central" required />
        <Field label="Moneda USD" value={formatUsd(totalToCharge)} disabled />
      </div>
      <p className="rounded-lg bg-[#f8faff] p-4 text-sm text-[#687790]">
        TerraPay no usa el selector multi-moneda; el cobro se registra contra
        casa de cambio.
      </p>
      {billingSlot}
    </div>
  );
}
