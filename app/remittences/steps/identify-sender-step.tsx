"use client";

import { STATUS } from "@/components/async-data-handler";
import {
  RecentTransactions,
  type RecentTransaction,
} from "@/components/send-money/recent-transactions";
import type { Beneficiary } from "@/components/send-money/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import documentTypesCatalog from "@/public/catalogs/catalog-document-types.json";
import {
  ArrowRightIcon,
  Loader2Icon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { ClientProfileDialog } from "../dialogs";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [transactionsStatus, setTransactionsStatus] = useState<STATUS>(() => {
    if (result === "success") return STATUS.SUCCESS;
    if (result === "empty" || result === "error" || result === "blocked") {
      return STATUS.EMPTY;
    }
    return STATUS.IDLE;
  });
  const [documentType, setDocumentType] = useState("Cédula");
  const documentTypeRef = useRef<HTMLButtonElement>(null);
  const documentNumberInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const transactionsTimeoutRef = useRef<number | null>(null);

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
    if (searchTimeoutRef.current !== null) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    if (transactionsTimeoutRef.current !== null) {
      window.clearTimeout(transactionsTimeoutRef.current);
    }
    setLoading(true);
    setTransactionsStatus(STATUS.LOADING);
    onResultChange(null);
    searchTimeoutRef.current = window.setTimeout(() => {
      const nextResult =
        value === "0000000"
          ? "error"
          : value === "2222222"
            ? "blocked"
            : value === "7807365" || value === "1111111"
              ? "success"
              : "empty";
      onResultChange(nextResult);
      setLoading(false);
      if (nextResult === "success") {
        transactionsTimeoutRef.current = window.setTimeout(() => {
          setTransactionsStatus(STATUS.SUCCESS);
        }, 900);
      } else {
        setTransactionsStatus(STATUS.EMPTY);
      }
    }, 550);
  }

  useEffect(() => {
    if (result === "success" || result === "empty") {
      continueRef.current?.focus();
    }
  }, [result, continueRef]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current !== null) {
        window.clearTimeout(searchTimeoutRef.current);
      }
      if (transactionsTimeoutRef.current !== null) {
        window.clearTimeout(transactionsTimeoutRef.current);
      }
    };
  }, []);

  const showTransactions = result === "success";

  return (
    <>
      <div
        className={
          "mx-auto grid w-full grid-cols-1 items-start gap-16 lg:grid-cols-2 min-h-148 pt-12"
        }
      >
        <div className="flex flex-col h-full">
          <div className="mb-6 select-none">
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
              <span className="mb-1 block text-sm font-semibold text-foreground select-none">
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
              <span className="mb-1 block text-sm font-semibold text-foreground select-none">
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
                  const nextValue = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 7);
                  onDocumentNumberChange(nextValue);
                  onClearRepeatedTransaction();
                  if (searchTimeoutRef.current !== null) {
                    window.clearTimeout(searchTimeoutRef.current);
                    searchTimeoutRef.current = null;
                  }
                  if (transactionsTimeoutRef.current !== null) {
                    window.clearTimeout(transactionsTimeoutRef.current);
                    transactionsTimeoutRef.current = null;
                  }
                  setLoading(false);
                  setTransactionsStatus(STATUS.IDLE);
                  onResultChange(null);
                }}
                placeholder="Ingresa el número de documento"
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10"
              />

              <span className="mt-1 block text-xs text-muted-foreground select-none">
                Solo números, sin espacios.
              </span>
            </label>
            <button
              disabled={!documentNumber || loading}
              className={`mt-1 h-10 w-full flex items-center justify-center gap-2 rounded-lg text-sm font-bold  disabled:bg-secondary disabled:text-muted-foreground ${result ? "border border-brand text-brand hover:bg-brand/10" : "bg-brand-strong text-white hover:bg-brand/90"}`}
            >
              {loading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SearchIcon className="size-4" />
              )}
              {loading ? "Buscando cliente…" : "Buscar"}
            </button>
            <div
              aria-live="polite"
              className={
                result ? "mt-2 border-t border-border pt-6" : undefined
              }
            >
              {result === "success" && (
                <div className="flex flex-col gap-4 rounded-xl border border-brand p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col">
                    <p className="text-xs font-bold uppercase text-success">
                      ✓ Cliente encontrado
                    </p>
                    <h2 className="mt-2 text-xl font-bold">
                      Eliana Antezana Ovando
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Documento: {documentNumber} · j***@cislatam.com
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setProfileOpen(true)}
                      className="flex h-12 items-center gap-2 rounded-lg border border-brand px-6 py-2 text-sm font-bold text-brand hover:bg-brand/10"
                    >
                      <UserIcon className="size-4" />
                      Ver perfil
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
                    Ocurrió un problema temporal. Verifica tu conexión e
                    inténtalo nuevamente.
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
                  <p className="font-bold text-destructive">
                    Cliente bloqueado
                  </p>
                  <p className="mt-1 text-sm text-destructive/80">
                    Este cliente no puede continuar con la transacción. Contacta
                    a un supervisor si necesitas asistencia.
                  </p>
                </div>
              )}
            </div>
          </form>
          {(result === "success" || result === "empty") && (
            <button
              type="button"
              ref={continueRef}
              onClick={onContinue}
              disabled={
                transactionsStatus !== STATUS.SUCCESS &&
                transactionsStatus !== STATUS.EMPTY
              }
              className="flex h-12 w-full self-end mt-6 items-center justify-center gap-2 hover:bg-brand/95 rounded-lg bg-brand-strong px-6 py-2 text-sm font-bold text-white"
            >
              Continuar
              <ArrowRightIcon className="size-4" />
            </button>
          )}
        </div>
        <aside className="self-start h-full">
          <RecentTransactions
            transactions={recentTransactions}
            beneficiaries={beneficiaries}
            selectedId={selectedTransactionId}
            disabled={quoteLoading}
            status={transactionsStatus}
            formatUsd={formatUsd}
            onSelect={onRepeatTransaction}
            onClear={onClearRepeatedTransaction}
          />
        </aside>
      </div>

      <div className="absolute right-4 bottom-4 flex gap-2 text-xs text-muted-foreground">
        <span className="select-none">Demo:</span>
        <div className="flex gap-0.5">
          7807365
          <span className="select-none">(cliente existente)</span>
        </div>
        <div className="flex gap-0.5">
          1111111
          <span className="select-none">(cliente existente)</span>
        </div>
        <div className="flex gap-0.5">
          1234567
          <span className="select-none">(cliente nuevo)</span>
        </div>
        <div className="flex gap-0.5">
          0000000
          <span className="select-none">(error de búsqueda)</span>
        </div>
        <div className="flex gap-0.5">
          2222222
          <span className="select-none">(cliente bloqueado)</span>
        </div>
      </div>

      <ClientProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={{
          fullName: "Eliana Antezana Ovando",
          documentType,
          documentNumber,
          email: "jorge.gimenez@cislatam.com",
          phone: "45545454",
          country: "Bolivia",
          state: "La Paz",
          city: "Acarapiri",
          address: "Fabian Vaca 3712",
        }}
      />
    </>
  );
}
