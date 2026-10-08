import { Field } from "../../field";
import type { Beneficiary } from "../../types";

export function RiaBeneficiaryStep({
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
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
                <p className="text-sm font-bold text-[#17233f]">{person.name}</p>
                <p className="mt-1 text-xs text-[#687790]">
                  {person.city} · ***{person.phone.slice(-3)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
      <h2 className="font-bold">Datos personales</h2>
      <div
        key={isKnownClient ? beneficiary.document : "new-beneficiary"}
        className="grid gap-5 sm:grid-cols-2"
      >
        <Field label="Tipo Documento" value="Cédula" disabled required />
        <Field
          label="Nro. de Documento"
          value={known(beneficiary.document)}
          required
        />
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
        <Field
          label="Correo electrónico"
          value={known(beneficiary.email)}
          required
        />
        <Field label="Nacionalidad" value={known("Boliviana")} required />
        <Field label="País Residencia" value={known("Bolivia")} required />
      </div>
      <h2 className="pt-4 font-bold">Datos de dirección</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Calle/Numero" value={known("Calle 123")} required />
        <Field label="Dirección" value={known("Calle 123")} required />
        <Field label="Estado" value={known("La Paz")} required />
        <Field label="Ciudad" value={known(beneficiary.city)} required />
        <Field
          label="Nro. Teléfono"
          value={known(beneficiary.phone)}
          required
        />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#465bc2]" />
        Guardar en mi lista de beneficiarios frecuentes
      </label>
    </div>
  );
}
