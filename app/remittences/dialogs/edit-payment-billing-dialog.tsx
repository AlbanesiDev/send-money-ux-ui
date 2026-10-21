"use client";

import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, Trash2, XIcon } from "lucide-react";
import type {
  PaymentCurrency,
  PaymentLine,
  ProviderId,
} from "@/components/send-money/types";
import { BillingSummary } from "@/components/ui/billing-summary";
import { SearchableSelect } from "@/components/ui/searchable-select";

const CURRENCIES: PaymentCurrency[] = ["USD", "BOB"];

export type EditPaymentBillingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderId | null;
  totalToCharge: number;
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
  provider,
  totalToCharge,
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

  const availableMethods = paymentMethodOptions.filter(
    (method) =>
      !usedLines.some(
        (line) => line.method === method && line.currency === "USD",
      ),
  );
  const canAddPayment = primaryCents > 0 && availableMethods.length > 0;

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
              {provider === "TERRAPAY" ? (
                <div className="rounded-xl shadow-sm">
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Método de pago
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    Casa de Cambio
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Casa Central
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    {formatUsd(totalToCharge)}
                  </p>
                </div>
              ) : (
                <div className="">
                  <div className="mt-2 grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)] items-start gap-2">
                    <SearchableSelect
                      label="Método de pago"
                      options={paymentMethodOptions.filter(
                        (method) =>
                          !usedLines.some(
                            (line) =>
                              line.id !== -1 &&
                              line.method === method &&
                              line.currency === primaryCurrency,
                          ),
                      )}
                      value={primaryMethod}
                      onChange={onPrimaryMethodChange}
                      fieldRef={primaryMethodRef}
                      nextRef={primaryCurrencyRef}
                      hideLabel
                    />
                    <SearchableSelect
                      label="Moneda"
                      options={CURRENCIES.filter(
                        (currency) =>
                          !usedLines.some(
                            (line) =>
                              line.id !== -1 &&
                              line.method === primaryMethod &&
                              line.currency === currency,
                          ),
                      )}
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
                      {extraPayments.map((line) => {
                        const maxUsdCents = primaryCents + line.usdCents;
                        const amountDraft = amountDrafts[line.id];

                        return (
                          <li key={line.id}>
                            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_auto] items-start gap-1.5">
                              <SearchableSelect
                                label="Forma de pago"
                                options={paymentMethodOptions.filter(
                                  (method) =>
                                    !usedLines.some(
                                      (used) =>
                                        used.id !== line.id &&
                                        used.method === method &&
                                        used.currency === line.currency,
                                    ),
                                )}
                                value={line.method}
                                onChange={(method) =>
                                  onUpdatePayment(line.id, { ...line, method })
                                }
                                hideLabel
                              />
                              <SearchableSelect
                                label="Moneda"
                                options={CURRENCIES.filter(
                                  (currency) =>
                                    !usedLines.some(
                                      (used) =>
                                        used.id !== line.id &&
                                        used.method === line.method &&
                                        used.currency === currency,
                                    ),
                                )}
                                value={line.currency}
                                onChange={(value) => {
                                  const currency = value as PaymentCurrency;
                                  const max =
                                    currency === "USD"
                                      ? maxUsdCents / 100
                                      : Math.floor(maxUsdCents * bobPerUsd) /
                                        100;
                                  const usdCents =
                                    currency === "USD"
                                      ? toCents(line.amount)
                                      : Math.round(
                                          toCents(line.amount) / bobPerUsd,
                                        );
                                  const next =
                                    usdCents > maxUsdCents ? max : line.amount;
                                  if (!(next > 0)) return;
                                  const nextUsdCents =
                                    currency === "USD"
                                      ? toCents(next)
                                      : Math.round(toCents(next) / bobPerUsd);
                                  onUpdatePayment(line.id, {
                                    method: line.method,
                                    currency,
                                    amount: next,
                                    usdCents: Math.min(
                                      nextUsdCents,
                                      maxUsdCents,
                                    ),
                                  });
                                }}
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
                                    setAmountDrafts((current) => ({
                                      ...current,
                                      [line.id]: sanitizeAmount(e.target.value),
                                    }))
                                  }
                                  onBlur={() => {
                                    if (amountDraft === undefined) return;
                                    const amount = parseAmount(amountDraft);
                                    const max =
                                      line.currency === "USD"
                                        ? maxUsdCents / 100
                                        : Math.floor(maxUsdCents * bobPerUsd) /
                                          100;
                                    const usdCents =
                                      line.currency === "USD"
                                        ? toCents(amount)
                                        : Math.round(
                                            toCents(amount) / bobPerUsd,
                                          );
                                    const next =
                                      usdCents > maxUsdCents ? max : amount;
                                    setAmountDrafts((current) => {
                                      const nextDrafts = { ...current };
                                      delete nextDrafts[line.id];
                                      return nextDrafts;
                                    });
                                    if (!(next > 0)) return;
                                    const nextUsdCents =
                                      line.currency === "USD"
                                        ? toCents(next)
                                        : Math.round(toCents(next) / bobPerUsd);
                                    onUpdatePayment(line.id, {
                                      method: line.method,
                                      currency: line.currency,
                                      amount: next,
                                      usdCents: Math.min(
                                        nextUsdCents,
                                        maxUsdCents,
                                      ),
                                    });
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                      setAmountDrafts((current) => {
                                        const nextDrafts = { ...current };
                                        delete nextDrafts[line.id];
                                        return nextDrafts;
                                      });
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
                                onClick={() => onRemovePayment(line.id)}
                                aria-label={`Quitar ${line.method}`}
                                className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/15"
                              >
                                <Trash2
                                  aria-hidden="true"
                                  className="h-3.5 w-3.5"
                                />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {canAddPayment && (
                    <button
                      type="button"
                      onClick={() => {
                        const method = availableMethods[0];
                        if (!method) return;
                        onAddPayment({
                          method,
                          currency: "USD",
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
              )}

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
              <Dialog.Close className="rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30">
                Guardar
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
