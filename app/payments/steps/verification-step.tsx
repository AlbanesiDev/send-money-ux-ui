"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  MessageCircleQuestionIcon,
  ShieldXIcon,
} from "lucide-react";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import { SelectInput, TextInput } from "../form-controls";
import {
  formatAmount,
  normalizeText,
  type PaymentOperation,
} from "../payment-data";
import { Notice } from "./search-operation-step";

export const MAX_VERIFICATION_ATTEMPTS = 3;
/** Tolerancia del monto declarado por el beneficiario. */
const AMOUNT_TOLERANCE = 0.1;

const COUNTRY_OPTIONS = countriesCatalog.result.items.map((item) =>
  item.country.ctyName.trim(),
);

export type VerificationAnswers = {
  senderName: string;
  originCountry: string;
  amount: string;
};

/**
 * Preguntas abiertas: el beneficiario responde de palabra y el cajero
 * carga lo que escucha. A diferencia de las opciones múltiples, la pantalla
 * nunca muestra la respuesta correcta.
 */
export function checkAnswers(
  operation: PaymentOperation,
  answers: VerificationAnswers,
) {
  const expectedTokens = normalizeText(operation.senderName)
    .split(/\s+/)
    .filter((token) => token.length >= 3);
  const givenTokens = normalizeText(answers.senderName).split(/\s+/);
  const nameMatches = givenTokens.some((token) =>
    expectedTokens.includes(token),
  );
  const countryMatches = answers.originCountry === operation.originCountry;
  const amount = Number(answers.amount.replace(/\./g, "").replace(",", "."));
  const amountMatches =
    Number.isFinite(amount) &&
    Math.abs(amount - operation.amount) <= operation.amount * AMOUNT_TOLERANCE;
  return nameMatches && countryMatches && amountMatches;
}

export function VerificationStep({
  operation,
  attemptsLeft,
  verified,
  onVerify,
  onRestart,
}: {
  operation: PaymentOperation;
  attemptsLeft: number;
  verified: boolean;
  onVerify: (answers: VerificationAnswers) => boolean;
  onRestart: () => void;
}) {
  const [answers, setAnswers] = useState<VerificationAnswers>({
    senderName: "",
    originCountry: "",
    amount: "",
  });
  const [lastFailed, setLastFailed] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const blocked = attemptsLeft <= 0 && !verified;
  const complete =
    answers.senderName.trim() !== "" &&
    answers.originCountry !== "" &&
    answers.amount.trim() !== "";
  const set = (field: keyof VerificationAnswers) => (value: string) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    setLastFailed(false);
  };

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
          'input:not([disabled]):not([readonly]):not([type=hidden]), select:not([disabled]), button[aria-haspopup="listbox"]:not([disabled])',
        ),
      );
      const current = fields.indexOf(target);
      if (current < 0) return;
      event.preventDefault();
      const nextField = fields[current + 1];
      if (nextField) {
        nextField.focus();
        return;
      }
      container
        .querySelector<HTMLButtonElement>('button[type="submit"]')
        ?.focus();
    }
    document.addEventListener("keydown", advanceOnEnter);
    return () => document.removeEventListener("keydown", advanceOnEnter);
  }, []);

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
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4"
          data-enter-advance
        >
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Preguntas de seguridad
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Haz las preguntas de palabra, sin girar la pantalla, y carga lo
              que responda.
            </p>
          </div>
          <Question number={1} text="¿Quién le envió el dinero?">
            <TextInput
              label="Nombre del remitente"
              value={answers.senderName}
              onChange={set("senderName")}
              placeholder="Nombre y/o apellido"
              required
              disabled={verified}
              autoFocus={!verified}
            />
          </Question>
          <Question number={2} text="¿Desde qué país se lo enviaron?">
            <SelectInput
              label="País de origen"
              value={answers.originCountry}
              options={COUNTRY_OPTIONS}
              onChange={set("originCountry")}
              nextRef={amountRef}
              showFlags
              disabled={verified}
              required
            />
          </Question>
          <Question number={3} text="¿Cuánto espera recibir, aproximadamente?">
            <label className="block min-w-0">
              <span className="mb-1 flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
                <span>
                  Monto aproximado <span className="text-destructive">*</span>
                </span>
              </span>
              <div
                className={`flex h-10 items-center rounded-lg border bg-card transition focus-within:ring-4 ${
                  verified
                    ? "border-input bg-muted"
                    : "border-input focus-within:border-brand focus-within:ring-brand/10"
                }`}
              >
                <span
                  className={`shrink-0 whitespace-nowrap pl-3 text-sm font-bold ${
                    verified ? "text-muted-foreground" : "text-brand-strong"
                  }`}
                >
                  {operation.currency} $
                </span>
                <input
                  ref={amountRef}
                  value={answers.amount}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0,00"
                  disabled={verified}
                  required
                  onChange={(event) => {
                    const cleaned = event.target.value
                      .replace(/\./g, "")
                      .replace(/[^0-9,]/g, "");
                    const [integerPart, ...decimalParts] = cleaned.split(",");
                    set("amount")(
                      decimalParts.length === 0
                        ? integerPart
                        : `${integerPart || "0"},${decimalParts.join("").slice(0, 2)}`,
                    );
                  }}
                  onBlur={() => {
                    if (!answers.amount) return;
                    const amount = Number(
                      answers.amount.replace(/\./g, "").replace(",", "."),
                    );
                    if (!Number.isFinite(amount)) {
                      set("amount")("");
                      return;
                    }
                    set("amount")(formatAmount(amount));
                  }}
                  className="h-full w-full rounded-lg bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:text-muted-foreground"
                />
              </div>
            </label>
          </Question>
          {verified ? (
            <div className="mb-2 mt-6">
              <Notice
                tone="success"
                icon={<CircleCheckIcon className="size-5" />}
                title="Beneficiario verificado"
                text="Las respuestas coinciden con la operación. Continúa con la identificación."
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 mt-4">
              <p
                className={`text-xs font-semibold ${attemptsLeft === 1 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {attemptsLeft === MAX_VERIFICATION_ATTEMPTS
                  ? `Tiene ${attemptsLeft} intentos.`
                  : attemptsLeft === 1
                    ? "Último intento: si falla, la operación se bloquea."
                    : `Quedan ${attemptsLeft} intentos.`}
              </p>
              <button
                type="submit"
                disabled={!complete}
                className="rounded-lg bg-brand-strong px-5 py-2 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
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
      <p className="text-xs text-muted-foreground">
        Demo: remitente «{operation.senderName}», país «
        {operation.originCountry}», monto ±10%.
      </p>
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
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-end">
      <p className="flex items-center gap-2 pb-2.5 text-sm font-semibold text-foreground">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand-strong">
          {number}
        </span>
        <MessageCircleQuestionIcon
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
        {text}
      </p>
      {children}
    </div>
  );
}
