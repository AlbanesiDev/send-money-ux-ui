import {
  deliveryTypeLabel,
  quoteAmountReceived,
  quoteCharges,
} from "@/components/send-money/provider-flows";
import type {
  DeliveryTypeId,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import { ReceiptTextIcon } from "lucide-react";

const usdFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

const formatUsd = (value: number) => `${usdFormatter.format(value)} USD`;

export type RemittanceSummaryProps = {
  provider: ProviderId | null;
  quote: ProviderQuote | null;
  deliveryType: DeliveryTypeId | "";
  loading: boolean;
};

export function RemittanceSummary({
  provider,
  quote,
  deliveryType,
  loading,
}: RemittanceSummaryProps) {
  const amount = quote ? quote.amount : 0;
  const fee = quote ? quote.fee : 0;
  const tax = quote ? quote.tax : 0;
  const itf = quote ? quote.itf : 0;
  const promotion = quote ? quote.promotion : null;
  const charges = quote ? quoteCharges(quote) : 0;
  const received = quote ? quoteAmountReceived(quote) : 0;
  const rows = [
    { label: "Dinero a enviar", value: amount },
    { label: "Cargo de envío", value: fee },
    { label: "IVA", value: tax },
  ];
  if (provider === "TERRAPAY") {
    rows.push({ label: "ITF", value: itf });
  }
  const valueClass = `font-semibold tabular-nums transition-opacity ${loading ? "animate-pulse opacity-40" : ""}`;
  let providerLabel = "Sin seleccionar";
  if (provider) providerLabel = provider;
  let deliveryLabel = "Sin seleccionar";
  if (deliveryType) deliveryLabel = deliveryTypeLabel(deliveryType);
  return (
    <div
      aria-busy={loading}
      className="rounded-xl border border-border border-l-4 border-l-summary-border bg-card p-3 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="font-bold text-summary-fg">Resumen</h2>
        <span
          aria-label="Ticket"
          title="Ticket"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-summary-border/40 bg-summary-soft text-xs font-bold text-summary-fg"
        >
          <ReceiptTextIcon className="size-4" />
        </span>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Proveedor</dt>
          <dd className="text-right font-semibold text-foreground">
            {providerLabel}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Tipo de envío</dt>
          <dd className="text-right font-semibold text-foreground">
            {deliveryLabel}
          </dd>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className={valueClass}>{formatUsd(row.value)}</dd>
          </div>
        ))}
        {promotion && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              Descuento promocional
              <span className="ml-1.5 rounded bg-success-soft px-1 text-[0.6875rem] font-bold text-success">
                {promotion.code}
              </span>
            </dt>
            <dd className={`${valueClass} text-success`}>
              −{formatUsd(promotion.discount)}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal cargos</dt>
          <dd className={valueClass}>{formatUsd(charges)}</dd>
        </div>
        <div className="mt-2.5 flex justify-between border-t border-border pt-2.5 text-base">
          <dt className="font-bold text-foreground">Recibe el beneficiario</dt>
          <dd
            className={`font-bold tabular-nums text-summary-fg ${loading ? "animate-pulse opacity-40" : ""}`}
          >
            {formatUsd(received)}
          </dd>
        </div>
      </dl>
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-4 text-xs text-muted-foreground select-none"
      >
        {loading
          ? "Calculando cotización…"
          : quote
            ? ""
            : "Cotiza y selecciona un proveedor para continuar."}
      </p>
    </div>
  );
}
