import type { ReactNode } from "react";
import {
  quoteAmountReceived,
  quoteCharges,
  quotePromoDiscount,
} from "./provider-flows";
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
  riaPayoutSlot,
  riaQuoteLoading = false,
}: {
  quotes: ProviderQuote[];
  selectedProvider: ProviderQuote["provider"] | null;
  onSelect: (quote: ProviderQuote, options?: { keepFocus?: boolean }) => void;
  loading: boolean;
  /** Campos de socio pagador y locación, dentro de la tarjeta de RIA. */
  riaPayoutSlot?: ReactNode;
  /** RIA re-cotizando tras elegir socio pagador/locación. */
  riaQuoteLoading?: boolean;
}) {
  // Una cotización sin montos (RIA sin lugar de pago) no compite por el mejor precio.
  const pricedQuotes = quotes
    .filter((quote) => !quote.awaitingPayout)
    .sort((a, b) => quoteAmountReceived(b) - quoteAmountReceived(a));
  const sortedQuotes = [
    ...pricedQuotes,
    ...quotes.filter((quote) => quote.awaitingPayout),
  ];
  const bestQuote = pricedQuotes[0];
  const nextQuote = pricedQuotes[1];
  const bestReceived = bestQuote ? quoteAmountReceived(bestQuote) : 0;
  const savingsVsNext =
    bestQuote && nextQuote ? bestReceived - quoteAmountReceived(nextQuote) : 0;
  const anyPromotion = quotes.some((quote) => quote.promotion !== null);

  return (
    // Cada tarjeta ocupa una columna y comparte las 4 filas (encabezado,
    // selects de RIA, montos, comparación) para que todo quede alineado.
    <div className="grid auto-cols-fr grid-flow-col grid-rows-[auto_auto_1fr_auto] gap-x-2 pt-3">
      {sortedQuotes.map((quote) => {
        const cardLoading =
          loading || (quote.provider === "RIA" && riaQuoteLoading);
        const selected = !loading && selectedProvider === quote.provider;
        const isBestPrice =
          !cardLoading &&
          bestQuote !== undefined &&
          quote.provider === bestQuote.provider;
        const received = quoteAmountReceived(quote);
        const chargesSubtotal = quoteCharges(quote);
        const lessThanBest = bestReceived - received;

        let comparison: string | null = null;
        let comparisonClass = "text-transparent";
        if (quote.awaitingPayout) {
          comparison = "Elegí socio pagador y locación para cotizar";
          comparisonClass = "text-warning-foreground";
        } else if (cardLoading) {
          comparison = null;
        } else if (isBestPrice && savingsVsNext > 0 && nextQuote) {
          comparison = `Llega ${formatUsd(savingsVsNext)} más vs ${nextQuote.label}`;
          comparisonClass = "text-success";
        } else if (!isBestPrice && selected && lessThanBest > 0) {
          comparison = `Llega ${formatUsd(lessThanBest)} menos que el mejor precio`;
          comparisonClass = "text-warning-foreground";
        }

        let cardClass =
          "border-border bg-card shadow-sm ring-2 ring-transparent hover:border-amount/50";
        if (selected) {
          cardClass = "border-amount bg-card shadow-md ring-2 ring-amount/30";
        } else if (isBestPrice) {
          cardClass =
            "border-success bg-card shadow-sm ring-2 ring-transparent hover:border-success";
        }
        if (loading) {
          cardClass += " cursor-wait";
        } else {
          cardClass += " cursor-pointer";
        }

        return (
          // La tarjeta de RIA contiene selects: no puede ser un <button>. El
          // radio es el control accesible y su click burbujea a la tarjeta.
          <div
            key={quote.provider}
            onClick={() => {
              if (!loading) onSelect(quote);
            }}
            aria-busy={cardLoading}
            className={`relative row-span-4 grid min-w-0 grid-rows-subgrid gap-0 rounded-xl border p-3 text-left transition-colors ${cardClass}`}
          >
            {isBestPrice && (
              <span className="absolute -top-2.5 left-3 z-10 rounded-full border border-success bg-success-soft px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-success">
                Mejor precio
              </span>
            )}
            <div className="absolute top-3 right-3">
              <button
                type="button"
                disabled={loading}
                aria-pressed={selected}
                aria-label={`Elegir ${quote.label}`}
                className={`relative mt-0.5 block h-4 w-4 shrink-0 rounded-full border-2 focus:outline-none focus:ring-4 focus:ring-amount/30 disabled:cursor-wait ${
                  selected ? "border-amount" : "border-border"
                }`}
              >
                {selected && (
                  <span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amount" />
                )}
              </button>
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
            {/* Fila de los selects de RIA: en las demás tarjetas queda vacía con
                la misma altura (subgrid), así los cargos quedan alineados. */}
            {quote.provider === "RIA" && riaPayoutSlot ? (
              // Usar los selects elige RIA sin mover el foco al botón
              // "Siguiente" (los clicks del menú en portal también burbujean acá).
              <div
                className="mt-3 cursor-default"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!loading && !selected) {
                    onSelect(quote, { keepFocus: true });
                  }
                }}
              >
                {riaPayoutSlot}
              </div>
            ) : (
              <div aria-hidden="true" />
            )}
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Cargo</dt>
                {cardLoading ? (
                  <dd className="skeleton h-4 w-20 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {formatUsd(quote.fee)}
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">IVA</dt>
                {cardLoading ? (
                  <dd className="skeleton h-4 w-16 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {formatUsd(quote.tax)}
                  </dd>
                )}
              </div>
              {quote.provider === "TERRAPAY" && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">ITF</dt>
                  {cardLoading ? (
                    <dd className="skeleton h-4 w-16 rounded" />
                  ) : (
                    <dd className="font-semibold tabular-nums text-foreground">
                      {formatUsd(quote.itf)}
                    </dd>
                  )}
                </div>
              )}
              {anyPromotion && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Descuento</dt>
                  {cardLoading ? (
                    <dd className="skeleton h-4 w-16 rounded" />
                  ) : quote.promotion ? (
                    <dd
                      className="font-semibold tabular-nums text-success"
                      title={quote.promotion.description}
                    >
                      −{formatUsd(quotePromoDiscount(quote))}
                    </dd>
                  ) : (
                    <dd className="text-muted-foreground">—</dd>
                  )}
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Subtotal cargos</dt>
                {cardLoading ? (
                  <dd className="skeleton h-4 w-20 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {formatUsd(chargesSubtotal)}
                  </dd>
                )}
              </div>
              <div className="mb-3 flex justify-between gap-3">
                <dt className="text-muted-foreground">Tasa</dt>
                {cardLoading ? (
                  <dd className="skeleton h-4 w-12 rounded" />
                ) : (
                  <dd className="font-semibold tabular-nums text-foreground">
                    {quote.rate}
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-3">
                <dt className="font-bold text-foreground">Recibe</dt>
                {cardLoading ? (
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
              {comparison ?? " "}
            </p>
          </div>
        );
      })}
    </div>
  );
}
