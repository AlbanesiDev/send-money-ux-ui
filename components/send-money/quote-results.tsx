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
}: {
  quotes: ProviderQuote[];
  selectedProvider: ProviderQuote["provider"] | null;
  onSelect: (quote: ProviderQuote) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-bold">Cotizaciones por proveedor</h2>
      <p className="text-sm text-[#687790]">
        Selecciona una cotización para continuar con el flujo de ese proveedor.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {quotes.map((quote) => {
          const selected = selectedProvider === quote.provider;
          const total = quote.amount + quote.fee + quote.tax;
          return (
            <button
              key={quote.provider}
              type="button"
              onClick={() => onSelect(quote)}
              aria-pressed={selected}
              className={`rounded-xl border p-4 text-left transition-colors ${
                selected
                  ? "border-[#5368c8] bg-[#f4f6ff] ring-2 ring-[#5368c8]/20"
                  : "border-[#dce3ee] bg-white hover:border-[#aebcf0]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#17233f]">
                  {quote.provider}
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    selected
                      ? "bg-[#465bc2] text-white"
                      : "bg-[#eef1fc] text-[#465bc2]"
                  }`}
                >
                  {selected ? "Seleccionado" : "Elegir"}
                </span>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#73809a]">Monto</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatUsd(quote.amount)}
                  </dd>
                </div>
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
                  <dd className="font-bold tabular-nums text-[#465bc2]">
                    {formatUsd(total)}
                  </dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>
    </div>
  );
}
