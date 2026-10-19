import type { ReactNode } from "react";
import { deliveryTypeLabel } from "../provider-flows";
import type {
  Beneficiary,
  PaymentLine,
  ProviderId,
  ProviderQuote,
} from "../types";

function SummarySection({
  title,
  editLabel,
  onEdit,
  highlight = false,
  children,
}: {
  title: string;
  editLabel?: string;
  onEdit?: () => void;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-lg border px-3.5 py-2.5 ${highlight ? "border-brand/40 bg-accent" : "border-border bg-muted"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {onEdit && editLabel && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={editLabel}
            className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-brand-strong hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
          >
            Editar
          </button>
        )}
      </div>
      <dl className="mt-1.5 flex flex-col divide-y divide-border">
        {children}
      </dl>
    </section>
  );
}

function SummaryRow({
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
        {value}
      </dd>
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
  isKnownClient,
  beneficiary,
  senderName,
  documentNumber,
  paymentLines,
  formatAmount,
  billingName,
  billingNit,
  onEditQuote,
  onEditRemitter,
  onEditBeneficiary,
  onEditPayment,
  billingSlot,
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
  isKnownClient: boolean;
  beneficiary: Beneficiary;
  senderName: string;
  documentNumber: string;
  paymentLines: PaymentLine[];
  formatAmount: (value: number) => string;
  billingName: string;
  billingNit: string;
  onEditQuote: () => void;
  onEditRemitter?: () => void;
  onEditBeneficiary?: () => void;
  onEditPayment: () => void;
  billingSlot: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-[#eadcae] bg-[#fffaf0] px-3 py-2 text-xs text-[#765d12] dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
        Confirma con el cliente el monto, el beneficiario y el lugar de pago
        antes de enviar.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        <SummarySection
          title="Confirmar con el cliente"
          onEdit={onEditQuote}
          editLabel="Editar cotización"
          highlight
        >
          <SummaryRow label="Proveedor" value={provider} />
          <SummaryRow
            label="Tipo de envío"
            value={deliveryTypeLabel(quote.deliveryType)}
          />
          <SummaryRow label="Destino" value={destinationCountry || "—"} />
          {provider === "RIA" && (
            <>
              <SummaryRow label="Socio pagador" value={payingPartner || "—"} />
              <SummaryRow label="Locación" value={location || "—"} />
            </>
          )}
          {(provider === "WU" || provider === "MONEYGRAM") && (
            <SummaryRow label="Servicio de envío" value={wuService || "—"} />
          )}
          {provider === "MONEYGRAM" && (
            <SummaryRow label="Compañía" value={moneygramCompany || "—"} />
          )}
          {provider === "TERRAPAY" && quote.deliveryType === "BANK" && (
            <SummaryRow label="Banco" value={terraPayBank || "—"} />
          )}
          {provider === "TERRAPAY" && quote.deliveryType === "WALLET" && (
            <SummaryRow label="Wallet" value={terraPayWallet || "—"} />
          )}
          <SummaryRow label="Monto a enviar" value={formatUsd(quote.amount)} />
          <SummaryRow label="Cargo" value={formatUsd(quote.fee)} />
          <SummaryRow label="IVA" value={formatUsd(quote.tax)} />
          <SummaryRow
            label="Total a cobrar"
            value={formatUsd(totalToCharge)}
            emphasis
          />
        </SummarySection>
        <div className="flex flex-col gap-3">
          <SummarySection
            title="Beneficiario"
            onEdit={onEditBeneficiary}
            editLabel={onEditBeneficiary ? "Editar beneficiario" : undefined}
          >
            {provider === "MONEYGRAM" ? (
              <>
                <SummaryRow
                  label="Compañía"
                  value="Sol & Luna Pagos"
                  emphasis
                />
                <SummaryRow label="Cuenta" value="001234567890" />
                <SummaryRow label="Referencia" value="REF-77821" />
              </>
            ) : (
              <>
                <SummaryRow
                  label="Nombre"
                  value={
                    isKnownClient ? beneficiary.name : "Nuevo beneficiario"
                  }
                  emphasis
                />
                <SummaryRow
                  label="Documento"
                  value={isKnownClient ? beneficiary.document : "—"}
                />
                <SummaryRow
                  label="Teléfono"
                  value={isKnownClient ? beneficiary.phone : "—"}
                />
              </>
            )}
          </SummarySection>
          <SummarySection
            title="Remitente"
            onEdit={onEditRemitter}
            editLabel={onEditRemitter ? "Editar remitente" : undefined}
          >
            <SummaryRow
              label="Nombre"
              value={senderName || "Nuevo remitente"}
            />
            <SummaryRow label="Documento" value={`Cédula ${documentNumber}`} />
          </SummarySection>
          <SummarySection
            title="Pago y facturación"
            onEdit={onEditPayment}
            editLabel="Editar pago"
          >
            {provider === "TERRAPAY" ? (
              <>
                <SummaryRow label="Casa de Cambio" value="Casa Central" />
                <SummaryRow label="Total" value={formatUsd(totalToCharge)} />
              </>
            ) : (
              <>
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
              </>
            )}
            <SummaryRow
              label="Facturar a"
              value={`${billingName || "—"} · ${billingNit || "—"}`}
            />
          </SummarySection>
        </div>
      </div>
      {billingSlot}
    </div>
  );
}
