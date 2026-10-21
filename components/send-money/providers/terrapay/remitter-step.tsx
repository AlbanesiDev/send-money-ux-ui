"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import maritalStatusCatalog from "@/public/catalogs/catalog-marital-status.json";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import { CountryField } from "../../country-field";
import { DateField } from "../../date-field";
import { Field } from "../../field";
import type { RemitterFormChangeHandler } from "../wu/remitter-step";

const DOCUMENT_TYPE_OPTIONS = documentTypesCatalog.map((item) => item.name);
const CIVIL_STATUS_OPTIONS = maritalStatusCatalog.items.map(
  (item) => item.maritalStatus.description,
);
const MARRIED_CIVIL_STATUS = "Casado";

export function TerrapayRemitterStep({
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
  const civilStatusRef = useRef<HTMLButtonElement>(null);
  const showSpouseName = form.civilStatus === MARRIED_CIVIL_STATUS;

  let issueMaxDate = "";
  if (form.documentExpiryDate.length === 10) {
    const expiryDay = Number(form.documentExpiryDate.slice(0, 2));
    const expiryMonth = Number(form.documentExpiryDate.slice(3, 5));
    const expiryYear = Number(form.documentExpiryDate.slice(6, 10));
    const maxIssueDate = new Date(expiryYear, expiryMonth - 1, expiryDay);
    maxIssueDate.setDate(maxIssueDate.getDate() - 1);
    issueMaxDate = `${String(maxIssueDate.getDate()).padStart(2, "0")}/${String(maxIssueDate.getMonth() + 1).padStart(2, "0")}/${String(maxIssueDate.getFullYear()).padStart(4, "0")}`;
  }

  let expiryMinDate = "";
  if (form.documentIssueDate.length === 10) {
    const issueDay = Number(form.documentIssueDate.slice(0, 2));
    const issueMonth = Number(form.documentIssueDate.slice(3, 5));
    const issueYear = Number(form.documentIssueDate.slice(6, 10));
    const minExpiryDate = new Date(issueYear, issueMonth - 1, issueDay);
    minExpiryDate.setDate(minExpiryDate.getDate() + 1);
    expiryMinDate = `${String(minExpiryDate.getDate()).padStart(2, "0")}/${String(minExpiryDate.getMonth() + 1).padStart(2, "0")}/${String(minExpiryDate.getFullYear()).padStart(4, "0")}`;
  }

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
        <CountryField
          label="País de emisión"
          value={form.documentIssueCountry}
          required
          onChange={(value) => onFormChange("documentIssueCountry", value)}
        />
        <DateField
          label="Fecha de emisión"
          value={form.documentIssueDate}
          required
          disableFutureDates
          maxDate={issueMaxDate}
          onChange={(value) => onFormChange("documentIssueDate", value)}
        />
        <DateField
          label="Fecha de vencimiento"
          value={form.documentExpiryDate}
          required
          disableFutureDates
          minDate={expiryMinDate}
          onChange={(value) => onFormChange("documentExpiryDate", value)}
        />
        <label className="flex items-center gap-3 self-end pb-3 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-amount" />
          Sin fecha de emisión
        </label>
        <label className="flex items-center gap-3 self-end pb-3 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-amount" />
          Sin fecha de vencimiento
        </label>
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
        <DateField
          label="Fecha de nacimiento"
          value={form.birthDate}
          required
          minimumAgeYears={18}
          onChange={(value) => onFormChange("birthDate", value)}
        />
        <CountryField
          label="País de nacimiento"
          value={form.birthCountry}
          required
          onChange={(value) => onFormChange("birthCountry", value)}
        />
        <CountryField
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
        <SearchableSelect
          fieldRef={civilStatusRef}
          label="Estado civil"
          value={form.civilStatus}
          options={CIVIL_STATUS_OPTIONS}
          required
          onChange={(value) => {
            onFormChange("civilStatus", value);
            if (value !== MARRIED_CIVIL_STATUS) {
              onFormChange("spouseName", "");
            }
          }}
        />
        {showSpouseName && (
          <Field
            label="Nombre del cónyuge"
            value={form.spouseName}
            required
            onChange={(value) => onFormChange("spouseName", value)}
          />
        )}
        <Field
          label="Correo electrónico"
          value={form.email}
          required
          email
          onChange={(value) => onFormChange("email", value)}
        />
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
          label="Nro. casa"
          value={form.houseNumber}
          required
          onChange={(value) => onFormChange("houseNumber", value)}
        />
        <Field
          label="Dirección 2"
          value={form.address2}
          onChange={(value) => onFormChange("address2", value)}
        />
        <Field
          label="Zona"
          value={form.zone}
          required
          onChange={(value) => onFormChange("zone", value)}
        />
        <Field
          label="Código postal"
          value={form.postalCode}
          onChange={(value) => onFormChange("postalCode", value)}
        />
        <CountryField
          label="País"
          value="Bolivia"
          disabled
          required
          onChange={() => undefined}
        />
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
