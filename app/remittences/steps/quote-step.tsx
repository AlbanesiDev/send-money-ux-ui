"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Field } from "@/components/send-money/field";
import {
  DELIVERY_TYPE_OPTIONS,
  deliveryTypeLabel,
  providersForDeliveryType,
} from "@/components/send-money/provider-flows";
import { PromoCodeField } from "@/components/send-money/promo-code-field";
import { QuoteResults } from "@/components/send-money/quote-results";
import type {
  DeliveryTypeId,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import banksCatalog from "@/public/catalogs/catalog-banks.json";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import walletsCatalog from "@/public/catalogs/catalog-wallets.json";
import { RiaPayoutFields } from "@/components/send-money/providers/ria/payout-fields";
import { AsyncDataHandler, STATUS } from "@/components/async-data-handler";
import AsyncResult from "@/components/ui/async-result";

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "es"),
  );

const destinationCountryOptions = uniqueSorted(
  countriesCatalog.items.map((item) => item.country.ctyName),
);

const countryIsoByName = new Map(
  countriesCatalog.items.map((item) => [
    item.country.ctyName,
    item.country.ctyIsoCode,
  ]),
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
  terraPayCbu: string;
  onTerraPayCbuChange: (value: string) => void;
  terraPayWallet: string;
  onTerraPayWalletChange: (value: string) => void;
  terraPayAlias: string;
  onTerraPayAliasChange: (value: string) => void;
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
  onSelectProviderQuote: (
    quote: ProviderQuote,
    options?: { keepFocus?: boolean },
  ) => void;
  destinationCountryRef: RefObject<HTMLButtonElement | null>;
  deliveryTypeRef: RefObject<HTMLButtonElement | null>;
  payingPartnerRef: RefObject<HTMLButtonElement | null>;
  locationRef: RefObject<HTMLButtonElement | null>;
  riaPartnerRef: RefObject<HTMLButtonElement | null>;
  riaPayoutError: boolean;
  riaQuoteLoading: boolean;
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
  showPromoCode: boolean;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
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
  terraPayCbu,
  onTerraPayCbuChange,
  terraPayWallet,
  onTerraPayWalletChange,
  terraPayAlias,
  onTerraPayAliasChange,
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
  riaPartnerRef,
  riaPayoutError,
  riaQuoteLoading,
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
  showPromoCode,
  promoCode,
  onPromoCodeChange,
}: QuoteStepProps) {
  const selectedQuote = providerQuotes.find(
    (item) => item.provider === selectedProvider,
  );
  const requestQuoteRef = useRef(requestQuote);
  requestQuoteRef.current = requestQuote;
  const quoteDebounceRef = useRef<number | null>(null);
  const cbuRef = useRef<HTMLInputElement | null>(null);
  const aliasRef = useRef<HTMLInputElement | null>(null);
  const [touched, setTouched] = useState({
    destinationCountry: false,
    deliveryType: false,
    sendAmount: false,
    terraPayBank: false,
    terraPayCbu: false,
    terraPayWallet: false,
    terraPayAlias: false,
  });

  const REQUIRED_MESSAGE = "Este campo es requerido";

  let destinationCountryError = "";
  if (touched.destinationCountry && destinationCountry.trim() === "") {
    destinationCountryError = REQUIRED_MESSAGE;
  }
  let deliveryTypeError = "";
  if (touched.deliveryType && deliveryType === "") {
    deliveryTypeError = REQUIRED_MESSAGE;
  }
  let sendAmountError = "";
  if (touched.sendAmount && sendAmount.trim() === "") {
    sendAmountError = REQUIRED_MESSAGE;
  }
  let sendAmountMessage = "\u00A0";
  let sendAmountMessageVisible = false;
  if (amountExceedsBalance) {
    sendAmountMessage = `El monto supera el saldo virtual de la agencia (${formatUsd(agencyUsdBalance)}). No es posible cotizar.`;
    sendAmountMessageVisible = true;
  } else if (sendAmountError !== "") {
    sendAmountMessage = sendAmountError;
    sendAmountMessageVisible = true;
  }
  let terraPayBankError = "";
  if (showTerraPayBank && touched.terraPayBank && terraPayBank.trim() === "") {
    terraPayBankError = REQUIRED_MESSAGE;
  }
  let terraPayCbuError = "";
  if (showTerraPayBank && touched.terraPayCbu) {
    if (terraPayCbu === "") {
      terraPayCbuError = REQUIRED_MESSAGE;
    } else if (terraPayCbu.length !== 22) {
      terraPayCbuError = `Debe tener exactamente 22 dígitos (${terraPayCbu.length}/22).`;
    }
  }
  let terraPayWalletError = "";
  if (
    showTerraPayWallet &&
    touched.terraPayWallet &&
    terraPayWallet.trim() === ""
  ) {
    terraPayWalletError = REQUIRED_MESSAGE;
  }
  let terraPayAliasError = "";
  if (
    showTerraPayWallet &&
    touched.terraPayAlias &&
    terraPayAlias.trim() === ""
  ) {
    terraPayAliasError = REQUIRED_MESSAGE;
  }

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

  const hasProviderQuotes = providerQuotes.length > 0;
  const isQuoteRefreshing =
    hasProviderQuotes &&
    !amountExceedsBalance &&
    (quoteLoading || !quotesReady);
  const isQuotePending =
    !amountExceedsBalance &&
    Boolean(sendAmount) &&
    Boolean(deliveryType) &&
    !quotesReady;
  let quotesStatus = STATUS.IDLE;
  if (amountExceedsBalance) {
    quotesStatus = STATUS.IDLE;
  } else if (quoteLoading || isQuoteRefreshing || isQuotePending) {
    quotesStatus = STATUS.LOADING;
  } else if (quotesReady) {
    quotesStatus = STATUS.SUCCESS;
  }
  const quoteSkeletonCount =
    deliveryType === "" ? 0 : providersForDeliveryType(deliveryType).length;

  let bankOptions: string[] = [];
  let walletOptions: string[] = [];
  const destinationCountryIso = countryIsoByName.get(destinationCountry);
  if (destinationCountryIso !== undefined) {
    bankOptions = uniqueSorted(
      banksCatalog
        .filter((bank) => bank.countryCode === destinationCountryIso)
        .map((bank) => bank.bankName),
    );
    walletOptions = uniqueSorted(
      walletsCatalog
        .filter((wallet) => wallet.countryCode === destinationCountryIso)
        .map((wallet) => wallet.walletName),
    );
  }

  const riaPayoutSlot = (disabled: boolean) =>
    showPartnerLocation ? (
      <RiaPayoutFields
        countryIso={destinationCountryIso}
        payingPartner={payingPartner}
        location={location}
        onPayingPartnerChange={onPayingPartnerChange}
        onLocationChange={onLocationChange}
        showErrors={riaPayoutError}
        partnerRef={riaPartnerRef}
        disabled={disabled}
      />
    ) : undefined;

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
            error={destinationCountryError}
            onBlur={() =>
              setTouched((current) => ({
                ...current,
                destinationCountry: true,
              }))
            }
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
            error={deliveryTypeError}
            onBlur={() =>
              setTouched((current) => ({ ...current, deliveryType: true }))
            }
            onChange={(label) => {
              const option = DELIVERY_TYPE_OPTIONS.find(
                (item) => item.label === label,
              );
              if (!option) {
                throw new Error(`Unknown delivery type label: ${label}`);
              }
              onDeliveryTypeChange(option.id);
              clearDeliveryExtras();
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
                  className={`pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold ${amountUnlocked ? "text-amount" : "text-muted-foreground"}`}
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
                  aria-invalid={amountExceedsBalance || sendAmountError !== ""}
                  onChange={(event) => {
                    const nextAmount = sanitizeAmount(event.target.value);
                    onSendAmountChange(nextAmount);
                    onAmountExceedsBalanceChange(false);
                    if (nextAmount === "") {
                      clearAmount();
                      return;
                    }
                    resetQuoteSelection();
                  }}
                  onBlur={() => {
                    setTouched((current) => ({
                      ...current,
                      sendAmount: true,
                    }));
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
                  className={`h-10 w-full rounded-lg border bg-card pl-16 pr-3 text-sm text-foreground outline-none disabled:bg-muted disabled:text-muted-foreground focus:ring-4 ${
                    amountExceedsBalance || sendAmountError !== ""
                      ? "border-destructive focus:border-destructive focus:ring-destructive/15"
                      : "border-input focus:border-brand focus:ring-brand/10"
                  }`}
                />
                <span id="send-amount-currency" className="sr-only">
                  Dólares estadounidenses, máximo dos decimales
                </span>
                {sendAmountMessageVisible && (
                  <span
                    id={
                      amountExceedsBalance
                        ? "send-amount-balance-error"
                        : undefined
                    }
                    role="alert"
                    className="pointer-events-none absolute top-[calc(100%+0.125rem)] left-0 z-1 text-[0.6875rem] leading-none text-destructive"
                  >
                    {sendAmountMessage}
                  </span>
                )}
              </span>
            </label>
            <div
              role="group"
              aria-label="Montos rápidos"
              className="mt-3 flex flex-wrap gap-1.5"
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
          {/* <Field
            label="Monto que recibe"
            value={
              selectedQuote
                ? formatUsd(
                    selectedQuote.amount -
                      selectedQuote.fee -
                      selectedQuote.tax,
                  )
                : ""
            }
            disabled
          /> */}
          {showTerraPayBank && (
            <>
              <SearchableSelect
                label="Banco"
                value={terraPayBank}
                options={bankOptions}
                fieldRef={terraPayBankRef}
                nextRef={cbuRef}
                error={terraPayBankError}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    terraPayBank: true,
                  }))
                }
                onChange={(value) => {
                  onTerraPayBankChange(value);
                  resetQuoteSelection();
                }}
              />
              <Field
                inputRef={cbuRef}
                nextRef={sendAmountRef}
                label="CBU/CVU"
                value={terraPayCbu}
                error={terraPayCbuError}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    terraPayCbu: true,
                  }))
                }
                onChange={(value) => {
                  onTerraPayCbuChange(value.replace(/\D/g, "").slice(0, 22));
                }}
              />
            </>
          )}
          {showTerraPayWallet && (
            <>
              <SearchableSelect
                label="Wallet"
                value={terraPayWallet}
                options={walletOptions}
                fieldRef={terraPayWalletRef}
                nextRef={aliasRef}
                error={terraPayWalletError}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    terraPayWallet: true,
                  }))
                }
                onChange={(value) => {
                  onTerraPayWalletChange(value);
                  resetQuoteSelection();
                }}
              />
              <Field
                inputRef={aliasRef}
                nextRef={sendAmountRef}
                label="Alias"
                value={terraPayAlias}
                error={terraPayAliasError}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    terraPayAlias: true,
                  }))
                }
                onChange={onTerraPayAliasChange}
              />
            </>
          )}
          {showPromoCode && (
            <div className="flex flex-col sm:col-span-2 mt-2">
              <PromoCodeField
                promoCode={promoCode}
                onPromoCodeChange={onPromoCodeChange}
                quoteLoading={quoteLoading}
                quotesReady={quotesReady}
                providerQuotes={providerQuotes}
                formatUsd={formatUsd}
              />
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <h2 className="font-bold text-foreground mb-1">
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
            hasProviderQuotes ? (
              <QuoteResults
                quotes={providerQuotes}
                selectedProvider={selectedProvider}
                onSelect={onSelectProviderQuote}
                loading
                riaPayoutSlot={riaPayoutSlot(true)}
              />
            ) : (
              <div className="flex flex-row gap-2 pt-2">
                {[...Array(quoteSkeletonCount)].map((_, index) => (
                  <div
                    key={index}
                    className="skeleton h-44 min-w-0 flex-1 rounded-lg"
                  />
                ))}
              </div>
            )
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
              loading={false}
              riaPayoutSlot={riaPayoutSlot(false)}
              riaQuoteLoading={riaQuoteLoading}
            />
          )}
        />
      </div>
    </div>
  );
}
