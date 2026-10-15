"use client";

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { CountryFlag } from "@/components/ui/country-flag";
import { ChevronDownIcon } from "lucide-react";

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
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(filter.toLowerCase()),
  );

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    setFilter("");
    window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active === filterRef.current)
        (nextRef ?? fieldRef).current?.focus();
    });
  };

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
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
      setFilter("");
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`block self-start ${open ? "relative z-50" : "relative z-0"}`}
    >
      <span
        className={
          hideLabel
            ? "sr-only"
            : "mb-1 block text-sm font-semibold text-[#263653]"
        }
      >
        {label}
      </span>
      <div className="relative">
        <button
          ref={fieldRef}
          aria-label={hideLabel ? `${label}: ${value || "sin seleccionar"}` : undefined}
          type="button"
          disabled={disabled}
          aria-disabled={loading || undefined}
          aria-busy={loading}
          onClick={() => {
            if (!loading) setOpen((current) => !current);
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
          className="flex h-10 w-full items-center justify-between rounded-lg border border-[#cdd5e1] bg-white px-3 text-left text-sm text-[#17233f] outline-none focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10 disabled:bg-[#f3f5f9] disabled:text-[#8a96aa]"
        >
          {loading ? (
            <span
              role="status"
              className="flex items-center gap-2 text-[#5368c8]"
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-[#c9d1f0] border-t-[#465bc2]"
              />
              Cargando {label.toLowerCase()}...
            </span>
          ) : (
            <span
              className={`flex min-w-0 items-center gap-2 ${value ? "" : "text-[#8a96aa]"}`}
            >
              {showFlags && value && <CountryFlag country={value} />}
              <span className="truncate">
                {value || `Selecciona ${label.toLowerCase()}`}
              </span>
            </span>
          )}
          <span aria-hidden="true">
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </button>
        {open && (
          <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-lg border border-[#cdd5e1] bg-white p-2 shadow-lg">
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
              className="h-10 w-full rounded-md border border-[#dce3ee] px-3 text-sm outline-none focus:border-[#5368c8]"
            />{" "}
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
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-[#f4f6ff] ${
                    index === highlightedIndex
                      ? "bg-[#eef1ff] font-semibold text-[#465bc2]"
                      : value === option
                        ? "font-semibold text-[#465bc2]"
                        : ""
                  }`}
                >
                  {showFlags && <CountryFlag country={option} />}
                  <span className="truncate">{option}</span>
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-[#8a96aa]">
                  Sin resultados
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
