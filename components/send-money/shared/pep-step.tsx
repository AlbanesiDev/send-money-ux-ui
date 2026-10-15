import { Field } from "../field";

const PEP_CHECK_LABEL = "¿Es una Persona Expuesta Políticamente (PEP)?";
const RELATED_CHECK_LABEL = "¿Es allegado a una PEP?";

const CHECK_LABELS = [PEP_CHECK_LABEL, RELATED_CHECK_LABEL] as const;

export function PepStep({
  title = "Datos PEP",
  known,
  showTerraPayExtras = false,
  additionalChecks,
  onChange,
}: {
  title?: string;
  known: (value?: string) => string | undefined;
  showTerraPayExtras?: boolean;
  additionalChecks: Record<string, boolean>;
  onChange: (label: string, checked: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="font-bold">{title}</h2>
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
                      <Field
                        label="Nivel de Posición de Empleo"
                        value={known("Empleado")}
                        required
                      />
                      <Field
                        label="Nombre Institución/Empresa Trabajo"
                        value={known("Comercio Sol & Luna")}
                        required
                      />
                      <Field
                        label="Cargo"
                        value={known("Propietaria")}
                        required
                      />
                      <Field
                        label="Dirección Trabajo"
                        value={known("Av. Principal 123")}
                        required
                      />
                      <Field
                        label="Ingreso Mensual"
                        value={known("5.000 USD")}
                        required
                      />
                      <Field
                        label="Origen de los Fondos"
                        value={known("Salario")}
                        required
                      />
                      <Field
                        label="Propósito Transacción"
                        value={known("Manutención")}
                        required
                      />
                      {showTerraPayExtras && (
                        <>
                          <Field
                            label="Tipo de envío"
                            value={known("Remesa")}
                            required
                          />
                          <Field
                            label="Relación Remitente"
                            value={known("Familiar")}
                            required
                          />
                        </>
                      )}
                    </>
                  )}
                  {label === RELATED_CHECK_LABEL && (
                    <>
                      <Field
                        label="Tipo de Relación con PEP"
                        value={known("Titular")}
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
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
