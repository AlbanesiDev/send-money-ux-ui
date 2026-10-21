import type { Customer, CustomerPepData } from "@/components/send-money/types";
import customersSnapshot from "@/public/data/customers.snapshot.json";
import {
  countCustomers,
  readAllCustomers,
  readCustomerByDocument,
  readCustomerByDocumentIdentity,
  writeCustomer,
  writeCustomers,
} from "./customers-store";

const API_LATENCY_MS = 550;
const SEED_CUSTOMERS = customersSnapshot as Customer[];

export type CustomerRegistrationDraft = {
  documentNumber: string;
  documentType: string;
  documentIssueCountry: string;
  documentIssueDate: string;
  documentExpiryDate: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  birthCountry: string;
  nationality: string;
  gender: string;
  email: string;
  phone: string;
  mobile: string;
  street: string;
  address: string;
  state: string;
  city: string;
  houseNumber: string;
  address2: string;
  zone: string;
  postalCode: string;
  isPep: boolean;
  pep: CustomerPepData;
};

export type RegisterCustomerResult = {
  customer: Customer;
  updated: boolean;
};

export class DuplicateCustomerError extends Error {
  constructor(documentType: string, documentNumber: string) {
    super(`Ya existe un cliente con ${documentType} ${documentNumber}.`);
    this.name = "DuplicateCustomerError";
  }
}

const EMPTY_PEP: CustomerPepData = {
  position: "",
  occupation: "",
  economicActivity: "",
  employmentLevel: "",
  employer: "",
  jobTitle: "",
  workAddress: "",
  monthlyIncome: "",
  fundsOrigin: "",
  resourceDestination: "",
  transactionPurpose: "",
  sendType: "",
  senderRelation: "",
  relationType: "",
  publicPositions: "",
  suspiciousReason: "",
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function maskEmail(email: string): string {
  if (email.trim() === "") return "";
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;
  return `${email[0]}***${email.slice(atIndex)}`;
}

function buildFullName(draft: CustomerRegistrationDraft): string {
  return [
    draft.firstName,
    draft.middleName,
    draft.lastName,
    draft.secondLastName,
  ]
    .filter((part) => part.trim() !== "")
    .join(" ");
}

function applyDraftToCustomer(
  base: Customer,
  draft: CustomerRegistrationDraft,
): Customer {
  const documentNumber = draft.documentNumber.trim();
  let documentNumbers = base.documentNumbers;
  if (!documentNumbers.includes(documentNumber)) {
    documentNumbers = [...documentNumbers, documentNumber];
  }

  return {
    ...base,
    documentNumbers,
    documentType: draft.documentType,
    documentIssueCountry: draft.documentIssueCountry,
    documentIssueDate: draft.documentIssueDate,
    documentExpiryDate: draft.documentExpiryDate,
    firstName: draft.firstName,
    middleName: draft.middleName,
    lastName: draft.lastName,
    secondLastName: draft.secondLastName,
    fullName: buildFullName(draft),
    birthDate: draft.birthDate,
    birthCountry: draft.birthCountry,
    nationality: draft.nationality,
    gender: draft.gender,
    email: draft.email,
    emailMasked: maskEmail(draft.email),
    phone: draft.phone,
    mobile: draft.mobile,
    street: draft.street,
    address: draft.address,
    state: draft.state,
    city: draft.city,
    houseNumber: draft.houseNumber,
    address2: draft.address2,
    zone: draft.zone,
    postalCode: draft.postalCode,
    isPep: draft.isPep,
    pep: draft.isPep ? draft.pep : EMPTY_PEP,
  };
}

let seedPromise: Promise<void> | null = null;

export async function ensureCustomersSeeded(): Promise<void> {
  if (seedPromise !== null) return seedPromise;
  seedPromise = (async () => {
    const existingCount = await countCustomers();
    if (existingCount > 0) return;
    await writeCustomers(SEED_CUSTOMERS);
  })();
  return seedPromise;
}

export async function listCustomers(): Promise<Customer[]> {
  await ensureCustomersSeeded();
  await wait(API_LATENCY_MS);
  return readAllCustomers();
}

export async function findCustomerByDocument(
  documentNumber: string,
): Promise<Customer | null> {
  await ensureCustomersSeeded();
  await wait(API_LATENCY_MS);
  const trimmed = documentNumber.trim();
  if (trimmed === "") return null;
  return readCustomerByDocument(trimmed);
}

export async function findCustomerByDocumentIdentity(
  documentType: string,
  documentNumber: string,
): Promise<Customer | null> {
  await ensureCustomersSeeded();
  await wait(API_LATENCY_MS);
  return readCustomerByDocumentIdentity(documentType, documentNumber);
}

export async function registerCustomer(
  draft: CustomerRegistrationDraft,
): Promise<RegisterCustomerResult> {
  await ensureCustomersSeeded();
  await wait(API_LATENCY_MS);

  const documentType = draft.documentType.trim();
  const documentNumber = draft.documentNumber.trim();
  if (documentType === "" || documentNumber === "") {
    throw new Error("Tipo y número de documento son obligatorios.");
  }

  const existing = await readCustomerByDocumentIdentity(
    documentType,
    documentNumber,
  );

  if (existing !== null) {
    const updated = applyDraftToCustomer(existing, {
      ...draft,
      documentType,
      documentNumber,
    });
    await writeCustomer(updated);
    return { customer: updated, updated: true };
  }

  const customer: Customer = {
    id: `customer-${documentNumber}-${Date.now()}`,
    documentNumbers: [documentNumber],
    status: "active",
    documentType,
    documentIssueCountry: draft.documentIssueCountry,
    documentIssueDate: draft.documentIssueDate,
    documentExpiryDate: draft.documentExpiryDate,
    firstName: draft.firstName,
    middleName: draft.middleName,
    lastName: draft.lastName,
    secondLastName: draft.secondLastName,
    fullName: buildFullName(draft),
    birthDate: draft.birthDate,
    birthCountry: draft.birthCountry,
    nationality: draft.nationality,
    gender: draft.gender,
    civilStatus: "",
    email: draft.email,
    emailMasked: maskEmail(draft.email),
    phone: draft.phone,
    mobile: draft.mobile,
    country: "Bolivia",
    state: draft.state,
    city: draft.city,
    street: draft.street,
    houseNumber: draft.houseNumber,
    address: draft.address,
    address2: draft.address2,
    zone: draft.zone,
    postalCode: draft.postalCode,
    isPep: draft.isPep,
    pep: draft.isPep ? draft.pep : EMPTY_PEP,
  };

  await writeCustomer(customer);
  return { customer, updated: false };
}

export function createEmptyCustomerDraft(
  documentNumber = "",
): CustomerRegistrationDraft {
  return {
    documentNumber,
    documentType: "",
    documentIssueCountry: "",
    documentIssueDate: "",
    documentExpiryDate: "",
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    birthDate: "",
    birthCountry: "",
    nationality: "",
    gender: "",
    email: "",
    phone: "",
    mobile: "",
    street: "",
    address: "",
    state: "",
    city: "",
    houseNumber: "",
    address2: "",
    zone: "",
    postalCode: "",
    isPep: false,
    pep: { ...EMPTY_PEP },
  };
}

export function customerToRegistrationDraft(
  customer: Customer,
): CustomerRegistrationDraft {
  let documentNumber = "";
  if (customer.documentNumbers.length > 0) {
    documentNumber = customer.documentNumbers[0];
  }

  return {
    documentNumber,
    documentType: customer.documentType,
    documentIssueCountry: customer.documentIssueCountry,
    documentIssueDate: customer.documentIssueDate,
    documentExpiryDate: customer.documentExpiryDate,
    firstName: customer.firstName,
    middleName: customer.middleName,
    lastName: customer.lastName,
    secondLastName: customer.secondLastName,
    birthDate: customer.birthDate,
    birthCountry: customer.birthCountry,
    nationality: customer.nationality,
    gender: customer.gender,
    email: customer.email,
    phone: customer.phone,
    mobile: customer.mobile,
    street: customer.street,
    address: customer.address,
    state: customer.state,
    city: customer.city,
    houseNumber: customer.houseNumber,
    address2: customer.address2,
    zone: customer.zone,
    postalCode: customer.postalCode,
    isPep: customer.isPep,
    pep: { ...customer.pep },
  };
}

export { EMPTY_PEP };
