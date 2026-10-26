import type { ReactNode } from "react";
import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import type { MoneygramAccountDraft } from "@/lib/simulated-api/moneygram-accounts-api";
import { CountryFlag } from "@/components/ui/country-flag";
import { deliveryTypeLabel, quoteAmountReceived } from "../provider-flows";
import type { PaymentLine, ProviderId, ProviderQuote } from "../types";
import { MoveRightIcon } from "lucide-react";
import type { AdditionalInfoFormState } from "./additional-info-form";
import { ComplianceSummaryCard } from "./compliance-summary-card";

const ORIGIN_COUNTRY = "Bolivia";

function SummarySection({
  title,
  editLabel,
  onEdit,
  highlight = false,
  tone = "default",
  children,
}: {
  title: string;
  editLabel?: string;
  onEdit?: () => void;
  highlight?: boolean;
  tone?: "default" | "sender" | "beneficiary";
  children: ReactNode;
}) {
  let toneClass = "border-border border-l-border bg-card shadow-sm";
  let titleClass = "text-foreground";
  let editClass =
    "text-muted-foreground hover:bg-muted focus-visible:ring-border";
  if (highlight) {
    toneClass = "border-border border-l-summary-border bg-card shadow-sm";
    titleClass = "text-summary-fg";
    editClass =
      "text-summary-fg hover:bg-summary-soft focus-visible:ring-summary";
  } else if (tone === "sender") {
    toneClass = "border-border border-l-party-sender-border bg-card shadow-sm";
    titleClass = "text-party-sender-fg";
    editClass =
      "text-party-sender-fg hover:bg-accent focus-visible:ring-party-sender-border";
  } else if (tone === "beneficiary") {
    toneClass =
      "border-border border-l-party-beneficiary-border bg-card shadow-sm";
    titleClass = "text-party-beneficiary-fg";
    editClass =
      "text-party-beneficiary-fg hover:bg-success-soft focus-visible:ring-party-beneficiary-border";
  }
  return (
    <section
      className={`flex max-h-[min(70vh,36rem)] min-h-0 flex-col overflow-hidden rounded-lg border border-l-4 px-3.5 py-2.5 lg:max-h-none ${toneClass}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 className={`text-sm font-bold ${titleClass}`}>{title}</h2>
        {onEdit && editLabel && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={editLabel}
            className={`rounded-md px-1.5 py-0.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 ${editClass}`}
          >
            Editar
          </button>
        )}
      </div>
      <dl className="mt-1.5 min-h-0 flex-1 overflow-y-auto pr-1 flex flex-col divide-y divide-border">
        {children}
      </dl>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
  accent = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  accent?: boolean;
}) {
  let valueClass = "font-semibold text-foreground";
  if (accent) {
    valueClass = "text-sm font-bold text-summary-fg";
  } else if (emphasis) {
    valueClass = "text-sm font-bold text-foreground";
  }
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right ${valueClass}`}>{value}</dd>
    </div>
  );
}

export function ReviewStep({
  provider,
  quote,
  totalToCharge,
  formatUsd,
  destinationCountry,
  payingPartner,
  location,
  wuService,
  moneygramCompany,
  terraPayBank,
  terraPayWallet,
  remitterForm,
  documentNumber,
  beneficiaryForm,
  moneygramAccountForm,
  paymentLines,
  formatAmount,
  billingName,
  billingNit,
  onEditQuote,
  onEditRemitter,
  onEditBeneficiary,
  onEditPayment,
  billingSlot,
  additionalInfoMarked,
  suspiciousMarked,
  additionalInfo,
  additionalInfoRequired,
  additionalInfoError,
  onAdditionalInfoMarkedChange,
  onEditAdditionalInfo,
  onSuspiciousMarkedChange,
  onEditSuspicious,
}: {
  provider: ProviderId;
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
  remitterForm: CustomerRegistrationDraft;
  documentNumber: string;
  beneficiaryForm: BeneficiaryRegistrationDraft;
  moneygramAccountForm: MoneygramAccountDraft;
  paymentLines: PaymentLine[];
  formatAmount: (value: number) => string;
  billingName: string;
  billingNit: string;
  onEditQuote: () => void;
  onEditRemitter?: () => void;
  onEditBeneficiary?: () => void;
  onEditPayment: () => void;
  billingSlot: ReactNode;
  additionalInfoMarked: boolean;
  suspiciousMarked: boolean;
  additionalInfo: AdditionalInfoFormState;
  additionalInfoRequired: boolean;
  additionalInfoError: string;
  onAdditionalInfoMarkedChange: (marked: boolean) => void;
  onEditAdditionalInfo: () => void;
  onSuspiciousMarkedChange: (marked: boolean) => void;
  onEditSuspicious: () => void;
}) {
  const remitterName = [
    remitterForm.firstName,
    remitterForm.middleName,
    remitterForm.lastName,
    remitterForm.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");
  const remitterDocument = [remitterForm.documentType, documentNumber]
    .filter(Boolean)
    .join(" ");
  let beneficiaryName = [
    beneficiaryForm.firstName,
    beneficiaryForm.middleName,
    beneficiaryForm.lastName,
    beneficiaryForm.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");
  if (provider === "MONEYGRAM") {
    beneficiaryName = moneygramAccountForm.company;
  }
  const amountReceived = quoteAmountReceived(quote);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <p className="shrink-0 rounded-md border border-warning-border bg-warning-soft px-3 py-2 text-xs text-warning-foreground">
        Confirma con el cliente el monto, el beneficiario y el lugar de pago
        antes de enviar.
      </p>

      <section className="shrink-0 rounded-xl border border-brand/40 bg-white p-4">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-start lg:gap-8">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">
              Monto que recibe
            </dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums tracking-[-0.02em] text-foreground">
              {formatUsd(amountReceived)}
            </dd>
            <dd className="mt-1 text-xs text-muted-foreground">
              Total a cobrar:{" "}
              <span className="text-sm font-semibold text-foreground">
                {formatUsd(totalToCharge)}
              </span>
            </dd>
          </div>

          <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
            <div>
              <dt className="text-xs text-party-sender-fg">Remitente</dt>
              <dd className="font-semibold text-foreground">{remitterName}</dd>
              <dd className="text-xs text-muted-foreground">
                {remitterDocument}
              </dd>
            </div>
            <span className="text-muted-foreground self-center" aria-hidden>
              <MoveRightIcon />
            </span>
            <div>
              <dt className="text-xs text-party-beneficiary-fg">
                Beneficiario
              </dt>
              <dd className="font-semibold text-foreground">
                {beneficiaryName}
              </dd>
            </div>
          </div>

          <div className="ml-12">
            <dt className="text-xs text-muted-foreground">Origen y destino</dt>
            <dd className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CountryFlag country={ORIGIN_COUNTRY} />
                {ORIGIN_COUNTRY}
              </span>
              <span className="text-muted-foreground" aria-hidden>
                <MoveRightIcon />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CountryFlag country={destinationCountry} />
                {destinationCountry}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-3 lg:overflow-hidden">
        <SummarySection
          title="Remitente"
          tone="sender"
          onEdit={onEditRemitter}
          editLabel={onEditRemitter ? "Editar remitente" : undefined}
        >
          {provider === "RIA" ? (
            <>
              <SummaryRow
                label="Tipo de documento"
                value={remitterForm.documentType || "—"}
              />
              <SummaryRow
                label="Número de documento"
                value={documentNumber || "—"}
              />
              <SummaryRow
                label="Nombre"
                value={remitterForm.firstName || "—"}
                emphasis
              />
              <SummaryRow
                label="Segundo nombre"
                value={remitterForm.middleName || "—"}
              />
              <SummaryRow
                label="Primer apellido"
                value={remitterForm.lastName || "—"}
              />
              <SummaryRow
                label="Segundo apellido"
                value={remitterForm.secondLastName || "—"}
              />
              <SummaryRow
                label="Correo electrónico"
                value={remitterForm.email || "—"}
              />
              <SummaryRow label="País de residencia" value="Bolivia" />
              <SummaryRow label="Estado" value={remitterForm.state || "—"} />
              <SummaryRow label="Ciudad" value={remitterForm.city || "—"} />
              <SummaryRow
                label="Dirección"
                value={remitterForm.address || "—"}
              />
              <SummaryRow
                label="Número de teléfono"
                value={remitterForm.phone || "—"}
              />
            </>
          ) : provider === "TERRAPAY" ? (
            <>
              <SummaryRow
                label="Tipo de documento"
                value={remitterForm.documentType || "—"}
              />
              <SummaryRow
                label="Número de documento"
                value={documentNumber || "—"}
              />
              <SummaryRow
                label="País de emisión"
                value={remitterForm.documentIssueCountry || "—"}
              />
              <SummaryRow
                label="Fecha de emisión"
                value={remitterForm.documentIssueDate || "—"}
              />
              <SummaryRow
                label="Fecha de vencimiento"
                value={remitterForm.documentExpiryDate || "—"}
              />
              <SummaryRow
                label="Nombre"
                value={remitterForm.firstName || "—"}
                emphasis
              />
              <SummaryRow
                label="Segundo nombre"
                value={remitterForm.middleName || "—"}
              />
              <SummaryRow
                label="Primer apellido"
                value={remitterForm.lastName || "—"}
              />
              <SummaryRow
                label="Segundo apellido"
                value={remitterForm.secondLastName || "—"}
              />
              <SummaryRow
                label="Fecha de nacimiento"
                value={remitterForm.birthDate || "—"}
              />
              <SummaryRow
                label="País de nacimiento"
                value={remitterForm.birthCountry || "—"}
              />
              <SummaryRow
                label="Nacionalidad"
                value={remitterForm.nationality || "—"}
              />
              <SummaryRow label="Género" value={remitterForm.gender || "—"} />
              <SummaryRow
                label="Estado civil"
                value={remitterForm.civilStatus || "—"}
              />
              {remitterForm.civilStatus === "Casado" && (
                <SummaryRow
                  label="Nombre del cónyuge"
                  value={remitterForm.spouseName || "—"}
                />
              )}
              <SummaryRow
                label="Correo electrónico"
                value={remitterForm.email || "—"}
              />
              <SummaryRow label="Calle" value={remitterForm.street || "—"} />
              <SummaryRow
                label="Nro. casa"
                value={remitterForm.houseNumber || "—"}
              />
              <SummaryRow
                label="Dirección 2"
                value={remitterForm.address2 || "—"}
              />
              <SummaryRow label="Zona" value={remitterForm.zone || "—"} />
              <SummaryRow
                label="Código postal"
                value={remitterForm.postalCode || "—"}
              />
              <SummaryRow label="País" value="Bolivia" />
              <SummaryRow
                label="Departamento / Estado"
                value={remitterForm.state || "—"}
              />
              <SummaryRow label="Ciudad" value={remitterForm.city || "—"} />
              <SummaryRow label="Teléfono" value={remitterForm.phone || "—"} />
              <SummaryRow label="Móvil" value={remitterForm.mobile || "—"} />
            </>
          ) : (
            <>
              <SummaryRow
                label="Tipo de documento"
                value={remitterForm.documentType || "—"}
              />
              <SummaryRow
                label="Número de documento"
                value={documentNumber || "—"}
              />
              <SummaryRow
                label="País de emisión"
                value={remitterForm.documentIssueCountry || "—"}
              />
              <SummaryRow
                label="Fecha de emisión"
                value={remitterForm.documentIssueDate || "—"}
              />
              <SummaryRow
                label="Fecha de vencimiento"
                value={remitterForm.documentExpiryDate || "—"}
              />
              <SummaryRow
                label="Nombre"
                value={remitterForm.firstName || "—"}
                emphasis
              />
              <SummaryRow
                label="Segundo nombre"
                value={remitterForm.middleName || "—"}
              />
              <SummaryRow
                label="Primer apellido"
                value={remitterForm.lastName || "—"}
              />
              <SummaryRow
                label="Segundo apellido"
                value={remitterForm.secondLastName || "—"}
              />
              <SummaryRow
                label="Fecha de nacimiento"
                value={remitterForm.birthDate || "—"}
              />
              <SummaryRow
                label="País de nacimiento"
                value={remitterForm.birthCountry || "—"}
              />
              <SummaryRow
                label="Nacionalidad"
                value={remitterForm.nationality || "—"}
              />
              <SummaryRow label="Género" value={remitterForm.gender || "—"} />
              <SummaryRow
                label="Correo electrónico"
                value={remitterForm.email || "—"}
              />
              <SummaryRow label="Calle" value={remitterForm.street || "—"} />
              <SummaryRow
                label="Dirección"
                value={remitterForm.address || "—"}
              />
              <SummaryRow label="País" value="Bolivia" />
              <SummaryRow
                label="Departamento / Estado"
                value={remitterForm.state || "—"}
              />
              <SummaryRow label="Ciudad" value={remitterForm.city || "—"} />
              <SummaryRow label="Teléfono" value={remitterForm.phone || "—"} />
              <SummaryRow label="Móvil" value={remitterForm.mobile || "—"} />
            </>
          )}
        </SummarySection>
        <SummarySection
          title="Beneficiario"
          tone="beneficiary"
          onEdit={onEditBeneficiary}
          editLabel={onEditBeneficiary ? "Editar beneficiario" : undefined}
        >
          {provider === "MONEYGRAM" ? (
            <>
              <SummaryRow
                label="Compañía"
                value={moneygramAccountForm.company || "—"}
                emphasis
              />
              <SummaryRow
                label="Nro de cuenta"
                value={moneygramAccountForm.accountNumber || "—"}
              />
              <SummaryRow
                label="Codigo de Localidad"
                value={moneygramAccountForm.locationCode || "—"}
              />
              <SummaryRow
                label="Referencia"
                value={moneygramAccountForm.reference || "—"}
              />
              <SummaryRow
                label="Atención"
                value={moneygramAccountForm.attention || "—"}
              />
              <SummaryRow
                label="Calle/Numero"
                value={moneygramAccountForm.street || "—"}
              />
              <SummaryRow
                label="Dirección"
                value={moneygramAccountForm.address || "—"}
              />
              <SummaryRow
                label="Estado"
                value={moneygramAccountForm.state || "—"}
              />
              <SummaryRow
                label="Ciudad"
                value={moneygramAccountForm.city || "—"}
              />
              <SummaryRow
                label="Nro. Teléfono"
                value={moneygramAccountForm.phone || "—"}
              />
            </>
          ) : provider === "RIA" ? (
            <>
              <SummaryRow
                label="Nombre"
                value={beneficiaryForm.firstName || "—"}
                emphasis
              />
              <SummaryRow
                label="Segundo Nombre"
                value={beneficiaryForm.middleName || "—"}
              />
              <SummaryRow
                label="Primer Apellido"
                value={beneficiaryForm.lastName || "—"}
              />
              <SummaryRow
                label="Segundo Apellido"
                value={beneficiaryForm.secondLastName || "—"}
              />
              <SummaryRow
                label="Correo electrónico"
                value={beneficiaryForm.email || "—"}
              />
              <SummaryRow
                label="Nacionalidad"
                value={beneficiaryForm.nationality || "—"}
              />
              <SummaryRow label="País Residencia" value="Bolivia" />
              <SummaryRow
                label="Calle/Numero"
                value={beneficiaryForm.street || "—"}
              />
              <SummaryRow
                label="Dirección"
                value={beneficiaryForm.address || "—"}
              />
              <SummaryRow label="Estado" value={beneficiaryForm.state || "—"} />
              <SummaryRow label="Ciudad" value={beneficiaryForm.city || "—"} />
              <SummaryRow
                label="Nro. Teléfono"
                value={beneficiaryForm.phone || "—"}
              />
            </>
          ) : provider === "TERRAPAY" ? (
            <>
              <SummaryRow
                label="Nombre"
                value={beneficiaryForm.firstName || "—"}
                emphasis
              />
              <SummaryRow
                label="Primer Apellido"
                value={beneficiaryForm.lastName || "—"}
              />
              <SummaryRow label="Tipo ID beneficiario" value="Cédula" />
              <SummaryRow
                label="Nro. ID beneficiario"
                value={beneficiaryForm.document || "—"}
              />
              <SummaryRow
                label="Nacionalidad"
                value={beneficiaryForm.nationality || "—"}
              />
              <SummaryRow label="Código Postal" value="0000" />
              <SummaryRow label="Cód. Móvil" value="+591" />
              <SummaryRow
                label="Nro. Teléfono"
                value={beneficiaryForm.phone || "—"}
              />
              <SummaryRow
                label="Calle/Numero"
                value={beneficiaryForm.street || "—"}
              />
              <SummaryRow
                label="Dirección"
                value={beneficiaryForm.address || "—"}
              />
              <SummaryRow label="Estado" value={beneficiaryForm.state || "—"} />
              <SummaryRow label="Ciudad" value={beneficiaryForm.city || "—"} />
            </>
          ) : (
            <>
              <SummaryRow
                label="Nombre"
                value={beneficiaryForm.firstName || "—"}
                emphasis
              />
              <SummaryRow
                label="Segundo Nombre"
                value={beneficiaryForm.middleName || "—"}
              />
              <SummaryRow
                label="Primer Apellido"
                value={beneficiaryForm.lastName || "—"}
              />
              <SummaryRow
                label="Segundo Apellido"
                value={beneficiaryForm.secondLastName || "—"}
              />
              <SummaryRow label="Estado" value={beneficiaryForm.state || "—"} />
              <SummaryRow label="Ciudad" value={beneficiaryForm.city || "—"} />
              <SummaryRow
                label="Calle/Numero"
                value={beneficiaryForm.street || "—"}
              />
              <SummaryRow
                label="Dirección"
                value={beneficiaryForm.address || "—"}
              />
              <SummaryRow
                label="Nro. Teléfono"
                value={beneficiaryForm.phone || "—"}
              />
            </>
          )}
        </SummarySection>
        <div className="flex flex-col gap-4">
          <SummarySection
            title="Datos de envío"
            onEdit={onEditQuote}
            editLabel="Editar cotización"
            highlight
          >
            <SummaryRow
              label="Tipo de envío"
              value={deliveryTypeLabel(quote.deliveryType)}
            />
            <SummaryRow label="Proveedor" value={provider} />
            <SummaryRow label="Destino" value={destinationCountry || "—"} />
            {provider === "TERRAPAY" && quote.deliveryType === "BANK" && (
              <SummaryRow label="Banco" value={terraPayBank || "—"} />
            )}
            {provider === "TERRAPAY" && quote.deliveryType === "WALLET" && (
              <SummaryRow label="Wallet" value={terraPayWallet || "—"} />
            )}
            <SummaryRow
              label="Monto a enviar"
              value={formatUsd(quote.amount)}
            />
            <SummaryRow label="Cargo" value={formatUsd(quote.fee)} />
            <SummaryRow label="IVA" value={formatUsd(quote.tax)} />
            {provider === "TERRAPAY" && (
              <SummaryRow label="ITF" value={formatUsd(quote.itf)} />
            )}
            {quote.promotion && (
              <SummaryRow
                label={`Descuento (${quote.promotion.code})`}
                value={`−${formatUsd(quote.promotion.discount)}`}
              />
            )}
            <SummaryRow
              label="Recibe el beneficiario"
              value={formatUsd(quoteAmountReceived(quote))}
              accent
            />
            <SummaryRow
              label="Total a cobrar"
              value={formatUsd(totalToCharge)}
            />
          </SummarySection>
          <SummarySection
            title="Pago y facturación"
            onEdit={onEditPayment}
            editLabel="Editar pago"
          >
            {paymentLines.map((line) => (
              <SummaryRow
                key={line.id}
                label={line.method || "Método de pago"}
                value={
                  line.currency === "USD"
                    ? formatUsd(line.amount)
                    : `${formatAmount(line.amount)} BOB (${formatUsd(line.usdCents / 100)})`
                }
              />
            ))}
            <SummaryRow
              label="Total cobrado"
              value={formatUsd(totalToCharge)}
            />
            <SummaryRow
              label="Facturar a"
              value={`${billingName || "—"} · ${billingNit || "—"}`}
            />
          </SummarySection>
          <ComplianceSummaryCard
            additionalInfoMarked={additionalInfoMarked}
            suspiciousMarked={suspiciousMarked}
            additionalInfo={additionalInfo}
            additionalInfoRequired={additionalInfoRequired}
            additionalInfoError={additionalInfoError}
            onAdditionalInfoMarkedChange={onAdditionalInfoMarkedChange}
            onEditAdditionalInfo={onEditAdditionalInfo}
            onSuspiciousMarkedChange={onSuspiciousMarkedChange}
            onEditSuspicious={onEditSuspicious}
          />
        </div>
      </div>
    </div>
  );
}
