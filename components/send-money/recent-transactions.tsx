"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowUpRight,
  Check,
  Copy,
  Filter,
  History,
  Loader2Icon,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import countriesCatalog from "@/public/catalogs/catalog-countries.json";
import { CountryFlag } from "@/components/ui/country-flag";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  DELIVERY_TYPE_OPTIONS,
  PROVIDER_IDS,
  deliveryTypeLabel,
} from "./provider-flows";
import type { Beneficiary, DeliveryTypeId, ProviderId } from "./types";
import { AsyncDataHandler, STATUS } from "../async-data-handler";

export type TransactionStatus = "Completada" | "En revisión" | "Cancelada";

export type CollectionStatus = "available" | "onHold" | "paid";

export type RecentTransaction = {
  id: string;
  date: string;
  time: string;
  status: TransactionStatus;
  collectionStatus: CollectionStatus;
  provider: ProviderId;
  destinationCountry: string;
  deliveryType: DeliveryTypeId;
  wuService: string;
  moneygramCompany?: string;
  service: string;
  payingPartner?: string;
  location?: string;
  terraPayBank?: string;
  terraPayCbu?: string;
  terraPayWallet?: string;
  terraPayAlias?: string;
  amount: number;
  beneficiaryIndex: number;
  beneficiaryId?: string;
  customerId?: string;
  paymentMethod: string;
  paidAt?: string;
};

type FilterTab = "Todas" | "Completada" | "En revisión";

type AdvancedFilters = {
  dateFrom: string;
  dateTo: string;
  deliveryType: "" | DeliveryTypeId;
  provider: "" | ProviderId;
  country: string;
};

const EMPTY_ADVANCED_FILTERS: AdvancedFilters = {
  dateFrom: "",
  dateTo: "",
  deliveryType: "",
  provider: "",
  country: "",
};

const MONTH_INDEX: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

const PROVIDER_LABELS: Record<ProviderId, string> = {
  RIA: "RIA",
  WU: "Western Union",
  MONEYGRAM: "MoneyGram",
  TERRAPAY: "TerraPay",
};

const COUNTRY_OPTIONS = countriesCatalog.result.items
  .filter((item) => item.country.ctyActive)
  .map((item) => item.country.ctyName);
const PROVIDER_FILTER_OPTIONS = PROVIDER_IDS.map((id) => PROVIDER_LABELS[id]);
const DELIVERY_FILTER_OPTIONS = DELIVERY_TYPE_OPTIONS.map(
  (option) => option.label,
);

const STATUS_BADGE: Record<TransactionStatus, string> = {
  Completada: "bg-[#e8f7f0] text-[#177152]",
  "En revisión": "bg-[#fff4dc] text-[#9b6400]",
  Cancelada: "bg-[#fff0f0] text-[#b54242]",
};

const STATUS_DOT: Record<TransactionStatus, string> = {
  Completada: "bg-[#20a376]",
  "En revisión": "bg-[#e4a525]",
  Cancelada: "bg-[#dc6262]",
};

export function RecentTransactions({
  transactions,
  beneficiaries,
  selectedId,
  disabled,
  status,
  formatUsd,
  onSelect,
  onClear,
}: {
  transactions: RecentTransaction[];
  beneficiaries: Beneficiary[];
  selectedId: string | null;
  disabled: boolean;
  status: STATUS;
  formatUsd: (value: number) => string;
  onSelect: (transaction: RecentTransaction) => void;
  onClear: () => void;
}) {
  const [activeFilter] = useState<FilterTab>("Todas");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters>(
    EMPTY_ADVANCED_FILTERS,
  );
  const [draftFilters, setDraftFilters] = useState<AdvancedFilters>(
    EMPTY_ADVANCED_FILTERS,
  );
  const deliveryTypeRef = useRef<HTMLButtonElement>(null);
  const providerRef = useRef<HTMLButtonElement>(null);
  const countryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    setDraftFilters(appliedFilters);
  }, [filtersOpen, appliedFilters]);

  useEffect(() => {
    if (status !== STATUS.IDLE) return;
    setQuery("");
    setAppliedFilters(EMPTY_ADVANCED_FILTERS);
    setDraftFilters(EMPTY_ADVANCED_FILTERS);
    setFiltersOpen(false);
  }, [status]);

  const activeAdvancedFilterCount = [
    appliedFilters.dateFrom !== "",
    appliedFilters.dateTo !== "",
    appliedFilters.deliveryType !== "",
    appliedFilters.provider !== "",
    appliedFilters.country !== "",
  ].filter(Boolean).length;

  const normalizedQuery = query.toLowerCase().trim();
  const visibleTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      activeFilter === "Todas" || transaction.status === activeFilter;
    let beneficiary: Beneficiary | undefined;
    if (transaction.beneficiaryId !== undefined) {
      for (let index = 0; index < beneficiaries.length; index += 1) {
        if (beneficiaries[index].id === transaction.beneficiaryId) {
          beneficiary = beneficiaries[index];
          break;
        }
      }
    } else {
      beneficiary = beneficiaries[transaction.beneficiaryIndex];
    }
    if (beneficiary === undefined) return false;

    const matchesQuery = [
      beneficiary.name,
      `Op. ${transaction.id}`,
      PROVIDER_LABELS[transaction.provider],
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);

    if (!matchesFilter || !matchesQuery) return false;

    if (appliedFilters.provider !== "") {
      if (transaction.provider !== appliedFilters.provider) return false;
    }

    if (appliedFilters.deliveryType !== "") {
      if (transaction.deliveryType !== appliedFilters.deliveryType)
        return false;
    }

    if (appliedFilters.country !== "") {
      if (transaction.destinationCountry !== appliedFilters.country)
        return false;
    }

    if (appliedFilters.dateFrom !== "" || appliedFilters.dateTo !== "") {
      const [dayText, monthText, yearText] = transaction.date.split(" ");
      const month = MONTH_INDEX[monthText];
      if (month === undefined) {
        throw new Error(
          `Unknown month in transaction date: ${transaction.date}`,
        );
      }
      const transactionTime = new Date(
        Number(yearText),
        month,
        Number(dayText),
      ).getTime();

      if (appliedFilters.dateFrom !== "") {
        const fromTime = new Date(
          `${appliedFilters.dateFrom}T00:00:00`,
        ).getTime();
        if (transactionTime < fromTime) return false;
      }

      if (appliedFilters.dateTo !== "") {
        const toTime = new Date(`${appliedFilters.dateTo}T23:59:59`).getTime();
        if (transactionTime > toTime) return false;
      }
    }

    return true;
  });

  const idleComponent = (
    <div className="flex flex-col items-center gap-1.5 px-5 py-14 text-[13px] text-[#728098]">
      <Search className="size-6 text-[#91a2bf]" />
      <strong className="text-sm text-[#273752]">
        Debes realizar una búsqueda
      </strong>
      <span>Buscá un cliente para ver sus transacciones recientes.</span>
    </div>
  );

  const emptyComponent = (
    <div className="flex flex-col items-center gap-1.5 px-5 py-14 text-[13px] text-[#728098]">
      <Search className="size-6 text-[#91a2bf]" />
      <strong className="text-sm text-[#273752]">
        No encontramos operaciones
      </strong>
      <span>Este cliente no tiene transacciones recientes.</span>
    </div>
  );

  const errorComponent = (
    <div className="flex flex-col items-center gap-1.5 px-5 py-14 text-[13px] text-[#728098]">
      <strong className="text-sm text-destructive">
        No pudimos cargar las transacciones
      </strong>
      <span>Inténtalo nuevamente.</span>
    </div>
  );

  const loadingComponent = (
    <div className="flex items-center justify-center gap-2 px-5 py-14 text-sm text-[#728098]">
      <Loader2Icon className="size-5 animate-spin text-[#3064d1]" />
      Cargando transacciones…
    </div>
  );

  const successComponent = (_data: RecentTransaction[]) => {
    if (visibleTransactions.length === 0) {
      return (
        <div className="flex flex-col items-center gap-1.5 px-5 py-14 text-[13px] text-[#728098]">
          <Search className="size-6 text-[#91a2bf]" />
          <strong className="text-sm text-[#273752]">
            No encontramos operaciones
          </strong>
          <span>Probá con otro nombre, número de operación o filtro.</span>
        </div>
      );
    }

    return visibleTransactions.slice(0, 3).map((transaction, index) => {
      let beneficiary: Beneficiary | undefined;
      if (transaction.beneficiaryId !== undefined) {
        for (let i = 0; i < beneficiaries.length; i += 1) {
          if (beneficiaries[i].id === transaction.beneficiaryId) {
            beneficiary = beneficiaries[i];
            break;
          }
        }
      } else {
        beneficiary = beneficiaries[transaction.beneficiaryIndex];
      }
      if (beneficiary === undefined) {
        throw new Error(
          `Beneficiary not found for transaction ${transaction.id}`,
        );
      }
      const selected = transaction.id === selectedId;

      return (
        <article
          key={transaction.id}
          className={`recent-tx-enter group flex min-h-[126px] gap-[13px] border-b border-[#edf0f5] px-[26px] py-4 transition-colors hover:bg-[#fbfcff] ${selected ? "bg-[#f7faff]" : ""}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-[#edf3ff] text-[#3064d1]">
            <ArrowUpRight size={16} strokeWidth={2.2} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h4 className="truncate text-[15px] font-bold tracking-[-0.025em] text-[#1d2a45]">
                    {beneficiary.name}
                  </h4>
                  {selected && (
                    <span className="rounded-[5px] border border-[#3064d1]/30 bg-[#edf3ff] px-2 py-1 text-[10px] font-bold text-[#244da7]">
                      Datos cargados
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#8490a4]">
                  <span>Op. {transaction.id}</span>
                  <button
                    type="button"
                    className="inline-grid place-items-center text-[#8090ac] transition-colors hover:text-[#3064d1]"
                    aria-label={`Copiar Op. ${transaction.id}`}
                    onClick={() => {
                      void navigator.clipboard.writeText(transaction.id);
                      setCopiedId(transaction.id);
                      window.setTimeout(() => setCopiedId(null), 1800);
                    }}
                  >
                    {copiedId === transaction.id ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <span className="mx-0.5 h-[13px] w-px bg-[#d7deea]" />
                  <CountryFlag country={transaction.destinationCountry} />
                  <strong className="font-bold text-[#53627d]">
                    {transaction.destinationCountry === "Peru"
                      ? "Perú"
                      : transaction.destinationCountry}
                  </strong>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8490a4]">
                  <strong className="font-bold text-[#53627d]">
                    {PROVIDER_LABELS[transaction.provider]}
                  </strong>
                  <span>·</span>
                  <span>{transaction.service}</span>
                </div>
              </div>

              <div className="flex w-[98px] shrink-0 flex-col items-end pt-0.5 text-xs font-bold text-[#51617e]">
                <span>{transaction.date}</span>
                <small className="mt-1 text-[11px] font-medium text-[#9aa5b7]">
                  {transaction.time} hs
                </small>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <strong className="text-[17px] font-bold tracking-[-0.035em] whitespace-nowrap text-[#244da7]">
                {formatUsd(transaction.amount)}
              </strong>

              <div className="flex items-center gap-2">
                {selected ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={onClear}
                    aria-label={`Deseleccionar transacción ${transaction.id}`}
                    aria-pressed="true"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#b8e1d1] bg-[#effaf5] px-2.5 py-2 text-sm font-bold whitespace-nowrap text-[#167152] transition-colors hover:bg-[#e8f7f0] dark:border-border dark:bg-success-soft dark:text-success hover:dark:bg-success-border focus:outline-none focus:ring-4 focus:ring-[#3064d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check size={16} />
                    Deseleccionar
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(transaction)}
                    aria-label={`Repetir envío ${transaction.id} a ${beneficiary.name} por ${formatUsd(transaction.amount)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400  bg-amber-300/75 px-2.5 py-2 text-sm font-bold whitespace-nowrap text-[#33425f] transition-colors hover:border-amber-300 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-[#3064d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={16} />
                    Repetir envío
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>
      );
    });
  };

  return (
    <section
      aria-labelledby="recent-transactions-title"
      className="card-glow overflow-hidden rounded-[14px] border border-[#e0e6ef] bg-white/95 shadow-[0_16px_46px_rgba(28,48,84,0.08)] dark:bg-card"
    >
      <div className="flex flex-col gap-5 border-b border-[#edf0f5] px-[26px] pt-[23px] pb-[19px] dark:border-border">
        <div className="flex items-center gap-3">
          <div className="grid size-[37px] shrink-0 place-items-center rounded-[10px] bg-[#edf3ff] text-[#3064d1] dark:bg-brand dark:text-white">
            <History size={19} />
          </div>
          <div className="select-none">
            <h2
              id="recent-transactions-title"
              className="text-base font-bold tracking-[-0.025em] text-[#17243d] dark:text-foreground"
            >
              Actividad reciente
            </h2>
            <span className="mt-1 block text-xs text-[#8691a5] dark:text-muted-foreground">
              {visibleTransactions.length} operaciones encontradas
            </span>
          </div>
        </div>

        {(status === STATUS.SUCCESS || status === STATUS.EMPTY) && (
          <div className="flex items-center gap-2">
            <label className="flex h-[38px] w-full items-center gap-2 rounded-lg border border-[#dbe2ed] px-3 text-[#8995aa] transition-[border-color,box-shadow] focus-within:border-[#5c82dc] focus-within:shadow-[0_0_0_3px_#edf3ff]">
              <Search size={17} className="shrink-0" />
              <input
                aria-label="Buscar operación"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre, operación..."
                className="w-full border-0 bg-transparent text-xs text-[#243452] outline-none placeholder:text-[#9ba5b6] select-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
              className={`inline-flex shrink-0 items-center gap-2 rounded-[9px] border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                activeAdvancedFilterCount > 0
                  ? "border-[#9fb5df] bg-[#edf3ff] text-[#244da7] dark:border-border dark:bg-brand dark:text-white"
                  : "border-transparent text-[#40506d] hover:border-[#9fb5df] hover:bg-[#f7faff] dark:text-muted-foreground dark:hover:border-border dark:hover:bg-card"
              }`}
            >
              <Filter size={15} />
              Más filtros
              {activeAdvancedFilterCount > 0 && (
                <span className="grid size-4 place-items-center rounded-full bg-[#3064d1] text-[9px] text-white">
                  {activeAdvancedFilterCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <div>
        <AsyncDataHandler
          status={status}
          data={transactions}
          idleComponent={idleComponent}
          loadingComponent={loadingComponent}
          errorComponent={errorComponent}
          emptyComponent={emptyComponent}
          successComponent={successComponent}
        />
      </div>

      <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none dark:shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
                    Más filtros
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                    Filtrá la actividad reciente por fecha, tipo de envío,
                    proveedor o país.
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  aria-label="Cerrar filtros"
                  className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-4 focus:ring-brand/20"
                >
                  <X size={16} />
                </Dialog.Close>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-foreground">
                      Desde
                    </span>
                    <input
                      type="date"
                      value={draftFilters.dateFrom}
                      onChange={(event) =>
                        setDraftFilters({
                          ...draftFilters,
                          dateFrom: event.target.value,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-foreground">
                      Hasta
                    </span>
                    <input
                      type="date"
                      value={draftFilters.dateTo}
                      min={draftFilters.dateFrom}
                      onChange={(event) =>
                        setDraftFilters({
                          ...draftFilters,
                          dateTo: event.target.value,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  </label>
                </div>

                <SearchableSelect
                  label="Tipo de envío"
                  options={DELIVERY_FILTER_OPTIONS}
                  value={
                    draftFilters.deliveryType === ""
                      ? ""
                      : deliveryTypeLabel(draftFilters.deliveryType)
                  }
                  onChange={(value) => {
                    if (value === "") {
                      setDraftFilters({ ...draftFilters, deliveryType: "" });
                      return;
                    }
                    const option = DELIVERY_TYPE_OPTIONS.find(
                      (item) => item.label === value,
                    );
                    if (!option) {
                      throw new Error(`Unknown delivery type label: ${value}`);
                    }
                    setDraftFilters({
                      ...draftFilters,
                      deliveryType: option.id,
                    });
                  }}
                  fieldRef={deliveryTypeRef}
                  nextRef={providerRef}
                  clearable
                />

                <SearchableSelect
                  label="Proveedor"
                  options={PROVIDER_FILTER_OPTIONS}
                  value={
                    draftFilters.provider === ""
                      ? ""
                      : PROVIDER_LABELS[draftFilters.provider]
                  }
                  onChange={(value) => {
                    if (value === "") {
                      setDraftFilters({ ...draftFilters, provider: "" });
                      return;
                    }
                    const provider = PROVIDER_IDS.find(
                      (id) => PROVIDER_LABELS[id] === value,
                    );
                    if (!provider) {
                      throw new Error(`Unknown provider label: ${value}`);
                    }
                    setDraftFilters({ ...draftFilters, provider });
                  }}
                  fieldRef={providerRef}
                  nextRef={countryRef}
                  clearable
                />

                <SearchableSelect
                  label="País"
                  options={COUNTRY_OPTIONS}
                  value={draftFilters.country}
                  onChange={(value) => {
                    setDraftFilters({ ...draftFilters, country: value });
                  }}
                  fieldRef={countryRef}
                  showFlags
                  dropdownSide="top"
                  clearable
                />
              </div>

              <div className="mt-6 flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters(EMPTY_ADVANCED_FILTERS);
                    setAppliedFilters(EMPTY_ADVANCED_FILTERS);
                    setFiltersOpen(false);
                  }}
                  className="rounded-md px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
                >
                  Limpiar
                </button>
                <div className="flex flex-wrap gap-2">
                  <Dialog.Close className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20">
                    Cancelar
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFilters(draftFilters);
                      setFiltersOpen(false);
                    }}
                    className="rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
