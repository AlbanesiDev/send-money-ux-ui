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
const MENU_ESTIMATED_HEIGHT_PX = 260;

export type SearchableSelectOption = {
  value: string;
  label: string;
  flagCountry: string;
  keywords: string;
};

export type SearchableSelectProps = {
  label: string;
  value: string;
  options: Array<string | SearchableSelectOption>;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  fieldRef: RefObject<HTMLButtonElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  showFlags?: boolean;
  hideLabel?: boolean;
  dropdownSide?: "top" | "bottom";
  /** Ancho mínimo del menú en px (útil cuando el trigger es más angosto que las opciones). */
  menuMinWidth?: number;
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
  menuMinWidth,
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
  const normalizedOptions: SearchableSelectOption[] = options.map((option) => {
    if (typeof option === "string") {
      return {
        value: option,
        label: option,
        flagCountry: option,
        keywords: option,
      };
    }
    return option;
  });
  const query = filter.toLowerCase();
  const filteredOptions = normalizedOptions.filter((option) => {
    if (option.label.toLowerCase().includes(query)) return true;
    if (option.value.toLowerCase().includes(query)) return true;
    if (option.flagCountry.toLowerCase().includes(query)) return true;
    if (option.keywords.toLowerCase().includes(query)) return true;
    return false;
  });
  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  const markTouched = () => {
    setTouched(true);
    if (onBlur !== undefined) onBlur();
  };

  const choose = (option: SearchableSelectOption) => {
    onChange(option.value);
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
    const width =
      menuMinWidth !== undefined && menuMinWidth > rect.width
        ? menuMinWidth
        : rect.width;
    const menuHeight =
      dropdownRef.current === null
        ? MENU_ESTIMATED_HEIGHT_PX
        : dropdownRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX;
    const spaceAbove = rect.top - MENU_GAP_PX;
    let side = dropdownSide;
    if (
      dropdownSide === "bottom" &&
      spaceBelow < menuHeight &&
      spaceAbove > spaceBelow
    ) {
      side = "top";
    } else if (
      dropdownSide === "top" &&
      spaceAbove < menuHeight &&
      spaceBelow > spaceAbove
    ) {
      side = "bottom";
    }
    if (side === "top") {
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width,
        bottom: window.innerHeight - rect.top + MENU_GAP_PX,
        zIndex: MENU_Z_INDEX,
      });
      return;
    }
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width,
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
    const rafId = window.requestAnimationFrame(() => {
      updateMenuPosition();
    });
    function handleReposition() {
      updateMenuPosition();
    }
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, dropdownSide, menuMinWidth]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = filteredOptions.findIndex(
      (option) => option.value === value,
    );
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
                  key={`${option.value}-${option.flagCountry}-${index}`}
                  id={`select-option-${index}`}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${
                    index === highlightedIndex
                      ? "bg-accent font-semibold text-brand-strong"
                      : value === option.value
                        ? "font-semibold text-brand-strong"
                        : ""
                  }`}
                >
                  {showFlags && <CountryFlag country={option.flagCountry} />}
                  <span className="truncate">{option.label}</span>
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
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <div className={hasError ? "relative mb-3.5" : "relative"}>
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
              {showFlags && selectedOption !== undefined && (
                <CountryFlag country={selectedOption.flagCountry} />
              )}
              <span className="truncate">
                {selectedOption !== undefined
                  ? selectedOption.value
                  : value || `Selecciona ${label.toLowerCase()}`}
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
