import type { ReactNode } from "react";
import {
  GuestClientLookupNotice,
  type GuestClientLookupStatus,
} from "./guest-client-lookup-notice";
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
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import type {
  Beneficiary,
  Customer,
  PaymentLine,
  ProviderId,
  ProviderQuote,
  ProviderStepKey,
} from "./types";
import type { RemitterFormChangeHandler } from "./providers/wu/remitter-step";

export type ProviderStepContentProps = {
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
  onEditQuote: () => void;
  onEditRemitter?: () => void;
  onEditBeneficiary?: () => void;
  onEditPayment: () => void;
  formatAmount: (value: number) => string;
  billingSlot: ReactNode;
  isGuestFlow?: boolean;
  documentFieldsLocked?: boolean;
  onDocumentNumberChange?: (value: string) => void;
  onRegisterClient?: () => void;
  isRegisteringClient?: boolean;
  registerClientError?: string;
  isUpdatingExistingClient?: boolean;
  showSaveClientButton?: boolean;
  guestLookupStatus?: GuestClientLookupStatus;
  onAcceptGuestAutofill?: () => void;
  onDeclineGuestAutofill?: () => void;
};

export function ProviderStepContent(props: ProviderStepContentProps) {
  const stepKey: ProviderStepKey = getStepKey(
    props.provider,
    props.step,
    props.activeSteps,
  );

  if (stepKey === "parties") {
    let remitter: ReactNode;
    let beneficiary: ReactNode;
    let declarations: ReactNode = null;

    const documentFieldsLocked = props.documentFieldsLocked === true;
    const afterDocumentFields =
      props.isGuestFlow === true &&
      props.guestLookupStatus !== undefined &&
      props.onAcceptGuestAutofill !== undefined &&
      props.onDeclineGuestAutofill !== undefined ? (
        <div className="pt-4">
          <GuestClientLookupNotice
            status={props.guestLookupStatus}
            onAcceptAutofill={props.onAcceptGuestAutofill}
            onDeclineAutofill={props.onDeclineGuestAutofill}
          />
        </div>
      ) : null;

    if (props.provider === "RIA") {
      declarations = (
        <RiaAdditionalInfoStep
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
          customer={props.customer}
        />
      );
    } else if (props.provider === "WU" || props.provider === "MONEYGRAM") {
      declarations = (
        <PepStep
          customer={props.customer}
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
        />
      );
    } else {
      declarations = (
        <PepStep
          customer={props.customer}
          showTerraPayExtras
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
        />
      );
    }

    let registerButtonLabel = "Registrar cliente";
    if (props.isRegisteringClient === true) {
      registerButtonLabel =
        props.isUpdatingExistingClient === true
          ? "Actualizando…"
          : "Registrando…";
    } else if (props.isUpdatingExistingClient === true) {
      registerButtonLabel = "Actualizar cliente";
    }

    const footerSlot =
      declarations === null ? undefined : (
        <div className="space-y-6 pt-6">{declarations}</div>
      );

    const remitterDocumentProps = {
      documentNumber: props.documentNumber,
      form: props.remitterForm,
      onFormChange: props.onRemitterFormChange,
      documentFieldsLocked,
      onDocumentNumberChange: props.onDocumentNumberChange,
      afterDocumentFields,
      footerSlot,
    };

    if (props.provider === "RIA") {
      remitter = <RiaRemitterStep {...remitterDocumentProps} />;
      beneficiary = (
        <RiaBeneficiaryStep
          showFrequentBeneficiaries={props.showFrequentBeneficiaries}
          fillBeneficiaryFields={props.fillBeneficiaryFields}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
    } else if (props.provider === "WU") {
      remitter = <WuRemitterStep {...remitterDocumentProps} />;
      beneficiary = (
        <WuBeneficiaryStep
          showFrequentBeneficiaries={props.showFrequentBeneficiaries}
          fillBeneficiaryFields={props.fillBeneficiaryFields}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
    } else if (props.provider === "MONEYGRAM") {
      remitter = <MoneygramRemitterStep {...remitterDocumentProps} />;
      let moneygramKnown = props.known;
      if (!props.fillBeneficiaryFields) {
        moneygramKnown = () => undefined;
      }
      beneficiary = <MoneygramBeneficiaryAccountStep known={moneygramKnown} />;
    } else {
      remitter = <TerrapayRemitterStep {...remitterDocumentProps} />;
      beneficiary = (
        <TerrapayBeneficiaryStep
          showFrequentBeneficiaries={props.showFrequentBeneficiaries}
          fillBeneficiaryFields={props.fillBeneficiaryFields}
          beneficiaries={props.beneficiaries}
          selectedBeneficiary={props.selectedBeneficiary}
          onSelectBeneficiary={props.onSelectBeneficiary}
          known={props.known}
        />
      );
    }

    return (
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-2">
        <section className="flex max-h-[min(70vh,36rem)] min-h-0 flex-col overflow-hidden rounded-xl border border-border border-l-4 border-l-party-sender-border bg-card p-5 shadow-sm lg:max-h-none">
          <h2 className="mb-4 shrink-0 font-bold text-party-sender-fg">
            Remitente
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">{remitter}</div>
          {props.showSaveClientButton === true &&
            props.onRegisterClient !== undefined && (
              <div className="mt-4 shrink-0 space-y-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={props.onRegisterClient}
                  disabled={props.isRegisteringClient === true}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-party-sender-border text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-party-sender-border/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registerButtonLabel}
                </button>
                {props.registerClientError !== undefined &&
                  props.registerClientError !== "" && (
                    <p role="alert" className="text-sm text-destructive">
                      {props.registerClientError}
                    </p>
                  )}
              </div>
            )}
        </section>
        <section className="flex max-h-[min(70vh,36rem)] min-h-0 flex-col overflow-hidden rounded-xl border border-border border-l-4 border-l-party-beneficiary-border bg-card p-5 shadow-sm lg:max-h-none">
          <h2 className="mb-4 shrink-0 font-bold text-party-beneficiary-fg">
            Beneficiario
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {beneficiary}
          </div>
        </section>
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
