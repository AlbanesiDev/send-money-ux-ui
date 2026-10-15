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
];

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
    <section aria-labelledby="recent-transactions-title">
      <div className="border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <History aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" />
          <h2
            id="recent-transactions-title"
            className="text-sm font-bold text-foreground"
          >
            Últimas transacciones del cliente
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Repite una transacción para autocompletar todos los datos.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {transactions.map((transaction) => {
          const beneficiary = beneficiaries[transaction.beneficiaryIndex];
          const selected = transaction.id === selectedId;
          return (
            <li
              key={transaction.id}
              className={`flex flex-col gap-3 py-3 ${selected ? "bg-accent px-2 -mx-2 rounded-lg" : ""}`}
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-semibold text-foreground">
                    {beneficiary.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {transaction.date}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Op. {transaction.id} · {transaction.destinationCountry}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  <span className="font-semibold">
                    {PROVIDER_LABELS[transaction.provider]}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {deliveryTypeLabel(transaction.deliveryType)}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-amount">
                  {formatUsd(transaction.amount)}
                </span>
                {selected ? (
                  <span className="inline-flex h-9 items-center justify-center rounded-lg bg-success-soft px-3 text-xs font-bold text-success">
                    ✓ Datos cargados
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(transaction)}
                    aria-label={`Repetir transacción ${transaction.id} a ${beneficiary.name} por ${formatUsd(transaction.amount)}`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold text-foreground transition-colors hover:border-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20 disabled:cursor-not-allowed disabled:text-muted-foreground"
                  >
                    <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                    Repetir
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
