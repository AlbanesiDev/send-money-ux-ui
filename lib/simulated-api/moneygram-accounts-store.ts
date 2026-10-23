import type { MoneygramAccount } from "@/components/send-money/types";
import { MONEYGRAM_ACCOUNTS_STORE, openSendMoneyDb } from "./send-money-db";

export async function readAllMoneygramAccounts(): Promise<MoneygramAccount[]> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MONEYGRAM_ACCOUNTS_STORE, "readonly");
    const store = transaction.objectStore(MONEYGRAM_ACCOUNTS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as MoneygramAccount[]);
    request.onerror = () => reject(request.error);
  });
}

export async function readMoneygramAccountsByCustomerId(
  customerId: string,
): Promise<MoneygramAccount[]> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MONEYGRAM_ACCOUNTS_STORE, "readonly");
    const store = transaction.objectStore(MONEYGRAM_ACCOUNTS_STORE);
    const index = store.index("customerId");
    const request = index.getAll(customerId);
    request.onsuccess = () => resolve(request.result as MoneygramAccount[]);
    request.onerror = () => reject(request.error);
  });
}

export async function writeMoneygramAccount(
  account: MoneygramAccount,
): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MONEYGRAM_ACCOUNTS_STORE, "readwrite");
    const store = transaction.objectStore(MONEYGRAM_ACCOUNTS_STORE);
    const request = store.put(account);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function writeMoneygramAccounts(
  accounts: MoneygramAccount[],
): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MONEYGRAM_ACCOUNTS_STORE, "readwrite");
    const store = transaction.objectStore(MONEYGRAM_ACCOUNTS_STORE);
    for (const account of accounts) {
      store.put(account);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function countMoneygramAccounts(): Promise<number> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MONEYGRAM_ACCOUNTS_STORE, "readonly");
    const store = transaction.objectStore(MONEYGRAM_ACCOUNTS_STORE);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
