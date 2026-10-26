"use client";

import { useRef, useState, type RefObject } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { PaymentCurrency, PaymentLine } from "../types";

const CURRENCIES: PaymentCurrency[] = ["USD", "BOB"];

export type PaymentMethodPanelProps = {
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
  onUpdatePayment: (id: number, line: Omit<PaymentLine, "id">) => void;
  onRemovePayment: (id: number) => void;
  onAddPaymentOpen: () => void;
  paymentMethodOptions: string[];
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
};

export function PaymentMethodPanel({
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
  onUpdatePayment,
  onRemovePayment,
  onAddPaymentOpen,
  paymentMethodOptions,
  sanitizeAmount,
  parseAmount,
  toCents,
}: PaymentMethodPanelProps) {
  const primaryCurrencyRef = useRef<HTMLButtonElement>(null);
  const availableBob = (primaryCents * bobPerUsd) / 100;
  const primaryAmount =
    primaryCurrency === "USD" ? primaryCents / 100 : availableBob;

  const usedLines = [
    { id: -1, method: primaryMethod, currency: primaryCurrency },
    ...extraPayments,
  ];
  const isTaken = (
    method: string,
    currency: PaymentCurrency,
    excludeId: number,
  ) =>
    usedLines.some(
      (line) =>
        line.id !== excludeId &&
        line.method === method &&
        line.currency === currency,
    );
  const methodOptionsFor = (id: number) =>
    paymentMethodOptions.filter((method) =>
      CURRENCIES.some((currency) => !isTaken(method, currency, id)),
    );
  const currencyOptionsFor = (method: string, id: number) =>
    CURRENCIES.filter((currency) => !isTaken(method, currency, id));

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Método de pago
        </p>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[0.625rem] font-semibold text-amount">
          {extraPayments.length + 1}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)] items-start gap-2">
        <SearchableSelect
          label="Método de pago"
          options={methodOptionsFor(-1)}
          value={primaryMethod}
          onChange={(method) => {
            if (!isTaken(method, primaryCurrency, -1)) {
              onPrimaryMethodChange(method);
              return;
            }
            const freeCurrency = CURRENCIES.find(
              (currency) => !isTaken(method, currency, -1),
            );
            if (freeCurrency === undefined) return;
            onPrimaryCurrencyChange(freeCurrency);
            onPrimaryMethodChange(method);
          }}
          fieldRef={primaryMethodRef}
          nextRef={primaryCurrencyRef}
          hideLabel
          dropdownSide="top"
        />
        <SearchableSelect
          label="Moneda"
          options={currencyOptionsFor(primaryMethod, -1)}
          value={primaryCurrency}
          onChange={(value) =>
            onPrimaryCurrencyChange(value as PaymentCurrency)
          }
          fieldRef={primaryCurrencyRef}
          hideLabel
          dropdownSide="top"
        />
        <div className="flex min-h-10 flex-col items-end justify-center text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatAmount(primaryAmount)}
          </p>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {formatUsd(primaryCents / 100)}
          </p>
        </div>
      </div>

      {extraPayments.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-border pt-3">
          {extraPayments.map((line) => (
            <ExtraPaymentCompactRow
              key={line.id}
              line={line}
              maxUsdCents={primaryCents + line.usdCents}
              bobPerUsd={bobPerUsd}
              methodOptions={methodOptionsFor(line.id)}
              currencyOptions={currencyOptionsFor(line.method, line.id)}
              isCombinationTaken={(method, currency) =>
                isTaken(method, currency, line.id)
              }
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
      )}

      {primaryCents > 0 && (
        <button
          type="button"
          onClick={onAddPaymentOpen}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5 text-xs font-semibold text-brand-strong hover:bg-accent focus:outline-none focus:ring-4 focus:ring-brand/20"
        >
          <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          Agregar otra forma
        </button>
      )}
    </div>
  );
}

function ExtraPaymentCompactRow({
  line,
  maxUsdCents,
  bobPerUsd,
  methodOptions,
  currencyOptions,
  isCombinationTaken,
  formatUsd,
  formatAmount,
  sanitizeAmount,
  parseAmount,
  toCents,
  onUpdate,
  onRemove,
}: {
  line: PaymentLine;
  maxUsdCents: number;
  bobPerUsd: number;
  methodOptions: string[];
  currencyOptions: PaymentCurrency[];
  isCombinationTaken: (
    method: string,
    currency: PaymentCurrency,
  ) => boolean;
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
  const [amountDraft, setAmountDraft] = useState<string | null>(null);

  const maxIn = (currency: PaymentCurrency) =>
    currency === "USD"
      ? maxUsdCents / 100
      : Math.floor(maxUsdCents * bobPerUsd) / 100;

  const applyCurrency = (method: string, currency: PaymentCurrency) => {
    if (!(line.amount > 0) || line.usdCents === 0) {
      onUpdate({ method, currency, amount: 0, usdCents: 0 });
      setAmountDraft(null);
      return;
    }
    const max = maxIn(currency);
    const amount =
      currency === "USD"
        ? line.usdCents / 100
        : (line.usdCents * bobPerUsd) / 100;
    const next = amount > max ? max : amount;
    const nextUsdCents =
      currency === "USD"
        ? toCents(next)
        : Math.round(toCents(next) / bobPerUsd);
    onUpdate({
      method,
      currency,
      amount: next,
      usdCents: Math.min(nextUsdCents, maxUsdCents),
    });
    setAmountDraft(null);
  };

  const commitAmount = (amount: number) => {
    const max = maxIn(line.currency);
    const usdCents =
      line.currency === "USD"
        ? toCents(amount)
        : Math.round(toCents(amount) / bobPerUsd);
    const exceeds = usdCents > maxUsdCents;
    const next = exceeds ? max : amount;
    if (!(next > 0)) {
      setAmountDraft(null);
      return;
    }
    const nextUsdCents =
      line.currency === "USD"
        ? toCents(next)
        : Math.round(toCents(next) / bobPerUsd);
    onUpdate({
      method: line.method,
      currency: line.currency,
      amount: next,
      usdCents: Math.min(nextUsdCents, maxUsdCents),
    });
    setAmountDraft(null);
  };

  return (
    <li className="rounded-lg border border-border bg-muted/50 p-2">
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_auto] items-start gap-1.5">
        <SearchableSelect
          label="Forma de pago"
          options={methodOptions}
          value={line.method}
          onChange={(method) => {
            if (!isCombinationTaken(method, line.currency)) {
              onUpdate({ ...line, method });
              return;
            }
            const freeCurrency = CURRENCIES.find(
              (currency) => !isCombinationTaken(method, currency),
            );
            if (freeCurrency === undefined) return;
            applyCurrency(method, freeCurrency);
          }}
          fieldRef={methodRef}
          nextRef={currencyRef}
          hideLabel
          dropdownSide="top"
        />
        <SearchableSelect
          label="Moneda"
          options={currencyOptions}
          value={line.currency}
          onChange={(value) =>
            applyCurrency(line.method, value as PaymentCurrency)
          }
          fieldRef={currencyRef}
          hideLabel
          dropdownSide="top"
        />
        <div className="min-w-0">
          <input
            value={amountDraft ?? formatAmount(line.amount)}
            inputMode="decimal"
            autoComplete="off"
            aria-label={`Monto en ${line.currency} de ${line.method}`}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setAmountDraft(sanitizeAmount(e.target.value))}
            onBlur={() => {
              if (amountDraft !== null) commitAmount(parseAmount(amountDraft));
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
              if (amountDraft !== null) commitAmount(parseAmount(amountDraft));
            }}
            className="h-10 w-full rounded-lg border border-input bg-card px-2 text-right text-sm font-semibold text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
          <p className="mt-0.5 text-right text-xs text-muted-foreground">
            {formatUsd(line.usdCents / 100)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${line.method}`}
          className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/15"
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
