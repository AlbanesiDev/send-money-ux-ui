"use client";

import { useRef, useState } from "react";
import { TicketPercentIcon, XIcon } from "lucide-react";
import { normalizePromoCode } from "@/lib/simulated-api/promotions-api";
import type { ProviderQuote } from "./types";

export function PromoCodeField({
  promoCode,
  onPromoCodeChange,
  quoteLoading,
  quotesReady,
  providerQuotes,
  formatUsd,
}: {
  /** Applied code, sent as `promo_code` (WU) / `PromoCode` (RIA) when quoting. */
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  quoteLoading: boolean;
  quotesReady: boolean;
  providerQuotes: ProviderQuote[];
  formatUsd: (value: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (promoCode === "" && !open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          window.requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="inline-flex items-center gap-1.5 self-start rounded-md text-sm font-semibold text-brand-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
      >
        <TicketPercentIcon className="size-4" aria-hidden="true" />
        Agregar código promocional
      </button>
    );
  }

  if (promoCode === "") {
    const normalizedDraft = normalizePromoCode(draft);
    const apply = () => {
      if (normalizedDraft === "") return;
      onPromoCodeChange(normalizedDraft);
      setDraft("");
      setOpen(false);
    };
    return (
      <div>
        <label
          htmlFor="promo-code"
          className="mb-1 block text-sm font-semibold text-foreground"
        >
          Código promocional
        </label>
        <div className="flex gap-2">
          <input
            id="promo-code"
            ref={inputRef}
            value={draft}
            onChange={(event) =>
              setDraft(normalizePromoCode(event.target.value))
            }
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setDraft("");
                setOpen(false);
                return;
              }
              if (
                event.key !== "Enter" ||
                event.nativeEvent.isComposing ||
                event.keyCode === 229
              )
                return;
              event.preventDefault();
              apply();
            }}
            maxLength={20}
            autoComplete="off"
            placeholder="Ej. PROMO10"
            aria-describedby="promo-code-help"
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm uppercase text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
          <button
            type="button"
            onClick={apply}
            disabled={normalizedDraft === "" || quoteLoading}
            className="h-10 shrink-0 rounded-lg border border-brand-strong px-4 text-sm font-semibold text-brand-strong hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft("");
              setOpen(false);
            }}
            className="h-10 shrink-0 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
          >
            Cancelar
          </button>
        </div>
        <p id="promo-code-help" className="mt-1 text-xs text-muted-foreground">
          Aplica a Western Union y RIA. Se valida al cotizar.
        </p>
      </div>
    );
  }

  const applied = providerQuotes.filter((quote) => quote.promotion !== null);
  let message = "Se validará al cotizar.";
  let messageClass = "text-muted-foreground";
  if (quoteLoading) {
    message = "Validando código…";
  } else if (quotesReady && applied.length === 0) {
    message = "El código no es válido para este envío.";
    messageClass = "text-destructive";
  } else if (quotesReady) {
    message = applied
      .map((quote) => {
        const discount = quote.promotion ? quote.promotion.discount : 0;
        return `${quote.label}: −${formatUsd(discount)}`;
      })
      .join(" · ");
    messageClass = "text-success";
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-foreground">
        Código promocional
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-success-border bg-success-soft pl-3 pr-1 text-sm font-bold text-success">
          <TicketPercentIcon className="size-4" aria-hidden="true" />
          {promoCode}
          <button
            type="button"
            onClick={() => onPromoCodeChange("")}
            disabled={quoteLoading}
            aria-label={`Quitar código ${promoCode}`}
            title="Quitar código"
            className="flex size-6 items-center justify-center rounded-full hover:bg-success/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success disabled:cursor-wait"
          >
            <XIcon className="size-3.5" aria-hidden="true" />
          </button>
        </span>
        <p
          role="status"
          aria-live="polite"
          className={`text-xs font-semibold ${messageClass}`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
