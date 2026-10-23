import type { MoneygramAccount } from "@/components/send-money/types";
import moneygramAccountsSnapshot from "@/public/data/moneygram-accounts.snapshot.json";
import {
  countMoneygramAccounts,
  readMoneygramAccountsByCustomerId,
  writeMoneygramAccount,
  writeMoneygramAccounts,
} from "./moneygram-accounts-store";

const API_LATENCY_MS = 450;
const SEED_ACCOUNTS = moneygramAccountsSnapshot as MoneygramAccount[];

export type MoneygramAccountDraft = {
  id: string;
  customerId: string;
  company: string;
  accountNumber: string;
  locationCode: string;
  reference: string;
  attention: string;
  street: string;
  address: string;
  state: string;
  city: string;
  phone: string;
};

export type RegisterMoneygramAccountResult = {
  account: MoneygramAccount;
  updated: boolean;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

let seedPromise: Promise<void> | null = null;

export async function ensureMoneygramAccountsSeeded(): Promise<void> {
  if (seedPromise !== null) return seedPromise;
  seedPromise = (async () => {
    const existingCount = await countMoneygramAccounts();
    if (existingCount === 0) {
      await writeMoneygramAccounts(SEED_ACCOUNTS);
    }
  })();
  return seedPromise;
}

export async function listMoneygramAccountsByCustomer(
  customerId: string,
): Promise<MoneygramAccount[]> {
  await ensureMoneygramAccountsSeeded();
  await wait(API_LATENCY_MS);
  return readMoneygramAccountsByCustomerId(customerId);
}

export async function registerMoneygramAccount(
  draft: MoneygramAccountDraft,
): Promise<RegisterMoneygramAccountResult> {
  await ensureMoneygramAccountsSeeded();
  await wait(API_LATENCY_MS);

  const customerId = draft.customerId.trim();
  if (customerId === "") {
    throw new Error("Cliente de la cuenta Moneygram es obligatorio.");
  }

  const accountNumber = draft.accountNumber.trim();
  if (accountNumber === "") {
    throw new Error("Número de cuenta Moneygram es obligatorio.");
  }

  const existingForCustomer =
    await readMoneygramAccountsByCustomerId(customerId);
  let existing: MoneygramAccount | null = null;
  if (draft.id.trim() !== "") {
    for (const item of existingForCustomer) {
      if (item.id === draft.id) {
        existing = item;
        break;
      }
    }
  }
  if (existing === null) {
    for (const item of existingForCustomer) {
      if (item.accountNumber === accountNumber) {
        existing = item;
        break;
      }
    }
  }

  if (existing !== null) {
    const updated: MoneygramAccount = {
      ...existing,
      customerId,
      company: draft.company,
      accountNumber,
      locationCode: draft.locationCode,
      reference: draft.reference,
      attention: draft.attention,
      street: draft.street,
      address: draft.address,
      state: draft.state,
      city: draft.city,
      phone: draft.phone,
    };
    await writeMoneygramAccount(updated);
    return { account: updated, updated: true };
  }

  const account: MoneygramAccount = {
    id: `moneygram-${customerId}-${Date.now()}`,
    customerId,
    company: draft.company,
    accountNumber,
    locationCode: draft.locationCode,
    reference: draft.reference,
    attention: draft.attention,
    street: draft.street,
    address: draft.address,
    state: draft.state,
    city: draft.city,
    phone: draft.phone,
  };
  await writeMoneygramAccount(account);
  return { account, updated: false };
}

export function createEmptyMoneygramAccountDraft(
  customerId = "",
): MoneygramAccountDraft {
  return {
    id: "",
    customerId,
    company: "",
    accountNumber: "",
    locationCode: "",
    reference: "",
    attention: "",
    street: "",
    address: "",
    state: "",
    city: "",
    phone: "",
  };
}

export function moneygramAccountToDraft(
  account: MoneygramAccount,
): MoneygramAccountDraft {
  return {
    id: account.id,
    customerId: account.customerId,
    company: account.company,
    accountNumber: account.accountNumber,
    locationCode: account.locationCode,
    reference: account.reference,
    attention: account.attention,
    street: account.street,
    address: account.address,
    state: account.state,
    city: account.city,
    phone: account.phone,
  };
}
