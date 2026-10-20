"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Eye,
  Loader2,
  Printer,
  RotateCcw,
  Users,
} from "lucide-react";

export function RemittanceProcessing({ totalSent }: { totalSent: string }) {
  return (
    <div
      className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6 sm:p-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-[620px] flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-brand-strong"
          aria-hidden="true"
        >
          <Loader2
            className="h-9 w-9 motion-safe:animate-spin"
            strokeWidth={2.5}
          />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">
          Procesando envío
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground">
          Estamos registrando la remesa
        </h1>
        <p className="mt-3 max-w-lg text-pretty text-sm leading-6 text-muted-foreground">
          No cierres esta ventana. Esto puede tardar unos segundos.
        </p>
        <div className="mt-8 flex w-full max-w-md items-center justify-between gap-4 rounded-xl border border-border bg-muted p-5 text-left">
          <span className="text-sm text-muted-foreground">Total a enviar</span>
          <span className="text-lg font-bold tabular-nums text-brand-strong">
            {totalSent}
          </span>
        </div>
        <div
          className="mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-accent"
          aria-hidden="true"
        >
          <div className="h-full w-1/3 rounded-full bg-brand-strong motion-safe:animate-[processing-bar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

type RemittanceSuccessProps = {
  operationNumber: string;
  totalSent: string;
  onNewTransaction: () => void;
  onRepeatClient: () => void;
  onSameBeneficiary: () => void;
};

const secondaryButton =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:border-brand-strong hover:text-brand-strong focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20";

export function RemittanceSuccess({
  operationNumber,
  totalSent,
  onNewTransaction,
  onRepeatClient,
  onSameBeneficiary,
}: RemittanceSuccessProps) {
  const newTransactionRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.requestAnimationFrame(() => newTransactionRef.current?.focus());
  }, []);

  async function copyOperationNumber() {
    await navigator.clipboard?.writeText(operationNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6 sm:p-12">
      <div className="flex w-full max-w-[620px] flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success"
          aria-hidden="true"
        >
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-success">
          Envío confirmado
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground">
          La remesa fue enviada correctamente
        </h1>
        <p className="mt-3 max-w-lg text-pretty text-sm leading-6 text-muted-foreground">
          Entrega este número al cliente: el beneficiario lo necesita para
          cobrar.
        </p>

        <dl className="mt-8 w-full max-w-md rounded-xl border border-border bg-muted p-5 text-left">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <dt className="text-sm text-muted-foreground">
              Número de operación
            </dt>
            <dd className="flex items-center gap-2">
              <strong className="font-mono text-xl text-foreground">
                {operationNumber}
              </strong>
              <button
                type="button"
                onClick={copyOperationNumber}
                aria-label={
                  copied ? "Número copiado" : "Copiar número de operación"
                }
                className="cursor-pointer rounded-md p-2 text-brand-strong hover:bg-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <dt className="text-sm text-muted-foreground">Total enviado</dt>
            <dd className="text-lg font-bold tabular-nums text-brand-strong">
              {totalSent}
            </dd>
          </div>
        </dl>
        <p role="status" aria-live="polite" className="sr-only">
          {copied ? "Número de operación copiado" : ""}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" className={secondaryButton}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Ver comprobantes
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className={secondaryButton}
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir
          </button>
          <button type="button" className={secondaryButton}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Descargar
          </button>
        </div>
        <button type="button" className={`mt-4 bg-muted ${secondaryButton}`}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Descargar factura electrónica
        </button>

        <div className="mt-8 flex w-full flex-col items-center gap-4 border-t border-border pt-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onRepeatClient}
              className={secondaryButton}
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Repetir con el mismo cliente
            </button>
            <button
              type="button"
              onClick={onSameBeneficiary}
              className={secondaryButton}
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Mismo beneficiario
            </button>
          </div>
          <button
            type="button"
            ref={newTransactionRef}
            onClick={onNewTransaction}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-strong px-8 py-3 text-sm font-bold text-white transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Nueva transacción
          </button>
        </div>
      </div>
    </div>
  );
}
