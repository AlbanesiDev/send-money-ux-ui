import { Field } from "../../field";
import type { Beneficiary } from "../../types";

export function WuBeneficiaryStep({
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
          label="Segundo Nombre"
          value={known(beneficiary.name.split(" ")[1])}
        />
        <Field
          label="Primer Apellido"
          value={known(beneficiary.name.split(" ")[2])}
          required
        />
        <Field
          label="Segundo Apellido"
          value={known(beneficiary.name.split(" ")[3])}
        />
        <Field label="Estado (MX)" value={known("La Paz")} />
        <Field label="Ciudad (MX)" value={known(beneficiary.city)} />
        <Field label="Estado" value={known("La Paz")} required />
        <Field label="Ciudad" value={known(beneficiary.city)} required />
        <Field label="Calle/Numero" value={known("Calle 123")} required />
        <Field label="Dirección" value={known("Calle 123")} required />
        <Field
          label="Nro. Teléfono"
          value={known(beneficiary.phone)}
          required
        />
      </div>
    </div>
  );
}
