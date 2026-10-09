export function Field({
  label,
  value,
  required = false,
  placeholder = "",
  disabled = false,
}: {
  label: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-[#263653]">
        {label} {required && <span className="text-[#c73750]">*</span>}
      </span>
      <input
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        className="h-10 w-full rounded-lg border border-[#cdd5e1] bg-white px-3 text-sm text-[#263653] outline-none transition placeholder:text-[#a2adbf] focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10 disabled:bg-[#f7f8fb] disabled:text-[#73809a]"
      />
    </label>
  );
}
