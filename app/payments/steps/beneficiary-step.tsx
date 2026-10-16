"use client";

import { useState, type ReactNode } from "react";
import {
  CircleAlertIcon,
  IdCardIcon,
  PencilIcon,
  ScanLineIcon,
  UserCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import {
  CheckOption,
  FieldGrid,
  FormSection,
  SelectInput,
  TextInput,
} from "../form-controls";
import {
  BOLIVIA_DEPARTMENTS,
  GENDER_OPTIONS,
  PHONE_CODE_OPTIONS,
  maskDocument,
  type PaymentOperation,
} from "../payment-data";
import {
  PROFILE_LABELS,
  fieldsFromTransaction,
  isExpired,
  isRequiredProfileField,
  missingProfileFields,
  type ProfileForm,
} from "../payment-rules";
import { Notice } from "./search-operation-step";

const COUNTRY_OPTIONS = countriesCatalog.result.items.map((item) =>
  item.country.ctyName.trim(),
);
const DOCUMENT_TYPE_OPTIONS = documentTypesCatalog.map((item) => item.name);
const DEPARTMENT_OPTIONS = Object.keys(BOLIVIA_DEPARTMENTS);

export type DocumentCheck = "pending" | "matched" | "mismatch";

export function BeneficiaryStep({
  operation,
  documentInput,
  onDocumentInputChange,
  documentCheck,
  onDocumentCheck,
  profile,
  onProfileChange,
  showAllFields,
  onShowAllFields,
  showErrors,
  complianceSlot,
}: {
  operation: PaymentOperation;
  documentInput: string;
  onDocumentInputChange: (value: string) => void;
  documentCheck: DocumentCheck;
  onDocumentCheck: (value: DocumentCheck) => void;
  profile: ProfileForm;
  onProfileChange: (form: ProfileForm) => void;
  showAllFields: boolean;
  onShowAllFields: () => void;
  showErrors: boolean;
  complianceSlot: ReactNode;
}) {
  const [scanning, setScanning] = useState(false);
  const declared = operation.declaredDocument;
  const existing = operation.existingCustomer !== null;
  const missing = missingProfileFields(profile);
  const fromTransaction = fieldsFromTransaction(operation);

  function validateDocument(value = documentInput) {
    if (!value.trim()) return;
    onDocumentCheck(value.trim() === declared.number ? "matched" : "mismatch");
  }

  // Simula la lectura del código de barras / MRZ del documento.
  function scanDocument() {
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      onDocumentInputChange(declared.number);
      validateDocument(declared.number);
    }, 900);
  }

  const set = <K extends keyof ProfileForm>(field: K) =>
    (value: ProfileForm[K]) => {
      const next = { ...profile, [field]: value };
      // Las ciudades dependen del departamento elegido.
      if (field === "department") next.city = "";
      onProfileChange(next);
    };

  const hintFor = (field: keyof ProfileForm) =>
    !existing && fromTransaction.has(field) && profile[field]
      ? "De la operación"
      : undefined;

  const text = (
    field: keyof ProfileForm,
    options: { type?: "text" | "email" | "date"; inputMode?: "numeric" } = {},
  ) => (
    <TextInput
      key={field}
      label={PROFILE_LABELS[field]}
      value={String(profile[field])}
      onChange={set(field) as (value: string) => void}
      required={isRequiredProfileField(field, profile)}
      disabled={
        (field === "documentIssueDate" && profile.noIssueDate) ||
        (field === "documentExpiryDate" && profile.noExpiryDate)
      }
      type={options.type}
      inputMode={options.inputMode}
      hint={hintFor(field)}
      missing={showErrors}
    />
  );

  const select = (
    field: keyof ProfileForm,
    options: string[],
    showFlags = false,
  ) => (
    <SelectInput
      key={field}
      label={PROFILE_LABELS[field]}
      value={String(profile[field])}
      options={options}
      onChange={set(field) as (value: string) => void}
      required={isRequiredProfileField(field, profile)}
      showFlags={showFlags}
      hint={hintFor(field)}
    />
  );

  const renderField = (field: keyof ProfileForm) => {
    switch (field) {
      case "documentType":
        return select(field, DOCUMENT_TYPE_OPTIONS);
      case "documentCountry":
      case "birthCountry":
      case "nationality":
      case "residenceCountry":
        return select(field, COUNTRY_OPTIONS, true);
      case "gender":
        return select(field, GENDER_OPTIONS);
      case "phoneCode":
        return select(field, PHONE_CODE_OPTIONS);
      case "department":
        return profile.residenceCountry === "Bolivia"
          ? select(field, DEPARTMENT_OPTIONS)
          : text(field);
      case "city":
        return profile.residenceCountry === "Bolivia"
          ? select(field, BOLIVIA_DEPARTMENTS[profile.department] ?? [])
          : text(field);
      case "documentIssueDate":
      case "documentExpiryDate":
      case "birthDate":
        return text(field, { type: "date" });
      case "phone":
      case "houseNumber":
        return text(field, { inputMode: "numeric" });
      case "email":
        return text(field, { type: "email" });
      default:
        return text(field);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-foreground">
          Identifica al beneficiario
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Pide la cédula física. Los datos se completan desde la operación y la
          ficha del cliente.
        </p>
      </div>

      <FormSection
        title="Documento de identidad"
        description={
          <>
            Declarado por el remitente: {declared.type} · {declared.country} ·{" "}
            <span className="font-mono">{maskDocument(declared.number)}</span>
          </>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            validateDocument();
          }}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <label className="block flex-1">
            <span className="mb-1 block text-sm font-semibold text-foreground">
              Número que figura en el documento físico{" "}
              <span className="text-destructive">*</span>
            </span>
            <input
              autoFocus={documentCheck !== "matched"}
              inputMode="numeric"
              value={documentInput}
              onChange={(event) => {
                onDocumentInputChange(
                  event.target.value.replace(/[^\dA-Za-z-]/g, "").slice(0, 15),
                );
                if (documentCheck !== "pending") onDocumentCheck("pending");
              }}
              placeholder="Escribe o escanea el documento"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>
          <button
            type="button"
            onClick={scanDocument}
            disabled={scanning}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 text-sm font-bold text-foreground hover:bg-card disabled:opacity-60"
          >
            <ScanLineIcon className="size-4" />
            {scanning ? "Leyendo…" : "Escanear"}
          </button>
          <button
            disabled={!documentInput || documentCheck === "matched"}
            className="h-10 rounded-lg bg-brand-strong px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
          >
            Validar
          </button>
        </form>
        <div aria-live="polite" className="mt-3 empty:hidden">
          {documentCheck === "mismatch" && (
            <Notice
              tone="error"
              icon={<CircleAlertIcon className="size-5" />}
              title="El documento no coincide con la operación"
              text="Revisa que la cédula sea del beneficiario. Si es correcta, el remitente debe corregir los datos antes del pago."
            />
          )}
          {documentCheck === "matched" && (
            <Notice
              tone="success"
              icon={<IdCardIcon className="size-5" />}
              title="Documento validado contra la operación"
              text={
                existing
                  ? "Encontramos la ficha del cliente en CIS."
                  : "Cliente nuevo: completamos lo que trae la operación."
              }
            />
          )}
        </div>
      </FormSection>

      {documentCheck === "matched" &&
        (existing && !showAllFields ? (
          <FormSection
            title="Ficha del cliente"
            description="Revisa con el beneficiario que sigan vigentes."
            action={
              <button
                type="button"
                onClick={onShowAllFields}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-brand-strong hover:bg-accent"
              >
                <PencilIcon className="size-3.5" />
                Editar ficha
              </button>
            }
          >
            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                <UserCheckIcon className="size-5" />
              </span>
              <dl className="grid flex-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                <ProfileRow
                  label="Nombre"
                  value={[
                    profile.firstName,
                    profile.middleName,
                    profile.lastName,
                    profile.secondLastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
                <ProfileRow
                  label="Documento"
                  value={`${profile.documentType} ${profile.documentNumber} · vence ${formatDate(profile.documentExpiryDate)}`}
                />
                <ProfileRow
                  label="Nacimiento"
                  value={`${formatDate(profile.birthDate)} · ${profile.nationality}`}
                />
                <ProfileRow
                  label="Teléfono"
                  value={`${profile.phoneCode} ${profile.phone}`}
                />
                <ProfileRow
                  label="Dirección"
                  value={[
                    `${profile.street} ${profile.houseNumber}`.trim(),
                    profile.zone,
                    profile.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
                <ProfileRow label="Correo" value={profile.email || "—"} />
              </dl>
            </div>
            {missing.length > 0 && (
              <div className="mt-4 rounded-lg border border-[#eadcae] bg-[#fffaf0] p-3 dark:border-amber-700/50 dark:bg-amber-950/40">
                <p className="mb-3 text-sm font-bold text-[#765d12] dark:text-amber-200">
                  Completa {missing.length === 1 ? "el dato faltante" : `los ${missing.length} datos faltantes`}
                  {isExpired(profile) && " (el documento está vencido)"}
                </p>
                <FieldGrid>{missing.map(renderField)}</FieldGrid>
              </div>
            )}
          </FormSection>
        ) : (
          <>
            {!existing && (
              <Notice
                tone="info"
                icon={<UserPlusIcon className="size-5" />}
                title="Alta de cliente"
                text="Los campos marcados «De la operación» ya vienen cargados; confírmalos con el beneficiario."
              />
            )}
            <FormSection title="Datos personales">
              <FieldGrid>
                {(
                  [
                    "firstName",
                    "middleName",
                    "lastName",
                    "secondLastName",
                    "birthDate",
                    "gender",
                    "birthCountry",
                    "nationality",
                  ] as const
                ).map(renderField)}
              </FieldGrid>
            </FormSection>
            <FormSection title="Documento">
              <FieldGrid>
                {(
                  [
                    "documentType",
                    "documentNumber",
                    "documentCountry",
                  ] as const
                ).map(renderField)}
                <div />
                <div className="space-y-2">
                  {renderField("documentIssueDate")}
                  <CheckOption
                    label="El documento no tiene fecha de emisión"
                    checked={profile.noIssueDate}
                    onChange={(checked) =>
                      onProfileChange({
                        ...profile,
                        noIssueDate: checked,
                        noExpiryDate: checked ? false : profile.noExpiryDate,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  {renderField("documentExpiryDate")}
                  <CheckOption
                    label="El documento no tiene fecha de vigencia"
                    checked={profile.noExpiryDate}
                    onChange={(checked) =>
                      onProfileChange({
                        ...profile,
                        noExpiryDate: checked,
                        noIssueDate: checked ? false : profile.noIssueDate,
                      })
                    }
                  />
                </div>
              </FieldGrid>
              {isExpired(profile) && (
                <p className="mt-2 text-xs font-semibold text-destructive">
                  El documento está vencido. Pide un documento vigente.
                </p>
              )}
            </FormSection>
            <FormSection title="Contacto y dirección">
              <FieldGrid>
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
                  {renderField("phoneCode")}
                  {renderField("phone")}
                </div>
                {renderField("email")}
                {renderField("residenceCountry")}
                {renderField("department")}
                {renderField("city")}
                {renderField("zone")}
                {renderField("street")}
                {renderField("houseNumber")}
                {renderField("address2")}
                {renderField("postalCode")}
              </FieldGrid>
            </FormSection>
          </>
        ))}

      {documentCheck === "matched" && complianceSlot}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
