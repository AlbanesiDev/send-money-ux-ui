"use client";

import { useState, type ReactNode } from "react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  LockIcon,
  ShieldXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  formatMoney,
  PAYMENT_OPERATIONS,
  type PaymentOperation,
} from "../payment-data";
import { Notice } from "./search-operation-step";

export const MAX_VERIFICATION_ATTEMPTS = 3;

export type VerificationAnswers = {
  senderName: string;
  originCountry: string;
  amount: string;
};

export const EMPTY_VERIFICATION_ANSWERS: VerificationAnswers = {
  senderName: "",
  originCountry: "",
  amount: "",
};

/**
 * El cajero selecciona entre opciones múltiples lo que responde el
 * beneficiario de palabra. La respuesta correcta está mezclada con distractores.
 */
export function checkAnswers(
  operation: PaymentOperation,
  answers: VerificationAnswers,
) {
  return (
    answers.senderName === operation.senderName &&
    answers.originCountry === operation.originCountry &&
    answers.amount === formatMoney(operation.amount, operation.currency)
  );
}

export function VerificationStep({
  operation,
  answers,
  onAnswersChange,
  attemptsLeft,
  verified,
  onVerify,
  onRestart,
}: {
  operation: PaymentOperation;
  answers: VerificationAnswers;
  onAnswersChange: (answers: VerificationAnswers) => void;
  attemptsLeft: number;
  verified: boolean;
  onVerify: (answers: VerificationAnswers) => boolean;
  onRestart: () => void;
}) {
  const [lastFailed, setLastFailed] = useState(false);
  const blocked = attemptsLeft <= 0 && !verified;
  const selectedCount = [
    answers.senderName,
    answers.originCountry,
    answers.amount,
  ].filter((answer) => answer !== "").length;
  const complete = selectedCount === 3;

  const rotateBy = Number(operation.number[operation.number.length - 1]) % 3;

  const otherNames = [
    ...new Set(
      PAYMENT_OPERATIONS.map((item) => item.senderName).filter(
        (name) => name !== operation.senderName,
      ),
    ),
  ];
  const senderOptions = [operation.senderName, otherNames[0], otherNames[1]];
  const senderChoices = [
    ...senderOptions.slice(rotateBy),
    ...senderOptions.slice(0, rotateBy),
  ];

  const otherCountries = [
    ...new Set(
      PAYMENT_OPERATIONS.map((item) => item.originCountry).filter(
        (country) => country !== operation.originCountry,
      ),
    ),
  ];
  const countryOptions = [
    operation.originCountry,
    otherCountries[0],
    otherCountries[1],
  ];
  const countryChoices = [
    ...countryOptions.slice((rotateBy + 1) % 3),
    ...countryOptions.slice(0, (rotateBy + 1) % 3),
  ];

  const correctAmount = formatMoney(operation.amount, operation.currency);
  const otherAmounts = [
    ...new Set(
      PAYMENT_OPERATIONS.map((item) =>
        formatMoney(item.amount, item.currency),
      ).filter((amount) => amount !== correctAmount),
    ),
  ];
  const amountOptions = [correctAmount, otherAmounts[0], otherAmounts[1]];
  const amountChoices = [
    ...amountOptions.slice((rotateBy + 2) % 3),
    ...amountOptions.slice(0, (rotateBy + 2) % 3),
  ];

  const set = (field: keyof VerificationAnswers) => (value: string) => {
    onAnswersChange({ ...answers, [field]: value });
    setLastFailed(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {blocked ? (
        <div className="flex flex-col gap-3">
          <Notice
            tone="error"
            icon={<ShieldXIcon className="size-5" />}
            title="Operación bloqueada para pago"
            text="Se agotaron los intentos. La operación quedó retenida y Cumplimiento fue notificado. No entregues el dinero."
          />
          <button
            type="button"
            onClick={onRestart}
            className="self-start rounded-md border border-border bg-muted px-4 py-1.5 text-sm font-bold text-foreground hover:bg-card"
          >
            Buscar otra operación
          </button>
        </div>
      ) : (
        <form
          id="verification-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!complete) return;
            setLastFailed(!onVerify(answers));
          }}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2 border-b border-border pb-5">
            <p className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-light">
              <LockIcon className="size-3.5" aria-hidden="true" />
              Verificación de identidad
            </p>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-foreground">
                Preguntas de seguridad
              </h1>
              {!verified && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                    attemptsLeft === 1
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-warning-border bg-warning-soft text-warning-foreground"
                  }`}
                >
                  <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
                  {attemptsLeft === MAX_VERIFICATION_ATTEMPTS
                    ? `Tiene ${attemptsLeft} intentos`
                    : attemptsLeft === 1
                      ? "Último intento"
                      : `Quedan ${attemptsLeft} intentos`}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground select-none">
              Haz las preguntas verbalmente, sin girar la pantalla hacia el
              beneficiario, y selecciona la respuesta que coincida con lo
              indicado.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <Question number={1} text="¿Quién le envió el dinero?">
                <RadioGroup
                  name="senderName"
                  options={senderChoices}
                  value={answers.senderName}
                  onChange={set("senderName")}
                  disabled={verified}
                />
              </Question>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <Question number={2} text="¿Desde qué país se lo enviaron?">
                <RadioGroup
                  name="originCountry"
                  options={countryChoices}
                  value={answers.originCountry}
                  onChange={set("originCountry")}
                  disabled={verified}
                />
              </Question>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <Question
                number={3}
                text="¿Cuánto espera recibir, aproximadamente?"
              >
                <RadioGroup
                  name="amount"
                  options={amountChoices}
                  value={answers.amount}
                  onChange={set("amount")}
                  disabled={verified}
                />
              </Question>
            </div>
          </div>

          {verified ? (
            <div className="mt-1">
              <Notice
                tone="success"
                icon={<CircleCheckIcon className="size-5" />}
                title="Beneficiario verificado"
                text="Las respuestas coinciden con la operación. Continúa con la identificación."
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Seleccionadas {selectedCount} de 3 respuestas
              </p>
              <button
                type="submit"
                disabled={!complete}
                className="rounded-xl bg-brand-strong px-5 py-2.5 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
              >
                Verificar respuestas
              </button>
            </div>
          )}
          {lastFailed && (
            <Notice
              tone="error"
              icon={<CircleAlertIcon className="size-5" />}
              title="Las respuestas no coinciden con la operación"
              text="Vuelve a preguntar. Por seguridad no indicamos cuál respuesta es incorrecta."
            />
          )}
        </form>
      )}
    </div>
  );
}

function Question({
  number,
  text,
  children,
}: {
  number: number;
  text: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-4 flex w-full items-center gap-2.5 text-sm font-semibold text-foreground select-none">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-strong text-xs font-bold text-white">
          {number}
        </span>
        <span className="min-w-0 leading-snug">{text}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
              selected
                ? "border-brand bg-accent text-foreground"
                : "border-border bg-card text-foreground hover:border-brand/40 hover:bg-accent/60"
            } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(option)}
              className="size-4 shrink-0 accent-brand-strong select-none"
            />
            <span className="min-w-0 font-medium leading-snug select-none">
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}
