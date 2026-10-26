"use client";

import { useRef } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import economicActivitiesCatalog from "@/public/catalogs/catalog-economic-activities.json";
import foundSourcesCatalog from "@/public/catalogs/catalog-found-sources.json";
import maritalStatusCatalog from "@/public/catalogs/catalog-marital-status.json";
import monthlyIncomesCatalog from "@/public/catalogs/catalog-montly-incomes.json";
import occupationsCatalog from "@/public/catalogs/catalog-ocupations.json";
import transactionPurposesCatalog from "@/public/catalogs/catalog-transaction-purposes.json";
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
const OCCUPATION_OPTIONS = occupationsCatalog.result.items.map(
  (item) => item.occupation.description,
);
const ECONOMIC_ACTIVITY_OPTIONS = economicActivitiesCatalog.result.items.map(
  (item) => item.economicActivity.description,
);
const TRANSACTION_PURPOSE_OPTIONS = transactionPurposesCatalog.result.items.map(
  (item) => item.transactionPurpose.description,
);
const MONTHLY_INCOME_OPTIONS = monthlyIncomesCatalog.result.items.map(
  (item) => item.montlyIncome.description,
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
  const occupationRef = useRef<HTMLButtonElement>(null);
  const economicActivityRef = useRef<HTMLButtonElement>(null);
  const fundsOriginRef = useRef<HTMLButtonElement>(null);
  const resourceDestinationRef = useRef<HTMLInputElement>(null);
  const transactionPurposeRef = useRef<HTMLButtonElement>(null);
  const civilStatusRef = useRef<HTMLButtonElement>(null);
  const monthlyIncomeRef = useRef<HTMLButtonElement>(null);
  const showSpouseName = form.civilStatus === MARRIED_CIVIL_STATUS;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SearchableSelect
        fieldRef={occupationRef}
        label="Ocupación"
        value={form.occupation}
        options={OCCUPATION_OPTIONS}
        required
        clearable
        onChange={(value) => onChange("occupation", value)}
      />
      <SearchableSelect
        fieldRef={economicActivityRef}
        label="Actividad Económica"
        value={form.economicActivity}
        options={ECONOMIC_ACTIVITY_OPTIONS}
        required
        clearable
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
        inputRef={resourceDestinationRef}
        label="Destino recursos"
        value={form.resourceDestination}
        required
        clearable
        maxLength={50}
        onChange={(value) => onChange("resourceDestination", value)}
      />
      <SearchableSelect
        fieldRef={transactionPurposeRef}
        label="Propósito Transacción"
        value={form.transactionPurpose}
        options={TRANSACTION_PURPOSE_OPTIONS}
        required
        clearable
        onChange={(value) => onChange("transactionPurpose", value)}
      />
      <SearchableSelect
        fieldRef={civilStatusRef}
        label="Estado Civil"
        value={form.civilStatus}
        options={CIVIL_STATUS_OPTIONS}
        required
        clearable
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
      <SearchableSelect
        fieldRef={monthlyIncomeRef}
        label="Ingreso Mensual"
        value={form.monthlyIncome}
        options={MONTHLY_INCOME_OPTIONS}
        required
        clearable
        onChange={(value) => onChange("monthlyIncome", value)}
      />
    </div>
  );
}
