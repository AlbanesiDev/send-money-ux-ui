import { History, RotateCcw } from "lucide-react";
import { deliveryTypeLabel } from "./provider-flows";
import type { Beneficiary, DeliveryTypeId, ProviderId } from "./types";

export type RecentTransaction = {
  id: string;
  date: string;
  provider: ProviderId;
  destinationCountry: string;
  deliveryType: DeliveryTypeId;
  wuService: string;
  payingPartner?: string;
  location?: string;
  terraPayBank?: string;
  terraPayWallet?: string;
  amount: number;
  beneficiaryIndex: number;
  paymentMethod: string;
};

const PROVIDER_LABELS: Record<ProviderId, string> = {
  RIA: "RIA",
  WU: "Western Union",
  MONEYGRAM: "MoneyGram",
  TERRAPAY: "TerraPay",
};

const RIA_LOCATION = "Av.Beni edif TorreEmpresarial Cubo Santa ";

/** Mock del historial del cliente conocido hasta integrar el servicio real. */
export const KNOWN_CLIENT_TRANSACTIONS: RecentTransaction[] = [
  {
    id: "12030070712",
    date: "08/10/2026",
    provider: "WU",
    destinationCountry: "Argentina",
    deliveryType: "CASH",
    wuService: "Dinero en minutos (000)",
    payingPartner: "Banco Ganadero",
    location: RIA_LOCATION,
    amount: 300,
    beneficiaryIndex: 0,
    paymentMethod: "Pago en efectivo",
  },
  {
    id: "12030070598",
    date: "21/09/2026",
    provider: "TERRAPAY",
    destinationCountry: "Peru",
    deliveryType: "BANK",
    wuService: "Direct to bank (500)",
    terraPayBank: "Banco Nacional",
    amount: 150,
    beneficiaryIndex: 1,
    paymentMethod: "Tarjeta de débito",
  },
  {
    id: "12030070431",
    date: "30/08/2026",
    provider: "RIA",
    destinationCountry: "Chile",
    deliveryType: "CASH",
    wuService: "24 horas",
    payingPartner: "Banco Economico",
    location: RIA_LOCATION,
    amount: 500,
    beneficiaryIndex: 2,
    paymentMethod: "Transferencia bancaria",
  },
  {
    id: "12030070287",
    date: "12/08/2026",
    provider: "MONEYGRAM",
    destinationCountry: "Argentina",
    deliveryType: "WALLET",
    wuService: "Direct to wallet (800)",
    terraPayWallet: "Tigo Money",
    amount: 80,
    beneficiaryIndex: 0,
    paymentMethod: "Pago QR",
  },
];

const ROW_GRID =
  "sm:grid-cols-[90px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_100px_110px]";

export function RecentTransactions({
  transactions,
  beneficiaries,
  selectedId,
  disabled,
  formatUsd,
  onSelect,
}: {
  transactions: RecentTransaction[];
  beneficiaries: Beneficiary[];
  selectedId: string | null;
  disabled: boolean;
  formatUsd: (value: number) => string;
  onSelect: (transaction: RecentTransaction) => void;
}) {
  if (transactions.length === 0) return null;
  return (
    <section
      aria-labelledby="recent-transactions-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6ebf3] px-4 py-3">
        <div className="flex items-center gap-2">
          <History aria-hidden="true" className="h-4 w-4 text-[#5368c8]" />
          <h2
            id="recent-transactions-title"
            className="text-sm font-bold text-[#17233f]"
          >
            Últimas transacciones del cliente
          </h2>
        </div>
        <p className="text-xs text-[#73809a]">
          Repite una transacción para autocompletar todos los datos.
        </p>
      </div>
      <div
        className={`hidden gap-3 bg-[#f7f8fb] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#73809a] sm:grid ${ROW_GRID}`}
      >
        <span>Fecha</span>
        <span>Beneficiario</span>
        <span>Destino</span>
        <span>Proveedor</span>
        <span className="text-right">Monto</span>
        <span className="sr-only">Acciones</span>
      </div>
      <ul className="divide-y divide-[#e6ebf3]">
        {transactions.map((transaction) => {
          const beneficiary = beneficiaries[transaction.beneficiaryIndex];
          const selected = transaction.id === selectedId;
          return (
            <li
              key={transaction.id}
              className={`grid gap-1 px-4 py-3 text-sm sm:items-center sm:gap-3 ${ROW_GRID} ${
                selected ? "bg-[#f5f7ff]" : ""
              }`}
            >
              <span className="text-[#5d6b85]">{transaction.date}</span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[#263653]">
                  {beneficiary?.name ?? "—"}
                </span>
                <span className="block text-xs text-[#73809a]">
                  Op. {transaction.id}
                </span>
              </span>
              <span className="text-[#263653]">
                {transaction.destinationCountry}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-[#263653]">
                  {PROVIDER_LABELS[transaction.provider]}
                </span>
                <span className="block text-xs text-[#73809a]">
                  {deliveryTypeLabel(transaction.deliveryType)}
                </span>
              </span>
              <span className="font-semibold text-[#263653] sm:text-right">
                {formatUsd(transaction.amount)}
              </span>
              {selected ? (
                <span className="inline-flex h-9 items-center justify-center rounded-lg bg-[#e1f7e9] px-3 text-xs font-bold text-[#218052] sm:justify-self-end">
                  ✓ Datos cargados
                </span>
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(transaction)}
                  aria-label={`Repetir transacción ${transaction.id} a ${beneficiary?.name ?? "beneficiario"} por ${formatUsd(transaction.amount)}`}
                  className="mt-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#c5cddb] px-3 text-xs font-bold text-[#3a4558] transition-colors hover:border-[#9aa3b5] hover:bg-[#f5f7fa] focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20 disabled:cursor-not-allowed disabled:text-[#a3adbd] sm:mt-0 sm:justify-self-end"
                >
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                  Repetir
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
