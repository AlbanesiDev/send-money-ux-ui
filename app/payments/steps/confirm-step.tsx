"use client";

import type { ReactNode } from "react";
import { CountryFlag } from "@/components/ui/country-flag";
import {
  AGENCY_CASH_BOB,
  AGENCY_CASH_USD,
  convertUsdToBob,
  formatMoney,
  formatOperationNumber,
  resolvePayoutAmount,
  type PaymentOperation,
  type PayoutCurrency,
} from "../payment-data";
import type { ComplianceFlags, ProfileForm, UifForm } from "../payment-rules";
import { formatDate } from "./beneficiary-step";

export function ConfirmStep({
  operation,
  payoutCurrency,
  onPayoutCurrencyChange,
  profile,
  flags,
  uifForm,
  uifRequired,
  onEditBeneficiary,
}: {
  operation: PaymentOperation;
  payoutCurrency: PayoutCurrency;
  onPayoutCurrencyChange: (currency: PayoutCurrency) => void;
  profile: ProfileForm;
  flags: ComplianceFlags;
  uifForm: UifForm;
  uifRequired: boolean;
  onEditBeneficiary: () => void;
}) {
  const fullName = [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");
  const deliverAmount = resolvePayoutAmount(operation.amount, payoutCurrency);
  let agencyCash = AGENCY_CASH_USD;
  if (payoutCurrency === "BOB") {
    agencyCash = AGENCY_CASH_BOB;
  }
  const cashAfter = agencyCash - deliverAmount;
  const bobEquivalent = convertUsdToBob(operation.amount);
  let conversionHint = ` · Cotización agencia disponible: 1 USD = ${operation.exchangeRate} BOB`;
  if (payoutCurrency === "BOB") {
    conversionHint = ` · Conversión agencia ${operation.exchangeRate} = ${formatMoney(bobEquivalent, "BOB")}`;
  }
  let cashMessage = `Efectivo en caja después del pago: ${formatMoney(cashAfter, payoutCurrency)}.`;
  let cashMessageClass = "text-muted-foreground";
  if (cashAfter < 0) {
    cashMessage = `Efectivo insuficiente en caja (${formatMoney(agencyCash, payoutCurrency)}). Solicita una provisión antes de pagar.`;
    cashMessageClass = "text-destructive";
  }
  let usdToggleClass =
    "rounded-md px-3 py-1.5 text-xs font-bold transition-colors text-muted-foreground hover:text-foreground";
  if (payoutCurrency === "USD") {
    usdToggleClass =
      "rounded-md px-3 py-1.5 text-xs font-bold transition-colors bg-brand-strong text-white";
  }
  let bobToggleClass =
    "rounded-md px-3 py-1.5 text-xs font-bold transition-colors text-muted-foreground hover:text-foreground";
  if (payoutCurrency === "BOB") {
    bobToggleClass =
      "rounded-md px-3 py-1.5 text-xs font-bold transition-colors bg-brand-strong text-white";
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-foreground">Confirma y paga</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Confirma el monto con el beneficiario. Al pagar se imprime el
          comprobante para su firma.
        </p>
      </div>

      <section className="rounded-xl border border-brand/40 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-strong ">
              Monto a entregar
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-[-0.02em] text-foreground">
              {formatMoney(deliverAmount, payoutCurrency)}
            </p>
          </div>
          <div
            role="group"
            aria-label="Moneda de cobro"
            className="inline-flex rounded-lg border border-border bg-card p-0.5"
          >
            <button
              type="button"
              aria-pressed={payoutCurrency === "USD"}
              onClick={() => onPayoutCurrencyChange("USD")}
              className={usdToggleClass}
            >
              USD
            </button>
            <button
              type="button"
              aria-pressed={payoutCurrency === "BOB"}
              onClick={() => onPayoutCurrencyChange("BOB")}
              className={bobToggleClass}
            >
              BOB
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Enviado: {formatMoney(operation.amount, "USD")}
          {conversionHint}
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <Item label="Operación">
            <span className="font-mono">
              {formatOperationNumber(operation.number)}
            </span>
          </Item>
          <Item label="Origen">
            <span className="flex items-center gap-2">
              <CountryFlag country={operation.originCountry} />
              {operation.originCountry}
            </span>
          </Item>
          <Item label="Tasa de cambio">{operation.exchangeRate}</Item>
        </dl>
        <p className={`mt-3 text-xs font-semibold ${cashMessageClass}`}>
          {cashMessage}
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <SummaryCard title="Beneficiario" onEdit={onEditBeneficiary}>
          <Row label="Nombre" value={fullName} emphasis />
          <Row
            label="Documento"
            value={`${profile.documentType} ${profile.documentNumber} · ${profile.documentCountry}`}
          />
          <Row
            label="Vigencia"
            value={
              profile.noExpiryDate
                ? "Sin fecha de vigencia"
                : formatDate(profile.documentExpiryDate)
            }
          />
          <Row
            label="Teléfono"
            value={`${profile.phoneCode} ${profile.phone}`}
          />
          <Row
            label="Dirección"
            value={[
              `${profile.street} ${profile.houseNumber}`.trim(),
              profile.zone,
              profile.city,
            ]
              .filter(Boolean)
              .join(", ")}
          />
        </SummaryCard>
        <SummaryCard title="Declaraciones" onEdit={onEditBeneficiary}>
          <Row label="PEP" value={flags.pep ? "Sí" : "No"} />
          <Row label="Allegado a PEP" value={flags.pepRelated ? "Sí" : "No"} />
          <Row
            label="Formulario"
            value={uifRequired ? "Completo" : "No requerido"}
          />
          {uifForm.purpose && <Row label="Propósito" value={uifForm.purpose} />}
          {uifForm.fundsOrigin && (
            <Row label="Origen de los fondos" value={uifForm.fundsOrigin} />
          )}
          {flags.unusual && (
            <Row label="Operación inusual" value="Reportada" emphasis />
          )}
        </SummaryCard>
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{children}</dd>
    </div>
  );
}

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${title.toLowerCase()}`}
          className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-brand-strong hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
        >
          Editar
        </button>
      </div>
      <dl className="mt-1.5 flex flex-col divide-y divide-border">
        {children}
      </dl>
    </section>
  );
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-xs">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`text-right ${emphasis ? "text-sm font-bold text-foreground" : "font-semibold text-foreground"}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
