import type { ReactNode, RefObject } from "react";
import { RiaAdditionalInfoStep } from "./providers/ria/additional-info-step";
import { RiaBeneficiaryStep } from "./providers/ria/beneficiary-step";
import { RiaRemitterStep } from "./providers/ria/remitter-step";
import { MoneygramBeneficiaryAccountStep } from "./providers/moneygram/beneficiary-account-step";
import { MoneygramRemitterStep } from "./providers/moneygram/remitter-step";
import { TerrapayBeneficiaryStep } from "./providers/terrapay/beneficiary-step";
import { TerrapayRemitterStep } from "./providers/terrapay/remitter-step";
import { WuBeneficiaryStep } from "./providers/wu/beneficiary-step";
import { WuRemitterStep } from "./providers/wu/remitter-step";
import { PepStep } from "./shared/pep-step";
import {
  StandardPaymentStep,
  TerrapayPaymentStep,
  type SelectRenderer,
} from "./shared/payment-step";
import { ReviewStep } from "./shared/review-step";
import { getStepKey } from "./provider-flows";
import type {
  Beneficiary,
  PaymentCurrency,
  PaymentLine,
  ProviderId,
  ProviderQuote,
  ProviderStepKey,
} from "./types";

export type ProviderStepContentProps = {
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
  renderSelect: SelectRenderer;
  paymentMethodOptions: string[];
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  sanitizeAmount: (value: string) => string;
  parseAmount: (value: string) => number;
  toCents: (value: number) => number;
  billingSlot: ReactNode;
};

export function ProviderStepContent(props: ProviderStepContentProps) {
  const stepKey: ProviderStepKey = getStepKey(props.provider, props.step);

  if (stepKey === "remitter") {
    if (props.provider === "RIA") {
      return (
        <RiaRemitterStep
          documentNumber={props.documentNumber}
          known={props.known}
        />
      );
    }
    if (props.provider === "WU") {
      return (
        <WuRemitterStep
          documentNumber={props.documentNumber}
          known={props.known}
        />
      );
    }
    if (props.provider === "MONEYGRAM") {
      return (
        <MoneygramRemitterStep
          documentNumber={props.documentNumber}
          known={props.known}
        />
      );
    }
    return (
      <TerrapayRemitterStep
        documentNumber={props.documentNumber}
        known={props.known}
      />
    );
  }

  if (stepKey === "beneficiary") {
    // WU, Moneygram y TerraPay declaran los datos PEP al final del beneficiario.
    const withPep = (content: ReactNode) => (
      <div className="space-y-6">
        {content}
        <div className="border-t border-[#e6ebf3] pt-6">
          <PepStep
            known={props.known}
            showTerraPayExtras={props.provider === "TERRAPAY"}
            additionalChecks={props.additionalChecks}
            onChange={props.onAdditionalCheckChange}
          />
        </div>
      </div>
    );
    if (props.provider === "RIA") {
      return (
        <RiaBeneficiaryStep
          isKnownClient={props.isKnownClient}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
    }
    if (props.provider === "WU") {
      return withPep(
        <WuBeneficiaryStep
          isKnownClient={props.isKnownClient}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />,
      );
    }
    if (props.provider === "MONEYGRAM") {
      return withPep(<MoneygramBeneficiaryAccountStep known={props.known} />);
    }
    return withPep(
      <TerrapayBeneficiaryStep
        isKnownClient={props.isKnownClient}
        beneficiaries={props.beneficiaries}
        selectedBeneficiary={props.selectedBeneficiary}
        onSelectBeneficiary={props.onSelectBeneficiary}
        known={props.known}
      />,
    );
  }

  if (stepKey === "additionalInfo") {
    return (
      <RiaAdditionalInfoStep
        additionalChecks={props.additionalChecks}
        onChange={props.onAdditionalCheckChange}
        known={props.known}
      />
    );
  }

  if (stepKey === "payment") {
    if (props.provider === "TERRAPAY") {
      return (
        <TerrapayPaymentStep
          totalToCharge={props.totalToCharge}
          formatUsd={props.formatUsd}
          billingSlot={props.billingSlot}
        />
      );
    }
    return (
      <StandardPaymentStep
        totalToCharge={props.totalToCharge}
        formatUsd={props.formatUsd}
        formatAmount={props.formatAmount}
        bobPerUsd={props.bobPerUsd}
        primaryMethod={props.primaryMethod}
        onPrimaryMethodChange={props.onPrimaryMethodChange}
        primaryMethodRef={props.primaryMethodRef}
        primaryCurrency={props.primaryCurrency}
        onPrimaryCurrencyChange={props.onPrimaryCurrencyChange}
        primaryCents={props.primaryCents}
        extraPayments={props.extraPayments}
        onAddPayment={props.onAddPayment}
        onUpdatePayment={props.onUpdatePayment}
        onRemovePayment={props.onRemovePayment}
        renderSelect={props.renderSelect}
        paymentMethodOptions={props.paymentMethodOptions}
        nextButtonRef={props.nextButtonRef}
        sanitizeAmount={props.sanitizeAmount}
        parseAmount={props.parseAmount}
        toCents={props.toCents}
        billingSlot={props.billingSlot}
      />
    );
  }

  return (
    <ReviewStep
      provider={props.provider}
      quote={props.quote}
      totalToCharge={props.totalToCharge}
      formatUsd={props.formatUsd}
      destinationCountry={props.destinationCountry}
      payingPartner={props.payingPartner}
      location={props.location}
      wuService={props.wuService}
      moneygramCompany={props.moneygramCompany}
      terraPayBank={props.terraPayBank}
      terraPayWallet={props.terraPayWallet}
      isKnownClient={props.isKnownClient}
      beneficiary={props.beneficiaries[props.selectedBeneficiary]}
      senderName={props.senderName}
      documentNumber={props.documentNumber}
      paymentLines={props.paymentLines}
      formatAmount={props.formatAmount}
      billingName={props.billingName}
      billingNit={props.billingNit}
      onEditQuote={props.onEditQuote}
      onEditRemitter={props.onEditRemitter}
      onEditBeneficiary={props.onEditBeneficiary}
      onEditPayment={props.onEditPayment}
    />
  );
}
