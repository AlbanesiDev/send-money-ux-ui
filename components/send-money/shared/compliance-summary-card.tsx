"use client";

import { useRef } from "react";
import { FlagIcon, ShieldAlertIcon } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import foundSourcesCatalog from "@/public/catalogs/catalog-found-sources.json";
import { Field } from "../field";
import type { AdditionalInfoFormState } from "./additional-info-form";

const FUNDS_ORIGIN_OPTIONS = foundSourcesCatalog.result.items.map(
  (item) => item.foundSource.description,
);

export function ComplianceSummaryCard({
  fundsOrigin,
  resourceDestination,
  onFundsOriginChange,
  onResourceDestinationChange,
  additionalInfoMarked,
  suspiciousMarked,
  additionalInfo,
  additionalInfoRequired = false,
  additionalInfoError = "",
  showEditAdditionalInfo = false,
  onEditAdditionalInfo,
  onSuspiciousMarkedChange,
  onEditSuspicious,
}: {
  fundsOrigin: string;
  resourceDestination: string;
  onFundsOriginChange: (value: string) => void;
  onResourceDestinationChange: (value: string) => void;
  additionalInfoMarked: boolean;
  suspiciousMarked: boolean;
  additionalInfo: AdditionalInfoFormState;
  additionalInfoRequired?: boolean;
  additionalInfoError?: string;
  showEditAdditionalInfo?: boolean;
  onEditAdditionalInfo: () => void;
  onSuspiciousMarkedChange: (marked: boolean) => void;
  onEditSuspicious: () => void;
}) {
  const fundsOriginRef = useRef<HTMLButtonElement>(null);
  const resourceDestinationRef = useRef<HTMLInputElement>(null);

  return (
    <section className="shrink-0 rounded-lg border border-border border-l-4 border-l-brand bg-card px-3.5 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground">
          Declaraciones de cumplimiento
        </h2>
        {showEditAdditionalInfo && (
          <button
            type="button"
            onClick={onEditAdditionalInfo}
            aria-label="Editar información adicional"
            className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-brand-strong hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
          >
            Editar
          </button>
        )}
      </div>

      {additionalInfoRequired && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-warning-border bg-warning-soft px-2.5 py-2 text-warning-foreground">
          <ShieldAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">
              El país destino es considerado de alto riesgo.
            </p>
          </div>
        </div>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <SearchableSelect
          fieldRef={fundsOriginRef}
          label="Origen de los Fondos"
          value={fundsOrigin}
          options={FUNDS_ORIGIN_OPTIONS}
          required={additionalInfoRequired}
          clearable
          onChange={onFundsOriginChange}
        />
        <Field
          inputRef={resourceDestinationRef}
          label="Destino recursos"
          value={resourceDestination}
          required={additionalInfoRequired}
          clearable
          maxLength={50}
          onChange={onResourceDestinationChange}
        />
      </div>

      {additionalInfoError !== "" && (
        <p
          role="alert"
          className="mt-1.5 text-xs font-semibold text-destructive"
        >
          {additionalInfoError}
        </p>
      )}

      {additionalInfoMarked && (
        <dl className="mt-1.5 flex flex-col divide-y divide-border">
          <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
            <dt className="text-muted-foreground">Ocupación</dt>
            <dd className="text-right font-semibold text-foreground">
              {additionalInfo.occupation || "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
            <dt className="text-muted-foreground">Actividad económica</dt>
            <dd className="text-right font-semibold text-foreground">
              {additionalInfo.economicActivity || "—"}
            </dd>
          </div>
        </dl>
      )}

      {suspiciousMarked && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2">
          <p className="text-xs font-bold text-destructive">
            Transacción marcada como sospechosa o inusual
          </p>
          <button
            type="button"
            onClick={onEditSuspicious}
            className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            Editar
          </button>
        </div>
      )}

      {suspiciousMarked ? (
        <button
          type="button"
          onClick={() => onSuspiciousMarkedChange(false)}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-xs font-bold text-destructive hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
        >
          <FlagIcon className="size-3.5 shrink-0" aria-hidden="true" />
          Desmarcar transacción sospechosa o inusual
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSuspiciousMarkedChange(true)}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md border border-warning-border bg-warning-soft px-2.5 py-2 text-xs font-bold text-warning-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-border"
        >
          <FlagIcon className="size-3.5 shrink-0" aria-hidden="true" />
          Marcar transacción como sospechosa o inusual
        </button>
      )}
    </section>
  );
}
