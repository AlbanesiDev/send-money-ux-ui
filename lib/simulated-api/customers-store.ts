import type { Customer } from "@/components/send-money/types";

const DB_NAME = "send-money-ux-ui";
const DB_VERSION = 1;
const STORE_NAME = "customers";

function openCustomersDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_NAME)) return;
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("documentNumbers", "documentNumbers", {
        multiEntry: true,
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readAllCustomers(): Promise<Customer[]> {
  const db = await openCustomersDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Customer[]);
    request.onerror = () => reject(request.error);
  });
}

export async function writeCustomer(customer: Customer): Promise<void> {
  const db = await openCustomersDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(customer);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function writeCustomers(customers: Customer[]): Promise<void> {
  const db = await openCustomersDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    for (const customer of customers) {
      store.put(customer);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function readCustomerByDocument(
  documentNumber: string,
): Promise<Customer | null> {
  const db = await openCustomersDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("documentNumbers");
    const request = index.get(documentNumber);
    request.onsuccess = () => {
      const result = request.result;
      if (result === undefined) {
        resolve(null);
        return;
      }
      resolve(result as Customer);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function readCustomerByDocumentIdentity(
  documentType: string,
  documentNumber: string,
): Promise<Customer | null> {
  const customers = await readAllCustomers();
  const type = documentType.trim();
  const number = documentNumber.trim();
  for (const customer of customers) {
    if (customer.documentType !== type) continue;
    if (!customer.documentNumbers.includes(number)) continue;
    return customer;
  }
  return null;
}

export async function countCustomers(): Promise<number> {
  const db = await openCustomersDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
