import { Field } from "../../field";

export function RiaRemitterStep({
  documentNumber,
  known,
}: {
  documentNumber: string;
  known: (value?: string) => string | undefined;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-bold">Datos personales</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" value={known("Eliana")} required />
        <Field label="Segundo nombre" />
        <Field label="Primer apellido" value={known("Antezana")} required />
        <Field label="Segundo apellido" value={known("Ovando")} />
        <Field
          label="Correo electrónico"
          value={known("jorge.gimenez@cislatam.com")}
          required
        />
        <Field
          label="Documento (referencia)"
          value={`Cédula ${documentNumber}`}
          disabled
        />
      </div>
      <h2 className="pt-4 font-bold">Datos de dirección</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="País de residencia" value="Bolivia" disabled required />
        <Field label="Estado" value={known("La Paz")} required />
        <Field label="Ciudad" value={known("Acarapiri")} required />
        <Field label="Dirección" value={known("Fabian Vaca 3712")} required />
        <Field label="Número de teléfono" value={known("45545454")} />
      </div>
    </div>
  );
}
