"use client";

import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import { Field } from "../../field";
import type { BeneficiaryFormChangeHandler } from "../wu/beneficiary-step";

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
        <Field label="Tipo ID beneficiario" value="Cédula" disabled required />
        <Field
          label="Nro. ID beneficiario"
          value={form.document}
          required
          numericOnly
          onChange={(value) => onFormChange("document", value)}
        />
        <Field label="Nacionalidad" value="Boliviana" disabled />
        <Field label="Código Postal" value="0000" disabled />
        <Field label="Cód. Móvil" value="+591" disabled required />
        <Field
          label="Nro. Teléfono"
          value={form.phone}
          required
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
        />
        <Field
          label="Calle/Numero"
          value={form.street}
          required
          onChange={(value) => onFormChange("street", value)}
        />
        <Field
          label="Dirección"
          value={form.address}
          required
          onChange={(value) => onFormChange("address", value)}
        />
        <Field
          label="Estado"
          value={form.state}
          required
          onChange={(value) => onFormChange("state", value)}
        />
        <Field
          label="Ciudad"
          value={form.city}
          required
          onChange={(value) => onFormChange("city", value)}
        />
      </div>
    </div>
  );
}
