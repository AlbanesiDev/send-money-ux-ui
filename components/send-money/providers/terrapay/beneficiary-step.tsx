import { Field } from "../../field";
import { FrequentBeneficiaries } from "../../frequent-beneficiaries";
import type { Beneficiary } from "../../types";

export function TerrapayBeneficiaryStep({
  showFrequentBeneficiaries,
  fillBeneficiaryFields,
  beneficiaries,
  selectedBeneficiary,
  onSelectBeneficiary,
  known,
}: {
  showFrequentBeneficiaries: boolean;
  fillBeneficiaryFields: boolean;
  beneficiaries: Beneficiary[];
  selectedBeneficiary: number;
  onSelectBeneficiary: (index: number) => void;
  known: (value?: string) => string | undefined;
}) {
  let formBeneficiaryIndex = 0;
  if (selectedBeneficiary >= 0) {
    formBeneficiaryIndex = selectedBeneficiary;
  }
  const beneficiary = beneficiaries[formBeneficiaryIndex];

  let formKey = "new-beneficiary";
  let firstName: string | undefined;
  let lastName: string | undefined;
  let document: string | undefined;
  let city: string | undefined;
  let phone: string | undefined;
  if (beneficiary !== undefined) {
    const nameParts = beneficiary.name.split(" ");
    firstName = nameParts[0];
    lastName = nameParts[2];
    document = beneficiary.document;
    city = beneficiary.city;
    phone = beneficiary.phone;
    if (fillBeneficiaryFields) {
      formKey = beneficiary.document;
    }
  }

  return (
    <div className="space-y-6">
      {showFrequentBeneficiaries && (
        <FrequentBeneficiaries
          beneficiaries={beneficiaries}
          selectedBeneficiary={selectedBeneficiary}
          onSelectBeneficiary={onSelectBeneficiary}
        />
      )}
      <h2 className="font-bold">Datos del beneficiario</h2>
      <div key={formKey} className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" value={known(firstName)} required />
        <Field label="Primer Apellido" value={known(lastName)} required />
        <Field label="Tipo ID beneficiario" value={known("Cédula")} required />
        <Field
          label="Nro. ID beneficiario"
          value={known(document)}
          required
          numericOnly
        />
        <Field label="Nacionalidad" value={known("Boliviana")} />
        <Field label="Código Postal" value={known("0000")} />
        <Field label="Cód. Móvil" value={known("+591")} required />
        <Field
          label="Nro. Teléfono"
          value={known(phone)}
          required
          numericOnly
        />
        <Field label="Calle/Numero" value={known("Calle 123")} required />
        <Field label="Dirección" value={known("Calle 123")} required />
        <Field label="Estado" value={known("La Paz")} required />
        <Field label="Ciudad" value={known(city)} required />
      </div>
      <h2 className="pt-4 font-bold">Envío directo al banco / billetera</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Forma de Entrega"
          value={known("Cuenta bancaria")}
          required
        />
        <Field label="Banco" value={known("Banco Nacional")} required />
        <Field label="Wallet" value={known("—")} />
        <Field label="Nro. Cuenta" value={known("9876543210")} required />
      </div>
    </div>
  );
}
