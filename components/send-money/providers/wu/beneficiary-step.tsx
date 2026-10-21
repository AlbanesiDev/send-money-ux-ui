import { Field } from "../../field";
import { FrequentBeneficiaries } from "../../frequent-beneficiaries";
import type { Beneficiary } from "../../types";

export function WuBeneficiaryStep({
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
  let middleName: string | undefined;
  let lastName: string | undefined;
  let secondLastName: string | undefined;
  let city: string | undefined;
  let phone: string | undefined;
  if (beneficiary !== undefined) {
    const nameParts = beneficiary.name.split(" ");
    firstName = nameParts[0];
    middleName = nameParts[1];
    lastName = nameParts[2];
    secondLastName = nameParts[3];
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
        <Field label="Segundo Nombre" value={known(middleName)} />
        <Field label="Primer Apellido" value={known(lastName)} required />
        <Field label="Segundo Apellido" value={known(secondLastName)} />
        <Field label="Estado" value={known("La Paz")} required />
        <Field label="Ciudad" value={known(city)} required />
        <Field label="Calle/Numero" value={known("Calle 123")} required />
        <Field label="Dirección" value={known("Calle 123")} required />
        <Field
          label="Nro. Teléfono"
          value={known(phone)}
          required
          numericOnly
        />
      </div>
    </div>
  );
}
