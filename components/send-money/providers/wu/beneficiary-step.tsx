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
          label="Nro. de Documento"
          value={form.document}
          required
          numericOnly
          onChange={(value) => onFormChange("document", value)}
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
          label="Nro. Teléfono"
          value={form.phone}
          required
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
        />
      </div>
    </div>
  );
}
