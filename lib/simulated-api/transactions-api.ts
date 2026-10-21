import type { RecentTransaction } from "@/components/send-money/recent-transactions";
import type { DeliveryTypeId, ProviderId } from "@/components/send-money/types";
import transactionsHistorySnapshot from "@/public/data/transactions-history.snapshot.json";
import {
  countTransactions,
  readAllTransactions,
  readTransactionsByCustomerId,
  writeTransaction,
  writeTransactions,
} from "./transactions-store";

const API_LATENCY_MS = 400;

export type StoredTransaction = RecentTransaction & {
  customerId: string;
  beneficiaryId: string;
  moneygramCompany: string;
};

export type CreateTransactionInput = {
  customerId: string;
  beneficiaryId: string;
  beneficiaryIndex: number;
  provider: ProviderId;
  destinationCountry: string;
  deliveryType: DeliveryTypeId;
  wuService: string;
  moneygramCompany: string;
  payingPartner: string;
  location: string;
  terraPayBank: string;
  terraPayCbu: string;
  terraPayWallet: string;
  terraPayAlias: string;
  amount: number;
  paymentMethod: string;
  service: string;
};

const MONTH_LABELS = [
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

const SEED_TRANSACTIONS = transactionsHistorySnapshot as StoredTransaction[];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatTransactionDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_LABELS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatTransactionTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function sortByNewest(items: StoredTransaction[]): StoredTransaction[] {
  return [...items].sort((left, right) => {
    if (left.date === right.date) {
      return right.time.localeCompare(left.time);
    }
    return right.id.localeCompare(left.id);
  });
}

let seedPromise: Promise<void> | null = null;

export async function ensureTransactionsSeeded(): Promise<void> {
  if (seedPromise !== null) return seedPromise;
  seedPromise = (async () => {
    const existingCount = await countTransactions();
    if (existingCount > 0) return;
    await writeTransactions(SEED_TRANSACTIONS);
  })();
  return seedPromise;
}

export async function listTransactionsByCustomer(
  customerId: string,
): Promise<StoredTransaction[]> {
  await ensureTransactionsSeeded();
  await wait(API_LATENCY_MS);
  const items = await readTransactionsByCustomerId(customerId);
  return sortByNewest(items);
}

export async function listAllTransactions(): Promise<StoredTransaction[]> {
  await ensureTransactionsSeeded();
  await wait(API_LATENCY_MS);
  const items = await readAllTransactions();
  return sortByNewest(items);
}

export async function createCompletedTransaction(
  input: CreateTransactionInput,
): Promise<StoredTransaction> {
  await ensureTransactionsSeeded();
  await wait(API_LATENCY_MS);

  const now = new Date();
  const stored: StoredTransaction = {
    id: `12${String(Date.now()).slice(-9)}`,
    customerId: input.customerId,
    beneficiaryId: input.beneficiaryId,
    date: formatTransactionDate(now),
    time: formatTransactionTime(now),
    status: "Completada",
    provider: input.provider,
    destinationCountry: input.destinationCountry,
    deliveryType: input.deliveryType,
    wuService: input.wuService,
    moneygramCompany: input.moneygramCompany,
    service: input.service,
    payingPartner: input.payingPartner,
    location: input.location,
    terraPayBank: input.terraPayBank,
    terraPayCbu: input.terraPayCbu,
    terraPayWallet: input.terraPayWallet,
    terraPayAlias: input.terraPayAlias,
    amount: input.amount,
    beneficiaryIndex: input.beneficiaryIndex,
    paymentMethod: input.paymentMethod,
  };

  await writeTransaction(stored);
  return stored;
}
