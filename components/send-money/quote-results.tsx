import type { ProviderQuote } from "./types";

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
  loading,
}: {
  quotes: ProviderQuote[];
  selectedProvider: ProviderQuote["provider"] | null;
  onSelect: (quote: ProviderQuote) => void;
  loading: boolean;
}) {
  const sortedQuotes = [...quotes].sort(
    (a, b) => a.amount + a.fee + a.tax - (b.amount + b.fee + b.tax),
  );

  return (
    <div className="flex flex-row gap-2 pt-2">
      {sortedQuotes.map((quote) => {
        const selected = !loading && selectedProvider === quote.provider;
        const total = quote.amount + quote.fee + quote.tax;
        return (
          <button
            key={quote.provider}
            type="button"
            onClick={() => onSelect(quote)}
            disabled={loading}
            aria-pressed={selected}
            aria-busy={loading}
            className={`relative min-w-0 flex-1 rounded-xl border p-3 text-left transition-colors disabled:cursor-wait ${
              selected
                ? "border-brand bg-accent"
                : "border-border bg-card hover:border-muted-foreground disabled:hover:border-border"
            }            
            `}
          >
            <div className="absolute top-2 right-3">
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

            <div className="flex items-center justify-start gap-3">
              <div className="rounded-full overflow-hidden border size-16">
                <img
                  className="w-full object-contain object-left"
                  src={quote.logo}
                  alt={quote.label}
                />
              </div>
              <p className="text-sm font-bold text-foreground">{quote.label}</p>
            </div>
            <dl className="mt-5 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Cargo</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-20 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums">
                    {formatUsd(quote.fee)}
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">IVA</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-16 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums">
                    {formatUsd(quote.tax)}
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-3 mb-3">
                <dt className="text-muted-foreground">Tasa</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-12 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums">{quote.rate}</dd>
                )}
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-3">
                <dt className="font-bold text-foreground">Total</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-24 rounded" />
                ) : (
                  <dd className="font-bold tabular-nums text-foreground">
                    {formatUsd(total)}
                  </dd>
                )}
              </div>
            </dl>
          </button>
        );
      })}
    </div>
  );
}
