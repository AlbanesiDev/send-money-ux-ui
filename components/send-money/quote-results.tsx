import type { DeliveryTypeId, ProviderQuote } from "./types";

const usdFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

function formatUsd(value: number) {
  return `${usdFormatter.format(value)} USD`;
}

export function QuoteResults({
  quotes,
  selectedProvider,
  onSelect,
}: {
  quotes: ProviderQuote[];
  selectedProvider: ProviderQuote["provider"] | null;
  deliveryType: DeliveryTypeId | null;
  onSelect: (quote: ProviderQuote) => void;
}) {
  const sortedQuotes = [...quotes].sort(
    (a, b) => a.amount + a.fee + a.tax - (b.amount + b.fee + b.tax),
  );
  const bestProvider =
    sortedQuotes.length > 0 ? sortedQuotes[0].provider : null;

  return (
    <div className="space-y-2">
      <h2 className="font-bold text-foreground">Cotizaciones por proveedor</h2>
      {sortedQuotes.length === 0 ? (
        <p className="rounded-lg border border-[#eadcae] bg-[#fffaf0] p-3 text-sm text-[#765d12] dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
          Ningún proveedor disponible para este tipo de envío. Probá con otro
          tipo.
        </p>
      ) : (
        <div className="flex gap-2 pt-2">
          {sortedQuotes.map((quote) => {
            const selected = selectedProvider === quote.provider;
            const total = quote.amount + quote.fee + quote.tax;
            const isBestPrice = quote.provider === bestProvider;
            return (
              <button
                key={quote.provider}
                type="button"
                onClick={() => onSelect(quote)}
                aria-pressed={selected}
                className={`relative min-w-0 flex-1 rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-brand bg-accent"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                {isBestPrice && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-success-soft px-2.5 py-0.5 text-[0.6875rem] font-bold text-success">
                    Mejor precio
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-foreground">
                    {quote.label}
                  </p>
                  <span
                    aria-hidden="true"
                    className={`relative mt-0.5 block h-4 w-4 shrink-0 rounded-full border-2 ${
                      selected ? "border-brand-strong" : "border-border"
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-strong" />
                    )}
                  </span>
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Cargo</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatUsd(quote.fee)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">IVA</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatUsd(quote.tax)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Tasa</dt>
                    <dd className="font-semibold tabular-nums">{quote.rate}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-border pt-2">
                    <dt className="font-bold text-foreground">Total</dt>
                    <dd className="font-bold tabular-nums text-foreground">
                      {formatUsd(total)}
                    </dd>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
