"use client";

import { useRef } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import { CountryField } from "../../country-field";
import { Field } from "../../field";
import type { BeneficiaryFormChangeHandler } from "../wu/beneficiary-step";

const DOCUMENT_TYPE_OPTIONS = documentTypesCatalog.map((item) => item.name);

export function RiaBeneficiaryStep({
  form,
  onFormChange,
}: {
  form: BeneficiaryRegistrationDraft;
  onFormChange: BeneficiaryFormChangeHandler;
}) {
  const documentTypeRef = useRef<HTMLButtonElement>(null);

  return (
    <div data-beneficiary-form className="space-y-6">
      <h2 className="font-bold">Datos personales</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="block">
          <span className="mb-1 block text-sm font-semibold text-foreground">
            Tipo de documento <span className="text-destructive">*</span>
          </span>
          <SearchableSelect
            fieldRef={documentTypeRef}
            label="Tipo de documento"
            hideLabel
            value={form.documentType}
            options={DOCUMENT_TYPE_OPTIONS}
            required
            onChange={(value) => onFormChange("documentType", value)}
          />
        </div>
        <Field
          label="Nro. de Documento"
          value={form.document}
          required
          numericOnly
          onChange={(value) => onFormChange("document", value)}
        />
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
