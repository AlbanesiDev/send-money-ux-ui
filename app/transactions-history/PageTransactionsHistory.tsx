"use client";

import { useEffect, useState } from "react";
import { FileDownIcon } from "lucide-react";
import {
  ensureTransactionsSeeded,
  listAllTransactions,
  type StoredTransaction,
} from "@/lib/simulated-api/transactions-api";
import { deliveryTypeLabel } from "@/components/send-money/provider-flows";

const PROVIDER_LABELS: Record<StoredTransaction["provider"], string> = {
  RIA: "RIA",
  WU: "Western Union",
  MONEYGRAM: "MoneyGram",
  TERRAPAY: "TerraPay",
};

const usdFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "USD",
});

export default function PageTransactionsHistory() {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ensureTransactionsSeeded()
      .then(() => listAllTransactions())
      .then((items) => {
        setTransactions(items);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">
          Historial de transacciones
        </h1>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <FileDownIcon className="size-4" />
          Exportar a Excel
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Operación</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Cobro</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Destino</th>
              <th className="px-4 py-3">Tipo de envío</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Pago</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Cargando historial…
                </td>
              </tr>
            )}
            {!loading && transactions.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Todavía no hay transacciones guardadas.
                </td>
              </tr>
            )}
            {!loading &&
              transactions.map((item) => {
                let collectionLabel = "Pendiente";
                if (item.collectionStatus === "paid") {
                  collectionLabel = "Cobrada";
                }
                if (item.collectionStatus === "onHold") {
                  collectionLabel = "Retenida";
                }
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.date} · {item.time}
                    </td>
                    <td className="px-4 py-3 text-foreground">{item.status}</td>
                    <td className="px-4 py-3 text-foreground">
                      {collectionLabel}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {PROVIDER_LABELS[item.provider]}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {item.destinationCountry}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {deliveryTypeLabel(item.deliveryType)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {usdFormatter.format(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.paymentMethod}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
