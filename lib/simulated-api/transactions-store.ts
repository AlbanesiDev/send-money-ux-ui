import { TRANSACTIONS_STORE, openSendMoneyDb } from "./send-money-db";
import type { StoredTransaction } from "./transactions-api";

export async function readAllTransactions(): Promise<StoredTransaction[]> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TRANSACTIONS_STORE, "readonly");
    const store = transaction.objectStore(TRANSACTIONS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as StoredTransaction[]);
    request.onerror = () => reject(request.error);
  });
}

export async function readTransactionsByCustomerId(
  customerId: string,
): Promise<StoredTransaction[]> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TRANSACTIONS_STORE, "readonly");
    const store = transaction.objectStore(TRANSACTIONS_STORE);
    const index = store.index("customerId");
    const request = index.getAll(customerId);
    request.onsuccess = () => resolve(request.result as StoredTransaction[]);
    request.onerror = () => reject(request.error);
  });
}

export async function writeTransaction(
  item: StoredTransaction,
): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TRANSACTIONS_STORE, "readwrite");
    const store = transaction.objectStore(TRANSACTIONS_STORE);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function writeTransactions(
  items: StoredTransaction[],
): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TRANSACTIONS_STORE, "readwrite");
    const store = transaction.objectStore(TRANSACTIONS_STORE);
    for (const item of items) {
      store.put(item);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function countTransactions(): Promise<number> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TRANSACTIONS_STORE, "readonly");
    const store = transaction.objectStore(TRANSACTIONS_STORE);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
