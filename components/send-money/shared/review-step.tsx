import type { ReactNode } from "react";
import { deliveryTypeLabel } from "../provider-flows";
import type { Beneficiary, ProviderId, ProviderQuote } from "../types";

function SummarySection({
  title,
  editLabel,
  onEdit,
  highlight = false,
  children,
}: {
  title: string;
  editLabel: string;
  onEdit: () => void;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border p-5 ${highlight ? "border-[#c9d2f2] bg-[#f6f8ff]" : "border-[#dce3ee] bg-[#fbfcfe]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-[#1f2a44]">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className="rounded-md px-2 py-1 text-sm font-semibold text-[#465bc2] hover:bg-[#eef1fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#465bc2]"
        >
          Editar
        </button>
      </div>
      <dl className="mt-4 flex flex-col divide-y divide-[#e6ebf3]">
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
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
      <dt className="text-[#687790]">{label}</dt>
      <dd
        className={`text-right ${emphasis ? "text-base font-bold text-[#1f2a44]" : "font-semibold text-[#263653]"}`}
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
  qpayCompany,
  terraPayBank,
  terraPayWallet,
  isKnownClient,
  beneficiary,
  senderName,
  documentNumber,
  paymentMethod,
  receivedValue,
  changeDue,
  billingName,
  billingNit,
  onEditQuote,
  onEditRemitter,
  onEditBeneficiary,
  onEditPayment,
}: {
  provider: ProviderId;
  quote: ProviderQuote;
  totalToCharge: number;
  formatUsd: (value: number) => string;
  destinationCountry: string;
  payingPartner: string;
  location: string;
  wuService: string;
  qpayCompany: string;
  terraPayBank: string;
  terraPayWallet: string;
  isKnownClient: boolean;
  beneficiary: Beneficiary;
  senderName: string;
  documentNumber: string;
  paymentMethod: string;
  receivedValue: number;
  changeDue: number;
  billingName: string;
  billingNit: string;
  onEditQuote: () => void;
  onEditRemitter: () => void;
  onEditBeneficiary: () => void;
  onEditPayment: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg bg-[#fffaf0] p-4 text-sm text-[#765d12]">
        Confirma con el cliente el monto, el beneficiario y el lugar de pago
        antes de enviar. Proveedor: {provider}.
      </p>
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
        {(provider === "WU" || provider === "QPAY") && (
          <SummaryRow label="Servicio de envío" value={wuService || "—"} />
        )}
        {provider === "QPAY" && (
          <SummaryRow label="Compañía" value={qpayCompany || "—"} />
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
      <SummarySection
        title="Beneficiario"
        onEdit={onEditBeneficiary}
        editLabel="Editar beneficiario"
      >
        {provider === "QPAY" ? (
          <>
            <SummaryRow label="Compañía" value="Sol & Luna Pagos" emphasis />
            <SummaryRow label="Cuenta" value="001234567890" />
            <SummaryRow label="Referencia" value="REF-77821" />
          </>
        ) : (
          <>
            <SummaryRow
              label="Nombre"
              value={isKnownClient ? beneficiary.name : "Nuevo beneficiario"}
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
      <div className="grid gap-5 lg:grid-cols-2">
        <SummarySection
          title="Remitente"
          onEdit={onEditRemitter}
          editLabel="Editar remitente"
        >
          <SummaryRow label="Nombre" value={senderName || "Nuevo remitente"} />
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
              <SummaryRow label="Método de pago" value={paymentMethod || "—"} />
              <SummaryRow
                label="Monto recibido"
                value={formatUsd(receivedValue)}
              />
              <SummaryRow label="Vuelto" value={formatUsd(changeDue)} />
            </>
          )}
          <SummaryRow
            label="Facturar a"
            value={`${billingName || "—"} · ${billingNit || "—"}`}
          />
        </SummarySection>
      </div>
    </div>
  );
}
