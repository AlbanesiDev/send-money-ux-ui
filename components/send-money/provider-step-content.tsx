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
} from "./shared/payment-step";
import { ReviewStep } from "./shared/review-step";
import { getStepKey } from "./provider-flows";
import type {
  Beneficiary,
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
  paymentMethod: string;
  receivedValue: number;
  changeDue: number;
  billingName: string;
  billingNit: string;
  onEditQuote: () => void;
  onEditRemitter: () => void;
  onEditBeneficiary: () => void;
  onEditPayment: () => void;
  paymentMethodSlot: ReactNode;
  receivedAmountRef: RefObject<HTMLInputElement | null>;
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  receivedAmount: string;
  onReceivedAmountChange: (value: string) => void;
  onReceivedAmountBlur: () => void;
  sanitizeAmount: (value: string) => string;
  receivedInsufficient: boolean;
  toCents: (value: number) => number;
  paymentReady: boolean;
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

  if (stepKey === "pep") {
    return (
      <PepStep
        known={props.known}
        showTerraPayExtras={props.provider === "TERRAPAY"}
        additionalChecks={props.additionalChecks}
        onChange={props.onAdditionalCheckChange}
      />
    );
  }

  if (stepKey === "beneficiary") {
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
      return (
        <WuBeneficiaryStep
          isKnownClient={props.isKnownClient}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
    }
    if (props.provider === "MONEYGRAM") {
      return <MoneygramBeneficiaryAccountStep known={props.known} />;
    }
    return (
      <TerrapayBeneficiaryStep
        isKnownClient={props.isKnownClient}
        beneficiaries={props.beneficiaries}
        selectedBeneficiary={props.selectedBeneficiary}
        onSelectBeneficiary={props.onSelectBeneficiary}
        known={props.known}
      />
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
        paymentMethodSlot={props.paymentMethodSlot}
        receivedAmountRef={props.receivedAmountRef}
        nextButtonRef={props.nextButtonRef}
        receivedAmount={props.receivedAmount}
        onReceivedAmountChange={props.onReceivedAmountChange}
        onReceivedAmountBlur={props.onReceivedAmountBlur}
        sanitizeAmount={props.sanitizeAmount}
        receivedInsufficient={props.receivedInsufficient}
        receivedValue={props.receivedValue}
        toCents={props.toCents}
        changeDue={props.changeDue}
        paymentReady={props.paymentReady}
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
      paymentMethod={props.paymentMethod}
      receivedValue={props.receivedValue}
      changeDue={props.changeDue}
      billingName={props.billingName}
      billingNit={props.billingNit}
      onEditQuote={props.onEditQuote}
      onEditRemitter={props.onEditRemitter}
      onEditBeneficiary={props.onEditBeneficiary}
      onEditPayment={props.onEditPayment}
    />
  );
}
