"use client";

import { FlagIcon, ShieldCheckIcon } from "lucide-react";
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

const GROUPS: { title: string; fields: UifField[] }[] = [
  {
    title: "Sobre esta operación",
    fields: ["fundsOrigin", "purpose", "resourcesDestination", "senderRelation"],
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
  { title: "Datos PEP", fields: ["publicOffice", "nit"] },
  { title: "PEP relacionada", fields: ["pepRelation", "pepName", "pepPosition"] },
  { title: "Operación inusual", fields: ["unusualReason"] },
];

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

  const visibleGroups = GROUPS.map((group) => ({
    ...group,
    fields: group.fields.filter(
      (field) => requiredFields.has(field) || (field === "nit" && flags.pep),
    ),
  })).filter((group) => group.fields.length > 0);

  return (
    <FormSection
      title="Declaraciones y cumplimiento (UIF)"
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
            <p className="font-bold">La UIF exige información adicional</p>
            <ul className="mt-0.5 list-disc pl-4 text-xs">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-3">
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
        <CheckOption
          label="Información adicional"
          description={
            forced ? "Obligatoria para esta operación" : "Formulario UIF completo"
          }
          checked={flags.additionalInfo || forced}
          locked={forced}
          onChange={toggle("additionalInfo")}
        />
      </div>

      {visibleGroups.length > 0 && (
        <div className="mt-4 flex flex-col gap-4">
          {visibleGroups.map((group) => (
            <fieldset
              key={group.title}
              className="rounded-lg border border-border bg-muted p-3"
            >
              <legend className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {group.title}
              </legend>
              <FieldGrid>{group.fields.map(renderField)}</FieldGrid>
            </fieldset>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => toggle("unusual")(!flags.unusual)}
          aria-pressed={flags.unusual}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${
            flags.unusual
              ? "bg-destructive/10 text-destructive"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <FlagIcon className="size-3.5" />
          {flags.unusual
            ? "Operación marcada como inusual · Quitar marca"
            : "Marcar operación como inusual"}
        </button>
      </div>
    </FormSection>
  );
}
