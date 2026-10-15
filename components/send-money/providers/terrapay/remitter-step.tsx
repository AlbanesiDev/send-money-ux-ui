import { Field } from "../../field";

export function TerrapayRemitterStep({
  documentNumber,
  known,
}: {
  documentNumber: string;
  known: (value?: string) => string | undefined;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-bold">Documento de identidad</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tipo de documento" value="Cédula" disabled required />
        <Field
          label="Número de documento"
          value={documentNumber}
          disabled
          required
        />
        <Field label="País de emisión" value={known("Bolivia")} required />
        <Field label="Fecha de emisión" value={known("01/01/2018")} required />
        <Field
          label="Fecha de vencimiento"
          value={known("01/01/2028")}
          required
        />
        <label className="flex items-center gap-3 self-end pb-3 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-[#465bc2]" />
          Sin fecha de emisión
        </label>
        <label className="flex items-center gap-3 self-end pb-3 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-[#465bc2]" />
          Sin fecha de vencimiento
        </label>
      </div>
      <h2 className="pt-4 font-bold">Datos personales</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" value={known("Eliana")} required />
        <Field label="Segundo nombre" />
        <Field label="Primer apellido" value={known("Antezana")} required />
        <Field label="Segundo apellido" value={known("Ovando")} />
        <Field
          label="Fecha de nacimiento"
          value={known("15/03/1985")}
          required
        />
        <Field label="País de nacimiento" value={known("Bolivia")} required />
        <Field label="Nacionalidad" value={known("Boliviana")} required />
        <Field label="Género" value={known("Femenino")} required />
        <Field label="Estado civil" value={known("Soltera")} required />
        <Field label="Nombre del cónyuge" />
        <Field
          label="Correo electrónico"
          value={known("jorge.gimenez@cislatam.com")}
          required
        />
        <Field label="Comentarios" />
      </div>
      <h2 className="pt-4 font-bold">Domicilio y teléfono</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Calle" value={known("Fabian Vaca")} required />
        <Field label="Nro. casa" value={known("3712")} required />
        <Field label="Dirección 2" value={known("Zona Sur")} />
        <Field label="Zona" value={known("Zona Sur")} required />
        <Field label="Código postal" value={known("0000")} />
        <Field label="País" value="Bolivia" disabled required />
        <Field label="Departamento / Estado" value={known("La Paz")} required />
        <Field label="Ciudad" value={known("Acarapiri")} required />
        <Field label="Teléfono" value={known("45545454")} />
        <Field label="Móvil" value={known("71234567")} required />
      </div>
    </div>
  );
}
