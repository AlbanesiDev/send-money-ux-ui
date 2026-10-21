"use client";

import { useState, type RefObject } from "react";

const REQUIRED_MESSAGE = "Este campo es requerido";

export function Field({
  label,
  value,
  required = false,
  placeholder = "",
  disabled = false,
  inputRef,
  nextRef,
  onChange,
  onBlur,
  error,
  numericOnly = false,
  name,
}: {
  label: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  numericOnly?: boolean;
  name?: string;
}) {
  const isControlled = onChange !== undefined;
  const [touched, setTouched] = useState(false);
  const [uncontrolledEmpty, setUncontrolledEmpty] = useState(false);

  let resolvedError = "";
  if (error !== undefined && error !== "") {
    resolvedError = error;
  } else if (required && !disabled && touched) {
    if (isControlled) {
      if (value === undefined || value.trim() === "") {
        resolvedError = REQUIRED_MESSAGE;
      }
    } else if (uncontrolledEmpty) {
      resolvedError = REQUIRED_MESSAGE;
    }
  }
  const hasError = resolvedError !== "";

  let inputClassName =
    "h-10 w-full rounded-lg border bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground";
  if (hasError) {
    inputClassName +=
      " border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/15";
  } else {
    inputClassName +=
      " border-input focus:border-brand focus:ring-4 focus:ring-brand/10";
  }

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <span className="relative block">
        <input
          ref={inputRef}
          name={name}
          value={isControlled ? (value === undefined ? "" : value) : undefined}
          defaultValue={isControlled ? undefined : value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          inputMode={numericOnly ? "numeric" : undefined}
          aria-invalid={hasError}
          onChange={(event) => {
            let nextValue = event.target.value;
            if (numericOnly) {
              nextValue = nextValue.replace(/\D/g, "");
              event.target.value = nextValue;
            }
            if (touched) {
              setUncontrolledEmpty(nextValue.trim() === "");
            }
            if (onChange === undefined) return;
            onChange(nextValue);
          }}
          onBlur={(event) => {
            setTouched(true);
            setUncontrolledEmpty(event.currentTarget.value.trim() === "");
            if (onBlur !== undefined) onBlur();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            nextRef?.current?.focus();
          }}
          className={inputClassName}
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
