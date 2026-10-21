"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import { Field } from "../../field";

const DOCUMENT_TYPE_OPTIONS = documentTypesCatalog.map((item) => item.name);

export type RemitterFormChangeHandler = (
  field: keyof CustomerRegistrationDraft,
  value: string,
) => void;

export function WuRemitterStep({
  documentNumber,
  form,
  onFormChange,
  documentFieldsLocked = true,
  onDocumentNumberChange,
  afterDocumentFields,
  footerSlot,
}: {
  documentNumber: string;
  form: CustomerRegistrationDraft;
  onFormChange: RemitterFormChangeHandler;
  documentFieldsLocked?: boolean;
  onDocumentNumberChange?: (value: string) => void;
  afterDocumentFields?: ReactNode;
  footerSlot?: ReactNode;
}) {
  const documentTypeRef = useRef<HTMLButtonElement>(null);

  return (
    <div data-remitter-form className="space-y-6">
      <h2 className="font-bold">Documento de identidad</h2>
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
            disabled={documentFieldsLocked}
            required
            onChange={(value) => onFormChange("documentType", value)}
          />
        </div>
        <Field
          label="Número de documento"
          value={documentNumber}
          disabled={documentFieldsLocked}
          required
          numericOnly
          onChange={onDocumentNumberChange}
        />
      </div>
      {afterDocumentFields}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="País de emisión"
          value={form.documentIssueCountry}
          required
          onChange={(value) => onFormChange("documentIssueCountry", value)}
        />
        <Field
          label="Fecha de emisión"
          value={form.documentIssueDate}
          required
          onChange={(value) => onFormChange("documentIssueDate", value)}
        />
        <Field
          label="Fecha de vencimiento"
          value={form.documentExpiryDate}
          required
          onChange={(value) => onFormChange("documentExpiryDate", value)}
        />
      </div>
      <h2 className="pt-4 font-bold">Datos personales</h2>
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
          label="Fecha de nacimiento"
          value={form.birthDate}
          required
          onChange={(value) => onFormChange("birthDate", value)}
        />
        <Field
          label="País de nacimiento"
          value={form.birthCountry}
          required
          onChange={(value) => onFormChange("birthCountry", value)}
        />
        <Field
          label="Nacionalidad"
          value={form.nationality}
          required
          onChange={(value) => onFormChange("nationality", value)}
        />
        <Field
          label="Género"
          value={form.gender}
          required
          onChange={(value) => onFormChange("gender", value)}
        />
        <Field
          label="Correo electrónico"
          value={form.email}
          required
          onChange={(value) => onFormChange("email", value)}
        />
        <Field label="Comentarios" />
      </div>
      <h2 className="pt-4 font-bold">Domicilio y teléfono</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Calle"
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
        <Field label="País" value="Bolivia" disabled required />
        <Field
          label="Departamento / Estado"
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
          label="Teléfono"
          value={form.phone}
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
        />
        <Field
          label="Móvil"
          value={form.mobile}
          required
          numericOnly
          onChange={(value) => onFormChange("mobile", value)}
        />
      </div>
      {footerSlot}
    </div>
  );
}
