"use client";

import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import { CountryField } from "../../country-field";
import { Field } from "../../field";
import type { BeneficiaryFormChangeHandler } from "../wu/beneficiary-step";

export function RiaBeneficiaryStep({
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

  let streetRequired = false;
  if (destinationCountry === "Paraguay") {
    streetRequired = true;
  }

  return (
    <div data-beneficiary-form className="space-y-6">
      <h2 className="font-bold">Datos personales</h2>
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
          label="Correo electrónico"
          value={form.email}
          required
          email
          onChange={(value) => onFormChange("email", value)}
        />
        <CountryField
          label="Nacionalidad"
          value={form.nationality}
          required
          onChange={(value) => onFormChange("nationality", value)}
        />
        <CountryField
          label="País Residencia"
          value="Bolivia"
          disabled
          required
          onChange={() => undefined}
        />
      </div>
      <h2 className="pt-4 font-bold">Datos de dirección</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Calle/Numero"
          value={form.street}
          required={streetRequired}
          onChange={(value) => onFormChange("street", value)}
        />
        <Field
          label="Dirección"
          value={form.address}
          onChange={(value) => onFormChange("address", value)}
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
          label="Nro. Teléfono"
          value={form.phone}
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
        />
      </div>
    </div>
  );
}
