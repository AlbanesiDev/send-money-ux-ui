"use client";

import { useRef, type RefObject } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";

const COUNTRY_OPTIONS = Array.from(
  new Set(
    countriesCatalog.items
      .map((item) => item.country.ctyName.trim())
      .filter((name) => name !== ""),
  ),
).sort((a, b) => a.localeCompare(b, "es"));

export function CountryField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  fieldRef,
  nextRef,
  showFlags = true,
  error,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  fieldRef?: RefObject<HTMLButtonElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  showFlags?: boolean;
  error?: string;
  onBlur?: () => void;
}) {
  const localRef = useRef<HTMLButtonElement>(null);
  const resolvedRef = fieldRef === undefined ? localRef : fieldRef;

  return (
    <SearchableSelect
      label={label}
      value={value}
      options={COUNTRY_OPTIONS}
      onChange={onChange}
      required={required}
      disabled={disabled}
      fieldRef={resolvedRef}
      nextRef={nextRef}
      showFlags={showFlags}
      error={error}
      onBlur={onBlur}
    />
  );
}
