export type ProviderId = "RIA" | "WU" | "MONEYGRAM" | "TERRAPAY";

/** Maps to CIS presential/WU/TerraPay delivery codes in production. */
export type DeliveryTypeId = "CASH" | "CASH24" | "BANK" | "WALLET";

export type ProviderQuote = {
  provider: ProviderId;
  label: string;
  amount: number;
  fee: number;
  tax: number;
  rate: number;
  deliveryType: DeliveryTypeId;
};

export type ProviderStepKey =
  | "parties"
  | "payment"
  | "review";

export type ProviderFlow = {
  stepLabels: string[];
  stepKeys: ProviderStepKey[];
};

export type Beneficiary = {
  name: string;
  document: string;
  city: string;
  phone: string;
  email: string;
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
