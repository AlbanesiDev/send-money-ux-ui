"use client";

import {
  RecentTransactions,
  type RecentTransaction,
} from "@/components/send-money/recent-transactions";
import type { Beneficiary } from "@/components/send-money/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import { ArrowRightIcon, UserIcon } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";

export type ClientSearchResult =
  | "success"
  | "empty"
  | "error"
  | "blocked"
  | null;

export type IdentifySenderStepProps = {
  documentNumber: string;
  onDocumentNumberChange: (value: string) => void;
  result: ClientSearchResult;
  onResultChange: (result: ClientSearchResult) => void;
  onContinue: () => void;
  continueRef: RefObject<HTMLButtonElement | null>;
  recentTransactions: RecentTransaction[];
  beneficiaries: Beneficiary[];
  selectedTransactionId: string | null;
  quoteLoading: boolean;
  formatUsd: (value: number) => string;
  onRepeatTransaction: (transaction: RecentTransaction) => void;
  onClearRepeatedTransaction: () => void;
};

const DOCUMENT_TYPE_OPTIONS = documentTypesCatalog.map((item) => item.name);

export function IdentifySenderStep({
  documentNumber,
  onDocumentNumberChange,
  result,
  onResultChange,
  onContinue,
  continueRef,
  recentTransactions,
  beneficiaries,
  selectedTransactionId,
  quoteLoading,
  formatUsd,
  onRepeatTransaction,
  onClearRepeatedTransaction,
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

  const showTransactions =
    result === "success" && recentTransactions.length > 0;

  return (
    <>
      <div
        className={
          showTransactions
            ? "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]"
            : "mx-auto w-full max-w-[680px]"
        }
      >
        <div className={showTransactions ? "min-w-0" : undefined}>
          <div className="mb-6 pt-12">
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Envío de remesas
            </p>
            <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground">
              Identifica al remitente
            </h1>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Completa la información necesaria para continuar.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchClient();
            }}
            className="space-y-3"
          >
          <div className="block">
            <span className="mb-1 block text-sm font-semibold text-foreground">
              Tipo de documento <span className="text-destructive">*</span>
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
            <span className="mb-1 block text-sm font-semibold text-foreground">
              Número de documento <span className="text-destructive">*</span>
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
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10"
            />

            <span className="mt-1 block text-xs text-muted-foreground">
              Solo números, sin espacios.
            </span>
          </label>
          <button
            disabled={!documentNumber || loading}
            className="mt-1 h-10 w-full rounded-lg bg-brand-strong text-sm font-bold text-white disabled:bg-secondary disabled:text-muted-foreground"
          >
            {loading ? "Buscando cliente…" : "Buscar"}
          </button>
          <div
            aria-live="polite"
            className={result ? "mt-2 border-t border-border pt-6" : undefined}
          >
            {result === "success" && (
              <div className="flex flex-col gap-4 rounded-xl border border-success-border bg-success-soft p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col">
                  <p className="text-xs font-bold uppercase text-success">
                    ✓ Cliente encontrado
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-success">
                    Eliana Antezana Ovando
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Documento: {documentNumber} · j***@cislatam.com
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    className="flex h-12 items-center gap-2 rounded-lg border border-success-border px-6 py-2 text-sm font-bold text-success"
                  >
                    <UserIcon className="size-4" />
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    ref={continueRef}
                    onClick={onContinue}
                    className="flex h-12 items-center gap-2 rounded-lg bg-brand-strong px-6 py-2 text-sm font-bold text-white"
                  >
                    Continuar
                    <ArrowRightIcon className="size-4" />
                  </button>
                </div>
              </div>
            )}
            {result === "empty" && (
              <div className="rounded-xl border border-[#eadcae] bg-[#fffaf0] p-5 dark:border-amber-700/50 dark:bg-amber-950/40">
                <p className="font-bold text-[#5d4b19] dark:text-amber-200">
                  No encontramos un cliente asociado a este documento.
                </p>
                <p className="mt-1 text-sm text-[#8a7740] dark:text-amber-200/80">
                  Puedes registrar un nuevo cliente para continuar.
                </p>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-lg bg-brand-strong px-4 py-2 text-sm font-bold text-white"
                  >
                    Registrar cliente
                  </button>
                  <button
                    type="button"
                    ref={continueRef}
                    onClick={onContinue}
                    className="rounded-lg border border-[#d6c688] px-4 py-2 text-sm font-bold text-[#765d12] dark:border-amber-700/50 dark:text-amber-200"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
            {result === "error" && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-5"
              >
                <p className="font-bold text-destructive">
                  No pudimos completar la búsqueda
                </p>
                <p className="mt-1 text-sm text-destructive/80">
                  Ocurrió un problema temporal. Verifica tu conexión e inténtalo
                  nuevamente.
                </p>
                <button
                  type="button"
                  onClick={searchClient}
                  className="mt-4 rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-white"
                >
                  Reintentar
                </button>
              </div>
            )}
            {result === "blocked" && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-5"
              >
                <p className="font-bold text-destructive">Cliente bloqueado</p>
                <p className="mt-1 text-sm text-destructive/80">
                  Este cliente no puede continuar con la transacción. Contacta a
                  un supervisor si necesitas asistencia.
                </p>
              </div>
            )}
          </div>
        </form>
        </div>
        {showTransactions && (
          <aside className="card ml-16 sticky top-4 self-start shadow-[0_12px_35px_rgba(24,37,73,0.08)] dark:shadow-none">
            <RecentTransactions
              transactions={recentTransactions}
              beneficiaries={beneficiaries}
              selectedId={selectedTransactionId}
              disabled={quoteLoading}
              formatUsd={formatUsd}
              onSelect={onRepeatTransaction}
              onClear={onClearRepeatedTransaction}
            />
          </aside>
        )}
      </div>
      <p className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        Demo: 7807365 (cliente existente) · 1111111 (cliente existente) ·
        1234567 (cliente nuevo) · 0000000 (error de búsqueda) · 2222222
        (cliente bloqueado)
      </p>
    </>
  );
}
