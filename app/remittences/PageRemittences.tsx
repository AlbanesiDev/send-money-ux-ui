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
  EditBeneficiaryDialog,
  EditPaymentBillingDialog,
  EditRemitterDialog,
} from "@/app/remittences/dialogs";
import {
  buildActiveSteps,
  buildProviderQuotes,
  buildQuoteLoadingSteps,
  deliveryTypeLabel,
  getStepKey,
  PARTIES_STEP_LABEL,
  quoteFieldVisibility,
} from "@/components/send-money/provider-flows";
import type { GuestClientLookupStatus } from "@/components/send-money/guest-client-lookup-notice";
import { type RecentTransaction } from "@/components/send-money/recent-transactions";
import { PaymentMethodPanel } from "@/components/send-money/shared/payment-method-panel";
import type {
  Beneficiary,
  Customer,
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
import type { BeneficiaryFormChangeHandler } from "@/components/send-money/providers/wu/beneficiary-step";
import type { RemitterFormChangeHandler } from "@/components/send-money/providers/wu/remitter-step";
import {
  beneficiaryToRegistrationDraft,
  createEmptyBeneficiaryDraft,
  ensureBeneficiariesSeeded,
  listBeneficiariesByCustomer,
  registerBeneficiary,
  type BeneficiaryRegistrationDraft,
} from "@/lib/simulated-api/beneficiaries-api";
import {
  createEmptyCustomerDraft,
  customerToRegistrationDraft,
  ensureCustomersSeeded,
  findCustomerByDocument,
  registerCustomer,
  type CustomerRegistrationDraft,
} from "@/lib/simulated-api/customers-api";
import { readAllCustomers } from "@/lib/simulated-api/customers-store";
import {
  createCompletedTransaction,
  ensureTransactionsSeeded,
  listTransactionsByCustomer,
  type StoredTransaction,
} from "@/lib/simulated-api/transactions-api";
import { ArrowLeftIcon, ArrowRightIcon, SendIcon } from "lucide-react";

const PEP_CHECK_LABEL = "¿Es una Persona Expuesta Políticamente (PEP)?";

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
const BOB_PER_USD = 11.56;
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
  const [activeSteps, setActiveSteps] = useState<string[]>(() =>
    buildQuoteLoadingSteps(false),
  );
  const [documentType, setDocumentType] = useState("Cédula");
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
  const [terraPayCbu, setTerraPayCbu] = useState("");
  const [terraPayWallet, setTerraPayWallet] = useState("");
  const [terraPayAlias, setTerraPayAlias] = useState("");
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
    setTerraPayCbu("");
    setTerraPayWallet("");
    setTerraPayAlias("");
  };

  let quoteDeliveryExtrasComplete = true;
  if (showTerraPayBank) {
    quoteDeliveryExtrasComplete =
      terraPayBank.trim() !== "" && terraPayCbu.length === 22;
  } else if (showTerraPayWallet) {
    quoteDeliveryExtrasComplete =
      terraPayWallet.trim() !== "" && terraPayAlias.trim() !== "";
  }

  const quoteBasicsComplete =
    destinationCountry.trim() !== "" &&
    deliveryType !== "" &&
    sendAmount.trim() !== "" &&
    !amountExceedsBalance;

  const canContinueFromQuote =
    quoteBasicsComplete &&
    selectedProvider !== null &&
    quoteDeliveryExtrasComplete;
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [repeatProvider, setRepeatProvider] = useState<ProviderId | null>(null);
  // Sticky for the whole "Repetir envío" path: field edits must not add steps.
  const isRepeatFlowRef = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState("Pago en efectivo");
  const [primaryCurrency, setPrimaryCurrency] =
    useState<PaymentCurrency>("USD");
  const [extraPayments, setExtraPayments] = useState<PaymentLine[]>([]);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [editRemitterOpen, setEditRemitterOpen] = useState(false);
  const [editBeneficiaryOpen, setEditBeneficiaryOpen] = useState(false);
  const [editPaymentOpen, setEditPaymentOpen] = useState(false);
  const remitterEditSnapshotRef = useRef<{
    form: CustomerRegistrationDraft;
    documentNumber: string;
  } | null>(null);
  const beneficiaryEditSnapshotRef =
    useRef<BeneficiaryRegistrationDraft | null>(null);
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
    setActiveSteps(buildQuoteLoadingSteps(isRepeatFlowRef.current));
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
    const skipParties = isRepeatFlowRef.current;
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
      setActiveSteps(buildQuoteLoadingSteps(skipParties));
      setQuoteLoading(false);
      setStep((current) => Math.min(current, 2));
      return;
    }
    setAmountExceedsBalance(false);
    const requestId = ++quoteRequestRef.current;
    setQuoteLoading(true);
    setQuote(null);
    setSelectedProvider(null);
    setQuotesReady(false);
    setActiveSteps(buildQuoteLoadingSteps(skipParties));
    setStep((current) => Math.min(current, 2));
    window.setTimeout(() => {
      if (requestId !== quoteRequestRef.current) return;
      const quotes = buildProviderQuotes(amount, type);
      const cheapest = [...quotes].sort(
        (a, b) => b.amount - b.fee - b.tax - (a.amount - a.fee - a.tax),
      )[0];
      // Al repetir una transacción se mantiene su proveedor.
      const preferredProviderId = override?.provider ?? repeatProvider;
      const preferred =
        quotes.find((item) => item.provider === preferredProviderId) ??
        cheapest;
      setProviderQuotes(quotes);
      setQuotesReady(true);
      setQuoteLoading(false);
      if (preferred) {
        setSelectedProvider(preferred.provider);
        setQuote(preferred);
        setActiveSteps(
          buildActiveSteps(preferred.provider, {
            skipParties,
          }),
        );
      }
      window.requestAnimationFrame(() => nextButtonRef.current?.focus());
    }, 900);
  };
  const selectProviderQuote = (providerQuote: ProviderQuote) => {
    const skipParties = isRepeatFlowRef.current;
    const providerChanged =
      selectedProvider !== null && selectedProvider !== providerQuote.provider;
    setSelectedProvider(providerQuote.provider);
    setQuote(providerQuote);
    setActiveSteps(
      buildActiveSteps(providerQuote.provider, {
        skipParties,
      }),
    );
    if (skipParties) {
      setRepeatProvider(providerQuote.provider);
    }
    if (providerChanged && !skipParties) {
      setSelectedBeneficiary(-1);
      setGuestBeneficiaryChosen(false);
      setRegisterBeneficiaryError("");
      setBeneficiaryForm((current) => {
        const emptyDraft = createEmptyBeneficiaryDraft(current.customerId);
        setOriginalBeneficiaryForm(emptyDraft);
        return emptyDraft;
      });
    }
    window.requestAnimationFrame(() => nextButtonRef.current?.focus());
  };
  const resetQuoteSelection = () => {
    setSelectedTransactionId(null);
    quoteRequestRef.current += 1;
    setQuote(null);
    setQuotesReady(false);
    setSelectedProvider(null);
    setActiveSteps(buildQuoteLoadingSteps(isRepeatFlowRef.current));
    setStep((current) => Math.min(current, 2));
    setQuoteLoading(false);
  };
  const [result, setResult] = useState<ClientSearchResult>(null);
  const [isGuestFlow, setIsGuestFlow] = useState(false);
  const [guestLookupStatus, setGuestLookupStatus] =
    useState<GuestClientLookupStatus>("idle");
  const [guestFoundCustomer, setGuestFoundCustomer] = useState<Customer | null>(
    null,
  );
  const [guestAutofillCustomer, setGuestAutofillCustomer] =
    useState<Customer | null>(null);
  const [guestBeneficiaryChosen, setGuestBeneficiaryChosen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isRegisteringClient, setIsRegisteringClient] = useState(false);
  const [registerClientError, setRegisterClientError] = useState("");
  const [remitterForm, setRemitterForm] = useState<CustomerRegistrationDraft>(
    () => createEmptyCustomerDraft("", "Cédula"),
  );
  const [originalRemitterForm, setOriginalRemitterForm] =
    useState<CustomerRegistrationDraft | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiaryForm, setBeneficiaryForm] =
    useState<BeneficiaryRegistrationDraft>(() => createEmptyBeneficiaryDraft());
  const [originalBeneficiaryForm, setOriginalBeneficiaryForm] =
    useState<BeneficiaryRegistrationDraft | null>(null);
  const [isRegisteringBeneficiary, setIsRegisteringBeneficiary] =
    useState(false);
  const [registerBeneficiaryError, setRegisterBeneficiaryError] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(-1);
  const [recentTransactions, setRecentTransactions] = useState<
    StoredTransaction[]
  >([]);
  const guestLookupTimeoutRef = useRef<number | null>(null);
  const guestLookupRequestRef = useRef(0);
  const remitterFormSyncedCustomerIdRef = useRef<string | null>(null);
  const beneficiariesLoadedForCustomerIdRef = useRef<string | null>(null);
  const transactionsLoadedForCustomerIdRef = useRef<string | null>(null);
  const isGuestFlowRef = useRef(isGuestFlow);
  isGuestFlowRef.current = isGuestFlow;

  useEffect(() => {
    void ensureCustomersSeeded()
      .then(() => readAllCustomers())
      .then((items) => setCustomers(items));
    void ensureBeneficiariesSeeded();
    void ensureTransactionsSeeded();
  }, []);

  const foundByDocument = customers.find((item) =>
    item.documentNumbers.includes(documentNumber.trim()),
  );
  const matchedCustomer =
    foundByDocument === undefined ? null : foundByDocument;
  let customer: Customer | null = null;
  if (result === "success") {
    customer = matchedCustomer;
  } else if (isGuestFlow) {
    customer = guestAutofillCustomer;
  }

  useEffect(() => {
    if (result !== "success") return;
    if (matchedCustomer !== null) return;
    void findCustomerByDocument(documentNumber).then((found) => {
      if (found === null) return;
      setCustomers((current) => {
        const exists = current.some((item) => item.id === found.id);
        if (exists) return current;
        return [...current, found];
      });
    });
  }, [result, documentNumber, matchedCustomer]);

  useEffect(() => {
    if (customer === null) {
      remitterFormSyncedCustomerIdRef.current = null;
      setOriginalRemitterForm(null);
      if (!isGuestFlowRef.current) {
        setRemitterForm(
          createEmptyCustomerDraft(documentNumber.trim(), documentType),
        );
      }
      return;
    }
    if (remitterFormSyncedCustomerIdRef.current === customer.id) return;
    remitterFormSyncedCustomerIdRef.current = customer.id;
    const draft = customerToRegistrationDraft(customer);
    draft.documentNumber = documentNumber.trim();
    setDocumentType(draft.documentType);
    setRemitterForm(draft);
    setOriginalRemitterForm(draft);
  }, [customer, documentNumber, documentType]);

  useEffect(() => {
    if (customer === null) {
      beneficiariesLoadedForCustomerIdRef.current = null;
      transactionsLoadedForCustomerIdRef.current = null;
      setBeneficiaries([]);
      setSelectedBeneficiary(-1);
      setBeneficiaryForm(createEmptyBeneficiaryDraft());
      setOriginalBeneficiaryForm(null);
      setRecentTransactions([]);
      return;
    }
    const customerId = customer.id;
    if (beneficiariesLoadedForCustomerIdRef.current !== customerId) {
      beneficiariesLoadedForCustomerIdRef.current = customerId;
      void listBeneficiariesByCustomer(customerId).then((items) => {
        if (beneficiariesLoadedForCustomerIdRef.current !== customerId) return;
        setBeneficiaries(items);
        const emptyDraft = createEmptyBeneficiaryDraft(customerId);
        setSelectedBeneficiary(-1);
        setBeneficiaryForm(emptyDraft);
        setOriginalBeneficiaryForm(emptyDraft);
        setGuestBeneficiaryChosen(false);
      });
    }
    if (transactionsLoadedForCustomerIdRef.current !== customerId) {
      transactionsLoadedForCustomerIdRef.current = customerId;
      void listTransactionsByCustomer(customerId).then((items) => {
        if (transactionsLoadedForCustomerIdRef.current !== customerId) return;
        setRecentTransactions(items);
      });
    }
  }, [customer]);

  const isKnownClient =
    result === "success" || (isGuestFlow && guestAutofillCustomer !== null);
  const fillBeneficiaryFields =
    result === "success" || (isGuestFlow && guestBeneficiaryChosen);
  const known = (value?: string) => {
    if (!fillBeneficiaryFields) return undefined;
    return value;
  };
  const senderName = customer === null ? "" : customer.fullName;
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
  const totalToCharge = quote ? quote.amount : 0;
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
    getStepKey(selectedProvider, step, activeSteps) === "review";
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
  const [completedOperationNumber, setCompletedOperationNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const processingTimeoutRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(processingTimeoutRef.current), []);
  const [additionalChecks, setAdditionalChecks] = useState<
    Record<string, boolean>
  >({ "¿Es una Persona Expuesta Políticamente (PEP)?": true });
  const currentRemitterIsPep = Boolean(additionalChecks[PEP_CHECK_LABEL]);
  let isRemitterFormDirty = false;
  if (originalRemitterForm !== null) {
    const currentSnapshot = JSON.stringify({
      ...remitterForm,
      documentNumber: documentNumber.trim(),
      isPep: currentRemitterIsPep,
    });
    const originalSnapshot = JSON.stringify({
      ...originalRemitterForm,
      documentNumber: originalRemitterForm.documentNumber.trim(),
      isPep: originalRemitterForm.isPep,
    });
    isRemitterFormDirty = currentSnapshot !== originalSnapshot;
  }
  const isUpdatingExistingClient =
    customer !== null ||
    customers.some(
      (item) =>
        item.documentType === remitterForm.documentType.trim() &&
        item.documentNumbers.includes(documentNumber.trim()),
    );
  const showSaveClientButton =
    isGuestFlow || customer === null || isRemitterFormDirty;
  let isBeneficiaryFormDirty = false;
  if (originalBeneficiaryForm !== null) {
    isBeneficiaryFormDirty =
      JSON.stringify(beneficiaryForm) !==
      JSON.stringify(originalBeneficiaryForm);
  }
  const isUpdatingExistingBeneficiary = beneficiaryForm.id.trim() !== "";
  const showSaveBeneficiaryButton = customer !== null && isBeneficiaryFormDirty;
  const showFrequentBeneficiaries = customer !== null;
  let carouselSelectedBeneficiary = selectedBeneficiary;
  if (selectedBeneficiary < 0 || (isGuestFlow && !guestBeneficiaryChosen)) {
    carouselSelectedBeneficiary = -1;
  }
  const beneficiary =
    selectedBeneficiary >= 0 ? beneficiaries[selectedBeneficiary] : undefined;

  // Autocompleta cotización, beneficiario y pago a partir de una transacción
  // previa; los datos del remitente y PEP ya vienen del cliente encontrado.
  function repeatTransaction(transaction: RecentTransaction) {
    optionsRequestRef.current += 1;
    setPartnerLoading(false);
    setLocationLoading(false);
    isRepeatFlowRef.current = true;
    setDestinationCountry(transaction.destinationCountry);
    setDeliveryType(transaction.deliveryType);
    let nextPayingPartner = "";
    if (transaction.payingPartner !== undefined) {
      nextPayingPartner = transaction.payingPartner;
    }
    setPayingPartner(nextPayingPartner);
    let nextLocation = "";
    if (transaction.location !== undefined) {
      nextLocation = transaction.location;
    }
    setLocation(nextLocation);
    setWuService(transaction.wuService);
    let nextMoneygramCompany = "";
    if (transaction.moneygramCompany !== undefined) {
      nextMoneygramCompany = transaction.moneygramCompany;
    }
    setMoneygramCompany(nextMoneygramCompany);
    let nextBank = "";
    if (transaction.terraPayBank !== undefined) {
      nextBank = transaction.terraPayBank;
    }
    setTerraPayBank(nextBank);
    let nextCbu = "";
    if (transaction.terraPayCbu !== undefined) {
      nextCbu = transaction.terraPayCbu;
    }
    setTerraPayCbu(nextCbu);
    let nextWallet = "";
    if (transaction.terraPayWallet !== undefined) {
      nextWallet = transaction.terraPayWallet;
    }
    setTerraPayWallet(nextWallet);
    let nextAlias = "";
    if (transaction.terraPayAlias !== undefined) {
      nextAlias = transaction.terraPayAlias;
    }
    setTerraPayAlias(nextAlias);
    setSendAmount(usdFormatter.format(transaction.amount));
    let nextBeneficiaryIndex = transaction.beneficiaryIndex;
    if (transaction.beneficiaryId !== undefined) {
      for (let index = 0; index < beneficiaries.length; index += 1) {
        if (beneficiaries[index].id === transaction.beneficiaryId) {
          nextBeneficiaryIndex = index;
          break;
        }
      }
    }
    if (
      nextBeneficiaryIndex >= 0 &&
      beneficiaries[nextBeneficiaryIndex] !== undefined
    ) {
      const selected = beneficiaries[nextBeneficiaryIndex];
      setSelectedBeneficiary(nextBeneficiaryIndex);
      const draft = beneficiaryToRegistrationDraft(selected);
      setBeneficiaryForm(draft);
      setOriginalBeneficiaryForm(draft);
      setGuestBeneficiaryChosen(true);
    } else {
      setSelectedBeneficiary(nextBeneficiaryIndex);
    }
    setPaymentMethod(transaction.paymentMethod);
    setPrimaryCurrency("USD");
    setExtraPayments([]);
    setRepeatProvider(transaction.provider);
    requestQuote({
      amount: transaction.amount,
      deliveryType: transaction.deliveryType,
      provider: transaction.provider,
    });
    setSelectedTransactionId(transaction.id);
  }

  function clearRepeatedTransaction() {
    optionsRequestRef.current += 1;
    setPartnerLoading(false);
    setLocationLoading(false);
    isRepeatFlowRef.current = false;
    setRepeatProvider(null);
    setDestinationCountry("");
    setDeliveryType("");
    clearDeliveryExtras();
    clearAmount();
    setSelectedBeneficiary(-1);
    setGuestBeneficiaryChosen(false);
    if (customer !== null) {
      const emptyDraft = createEmptyBeneficiaryDraft(customer.id);
      setBeneficiaryForm(emptyDraft);
      setOriginalBeneficiaryForm(emptyDraft);
    } else {
      setBeneficiaryForm(createEmptyBeneficiaryDraft());
      setOriginalBeneficiaryForm(null);
    }
    setPaymentMethod("Pago en efectivo");
    setPrimaryCurrency("USD");
    setExtraPayments([]);
    setStep(1);
  }

  useEffect(() => {
    if (isGuestFlow) {
      if (guestAutofillCustomer !== null && guestAutofillCustomer.isPep) {
        setAdditionalChecks({
          [PEP_CHECK_LABEL]: true,
        });
        return;
      }
      setAdditionalChecks({});
      return;
    }
    if (result === "success" || result === "empty") {
      setAdditionalChecks(
        result === "success" && customer !== null && customer.isPep
          ? { [PEP_CHECK_LABEL]: true }
          : {},
      );
    }
  }, [result, customer, isGuestFlow, guestAutofillCustomer]);

  function clearGuestLookupTimeout() {
    if (guestLookupTimeoutRef.current === null) return;
    window.clearTimeout(guestLookupTimeoutRef.current);
    guestLookupTimeoutRef.current = null;
  }

  function startGuestQuote() {
    clearGuestLookupTimeout();
    setIsGuestFlow(true);
    setResult(null);
    setDocumentNumber("");
    setAdditionalChecks({});
    setSelectedBeneficiary(-1);
    setSelectedTransactionId(null);
    setGuestLookupStatus("idle");
    setGuestFoundCustomer(null);
    setGuestAutofillCustomer(null);
    setGuestBeneficiaryChosen(false);
    remitterFormSyncedCustomerIdRef.current = null;
    beneficiariesLoadedForCustomerIdRef.current = null;
    transactionsLoadedForCustomerIdRef.current = null;
    setRemitterForm(createEmptyCustomerDraft("", documentType));
    setOriginalRemitterForm(null);
    setBeneficiaries([]);
    setBeneficiaryForm(createEmptyBeneficiaryDraft());
    setOriginalBeneficiaryForm(null);
    setRecentTransactions([]);
    setRegisterClientError("");
    setRegisterBeneficiaryError("");
    setStep(2);
  }

  function handleGuestDocumentNumberChange(value: string) {
    const hadAutofill = guestAutofillCustomer !== null;
    setDocumentNumber(value);
    setGuestAutofillCustomer(null);
    setGuestFoundCustomer(null);
    setGuestBeneficiaryChosen(false);
    setSelectedBeneficiary(-1);
    remitterFormSyncedCustomerIdRef.current = null;
    if (hadAutofill) {
      setRemitterForm(createEmptyCustomerDraft(value, documentType));
      setOriginalRemitterForm(null);
    } else {
      setRemitterForm((current) => ({ ...current, documentNumber: value }));
    }
    setRegisterClientError("");
    clearGuestLookupTimeout();
    const trimmed = value.trim();
    if (trimmed === "") {
      setGuestLookupStatus("idle");
      return;
    }
    const requestId = ++guestLookupRequestRef.current;
    setGuestLookupStatus("loading");
    guestLookupTimeoutRef.current = window.setTimeout(() => {
      void findCustomerByDocument(trimmed).then((found) => {
        if (requestId !== guestLookupRequestRef.current) return;
        if (found === null || found.status === "blocked") {
          setGuestFoundCustomer(null);
          setGuestLookupStatus("not_found");
          return;
        }
        setGuestFoundCustomer(found);
        setGuestLookupStatus("found");
      });
    }, 350);
  }

  function acceptGuestAutofill() {
    if (guestFoundCustomer === null) return;
    remitterFormSyncedCustomerIdRef.current = null;
    setGuestAutofillCustomer(guestFoundCustomer);
    setGuestBeneficiaryChosen(false);
    setSelectedBeneficiary(-1);
    setGuestLookupStatus("autofilled");
    setRegisterClientError("");
  }

  function declineGuestAutofill() {
    setGuestAutofillCustomer(null);
    setGuestBeneficiaryChosen(false);
    setAdditionalChecks({});
    remitterFormSyncedCustomerIdRef.current = null;
    setRemitterForm(createEmptyCustomerDraft(documentNumber, documentType));
    setOriginalRemitterForm(null);
    setGuestLookupStatus("declined");
    setRegisterClientError("");
  }

  function selectBeneficiary(index: number) {
    if (selectedBeneficiary === index) {
      setSelectedBeneficiary(-1);
      setGuestBeneficiaryChosen(false);
      if (customer !== null) {
        const emptyDraft = createEmptyBeneficiaryDraft(customer.id);
        setBeneficiaryForm(emptyDraft);
        setOriginalBeneficiaryForm(emptyDraft);
      } else {
        setBeneficiaryForm(createEmptyBeneficiaryDraft());
        setOriginalBeneficiaryForm(null);
      }
      setRegisterBeneficiaryError("");
      return;
    }
    setSelectedBeneficiary(index);
    if (isGuestFlow) {
      setGuestBeneficiaryChosen(true);
    }
    const selected = beneficiaries[index];
    if (selected === undefined) return;
    const draft = beneficiaryToRegistrationDraft(selected);
    setBeneficiaryForm(draft);
    setOriginalBeneficiaryForm(draft);
    setRegisterBeneficiaryError("");
  }

  function createBeneficiary() {
    if (customer === null) return;
    const emptyDraft = createEmptyBeneficiaryDraft(customer.id);
    setSelectedBeneficiary(-1);
    setBeneficiaryForm(emptyDraft);
    setOriginalBeneficiaryForm(emptyDraft);
    setGuestBeneficiaryChosen(true);
    setRegisterBeneficiaryError("");
  }

  const handleRemitterFormChange: RemitterFormChangeHandler = (
    field,
    value,
  ) => {
    if (field === "documentType") {
      setDocumentType(value);
    }
    setRemitterForm((current) => ({ ...current, [field]: value }));
    setRegisterClientError("");
  };

  const handleBeneficiaryFormChange: BeneficiaryFormChangeHandler = (
    field,
    value,
  ) => {
    setBeneficiaryForm((current) => ({ ...current, [field]: value }));
    setRegisterBeneficiaryError("");
  };

  function validateRequiredFields(rootSelector: string): boolean {
    const root = document.querySelector(rootSelector);
    if (root === null) return false;

    flushSync(() => {
      root.dispatchEvent(new Event("party-form-validate", { bubbles: true }));
    });

    const fields = Array.from(
      root.querySelectorAll<HTMLElement>(
        [
          "input[required]:not([disabled]):not([readonly]):not([type=hidden]):not([type=checkbox]):not([type=radio])",
          "select[required]:not([disabled])",
          "textarea[required]:not([disabled]):not([readonly])",
          'button[aria-haspopup="listbox"][aria-required="true"]:not([disabled])',
        ].join(", "),
      ),
    );

    let firstInvalid: HTMLElement | null = null;
    for (const field of fields) {
      let isInvalid = false;
      if (field instanceof HTMLButtonElement) {
        const ariaLabel = field.getAttribute("aria-label");
        if (ariaLabel !== null && ariaLabel.includes("sin seleccionar")) {
          isInvalid = true;
        } else if (
          field.textContent !== null &&
          field.textContent.includes("Selecciona")
        ) {
          isInvalid = true;
        }
      } else if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      ) {
        const trimmed = field.value.trim();
        if (trimmed === "") {
          isInvalid = true;
        } else if (
          field instanceof HTMLInputElement &&
          field.type === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ) {
          isInvalid = true;
        }
      }

      if (isInvalid && firstInvalid === null) {
        firstInvalid = field;
      }
    }

    if (firstInvalid === null) return true;
    firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
    window.requestAnimationFrame(() => {
      firstInvalid.focus();
    });
    return false;
  }

  function validatePartiesStep(): boolean {
    if (!validateRequiredFields("[data-remitter-form]")) return false;
    if (!validateRequiredFields("[data-beneficiary-form]")) return false;
    if (customer === null) {
      setRegisterClientError("Registrá el cliente para continuar.");
      return false;
    }
    return true;
  }

  function saveBeneficiary() {
    if (customer === null) return;
    if (isRegisteringBeneficiary) return;
    if (!validateRequiredFields("[data-beneficiary-form]")) return;
    setRegisterBeneficiaryError("");
    const draft: BeneficiaryRegistrationDraft = {
      ...beneficiaryForm,
      customerId: customer.id,
    };
    setIsRegisteringBeneficiary(true);
    void registerBeneficiary(draft)
      .then(async (result) => {
        const items = await listBeneficiariesByCustomer(customer.id);
        setBeneficiaries(items);
        const savedDraft = beneficiaryToRegistrationDraft(result.beneficiary);
        setBeneficiaryForm(savedDraft);
        setOriginalBeneficiaryForm(savedDraft);
        let nextIndex = 0;
        for (let index = 0; index < items.length; index += 1) {
          if (items[index].id === result.beneficiary.id) {
            nextIndex = index;
            break;
          }
        }
        setSelectedBeneficiary(nextIndex);
        setGuestBeneficiaryChosen(true);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setRegisterBeneficiaryError(error.message);
          return;
        }
        setRegisterBeneficiaryError("No se pudo guardar el beneficiario.");
      })
      .finally(() => {
        setIsRegisteringBeneficiary(false);
      });
  }

  function registerClient() {
    if (isRegisteringClient) return;
    if (!validateRequiredFields("[data-remitter-form]")) return;
    clearGuestLookupTimeout();
    setRegisterClientError("");

    const draft: CustomerRegistrationDraft = {
      ...remitterForm,
      documentNumber: documentNumber.trim(),
      isPep: Boolean(additionalChecks[PEP_CHECK_LABEL]),
    };

    setIsRegisteringClient(true);
    void registerCustomer(draft)
      .then(async (result) => {
        const items = await readAllCustomers();
        setCustomers(items);
        const savedDraft = customerToRegistrationDraft(result.customer);
        remitterFormSyncedCustomerIdRef.current = result.customer.id;
        setRemitterForm(savedDraft);
        setOriginalRemitterForm(savedDraft);
        setGuestAutofillCustomer(result.customer);
        setResult("success");
        setIsGuestFlow(false);
        setGuestLookupStatus("autofilled");
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setRegisterClientError(error.message);
          return;
        }
        setRegisterClientError("No se pudo registrar el cliente.");
      })
      .finally(() => {
        setIsRegisteringClient(false);
      });
  }

  useEffect(() => {
    return () => clearGuestLookupTimeout();
  }, []);

  useEffect(() => {
    if (
      selectedProvider &&
      step >= 3 &&
      getStepKey(selectedProvider, step, activeSteps) === "parties"
    ) {
      window.requestAnimationFrame(() => {
        const fields = Array.from(
          document.querySelectorAll<HTMLElement>(
            [
              "[data-enter-advance] input[required]:not([disabled]):not([readonly]):not([type=hidden]):not([type=checkbox]):not([type=radio])",
              "[data-enter-advance] select[required]:not([disabled])",
              "[data-enter-advance] textarea[required]:not([disabled]):not([readonly])",
              '[data-enter-advance] button[aria-haspopup="listbox"]:not([disabled])',
            ].join(", "),
          ),
        );
        const firstEmptyRequired = fields.find((field) => {
          if (field instanceof HTMLButtonElement) {
            const ariaLabel = field.getAttribute("aria-label");
            if (ariaLabel !== null && ariaLabel.includes("sin seleccionar")) {
              return true;
            }
            return (
              field.textContent !== null &&
              field.textContent.includes("Selecciona")
            );
          }
          if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLSelectElement ||
            field instanceof HTMLTextAreaElement
          ) {
            return field.value.trim() === "";
          }
          return false;
        });
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
  }, [step, isReviewStep, selectedProvider, activeSteps]);

  function next() {
    if (step === 2 && !canContinueFromQuote) return;
    if (
      activeSteps[step - 1] === PARTIES_STEP_LABEL &&
      !validatePartiesStep()
    ) {
      return;
    }
    setStep((current) => Math.min(lastStep, current + 1));
  }
  function back() {
    setStep((current) => Math.max(1, current - 1));
  }
  function goToStep(target: number) {
    if (target < 1 || target > lastStep) return;
    if (target > 2 && !canContinueFromQuote) return;
    if (
      target > step &&
      activeSteps[step - 1] === PARTIES_STEP_LABEL &&
      !validatePartiesStep()
    ) {
      return;
    }
    setStep(target);
  }
  function handleContinue() {
    if (!isReviewStep) return next();
    if (processing) return;
    if (customer === null) return;
    if (selectedProvider === null) return;
    if (deliveryType === "") return;
    if (quote === null) return;

    setProcessing(true);

    void (async () => {
      let beneficiaryId = beneficiaryForm.id.trim();
      let beneficiaryIndex = selectedBeneficiary;
      if (beneficiaryId === "" || originalBeneficiaryForm === null) {
        const savedBeneficiary = await registerBeneficiary({
          ...beneficiaryForm,
          customerId: customer.id,
        });
        beneficiaryId = savedBeneficiary.beneficiary.id;
        const items = await listBeneficiariesByCustomer(customer.id);
        setBeneficiaries(items);
        const savedDraft = beneficiaryToRegistrationDraft(
          savedBeneficiary.beneficiary,
        );
        setBeneficiaryForm(savedDraft);
        setOriginalBeneficiaryForm(savedDraft);
        beneficiaryIndex = 0;
        for (let index = 0; index < items.length; index += 1) {
          if (items[index].id === beneficiaryId) {
            beneficiaryIndex = index;
            break;
          }
        }
        setSelectedBeneficiary(beneficiaryIndex);
      } else if (
        JSON.stringify(beneficiaryForm) !==
        JSON.stringify(originalBeneficiaryForm)
      ) {
        const savedBeneficiary = await registerBeneficiary({
          ...beneficiaryForm,
          customerId: customer.id,
        });
        beneficiaryId = savedBeneficiary.beneficiary.id;
        const items = await listBeneficiariesByCustomer(customer.id);
        setBeneficiaries(items);
        const savedDraft = beneficiaryToRegistrationDraft(
          savedBeneficiary.beneficiary,
        );
        setBeneficiaryForm(savedDraft);
        setOriginalBeneficiaryForm(savedDraft);
        beneficiaryIndex = 0;
        for (let index = 0; index < items.length; index += 1) {
          if (items[index].id === beneficiaryId) {
            beneficiaryIndex = index;
            break;
          }
        }
        setSelectedBeneficiary(beneficiaryIndex);
      }

      const savedTransaction = await createCompletedTransaction({
        customerId: customer.id,
        beneficiaryId,
        beneficiaryIndex,
        provider: selectedProvider,
        destinationCountry,
        deliveryType,
        wuService,
        moneygramCompany,
        payingPartner,
        location,
        terraPayBank,
        terraPayCbu,
        terraPayWallet,
        terraPayAlias,
        amount: quote.amount,
        paymentMethod,
        service: deliveryTypeLabel(deliveryType),
      });

      const history = await listTransactionsByCustomer(customer.id);
      setRecentTransactions(history);
      transactionsLoadedForCustomerIdRef.current = customer.id;
      setSelectedTransactionId(savedTransaction.id);
      setCompletedOperationNumber(savedTransaction.id);

      processingTimeoutRef.current = window.setTimeout(() => {
        setProcessing(false);
        setSent(true);
      }, 1200);
    })().catch(() => {
      setProcessing(false);
    });
  }
  function startAnotherQuote() {
    isRepeatFlowRef.current = false;
    setRepeatProvider(null);
    clearAmount();
    setPaymentMethod("Pago en efectivo");
    setPrimaryCurrency("USD");
    setExtraPayments([]);
    window.clearTimeout(processingTimeoutRef.current);
    setProcessing(false);
    setSent(false);
    setCompletedOperationNumber("");
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

  const isPartiesStep = activeSteps[step - 1] === PARTIES_STEP_LABEL;

  const summaryAside = (
    <aside className="sticky top-0 flex flex-col gap-3 self-start">
      {!isPartiesStep && (
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl border border-border border-l-4 border-l-party-sender-border bg-card p-3 shadow-sm">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-party-sender-fg">
              Remitente
            </p>
            <p className="mt-1.5 text-sm font-bold text-foreground">
              {customer === null ? "Nuevo cliente" : customer.fullName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cédula: {documentNumber}
              {customer !== null && ` · ${customer.emailMasked}`}
            </p>
            {customer !== null && customer.isPep && (
              <p className="mt-1 text-sm font-semibold text-party-sender-fg">
                PEP: Sí
              </p>
            )}
          </div>
          {isKnownClient &&
            beneficiary !== undefined &&
            selectedProvider !== "MONEYGRAM" && (
              <div className="w-1/2 rounded-xl border border-border border-l-4 border-l-party-beneficiary-border bg-card p-3 shadow-sm">
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-party-beneficiary-fg">
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
            )}
        </div>
      )}
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
            current.map((item) => (item.id === id ? { ...line, id } : item)),
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
  );

  return (
    <>
      <section
        className={`relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-[14px] text-foreground ${processing || sent || (step !== 2 && step !== 3) ? "bg-card shadow-[0_12px_35px_rgba(24,37,73,0.06)] dark:shadow-none" : ""}`}
      >
        {processing ? (
          <RemittanceProcessing
            amountReceived={formatUsd(
              quote ? quote.amount - quote.fee - quote.tax : 0,
            )}
          />
        ) : sent ? (
          <RemittanceSuccess
            operationNumber={completedOperationNumber}
            amountReceived={formatUsd(
              quote ? quote.amount - quote.fee - quote.tax : 0,
            )}
            onNewTransaction={onReset}
            onRepeatClient={startAnotherQuote}
            onSameBeneficiary={startAnotherQuote}
          />
        ) : (
          <>
            <Stepper
              steps={activeSteps}
              currentStep={step}
              onStepClick={goToStep}
              showProgress={step > 1}
              ariaLabel="Progreso de la transacción"
            >
              <Stepper.Step index={1}>
                <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto">
                  <div
                    className="mx-auto w-full min-w-0 max-w-[1120px] px-4 sm:px-6"
                    data-form-fields
                  >
                    <IdentifySenderStep
                      documentType={documentType}
                      onDocumentTypeChange={(value) => {
                        setDocumentType(value);
                        setRemitterForm((current) => ({
                          ...current,
                          documentType: value,
                        }));
                      }}
                      documentNumber={documentNumber}
                      onDocumentNumberChange={setDocumentNumber}
                      result={result}
                      onResultChange={(nextResult) => {
                        setIsGuestFlow(false);
                        setResult(nextResult);
                      }}
                      onContinue={() => {
                        if (result === "empty") {
                          setIsGuestFlow(true);
                        }
                        next();
                      }}
                      onGuestContinue={startGuestQuote}
                      continueRef={continueRef}
                      customer={customer}
                      recentTransactions={recentTransactions}
                      beneficiaries={beneficiaries}
                      selectedTransactionId={selectedTransactionId}
                      quoteLoading={quoteLoading}
                      formatUsd={formatUsd}
                      onRepeatTransaction={(transaction) => {
                        setIsGuestFlow(false);
                        repeatTransaction(transaction);
                        setStep(2);
                      }}
                      onClearRepeatedTransaction={clearRepeatedTransaction}
                    />
                  </div>
                </div>
              </Stepper.Step>
              <Stepper.Step index={2}>
                <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(10rem,34rem)]">
                  <div className="min-w-0" data-form-fields>
                    <QuoteStep
                      quoteLoading={quoteLoading}
                      formatUsd={formatUsd}
                      destinationCountry={destinationCountry}
                      onDestinationCountryChange={setDestinationCountry}
                      deliveryType={deliveryType}
                      onDeliveryTypeChange={(value) => {
                        setDeliveryType(value);
                        setSelectedTransactionId(null);
                        quoteRequestRef.current += 1;
                        setQuote(null);
                        setProviderQuotes([]);
                        setQuotesReady(false);
                        setSelectedProvider(null);
                        setActiveSteps(
                          buildQuoteLoadingSteps(isRepeatFlowRef.current),
                        );
                        setQuoteLoading(false);
                        setStep((current) => Math.min(current, 2));
                      }}
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
                      terraPayCbu={terraPayCbu}
                      onTerraPayCbuChange={setTerraPayCbu}
                      terraPayWallet={terraPayWallet}
                      onTerraPayWalletChange={setTerraPayWallet}
                      terraPayAlias={terraPayAlias}
                      onTerraPayAliasChange={setTerraPayAlias}
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
                  </div>
                  {summaryAside}
                </div>
              </Stepper.Step>
              {activeSteps.slice(2).map((stepLabel, offset) => {
                const stepIndex = offset + 3;
                const stepIsReview = stepIndex === lastStep;
                const stepIsParties =
                  selectedProvider !== null &&
                  getStepKey(selectedProvider, stepIndex, activeSteps) ===
                    "parties";
                return (
                  <Stepper.Step key={stepLabel} index={stepIndex}>
                    <div
                      className={`grid min-h-0 flex-1 gap-4 ${stepIsParties || stepIsReview ? "overflow-hidden" : "overflow-y-auto"} ${stepIsReview ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]"}`}
                    >
                      <div
                        className={`min-w-0 ${stepIsParties || stepIsReview ? "flex h-full min-h-0 flex-col overflow-hidden" : ""} ${stepIsReview ? "mx-auto w-full max-w-[1120px] px-4 sm:px-6" : ""}`}
                        data-form-fields
                        data-enter-advance={stepIsParties ? "" : undefined}
                      >
                        {selectedProvider && quote && (
                          <ProviderFlowStep
                            provider={selectedProvider}
                            step={step}
                            activeSteps={activeSteps}
                            documentNumber={documentNumber}
                            customer={customer}
                            remitterForm={remitterForm}
                            onRemitterFormChange={handleRemitterFormChange}
                            beneficiaryForm={beneficiaryForm}
                            onBeneficiaryFormChange={
                              handleBeneficiaryFormChange
                            }
                            known={known}
                            isKnownClient={isKnownClient}
                            showFrequentBeneficiaries={
                              showFrequentBeneficiaries
                            }
                            fillBeneficiaryFields={fillBeneficiaryFields}
                            beneficiaries={beneficiaries}
                            selectedBeneficiary={carouselSelectedBeneficiary}
                            onSelectBeneficiary={selectBeneficiary}
                            onCreateBeneficiary={createBeneficiary}
                            additionalChecks={additionalChecks}
                            onAdditionalCheckChange={(checkLabel, checked) =>
                              setAdditionalChecks((current) => ({
                                ...current,
                                [checkLabel]: checked,
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
                            onEditRemitter={() => {
                              remitterEditSnapshotRef.current = {
                                form: remitterForm,
                                documentNumber,
                              };
                              setEditRemitterOpen(true);
                            }}
                            onEditBeneficiary={() => {
                              beneficiaryEditSnapshotRef.current =
                                beneficiaryForm;
                              setEditBeneficiaryOpen(true);
                            }}
                            onEditPayment={() => setEditPaymentOpen(true)}
                            formatAmount={formatAmount}
                            isGuestFlow={isGuestFlow}
                            onDocumentNumberChange={
                              handleGuestDocumentNumberChange
                            }
                            onRegisterClient={registerClient}
                            isRegisteringClient={isRegisteringClient}
                            registerClientError={registerClientError}
                            isUpdatingExistingClient={isUpdatingExistingClient}
                            showSaveClientButton={showSaveClientButton}
                            onRegisterBeneficiary={saveBeneficiary}
                            isRegisteringBeneficiary={isRegisteringBeneficiary}
                            registerBeneficiaryError={registerBeneficiaryError}
                            isUpdatingExistingBeneficiary={
                              isUpdatingExistingBeneficiary
                            }
                            showSaveBeneficiaryButton={
                              showSaveBeneficiaryButton
                            }
                            guestLookupStatus={guestLookupStatus}
                            onAcceptGuestAutofill={acceptGuestAutofill}
                            onDeclineGuestAutofill={declineGuestAutofill}
                          />
                        )}
                      </div>
                      {!stepIsReview && summaryAside}
                    </div>
                  </Stepper.Step>
                );
              })}
            </Stepper>

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
            {selectedProvider && (
              <>
                <EditRemitterDialog
                  open={editRemitterOpen}
                  onOpenChange={setEditRemitterOpen}
                  provider={selectedProvider}
                  documentNumber={documentNumber}
                  form={remitterForm}
                  onFormChange={handleRemitterFormChange}
                  onDocumentNumberChange={handleGuestDocumentNumberChange}
                  onSave={() => {
                    if (!validateRequiredFields("[data-remitter-form]")) return;
                    setOriginalRemitterForm({
                      ...remitterForm,
                      documentNumber: documentNumber.trim(),
                      isPep: currentRemitterIsPep,
                    });
                    remitterEditSnapshotRef.current = null;
                    setEditRemitterOpen(false);
                  }}
                  onCancel={() => {
                    const snapshot = remitterEditSnapshotRef.current;
                    if (snapshot !== null) {
                      setRemitterForm(snapshot.form);
                      setDocumentNumber(snapshot.documentNumber);
                      if (snapshot.form.documentType !== "") {
                        setDocumentType(snapshot.form.documentType);
                      }
                    }
                    remitterEditSnapshotRef.current = null;
                    setEditRemitterOpen(false);
                  }}
                />
                <EditBeneficiaryDialog
                  open={editBeneficiaryOpen}
                  onOpenChange={setEditBeneficiaryOpen}
                  provider={selectedProvider}
                  form={beneficiaryForm}
                  onFormChange={handleBeneficiaryFormChange}
                  known={known}
                  fillBeneficiaryFields={fillBeneficiaryFields}
                  onSave={() => {
                    if (!validateRequiredFields("[data-beneficiary-form]"))
                      return;
                    setOriginalBeneficiaryForm(beneficiaryForm);
                    beneficiaryEditSnapshotRef.current = null;
                    setEditBeneficiaryOpen(false);
                  }}
                  onCancel={() => {
                    const snapshot = beneficiaryEditSnapshotRef.current;
                    if (snapshot !== null) {
                      setBeneficiaryForm(snapshot);
                    }
                    beneficiaryEditSnapshotRef.current = null;
                    setEditBeneficiaryOpen(false);
                  }}
                />
                <EditPaymentBillingDialog
                  open={editPaymentOpen}
                  onOpenChange={setEditPaymentOpen}
                  provider={selectedProvider}
                  totalToCharge={totalToCharge}
                  formatUsd={formatUsd}
                  formatAmount={formatAmount}
                  bobPerUsd={BOB_PER_USD}
                  primaryMethod={paymentMethod}
                  onPrimaryMethodChange={setPaymentMethod}
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
                  onAddPayment={(line) =>
                    setExtraPayments((current) => [
                      ...current,
                      { ...line, id: ++paymentIdRef.current },
                    ])
                  }
                  paymentMethodOptions={paymentMethodOptions}
                  sanitizeAmount={sanitizeAmount}
                  parseAmount={parseAmount}
                  toCents={toCents}
                  billingOpen={billingOpen}
                  onBillingOpenToggle={() =>
                    setBillingOpen((current) => !current)
                  }
                  billingName={billingName}
                  billingNit={billingNit}
                  usingSenderBilling={billingOverride === null}
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
                />
              </>
            )}
          </>
        )}
      </section>
      {step > 1 && !processing && !sent && (
        <div
          className={`flex h-[42px] shrink-0 items-center ${isReviewStep ? "mx-auto w-full  px-4 sm:px-6" : ""}`}
        >
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-1 text-sm font-bold text-muted-foreground hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-brand/20"
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
              disabled={step === 2 && !canContinueFromQuote}
              className="flex items-center gap-2 rounded-md bg-brand-strong px-4 py-1 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-amount/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
            >
              {isReviewStep ? "Confirmar y enviar" : "Siguiente"}
              {isReviewStep !== true && <ArrowRightIcon className="size-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PageRemittences;
