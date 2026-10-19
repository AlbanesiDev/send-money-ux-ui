"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Field } from "@/components/send-money/field";
import {
  DELIVERY_TYPE_OPTIONS,
  deliveryTypeLabel,
  TERRAPAY_BANK_OPTIONS,
  TERRAPAY_WALLET_OPTIONS,
} from "@/components/send-money/provider-flows";
import { QuoteResults } from "@/components/send-money/quote-results";
import type {
  DeliveryTypeId,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import payoutPartnersCatalog from "@/public/catalogs/catalog-payout-partners.json";
import payoutPartnerLocationsCatalog from "@/public/catalogs/catalog-payout-partner-locations.json";
import { AsyncDataHandler, STATUS } from "@/components/async-data-handler";
import AsyncResult from "@/components/ui/async-result";

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "es"),
  );

const destinationCountryOptions = uniqueSorted(
  countriesCatalog.result.items
    .filter((item) => item.country.ctyActive)
    .map((item) => item.country.ctyName),
);
const payoutPartnerOptions = uniqueSorted(
  payoutPartnersCatalog.result.payoutPartners.map((partner) => partner.name),
);
const payoutLocationOptions = uniqueSorted(
  payoutPartnerLocationsCatalog.result.payoutPartnerLocations.map(
    (location) => location.address.address,
  ),
);

export type QuoteStepProps = {
  quoteLoading: boolean;
  formatUsd: (value: number) => string;
  destinationCountry: string;
  onDestinationCountryChange: (value: string) => void;
  deliveryType: DeliveryTypeId | "";
  onDeliveryTypeChange: (value: DeliveryTypeId | "") => void;
  clearDeliveryExtras: () => void;
  clearAmount: () => void;
  sendAmount: string;
  onSendAmountChange: (value: string) => void;
  amountExceedsBalance: boolean;
  onAmountExceedsBalanceChange: (value: boolean) => void;
  amountUnlocked: boolean;
  sanitizeAmount: (value: string) => string;
  normalizeAmount: (value: string) => string;
  toCents: (value: number) => number;
  agencyUsdBalance: number;
  quickAmounts: number[];
  usdFormatter: Intl.NumberFormat;
  resetQuoteSelection: () => void;
  requestQuote: () => void;
  payingPartner: string;
  onPayingPartnerChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  wuService: string;
  onWuServiceChange: (value: string) => void;
  terraPayBank: string;
  onTerraPayBankChange: (value: string) => void;
  terraPayWallet: string;
  onTerraPayWalletChange: (value: string) => void;
  partnerLoading: boolean;
  locationLoading: boolean;
  simulateOptionsLoad: (
    setLoadingState: (value: boolean) => void,
    target: RefObject<HTMLButtonElement | null>,
  ) => void;
  setPartnerLoading: (value: boolean) => void;
  setLocationLoading: (value: boolean) => void;
  quotesReady: boolean;
  providerQuotes: ProviderQuote[];
  selectedProvider: ProviderId | null;
  onSelectProviderQuote: (quote: ProviderQuote) => void;
  destinationCountryRef: RefObject<HTMLButtonElement | null>;
  deliveryTypeRef: RefObject<HTMLButtonElement | null>;
  payingPartnerRef: RefObject<HTMLButtonElement | null>;
  locationRef: RefObject<HTMLButtonElement | null>;
  wuServiceRef: RefObject<HTMLButtonElement | null>;
  moneygramCompanyRef: RefObject<HTMLButtonElement | null>;
  terraPayBankRef: RefObject<HTMLButtonElement | null>;
  terraPayWalletRef: RefObject<HTMLButtonElement | null>;
  sendAmountRef: RefObject<HTMLInputElement | null>;
  showPartnerLocation: boolean;
  showWuService: boolean;
  showMoneygramCompany: boolean;
  showTerraPayBank: boolean;
  showTerraPayWallet: boolean;
};

export function QuoteStep({
  quoteLoading,
  formatUsd,
  destinationCountry,
  onDestinationCountryChange,
  deliveryType,
  onDeliveryTypeChange,
  clearDeliveryExtras,
  clearAmount,
  sendAmount,
  onSendAmountChange,
  amountExceedsBalance,
  onAmountExceedsBalanceChange,
  amountUnlocked,
  sanitizeAmount,
  normalizeAmount,
  toCents,
  agencyUsdBalance,
  quickAmounts,
  usdFormatter,
  resetQuoteSelection,
  requestQuote,
  payingPartner,
  onPayingPartnerChange,
  location,
  onLocationChange,
  wuService,
  onWuServiceChange,
  terraPayBank,
  onTerraPayBankChange,
  terraPayWallet,
  onTerraPayWalletChange,
  partnerLoading,
  locationLoading,
  simulateOptionsLoad,
  setPartnerLoading,
  setLocationLoading,
  quotesReady,
  providerQuotes,
  selectedProvider,
  onSelectProviderQuote,
  destinationCountryRef,
  deliveryTypeRef,
  payingPartnerRef,
  locationRef,
  wuServiceRef,
  moneygramCompanyRef,
  terraPayBankRef,
  terraPayWalletRef,
  sendAmountRef,
  showPartnerLocation,
  showWuService,
  showMoneygramCompany,
  showTerraPayBank,
  showTerraPayWallet,
}: QuoteStepProps) {
  const requestQuoteRef = useRef(requestQuote);
  requestQuoteRef.current = requestQuote;
  const quoteDebounceRef = useRef<number | null>(null);
  const cbuRef = useRef<HTMLInputElement | null>(null);
  const aliasRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    window.requestAnimationFrame(() => destinationCountryRef.current?.focus());
  }, [destinationCountryRef]);

  useEffect(() => {
    if (!amountUnlocked || !sendAmount || amountExceedsBalance) return;
    if (quoteLoading || quotesReady) return;

    quoteDebounceRef.current = window.setTimeout(() => {
      quoteDebounceRef.current = null;
      requestQuoteRef.current();
    }, 400);

    return () => {
      if (quoteDebounceRef.current !== null) {
        window.clearTimeout(quoteDebounceRef.current);
        quoteDebounceRef.current = null;
      }
    };
  }, [
    sendAmount,
    amountUnlocked,
    amountExceedsBalance,
    terraPayBank,
    terraPayWallet,
    deliveryType,
    quoteLoading,
    quotesReady,
  ]);

  let quotesStatus = STATUS.IDLE;
  if (quoteLoading) {
    quotesStatus = STATUS.LOADING;
  } else if (quotesReady) {
    quotesStatus = STATUS.SUCCESS;
  }

  return (
    <div className="space-y-3">
      <div className="card">
        <h2 className="font-bold text-foreground">Datos del envío</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Moneda de origen" value="USD" disabled />
          <SearchableSelect
            label="País de destino"
            showFlags
            value={destinationCountry}
            options={destinationCountryOptions}
            fieldRef={destinationCountryRef}
            nextRef={deliveryTypeRef}
            onChange={(value) => {
              onDestinationCountryChange(value);
              onDeliveryTypeChange("");
              clearDeliveryExtras();
              clearAmount();
            }}
          />
          <SearchableSelect
            label="Tipo de envío"
            value={deliveryType ? deliveryTypeLabel(deliveryType) : ""}
            options={DELIVERY_TYPE_OPTIONS.map((option) => option.label)}
            fieldRef={deliveryTypeRef}
            disabled={!destinationCountry}
            onChange={(label) => {
              const option = DELIVERY_TYPE_OPTIONS.find(
                (item) => item.label === label,
              );
              if (!option) {
                throw new Error(`Unknown delivery type label: ${label}`);
              }
              onDeliveryTypeChange(option.id);
              clearDeliveryExtras();
              clearAmount();
              window.requestAnimationFrame(() => {
                if (option.id === "BANK") {
                  terraPayBankRef.current?.focus();
                  return;
                }
                if (option.id === "WALLET") {
                  terraPayWalletRef.current?.focus();
                  return;
                }
                sendAmountRef.current?.focus();
              });
            }}
          />
          <div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-foreground">
                Monto a enviar
              </span>
              <span className="relative block">
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold ${amountUnlocked ? "text-brand-strong" : "text-muted-foreground"}`}
                >
                  USD $
                </span>
                <input
                  ref={sendAmountRef}
                  value={sendAmount}
                  aria-describedby={
                    amountExceedsBalance
                      ? "send-amount-currency send-amount-balance-error"
                      : "send-amount-currency"
                  }
                  aria-invalid={amountExceedsBalance}
                  onChange={(event) => {
                    onSendAmountChange(sanitizeAmount(event.target.value));
                    onAmountExceedsBalanceChange(false);
                    resetQuoteSelection();
                  }}
                  onBlur={() => {
                    const normalized = normalizeAmount(sendAmount);
                    onSendAmountChange(normalized);
                    const amount = Number(
                      normalized.replace(/\./g, "").replace(",", "."),
                    );
                    onAmountExceedsBalanceChange(
                      Number.isFinite(amount) &&
                        amount > 0 &&
                        toCents(amount) > toCents(agencyUsdBalance),
                    );
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key !== "Enter" ||
                      event.nativeEvent.isComposing ||
                      event.keyCode === 229
                    )
                      return;
                    event.preventDefault();
                    if (quoteDebounceRef.current !== null) {
                      window.clearTimeout(quoteDebounceRef.current);
                      quoteDebounceRef.current = null;
                    }
                    requestQuote();
                  }}
                  disabled={!amountUnlocked}
                  placeholder="0,00"
                  inputMode="decimal"
                  className={`h-10 w-full rounded-lg border bg-card pl-16 pr-3 text-sm text-foreground outline-none disabled:bg-muted disabled:text-muted-foreground focus:ring-4 ${amountExceedsBalance ? "border-destructive focus:border-destructive focus:ring-destructive/15" : "border-input focus:border-brand focus:ring-brand/10"}`}
                />
                <span id="send-amount-currency" className="sr-only">
                  Dólares estadounidenses, máximo dos decimales
                </span>
              </span>
            </label>
            {amountExceedsBalance && (
              <p
                id="send-amount-balance-error"
                role="alert"
                className="mt-1 text-sm text-destructive"
              >
                El monto supera el saldo virtual de la agencia (
                {formatUsd(agencyUsdBalance)}). No es posible cotizar.
              </p>
            )}
            <div
              role="group"
              aria-label="Montos rápidos"
              className="mt-2 flex flex-wrap gap-1.5"
            >
              {quickAmounts.map((amount) => {
                const selected =
                  normalizeAmount(sendAmount) === usdFormatter.format(amount);
                return (
                  <button
                    key={amount}
                    type="button"
                    aria-pressed={selected}
                    disabled={!amountUnlocked || quoteLoading}
                    onClick={() => {
                      onSendAmountChange(usdFormatter.format(amount));
                      onAmountExceedsBalanceChange(
                        toCents(amount) > toCents(agencyUsdBalance),
                      );
                      resetQuoteSelection();
                      sendAmountRef.current?.focus();
                    }}
                    className={`h-7 rounded-full border px-2.5 text-xs font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-brand/20 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground ${selected ? "border-foreground bg-card text-foreground" : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"}`}
                  >
                    ${amount}
                  </button>
                );
              })}
            </div>
          </div>
          <Field
            label="Monto que recibe"
            value={
              sendAmount
                ? formatUsd(
                    Number(
                      normalizeAmount(sendAmount)
                        .replace(/\./g, "")
                        .replace(",", "."),
                    ),
                  )
                : ""
            }
            disabled
          />
          {showTerraPayBank && (
            <>
              <SearchableSelect
                label="Banco"
                value={terraPayBank}
                options={TERRAPAY_BANK_OPTIONS}
                fieldRef={terraPayBankRef}
                nextRef={cbuRef}
                onChange={(value) => {
                  onTerraPayBankChange(value);
                  resetQuoteSelection();
                }}
              />
              <Field
                inputRef={cbuRef}
                nextRef={sendAmountRef}
                label="CBU/CVU"
              />
            </>
          )}
          {showTerraPayWallet && (
            <>
              <SearchableSelect
                label="Wallet"
                value={terraPayWallet}
                options={TERRAPAY_WALLET_OPTIONS}
                fieldRef={terraPayWalletRef}
                nextRef={aliasRef}
                onChange={(value) => {
                  onTerraPayWalletChange(value);
                  resetQuoteSelection();
                }}
              />
              <Field
                inputRef={aliasRef}
                nextRef={sendAmountRef}
                label="Alias"
              />
            </>
          )}
        </div>
      </div>
      <div className="card">
        <h2 className="font-bold text-foreground">
          Cotizaciones por proveedor
        </h2>

        <AsyncDataHandler
          status={quotesStatus}
          data={providerQuotes}
          idleComponent={
            <AsyncResult
              status={STATUS.IDLE}
              description="Ingresá un monto para ver las cotizaciones disponibles."
            />
          }
          loadingComponent={
            <div className="flex flex-row gap-2 pt-2">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="skeleton h-44 min-w-0 flex-1 rounded-lg"
                />
              ))}
            </div>
          }
          errorComponent={
            <AsyncResult
              status={STATUS.ERROR}
              description="Error al cargar cotizaciones"
            />
          }
          emptyComponent={
            <AsyncResult
              status={STATUS.EMPTY}
              title="Cotizaciones"
              description="Ningún proveedor disponible para este tipo de envío. Probá con otro tipo."
            />
          }
          successComponent={(quotes) => (
            <QuoteResults
              quotes={quotes}
              selectedProvider={selectedProvider}
              onSelect={onSelectProviderQuote}
            />
          )}
        />
      </div>
    </div>
  );
}
