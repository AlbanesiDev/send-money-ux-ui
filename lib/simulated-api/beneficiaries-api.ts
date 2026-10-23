import type { Beneficiary } from "@/components/send-money/types";
import beneficiariesSnapshot from "@/public/data/beneficiaries.snapshot.json";
import {
  countBeneficiaries,
  readAllBeneficiaries,
  readBeneficiariesByCustomerId,
  readBeneficiaryById,
  writeBeneficiaries,
  writeBeneficiary,
} from "./beneficiaries-store";

const API_LATENCY_MS = 450;
const SEED_BENEFICIARIES = beneficiariesSnapshot as Beneficiary[];

export type BeneficiaryRegistrationDraft = {
  id: string;
  customerId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  documentType: string;
  document: string;
  nationality: string;
  state: string;
  city: string;
  street: string;
  address: string;
  phone: string;
  email: string;
};

export type RegisterBeneficiaryResult = {
  beneficiary: Beneficiary;
  updated: boolean;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildBeneficiaryName(draft: BeneficiaryRegistrationDraft): string {
  return [
    draft.firstName,
    draft.middleName,
    draft.lastName,
    draft.secondLastName,
  ]
    .filter((part) => part.trim() !== "")
    .join(" ");
}

let seedPromise: Promise<void> | null = null;

export async function ensureBeneficiariesSeeded(): Promise<void> {
  if (seedPromise !== null) return seedPromise;
  seedPromise = (async () => {
    const existingCount = await countBeneficiaries();
    if (existingCount === 0) {
      await writeBeneficiaries(SEED_BENEFICIARIES);
      return;
    }
    const existing = await readAllBeneficiaries();
    const seedById = new Map(
      SEED_BENEFICIARIES.map((item) => [item.id, item] as const),
    );
    const existingIds = new Set(existing.map((item) => item.id));
    let changed = false;
    const next = existing.map((item) => {
      if (typeof item.nationality === "string") return item;
      changed = true;
      const seed = seedById.get(item.id);
      if (seed !== undefined) {
        return { ...item, nationality: seed.nationality };
      }
      return { ...item, nationality: "" };
    });
    for (const seed of SEED_BENEFICIARIES) {
      if (existingIds.has(seed.id)) continue;
      changed = true;
      next.push(seed);
    }
    if (changed) {
      await writeBeneficiaries(next);
    }
  })();
  return seedPromise;
}

export async function listBeneficiariesByCustomer(
  customerId: string,
): Promise<Beneficiary[]> {
  await ensureBeneficiariesSeeded();
  await wait(API_LATENCY_MS);
  return readBeneficiariesByCustomerId(customerId);
}

export async function findBeneficiaryById(
  id: string,
): Promise<Beneficiary | null> {
  await ensureBeneficiariesSeeded();
  await wait(API_LATENCY_MS);
  return readBeneficiaryById(id);
}

export async function registerBeneficiary(
  draft: BeneficiaryRegistrationDraft,
): Promise<RegisterBeneficiaryResult> {
  await ensureBeneficiariesSeeded();
  await wait(API_LATENCY_MS);

  const customerId = draft.customerId.trim();
  if (customerId === "") {
    throw new Error("Cliente del beneficiario es obligatorio.");
  }

  const document = draft.document.trim();
  const existingForCustomer = await readBeneficiariesByCustomerId(customerId);
  let existing: Beneficiary | null = null;
  if (draft.id.trim() !== "") {
    for (const item of existingForCustomer) {
      if (item.id === draft.id) {
        existing = item;
        break;
      }
    }
  }
  if (existing === null && document !== "") {
    for (const item of existingForCustomer) {
      if (item.document === document) {
        existing = item;
        break;
      }
    }
  }

  const name = buildBeneficiaryName(draft);

  if (existing !== null) {
    const updated: Beneficiary = {
      ...existing,
      customerId,
      firstName: draft.firstName,
      middleName: draft.middleName,
      lastName: draft.lastName,
      secondLastName: draft.secondLastName,
      name,
      documentType: draft.documentType,
      document,
      nationality: draft.nationality,
      state: draft.state,
      city: draft.city,
      street: draft.street,
      address: draft.address,
      phone: draft.phone,
      email: draft.email,
    };
    await writeBeneficiary(updated);
    return { beneficiary: updated, updated: true };
  }

  const beneficiary: Beneficiary = {
    id: `beneficiary-${customerId}-${Date.now()}`,
    customerId,
    firstName: draft.firstName,
    middleName: draft.middleName,
    lastName: draft.lastName,
    secondLastName: draft.secondLastName,
    name,
    documentType: draft.documentType,
    document,
    nationality: draft.nationality,
    state: draft.state,
    city: draft.city,
    street: draft.street,
    address: draft.address,
    phone: draft.phone,
    email: draft.email,
  };
  await writeBeneficiary(beneficiary);
  return { beneficiary, updated: false };
}

export function createEmptyBeneficiaryDraft(
  customerId = "",
): BeneficiaryRegistrationDraft {
  return {
    id: "",
    customerId,
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    documentType: "",
    document: "",
    nationality: "",
    state: "",
    city: "",
    street: "",
    address: "",
    phone: "",
    email: "",
  };
}

export function beneficiaryToRegistrationDraft(
  beneficiary: Beneficiary,
): BeneficiaryRegistrationDraft {
  let nationality = "";
  if (typeof beneficiary.nationality === "string") {
    nationality = beneficiary.nationality;
  }
  return {
    id: beneficiary.id,
    customerId: beneficiary.customerId,
    firstName: beneficiary.firstName,
    middleName: beneficiary.middleName,
    lastName: beneficiary.lastName,
    secondLastName: beneficiary.secondLastName,
    documentType: beneficiary.documentType,
    document: beneficiary.document,
    nationality,
    state: beneficiary.state,
    city: beneficiary.city,
    street: beneficiary.street,
    address: beneficiary.address,
    phone: beneficiary.phone,
    email: beneficiary.email,
  };
}
