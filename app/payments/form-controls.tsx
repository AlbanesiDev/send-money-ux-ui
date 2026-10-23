"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";

const inputClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive";

function FieldLabel({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <span className="mb-1 flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
      <span>
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {hint && (
        <span className="text-[0.6875rem] font-semibold text-success">
          {hint}
        </span>
      )}
    </span>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  type = "text",
  inputMode,
  placeholder,
  hint,
  missing = false,
  error,
  fieldRef,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "date" | "tel";
  inputMode?: "numeric" | "text" | "email" | "tel";
  placeholder?: string;
  /** Texto corto a la derecha de la etiqueta (p. ej. "De la operación"). */
  hint?: string;
  /** Resalta el campo cuando es obligatorio y está vacío. */
  missing?: boolean;
  error?: string;
  fieldRef?: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
}) {
  let resolvedError = "";
  if (error !== undefined && error !== "") {
    resolvedError = error;
  } else if (missing && required && value.trim() === "") {
    resolvedError = "Este campo es requerido";
  }
  const hasError = resolvedError !== "";

  return (
    <label className="block min-w-0">
      <FieldLabel label={label} required={required} hint={hint} />
      <span className="relative block">
        <input
          ref={fieldRef}
          type={type}
          inputMode={inputMode}
          value={value}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-invalid={hasError || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
        {hasError && (
          <span
            role="alert"
            className="pointer-events-none absolute top-[calc(100%+0.125rem)] left-0 z-1 text-[0.6875rem] leading-none text-destructive"
          >
            {resolvedError}
          </span>
        )}
      </span>
    </label>
  );
}

export function SelectInput({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  showFlags = false,
  menuMinWidth,
  hint,
  missing = false,
  error,
  nextRef,
}: {
  label: string;
  value: string;
  options: Array<string | SearchableSelectOption>;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  showFlags?: boolean;
  menuMinWidth?: number;
  hint?: string;
  missing?: boolean;
  error?: string;
  nextRef?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  let resolvedError = "";
  if (error !== undefined && error !== "") {
    resolvedError = error;
  } else if (missing && required && value.trim() === "") {
    resolvedError = "Este campo es requerido";
  }

  return (
    <div className="min-w-0">
      <FieldLabel label={label} required={required} hint={hint} />
      <SearchableSelect
        label={label}
        hideLabel
        value={value}
        options={options}
        onChange={onChange}
        disabled={disabled}
        fieldRef={ref}
        nextRef={nextRef}
        showFlags={showFlags}
        menuMinWidth={menuMinWidth}
        required={required}
        error={resolvedError}
      />
    </div>
  );
}

export function CheckOption({
  label,
  description,
  checked,
  onChange,
  locked = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Marcado por una regla de cumplimiento; el cajero no puede desmarcarlo. */
  locked?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
        checked ? "border-brand/40 bg-accent" : "border-border"
      } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-brand-strong"
      />
      <span>
        <span className="block font-semibold text-foreground select-none">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function FormSection({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-card p-4 ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-foreground">{title}</h2>
          {description && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
