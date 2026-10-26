"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const REQUIRED_MESSAGE = "Este campo es requerido";
const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const MONTH_SHORT_LABELS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

type CalendarPanel = "day" | "month" | "year";

function parseDisplayDate(value: string): Date | null {
  if (value.length !== 10) return null;
  const day = Number(value.slice(0, 2));
  const month = Number(value.slice(3, 5));
  const year = Number(value.slice(6, 10));
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function formatDisplayDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getFullYear()).padStart(4, "0")}`;
}

export function DateField({
  label,
  value,
  required = false,
  disabled = false,
  minimumAgeYears,
  disableFutureDates = false,
  maxDate = "",
  minDate = "",
  inputRef,
  nextRef,
  onChange,
  onBlur,
  error,
  name,
}: {
  label: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  minimumAgeYears?: number;
  disableFutureDates?: boolean;
  maxDate?: string;
  minDate?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  nextRef?: RefObject<HTMLElement | null>;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  name?: string;
}) {
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const [calendarPanel, setCalendarPanel] = useState<CalendarPanel>("day");
  const rootRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = inputRef === undefined ? localInputRef : inputRef;

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayValue = formatDisplayDate(today);

  let maxAllowedDate: Date | null = null;
  if (minimumAgeYears !== undefined) {
    maxAllowedDate = new Date(
      today.getFullYear() - minimumAgeYears,
      today.getMonth(),
      today.getDate(),
    );
  } else if (disableFutureDates) {
    maxAllowedDate = today;
  }
  const explicitMaxDate = parseDisplayDate(maxDate);
  if (explicitMaxDate !== null) {
    if (maxAllowedDate === null || explicitMaxDate < maxAllowedDate) {
      maxAllowedDate = explicitMaxDate;
    }
  }
  const minAllowedDate: Date | null = parseDisplayDate(minDate);

  let selectedDay = 0;
  let selectedMonth = 0;
  let selectedYear = 0;
  const selectedDate = parseDisplayDate(value);
  if (selectedDate !== null) {
    selectedDay = selectedDate.getDate();
    selectedMonth = selectedDate.getMonth() + 1;
    selectedYear = selectedDate.getFullYear();
  }

  const defaultViewDate = maxAllowedDate === null ? today : maxAllowedDate;
  let initialViewYear = defaultViewDate.getFullYear();
  let initialViewMonth = defaultViewDate.getMonth();
  if (selectedDate !== null) {
    const withinMax = maxAllowedDate === null || selectedDate <= maxAllowedDate;
    const withinMin = minAllowedDate === null || selectedDate >= minAllowedDate;
    if (withinMax && withinMin) {
      initialViewYear = selectedYear;
      initialViewMonth = selectedMonth - 1;
    }
  }
  const [viewYear, setViewYear] = useState(initialViewYear);
  const [viewMonth, setViewMonth] = useState(initialViewMonth);

  useEffect(() => {
    if (!open) return;
    setCalendarPanel("day");
    if (selectedDate !== null) {
      const withinMax =
        maxAllowedDate === null || selectedDate <= maxAllowedDate;
      const withinMin =
        minAllowedDate === null || selectedDate >= minAllowedDate;
      if (withinMax && withinMin) {
        setViewYear(selectedYear);
        setViewMonth(selectedMonth - 1);
        return;
      }
    }
    setViewYear(defaultViewDate.getFullYear());
    setViewMonth(defaultViewDate.getMonth());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
      setCalendarPanel("day");
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

  let inputClassName =
    "h-10 w-full rounded-lg border bg-card py-0 pr-10 pl-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground";
  if (hasError) {
    inputClassName +=
      " border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/15";
  } else {
    inputClassName +=
      " border-input focus:border-brand focus:ring-4 focus:ring-brand/10";
  }

  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarCells: Array<number | null> = [];
  for (let index = 0; index < firstWeekday; index += 1) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarCells.push(day);
  }

  const yearGridStart = Math.floor(viewYear / 12) * 12;

  let canGoPrev = false;
  let canGoNext = false;
  if (calendarPanel === "day") {
    canGoPrev =
      minAllowedDate === null ||
      new Date(viewYear, viewMonth, 0) >= minAllowedDate;
    canGoNext =
      maxAllowedDate === null ||
      new Date(viewYear, viewMonth + 1, 1) <= maxAllowedDate;
  } else if (calendarPanel === "month") {
    canGoPrev =
      minAllowedDate === null || viewYear - 1 >= minAllowedDate.getFullYear();
    canGoNext =
      maxAllowedDate === null || viewYear + 1 <= maxAllowedDate.getFullYear();
  } else {
    canGoPrev =
      minAllowedDate === null ||
      yearGridStart - 1 >= minAllowedDate.getFullYear();
    canGoNext =
      maxAllowedDate === null ||
      yearGridStart + 12 <= maxAllowedDate.getFullYear();
  }

  let headerLabel = "";
  let headerAriaLabel = "";
  let canDrillUp = false;
  if (calendarPanel === "day") {
    headerLabel = `${MONTH_LABELS[viewMonth]} de ${viewYear}`;
    headerAriaLabel = "Elegir mes";
    canDrillUp = true;
  } else if (calendarPanel === "month") {
    headerLabel = String(viewYear);
    headerAriaLabel = "Elegir año";
    canDrillUp = true;
  } else {
    headerLabel = `${yearGridStart} – ${yearGridStart + 11}`;
    headerAriaLabel = "Rango de años";
    canDrillUp = false;
  }

  let prevAriaLabel = "Mes anterior";
  let nextAriaLabel = "Mes siguiente";
  if (calendarPanel === "month") {
    prevAriaLabel = "Año anterior";
    nextAriaLabel = "Año siguiente";
  } else if (calendarPanel === "year") {
    prevAriaLabel = "Años anteriores";
    nextAriaLabel = "Años siguientes";
  }

  const todaySelectable =
    minimumAgeYears === undefined &&
    (maxAllowedDate === null || today <= maxAllowedDate) &&
    (minAllowedDate === null || today >= minAllowedDate);

  function clampToAllowedRange(date: Date): string {
    let next = date;
    if (maxAllowedDate !== null && next > maxAllowedDate) {
      next = maxAllowedDate;
    }
    if (minAllowedDate !== null && next < minAllowedDate) {
      next = minAllowedDate;
    }
    return formatDisplayDate(next);
  }

  return (
    <div
      ref={rootRef}
      className={`block w-full min-w-0 self-start ${open ? "relative z-50" : "relative z-0"}`}
    >
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <div className={hasError ? "relative mb-3.5" : "relative"}>
        <input
          ref={textInputRef}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/yyyy"
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-expanded={open}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
            let dayDigits = digits.slice(0, 2);
            let monthDigits = digits.slice(2, 4);
            const yearDigits = digits.slice(4, 8);

            if (dayDigits.length === 2) {
              let dayNumber = Number(dayDigits);
              if (dayNumber < 1) dayNumber = 1;
              if (dayNumber > 31) dayNumber = 31;
              dayDigits = String(dayNumber).padStart(2, "0");
            } else if (dayDigits.length === 1 && Number(dayDigits) > 3) {
              dayDigits = `0${dayDigits}`;
            }

            if (monthDigits.length === 2) {
              let monthNumber = Number(monthDigits);
              if (monthNumber < 1) monthNumber = 1;
              if (monthNumber > 12) monthNumber = 12;
              monthDigits = String(monthNumber).padStart(2, "0");
            } else if (monthDigits.length === 1 && Number(monthDigits) > 1) {
              monthDigits = `0${monthDigits}`;
            }

            let nextValue = dayDigits;
            if (monthDigits !== "" || yearDigits !== "") {
              nextValue = `${dayDigits}/${monthDigits}`;
            }
            if (yearDigits !== "") {
              nextValue = `${dayDigits}/${monthDigits}/${yearDigits}`;
            }

            if (nextValue.length === 10) {
              const dayNumber = Number(dayDigits);
              const monthNumber = Number(monthDigits);
              const yearNumber = Number(yearDigits);
              const maxDay = new Date(yearNumber, monthNumber, 0).getDate();
              let safeDay = dayNumber;
              if (safeDay > maxDay) {
                safeDay = maxDay;
              }
              const typedDate = new Date(yearNumber, monthNumber - 1, safeDay);
              nextValue = clampToAllowedRange(typedDate);
            }

            onChange(nextValue);
          }}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;
            if (
              nextTarget instanceof Node &&
              rootRef.current?.contains(nextTarget)
            ) {
              return;
            }
            if (value.length === 10) {
              const typedDate = parseDisplayDate(value);
              if (typedDate !== null) {
                const clamped = clampToAllowedRange(typedDate);
                if (clamped !== value) {
                  onChange(clamped);
                }
              }
            }
            setOpen(false);
            setCalendarPanel("day");
            setTouched(true);
            if (onBlur !== undefined) onBlur();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setCalendarPanel("day");
              return;
            }
            if (event.key === "ArrowDown" && !open) {
              event.preventDefault();
              setOpen(true);
              return;
            }
            if (event.key !== "Enter") return;
            setOpen(false);
            setCalendarPanel("day");
            if (nextRef === undefined) return;
            event.preventDefault();
            nextRef.current?.focus();
          }}
          className={inputClassName}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={`Abrir calendario de ${label}`}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
            window.requestAnimationFrame(() => {
              textInputRef.current?.focus();
            });
          }}
          className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <CalendarIcon className="size-4" />
        </button>
        {open && !disabled && (
          <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg">
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label={prevAriaLabel}
                disabled={!canGoPrev}
                onClick={() => {
                  if (!canGoPrev) return;
                  if (calendarPanel === "day") {
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear((current) => current - 1);
                      return;
                    }
                    setViewMonth((current) => current - 1);
                    return;
                  }
                  if (calendarPanel === "month") {
                    setViewYear((current) => current - 1);
                    return;
                  }
                  setViewYear(yearGridStart - 12);
                }}
                className="grid size-8 place-items-center rounded-md text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
              <button
                type="button"
                aria-label={headerAriaLabel}
                disabled={!canDrillUp}
                onClick={() => {
                  if (!canDrillUp) return;
                  if (calendarPanel === "day") {
                    setCalendarPanel("month");
                    return;
                  }
                  setCalendarPanel("year");
                }}
                className="rounded-md px-2 py-1 text-sm font-semibold capitalize text-foreground hover:bg-accent disabled:pointer-events-none disabled:hover:bg-transparent"
              >
                {headerLabel}
              </button>
              <button
                type="button"
                aria-label={nextAriaLabel}
                disabled={!canGoNext}
                onClick={() => {
                  if (!canGoNext) return;
                  if (calendarPanel === "day") {
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear((current) => current + 1);
                      return;
                    }
                    setViewMonth((current) => current + 1);
                    return;
                  }
                  if (calendarPanel === "month") {
                    setViewYear((current) => current + 1);
                    return;
                  }
                  setViewYear(yearGridStart + 12);
                }}
                className="grid size-8 place-items-center rounded-md text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRightIcon className="size-4" />
              </button>
            </div>
            {calendarPanel === "day" && (
              <>
                <div className="mb-1 grid grid-cols-7 gap-1">
                  {WEEKDAY_LABELS.map((weekday) => (
                    <span
                      key={weekday}
                      className="grid h-8 place-items-center text-[0.6875rem] font-semibold text-muted-foreground"
                    >
                      {weekday}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((day, index) => {
                    if (day === null) {
                      return <span key={`empty-${index}`} className="h-8" />;
                    }
                    const cellDate = new Date(viewYear, viewMonth, day);
                    const isAfterMax =
                      maxAllowedDate !== null && cellDate > maxAllowedDate;
                    const isBeforeMin =
                      minAllowedDate !== null && cellDate < minAllowedDate;
                    const isDisabledDay = isAfterMax || isBeforeMin;
                    const isSelected =
                      selectedDay === day &&
                      selectedMonth === viewMonth + 1 &&
                      selectedYear === viewYear;
                    const isToday =
                      day === today.getDate() &&
                      viewMonth === today.getMonth() &&
                      viewYear === today.getFullYear();
                    let dayClassName =
                      "grid h-8 place-items-center rounded-md text-sm";
                    if (isDisabledDay) {
                      dayClassName +=
                        " cursor-not-allowed text-muted-foreground/40";
                    } else {
                      dayClassName += " hover:bg-accent";
                      if (isSelected) {
                        dayClassName +=
                          " bg-brand-strong font-semibold text-white hover:bg-brand-strong";
                      } else if (isToday) {
                        dayClassName += " font-semibold text-brand-strong";
                      }
                    }
                    return (
                      <button
                        key={`${viewYear}-${viewMonth}-${day}`}
                        type="button"
                        disabled={isDisabledDay}
                        onClick={() => {
                          if (isDisabledDay) return;
                          onChange(formatDisplayDate(cellDate));
                          setTouched(true);
                          setOpen(false);
                          setCalendarPanel("day");
                          window.requestAnimationFrame(() => {
                            textInputRef.current?.focus();
                          });
                        }}
                        className={dayClassName}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {calendarPanel === "month" && (
              <div className="grid grid-cols-3 gap-1">
                {MONTH_SHORT_LABELS.map((monthLabel, monthIndex) => {
                  const monthStart = new Date(viewYear, monthIndex, 1);
                  const monthEnd = new Date(viewYear, monthIndex + 1, 0);
                  const isAfterMax =
                    maxAllowedDate !== null && monthStart > maxAllowedDate;
                  const isBeforeMin =
                    minAllowedDate !== null && monthEnd < minAllowedDate;
                  const isDisabledMonth = isAfterMax || isBeforeMin;
                  const isSelected =
                    selectedMonth === monthIndex + 1 &&
                    selectedYear === viewYear;
                  const isCurrentMonth =
                    monthIndex === today.getMonth() &&
                    viewYear === today.getFullYear();
                  let monthClassName =
                    "grid h-10 place-items-center rounded-md text-sm capitalize";
                  if (isDisabledMonth) {
                    monthClassName +=
                      " cursor-not-allowed text-muted-foreground/40";
                  } else {
                    monthClassName += " hover:bg-accent";
                    if (isSelected) {
                      monthClassName +=
                        " bg-brand-strong font-semibold text-white hover:bg-brand-strong";
                    } else if (isCurrentMonth) {
                      monthClassName += " font-semibold text-brand-strong";
                    }
                  }
                  return (
                    <button
                      key={`${viewYear}-${monthLabel}`}
                      type="button"
                      disabled={isDisabledMonth}
                      onClick={() => {
                        if (isDisabledMonth) return;
                        setViewMonth(monthIndex);
                        setCalendarPanel("day");
                      }}
                      className={monthClassName}
                    >
                      {monthLabel}
                    </button>
                  );
                })}
              </div>
            )}
            {calendarPanel === "year" && (
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 12 }, (_, index) => {
                  const year = yearGridStart + index;
                  const yearStart = new Date(year, 0, 1);
                  const yearEnd = new Date(year, 11, 31);
                  const isAfterMax =
                    maxAllowedDate !== null && yearStart > maxAllowedDate;
                  const isBeforeMin =
                    minAllowedDate !== null && yearEnd < minAllowedDate;
                  const isDisabledYear = isAfterMax || isBeforeMin;
                  const isSelected = selectedYear === year;
                  const isCurrentYear = year === today.getFullYear();
                  let yearClassName =
                    "grid h-10 place-items-center rounded-md text-sm";
                  if (isDisabledYear) {
                    yearClassName +=
                      " cursor-not-allowed text-muted-foreground/40";
                  } else {
                    yearClassName += " hover:bg-accent";
                    if (isSelected) {
                      yearClassName +=
                        " bg-brand-strong font-semibold text-white hover:bg-brand-strong";
                    } else if (isCurrentYear) {
                      yearClassName += " font-semibold text-brand-strong";
                    }
                  }
                  return (
                    <button
                      key={year}
                      type="button"
                      disabled={isDisabledYear}
                      onClick={() => {
                        if (isDisabledYear) return;
                        setViewYear(year);
                        setCalendarPanel("month");
                      }}
                      className={yearClassName}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setTouched(true);
                  textInputRef.current?.focus();
                }}
                className="rounded-md px-2 py-1 text-sm font-semibold text-brand-strong hover:bg-accent"
              >
                Borrar
              </button>
              {todaySelectable ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(todayValue);
                    setViewMonth(today.getMonth());
                    setViewYear(today.getFullYear());
                    setCalendarPanel("day");
                    setTouched(true);
                    setOpen(false);
                    window.requestAnimationFrame(() => {
                      textInputRef.current?.focus();
                    });
                  }}
                  className="rounded-md px-2 py-1 text-sm font-semibold text-brand-strong hover:bg-accent"
                >
                  Hoy
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>
        )}
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
