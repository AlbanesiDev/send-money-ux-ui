"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon, BanknoteIcon } from "lucide-react";
import { CancelOperationDialog } from "@/app/remittences/dialogs";
import { Stepper } from "@/components/ui/stepper";
import {
  AGENCY_CASH_BOB,
  formatMoney,
  type PaymentOperation,
} from "./payment-data";
import {
  PaymentProcessing,
  PaymentSuccess,
  PaymentSummaryAside,
} from "./payment-result";
import {
  EMPTY_UIF,
  buildInitialProfile,
  missingProfileFields,
  missingUifFields,
  requiredUifFields,
  uifTriggers,
  type ComplianceFlags,
  type ProfileForm,
  type UifForm,
} from "./payment-rules";
import { BeneficiaryStep, type DocumentCheck } from "./steps/beneficiary-step";
import { ComplianceSection } from "./steps/compliance-section";
import { ConfirmStep } from "./steps/confirm-step";
import {
  SearchOperationStep,
  type OperationSearchResult,
} from "./steps/search-operation-step";
import {
  MAX_VERIFICATION_ATTEMPTS,
  VerificationStep,
  checkAnswers,
} from "./steps/verification-step";

const STEPS = [
  "Buscar operación",
  "Verificación",
  "Beneficiario",
  "Confirmar y pagar",
];

function PagePayments() {
  const [flowKey, setFlowKey] = useState(0);
  return (
    <PaymentFlow key={flowKey} onReset={() => setFlowKey((key) => key + 1)} />
  );
}

function PaymentFlow({ onReset }: { onReset: () => void }) {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [operationNumber, setOperationNumber] = useState("");
  const [searchResult, setSearchResult] = useState<OperationSearchResult>(null);
  const [operation, setOperation] = useState<PaymentOperation | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_VERIFICATION_ATTEMPTS);
  const [verified, setVerified] = useState(false);
  const [documentInput, setDocumentInput] = useState("");
  const [documentCheck, setDocumentCheck] = useState<DocumentCheck>("pending");
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [showAllFields, setShowAllFields] = useState(false);
  const [flags, setFlags] = useState<ComplianceFlags>({
    additionalInfo: false,
    pep: false,
    pepRelated: false,
    unusual: false,
  });
  const [uifForm, setUifForm] = useState<UifForm>(EMPTY_UIF);
  const [knownUifFields, setKnownUifFields] = useState<Set<string>>(new Set());
  const [showErrors, setShowErrors] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const processingTimeoutRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(processingTimeoutRef.current), []);

  function startPayment(selected: PaymentOperation) {
    const customer = selected.existingCustomer;
    const known = selected.knownUifData ?? {};
    setOperation(selected);
    setProfile(buildInitialProfile(selected));
    setFlags({
      additionalInfo: false,
      pep: customer?.isPep ?? false,
      pepRelated: customer?.isPepRelated ?? false,
      unusual: false,
    });
    setUifForm({ ...EMPTY_UIF, ...known });
    setKnownUifFields(new Set(Object.keys(known)));
    setAttemptsLeft(MAX_VERIFICATION_ATTEMPTS);
    setVerified(false);
    setDocumentInput("");
    setDocumentCheck("pending");
    setShowAllFields(false);
    setShowErrors(false);
    goTo(2);
  }

  function goTo(target: number) {
    setStep(target);
    setMaxStep((current) => Math.max(current, target));
  }

  const uifRequiredFields =
    operation && profile
      ? requiredUifFields(operation, flags, uifForm, profile.documentType)
      : new Set<never>();
  const pendingCount =
    profile && operation
      ? missingProfileFields(profile).length +
        missingUifFields(uifRequiredFields, uifForm).length
      : 0;
  const beneficiaryReady = documentCheck === "matched" && pendingCount === 0;
  const cashShort = operation ? operation.amount > AGENCY_CASH_BOB : false;
  const beneficiaryName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : (operation?.beneficiaryName ?? "");

  function next() {
    if (step === 2 && verified) return goTo(3);
    if (step === 3) {
      if (!beneficiaryReady) {
        setShowErrors(true);
        return;
      }
      return goTo(4);
    }
    if (step === 4 && !cashShort && !processing) {
      setProcessing(true);
      processingTimeoutRef.current = window.setTimeout(() => {
        setProcessing(false);
        setPaid(true);
      }, 2200);
    }
  }

  function back() {
    setStep((current) => Math.max(1, current - 1));
  }

  if (operation && processing)
    return (
      <Shell>
        <PaymentProcessing
          amount={formatMoney(operation.amount, operation.currency)}
        />
      </Shell>
    );
  if (operation && paid)
    return (
      <Shell>
        <PaymentSuccess
          operation={operation}
          beneficiaryName={beneficiaryName}
          onNewPayment={onReset}
        />
      </Shell>
    );

  const blocked = attemptsLeft <= 0 && !verified;
  const primaryLabel =
    step === 4 && operation
      ? `Pagar ${formatMoney(operation.amount, operation.currency)}`
      : "Siguiente";
  const primaryDisabled =
    (step === 2 && !verified) ||
    (step === 3 && documentCheck !== "matched") ||
    (step === 4 && cashShort);

  return (
    <Shell plain={step > 1}>
      <Stepper
        steps={STEPS}
        currentStep={step}
        onStepClick={(target) => {
          if (target <= maxStep && !blocked) setStep(target);
        }}
        showProgress={step > 1}
        ariaLabel="Progreso del pago"
      >
        <Stepper.Step index={1}>
          <div className="min-h-0 flex-1 overflow-y-auto pb-6">
            <SearchOperationStep
              operationNumber={operationNumber}
              onOperationNumberChange={setOperationNumber}
              result={searchResult}
              onResultChange={setSearchResult}
              onStart={startPayment}
            />
          </div>
        </Stepper.Step>
        {operation && profile && (
          [
            <Stepper.Step key={2} index={2}>
              <StepLayout
                aside={
                  <PaymentSummaryAside
                    operation={operation}
                    beneficiaryName={beneficiaryName}
                    verified={verified}
                    documentValidated={documentCheck === "matched"}
                  />
                }
              >
                <VerificationStep
                  operation={operation}
                  attemptsLeft={attemptsLeft}
                  verified={verified}
                  onVerify={(answers) => {
                    if (checkAnswers(operation, answers)) {
                      setVerified(true);
                      window.requestAnimationFrame(() =>
                        nextButtonRef.current?.focus(),
                      );
                      return true;
                    }
                    setAttemptsLeft((current) => current - 1);
                    return false;
                  }}
                  onRestart={onReset}
                />
              </StepLayout>
            </Stepper.Step>,
            <Stepper.Step key={3} index={3}>
              <StepLayout
                aside={
                  <PaymentSummaryAside
                    operation={operation}
                    beneficiaryName={beneficiaryName}
                    verified={verified}
                    documentValidated={documentCheck === "matched"}
                  />
                }
              >
                <BeneficiaryStep
                  operation={operation}
                  documentInput={documentInput}
                  onDocumentInputChange={setDocumentInput}
                  documentCheck={documentCheck}
                  onDocumentCheck={setDocumentCheck}
                  profile={profile}
                  onProfileChange={setProfile}
                  showAllFields={showAllFields}
                  onShowAllFields={() => setShowAllFields(true)}
                  showErrors={showErrors}
                  complianceSlot={
                    <ComplianceSection
                      operation={operation}
                      flags={flags}
                      onFlagsChange={setFlags}
                      form={uifForm}
                      onFormChange={setUifForm}
                      requiredFields={uifRequiredFields}
                      knownFields={knownUifFields}
                      showErrors={showErrors}
                    />
                  }
                />
              </StepLayout>
            </Stepper.Step>,
            <Stepper.Step key={4} index={4}>
              <StepLayout
                aside={
                  <PaymentSummaryAside
                    operation={operation}
                    beneficiaryName={beneficiaryName}
                    verified={verified}
                    documentValidated={documentCheck === "matched"}
                  />
                }
              >
                <ConfirmStep
                  operation={operation}
                  profile={profile}
                  flags={flags}
                  uifForm={uifForm}
                  uifRequired={
                    flags.additionalInfo ||
                    uifTriggers(operation, flags).length > 0
                  }
                  onEditBeneficiary={() => setStep(3)}
                />
              </StepLayout>
            </Stepper.Step>
          ]
        )}
      </Stepper>
      {step > 1 && !blocked && (
        <div className="flex h-[42px] shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-2 rounded-md border border-border bg-muted px-4 py-1 text-sm font-bold text-muted-foreground hover:bg-white"
            >
              <ArrowLeftIcon className="size-4" />
              Volver
            </button>
            <CancelOperationDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              onConfirm={onReset}
            />
          </div>
          <div className="flex items-center gap-3">
            {step === 3 && showErrors && pendingCount > 0 && (
              <p
                role="alert"
                className="text-xs font-semibold text-destructive"
              >
                {pendingCount === 1
                  ? "Falta completar 1 dato obligatorio."
                  : `Faltan completar ${pendingCount} datos obligatorios.`}
              </p>
            )}
            <button
              type="button"
              ref={nextButtonRef}
              onClick={next}
              disabled={primaryDisabled}
              className="flex items-center gap-2 rounded-md bg-brand-strong px-4 py-1 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
            >
              {step === 4 && <BanknoteIcon className="size-4" />}
              {primaryLabel}
              {step < 4 && <ArrowRightIcon className="size-4" />}
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({
  plain = false,
  children,
}: {
  plain?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-[14px] text-foreground ${plain ? "" : "bg-card shadow-[0_12px_35px_rgba(24,37,73,0.06)] dark:shadow-none"}`}
    >
      {children}
    </section>
  );
}

function StepLayout({
  aside,
  children,
}: {
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
      <div className="min-w-0">{children}</div>
      {aside}
    </div>
  );
}

export default PagePayments;
