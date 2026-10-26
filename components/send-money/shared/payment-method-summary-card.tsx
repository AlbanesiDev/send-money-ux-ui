import type { PaymentLine } from "../types";

export type PaymentMethodSummaryCardProps = {
  paymentLines: PaymentLine[];
  totalToCharge: number;
  formatUsd: (value: number) => string;
  formatAmount: (value: number) => string;
  onEdit?: () => void;
};

export function PaymentMethodSummaryCard({
  paymentLines,
  totalToCharge,
  formatUsd,
  formatAmount,
  onEdit,
}: PaymentMethodSummaryCardProps) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border border-l-4 border-l-border bg-card px-3.5 py-2.5 shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground">Método de pago</h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar pago"
            className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
          >
            Editar
          </button>
        )}
      </div>
      <dl className="mt-1.5 flex flex-col divide-y divide-border">
        {paymentLines.map((line) => (
          <div
            key={line.id}
            className="flex items-baseline justify-between gap-3 py-1 text-sm"
          >
            <dt className="text-muted-foreground">
              {line.method || "Método de pago"}
            </dt>
            <dd className="text-right font-semibold text-foreground">
              {line.currency === "USD"
                ? formatUsd(line.amount)
                : `${formatAmount(line.amount)} BOB (${formatUsd(line.usdCents / 100)})`}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
          <dt className="text-muted-foreground">Total cobrado</dt>
          <dd className="text-right font-semibold text-foreground">
            {formatUsd(totalToCharge)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
