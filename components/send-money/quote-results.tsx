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
      <h2 className="font-bold text-[#17233f]">Cotizaciones por proveedor</h2>
      {sortedQuotes.length === 0 ? (
        <p className="rounded-lg border border-[#eadcae] bg-[#fffaf0] p-3 text-sm text-[#765d12]">
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
                    ? "border-[#5368c8] bg-[#f4f6ff]"
                    : "border-[#dce3ee] bg-white hover:border-[#b8c0d0]"
                }`}
              >
                {isBestPrice && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-[#e1f7e9] px-2.5 py-0.5 text-[0.6875rem] font-bold text-[#1f6d55]">
                    Mejor precio
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-[#17233f]">
                    {quote.provider}
                  </p>
                  <span
                    aria-hidden="true"
                    className={`relative mt-0.5 block h-4 w-4 shrink-0 rounded-full border-2 ${
                      selected ? "border-[#465bc2]" : "border-[#c5cddb]"
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#465bc2]" />
                    )}
                  </span>
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#73809a]">Cargo</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatUsd(quote.fee)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#73809a]">IVA</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatUsd(quote.tax)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#73809a]">Tasa</dt>
                    <dd className="font-semibold tabular-nums">{quote.rate}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[#e6ebf3] pt-2">
                    <dt className="font-bold text-[#17233f]">Total</dt>
                    <dd className="font-bold tabular-nums text-[#17233f]">
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
