import { Field } from "../../field";
import type { Beneficiary } from "../../types";

export function TerrapayBeneficiaryStep({
  isKnownClient,
  beneficiaries,
  selectedBeneficiary,
  onSelectBeneficiary,
  known,
}: {
  isKnownClient: boolean;
  beneficiaries: Beneficiary[];
  selectedBeneficiary: number;
  onSelectBeneficiary: (index: number) => void;
  known: (value?: string) => string | undefined;
}) {
  const beneficiary = beneficiaries[selectedBeneficiary];
  return (
    <div className="space-y-6">
      {isKnownClient && (
        <div>
          <h2 className="font-bold">Beneficiarios frecuentes</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {beneficiaries.map((person, index) => (
              <button
                key={person.document}
                type="button"
                onClick={() => onSelectBeneficiary(index)}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${
                  selectedBeneficiary === index
                    ? "border-[#5368c8] bg-[#f4f6ff]"
                    : "border-[#dce3ee] bg-white hover:border-[#aebcf0]"
                }`}
              >
                <p className="text-sm font-bold text-[#17233f]">
                  {person.name}
                </p>
                <p className="mt-1 text-xs text-[#687790]">
                  {person.city} · ***{person.phone.slice(-3)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
      <h2 className="font-bold">Datos del beneficiario</h2>
      <div
        key={isKnownClient ? beneficiary.document : "new-beneficiary"}
        className="grid gap-3 sm:grid-cols-2"
      >
        <Field
          label="Nombre"
          value={known(beneficiary.name.split(" ")[0])}
          required
        />
        <Field
          label="Primer Apellido"
          value={known(beneficiary.name.split(" ")[2])}
          required
        />
        <Field label="Tipo ID beneficiario" value={known("Cédula")} required />
        <Field
          label="Nro. ID beneficiario"
          value={known(beneficiary.document)}
          required
        />
        <Field label="Nacionalidad" value={known("Boliviana")} />
        <Field label="Código Postal" value={known("0000")} />
        <Field label="Cód. Móvil" value={known("+591")} required />
        <Field
          label="Nro. Teléfono"
          value={known(beneficiary.phone)}
          required
        />
        <Field label="Calle/Numero" value={known("Calle 123")} required />
        <Field label="Dirección" value={known("Calle 123")} required />
        <Field label="Estado" value={known("La Paz")} required />
        <Field label="Ciudad" value={known(beneficiary.city)} required />
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
