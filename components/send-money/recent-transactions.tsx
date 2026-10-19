"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Filter,
  History,
  Loader2Icon,
  MoreHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";
import { CountryFlag } from "@/components/ui/country-flag";
import type { Beneficiary, DeliveryTypeId, ProviderId } from "./types";
import { AsyncDataHandler, STATUS } from "../async-data-handler";

export type TransactionStatus = "Completada" | "En revisión" | "Cancelada";

export type RecentTransaction = {
  id: string;
  date: string;
  time: string;
  status: TransactionStatus;
  provider: ProviderId;
  destinationCountry: string;
  deliveryType: DeliveryTypeId;
  wuService: string;
  service: string;
  payingPartner?: string;
  location?: string;
  terraPayBank?: string;
  terraPayWallet?: string;
  amount: number;
  beneficiaryIndex: number;
  paymentMethod: string;
};

type FilterTab = "Todas" | "Completada" | "En revisión";

const PROVIDER_LABELS: Record<ProviderId, string> = {
  RIA: "RIA",
  WU: "Western Union",
  MONEYGRAM: "MoneyGram",
  TERRAPAY: "TerraPay",
};

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

const RIA_LOCATION = "Av.Beni edif TorreEmpresarial Cubo Santa ";

/** Mock del historial del cliente conocido hasta integrar el servicio real. */
export const KNOWN_CLIENT_TRANSACTIONS: RecentTransaction[] = [
  {
    id: "12030070712",
    date: "08 oct 2026",
    time: "11:42",
    status: "Completada",
    provider: "WU",
    destinationCountry: "Argentina",
    deliveryType: "CASH",
    wuService: "Dinero en minutos (000)",
    service: "Dinero en minutos",
    payingPartner: "Banco Ganadero",
    location: RIA_LOCATION,
    amount: 300,
    beneficiaryIndex: 0,
    paymentMethod: "Pago en efectivo",
  },
  {
    id: "12030070598",
    date: "21 sep 2026",
    time: "16:08",
    status: "Completada",
    provider: "TERRAPAY",
    destinationCountry: "Peru",
    deliveryType: "BANK",
    wuService: "Direct to bank (500)",
    service: "Direct to bank",
    terraPayBank: "Banco Nacional",
    amount: 150,
    beneficiaryIndex: 1,
    paymentMethod: "Tarjeta de débito",
  },
  {
    id: "12030070431",
    date: "30 ago 2026",
    time: "09:35",
    status: "En revisión",
    provider: "RIA",
    destinationCountry: "Chile",
    deliveryType: "CASH",
    wuService: "24 horas",
    service: "Dinero en minutos",
    payingPartner: "Banco Economico",
    location: RIA_LOCATION,
    amount: 500,
    beneficiaryIndex: 2,
    paymentMethod: "Transferencia bancaria",
  },
];

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
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Todas");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const normalizedQuery = query.toLowerCase().trim();
  const visibleTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      activeFilter === "Todas" || transaction.status === activeFilter;
    const beneficiary = beneficiaries[transaction.beneficiaryIndex];
    const matchesQuery = [
      beneficiary.name,
      `Op. ${transaction.id}`,
      PROVIDER_LABELS[transaction.provider],
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
    return matchesFilter && matchesQuery;
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

    return visibleTransactions.map((transaction, index) => {
      const beneficiary = beneficiaries[transaction.beneficiaryIndex];
      const selected = transaction.id === selectedId;

      return (
        <article
          key={transaction.id}
          className={`recent-tx-enter group flex min-h-[126px] gap-[13px] border-b border-[#edf0f5] px-[26px] py-[19px] transition-colors hover:bg-[#fbfcff] ${selected ? "bg-[#f7faff]" : ""}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="grid size-[39px] shrink-0 place-items-center rounded-[11px] bg-[#edf3ff] text-[#3064d1]">
            <ArrowUpRight size={20} strokeWidth={2.25} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h4 className="truncate text-[15px] font-bold tracking-[-0.025em] text-[#1d2a45]">
                    {beneficiary.name}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-[10px] font-bold whitespace-nowrap ${STATUS_BADGE[transaction.status]}`}
                  >
                    <span
                      className={`inline-block size-1.5 rounded-full ${STATUS_DOT[transaction.status]}`}
                    />
                    {transaction.status}
                  </span>
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#b8e1d1] bg-[#effaf5] px-2.5 py-2 text-[11px] font-bold whitespace-nowrap text-[#167152] transition-colors hover:bg-[#e8f7f0] focus:outline-none focus:ring-4 focus:ring-[#3064d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#d6dfed] bg-white px-2.5 py-2 text-[11px] font-bold whitespace-nowrap text-[#33425f] transition-colors hover:border-[#9fb5df] hover:bg-[#f7faff] focus:outline-none focus:ring-4 focus:ring-[#3064d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
      className="overflow-hidden rounded-[14px] border border-[#e0e6ef] bg-white/95 shadow-[0_16px_46px_rgba(28,48,84,0.08)]"
    >
      <div className="flex flex-col gap-5 border-b border-[#edf0f5] px-[26px] pt-[23px] pb-[19px]">
        <div className="flex items-center gap-3">
          <div className="grid size-[37px] shrink-0 place-items-center rounded-[10px] bg-[#edf3ff] text-[#3064d1]">
            <History size={19} />
          </div>
          <div>
            <h2
              id="recent-transactions-title"
              className="text-base font-bold tracking-[-0.025em] text-[#17243d]"
            >
              Actividad reciente
            </h2>
            <span className="mt-1 block text-xs text-[#8691a5]">
              {visibleTransactions.length} operaciones encontradas
            </span>
          </div>
        </div>

        <label className="flex h-[38px] w-full items-center gap-2 rounded-lg border border-[#dbe2ed] px-3 text-[#8995aa] transition-[border-color,box-shadow] focus-within:border-[#5c82dc] focus-within:shadow-[0_0_0_3px_#edf3ff]">
          <Search size={17} className="shrink-0" />
          <input
            aria-label="Buscar operación"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, operación..."
            className="w-full border-0 bg-transparent text-xs text-[#243452] outline-none placeholder:text-[#9ba5b6]"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-[#edf0f5] px-[26px]">
        <div
          className="flex gap-[23px] overflow-x-auto"
          role="tablist"
          aria-label="Filtrar operaciones"
        >
          {(["Todas", "Completada", "En revisión"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex min-h-[49px] shrink-0 items-center gap-1.5 border-b-2 px-0 text-xs font-bold transition-colors ${
                activeFilter === filter
                  ? "border-[#3261ca] text-[#244da7]"
                  : "border-transparent text-[#8390a5]"
              }`}
            >
              {filter}
              {filter !== "Todas" && (
                <span
                  className={`inline-block size-1.5 rounded-full ${STATUS_DOT[filter]}`}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-[9px] border border-transparent px-2.5 py-1.5 text-[11px] font-bold text-[#40506d] transition-colors hover:border-[#9fb5df] hover:bg-[#f7faff]"
        >
          <Filter size={15} />
          Más filtros
        </button>
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
    </section>
  );
}
