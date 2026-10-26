export type ProviderId = "RIA" | "WU" | "MONEYGRAM" | "TERRAPAY";

/** Maps to CIS presential/WU/TerraPay delivery codes in production. */
export type DeliveryTypeId = "CASH" | "BANK" | "WALLET";

export type CatalogProvider = {
  id: number;
  code: ProviderId;
  name: string;
  description?: string;
  logo: string;
  amountSent: boolean;
  amountReceived: boolean;
  sendingTypes: DeliveryTypeId[];
};

/** Promotion the provider applied to the quote for the entered promo code. */
export type QuotePromotion = {
  code: string;
  name: string;
  description: string;
  /** Discount applied to the provider fee, in USD. */
  discount: number;
};

export type ProviderQuote = {
  provider: ProviderId;
  label: string;
  description?: string;
  amount: number;
  fee: number;
  tax: number;
  itf: number;
  rate: number;
  deliveryType: DeliveryTypeId;
  logo: string;
  promotion: QuotePromotion | null;
  /** RIA sin socio pagador/locación: la API real no cotiza, montos en 0. */
  awaitingPayout?: boolean;
};

export type ProviderStepKey = "parties" | "review";

export type ProviderFlow = {
  stepLabels: string[];
  stepKeys: ProviderStepKey[];
};

export type CustomerStatus = "active" | "blocked";

export type CustomerPepData = {
  position: string;
  occupation: string;
  economicActivity: string;
  employmentLevel: string;
  employer: string;
  jobTitle: string;
  workAddress: string;
  monthlyIncome: string;
  fundsOrigin: string;
  resourceDestination: string;
  transactionPurpose: string;
  sendType: string;
  senderRelation: string;
  relationType: string;
  publicPositions: string;
  suspiciousReason: string;
};

export type Customer = {
  id: string;
  documentNumbers: string[];
  status: CustomerStatus;
  documentType: string;
  documentIssueCountry: string;
  documentIssueDate: string;
  documentExpiryDate: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  fullName: string;
  birthDate: string;
  birthCountry: string;
  nationality: string;
  gender: string;
  civilStatus: string;
  spouseName: string;
  email: string;
  emailMasked: string;
  phone: string;
  mobile: string;
  country: string;
  state: string;
  city: string;
  street: string;
  houseNumber: string;
  address: string;
  address2: string;
  zone: string;
  postalCode: string;
  isPep: boolean;
  pep: CustomerPepData;
};

export type Beneficiary = {
  id: string;
  customerId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  name: string;
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

export type MoneygramAccount = {
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

export type PaymentCurrency = "USD" | "BOB";

export type PaymentLine = {
  id: number;
  method: string;
  currency: PaymentCurrency;
  /** Amount in the line's own currency. */
  amount: number;
  /** Equivalent in USD cents, used to discount from the primary line. */
  usdCents: number;
};
