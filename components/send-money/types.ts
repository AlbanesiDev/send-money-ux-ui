export type ProviderId = "RIA" | "WU" | "QPAY" | "TERRAPAY";

export type ProviderQuote = {
  provider: ProviderId;
  amount: number;
  fee: number;
  tax: number;
  rate: number;
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
