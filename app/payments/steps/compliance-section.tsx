"use client";

import { ShieldCheckIcon } from "lucide-react";
import {
  CheckOption,
  FieldGrid,
  FormSection,
  SelectInput,
  TextInput,
} from "../form-controls";
import {
  BOLIVIA_DEPARTMENTS,
  CIVIL_STATUS_OPTIONS,
  ECONOMIC_ACTIVITY_OPTIONS,
  EMPLOYMENT_LEVEL_OPTIONS,
  FUNDS_ORIGIN_OPTIONS,
  MONTHLY_INCOME_OPTIONS,
  OCCUPATION_OPTIONS,
  PEP_RELATION_OPTIONS,
  PUBLIC_OFFICE_OPTIONS,
  PURPOSE_OPTIONS,
  SENDER_RELATION_OPTIONS,
  type PaymentOperation,
} from "../payment-data";
import {
  uifTriggers,
  type ComplianceFlags,
  type UifField,
  type UifForm,
} from "../payment-rules";

const UIF_FIELDS: Record<
  UifField,
  { label: string; options?: string[]; type?: "date" | "tel" }
> = {
  occupation: { label: "Ocupación", options: OCCUPATION_OPTIONS },
  employmentLevel: {
    label: "Nivel de posición de empleo",
    options: EMPLOYMENT_LEVEL_OPTIONS,
  },
  economicActivity: {
    label: "Actividad económica",
    options: ECONOMIC_ACTIVITY_OPTIONS,
  },
  employer: { label: "Institución / empresa donde trabaja" },
  position: { label: "Cargo" },
  workAddress: { label: "Dirección del trabajo" },
  monthlyIncome: { label: "Ingreso mensual", options: MONTHLY_INCOME_OPTIONS },
  workStartDate: { label: "Fecha de ingreso al trabajo", type: "date" },
  civilStatus: { label: "Estado civil", options: CIVIL_STATUS_OPTIONS },
  spouseName: { label: "Nombre y apellidos del cónyuge" },
  idExtensionPlace: {
    label: "Lugar de extensión de la cédula",
    options: Object.keys(BOLIVIA_DEPARTMENTS),
  },
  fundsOrigin: { label: "Origen de los fondos", options: FUNDS_ORIGIN_OPTIONS },
  resourcesDestination: { label: "Destino de los recursos" },
  purpose: { label: "Propósito de la transacción", options: PURPOSE_OPTIONS },
  senderRelation: {
    label: "Relación con el remitente",
    options: SENDER_RELATION_OPTIONS,
  },
  referenceName: { label: "Nombre y apellidos" },
  referencePhone: { label: "Teléfono", type: "tel" },
  publicOffice: { label: "Cargo público", options: PUBLIC_OFFICE_OPTIONS },
  nit: { label: "Nro. NIT" },
  pepRelation: {
    label: "Tipo de relación con la PEP",
    options: PEP_RELATION_OPTIONS,
  },
  pepName: { label: "Nombre de la PEP" },
  pepPosition: { label: "Cargo de la PEP" },
  unusualReason: {
    label: "Motivo de la sospecha o inusualidad",
  },
};

const ADDITIONAL_GROUPS: { title: string; fields: UifField[] }[] = [
  {
    title: "Sobre esta operación",
    fields: [
      "fundsOrigin",
      "purpose",
      "resourcesDestination",
      "senderRelation",
    ],
  },
  {
    title: "Actividad y trabajo",
    fields: [
      "occupation",
      "employmentLevel",
      "economicActivity",
      "monthlyIncome",
      "employer",
      "position",
      "workAddress",
      "workStartDate",
    ],
  },
  {
    title: "Datos complementarios",
    fields: ["civilStatus", "spouseName", "idExtensionPlace"],
  },
  { title: "Referencia personal", fields: ["referenceName", "referencePhone"] },
];

const PEP_FIELDS: UifField[] = ["publicOffice", "nit"];
const PEP_RELATED_FIELDS: UifField[] = ["pepRelation", "pepName", "pepPosition"];
const UNUSUAL_FIELDS: UifField[] = ["unusualReason"];

export function ComplianceSection({
  operation,
  flags,
  onFlagsChange,
  form,
  onFormChange,
  requiredFields,
  knownFields,
  showErrors,
}: {
  operation: PaymentOperation;
  flags: ComplianceFlags;
  onFlagsChange: (flags: ComplianceFlags) => void;
  form: UifForm;
  onFormChange: (form: UifForm) => void;
  requiredFields: Set<UifField>;
  /** Campos que ya estaban en la ficha del cliente. */
  knownFields: Set<string>;
  showErrors: boolean;
}) {
  const reasons = uifTriggers(operation, flags);
  const forced = reasons.length > 0;
  const profile = operation.existingCustomer;
  const set = (field: UifField) => (value: string) =>
    onFormChange({ ...form, [field]: value });
  const toggle = (flag: keyof ComplianceFlags) => (checked: boolean) =>
    onFlagsChange({ ...flags, [flag]: checked });

  const renderField = (field: UifField) => {
    const config = UIF_FIELDS[field];
    const hint =
      knownFields.has(field) && form[field] ? "De la ficha" : undefined;
    return config.options ? (
      <SelectInput
        key={field}
        label={config.label}
        value={form[field]}
        options={config.options}
        onChange={set(field)}
        required
        hint={hint}
      />
    ) : (
      <TextInput
        key={field}
        label={config.label}
        value={form[field]}
        onChange={set(field)}
        type={config.type}
        required={field !== "nit"}
        hint={hint}
        missing={showErrors}
      />
    );
  };

  const visibleFields = (fields: UifField[]) =>
    fields.filter(
      (field) => requiredFields.has(field) || (field === "nit" && flags.pep),
    );

  const additionalGroups = ADDITIONAL_GROUPS.map((group) => ({
    ...group,
    fields: visibleFields(group.fields),
  })).filter((group) => group.fields.length > 0);

  const pepFields = visibleFields(PEP_FIELDS);
  const pepRelatedFields = visibleFields(PEP_RELATED_FIELDS);
  const unusualFields = visibleFields(UNUSUAL_FIELDS);

  return (
    <FormSection
      title="Declaraciones y cumplimiento"
      description={
        profile
          ? `Según la ficha: ${profile.isPep ? "es PEP" : "no es PEP"} y ${profile.isPepRelated ? "es allegado a una PEP" : "no es allegado a una PEP"}. Confírmalo con el beneficiario.`
          : "Pregunta al beneficiario y marca lo que corresponda."
      }
    >
      {reasons.length > 0 && (
        <div className="mb-3 flex items-start gap-3 rounded-lg border border-brand/30 bg-accent px-4 py-3 text-brand-strong">
          <ShieldCheckIcon className="mt-0.5 size-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">
              La operación exige información adicional
            </p>
            <ul className="mt-0.5 list-disc pl-4 text-xs">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <CheckOption
            label="Es PEP"
            description="Persona expuesta políticamente"
            checked={flags.pep}
            onChange={(checked) =>
              onFlagsChange({
                ...flags,
                pep: checked,
                pepRelated: checked ? false : flags.pepRelated,
              })
            }
          />
          {flags.pep && pepFields.length > 0 && (
            <div className="rounded-xl border border-border bg-muted p-4">
              <FieldGrid>{pepFields.map(renderField)}</FieldGrid>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <CheckOption
            label="Es allegado a una PEP"
            description="Familiar o colaborador cercano"
            checked={flags.pepRelated}
            onChange={(checked) =>
              onFlagsChange({
                ...flags,
                pepRelated: checked,
                pep: checked ? false : flags.pep,
              })
            }
          />
          {flags.pepRelated && pepRelatedFields.length > 0 && (
            <div className="rounded-xl border border-border bg-muted p-4">
              <FieldGrid>{pepRelatedFields.map(renderField)}</FieldGrid>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <CheckOption
            label="Información adicional"
            description={
              forced ? "Obligatoria para esta operación" : "Formulario completo"
            }
            checked={flags.additionalInfo || forced}
            locked={forced}
            onChange={toggle("additionalInfo")}
          />
          {additionalGroups.length > 0 && (
            <div className="flex flex-col gap-3">
              {additionalGroups.map((group) => (
                <fieldset
                  key={group.title}
                  className="rounded-xl border border-border bg-muted p-4"
                >
                  <legend className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {group.title}
                  </legend>
                  <FieldGrid>{group.fields.map(renderField)}</FieldGrid>
                </fieldset>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <CheckOption
            label="Operación inusual"
            description="Indicios de sospecha"
            checked={flags.unusual}
            onChange={toggle("unusual")}
          />
          {flags.unusual && unusualFields.length > 0 && (
            <div className="rounded-xl border border-border bg-muted p-4">
              <FieldGrid>{unusualFields.map(renderField)}</FieldGrid>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
}
