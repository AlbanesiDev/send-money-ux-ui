import type { ReactNode } from "react";
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
import { ReviewStep } from "./shared/review-step";
import { getStepKey } from "./provider-flows";
import type {
  Beneficiary,
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
  billingSlot: ReactNode;
};

export function ProviderStepContent(props: ProviderStepContentProps) {
  const stepKey: ProviderStepKey = getStepKey(props.provider, props.step);

  if (stepKey === "parties") {
    let remitter: ReactNode;
    let beneficiary: ReactNode;
    let declarations: ReactNode = null;

    if (props.provider === "RIA") {
      remitter = (
        <RiaRemitterStep
          documentNumber={props.documentNumber}
          known={props.known}
        />
      );
      beneficiary = (
        <RiaBeneficiaryStep
          isKnownClient={props.isKnownClient}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
      declarations = (
        <RiaAdditionalInfoStep
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
          known={props.known}
        />
      );
    } else if (props.provider === "WU") {
      remitter = (
        <WuRemitterStep
          documentNumber={props.documentNumber}
          known={props.known}
        />
      );
      beneficiary = (
        <WuBeneficiaryStep
          isKnownClient={props.isKnownClient}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
      declarations = (
        <PepStep
          known={props.known}
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
        />
      );
    } else if (props.provider === "MONEYGRAM") {
      remitter = (
        <MoneygramRemitterStep
          documentNumber={props.documentNumber}
          known={props.known}
        />
      );
      beneficiary = <MoneygramBeneficiaryAccountStep known={props.known} />;
      declarations = (
        <PepStep
          known={props.known}
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
        />
      );
    } else {
      remitter = (
        <TerrapayRemitterStep
          documentNumber={props.documentNumber}
          known={props.known}
        />
      );
      beneficiary = (
        <TerrapayBeneficiaryStep
          isKnownClient={props.isKnownClient}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
      declarations = (
        <PepStep
          known={props.known}
          showTerraPayExtras
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
        />
      );
    }

    return (
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-5 font-bold">Remitente</h2>
          {remitter}
        </section>
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-5 font-bold">Beneficiario</h2>
            {beneficiary}
          </section>
          <section className="rounded-xl border border-border bg-card p-5">
            {declarations}
          </section>
        </div>
      </div>
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
      billingSlot={props.billingSlot}
    />
  );
}
