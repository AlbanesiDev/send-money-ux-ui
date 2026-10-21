import type { Customer } from "@/components/send-money/types";
import { CUSTOMERS_STORE, openSendMoneyDb } from "./send-money-db";

export async function readAllCustomers(): Promise<Customer[]> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOMERS_STORE, "readonly");
    const store = transaction.objectStore(CUSTOMERS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Customer[]);
    request.onerror = () => reject(request.error);
  });
}

export async function writeCustomer(customer: Customer): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOMERS_STORE, "readwrite");
    const store = transaction.objectStore(CUSTOMERS_STORE);
    const request = store.put(customer);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function writeCustomers(customers: Customer[]): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOMERS_STORE, "readwrite");
    const store = transaction.objectStore(CUSTOMERS_STORE);
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
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOMERS_STORE, "readonly");
    const store = transaction.objectStore(CUSTOMERS_STORE);
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
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOMERS_STORE, "readonly");
    const store = transaction.objectStore(CUSTOMERS_STORE);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
