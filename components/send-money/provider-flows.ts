import type { ProviderFlow, ProviderId, ProviderQuote } from "./types";

export const BASE_STEPS = ["Transacción", "Cotización"] as const;

export const PROVIDER_IDS: ProviderId[] = ["RIA", "WU", "QPAY", "TERRAPAY"];

export const providerFlows: Record<ProviderId, ProviderFlow> = {
  RIA: {
    stepLabels: [
      "Remitente",
      "Beneficiario",
      "Información adicional",
      "Método de pago",
      "Revisión",
    ],
    stepKeys: [
      "remitter",
      "beneficiary",
      "additionalInfo",
      "payment",
      "review",
    ],
  },
  WU: {
    stepLabels: [
      "Remitente",
      "PEP",
      "Beneficiario",
      "Método de pago",
      "Revisión",
    ],
    stepKeys: ["remitter", "pep", "beneficiary", "payment", "review"],
  },
  QPAY: {
    stepLabels: [
      "Remitente",
      "PEP",
      "Beneficiario",
      "Método de pago",
      "Revisión",
    ],
    stepKeys: ["remitter", "pep", "beneficiary", "payment", "review"],
  },
  TERRAPAY: {
    stepLabels: [
      "Remitente",
      "PEP",
      "Beneficiario",
      "Método de pago",
      "Revisión",
    ],
    stepKeys: ["remitter", "pep", "beneficiary", "payment", "review"],
  },
};

export function buildActiveSteps(provider: ProviderId): string[] {
  return [...BASE_STEPS, ...providerFlows[provider].stepLabels];
}

export function buildProviderQuotes(amount: number): ProviderQuote[] {
  return [
    { provider: "RIA", amount, fee: 5, tax: 0.91, rate: 6.96 },
    { provider: "WU", amount, fee: 7.5, tax: 0.98, rate: 6.94 },
    { provider: "QPAY", amount, fee: 4.2, tax: 0.85, rate: 6.97 },
    { provider: "TERRAPAY", amount, fee: 6, tax: 0.9, rate: 6.95 },
  ];
}

export function getStepKey(
  provider: ProviderId,
  step: number,
): ProviderFlow["stepKeys"][number] {
  const key = providerFlows[provider].stepKeys[step - 3];
  if (!key) {
    throw new Error(`No step key for ${provider} at step ${step}`);
  }
  return key;
}

export function findStepNumber(activeSteps: string[], label: string): number {
  return activeSteps.indexOf(label) + 1;
}
