const DB_NAME = "send-money-ux-ui";
const DB_VERSION = 3;

export const CUSTOMERS_STORE = "customers";
export const BENEFICIARIES_STORE = "beneficiaries";
export const TRANSACTIONS_STORE = "transactions";

export function openSendMoneyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CUSTOMERS_STORE)) {
        const customersStore = db.createObjectStore(CUSTOMERS_STORE, {
          keyPath: "id",
        });
        customersStore.createIndex("documentNumbers", "documentNumbers", {
          multiEntry: true,
        });
      }
      if (!db.objectStoreNames.contains(BENEFICIARIES_STORE)) {
        const beneficiariesStore = db.createObjectStore(BENEFICIARIES_STORE, {
          keyPath: "id",
        });
        beneficiariesStore.createIndex("customerId", "customerId", {
          unique: false,
        });
      }
      if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
        const transactionsStore = db.createObjectStore(TRANSACTIONS_STORE, {
          keyPath: "id",
        });
        transactionsStore.createIndex("customerId", "customerId", {
          unique: false,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
