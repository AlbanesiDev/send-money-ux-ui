"use client";

import { useEffect, useRef } from "react";
import {
  BanknoteIcon,
  CheckIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  Loader2Icon,
  PrinterIcon,
  RotateCcwIcon,
} from "lucide-react";
import { CountryFlag } from "@/components/ui/country-flag";
import {
  cashBreakdown,
  formatMoney,
  formatOperationNumber,
  type PaymentOperation,
} from "./payment-data";

export function PaymentSummaryAside({
  operation,
  beneficiaryName,
  verified,
  documentValidated,
}: {
  operation: PaymentOperation;
  beneficiaryName: string;
  verified: boolean;
  documentValidated: boolean;
}) {
  return (
    <aside className="sticky top-0 flex flex-col gap-3 self-start">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h2 className="font-bold text-foreground">Detalle del pago</h2>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[0.6875rem] font-bold text-brand-strong">
            {operation.provider}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Monto a entregar</p>
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {formatMoney(operation.amount, operation.currency)}
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Beneficiario</dt>
            <dd className="text-right font-semibold text-foreground">
              {beneficiaryName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Origen</dt>
            <dd className="flex items-center gap-2 text-right font-semibold text-foreground">
              <CountryFlag country={operation.originCountry} />
              {operation.originCountry}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Operación</dt>
            <dd className="font-mono font-semibold text-foreground">
              {formatOperationNumber(operation.number)}
            </dd>
          </div>
        </dl>
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
          <Check done={verified} label="Preguntas de seguridad" />
          <Check done={documentValidated} label="Documento validado" />
        </ul>
      </div>
    </aside>
  );
}

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-2 font-semibold ${done ? "text-success" : "text-muted-foreground"}`}
    >
      {done ? (
        <CircleCheckIcon className="size-4" />
      ) : (
        <CircleDashedIcon className="size-4" />
      )}
      {label}
    </li>
  );
}

export function PaymentProcessing({ amount }: { amount: string }) {
  return (
    <div
      className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6 sm:p-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-[620px] flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-brand-strong">
          <Loader2Icon
            className="h-9 w-9 motion-safe:animate-spin"
            strokeWidth={2.5}
          />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">
          Procesando pago
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">
          Registrando el pago con el proveedor
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          No entregues el efectivo todavía. Esto puede tardar unos segundos.
        </p>
        <div className="mt-8 flex w-full max-w-md items-center justify-between rounded-xl border border-border bg-muted p-5">
          <span className="text-sm text-muted-foreground">
            Monto a entregar
          </span>
          <span className="text-lg font-bold tabular-nums text-brand-strong">
            {amount}
          </span>
        </div>
      </div>
    </div>
  );
}

const secondaryButton =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:border-brand-strong hover:text-brand-strong focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20";

export function PaymentSuccess({
  operation,
  beneficiaryName,
  onNewPayment,
}: {
  operation: PaymentOperation;
  beneficiaryName: string;
  onNewPayment: () => void;
}) {
  const printRef = useRef<HTMLButtonElement>(null);
  const breakdown = cashBreakdown(operation.amount);

  useEffect(() => {
    window.requestAnimationFrame(() => printRef.current?.focus());
  }, []);

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-y-auto p-6 sm:p-10">
      <div className="flex w-full max-w-[680px] flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckIcon className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-success">
          Pago registrado
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-foreground">
          Entrega {formatMoney(operation.amount, operation.currency)} a{" "}
          {beneficiaryName}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          Operación {formatOperationNumber(operation.number)}
        </p>

        <div className="mt-6 grid w-full items-stretch gap-4 text-left ">
          <ol className="flex flex-col gap-2">
            {[
              "Imprime el comprobante",
              "El beneficiario lo firma",
              "Cuenta el efectivo frente a él",
            ].map((text, index) => (
              <li
                key={text}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3 text-sm font-semibold text-foreground"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-strong text-xs font-bold text-white">
                  {index + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BanknoteIcon className="size-4 text-brand-strong" />
              Desglose sugerido
            </h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {breakdown.map((line) => (
                <li
                  key={line.value}
                  className="flex justify-between tabular-nums"
                >
                  <span className="text-muted-foreground">{line.count} ×</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(line.value)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <button
            ref={printRef}
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-strong px-6 py-3 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            <PrinterIcon className="size-4" />
            Imprimir comprobante
          </button>
          <button
            type="button"
            onClick={onNewPayment}
            className={secondaryButton}
          >
            <RotateCcwIcon className="size-4" />
            Nuevo pago
          </button>
        </div>
      </div>
    </div>
  );
}
