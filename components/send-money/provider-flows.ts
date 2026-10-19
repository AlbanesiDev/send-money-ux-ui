import type {
  DeliveryTypeId,
  ProviderFlow,
  ProviderId,
  ProviderQuote,
} from "./types";

export const BASE_STEPS = ["Identificación", "Cotización"] as const;

export const PROVIDER_IDS: ProviderId[] = [
  "RIA",
  "WU",
  "MONEYGRAM",
  "TERRAPAY",
];

export const DELIVERY_TYPE_OPTIONS: {
  id: DeliveryTypeId;
  label: string;
}[] = [
  { id: "CASH", label: "Envío - Dinero en minutos" },
  { id: "CASH24", label: "Envío - 24 horas" },
  { id: "BANK", label: "Direct to bank" },
  { id: "WALLET", label: "Direct to wallet" },
];

/**
 * Mock support matrix derived from CIS FE/BE:
 * - RIA: operational flows hardcode Cash Pick Up (DeliveryMethodId 1)
 * - WU / Moneygram: WU SVC_CODE 000 (cash), 500 (DTB), 800/50A (wallet)
 * - TerraPay: BANK_AC, WALLET, CARD (cash-style)
 */
export const providerDeliverySupport: Record<ProviderId, DeliveryTypeId[]> = {
  RIA: ["CASH", "CASH24"],
  WU: ["CASH", "CASH24", "BANK", "WALLET"],
  MONEYGRAM: ["CASH", "CASH24", "BANK", "WALLET"],
  TERRAPAY: ["CASH", "CASH24", "BANK", "WALLET"],
};

export function providersForDeliveryType(
  deliveryType: DeliveryTypeId,
): ProviderId[] {
  return PROVIDER_IDS.filter((provider) =>
    providerDeliverySupport[provider].includes(deliveryType),
  );
}

export function deliveryTypeLabel(deliveryType: DeliveryTypeId): string {
  const option = DELIVERY_TYPE_OPTIONS.find((item) => item.id === deliveryType);
  if (!option) {
    throw new Error(`Unknown delivery type: ${deliveryType}`);
  }
  return option.label;
}

/** Which Cotización fields to show before quoting, by delivery type. */
export type QuoteFieldVisibility = {
  showRiaPartnerLocation: boolean;
  showWuService: boolean;
  showMoneygramCompany: boolean;
  showTerraPayBank: boolean;
  showTerraPayWallet: boolean;
};

export function quoteFieldVisibility(
  deliveryType: DeliveryTypeId,
): QuoteFieldVisibility {
  const candidates = providersForDeliveryType(deliveryType);
  const hasRia = candidates.includes("RIA");
  const hasWu = candidates.includes("WU");
  const hasMoneygram = candidates.includes("MONEYGRAM");
  const hasTerraPay = candidates.includes("TERRAPAY");

  return {
    showRiaPartnerLocation: hasRia && deliveryType === "CASH",
    showWuService: hasWu,
    showMoneygramCompany: hasMoneygram,
    showTerraPayBank: hasTerraPay && deliveryType === "BANK",
    showTerraPayWallet: hasTerraPay && deliveryType === "WALLET",
  };
}

export const MONEYGRAM_COMPANY_OPTIONS = [
  "Sol & Luna Pagos",
  "Quick Pay Bolivia",
  "Remesas Andinas",
];

export const TERRAPAY_BANK_OPTIONS = [
  "Banco Nacional",
  "Banco Mercantil",
  "Banco Unión",
];

export const TERRAPAY_WALLET_OPTIONS = ["Tigo Money", "Yape", "Mercado Pago"];

export const providerFlows: Record<ProviderId, ProviderFlow> = {
  RIA: {
    stepLabels: ["Remitente y beneficiario", "Revisión"],
    stepKeys: ["parties", "review"],
  },
  WU: {
    stepLabels: ["Remitente y beneficiario", "Revisión"],
    stepKeys: ["parties", "review"],
  },
  MONEYGRAM: {
    stepLabels: ["Remitente y beneficiario", "Revisión"],
    stepKeys: ["parties", "review"],
  },
  TERRAPAY: {
    stepLabels: ["Remitente y beneficiario", "Revisión"],
    stepKeys: ["parties", "review"],
  },
};

export function buildActiveSteps(
  provider: ProviderId,
  options?: { skipParties?: boolean },
): string[] {
  const flow = providerFlows[provider];
  const providerLabels = options?.skipParties
    ? flow.stepLabels.filter((_, index) => flow.stepKeys[index] !== "parties")
    : flow.stepLabels;
  return [...BASE_STEPS, ...providerLabels];
}

const QUOTE_BASE: Record<
  ProviderId,
  Omit<ProviderQuote, "amount" | "deliveryType">
> = {
  RIA: { label: "RIA", provider: "RIA", fee: 5, tax: 0.91, rate: 6.96 },
  WU: {
    label: "WESTERN UNION",
    provider: "WU",
    fee: 7.5,
    tax: 0.98,
    rate: 6.94,
  },
  MONEYGRAM: {
    label: "MONEYGRAM",
    provider: "MONEYGRAM",
    fee: 4.2,
    tax: 0.85,
    rate: 6.97,
  },
  TERRAPAY: {
    label: "TERRAPAY",
    provider: "TERRAPAY",
    fee: 6,
    tax: 0.9,
    rate: 6.95,
  },
};

export function buildProviderQuotes(
  amount: number,
  deliveryType: DeliveryTypeId,
): ProviderQuote[] {
  return providersForDeliveryType(deliveryType).map((provider) => ({
    ...QUOTE_BASE[provider],
    amount,
    deliveryType,
  }));
}

export function getStepKey(
  provider: ProviderId,
  step: number,
  activeSteps: readonly string[],
): ProviderFlow["stepKeys"][number] {
  const label = activeSteps[step - 1];
  if (!label) {
    throw new Error(`No step label for ${provider} at step ${step}`);
  }
  const flow = providerFlows[provider];
  const index = flow.stepLabels.indexOf(label);
  if (index < 0) {
    throw new Error(`No step key for ${provider} at label ${label}`);
  }
  return flow.stepKeys[index];
}

export function findStepNumber(activeSteps: string[], label: string): number {
  return activeSteps.indexOf(label) + 1;
}
