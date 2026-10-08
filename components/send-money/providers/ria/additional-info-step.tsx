import { Field } from "../../field";

const CHECK_LABELS = [
  "Información adicional",
  "¿Es una Persona Expuesta Políticamente (PEP)?",
  "¿Es allegado a una PEP?",
  "Transacción sospechosa o inusual",
] as const;

export function RiaAdditionalInfoStep({
  additionalChecks,
  onChange,
  known,
}: {
  additionalChecks: Record<string, boolean>;
  onChange: (label: string, checked: boolean) => void;
  known: (value?: string) => string | undefined;
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
                checked
                  ? "border-[#aebcf0] bg-[#f5f7ff]"
                  : "border-[#e1e6ef]"
              }`}
            >
              <input
                type="checkbox"
                data-additional-check
                checked={checked}
                onChange={(event) => onChange(label, event.target.checked)}
                className="h-5 w-5 accent-[#465bc2]"
              />
              {label}
            </label>
            {checked && (
              <div className="rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {label === "Información adicional" && (
                    <>
                      <Field
                        label="Ocupación"
                        value={known("Comerciante")}
                        required
                      />
                      <Field
                        label="Actividad Económica"
                        value={known("Comercio")}
                        required
                      />
                      <Field
                        label="Origen de los Fondos"
                        value={known("Salario")}
                        required
                      />
                      <Field
                        label="Destino recursos"
                        value={known("Gastos personales")}
                        required
                      />
                      <Field
                        label="Propósito Transacción"
                        value={known("Manutención")}
                        required
                      />
                      <Field
                        label="Estado Civil"
                        value={known("Soltera")}
                        required
                      />
                      <Field label="Nombre(s) y Apellidos del cónyugue" />
                      <Field
                        label="Ingreso Mensual"
                        value={known("5.000 USD")}
                        required
                      />
                    </>
                  )}
                  {label ===
                    "¿Es una Persona Expuesta Políticamente (PEP)?" && (
                    <>
                      <Field
                        label="Nombre de PEP"
                        value={known("Eliana Antezana Ovando")}
                        required
                      />
                      <Field
                        label="Cargo de PEP"
                        value={known("Propietaria")}
                        required
                      />
                      <Field
                        label="Ocupación"
                        value={known("Comerciante")}
                        required
                      />
                      <Field label="Cargos Públicos" required />
                    </>
                  )}
                  {label === "¿Es allegado a una PEP?" && (
                    <>
                      <Field
                        label="Tipo de Relación con PEP"
                        value={known("Familiar")}
                        required
                      />
                      <Field
                        label="Nombre de PEP"
                        value={known("Eliana Antezana Ovando")}
                        required
                      />
                      <Field
                        label="Cargo de PEP"
                        value={known("Propietaria")}
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
