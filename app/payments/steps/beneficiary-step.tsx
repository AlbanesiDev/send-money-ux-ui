"use client";

import { useState, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  CheckIcon,
  CircleAlertIcon,
  EyeIcon,
  IdCardIcon,
  PencilIcon,
  ScanLineIcon,
  UserCheckIcon,
  UserPlusIcon,
  XIcon,
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
  showErrors: boolean;
  complianceSlot: ReactNode;
}) {
  const [scanning, setScanning] = useState(false);
  const [editErrors, setEditErrors] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const declared = operation.declaredDocument;
  const existing = operation.existingCustomer !== null;
  const missing = missingProfileFields(profile);
  const fromTransaction = fieldsFromTransaction(operation);
  const highlightMissing = showErrors || editErrors;

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

  const set =
    <K extends keyof ProfileForm>(field: K) =>
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
      missing={highlightMissing}
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

  const fullName = [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const showProfileSummary = documentCheck === "matched" && existing;
  const showProfileForm = documentCheck === "matched" && !existing;

  const profileFormFields = (
    <>
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
          {(["documentType", "documentNumber", "documentCountry"] as const).map(
            renderField,
          )}
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
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className={showProfileSummary ? "grid gap-4 lg:grid-cols-2" : undefined}
      >
        <FormSection
          className={showProfileSummary ? "h-full" : undefined}
          title="Identifica al beneficiario"
          description="Pide la cédula física. Los datos se completan desde la operación y la ficha del cliente."
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              validateDocument();
            }}
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <label className="block min-w-0 flex-1">
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
                    event.target.value
                      .replace(/[^\dA-Za-z-]/g, "")
                      .slice(0, 15),
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
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 text-sm font-bold text-foreground hover:bg-card disabled:opacity-60"
            >
              <ScanLineIcon className="size-4" />
              {scanning ? "Leyendo…" : "Escanear"}
            </button>
            <button
              disabled={!documentInput || documentCheck === "matched"}
              className="h-10 shrink-0 rounded-lg bg-brand-strong px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
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

        {showProfileSummary && (
          <FormSection
            className="h-full"
            title="Ficha del cliente"
            description="Revisa con el beneficiario que sigan vigentes."
            action={
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewOpen(true)}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-brand-strong hover:bg-accent"
                >
                  <EyeIcon className="size-3.5" />
                  Ver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditErrors(false);
                    setEditOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-brand-strong hover:bg-accent"
                >
                  <PencilIcon className="size-3.5" />
                  Editar ficha
                </button>
              </div>
            }
          >
            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                <UserCheckIcon className="size-5" />
              </span>
              <dl className="grid flex-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                <ProfileRow label="Nombre" value={fullName} />
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
          </FormSection>
        )}
      </div>

      {showProfileForm && (
        <>
          <Notice
            tone="info"
            icon={<UserPlusIcon className="size-5" />}
            title="Alta de cliente"
            text="Los campos marcados «De la operación» ya vienen cargados; confírmalos con el beneficiario."
          />
          {profileFormFields}
        </>
      )}

      {documentCheck === "matched" && complianceSlot}

      <Dialog.Root open={viewOpen} onOpenChange={setViewOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none">
              <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <UserCheckIcon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
                      Ficha del cliente
                    </Dialog.Title>
                    <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                      {fullName}
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close
                  aria-label="Cerrar"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    Datos personales
                  </h3>
                  <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <ProfileDetail
                      label={PROFILE_LABELS.firstName}
                      value={profile.firstName}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.middleName}
                      value={profile.middleName}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.lastName}
                      value={profile.lastName}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.secondLastName}
                      value={profile.secondLastName}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.birthDate}
                      value={formatDate(profile.birthDate)}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.gender}
                      value={profile.gender}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.birthCountry}
                      value={profile.birthCountry}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.nationality}
                      value={profile.nationality}
                    />
                  </dl>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    Documento
                  </h3>
                  <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <ProfileDetail
                      label={PROFILE_LABELS.documentType}
                      value={profile.documentType}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.documentNumber}
                      value={profile.documentNumber}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.documentCountry}
                      value={profile.documentCountry}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.documentIssueDate}
                      value={
                        profile.noIssueDate
                          ? "Sin fecha de emisión"
                          : formatDate(profile.documentIssueDate)
                      }
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.documentExpiryDate}
                      value={
                        profile.noExpiryDate
                          ? "Sin fecha de vigencia"
                          : formatDate(profile.documentExpiryDate)
                      }
                    />
                  </dl>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    Contacto y dirección
                  </h3>
                  <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <ProfileDetail
                      label={PROFILE_LABELS.phone}
                      value={`${profile.phoneCode} ${profile.phone}`.trim()}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.email}
                      value={profile.email}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.residenceCountry}
                      value={profile.residenceCountry}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.department}
                      value={profile.department}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.city}
                      value={profile.city}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.zone}
                      value={profile.zone}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.street}
                      value={profile.street}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.houseNumber}
                      value={profile.houseNumber}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.address2}
                      value={profile.address2}
                    />
                    <ProfileDetail
                      label={PROFILE_LABELS.postalCode}
                      value={profile.postalCode}
                    />
                  </dl>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setViewOpen(false);
                    setEditErrors(false);
                    setEditOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
                >
                  <PencilIcon className="size-4" />
                  Editar ficha
                </button>
                <Dialog.Close className="rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30">
                  Cerrar
                </Dialog.Close>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditErrors(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none">
              <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                <div>
                  <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
                    Editar ficha del cliente
                  </Dialog.Title>
                  <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                    Actualiza los datos y guarda para volver al resumen.
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  aria-label="Cerrar"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {editErrors && missing.length > 0 && (
                  <p
                    role="alert"
                    className="text-xs font-semibold text-destructive"
                  >
                    {missing.length === 1
                      ? "Falta completar 1 dato obligatorio."
                      : `Faltan completar ${missing.length} datos obligatorios.`}
                  </p>
                )}
                {profileFormFields}
              </div>
              <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                <Dialog.Close className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20">
                  Cancelar
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => {
                    if (missing.length > 0) {
                      setEditErrors(true);
                      return;
                    }
                    setEditErrors(false);
                    setEditOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30"
                >
                  <CheckIcon className="size-4" />
                  Guardar ficha
                </button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
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

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

export function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
