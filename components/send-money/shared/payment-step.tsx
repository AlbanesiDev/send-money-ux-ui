import type { ReactNode, RefObject } from "react";
import { Field } from "../field";

export function StandardPaymentStep({
  totalToCharge,
  formatUsd,
  paymentMethodSlot,
  receivedAmountRef,
  nextButtonRef,
  receivedAmount,
  onReceivedAmountChange,
  onReceivedAmountBlur,
  sanitizeAmount,
  receivedInsufficient,
  receivedValue,
  toCents,
  changeDue,
  paymentReady,
  billingSlot,
}: {
  totalToCharge: number;
  formatUsd: (value: number) => string;
  paymentMethodSlot: ReactNode;
  receivedAmountRef: RefObject<HTMLInputElement | null>;
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  receivedAmount: string;
  onReceivedAmountChange: (value: string) => void;
  onReceivedAmountBlur: () => void;
  sanitizeAmount: (value: string) => string;
  receivedInsufficient: boolean;
  receivedValue: number;
  toCents: (value: number) => number;
  changeDue: number;
  paymentReady: boolean;
  billingSlot: ReactNode;
}) {
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
        {paymentMethodSlot}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Monto recibido <span className="text-[#c73750]">*</span>
          </span>
          <div
            className={`flex h-10 items-center rounded-lg border bg-white transition focus-within:ring-4 ${
              receivedInsufficient
                ? "border-[#c73750] focus-within:border-[#c73750] focus-within:ring-[#c73750]/10"
                : "border-[#cdd5e1] focus-within:border-[#5368c8] focus-within:ring-[#5368c8]/10"
            }`}
          >
            <span className="shrink-0 whitespace-nowrap pl-3 text-sm font-semibold text-[#73809a]">
              USD $
            </span>
            <input
              ref={receivedAmountRef}
              value={receivedAmount}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              aria-invalid={receivedInsufficient}
              aria-describedby={
                receivedInsufficient ? "received-amount-error" : undefined
              }
              onChange={(e) =>
                onReceivedAmountChange(sanitizeAmount(e.target.value))
              }
              onBlur={onReceivedAmountBlur}
              onKeyDown={(e) => {
                if (
                  e.key !== "Enter" ||
                  e.nativeEvent.isComposing ||
                  e.keyCode === 229
                )
                  return;
                e.preventDefault();
                onReceivedAmountBlur();
                if (paymentReady) nextButtonRef.current?.focus();
              }}
              className="h-full w-full rounded-lg bg-transparent px-2 text-sm text-[#263653] outline-none placeholder:text-[#a2adbf]"
            />
          </div>
          {receivedInsufficient && (
            <p
              id="received-amount-error"
              role="alert"
              className="mt-2 text-sm font-medium text-[#c73750]"
            >
              El monto recibido es menor al total a cobrar. Faltan{" "}
              {formatUsd(
                (toCents(totalToCharge) - toCents(receivedValue)) / 100,
              )}
              .
            </p>
          )}
        </label>
      </div>
      <div className="rounded-xl border border-[#cde8db] bg-[#f1faf5] p-5">
        <div className="flex justify-between font-semibold">
          <span>Vuelto</span>
          <span className="text-[#23815d]" aria-live="polite">
            {formatUsd(changeDue)}
          </span>
        </div>
        <p className="mt-2 text-sm text-[#5d7c72]">
          El vuelto se calcula automáticamente a partir del monto recibido.
        </p>
      </div>
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
