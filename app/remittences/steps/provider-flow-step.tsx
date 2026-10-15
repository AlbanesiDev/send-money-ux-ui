"use client";

import type { ReactNode, RefObject } from "react";
import { ProviderStepContent } from "@/components/send-money/provider-step-content";
import type { SelectRenderer } from "@/components/send-money/shared/payment-step";
import type {
  Beneficiary,
  PaymentCurrency,
  PaymentLine,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import { BillingSummary } from "@/components/ui/billing-summary";
import { SearchableSelect } from "@/components/ui/searchable-select";

export type ProviderFlowStepProps = {
  provider: ProviderId;
  step: number;
  documentNumber: string;
  known: (value?: string) => string | undefined;
  isKnownClient: boolean;
  beneficiaries: Beneficiary[];
  selectedBeneficiary: number;
  onSelectBeneficiary: (index: number) => void;
  additionalChecks: Record<string, boolean>;
  onAdditionalCheckChange: (label: string, checked: boolean) => void;
  quote: ProviderQuote;
  totalToCharge: number;
  formatUsd: (value: number) => string;
  destinationCountry: string;
  payingPartner: string;
  location: string;
  wuService: string;
  moneygramCompany: string;
  terraPayBank: string;
  terraPayWallet: string;
  senderName: string;
  paymentLines: PaymentLine[];
  billingName: string;
  billingNit: string;
  billingOpen: boolean;
  billingOverride: { name: string; nit: string } | null;
  onBillingOpenToggle: () => void;
  onBillingChange: (field: "name" | "nit", value: string) => void;
  onBillingReset: () => void;
  onEditQuote: () => void;
  onEditRemitter: () => void;
  onEditBeneficiary: () => void;
  onEditPayment: () => void;
  formatAmount: (value: number) => string;
  bobPerUsd: number;
  primaryMethod: string;
  onPrimaryMethodChange: (value: string) => void;
  primaryMethodRef: RefObject<HTMLButtonElement | null>;
  primaryCurrency: PaymentCurrency;
  onPrimaryCurrencyChange: (value: PaymentCurrency) => void;
  primaryCents: number;
  extraPayments: PaymentLine[];
  onAddPayment: (line: Omit<PaymentLine, "id">) => void;
  onUpdatePayment: (id: number, line: Omit<PaymentLine, "id">) => void;
  onRemovePayment: (id: number) => void;
  paymentMethodOptions: string[];
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
};

export function ProviderFlowStep({
  billingName,
  billingNit,
  billingOpen,
  billingOverride,
  onBillingOpenToggle,
  onBillingChange,
  onBillingReset,
  paymentMethodOptions,
  ...props
}: ProviderFlowStepProps) {
  const renderSelect: SelectRenderer = (selectProps) => (
    <SearchableSelect {...selectProps} />
  );

  const billingSlot: ReactNode = (
    <BillingSummary
      open={billingOpen}
      onToggle={onBillingOpenToggle}
      name={billingName}
      nit={billingNit}
      usingSender={billingOverride === null}
      onChange={onBillingChange}
      onReset={onBillingReset}
    />
  );

  return (
    <ProviderStepContent
      {...props}
      billingName={billingName}
      billingNit={billingNit}
      renderSelect={renderSelect}
      paymentMethodOptions={paymentMethodOptions}
      billingSlot={billingSlot}
    />
  );
}
