"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { CountryFlag } from "@/components/ui/country-flag";
import {
  PAYMENT_OPERATIONS,
  formatMoney,
  formatOperationNumber,
  maskName,
  type PaymentOperation,
} from "../payment-data";

export type OperationSearchResult =
  | { kind: "found"; operation: PaymentOperation }
  | { kind: "notFound" }
  | null;

export function SearchOperationStep({
  operationNumber,
  onOperationNumberChange,
  result,
  onResultChange,
  onStart,
}: {
  operationNumber: string;
  onOperationNumberChange: (value: string) => void;
  result: OperationSearchResult;
  onResultChange: (result: OperationSearchResult) => void;
  onStart: (operation: PaymentOperation) => void;
}) {
  const [loading, setLoading] = useState(false);
  const startRef = useRef<HTMLButtonElement>(null);
  const operation = result?.kind === "found" ? result.operation : null;

  function search() {
    if (operationNumber.length < 8 || loading) return;
    setLoading(true);
    onResultChange(null);
    window.setTimeout(() => {
      const found = PAYMENT_OPERATIONS.find(
        (item) => item.number === operationNumber,
      );
      onResultChange(
        found ? { kind: "found", operation: found } : { kind: "notFound" },
      );
      setLoading(false);
    }, 600);
  }

  useEffect(() => {
    if (operation?.status === "available") startRef.current?.focus();
  }, [operation]);

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
      <div className="mb-6 pt-12">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Pago de remesa
        </p>
        <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground">
          Busca la operación
        </h1>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Pide al beneficiario el número que le compartió quien envió el dinero.
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          search();
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <label className="block flex-1">
          <span className="mb-1 block text-sm font-semibold text-foreground">
            Número de operación <span className="text-destructive">*</span>
          </span>
          <input
            autoFocus
            inputMode="numeric"
            value={formatOperationNumber(operationNumber)}
            onChange={(event) => {
              onOperationNumberChange(
                event.target.value.replace(/\D/g, "").slice(0, 12),
              );
              onResultChange(null);
            }}
            placeholder="0000 0000 000"
            className="h-11 w-full rounded-lg border border-input bg-card px-3 font-mono text-base tracking-wider text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </label>
        <button
          disabled={operationNumber.length < 8 || loading}
          className="h-11 rounded-lg bg-brand-strong px-6 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Se paga en bolivianos (BOB). Presiona Enter para buscar.
      </p>

      <div aria-live="polite" className="mt-6">
        {result?.kind === "notFound" && (
          <Notice
            tone="error"
            icon={<CircleAlertIcon className="size-5" />}
            title="No encontramos esa operación"
            text="Revisa el número con el beneficiario. Si lo confirma, puede que la operación aún no esté disponible para pago."
          />
        )}
        {operation && (
          <article className="rounded-xl border border-border bg-card p-5 shadow-[0_12px_35px_rgba(24,37,73,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {operation.provider} · Operación{" "}
                  {formatOperationNumber(operation.number)}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-[-0.02em] text-foreground">
                  {formatMoney(operation.amount, operation.currency)}
                </p>
              </div>
              <StatusBadge status={operation.status} />
            </div>
            <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">Beneficiario</dt>
                <dd className="font-semibold text-foreground">
                  {operation.beneficiaryName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Remitente</dt>
                <dd className="font-semibold text-foreground">
                  {maskName(operation.senderName)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Origen</dt>
                <dd className="flex items-center gap-2 font-semibold text-foreground">
                  <CountryFlag country={operation.originCountry} />
                  {operation.originCountry}
                </dd>
              </div>
            </dl>
            {operation.status === "available" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Siguiente: verificar al beneficiario con preguntas de
                  seguridad.
                </p>
                <button
                  ref={startRef}
                  type="button"
                  onClick={() => onStart(operation)}
                  className="flex items-center gap-2 rounded-lg bg-brand-strong px-5 py-2.5 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
                >
                  Iniciar pago
                  <ArrowRightIcon className="size-4" />
                </button>
              </div>
            )}
            {operation.status === "onHold" && (
              <div className="mt-5">
                <Notice
                  tone="warning"
                  icon={<ShieldAlertIcon className="size-5" />}
                  title="Retenida por Cumplimiento"
                  text="No se puede pagar por ahora. Indica al beneficiario que la operación está en revisión y comunícate con Cumplimiento si necesitas más detalle."
                />
              </div>
            )}
            {operation.status === "paid" && (
              <div className="mt-5">
                <Notice
                  tone="error"
                  icon={<CircleAlertIcon className="size-5" />}
                  title="Esta operación ya fue pagada"
                  text="Pagada el 14/10/2026 en la agencia #212. Si el beneficiario no la recibió, deriva el caso a Atención al Cliente."
                />
              </div>
            )}
          </article>
        )}
      </div>
      <p className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        Demo: 12090991105 (cliente existente) · 12090991200 (monto alto, cliente
        nuevo) · 12090990000 (en revisión) · 12090991111 (ya pagada)
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentOperation["status"] }) {
  if (status === "available")
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-success-border bg-success-soft px-3 py-1 text-xs font-bold text-success">
        <CircleCheckIcon className="size-3.5" />
        Disponible para pagar
      </span>
    );
  if (status === "onHold")
    return (
      <span className="rounded-full border border-[#eadcae] bg-[#fffaf0] px-3 py-1 text-xs font-bold text-[#765d12] dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
        En revisión
      </span>
    );
  return (
    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
      Pagada
    </span>
  );
}

export function Notice({
  tone,
  icon,
  title,
  text,
}: {
  tone: "error" | "warning" | "info" | "success";
  icon: ReactNode;
  title: string;
  text?: ReactNode;
}) {
  const toneClass = {
    error:
      "border-destructive/30 bg-destructive/5 text-destructive dark:bg-destructive/15",
    warning:
      "border-[#eadcae] bg-[#fffaf0] text-[#765d12] dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200",
    info: "border-brand/30 bg-accent text-brand-strong",
    success: "border-success-border bg-success-soft text-success",
  }[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${toneClass}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        {text && <p className="mt-0.5 text-xs leading-5 opacity-90">{text}</p>}
      </div>
    </div>
  );
}
