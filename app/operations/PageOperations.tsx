"use client";

import { useEffect, useRef, useState } from "react";
import { PaymentFlow } from "@/app/payments/PagePayments";
import type { PaymentOperation } from "@/app/payments/payment-data";
import {
  TransactionFlow,
  type RemittanceFlowSeed,
} from "@/app/remittences/PageRemittences";
import type { RecentTransaction } from "@/components/send-money/recent-transactions";
import type { Beneficiary, Customer } from "@/components/send-money/types";
import {
  ensureBeneficiariesSeeded,
  listBeneficiariesByCustomer,
} from "@/lib/simulated-api/beneficiaries-api";
import {
  ensureCustomersSeeded,
  findCustomerByDocument,
} from "@/lib/simulated-api/customers-api";
import { readAllCustomers } from "@/lib/simulated-api/customers-store";
import {
  ensureTransactionsSeeded,
  listTransactionsByCustomer,
  type StoredTransaction,
} from "@/lib/simulated-api/transactions-api";
import {
  UnifiedHubStep,
  type UnifiedSearchHit,
} from "./steps/unified-hub-step";

const usdFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatUsd = (value: number) => `${usdFormatter.format(value)} USD`;

type HubPhase =
  | { kind: "hub" }
  | { kind: "remittance"; seed: RemittanceFlowSeed }
  | { kind: "payment"; operation: PaymentOperation };

function PageOperations() {
  const [flowKey, setFlowKey] = useState(0);
  return (
    <OperationsFlow
      key={flowKey}
      onReset={() => setFlowKey((key) => key + 1)}
    />
  );
}

function OperationsFlow({ onReset }: { onReset: () => void }) {
  const [phase, setPhase] = useState<HubPhase>({ kind: "hub" });
  const [documentType, setDocumentType] = useState("Cédula");
  const [query, setQuery] = useState("");
  const [hit, setHit] = useState<UnifiedSearchHit>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    StoredTransaction[]
  >([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const beneficiariesLoadedForCustomerIdRef = useRef<string | null>(null);
  const transactionsLoadedForCustomerIdRef = useRef<string | null>(null);

  useEffect(() => {
    void ensureCustomersSeeded()
      .then(() => readAllCustomers())
      .then((items) => setCustomers(items));
    void ensureBeneficiariesSeeded();
    void ensureTransactionsSeeded();
  }, []);

  const clientHit = hit?.kind === "client" ? hit : null;
  const foundByDocument = customers.find((item) =>
    item.documentNumbers.includes(query.trim()),
  );
  const matchedCustomer =
    foundByDocument === undefined ? null : foundByDocument;
  let customer: Customer | null = null;
  if (clientHit?.result === "success") {
    customer = matchedCustomer;
  }

  useEffect(() => {
    if (clientHit?.result !== "success") return;
    if (matchedCustomer !== null) return;
    void findCustomerByDocument(query).then((found) => {
      if (found === null) return;
      setCustomers((current) => {
        const exists = current.some((item) => item.id === found.id);
        if (exists) return current;
        return [...current, found];
      });
    });
  }, [clientHit, query, matchedCustomer]);

  useEffect(() => {
    if (customer === null) {
      beneficiariesLoadedForCustomerIdRef.current = null;
      transactionsLoadedForCustomerIdRef.current = null;
      setBeneficiaries([]);
      setRecentTransactions([]);
      return;
    }
    const customerId = customer.id;
    if (beneficiariesLoadedForCustomerIdRef.current !== customerId) {
      beneficiariesLoadedForCustomerIdRef.current = customerId;
      void listBeneficiariesByCustomer(customerId).then((items) => {
        if (beneficiariesLoadedForCustomerIdRef.current !== customerId) return;
        setBeneficiaries(items);
      });
    }
    if (transactionsLoadedForCustomerIdRef.current !== customerId) {
      transactionsLoadedForCustomerIdRef.current = customerId;
      void listTransactionsByCustomer(customerId).then((items) => {
        if (transactionsLoadedForCustomerIdRef.current !== customerId) return;
        setRecentTransactions(items);
      });
    }
  }, [customer]);

  function enterRemittance(seed: RemittanceFlowSeed) {
    setPhase({ kind: "remittance", seed });
  }

  function enterPayment(operation: PaymentOperation) {
    setPhase({ kind: "payment", operation });
  }

  if (phase.kind === "remittance") {
    return <TransactionFlow onReset={onReset} seed={phase.seed} />;
  }

  if (phase.kind === "payment") {
    return <PaymentFlow onReset={onReset} initialOperation={phase.operation} />;
  }

  return (
    <section className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-[14px] bg-card text-foreground shadow-[0_12px_35px_rgba(24,37,73,0.06)] dark:shadow-none">
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <UnifiedHubStep
          documentType={documentType}
          onDocumentTypeChange={setDocumentType}
          query={query}
          onQueryChange={setQuery}
          hit={hit}
          onHitChange={setHit}
          onContinueRemittance={() => {
            if (clientHit === null) return;
            let isGuestFlow = false;
            if (clientHit.result === "empty") {
              isGuestFlow = true;
            }
            enterRemittance({
              documentType,
              documentNumber: query,
              result: clientHit.result,
              isGuestFlow,
              beneficiariesSnapshot: beneficiaries,
              recentTransactionsSnapshot: recentTransactions,
            });
          }}
          onGuestContinue={() => {
            enterRemittance({
              documentType,
              documentNumber: "",
              result: null,
              isGuestFlow: true,
            });
          }}
          onStartPayment={enterPayment}
          continueRef={continueRef}
          customer={customer}
          recentTransactions={recentTransactions}
          beneficiaries={beneficiaries}
          selectedTransactionId={selectedTransactionId}
          formatUsd={formatUsd}
          onRepeatTransaction={(transaction: RecentTransaction) => {
            enterRemittance({
              documentType,
              documentNumber: query,
              result: "success",
              isGuestFlow: false,
              repeatTransaction: transaction,
              beneficiariesSnapshot: beneficiaries,
              recentTransactionsSnapshot: recentTransactions,
            });
          }}
          onClearRepeatedTransaction={() => {
            setSelectedTransactionId(null);
          }}
        />
      </div>
    </section>
  );
}

export default PageOperations;
