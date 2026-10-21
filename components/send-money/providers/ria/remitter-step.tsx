"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import { CountryField } from "../../country-field";
import { Field } from "../../field";
import type { RemitterFormChangeHandler } from "../wu/remitter-step";

const DOCUMENT_TYPE_OPTIONS = documentTypesCatalog.map((item) => item.name);

export function RiaRemitterStep({
  documentNumber,
  form,
  onFormChange,
  onDocumentNumberChange,
  afterDocumentFields,
  footerSlot,
}: {
  documentNumber: string;
  form: CustomerRegistrationDraft;
  onFormChange: RemitterFormChangeHandler;
  onDocumentNumberChange?: (value: string) => void;
  afterDocumentFields?: ReactNode;
  footerSlot?: ReactNode;
}) {
  const documentTypeRef = useRef<HTMLButtonElement>(null);

  return (
    <div data-remitter-form className="space-y-6">
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
          label="Número de documento"
          value={documentNumber}
          required
          numericOnly
          maxLength={7}
          onChange={onDocumentNumberChange}
        />
      </div>
      {afterDocumentFields}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Nombre"
          value={form.firstName}
          required
          onChange={(value) => onFormChange("firstName", value)}
        />
        <Field
          label="Segundo nombre"
          value={form.middleName}
          onChange={(value) => onFormChange("middleName", value)}
        />
        <Field
          label="Primer apellido"
          value={form.lastName}
          required
          onChange={(value) => onFormChange("lastName", value)}
        />
        <Field
          label="Segundo apellido"
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
      </div>
      <h2 className="pt-4 font-bold">Datos de dirección</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <CountryField
          label="País de residencia"
          value="Bolivia"
          disabled
          required
          onChange={() => undefined}
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
          label="Dirección"
          value={form.address}
          required
          onChange={(value) => onFormChange("address", value)}
        />
        <Field
          label="Número de teléfono"
          value={form.phone}
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
        />
      </div>
      {footerSlot}
    </div>
  );
}
