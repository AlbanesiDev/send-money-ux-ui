"use client";

import { useRef } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import maritalStatusCatalog from "@/public/catalogs/catalog-marital-status.json";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import type { Customer } from "../../types";
import { Field } from "../../field";
import type { RemitterFormChangeHandler } from "../wu/remitter-step";

const CHECK_LABELS = [
  "Información adicional",
  "¿Es una Persona Expuesta Políticamente (PEP)?",
  "¿Es allegado a una PEP?",
  "Transacción sospechosa o inusual",
] as const;

const CIVIL_STATUS_OPTIONS = maritalStatusCatalog.items.map(
  (item) => item.maritalStatus.description,
);
const MARRIED_CIVIL_STATUS = "Casado";

export function RiaAdditionalInfoStep({
  additionalChecks,
  onChange,
  customer,
  remitterForm,
  onRemitterFormChange,
}: {
  additionalChecks: Record<string, boolean>;
  onChange: (label: string, checked: boolean) => void;
  customer: Customer | null;
  remitterForm: CustomerRegistrationDraft;
  onRemitterFormChange: RemitterFormChangeHandler;
}) {
  const civilStatusRef = useRef<HTMLButtonElement>(null);
  const showSpouseName = remitterForm.civilStatus === MARRIED_CIVIL_STATUS;

  return (
    <div className="space-y-5">
      <h2 className="font-bold">Declaraciones de la operación</h2>
      {CHECK_LABELS.map((label) => {
        const checked = Boolean(additionalChecks[label]);
        return (
          <div key={label} className="space-y-4">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-colors ${
                checked ? "border-brand/40 bg-accent" : "border-border"
              }`}
            >
              <input
                type="checkbox"
                data-additional-check
                checked={checked}
                onChange={(event) => onChange(label, event.target.checked)}
                className="h-5 w-5 accent-brand-strong"
              />
              {label}
            </label>
            {checked && (
              <div className="rounded-xl border border-border bg-muted p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {label === "Información adicional" && (
                    <>
                      <Field
                        label="Ocupación"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.occupation
                        }
                        required
                      />
                      <Field
                        label="Actividad Económica"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.economicActivity
                        }
                        required
                      />
                      <Field
                        label="Origen de los Fondos"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.fundsOrigin
                        }
                        required
                      />
                      <Field
                        label="Destino recursos"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.resourceDestination
                        }
                        required
                      />
                      <Field
                        label="Propósito Transacción"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.transactionPurpose
                        }
                        required
                      />
                      <SearchableSelect
                        fieldRef={civilStatusRef}
                        label="Estado Civil"
                        value={remitterForm.civilStatus}
                        options={CIVIL_STATUS_OPTIONS}
                        required
                        onChange={(value) => {
                          onRemitterFormChange("civilStatus", value);
                          if (value !== MARRIED_CIVIL_STATUS) {
                            onRemitterFormChange("spouseName", "");
                          }
                        }}
                      />
                      {showSpouseName && (
                        <Field
                          label="Nombre(s) y Apellidos del cónyuge"
                          value={remitterForm.spouseName}
                          required
                          onChange={(value) =>
                            onRemitterFormChange("spouseName", value)
                          }
                        />
                      )}
                      <Field
                        label="Ingreso Mensual"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.monthlyIncome
                        }
                        required
                      />
                    </>
                  )}
                  {label ===
                    "¿Es una Persona Expuesta Políticamente (PEP)?" && (
                    <>
                      <Field
                        label="Nombre de PEP"
                        value={
                          customer === null ? undefined : customer.fullName
                        }
                        required
                      />
                      <Field
                        label="Cargo de PEP"
                        value={
                          customer === null ? undefined : customer.pep.position
                        }
                        required
                      />
                      <Field
                        label="Ocupación"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.occupation
                        }
                        required
                      />
                      <Field label="Cargos Públicos" required />
                    </>
                  )}
                  {label === "¿Es allegado a una PEP?" && (
                    <>
                      <Field
                        label="Tipo de Relación con PEP"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.senderRelation
                        }
                        required
                      />
                      <Field
                        label="Nombre de PEP"
                        value={
                          customer === null ? undefined : customer.fullName
                        }
                        required
                      />
                      <Field
                        label="Cargo de PEP"
                        value={
                          customer === null ? undefined : customer.pep.position
                        }
                        required
                      />
                    </>
                  )}
                  {label === "Transacción sospechosa o inusual" && (
                    <>
                      <Field
                        label="Motivo de la sospecha y/o inusualidad"
                        required
                      />
                      <Field
                        label="Nombres y Apellidos Referencia Personal"
                        required
                      />
                      <Field label="Teléfono Referencia Personal" required />
                      <Field label="Nro NIT" />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
