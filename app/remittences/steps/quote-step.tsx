"use client";

import { useEffect, type RefObject } from "react";
import { Field } from "@/components/send-money/field";
import {
  DELIVERY_TYPE_OPTIONS,
  deliveryTypeLabel,
  TERRAPAY_BANK_OPTIONS,
  TERRAPAY_WALLET_OPTIONS,
} from "@/components/send-money/provider-flows";
import { QuoteResults } from "@/components/send-money/quote-results";
import {
  RecentTransactions,
  type RecentTransaction,
} from "@/components/send-money/recent-transactions";
import type {
  DeliveryTypeId,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import payoutPartnersCatalog from "@/public/catalogs/catalog-payout-partners.json";
import payoutPartnerLocationsCatalog from "@/public/catalogs/catalog-payout-partner-locations.json";

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
  recentTransactions: RecentTransaction[];
  beneficiaries: { name: string }[];
  selectedTransactionId: string | null;
  quoteLoading: boolean;
  formatUsd: (value: number) => string;
  onRepeatTransaction: (transaction: RecentTransaction) => void;
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
  recentTransactions,
  beneficiaries,
  selectedTransactionId,
  quoteLoading,
  formatUsd,
  onRepeatTransaction,
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
  useEffect(() => {
    window.requestAnimationFrame(() => destinationCountryRef.current?.focus());
  }, [destinationCountryRef]);

  return (
    <div className="space-y-4">
      {recentTransactions.length > 0 && (
        <div className="card">
          <RecentTransactions
            transactions={recentTransactions}
            beneficiaries={beneficiaries}
            selectedId={selectedTransactionId}
            disabled={quoteLoading}
            formatUsd={formatUsd}
            onSelect={onRepeatTransaction}
          />
        </div>
      )}

      <div className="card">
        <h2 className="font-bold text-[#17233f]">Datos de la cotización</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                sendAmountRef.current?.focus();
              });
            }}
          />
          <div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#263653]">
                Monto a enviar
              </span>
              <span className="relative block">
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold ${amountUnlocked ? "text-[#465bc2]" : "text-[#a3adbd]"}`}
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
                    requestQuote();
                  }}
                  disabled={!amountUnlocked}
                  placeholder="0,00"
                  inputMode="decimal"
                  className={`h-10 w-full rounded-lg border pl-16 pr-3 text-sm text-[#17233f] outline-none disabled:bg-[#f3f5f9] disabled:text-[#8a96aa] focus:ring-4 ${amountExceedsBalance ? "border-[#e39aa8] focus:border-[#b52e45] focus:ring-[#b52e45]/15" : "border-[#cdd5e1] focus:border-[#5368c8] focus:ring-[#5368c8]/10"}`}
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
                className="mt-1 text-sm text-[#a34f60]"
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
                    className={`h-7 rounded-full border px-2.5 text-xs font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20 disabled:cursor-not-allowed disabled:border-[#e2e7ef] disabled:bg-transparent disabled:text-[#a3adbd] ${selected ? "border-[#5a6578] bg-white text-[#17233f]" : "border-[#d5dbe6] bg-white text-[#5a6578] hover:border-[#9aa3b5] hover:text-[#17233f]"}`}
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
            <SearchableSelect
              label="Banco"
              value={terraPayBank}
              options={TERRAPAY_BANK_OPTIONS}
              fieldRef={terraPayBankRef}
              nextRef={sendAmountRef}
              onChange={(value) => {
                onTerraPayBankChange(value);
                resetQuoteSelection();
              }}
            />
          )}
          {showTerraPayWallet && (
            <SearchableSelect
              label="Wallet"
              value={terraPayWallet}
              options={TERRAPAY_WALLET_OPTIONS}
              fieldRef={terraPayWalletRef}
              nextRef={sendAmountRef}
              onChange={(value) => {
                onTerraPayWalletChange(value);
                resetQuoteSelection();
              }}
            />
          )}

          <div className="sm:col-span-2 sm:flex sm:items-end lg:col-span-3">
            <button
              type="button"
              onClick={() => requestQuote()}
              disabled={
                !amountUnlocked ||
                !sendAmount ||
                quoteLoading ||
                amountExceedsBalance
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#c5cddb] px-5 text-sm font-bold text-[#3a4558] transition-colors hover:border-[#9aa3b5] hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:border-[#e2e7ef] disabled:text-[#a3adbd] disabled:hover:bg-transparent focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20"
            >
              {quoteLoading && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              )}
              {quoteLoading ? "Cotizando..." : "Cotizar"}
            </button>
          </div>
        </div>
      </div>
      <div className="card">
        {quotesReady && deliveryType && (
          <QuoteResults
            quotes={providerQuotes}
            selectedProvider={selectedProvider}
            deliveryType={deliveryType}
            onSelect={onSelectProviderQuote}
          />
        )}
      </div>
    </div>
  );
}
