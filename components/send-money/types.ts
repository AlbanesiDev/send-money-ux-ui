export type ProviderId = "RIA" | "WU" | "QPAY" | "TERRAPAY";

/** Maps to CIS presential/WU/TerraPay delivery codes in production. */
export type DeliveryTypeId = "CASH" | "BANK" | "WALLET";

export type ProviderQuote = {
  provider: ProviderId;
  amount: number;
  fee: number;
  tax: number;
  rate: number;
  deliveryType: DeliveryTypeId;
};

export type ProviderStepKey =
  | "remitter"
  | "beneficiary"
  | "additionalInfo"
  | "pep"
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
