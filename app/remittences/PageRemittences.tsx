"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import {
  RemittanceProcessing,
  RemittanceSuccess,
} from "@/components/remittance-success";
import {
  AddPaymentMethodDialog,
  CancelOperationDialog,
} from "@/app/remittences/dialogs";
import {
  BASE_STEPS,
  buildActiveSteps,
  buildProviderQuotes,
  findStepNumber,
  getStepKey,
  quoteFieldVisibility,
} from "@/components/send-money/provider-flows";
import {
  KNOWN_CLIENT_TRANSACTIONS,
  type RecentTransaction,
} from "@/components/send-money/recent-transactions";
import { PaymentMethodPanel } from "@/components/send-money/shared/payment-method-panel";
import type {
  DeliveryTypeId,
  PaymentCurrency,
  PaymentLine,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import { RemittanceSummary } from "@/components/ui/remittance-summary";
import { Stepper } from "@/components/ui/stepper";
import {
  IdentifySenderStep,
  ProviderFlowStep,
  QuoteStep,
  type ClientSearchResult,
} from "@/app/remittences/steps";
import { ArrowLeftIcon, ArrowRightIcon, SendIcon } from "lucide-react";

function useAltFieldNavigation() {
  useEffect(() => {
    function advanceOnEnter(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        event.defaultPrevented ||
        event.altKey ||
        event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing ||
        event.keyCode === 229
      )
        return;
      const target = event.target as HTMLElement;
      if (!target.matches("input, select")) return;
      const container = target.closest("[data-enter-advance]");
      if (!container) return;
      const fields = Array.from(
        container.querySelectorAll<HTMLElement>(
          'input:not([disabled]):not([readonly]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[aria-haspopup="listbox"]:not([disabled])',
        ),
      );
      const current = fields.indexOf(target);
      if (current < 0) return;
      event.preventDefault();
      const nextField = fields[current + 1];
      if (nextField) nextField.focus();
      else
        document
          .querySelector<HTMLButtonElement>("[data-next-button]")
          ?.focus();
    }
    function moveBetweenFields(event: KeyboardEvent) {
      advanceOnEnter(event);
      if (
        !event.altKey ||
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      const target = event.target as HTMLElement;
      if (!target.matches("input, select, textarea")) return;
      const container = target.closest("[data-form-fields]");
      if (!container) return;
      const fields = Array.from(
        container.querySelectorAll<HTMLElement>(
          "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        ),
      );
      const current = fields.indexOf(target);
      if (current < 0) return;
      const currentRect = target.getBoundingClientRect();
      const horizontal =
        event.key === "ArrowLeft" || event.key === "ArrowRight";
      const direction =
        event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      const candidates = fields.filter((field, index) => {
        if (index === current) return false;
        const rect = field.getBoundingClientRect();
        return horizontal
          ? direction < 0
            ? rect.right <= currentRect.left
            : rect.left >= currentRect.right
          : direction < 0
            ? rect.bottom <= currentRect.top
            : rect.top >= currentRect.bottom;
      });
      if (!candidates.length) return;
      const next = candidates.reduce((best, field) => {
        const rect = field.getBoundingClientRect();
        const bestRect = best.getBoundingClientRect();
        const distance = horizontal
          ? Math.abs(rect.left - currentRect.left) +
            Math.abs(rect.top - currentRect.top)
          : Math.abs(rect.top - currentRect.top) +
            Math.abs(rect.left - currentRect.left);
        const bestDistance = horizontal
          ? Math.abs(bestRect.left - currentRect.left) +
            Math.abs(bestRect.top - currentRect.top)
          : Math.abs(bestRect.top - currentRect.top) +
            Math.abs(bestRect.left - currentRect.left);
        return distance < bestDistance ? field : best;
      });
      event.preventDefault();
      next.focus();
    }
    document.addEventListener("keydown", moveBetweenFields);
    return () => document.removeEventListener("keydown", moveBetweenFields);
  }, []);
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];
const AGENCY_USD_BALANCE = 700;

const usdFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

function sanitizeAmount(value: string) {
  const cleaned = value.replace(/\./g, "").replace(/[^0-9,]/g, "");
  const [integerPart, ...decimalParts] = cleaned.split(",");
  if (decimalParts.length === 0) return integerPart;
  return `${integerPart || "0"},${decimalParts.join("").slice(0, 2)}`;
}

function normalizeAmount(value: string) {
  if (!value) return "";
  const amount = Number(value.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(amount)) return "";
  return usdFormatter.format(amount);
}

const formatUsd = (value: number) => `${usdFormatter.format(value)} USD`;
const formatAmount = (value: number) => usdFormatter.format(value);
const parseAmount = (value: string) =>
  Number(value.replace(/\./g, "").replace(",", "."));
const toCents = (value: number) => Math.round(value * 100);
/** Tipo de cambio oficial BOB por USD (mock hasta integrar el servicio). */
const BOB_PER_USD = 6.96;
const paymentMethodOptions = [
  "Pago en efectivo",
  "Tarjeta de débito",
  "Tarjeta de crédito",
  "Transferencia bancaria",
  "Pago QR",
];

function PageRemittences() {
  const [flowKey, setFlowKey] = useState(0);
  return (
    <TransactionFlow
      key={flowKey}
      onReset={() => setFlowKey((key) => key + 1)}
    />
  );
}

function TransactionFlow({ onReset }: { onReset: () => void }) {
  useAltFieldNavigation();
  const [step, setStep] = useState(1);
  const [activeSteps, setActiveSteps] = useState<string[]>([...BASE_STEPS]);
  const [documentNumber, setDocumentNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(
    null,
  );
  const [providerQuotes, setProviderQuotes] = useState<ProviderQuote[]>([]);
  const [destinationCountry, setDestinationCountry] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeId | "">("");
  const [payingPartner, setPayingPartner] = useState("");
  const [location, setLocation] = useState("");
  const [wuService, setWuService] = useState("");
  const [moneygramCompany, setMoneygramCompany] = useState("");
  const [terraPayBank, setTerraPayBank] = useState("");
  const [terraPayWallet, setTerraPayWallet] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [amountExceedsBalance, setAmountExceedsBalance] = useState(false);
  const deliveryTypeRef = useRef<HTMLButtonElement>(null);
  const wuServiceRef = useRef<HTMLButtonElement>(null);
  const moneygramCompanyRef = useRef<HTMLButtonElement>(null);
  const terraPayBankRef = useRef<HTMLButtonElement>(null);
  const terraPayWalletRef = useRef<HTMLButtonElement>(null);
  const quoteFields =
    deliveryType === "" ? null : quoteFieldVisibility(deliveryType);
  const showPartnerLocation = Boolean(quoteFields?.showRiaPartnerLocation);
  const showWuService = Boolean(
    quoteFields?.showWuService && deliveryType !== "",
  );
  const showMoneygramCompany = Boolean(quoteFields?.showMoneygramCompany);
  const showTerraPayBank = Boolean(quoteFields?.showTerraPayBank);
  const showTerraPayWallet = Boolean(quoteFields?.showTerraPayWallet);
  const amountUnlocked = deliveryType !== "";

  const clearDeliveryExtras = () => {
    setPayingPartner("");
    setLocation("");
    setWuService("");
    setMoneygramCompany("");
    setTerraPayBank("");
    setTerraPayWallet("");
  };
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState("Pago en efectivo");
  const [primaryCurrency, setPrimaryCurrency] =
    useState<PaymentCurrency>("USD");
  const [extraPayments, setExtraPayments] = useState<PaymentLine[]>([]);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const paymentIdRef = useRef(0);
  const [quote, setQuote] = useState<ProviderQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quotesReady, setQuotesReady] = useState(false);
  const quoteRequestRef = useRef(0);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const lastStep = activeSteps.length;
  const clearAmount = () => {
    setSelectedTransactionId(null);
    quoteRequestRef.current += 1;
    setSendAmount("");
    setAmountExceedsBalance(false);
    setQuote(null);
    setProviderQuotes([]);
    setQuotesReady(false);
    setSelectedProvider(null);
    setActiveSteps([...BASE_STEPS]);
    setQuoteLoading(false);
    setStep((current) => Math.min(current, 2));
  };
  const requestQuote = (override?: {
    amount: number;
    deliveryType: DeliveryTypeId;
    provider: ProviderId;
  }) => {
    const type = override?.deliveryType ?? deliveryType;
    if (!type) return;
    const normalizedAmount = override
      ? usdFormatter.format(override.amount)
      : normalizeAmount(sendAmount);
    setSendAmount(normalizedAmount);
    const amount = Number(
      normalizedAmount.replace(/\./g, "").replace(",", "."),
    );
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (toCents(amount) > toCents(AGENCY_USD_BALANCE)) {
      setAmountExceedsBalance(true);
      setQuote(null);
      setProviderQuotes([]);
      setQuotesReady(false);
      setSelectedProvider(null);
      setActiveSteps([...BASE_STEPS]);
      setQuoteLoading(false);
      setStep((current) => Math.min(current, 2));
      return;
    }
    setAmountExceedsBalance(false);
    const requestId = ++quoteRequestRef.current;
    setQuoteLoading(true);
    setQuote(null);
    setSelectedProvider(null);
    setProviderQuotes([]);
    setQuotesReady(false);
    setActiveSteps([...BASE_STEPS]);
    setStep((current) => Math.min(current, 2));
    window.setTimeout(() => {
      if (requestId !== quoteRequestRef.current) return;
      const quotes = buildProviderQuotes(amount, type);
      const cheapest = [...quotes].sort(
        (a, b) => a.amount + a.fee + a.tax - (b.amount + b.fee + b.tax),
      )[0];
      // Al repetir una transacción se mantiene su proveedor.
      const preferred =
        quotes.find((item) => item.provider === override?.provider) ?? cheapest;
      setProviderQuotes(quotes);
      setQuotesReady(true);
      setQuoteLoading(false);
      if (preferred) {
        setSelectedProvider(preferred.provider);
        setQuote(preferred);
        setActiveSteps(buildActiveSteps(preferred.provider));
      }
      window.requestAnimationFrame(() => nextButtonRef.current?.focus());
    }, 900);
  };
  const selectProviderQuote = (providerQuote: ProviderQuote) => {
    setSelectedProvider(providerQuote.provider);
    setQuote(providerQuote);
    setActiveSteps(buildActiveSteps(providerQuote.provider));
    window.requestAnimationFrame(() => nextButtonRef.current?.focus());
  };
  const resetQuoteSelection = () => {
    setSelectedTransactionId(null);
    quoteRequestRef.current += 1;
    setQuote(null);
    setProviderQuotes([]);
    setQuotesReady(false);
    setSelectedProvider(null);
    setActiveSteps([...BASE_STEPS]);
    setStep((current) => Math.min(current, 2));
    setQuoteLoading(false);
  };
  const [result, setResult] = useState<ClientSearchResult>(null);
  const isKnownClient = result === "success";
  const known = (value?: string) => (isKnownClient ? value : undefined);
  const senderName = isKnownClient ? "Eliana Antezana Ovando" : "";
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingOverride, setBillingOverride] = useState<{
    name: string;
    nit: string;
  } | null>(null);
  const billingName = billingOverride ? billingOverride.name : senderName;
  const billingNit = billingOverride ? billingOverride.nit : documentNumber;
  const continueRef = useRef<HTMLButtonElement>(null);
  const destinationCountryRef = useRef<HTMLButtonElement>(null);
  const payingPartnerRef = useRef<HTMLButtonElement>(null);
  const locationRef = useRef<HTMLButtonElement>(null);
  const sendAmountRef = useRef<HTMLInputElement>(null);
  const paymentMethodRef = useRef<HTMLButtonElement>(null);
  const totalToCharge = quote ? quote.amount + quote.fee + quote.tax : 0;
  const primaryCents = Math.max(
    0,
    toCents(totalToCharge) -
      extraPayments.reduce((sum, line) => sum + line.usdCents, 0),
  );
  const paymentLines: PaymentLine[] = [
    ...(primaryCents > 0
      ? [
          {
            id: -1,
            method: paymentMethod,
            currency: primaryCurrency,
            amount:
              primaryCurrency === "USD"
                ? primaryCents / 100
                : (primaryCents * BOB_PER_USD) / 100,
            usdCents: primaryCents,
          },
        ]
      : []),
    ...extraPayments,
  ];
  useEffect(() => {
    setExtraPayments([]);
  }, [totalToCharge]);
  const isReviewStep =
    selectedProvider !== null &&
    step >= 3 &&
    getStepKey(selectedProvider, step) === "review";
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const optionsRequestRef = useRef(0);
  const simulateOptionsLoad = (
    setLoadingState: (value: boolean) => void,
    target: RefObject<HTMLButtonElement | null>,
  ) => {
    const requestId = ++optionsRequestRef.current;
    setPartnerLoading(false);
    setLocationLoading(false);
    flushSync(() => setLoadingState(true));
    target.current?.focus();
    window.setTimeout(() => {
      if (requestId !== optionsRequestRef.current) return;
      flushSync(() => setLoadingState(false));
      target.current?.focus();
    }, 900);
  };
  const [sent, setSent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const processingTimeoutRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(processingTimeoutRef.current), []);
  const [additionalChecks, setAdditionalChecks] = useState<
    Record<string, boolean>
  >({ "¿Es una Persona Expuesta Políticamente (PEP)?": true });
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(0);
  const beneficiaries = [
    {
      name: "Joaco Test Devv Test",
      document: "78073652",
      city: "Acerani",
      phone: "4554545454",
      email: "beneficiario@example.com",
    },
    {
      name: "María Fernanda López",
      document: "6543210",
      city: "La Paz",
      phone: "712345678",
      email: "m***@example.com",
    },
    {
      name: "Carlos Alberto Rojas",
      document: "9876543",
      city: "Cochabamba",
      phone: "765432109",
      email: "c***@example.com",
    },
  ];
  const beneficiary = beneficiaries[selectedBeneficiary];
  const recentTransactions = isKnownClient ? KNOWN_CLIENT_TRANSACTIONS : [];

  // Autocompleta cotización, beneficiario y pago a partir de una transacción
  // previa; los datos del remitente y PEP ya vienen del cliente encontrado.
  function repeatTransaction(transaction: RecentTransaction) {
    optionsRequestRef.current += 1;
    setPartnerLoading(false);
    setLocationLoading(false);
    setDestinationCountry(transaction.destinationCountry);
    setDeliveryType(transaction.deliveryType);
    setPayingPartner(transaction.payingPartner ?? "");
    setLocation(transaction.location ?? "");
    setWuService(transaction.wuService);
    setMoneygramCompany("");
    setTerraPayBank(transaction.terraPayBank ?? "");
    setTerraPayWallet(transaction.terraPayWallet ?? "");
    setSendAmount(usdFormatter.format(transaction.amount));
    setSelectedBeneficiary(transaction.beneficiaryIndex);
    setPaymentMethod(transaction.paymentMethod);
    setPrimaryCurrency("USD");
    setExtraPayments([]);
    requestQuote({
      amount: transaction.amount,
      deliveryType: transaction.deliveryType,
      provider: transaction.provider,
    });
    setSelectedTransactionId(transaction.id);
  }

  useEffect(() => {
    if (result === "success" || result === "empty") {
      setAdditionalChecks(
        result === "success"
          ? { "¿Es una Persona Expuesta Políticamente (PEP)?": true }
          : {},
      );
    }
  }, [result]);

  useEffect(() => {
    if (
      selectedProvider &&
      step >= 3 &&
      getStepKey(selectedProvider, step) === "parties"
    ) {
      window.requestAnimationFrame(() => {
        const fields = Array.from(
          document.querySelectorAll<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >(
            "[data-enter-advance] input[required]:not([disabled]):not([readonly]):not([type=hidden]):not([type=checkbox]):not([type=radio]), [data-enter-advance] select[required]:not([disabled]), [data-enter-advance] textarea[required]:not([disabled]):not([readonly])",
          ),
        );
        const firstEmptyRequired = fields.find((field) => !field.value.trim());
        if (firstEmptyRequired) {
          firstEmptyRequired.focus();
          return;
        }
        nextButtonRef.current?.focus();
      });
    }
    if (isReviewStep) {
      window.requestAnimationFrame(() => nextButtonRef.current?.blur());
    }
  }, [step, isReviewStep, selectedProvider]);

  function next() {
    if (step === 2 && !selectedProvider) return;
    if (step === 2 && selectedTransactionId !== null) {
      setStep(findStepNumber(activeSteps, "Revisión"));
      return;
    }
    setStep((current) => Math.min(lastStep, current + 1));
  }
  function back() {
    setStep((current) => Math.max(1, current - 1));
  }
  function goToStep(target: number) {
    if (target < 1 || target > lastStep) return;
    setStep(target);
  }
  function handleContinue() {
    if (!isReviewStep) return next();
    if (processing) return;
    setProcessing(true);
    processingTimeoutRef.current = window.setTimeout(() => {
      setProcessing(false);
      setSent(true);
    }, 2500);
  }
  function startAnotherQuote() {
    clearAmount();
    setPaymentMethod("Pago en efectivo");
    setPrimaryCurrency("USD");
    setExtraPayments([]);
    window.clearTimeout(processingTimeoutRef.current);
    setProcessing(false);
    setSent(false);
    setStep(2);
  }

  useEffect(() => {
    function handleStepperShortcut(event: KeyboardEvent) {
      if (!event.shiftKey) return;
      const number = Number(event.key);
      if (number >= 1 && number <= lastStep) {
        event.preventDefault();
        goToStep(number);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", handleStepperShortcut);
    return () => window.removeEventListener("keydown", handleStepperShortcut);
  }, [step, lastStep, selectedProvider]);

  return (
    <section
      className={`flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-[14px] text-foreground ${step === 2 || step === 3 ? "" : "bg-card shadow-[0_12px_35px_rgba(24,37,73,0.06)] dark:shadow-none"}`}
    >
      {processing ? (
        <RemittanceProcessing totalSent={formatUsd(quote ? quote.amount : 0)} />
      ) : sent ? (
        <RemittanceSuccess
          operationNumber="12030070733"
          totalSent={formatUsd(quote ? quote.amount : 0)}
          onNewTransaction={onReset}
          onRepeatClient={startAnotherQuote}
          onSameBeneficiary={startAnotherQuote}
        />
      ) : (
        <>
          {step > 0 && (
            <Stepper
              steps={activeSteps}
              currentStep={step}
              onStepClick={goToStep}
              ariaLabel="Progreso de la transacción"
            />
          )}
          <div
            className={`grid min-h-0 flex-1 gap-4 overflow-y-auto ${step > 1 && !sent ? "lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]" : ""}`}
          >
            <div
              className={`min-w-0 ${step === 1 || sent ? "mx-auto w-full max-w-[960px]" : ""}`}
              data-form-fields
              data-enter-advance={
                selectedProvider &&
                step >= 3 &&
                getStepKey(selectedProvider, step) === "parties"
                  ? ""
                  : undefined
              }
            >
              <div>
                {step === 1 && (
                  <IdentifySenderStep
                    step={step}
                    lastStep={lastStep}
                    documentNumber={documentNumber}
                    onDocumentNumberChange={setDocumentNumber}
                    result={result}
                    onResultChange={setResult}
                    onContinue={next}
                    continueRef={continueRef}
                    recentTransactions={recentTransactions}
                    beneficiaries={beneficiaries}
                    selectedTransactionId={selectedTransactionId}
                    quoteLoading={quoteLoading}
                    formatUsd={formatUsd}
                    onRepeatTransaction={(transaction) => {
                      repeatTransaction(transaction);
                      setStep(2);
                    }}
                  />
                )}
                {step === 2 && (
                  <QuoteStep
                    quoteLoading={quoteLoading}
                    formatUsd={formatUsd}
                    destinationCountry={destinationCountry}
                    onDestinationCountryChange={setDestinationCountry}
                    deliveryType={deliveryType}
                    onDeliveryTypeChange={setDeliveryType}
                    clearDeliveryExtras={clearDeliveryExtras}
                    clearAmount={clearAmount}
                    sendAmount={sendAmount}
                    onSendAmountChange={setSendAmount}
                    amountExceedsBalance={amountExceedsBalance}
                    onAmountExceedsBalanceChange={setAmountExceedsBalance}
                    amountUnlocked={amountUnlocked}
                    sanitizeAmount={sanitizeAmount}
                    normalizeAmount={normalizeAmount}
                    toCents={toCents}
                    agencyUsdBalance={AGENCY_USD_BALANCE}
                    quickAmounts={QUICK_AMOUNTS}
                    usdFormatter={usdFormatter}
                    resetQuoteSelection={resetQuoteSelection}
                    requestQuote={() => requestQuote()}
                    payingPartner={payingPartner}
                    onPayingPartnerChange={setPayingPartner}
                    location={location}
                    onLocationChange={setLocation}
                    wuService={wuService}
                    onWuServiceChange={setWuService}
                    terraPayBank={terraPayBank}
                    onTerraPayBankChange={setTerraPayBank}
                    terraPayWallet={terraPayWallet}
                    onTerraPayWalletChange={setTerraPayWallet}
                    partnerLoading={partnerLoading}
                    locationLoading={locationLoading}
                    simulateOptionsLoad={simulateOptionsLoad}
                    setPartnerLoading={setPartnerLoading}
                    setLocationLoading={setLocationLoading}
                    quotesReady={quotesReady}
                    providerQuotes={providerQuotes}
                    selectedProvider={selectedProvider}
                    onSelectProviderQuote={selectProviderQuote}
                    destinationCountryRef={destinationCountryRef}
                    deliveryTypeRef={deliveryTypeRef}
                    payingPartnerRef={payingPartnerRef}
                    locationRef={locationRef}
                    wuServiceRef={wuServiceRef}
                    moneygramCompanyRef={moneygramCompanyRef}
                    terraPayBankRef={terraPayBankRef}
                    terraPayWalletRef={terraPayWalletRef}
                    sendAmountRef={sendAmountRef}
                    showPartnerLocation={showPartnerLocation}
                    showWuService={showWuService}
                    showMoneygramCompany={showMoneygramCompany}
                    showTerraPayBank={showTerraPayBank}
                    showTerraPayWallet={showTerraPayWallet}
                  />
                )}
                {step >= 3 && selectedProvider && quote && (
                  <ProviderFlowStep
                    provider={selectedProvider}
                    step={step}
                    documentNumber={documentNumber}
                    known={known}
                    isKnownClient={isKnownClient}
                    beneficiaries={beneficiaries}
                    selectedBeneficiary={selectedBeneficiary}
                    onSelectBeneficiary={setSelectedBeneficiary}
                    additionalChecks={additionalChecks}
                    onAdditionalCheckChange={(label, checked) =>
                      setAdditionalChecks((current) => ({
                        ...current,
                        [label]: checked,
                      }))
                    }
                    quote={quote}
                    totalToCharge={totalToCharge}
                    formatUsd={formatUsd}
                    destinationCountry={destinationCountry}
                    payingPartner={payingPartner}
                    location={location}
                    wuService={wuService}
                    moneygramCompany={moneygramCompany}
                    terraPayBank={terraPayBank}
                    terraPayWallet={terraPayWallet}
                    senderName={senderName}
                    paymentLines={paymentLines}
                    billingName={billingName}
                    billingNit={billingNit}
                    billingOpen={billingOpen}
                    billingOverride={billingOverride}
                    onBillingOpenToggle={() =>
                      setBillingOpen((current) => !current)
                    }
                    onBillingChange={(field, value) =>
                      setBillingOverride({
                        name: billingName,
                        nit: billingNit,
                        [field]: value,
                      })
                    }
                    onBillingReset={() => {
                      setBillingOverride(null);
                      setBillingOpen(false);
                    }}
                    onEditQuote={() => setStep(2)}
                    onEditRemitter={() =>
                      setStep(
                        findStepNumber(activeSteps, "Remitente y beneficiario"),
                      )
                    }
                    onEditBeneficiary={() =>
                      setStep(
                        findStepNumber(activeSteps, "Remitente y beneficiario"),
                      )
                    }
                    onEditPayment={() =>
                      window.requestAnimationFrame(() =>
                        paymentMethodRef.current?.focus(),
                      )
                    }
                    formatAmount={formatAmount}
                  />
                )}
              </div>
            </div>
            {step > 1 && (
              <aside className="sticky top-0 flex flex-col gap-3 self-start">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Remitente
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-foreground">
                      {isKnownClient
                        ? "Eliana Antezana Ovando"
                        : "Nuevo cliente"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cédula: {documentNumber}
                      {isKnownClient && " · j***@cislatam.com"}
                    </p>
                    {isKnownClient && (
                      <p className="mt-1 text-sm font-semibold text-brand">
                        PEP: Sí
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Beneficiario
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-foreground">
                      {beneficiary.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Doc: {beneficiary.document} · {beneficiary.city}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {beneficiary.phone} · {beneficiary.email}
                    </p>
                  </div>
                </div>
                <RemittanceSummary
                  provider={selectedProvider}
                  quote={quote}
                  deliveryType={deliveryType}
                  loading={quoteLoading}
                />
                <PaymentMethodPanel
                  provider={selectedProvider}
                  totalToCharge={totalToCharge}
                  formatUsd={formatUsd}
                  formatAmount={formatAmount}
                  bobPerUsd={BOB_PER_USD}
                  primaryMethod={paymentMethod}
                  onPrimaryMethodChange={setPaymentMethod}
                  primaryMethodRef={paymentMethodRef}
                  primaryCurrency={primaryCurrency}
                  onPrimaryCurrencyChange={setPrimaryCurrency}
                  primaryCents={primaryCents}
                  extraPayments={extraPayments}
                  onUpdatePayment={(id, line) =>
                    setExtraPayments((current) =>
                      current.map((item) =>
                        item.id === id ? { ...line, id } : item,
                      ),
                    )
                  }
                  onRemovePayment={(id) =>
                    setExtraPayments((current) =>
                      current.filter((line) => line.id !== id),
                    )
                  }
                  onAddPaymentOpen={() => setAddPaymentOpen(true)}
                  paymentMethodOptions={paymentMethodOptions}
                  sanitizeAmount={sanitizeAmount}
                  parseAmount={parseAmount}
                  toCents={toCents}
                />
              </aside>
            )}
          </div>
          {step > 1 && (
            <div className="flex h-[42px] shrink-0 items-center">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={back}
                    className=" rounded-md border flex items-center gap-2 border-border px-4 py-1 text-sm font-bold text-muted-foreground hover:bg-white bg-muted"
                  >
                    <ArrowLeftIcon className="size-4" />
                    Volver
                  </button>
                  <CancelOperationDialog
                    open={cancelConfirmOpen}
                    onOpenChange={setCancelConfirmOpen}
                    onConfirm={onReset}
                  />
                </div>
                <button
                  type="button"
                  ref={nextButtonRef}
                  data-next-button
                  onClick={handleContinue}
                  disabled={step === 2 && !selectedProvider}
                  className="flex items-center gap-2 rounded-md bg-brand-strong px-4 py-1 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
                >
                  {isReviewStep ? "Confirmar y enviar" : "Siguiente"}
                  {isReviewStep !== true && (
                    <ArrowRightIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          <AddPaymentMethodDialog
            open={addPaymentOpen}
            onOpenChange={setAddPaymentOpen}
            paymentMethodOptions={paymentMethodOptions}
            primaryMethod={paymentMethod}
            primaryCurrency={primaryCurrency}
            primaryCents={primaryCents}
            extraPayments={extraPayments}
            bobPerUsd={BOB_PER_USD}
            formatUsd={formatUsd}
            formatAmount={formatAmount}
            sanitizeAmount={sanitizeAmount}
            parseAmount={parseAmount}
            toCents={toCents}
            onAddPayment={(line) =>
              setExtraPayments((current) => [
                ...current,
                { ...line, id: ++paymentIdRef.current },
              ])
            }
          />
        </>
      )}
    </section>
  );
}

export default PageRemittences;
