import type {
  CollectionStatus,
  RecentTransaction,
} from "@/components/send-money/recent-transactions";
import type { DeliveryTypeId, ProviderId } from "@/components/send-money/types";
import transactionsHistorySnapshot from "@/public/data/transactions-history.snapshot.json";
import {
  countTransactions,
  readAllTransactions,
  readTransactionById,
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

function resolveCollectionStatus(item: StoredTransaction): CollectionStatus {
  if (item.collectionStatus === "available") return "available";
  if (item.collectionStatus === "onHold") return "onHold";
  if (item.collectionStatus === "paid") return "paid";
  if (item.status === "En revisión") return "onHold";
  if (item.status === "Cancelada") return "onHold";
  return "available";
}

export async function ensureTransactionsSeeded(): Promise<void> {
  if (seedPromise !== null) return seedPromise;
  seedPromise = (async () => {
    const existingCount = await countTransactions();
    if (existingCount === 0) {
      await writeTransactions(SEED_TRANSACTIONS);
      return;
    }
    const items = await readAllTransactions();
    let needsWrite = false;
    const patched: StoredTransaction[] = [];
    for (const item of items) {
      let collectionStatus = resolveCollectionStatus(item);
      if (item.collectionStatus === undefined) {
        for (const seed of SEED_TRANSACTIONS) {
          if (seed.id !== item.id) continue;
          collectionStatus = seed.collectionStatus;
          break;
        }
      }
      let paidAt = item.paidAt;
      if (item.collectionStatus === undefined) {
        for (const seed of SEED_TRANSACTIONS) {
          if (seed.id !== item.id) continue;
          if (seed.paidAt !== undefined) {
            paidAt = seed.paidAt;
          }
          break;
        }
      }
      if (
        item.collectionStatus === collectionStatus &&
        item.paidAt === paidAt
      ) {
        patched.push(item);
        continue;
      }
      needsWrite = true;
      patched.push({ ...item, collectionStatus, paidAt });
    }
    if (needsWrite) {
      await writeTransactions(patched);
    }
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
    collectionStatus: "available",
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

export async function findTransactionByOperationNumber(
  operationNumber: string,
): Promise<StoredTransaction | null> {
  await ensureTransactionsSeeded();
  await wait(API_LATENCY_MS);
  const stored = await readTransactionById(operationNumber.trim());
  if (stored === null) return null;
  return {
    ...stored,
    collectionStatus: resolveCollectionStatus(stored),
  };
}

export async function markTransactionAsPaid(
  operationNumber: string,
): Promise<StoredTransaction> {
  await ensureTransactionsSeeded();
  await wait(API_LATENCY_MS);

  const stored = await readTransactionById(operationNumber.trim());
  if (stored === null) {
    throw new Error(`Transaction ${operationNumber} was not found`);
  }

  const collectionStatus = resolveCollectionStatus(stored);
  if (collectionStatus === "paid") {
    throw new Error(`Transaction ${operationNumber} was already paid`);
  }
  if (collectionStatus === "onHold") {
    throw new Error(`Transaction ${operationNumber} is on hold`);
  }

  const now = new Date();
  const paid: StoredTransaction = {
    ...stored,
    collectionStatus: "paid",
    paidAt: `${formatTransactionDate(now)} · ${formatTransactionTime(now)}`,
  };
  await writeTransaction(paid);
  return paid;
}
