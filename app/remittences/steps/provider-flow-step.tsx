"use client";

import type { ReactNode } from "react";
import type { GuestClientLookupStatus } from "@/components/send-money/guest-client-lookup-notice";
import { ProviderStepContent } from "@/components/send-money/provider-step-content";
import type { RemitterFormChangeHandler } from "@/components/send-money/providers/wu/remitter-step";
import type {
  Beneficiary,
  Customer,
  PaymentLine,
  ProviderId,
  ProviderQuote,
} from "@/components/send-money/types";
import { BillingSummary } from "@/components/ui/billing-summary";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";

export type ProviderFlowStepProps = {
  provider: ProviderId;
  step: number;
  activeSteps: readonly string[];
  documentNumber: string;
  customer: Customer | null;
  remitterForm: CustomerRegistrationDraft;
  onRemitterFormChange: RemitterFormChangeHandler;
  known: (value?: string) => string | undefined;
  isKnownClient: boolean;
  showFrequentBeneficiaries: boolean;
  fillBeneficiaryFields: boolean;
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
  onEditRemitter?: () => void;
  onEditBeneficiary?: () => void;
  onEditPayment: () => void;
  formatAmount: (value: number) => string;
  isGuestFlow?: boolean;
  documentFieldsLocked?: boolean;
  onDocumentNumberChange?: (value: string) => void;
  onRegisterClient?: () => void;
  isRegisteringClient?: boolean;
  registerClientError?: string;
  isUpdatingExistingClient?: boolean;
  guestLookupStatus?: GuestClientLookupStatus;
  onAcceptGuestAutofill?: () => void;
  onDeclineGuestAutofill?: () => void;
};

export function ProviderFlowStep({
  billingName,
  billingNit,
  billingOpen,
  billingOverride,
  onBillingOpenToggle,
  onBillingChange,
  onBillingReset,
  ...props
}: ProviderFlowStepProps) {
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
      billingSlot={billingSlot}
    />
  );
}
