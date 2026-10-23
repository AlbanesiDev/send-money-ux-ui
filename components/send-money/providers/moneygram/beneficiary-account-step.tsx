import { Field } from "../../field";

export function MoneygramBeneficiaryAccountStep({
  known,
  destinationCountry,
}: {
  known: (value?: string) => string | undefined;
  destinationCountry: string;
}) {
  let stateCityRequired = false;
  if (
    destinationCountry === "Mexico" ||
    destinationCountry === "United States" ||
    destinationCountry === "Canada"
  ) {
    stateCityRequired = true;
  }

  return (
    <div data-beneficiary-form className="space-y-6">
      <h2 className="font-bold">Datos de cuenta / compañía</h2>
      <p className="text-sm text-muted-foreground">
        Moneygram utiliza datos de compañía y cuenta en lugar de nombre de
        persona.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Compañía" value={known("Sol & Luna Pagos")} />
        <Field label="Nro de cuenta" value={known("001234567890")} required />
        <Field label="Codigo de Localidad" value={known("LPZ-001")} />
        <Field label="Referencia" value={known("REF-77821")} required />
        <Field label="Atención" value={known("Caja central")} required />
        <Field label="Calle/Numero" value={known("Av. Camacho 450")} />
        <Field label="Dirección" value={known("Av. Camacho 450, piso 2")} />
        <Field
          label="Estado"
          value={known("La Paz")}
          required={stateCityRequired}
        />
        <Field
          label="Ciudad"
          value={known("La Paz")}
          required={stateCityRequired}
        />
        <Field label="Nro. Teléfono" value={known("22123456")} numericOnly />
      </div>
    </div>
  );
}
