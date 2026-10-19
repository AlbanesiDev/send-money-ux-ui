import type { Customer } from "../../types";
import { Field } from "../../field";

export function TerrapayRemitterStep({
  documentNumber,
  customer,
}: {
  documentNumber: string;
  customer: Customer | null;
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
        <Field
          label="País de emisión"
          value={customer === null ? undefined : customer.documentIssueCountry}
          required
        />
        <Field
          label="Fecha de emisión"
          value={customer === null ? undefined : customer.documentIssueDate}
          required
        />
        <Field
          label="Fecha de vencimiento"
          value={customer === null ? undefined : customer.documentExpiryDate}
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
        <Field
          label="Nombre"
          value={customer === null ? undefined : customer.firstName}
          required
        />
        <Field
          label="Segundo nombre"
          value={customer === null ? undefined : customer.middleName}
        />
        <Field
          label="Primer apellido"
          value={customer === null ? undefined : customer.lastName}
          required
        />
        <Field
          label="Segundo apellido"
          value={customer === null ? undefined : customer.secondLastName}
        />
        <Field
          label="Fecha de nacimiento"
          value={customer === null ? undefined : customer.birthDate}
          required
        />
        <Field
          label="País de nacimiento"
          value={customer === null ? undefined : customer.birthCountry}
          required
        />
        <Field
          label="Nacionalidad"
          value={customer === null ? undefined : customer.nationality}
          required
        />
        <Field
          label="Género"
          value={customer === null ? undefined : customer.gender}
          required
        />
        <Field
          label="Estado civil"
          value={customer === null ? undefined : customer.civilStatus}
          required
        />
        <Field label="Nombre del cónyuge" />
        <Field
          label="Correo electrónico"
          value={customer === null ? undefined : customer.email}
          required
        />
        <Field label="Comentarios" />
      </div>
      <h2 className="pt-4 font-bold">Domicilio y teléfono</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Calle"
          value={customer === null ? undefined : customer.street}
          required
        />
        <Field
          label="Nro. casa"
          value={customer === null ? undefined : customer.houseNumber}
          required
        />
        <Field
          label="Dirección 2"
          value={customer === null ? undefined : customer.address2}
        />
        <Field
          label="Zona"
          value={customer === null ? undefined : customer.zone}
          required
        />
        <Field
          label="Código postal"
          value={customer === null ? undefined : customer.postalCode}
        />
        <Field label="País" value="Bolivia" disabled required />
        <Field
          label="Departamento / Estado"
          value={customer === null ? undefined : customer.state}
          required
        />
        <Field
          label="Ciudad"
          value={customer === null ? undefined : customer.city}
          required
        />
        <Field
          label="Teléfono"
          value={customer === null ? undefined : customer.phone}
        />
        <Field
          label="Móvil"
          value={customer === null ? undefined : customer.mobile}
          required
        />
      </div>
    </div>
  );
}
