import type { ReactNode } from "react";
import {
  GuestClientLookupNotice,
  type GuestClientLookupStatus,
} from "./guest-client-lookup-notice";
import { FrequentBeneficiaries } from "./frequent-beneficiaries";
// import { FrequentMoneygramAccounts } from "./frequent-moneygram-accounts";
import { RiaAdditionalInfoStep } from "./providers/ria/additional-info-step";
import { RiaBeneficiaryStep } from "./providers/ria/beneficiary-step";
import { RiaRemitterStep } from "./providers/ria/remitter-step";
import {
  MoneygramBeneficiaryAccountStep,
  type MoneygramAccountFormChangeHandler,
} from "./providers/moneygram/beneficiary-account-step";
import { MoneygramRemitterStep } from "./providers/moneygram/remitter-step";
import { TerrapayBeneficiaryStep } from "./providers/terrapay/beneficiary-step";
import { TerrapayRemitterStep } from "./providers/terrapay/remitter-step";
import { WuBeneficiaryStep } from "./providers/wu/beneficiary-step";
import { WuRemitterStep } from "./providers/wu/remitter-step";
import { PepStep } from "./shared/pep-step";
import { ReviewStep } from "./shared/review-step";
import { getStepKey } from "./provider-flows";
import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import type { MoneygramAccountDraft } from "@/lib/simulated-api/moneygram-accounts-api";
import type {
  Beneficiary,
  Customer,
  MoneygramAccount,
  PaymentLine,
  ProviderId,
  ProviderQuote,
  ProviderStepKey,
} from "./types";
import type { BeneficiaryFormChangeHandler } from "./providers/wu/beneficiary-step";
import type { RemitterFormChangeHandler } from "./providers/wu/remitter-step";

export type ProviderStepContentProps = {
  provider: ProviderId;
  step: number;
  activeSteps: readonly string[];
  documentNumber: string;
  customer: Customer | null;
  remitterForm: CustomerRegistrationDraft;
  onRemitterFormChange: RemitterFormChangeHandler;
  beneficiaryForm: BeneficiaryRegistrationDraft;
  onBeneficiaryFormChange: BeneficiaryFormChangeHandler;
  moneygramAccountForm: MoneygramAccountDraft;
  onMoneygramAccountFormChange: MoneygramAccountFormChangeHandler;
  isKnownClient: boolean;
  showFrequentBeneficiaries: boolean;
  beneficiaries: Beneficiary[];
  selectedBeneficiary: number;
  onSelectBeneficiary: (index: number) => void;
  onCreateBeneficiary?: () => void;
  moneygramAccounts: MoneygramAccount[];
  selectedMoneygramAccount: number;
  onSelectMoneygramAccount: (index: number) => void;
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
  onDocumentNumberChange?: (value: string) => void;
  onRegisterClient?: () => void;
  isRegisteringClient?: boolean;
  registerClientError?: string;
  isUpdatingExistingClient?: boolean;
  showSaveClientButton?: boolean;
  onRegisterBeneficiary?: () => void;
  isRegisteringBeneficiary?: boolean;
  registerBeneficiaryError?: string;
  isUpdatingExistingBeneficiary?: boolean;
  showSaveBeneficiaryButton?: boolean;
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

    const afterDocumentFields =
      props.isGuestFlow === true &&
      props.guestLookupStatus !== undefined &&
      props.onAcceptGuestAutofill !== undefined &&
      props.onDeclineGuestAutofill !== undefined ? (
        <>
          <GuestClientLookupNotice
            status={props.guestLookupStatus}
            onAcceptAutofill={props.onAcceptGuestAutofill}
            onDeclineAutofill={props.onDeclineGuestAutofill}
          />
        </>
      ) : null;

    if (props.provider === "RIA") {
      declarations = (
        <RiaAdditionalInfoStep
          additionalChecks={props.additionalChecks}
          onChange={props.onAdditionalCheckChange}
          customer={props.customer}
          remitterForm={props.remitterForm}
          onRemitterFormChange={props.onRemitterFormChange}
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
      onDocumentNumberChange: props.onDocumentNumberChange,
      afterDocumentFields,
      footerSlot,
    };

    const beneficiaryFormProps = {
      form: props.beneficiaryForm,
      onFormChange: props.onBeneficiaryFormChange,
      destinationCountry: props.destinationCountry,
    };

    if (props.provider === "RIA") {
      remitter = <RiaRemitterStep {...remitterDocumentProps} />;
      beneficiary = <RiaBeneficiaryStep {...beneficiaryFormProps} />;
    } else if (props.provider === "WU") {
      remitter = <WuRemitterStep {...remitterDocumentProps} />;
      beneficiary = <WuBeneficiaryStep {...beneficiaryFormProps} />;
    } else if (props.provider === "MONEYGRAM") {
      remitter = <MoneygramRemitterStep {...remitterDocumentProps} />;
      beneficiary = (
        <MoneygramBeneficiaryAccountStep
          form={props.moneygramAccountForm}
          onFormChange={props.onMoneygramAccountFormChange}
          destinationCountry={props.destinationCountry}
        />
      );
    } else {
      remitter = <TerrapayRemitterStep {...remitterDocumentProps} />;
      beneficiary = (
        <TerrapayBeneficiaryStep
          form={props.beneficiaryForm}
          onFormChange={props.onBeneficiaryFormChange}
        />
      );
    }

    let beneficiarySectionTitle = "Beneficiario";
    let beneficiaryButtonLabel = "Guardar beneficiario";
    if (props.provider === "MONEYGRAM") {
      beneficiarySectionTitle = "Cuenta / compañía";
      beneficiaryButtonLabel = "Guardar cuenta";
    }
    if (props.isRegisteringBeneficiary === true) {
      beneficiaryButtonLabel =
        props.isUpdatingExistingBeneficiary === true
          ? "Actualizando…"
          : "Guardando…";
    } else if (props.isUpdatingExistingBeneficiary === true) {
      if (props.provider === "MONEYGRAM") {
        beneficiaryButtonLabel = "Actualizar cuenta";
      } else {
        beneficiaryButtonLabel = "Actualizar beneficiario";
      }
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
        <div className="flex min-h-0 flex-col gap-4">
          {/* {props.showFrequentBeneficiaries && props.provider === "MONEYGRAM" && (
            <FrequentMoneygramAccounts
              accounts={props.moneygramAccounts}
              selectedAccount={props.selectedMoneygramAccount}
              onSelectAccount={props.onSelectMoneygramAccount}
            />
          )} */}
          {props.showFrequentBeneficiaries &&
            props.provider !== "MONEYGRAM" && (
              <FrequentBeneficiaries
                beneficiaries={props.beneficiaries}
                selectedBeneficiary={props.selectedBeneficiary}
                onSelectBeneficiary={props.onSelectBeneficiary}
                onCreateNew={props.onCreateBeneficiary}
              />
            )}
          <section className="flex max-h-[min(70vh,36rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border border-l-4 border-l-party-beneficiary-border bg-card p-5 shadow-sm lg:max-h-none">
            <h2 className="mb-4 shrink-0 font-bold text-party-beneficiary-fg">
              {beneficiarySectionTitle}
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {beneficiary}
            </div>
            {props.showSaveBeneficiaryButton === true &&
              props.onRegisterBeneficiary !== undefined && (
                <div className="mt-4 shrink-0 space-y-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={props.onRegisterBeneficiary}
                    disabled={props.isRegisteringBeneficiary === true}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-party-beneficiary-border text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-party-beneficiary-border/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {beneficiaryButtonLabel}
                  </button>
                  {props.registerBeneficiaryError !== undefined &&
                    props.registerBeneficiaryError !== "" && (
                      <p role="alert" className="text-sm text-destructive">
                        {props.registerBeneficiaryError}
                      </p>
                    )}
                </div>
              )}
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
      remitterForm={props.remitterForm}
      documentNumber={props.documentNumber}
      beneficiaryForm={props.beneficiaryForm}
      moneygramAccountForm={props.moneygramAccountForm}
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
