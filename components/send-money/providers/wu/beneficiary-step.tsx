"use client";

import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import { Field } from "../../field";

export type BeneficiaryFormChangeHandler = (
  field: keyof BeneficiaryRegistrationDraft,
  value: string,
) => void;

export function WuBeneficiaryStep({
  form,
  onFormChange,
  destinationCountry,
}: {
  form: BeneficiaryRegistrationDraft;
  onFormChange: BeneficiaryFormChangeHandler;
  destinationCountry: string;
}) {
  let stateCityRequired = false;
  if (
    destinationCountry === "Mexico" ||
    destinationCountry === "United States" ||
    destinationCountry === "Canada"
  ) {
    stateCityRequired = true;
  }

  return (
    <div data-beneficiary-form className="space-y-6">
      <h2 className="font-bold">Datos del beneficiario</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Nombre"
          value={form.firstName}
          required
          onChange={(value) => onFormChange("firstName", value)}
        />
        <Field
          label="Segundo Nombre"
          value={form.middleName}
          onChange={(value) => onFormChange("middleName", value)}
        />
        <Field
          label="Primer Apellido"
          value={form.lastName}
          required
          onChange={(value) => onFormChange("lastName", value)}
        />
        <Field
          label="Segundo Apellido"
          value={form.secondLastName}
          onChange={(value) => onFormChange("secondLastName", value)}
        />
        <Field
          label="Estado"
          value={form.state}
          required={stateCityRequired}
          onChange={(value) => onFormChange("state", value)}
        />
        <Field
          label="Ciudad"
          value={form.city}
          required={stateCityRequired}
          onChange={(value) => onFormChange("city", value)}
        />
        <Field
          label="Calle/Numero"
          value={form.street}
          onChange={(value) => onFormChange("street", value)}
        />
        <Field
          label="Dirección"
          value={form.address}
          onChange={(value) => onFormChange("address", value)}
        />
        <Field
          label="Nro. Teléfono"
          value={form.phone}
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
        />
      </div>
    </div>
  );
}
