"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { XIcon } from "lucide-react";

const REQUIRED_MESSAGE = "Este campo es requerido";
const EMAIL_MESSAGE = "Correo electrónico inválido";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORCE_VALIDATE_EVENT = "party-form-validate";

export function Field({
  label,
  value,
  required = false,
  placeholder = "",
  disabled = false,
  clearable = false,
  inputRef,
  nextRef,
  onChange,
  onBlur,
  error,
  numericOnly = false,
  email = false,
  name,
  maxLength,
}: {
  label: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  numericOnly?: boolean;
  email?: boolean;
  name?: string;
  maxLength?: number;
}) {
  const isControlled = onChange !== undefined;
  const [touched, setTouched] = useState(false);
  const [uncontrolledEmpty, setUncontrolledEmpty] = useState(false);
  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedInputRef = inputRef === undefined ? localInputRef : inputRef;

  useEffect(() => {
    function handleForceValidate(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const input = resolvedInputRef.current;
      if (input === null) return;
      if (!target.contains(input)) return;
      setTouched(true);
      setUncontrolledEmpty(input.value.trim() === "");
    }
    document.addEventListener(FORCE_VALIDATE_EVENT, handleForceValidate);
    return () =>
      document.removeEventListener(FORCE_VALIDATE_EVENT, handleForceValidate);
  }, [resolvedInputRef]);

  let resolvedError = "";
  if (error !== undefined && error !== "") {
    resolvedError = error;
  } else if (!disabled && touched) {
    if (required) {
      if (isControlled) {
        if (value === undefined || value.trim() === "") {
          resolvedError = REQUIRED_MESSAGE;
        }
      } else if (uncontrolledEmpty) {
        resolvedError = REQUIRED_MESSAGE;
      }
    }
    if (resolvedError === "" && email) {
      let emailValue = "";
      if (isControlled) {
        if (value !== undefined) {
          emailValue = value.trim();
        }
      }
      if (emailValue !== "" && !EMAIL_PATTERN.test(emailValue)) {
        resolvedError = EMAIL_MESSAGE;
      }
    }
  }
  const hasError = resolvedError !== "";

  const showClear =
    clearable &&
    !disabled &&
    isControlled &&
    value !== undefined &&
    value !== "";

  let inputClassName =
    "h-10 w-full rounded-lg border bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground";
  if (showClear) {
    inputClassName += " pr-9";
  }
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
      <span className={hasError ? "relative mb-3.5 block" : "relative block"}>
        <input
          ref={resolvedInputRef}
          name={name}
          value={isControlled ? (value === undefined ? "" : value) : undefined}
          defaultValue={isControlled ? undefined : value}
          type={email ? "email" : "text"}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          inputMode={numericOnly ? "numeric" : email ? "email" : undefined}
          autoComplete={email ? "email" : undefined}
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
            if (nextRef === undefined) return;
            event.preventDefault();
            nextRef.current?.focus();
          }}
          className={inputClassName}
        />
        {showClear && (
          <button
            type="button"
            aria-label={`Limpiar ${label.toLowerCase()}`}
            onClick={(event) => {
              event.preventDefault();
              if (onChange === undefined) return;
              onChange("");
              setUncontrolledEmpty(true);
              window.requestAnimationFrame(() =>
                resolvedInputRef.current?.focus(),
              );
            }}
            className="absolute top-1/2 right-2.5 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
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
