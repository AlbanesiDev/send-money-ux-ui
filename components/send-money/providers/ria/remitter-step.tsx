import type { Customer } from "../../types";
import { Field } from "../../field";

export function RiaRemitterStep({
  documentNumber,
  customer,
}: {
  documentNumber: string;
  customer: Customer | null;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-bold">Datos personales</h2>
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
          label="Correo electrónico"
          value={customer === null ? undefined : customer.email}
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
        <Field
          label="Estado"
          value={customer === null ? undefined : customer.state}
          required
        />
        <Field
          label="Ciudad"
          value={customer === null ? undefined : customer.city}
          required
        />
        <Field
          label="Dirección"
          value={customer === null ? undefined : customer.address}
          required
        />
        <Field
          label="Número de teléfono"
          value={customer === null ? undefined : customer.phone}
        />
      </div>
    </div>
  );
}
