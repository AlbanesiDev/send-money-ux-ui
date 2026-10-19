"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type {
  PaymentCurrency,
  PaymentLine,
} from "@/components/send-money/types";

const CURRENCIES: PaymentCurrency[] = ["USD", "BOB"];

export type AddPaymentMethodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethodOptions: string[];
  primaryMethod: string;
  primaryCurrency: PaymentCurrency;
  primaryCents: number;
  extraPayments: PaymentLine[];
  bobPerUsd: number;
  formatUsd: (value: number) => string;
  formatAmount: (value: number) => string;
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
  onAddPayment: (line: Omit<PaymentLine, "id">) => void;
};

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  paymentMethodOptions,
  primaryMethod,
  primaryCurrency,
  primaryCents,
  extraPayments,
  bobPerUsd,
  formatUsd,
  formatAmount,
  sanitizeAmount,
  parseAmount,
  toCents,
  onAddPayment,
}: AddPaymentMethodDialogProps) {
  const [draftMethod, setDraftMethod] = useState("");
  const [draftCurrency, setDraftCurrency] = useState<PaymentCurrency>("USD");
  const [draftAmount, setDraftAmount] = useState("");
  const draftMethodRef = useRef<HTMLButtonElement>(null);
  const draftCurrencyRef = useRef<HTMLButtonElement>(null);
  const draftAmountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraftMethod("");
    setDraftCurrency("USD");
    setDraftAmount("");
    window.requestAnimationFrame(() => draftMethodRef.current?.focus());
  }, [open]);

  const usedLines = [
    { method: primaryMethod, currency: primaryCurrency },
    ...extraPayments,
  ];
  const isTaken = (method: string, currency: PaymentCurrency) =>
    usedLines.some(
      (line) => line.method === method && line.currency === currency,
    );

  const draftValue = draftAmount ? parseAmount(draftAmount) : 0;
  const draftUsdCents =
    draftCurrency === "USD"
      ? toCents(draftValue)
      : Math.round(toCents(draftValue) / bobPerUsd);
  const draftExceeds = draftAmount !== "" && draftUsdCents > primaryCents;
  const availableBob = (primaryCents * bobPerUsd) / 100;
  const draftDuplicate =
    draftMethod !== "" && isTaken(draftMethod, draftCurrency);
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
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none">
            <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
              Agregar otra forma de pago
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              El monto se descuenta automáticamente de la forma de pago
              principal.
            </Dialog.Description>

            <div className="mt-5 grid gap-3">
              <SearchableSelect
                label="Forma de pago"
                options={paymentMethodOptions}
                value={draftMethod}
                onChange={setDraftMethod}
                fieldRef={draftMethodRef}
                nextRef={draftCurrencyRef}
              />
              <SearchableSelect
                label="Moneda"
                options={CURRENCIES}
                value={draftCurrency}
                onChange={(value) => setDraftCurrency(value as PaymentCurrency)}
                fieldRef={draftCurrencyRef}
                nextRef={draftAmountRef}
              />
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-foreground">
                  Monto <span className="text-destructive">*</span>
                </span>
                <div
                  className={`flex h-10 items-center rounded-lg border bg-card transition focus-within:ring-4 ${
                    draftExceeds
                      ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/10"
                      : "border-input focus-within:border-brand focus-within:ring-brand/10"
                  }`}
                >
                  <span className="shrink-0 whitespace-nowrap pl-3 text-sm font-semibold text-muted-foreground">
                    {draftCurrency} $
                  </span>
                  <input
                    ref={draftAmountRef}
                    value={draftAmount}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    aria-invalid={draftExceeds}
                    aria-describedby="add-payment-amount-hint"
                    onChange={(e) =>
                      setDraftAmount(sanitizeAmount(e.target.value))
                    }
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
                      else if (draftMethod === "")
                        draftMethodRef.current?.focus();
                    }}
                    className="h-full w-full rounded-lg bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <p
                  id="add-payment-amount-hint"
                  role={draftExceeds ? "alert" : undefined}
                  className={`mt-2 text-xs ${
                    draftExceeds
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
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
            </div>

            {draftDuplicate && (
              <p
                role="alert"
                className="mt-3 text-sm font-medium text-destructive"
              >
                {draftMethod} en {draftCurrency} ya está registrado. Elige otra
                forma de pago o moneda.
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Dialog.Close className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20">
                Cancelar
              </Dialog.Close>
              <button
                type="button"
                onClick={addPayment}
                disabled={!canAdd}
                className="flex items-center gap-2 rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Agregar
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
