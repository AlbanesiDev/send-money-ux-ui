import type { Beneficiary } from "@/components/send-money/types";
import { BENEFICIARIES_STORE, openSendMoneyDb } from "./send-money-db";

export async function readAllBeneficiaries(): Promise<Beneficiary[]> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BENEFICIARIES_STORE, "readonly");
    const store = transaction.objectStore(BENEFICIARIES_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Beneficiary[]);
    request.onerror = () => reject(request.error);
  });
}

export async function readBeneficiaryById(
  id: string,
): Promise<Beneficiary | null> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BENEFICIARIES_STORE, "readonly");
    const store = transaction.objectStore(BENEFICIARIES_STORE);
    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result;
      if (result === undefined) {
        resolve(null);
        return;
      }
      resolve(result as Beneficiary);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function readBeneficiariesByCustomerId(
  customerId: string,
): Promise<Beneficiary[]> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BENEFICIARIES_STORE, "readonly");
    const store = transaction.objectStore(BENEFICIARIES_STORE);
    const index = store.index("customerId");
    const request = index.getAll(customerId);
    request.onsuccess = () => resolve(request.result as Beneficiary[]);
    request.onerror = () => reject(request.error);
  });
}

export async function writeBeneficiary(beneficiary: Beneficiary): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BENEFICIARIES_STORE, "readwrite");
    const store = transaction.objectStore(BENEFICIARIES_STORE);
    const request = store.put(beneficiary);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function writeBeneficiaries(
  beneficiaries: Beneficiary[],
): Promise<void> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BENEFICIARIES_STORE, "readwrite");
    const store = transaction.objectStore(BENEFICIARIES_STORE);
    for (const beneficiary of beneficiaries) {
      store.put(beneficiary);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function countBeneficiaries(): Promise<number> {
  const db = await openSendMoneyDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BENEFICIARIES_STORE, "readonly");
    const store = transaction.objectStore(BENEFICIARIES_STORE);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
