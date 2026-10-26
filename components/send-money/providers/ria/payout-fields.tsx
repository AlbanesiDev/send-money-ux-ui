"use client";

import { useRef, type RefObject } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { riaLocationOptions, riaPartnerOptions } from "./payout-network";

const REQUIRED_MESSAGE = "Este campo es requerido";

/** Socio pagador + locación: RIA no cotiza sin ambos. */
export function RiaPayoutFields({
  countryIso,
  payingPartner,
  location,
  onPayingPartnerChange,
  onLocationChange,
  showErrors,
  partnerRef,
  disabled,
}: {
  countryIso: string | undefined;
  payingPartner: string;
  location: string;
  onPayingPartnerChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  showErrors: boolean;
  partnerRef: RefObject<HTMLButtonElement | null>;
  disabled: boolean;
}) {
  const locationRef = useRef<HTMLButtonElement>(null);
  const partnerOptions = riaPartnerOptions(countryIso);

  if (partnerOptions.length === 0) {
    return (
      <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        No hay socios pagadores de RIA cargados para este país.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <SearchableSelect
        label="Socio pagador"
        value={payingPartner}
        options={partnerOptions}
        fieldRef={partnerRef}
        nextRef={locationRef}
        menuMinWidth={320}
        filterPlaceholder="Buscá por nombre, provincia o ciudad"
        disabled={disabled}
        error={showErrors && payingPartner === "" ? REQUIRED_MESSAGE : ""}
        onChange={(value) => {
          if (value === payingPartner) return;
          onPayingPartnerChange(value);
          onLocationChange("");
        }}
      />
      <SearchableSelect
        label="Locación"
        value={location}
        options={riaLocationOptions(countryIso, payingPartner)}
        fieldRef={locationRef}
        menuMinWidth={320}
        disabled={disabled || payingPartner === ""}
        error={
          showErrors && payingPartner !== "" && location === ""
            ? REQUIRED_MESSAGE
            : ""
        }
        onChange={onLocationChange}
      />
    </div>
  );
}
