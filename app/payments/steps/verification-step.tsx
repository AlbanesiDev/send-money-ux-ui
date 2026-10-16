"use client";

import { useState, type ReactNode } from "react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  MessageCircleQuestionIcon,
  ShieldXIcon,
} from "lucide-react";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import { SelectInput, TextInput } from "../form-controls";
import { normalizeText, type PaymentOperation } from "../payment-data";
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
  const blocked = attemptsLeft <= 0 && !verified;
  const complete =
    answers.senderName.trim() !== "" &&
    answers.originCountry !== "" &&
    answers.amount.trim() !== "";
  const set = (field: keyof VerificationAnswers) => (value: string) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    setLastFailed(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-foreground">
          Verifica al beneficiario
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Haz las preguntas de palabra, sin girar la pantalla, y carga lo que
          responda.
        </p>
      </div>

      {verified ? (
        <Notice
          tone="success"
          icon={<CircleCheckIcon className="size-5" />}
          title="Beneficiario verificado"
          text="Las respuestas coinciden con la operación. Continúa con la identificación."
        />
      ) : blocked ? (
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
          <Question number={1} text="¿Quién le envió el dinero?">
            <TextInput
              label="Nombre del remitente"
              value={answers.senderName}
              onChange={set("senderName")}
              placeholder="Nombre y/o apellido"
              required
            />
          </Question>
          <Question number={2} text="¿Desde qué país se lo enviaron?">
            <SelectInput
              label="País de origen"
              value={answers.originCountry}
              options={COUNTRY_OPTIONS}
              onChange={set("originCountry")}
              showFlags
              required
            />
          </Question>
          <Question number={3} text="¿Cuánto espera recibir, aproximadamente?">
            <TextInput
              label={`Monto aproximado (${operation.currency})`}
              value={answers.amount}
              onChange={(value) => set("amount")(value.replace(/[^\d.,]/g, ""))}
              inputMode="numeric"
              placeholder="0,00"
              required
            />
          </Question>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
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
