"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";

export type ClientSearchResult = "success" | "empty" | "error" | "blocked" | null;

export type IdentifySenderStepProps = {
  step: number;
  lastStep: number;
  documentNumber: string;
  onDocumentNumberChange: (value: string) => void;
  result: ClientSearchResult;
  onResultChange: (result: ClientSearchResult) => void;
  onContinue: () => void;
  continueRef: RefObject<HTMLButtonElement | null>;
};

const DOCUMENT_TYPE_OPTIONS = documentTypesCatalog.map((item) => item.name);

export function IdentifySenderStep({
  step,
  lastStep,
  documentNumber,
  onDocumentNumberChange,
  result,
  onResultChange,
  onContinue,
  continueRef,
}: IdentifySenderStepProps) {
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("Cédula");
  const documentTypeRef = useRef<HTMLButtonElement>(null);
  const documentNumberInputRef = useRef<HTMLInputElement>(null);

  function trapDocumentFocus(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Tab") return;
    const form = event.currentTarget.form;
    if (!form) return;
    const focusable = Array.from(
      form.querySelectorAll<HTMLElement>(
        'button, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function searchClient() {
    const value = documentNumber.trim();
    if (!value || loading) return;
    setLoading(true);
    onResultChange(null);
    window.setTimeout(() => {
      onResultChange(
        value === "0000000"
          ? "error"
          : value === "2222222"
            ? "blocked"
            : value === "7807365" || value === "1111111"
              ? "success"
              : "empty",
      );
      setLoading(false);
    }, 550);
  }

  useEffect(() => {
    if (result === "success" || result === "empty") {
      continueRef.current?.focus();
    }
  }, [result, continueRef]);




  return (
    <>
      <div className="mb-4">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-[#5368c8]">
          Paso {step} de {lastStep}
        </p>
        <h1 className="text-xl font-bold tracking-[-0.02em] text-[#17233f]">
          Identifica al remitente
        </h1>
        <p className="mt-1 text-sm leading-5 text-[#687790]">
          Completa la información necesaria para continuar.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          searchClient();
        }}
        className="mx-auto max-w-[680px] space-y-3"
      >
        <div className="mt-10 block">
          <span className="mb-1 block text-sm font-semibold text-[#263653]">
            Tipo de documento <span className="text-[#c73750]">*</span>
          </span>
          <SearchableSelect
            fieldRef={documentTypeRef}
            nextRef={documentNumberInputRef}
            label="Tipo de documento"
            hideLabel
            value={documentType}
            options={DOCUMENT_TYPE_OPTIONS}
            onChange={(value) => {
              const item = documentTypesCatalog.find(
                (entry) => entry.name === value,
              );
              if (!item) {
                throw new Error(`Unknown document type: ${value}`);
              }
              setDocumentType(item.name);
            }}
          />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-[#263653]">
            Número de documento <span className="text-[#c73750]">*</span>
          </span>
          <input
            ref={documentNumberInputRef}
            autoFocus
            onKeyDown={trapDocumentFocus}
            inputMode="numeric"
            maxLength={7}
            value={documentNumber}
            onChange={(e) => {
              onDocumentNumberChange(
                e.target.value.replace(/\D/g, "").slice(0, 7),
              );
              onResultChange(null);
            }}
            placeholder="Ingresa el número de documento"
            className="h-10 w-full rounded-lg border border-[#cdd5e1] px-3 text-sm text-[#263653] outline-none placeholder:text-[#a2adbf] focus:border-[#5368c8] focus:ring-4 focus:ring-[#5368c8]/10"
          />

          <span className="mt-1 block text-xs text-[#7b879b]">
            Solo números, sin espacios.
          </span>
        </label>
        <button
          disabled={!documentNumber || loading}
          className="mt-1 h-10 w-full rounded-lg bg-[#465bc2] text-sm font-bold text-white disabled:bg-[#b8c1dc]"
        >
          {loading ? "Buscando cliente…" : "Buscar"}
        </button>
        <div
          aria-live="polite"
          className={
            result ? "mt-2 border-t border-[#e9edf5] pt-6" : undefined
          }
        >
          {result === "success" && (
            <div className="rounded-xl border border-[#cde8db] bg-[#f1faf5] p-5">
              <p className="text-xs font-bold uppercase text-[#23815d]">
                ✓ Cliente encontrado
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#1f6d55]">
                Eliana Antezana Ovando
              </h2>
              <p className="mt-2 text-sm text-[#5d7c72]">
                Documento: {documentNumber} · j***@cislatam.com
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-[#b8d8c9] px-4 py-2 text-sm font-bold text-[#28694f]"
                >
                  Ver perfil
                </button>
                <button
                  type="button"
                  ref={continueRef}
                  onClick={onContinue}
                  className="rounded-lg bg-[#465bc2] px-4 py-2 text-sm font-bold text-white"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
          {result === "empty" && (
            <div className="rounded-xl border border-[#eadcae] bg-[#fffaf0] p-5">
              <p className="font-bold text-[#5d4b19]">
                No encontramos un cliente asociado a este documento.
              </p>
              <p className="mt-1 text-sm text-[#8a7740]">
                Puedes registrar un nuevo cliente para continuar.
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-[#465bc2] px-4 py-2 text-sm font-bold text-white"
                >
                  Registrar cliente
                </button>
                <button
                  type="button"
                  ref={continueRef}
                  onClick={onContinue}
                  className="rounded-lg border border-[#d6c688] px-4 py-2 text-sm font-bold text-[#765d12]"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
          {result === "error" && (
            <div
              role="alert"
              className="rounded-xl border border-[#f0c8cf] bg-[#fff5f6] p-5"
            >
              <p className="font-bold text-[#7f2638]">
                No pudimos completar la búsqueda
              </p>
              <p className="mt-1 text-sm text-[#a34f60]">
                Ocurrió un problema temporal. Verifica tu conexión e inténtalo
                nuevamente.
              </p>
              <button
                type="button"
                onClick={searchClient}
                className="mt-4 rounded-lg bg-[#b52e45] px-4 py-2 text-sm font-bold text-white"
              >
                Reintentar
              </button>
            </div>
          )}
          {result === "blocked" && (
            <div
              role="alert"
              className="rounded-xl border border-[#f0c8cf] bg-[#fff5f6] p-5"
            >
              <p className="font-bold text-[#7f2638]">Cliente bloqueado</p>
              <p className="mt-1 text-sm text-[#a34f60]">
                Este cliente no puede continuar con la transacción. Contacta a
                un supervisor si necesitas asistencia.
              </p>
            </div>
          )}
        </div>
      </form>
    </>
  );
}
