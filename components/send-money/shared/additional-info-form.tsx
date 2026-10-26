"use client";

import { useRef } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import foundSourcesCatalog from "@/public/catalogs/catalog-found-sources.json";
import maritalStatusCatalog from "@/public/catalogs/catalog-marital-status.json";
import { Field } from "../field";

export const ADDITIONAL_INFO_CHECK_LABEL = "Información adicional";

/** Same GAFI high-risk ISO list used by RIAAppService.IsGafiHighRiskCountry. */
const GAFI_HIGH_RISK_ISO_CODES = new Set([
  "DZ",
  "AO",
  "BG",
  "CM",
  "CI",
  "CD",
  "HT",
  "KE",
  "KW",
  "LA",
  "LB",
  "MC",
  "NA",
  "NP",
  "PG",
  "SS",
  "SY",
  "VE",
  "VN",
  "VG",
  "YE",
]);

export const GAFI_HIGH_RISK_COUNTRY_MESSAGE =
  "El país destino es considerado de alto riesgo. Se requiere información adicional.";

export type AdditionalInfoFormState = {
  occupation: string;
  economicActivity: string;
  fundsOrigin: string;
  resourceDestination: string;
  transactionPurpose: string;
  civilStatus: string;
  spouseName: string;
  monthlyIncome: string;
};

export const EMPTY_ADDITIONAL_INFO_FORM: AdditionalInfoFormState = {
  occupation: "",
  economicActivity: "",
  fundsOrigin: "",
  resourceDestination: "",
  transactionPurpose: "",
  civilStatus: "",
  spouseName: "",
  monthlyIncome: "",
};

export function isGafiHighRiskDestination(countryName: string): boolean {
  const trimmed = countryName.trim();
  if (trimmed === "") return false;
  for (const item of countriesCatalog.items) {
    if (item.country.ctyName !== trimmed) continue;
    return GAFI_HIGH_RISK_ISO_CODES.has(item.country.ctyIsoCode);
  }
  return false;
}

export function isAdditionalInfoFormComplete(
  form: AdditionalInfoFormState,
): boolean {
  if (form.occupation.trim() === "") return false;
  if (form.economicActivity.trim() === "") return false;
  if (form.fundsOrigin.trim() === "") return false;
  if (form.resourceDestination.trim() === "") return false;
  if (form.transactionPurpose.trim() === "") return false;
  if (form.civilStatus.trim() === "") return false;
  if (form.civilStatus === "Casado" && form.spouseName.trim() === "") {
    return false;
  }
  if (form.monthlyIncome.trim() === "") return false;
  return true;
}

const CIVIL_STATUS_OPTIONS = maritalStatusCatalog.items.map(
  (item) => item.maritalStatus.description,
);
const FUNDS_ORIGIN_OPTIONS = foundSourcesCatalog.result.items.map(
  (item) => item.foundSource.description,
);
const MARRIED_CIVIL_STATUS = "Casado";

export type AdditionalInfoFormChangeHandler = (
  field: keyof AdditionalInfoFormState,
  value: string,
) => void;

export function AdditionalInfoForm({
  form,
  onChange,
}: {
  form: AdditionalInfoFormState;
  onChange: AdditionalInfoFormChangeHandler;
}) {
  const civilStatusRef = useRef<HTMLButtonElement>(null);
  const fundsOriginRef = useRef<HTMLButtonElement>(null);
  const showSpouseName = form.civilStatus === MARRIED_CIVIL_STATUS;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label="Ocupación"
        value={form.occupation}
        required
        onChange={(value) => onChange("occupation", value)}
      />
      <Field
        label="Actividad Económica"
        value={form.economicActivity}
        required
        onChange={(value) => onChange("economicActivity", value)}
      />
      <SearchableSelect
        fieldRef={fundsOriginRef}
        label="Origen de los Fondos"
        value={form.fundsOrigin}
        options={FUNDS_ORIGIN_OPTIONS}
        required
        clearable
        onChange={(value) => onChange("fundsOrigin", value)}
      />
      <Field
        label="Destino recursos"
        value={form.resourceDestination}
        required
        maxLength={50}
        onChange={(value) => onChange("resourceDestination", value)}
      />
      <Field
        label="Propósito Transacción"
        value={form.transactionPurpose}
        required
        onChange={(value) => onChange("transactionPurpose", value)}
      />
      <SearchableSelect
        fieldRef={civilStatusRef}
        label="Estado Civil"
        value={form.civilStatus}
        options={CIVIL_STATUS_OPTIONS}
        required
        onChange={(value) => {
          onChange("civilStatus", value);
          if (value !== MARRIED_CIVIL_STATUS) {
            onChange("spouseName", "");
          }
        }}
      />
      {showSpouseName && (
        <Field
          label="Nombre(s) y Apellidos del cónyuge"
          value={form.spouseName}
          required
          onChange={(value) => onChange("spouseName", value)}
        />
      )}
      <Field
        label="Ingreso Mensual"
        value={form.monthlyIncome}
        required
        onChange={(value) => onChange("monthlyIncome", value)}
      />
    </div>
  );
}
