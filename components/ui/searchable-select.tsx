"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { CountryFlag } from "@/components/ui/country-flag";
import { ChevronDownIcon, XIcon } from "lucide-react";

const REQUIRED_MESSAGE = "Este campo es requerido";
const MENU_GAP_PX = 4;
const MENU_Z_INDEX = 200;

export type SearchableSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  fieldRef: RefObject<HTMLButtonElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  showFlags?: boolean;
  hideLabel?: boolean;
  dropdownSide?: "top" | "bottom";
  clearable?: boolean;
  error?: string;
  onBlur?: () => void;
  required?: boolean;
};

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  fieldRef,
  nextRef,
  showFlags = false,
  hideLabel = false,
  dropdownSide = "bottom",
  clearable = false,
  error,
  onBlur,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(filter.toLowerCase()),
  );

  const markTouched = () => {
    setTouched(true);
    if (onBlur !== undefined) onBlur();
  };

  const choose = (option: string) => {
    onChange(option);
    setTouched(true);
    setOpen(false);
    setFilter("");
    window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active === filterRef.current)
        (nextRef ?? fieldRef).current?.focus();
    });
  };

  const updateMenuPosition = () => {
    const trigger = fieldRef.current;
    if (trigger === null) return;
    const rect = trigger.getBoundingClientRect();
    if (dropdownSide === "top") {
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + MENU_GAP_PX,
        zIndex: MENU_Z_INDEX,
      });
      return;
    }
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      top: rect.bottom + MENU_GAP_PX,
      zIndex: MENU_Z_INDEX,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
    function handleReposition() {
      updateMenuPosition();
    }
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, dropdownSide]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = filteredOptions.indexOf(value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    window.requestAnimationFrame(() => filterRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setHighlightedIndex((current) => {
      if (filteredOptions.length === 0) return 0;
      if (current >= filteredOptions.length) return filteredOptions.length - 1;
      return current;
    });
  }, [filter, filteredOptions.length]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  useEffect(() => {
    if (loading) setOpen(false);
  }, [loading]);

  useEffect(() => {
    function handleForceValidate(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.contains(rootRef.current)) return;
      setTouched(true);
    }
    document.addEventListener("party-form-validate", handleForceValidate);
    return () =>
      document.removeEventListener("party-form-validate", handleForceValidate);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
      setFilter("");
      setTouched(true);
      if (onBlur !== undefined) onBlur();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onBlur]);

  let resolvedError = "";
  if (error !== undefined && error !== "") {
    resolvedError = error;
  } else if (required && !disabled && touched && value.trim() === "") {
    resolvedError = REQUIRED_MESSAGE;
  }
  const hasError = resolvedError !== "";
  let buttonClassName =
    "flex h-10 w-full items-center rounded-lg border bg-card py-0 pl-3 text-left text-sm text-foreground outline-none disabled:bg-muted disabled:text-muted-foreground";
  if (clearable && value) {
    buttonClassName += " pr-14";
  } else {
    buttonClassName += " pr-9";
  }
  if (hasError) {
    buttonClassName +=
      " border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/15";
  } else {
    buttonClassName +=
      " border-input focus:border-brand focus:ring-4 focus:ring-brand/10";
  }

  const menu =
    open && menuStyle !== null
      ? createPortal(
          <div
            ref={dropdownRef}
            style={menuStyle}
            className="rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg"
          >
            <input
              ref={filterRef}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  if (filteredOptions.length === 0) return;
                  setHighlightedIndex(
                    (current) => (current + 1) % filteredOptions.length,
                  );
                  return;
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  if (filteredOptions.length === 0) return;
                  setHighlightedIndex(
                    (current) =>
                      (current - 1 + filteredOptions.length) %
                      filteredOptions.length,
                  );
                  return;
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  const option = filteredOptions[highlightedIndex];
                  if (option) choose(option);
                  return;
                }
                if (event.key === "Escape") {
                  setOpen(false);
                  fieldRef.current?.focus();
                }
              }}
              placeholder="Filtrar opciones"
              aria-label={`Filtrar ${label.toLowerCase()}`}
              aria-activedescendant={
                filteredOptions[highlightedIndex]
                  ? `select-option-${highlightedIndex}`
                  : undefined
              }
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-brand"
            />
            <div
              role="listbox"
              aria-label={label}
              className="mt-1 max-h-48 overflow-y-auto"
            >
              {filteredOptions.map((option, index) => (
                <button
                  key={option}
                  id={`select-option-${index}`}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={value === option}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${
                    index === highlightedIndex
                      ? "bg-accent font-semibold text-brand-strong"
                      : value === option
                        ? "font-semibold text-brand-strong"
                        : ""
                  }`}
                >
                  {showFlags && <CountryFlag country={option} />}
                  <span className="truncate">{option}</span>
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Sin resultados
                </p>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative z-0 block w-full min-w-0 self-start">
      <span
        className={
          hideLabel
            ? "sr-only"
            : "mb-1 block text-sm font-semibold text-foreground"
        }
      >
        {label}
      </span>
      <div className="relative">
        <button
          ref={fieldRef}
          aria-label={
            hideLabel ? `${label}: ${value || "sin seleccionar"}` : undefined
          }
          type="button"
          disabled={disabled}
          aria-disabled={loading || undefined}
          aria-busy={loading}
          aria-required={required || undefined}
          aria-invalid={hasError}
          onClick={() => {
            if (loading) return;
            setOpen((current) => {
              if (current) {
                window.requestAnimationFrame(() => markTouched());
              }
              return !current;
            });
          }}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;
            if (
              nextTarget instanceof Node &&
              (rootRef.current?.contains(nextTarget) ||
                dropdownRef.current?.contains(nextTarget))
            ) {
              return;
            }
            markTouched();
          }}
          onKeyDown={(event) => {
            if (loading || disabled) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={buttonClassName}
        >
          {loading ? (
            <span role="status" className="flex items-center gap-2 text-brand">
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand-strong"
              />
              Cargando {label.toLowerCase()}...
            </span>
          ) : (
            <span
              className={`flex min-w-0 items-center gap-2 ${value ? "" : "text-muted-foreground"}`}
            >
              {showFlags && value && <CountryFlag country={value} />}
              <span className="truncate">
                {value || `Selecciona ${label.toLowerCase()}`}
              </span>
            </span>
          )}
        </button>
        {clearable && value && !disabled && !loading && (
          <button
            type="button"
            aria-label={`Limpiar ${label.toLowerCase()}`}
            onClick={() => {
              onChange("");
              setOpen(false);
              setFilter("");
              window.requestAnimationFrame(() => fieldRef.current?.focus());
            }}
            className="absolute top-1/2 right-8 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-foreground"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </span>
        {menu}
        {hasError && (
          <span
            role="alert"
            className="pointer-events-none absolute top-[calc(100%+0.125rem)] left-0 z-1 text-[0.6875rem] leading-none text-destructive"
          >
            {resolvedError}
          </span>
        )}
      </div>
    </div>
  );
}
