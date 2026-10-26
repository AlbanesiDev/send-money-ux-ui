"use client";

import type { Customer } from "../../types";
import { Field } from "../../field";

const PEP_CHECK_LABEL = "¿Es una Persona Expuesta Políticamente (PEP)?";
const RELATED_CHECK_LABEL = "¿Es allegado a una PEP?";

const CHECK_LABELS = [PEP_CHECK_LABEL, RELATED_CHECK_LABEL] as const;

export function RiaAdditionalInfoStep({
  additionalChecks,
  onChange,
  customer,
}: {
  additionalChecks: Record<string, boolean>;
  onChange: (label: string, checked: boolean) => void;
  customer: Customer | null;
}) {
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
                  {label === PEP_CHECK_LABEL && (
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
                      <Field
                        label="Cargos Públicos"
                        value={
                          customer === null
                            ? undefined
                            : customer.pep.publicPositions
                        }
                        required
                      />
                    </>
                  )}
                  {label === RELATED_CHECK_LABEL && (
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
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
