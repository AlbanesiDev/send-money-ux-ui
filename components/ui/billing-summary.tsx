export type BillingSummaryProps = {
  open: boolean;
  onToggle: () => void;
  name: string;
  nit: string;
  usingSender: boolean;
  onChange: (field: "name" | "nit", value: string) => void;
  onReset: () => void;
};

export function BillingSummary({
  open,
  onToggle,
  name,
  nit,
  usingSender,
  onChange,
  onReset,
}: BillingSummaryProps) {
  const inputClass =
    "h-10 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#263653] outline-none transition focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10";
  return (
    <section className="rounded-xl border border-[#dce3ee] bg-[#fbfcfe]">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#73809a]">
            Facturación
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#263653]">
            {name || "Sin nombre"} · NIT/CI {nit || "—"}
          </p>
          <p className="text-xs text-[#73809a]">
            {usingSender
              ? "Datos del remitente"
              : "Datos de facturación modificados"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="billing-fields"
          className="shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-[#465bc2] hover:bg-[#eef1fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#465bc2]"
        >
          {open ? "Cerrar" : "Cambiar"}
        </button>
      </div>
      {open && (
        <div
          id="billing-fields"
          className="flex flex-col gap-4 border-t border-[#e6ebf3] p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#263653]">
                Nombre o razón social
              </span>
              <input
                value={name}
                onChange={(e) => onChange("name", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#263653]">
                NIT / CI
              </span>
              <input
                value={nit}
                inputMode="numeric"
                onChange={(e) => onChange("nit", e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          {!usingSender && (
            <button
              type="button"
              onClick={onReset}
              className="self-start text-sm font-semibold text-[#465bc2] hover:underline"
            >
              Usar datos del remitente
            </button>
          )}
        </div>
      )}
    </section>
  );
}
