"use client";

import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, Trash2, XIcon } from "lucide-react";
import type {
  PaymentCurrency,
  PaymentLine,
} from "@/components/send-money/types";
import { BillingSummary } from "@/components/ui/billing-summary";
import { SearchableSelect } from "@/components/ui/searchable-select";

const CURRENCIES: PaymentCurrency[] = ["USD", "BOB"];

function ExtraPaymentEditRow({
  line,
  maxUsdCents,
  bobPerUsd,
  methodOptions,
  currencyOptions,
  isCombinationTaken,
  formatUsd,
  formatAmount,
  amountDraft,
  sanitizeAmount,
  parseAmount,
  toCents,
  onAmountDraftChange,
  onAmountDraftClear,
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
  amountDraft: string | undefined;
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
  onAmountDraftChange: (value: string) => void;
  onAmountDraftClear: () => void;
  onUpdate: (patch: Omit<PaymentLine, "id">) => void;
  onRemove: () => void;
}) {
  const methodRef = useRef<HTMLButtonElement>(null);
  const currencyRef = useRef<HTMLButtonElement>(null);

  const applyCurrency = (
    method: string,
    currency: PaymentCurrency,
  ) => {
    if (!(line.amount > 0) || line.usdCents === 0) {
      onUpdate({ method, currency, amount: 0, usdCents: 0 });
      return;
    }
    const max =
      currency === "USD"
        ? maxUsdCents / 100
        : Math.floor(maxUsdCents * bobPerUsd) / 100;
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
  };

  return (
    <li>
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
        />
        <div className="min-w-0">
          <input
            value={
              amountDraft !== undefined
                ? amountDraft
                : formatAmount(line.amount)
            }
            inputMode="decimal"
            autoComplete="off"
            aria-label={`Monto en ${line.currency} de ${line.method}`}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) =>
              onAmountDraftChange(sanitizeAmount(e.target.value))
            }
            onBlur={() => {
              if (amountDraft === undefined) return;
              const amount = parseAmount(amountDraft);
              const max =
                line.currency === "USD"
                  ? maxUsdCents / 100
                  : Math.floor(maxUsdCents * bobPerUsd) / 100;
              const usdCents =
                line.currency === "USD"
                  ? toCents(amount)
                  : Math.round(toCents(amount) / bobPerUsd);
              const next = usdCents > maxUsdCents ? max : amount;
              onAmountDraftClear();
              if (!(next > 0)) return;
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
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onAmountDraftClear();
                return;
              }
              if (
                e.key !== "Enter" ||
                e.nativeEvent.isComposing ||
                e.keyCode === 229
              )
                return;
              e.preventDefault();
              e.currentTarget.blur();
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

export type EditPaymentBillingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatUsd: (value: number) => string;
  formatAmount: (value: number) => string;
  bobPerUsd: number;
  primaryMethod: string;
  onPrimaryMethodChange: (value: string) => void;
  primaryCurrency: PaymentCurrency;
  onPrimaryCurrencyChange: (value: PaymentCurrency) => void;
  primaryCents: number;
  extraPayments: PaymentLine[];
  onUpdatePayment: (id: number, line: Omit<PaymentLine, "id">) => void;
  onRemovePayment: (id: number) => void;
  onAddPayment: (line: Omit<PaymentLine, "id">) => void;
  paymentMethodOptions: string[];
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
  billingOpen: boolean;
  onBillingOpenToggle: () => void;
  billingName: string;
  billingNit: string;
  usingSenderBilling: boolean;
  onBillingChange: (field: "name" | "nit", value: string) => void;
  onBillingReset: () => void;
};

export function EditPaymentBillingDialog({
  open,
  onOpenChange,
  formatUsd,
  formatAmount,
  bobPerUsd,
  primaryMethod,
  onPrimaryMethodChange,
  primaryCurrency,
  onPrimaryCurrencyChange,
  primaryCents,
  extraPayments,
  onUpdatePayment,
  onRemovePayment,
  onAddPayment,
  paymentMethodOptions,
  sanitizeAmount,
  parseAmount,
  toCents,
  billingOpen,
  onBillingOpenToggle,
  billingName,
  billingNit,
  usingSenderBilling,
  onBillingChange,
  onBillingReset,
}: EditPaymentBillingDialogProps) {
  const primaryMethodRef = useRef<HTMLButtonElement>(null);
  const primaryCurrencyRef = useRef<HTMLButtonElement>(null);
  const [amountDrafts, setAmountDrafts] = useState<Record<number, string>>({});

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
  const freeCombo = (() => {
    for (const method of paymentMethodOptions) {
      for (const currency of CURRENCIES) {
        if (
          !usedLines.some(
            (line) => line.method === method && line.currency === currency,
          )
        ) {
          return { method, currency };
        }
      }
    }
    return null;
  })();
  const canAddPayment = primaryCents > 0 && freeCombo !== null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
                  Editar pago y facturación
                </Dialog.Title>
              </div>
              <Dialog.Close
                aria-label="Cerrar"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2">
              <div className="">
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
                  />
                  <div className="flex min-h-10 flex-col items-end justify-center text-right">
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatAmount(primaryAmount)}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      aria-live="polite"
                    >
                      {formatUsd(primaryCents / 100)}
                    </p>
                  </div>
                </div>

                {extraPayments.length > 0 && (
                  <ul className="mt-3 space-y-2 border-t border-border pt-3">
                    {extraPayments.map((line) => (
                      <ExtraPaymentEditRow
                        key={line.id}
                        line={line}
                        maxUsdCents={primaryCents + line.usdCents}
                        bobPerUsd={bobPerUsd}
                        methodOptions={methodOptionsFor(line.id)}
                        currencyOptions={currencyOptionsFor(
                          line.method,
                          line.id,
                        )}
                        isCombinationTaken={(method, currency) =>
                          isTaken(method, currency, line.id)
                        }
                        formatUsd={formatUsd}
                        formatAmount={formatAmount}
                        amountDraft={amountDrafts[line.id]}
                        sanitizeAmount={sanitizeAmount}
                        parseAmount={parseAmount}
                        toCents={toCents}
                        onAmountDraftChange={(value) =>
                          setAmountDrafts((current) => ({
                            ...current,
                            [line.id]: value,
                          }))
                        }
                        onAmountDraftClear={() =>
                          setAmountDrafts((current) => {
                            const nextDrafts = { ...current };
                            delete nextDrafts[line.id];
                            return nextDrafts;
                          })
                        }
                        onUpdate={(patch) => onUpdatePayment(line.id, patch)}
                        onRemove={() => onRemovePayment(line.id)}
                      />
                    ))}
                  </ul>
                )}

                {canAddPayment && (
                  <button
                    type="button"
                    onClick={() => {
                      if (freeCombo === null) return;
                      onAddPayment({
                        method: freeCombo.method,
                        currency: freeCombo.currency,
                        amount: 0,
                        usdCents: 0,
                      });
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5 text-xs font-semibold text-brand-strong hover:bg-accent focus:outline-none focus:ring-4 focus:ring-brand/20"
                  >
                    <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                    Agregar otra forma
                  </button>
                )}
              </div>

              <BillingSummary
                open={billingOpen}
                onToggle={onBillingOpenToggle}
                name={billingName}
                nit={billingNit}
                usingSender={usingSenderBilling}
                onChange={onBillingChange}
                onReset={onBillingReset}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Dialog.Close className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20">
                Cancelar
              </Dialog.Close>
              <button
                type="button"
                onClick={() => {
                  for (const line of extraPayments) {
                    if (!(line.usdCents > 0)) onRemovePayment(line.id);
                  }
                  onOpenChange(false);
                }}
                className="rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30"
              >
                Guardar
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
