import { Field } from "../field";

export function PepStep({
  title = "Datos PEP",
  known,
  showTerraPayExtras = false,
}: {
  title?: string;
  known: (value?: string) => string | undefined;
  showTerraPayExtras?: boolean;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-bold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field
          label="¿Es una Persona Expuesta Políticamente (PEP)?"
          value={known("Sí")}
          required
        />
        <Field label="¿Es allegado a una PEP?" value={known("No")} required />
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
        <Field label="Cargo de PEP" value={known("Propietaria")} required />
        <Field label="Ocupación" value={known("Comerciante")} required />
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
        <Field label="Cargo" value={known("Propietaria")} required />
        <Field
          label="Dirección Trabajo"
          value={known("Av. Principal 123")}
          required
        />
        <Field label="Ingreso Mensual" value={known("5.000 USD")} required />
        <Field label="Origen de los Fondos" value={known("Salario")} required />
        <Field
          label="Propósito Transacción"
          value={known("Manutención")}
          required
        />
        {showTerraPayExtras && (
          <>
            <Field label="Tipo de envío" value={known("Remesa")} required />
            <Field
              label="Relación Remitente"
              value={known("Familiar")}
              required
            />
          </>
        )}
      </div>
    </div>
  );
}
