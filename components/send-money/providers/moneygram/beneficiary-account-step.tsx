import type { MoneygramAccountDraft } from "@/lib/simulated-api/moneygram-accounts-api";
import { Field } from "../../field";

export type MoneygramAccountFormChangeHandler = (
  field: keyof MoneygramAccountDraft,
  value: string,
) => void;

export function MoneygramBeneficiaryAccountStep({
  form,
  onFormChange,
  destinationCountry,
}: {
  form: MoneygramAccountDraft;
  onFormChange: MoneygramAccountFormChangeHandler;
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
        <Field
          label="Compañía"
          value={form.company}
          onChange={(value) => onFormChange("company", value)}
        />
        <Field
          label="Nro de cuenta"
          value={form.accountNumber}
          required
          numericOnly
          onChange={(value) => onFormChange("accountNumber", value)}
        />
        <Field
          label="Codigo de Localidad"
          value={form.locationCode}
          onChange={(value) => onFormChange("locationCode", value)}
        />
        <Field
          label="Referencia"
          value={form.reference}
          required
          onChange={(value) => onFormChange("reference", value)}
        />
        <Field
          label="Atención"
          value={form.attention}
          required
          onChange={(value) => onFormChange("attention", value)}
        />
        <Field
          label="Calle/Numero"
          value={form.street}
          onChange={(value) => onFormChange("street", value)}
        />
        <Field
          label="Dirección"
          value={form.address}
          onChange={(value) => onFormChange("address", value)}
        />
        <Field
          label="Estado"
          value={form.state}
          required={stateCityRequired}
          onChange={(value) => onFormChange("state", value)}
        />
        <Field
          label="Ciudad"
          value={form.city}
          required={stateCityRequired}
          onChange={(value) => onFormChange("city", value)}
        />
        <Field
          label="Nro. Teléfono"
          value={form.phone}
          numericOnly
          onChange={(value) => onFormChange("phone", value)}
        />
      </div>
    </div>
  );
}
