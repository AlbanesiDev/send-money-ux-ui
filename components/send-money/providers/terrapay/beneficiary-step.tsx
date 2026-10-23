"use client";

import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import { Field } from "../../field";
import type { BeneficiaryFormChangeHandler } from "../wu/beneficiary-step";
import { CountryField } from "../../country-field";

export function TerrapayBeneficiaryStep({
  form,
  onFormChange,
}: {
  form: BeneficiaryRegistrationDraft;
  onFormChange: BeneficiaryFormChangeHandler;
}) {
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
          label="Primer Apellido"
          value={form.lastName}
          required
          onChange={(value) => onFormChange("lastName", value)}
        />
        <Field label="Tipo ID beneficiario" value="Cédula" disabled />
        <Field
          label="Nro. ID beneficiario"
          value={form.document}
          numericOnly
          onChange={(value) => onFormChange("document", value)}
        />
        <CountryField
          label="Nacionalidad"
          value={form.nationality}
          onChange={(value) => onFormChange("nationality", value)}
        />
        <Field label="Código Postal" value="0000" disabled />
        <Field label="Cód. Móvil" value="+591" disabled />
        <Field
          label="Nro. Teléfono"
          value={form.phone}
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
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
          label="Estado"
          value={form.state}
          onChange={(value) => onFormChange("state", value)}
        />
        <Field
          label="Ciudad"
          value={form.city}
          onChange={(value) => onFormChange("city", value)}
        />
      </div>
    </div>
  );
}
