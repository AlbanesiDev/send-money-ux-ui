import type { RefObject } from "react";

export function Field({
  label,
  value,
  required = false,
  placeholder = "",
  disabled = false,
  inputRef,
  nextRef,
}: {
  label: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <input
        ref={inputRef}
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          nextRef?.current?.focus();
        }}
        className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-muted disabled:text-muted-foreground"
      />
    </label>
  );
}
