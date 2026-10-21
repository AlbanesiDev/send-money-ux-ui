import type { ProviderQuote } from "./types";

const usdFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

function formatUsd(value: number) {
  return `${usdFormatter.format(value)} USD`;
}

function amountReceived(quote: ProviderQuote) {
  return quote.amount - quote.fee - quote.tax;
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
    (a, b) => amountReceived(b) - amountReceived(a),
  );
  const bestQuote = sortedQuotes[0];
  const nextQuote = sortedQuotes[1];
  const bestReceived = bestQuote ? amountReceived(bestQuote) : 0;
  const savingsVsNext =
    bestQuote && nextQuote ? bestReceived - amountReceived(nextQuote) : 0;

  return (
    <div className="flex flex-row items-stretch gap-2 pt-3">
      {sortedQuotes.map((quote) => {
        const selected = !loading && selectedProvider === quote.provider;
        const isBestPrice =
          bestQuote !== undefined && quote.provider === bestQuote.provider;
        const received = amountReceived(quote);
        const chargesSubtotal = quote.fee + quote.tax;
        const lessThanBest = bestReceived - received;

        let comparison: string | null = null;
        let comparisonClass = "text-transparent";
        if (!loading && isBestPrice && savingsVsNext > 0 && nextQuote) {
          comparison = `Llega ${formatUsd(savingsVsNext)} más vs ${nextQuote.label}`;
          comparisonClass = "text-success";
        } else if (!loading && !isBestPrice && selected && lessThanBest > 0) {
          comparison = `Llega ${formatUsd(lessThanBest)} menos que el mejor precio`;
          comparisonClass = "text-warning-foreground";
        }

        let cardClass =
          "border-border bg-card shadow-sm ring-2 ring-transparent hover:border-amount/50 disabled:hover:border-border";
        if (selected) {
          cardClass = "border-amount bg-card shadow-md ring-2 ring-amount/30";
        } else if (isBestPrice) {
          cardClass =
            "border-success bg-card shadow-sm ring-2 ring-transparent hover:border-success disabled:hover:border-success";
        }

        return (
          <button
            key={quote.provider}
            type="button"
            onClick={() => onSelect(quote)}
            disabled={loading}
            aria-pressed={selected}
            aria-busy={loading}
            className={`relative flex min-w-0 flex-1 flex-col rounded-xl border p-3 text-left transition-colors disabled:cursor-wait ${cardClass}`}
          >
            {isBestPrice && (
              <span className="absolute -top-2.5 left-3 z-10 rounded-full border border-success bg-success-soft px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-success">
                Mejor precio
              </span>
            )}
            <div className="absolute top-3 right-3">
              <span
                aria-hidden="true"
                className={`relative mt-0.5 block h-4 w-4 shrink-0 rounded-full border-2 ${
                  selected ? "border-amount" : "border-border"
                }`}
              >
                {selected && (
                  <span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amount" />
                )}
              </span>
            </div>

            <div className="flex items-center justify-start gap-3 pr-6">
              <div className="size-13 overflow-hidden rounded-full border border-border bg-card">
                <img
                  className="w-full object-contain object-left"
                  src={quote.logo}
                  alt={quote.label}
                />
              </div>
              <div className="relative">
                <p className="text-sm font-bold text-foreground">
                  {quote.label}
                </p>
                {quote.description && (
                  <p className="absolute text-xs font-bold text-accent-foreground">
                    {quote.description}
                  </p>
                )}
              </div>
            </div>
            <dl className="mt-3 flex-1 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Cargo</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-20 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {formatUsd(quote.fee)}
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">IVA</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-16 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {formatUsd(quote.tax)}
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Subtotal cargos</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-20 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {formatUsd(chargesSubtotal)}
                  </dd>
                )}
              </div>
              <div className="mb-3 flex justify-between gap-3">
                <dt className="text-muted-foreground">Tasa</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-12 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {quote.rate}
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-3">
                <dt className="font-bold text-foreground">Recibe</dt>
                {loading ? (
                  <dd className="skeleton h-4 w-24 rounded" />
                ) : (
                  <dd className="font-bold tabular-nums text-amount">
                    {formatUsd(received)}
                  </dd>
                )}
              </div>
            </dl>
            <p
              className={`mt-2 min-h-4 text-[0.6875rem] font-semibold leading-4 ${comparisonClass}`}
              aria-hidden={comparison === null}
            >
              {comparison ?? "\u00A0"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
