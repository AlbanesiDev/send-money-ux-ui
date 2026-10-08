import type {
  DeliveryTypeId,
  ProviderFlow,
  ProviderId,
  ProviderQuote,
} from "./types";

export const BASE_STEPS = ["Transacción", "Cotización"] as const;

export const PROVIDER_IDS: ProviderId[] = ["RIA", "WU", "QPAY", "TERRAPAY"];

export const DELIVERY_TYPE_OPTIONS: {
  id: DeliveryTypeId;
  label: string;
}[] = [
  { id: "CASH", label: "Envío" },
  { id: "BANK", label: "Direct to bank" },
  { id: "WALLET", label: "Direct to wallet" },
];

/**
 * Mock support matrix derived from CIS FE/BE:
 * - RIA: operational flows hardcode Cash Pick Up (DeliveryMethodId 1)
 * - WU / QPay: WU SVC_CODE 000 (cash), 500 (DTB), 800/50A (wallet)
 * - TerraPay: BANK_AC, WALLET, CARD (cash-style)
 */
export const providerDeliverySupport: Record<ProviderId, DeliveryTypeId[]> = {
  RIA: ["CASH"],
  WU: ["CASH", "BANK", "WALLET"],
  QPAY: ["CASH", "BANK", "WALLET"],
  TERRAPAY: ["CASH", "BANK", "WALLET"],
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
  showQpayCompany: boolean;
  showTerraPayBank: boolean;
  showTerraPayWallet: boolean;
};

export function quoteFieldVisibility(
  deliveryType: DeliveryTypeId,
): QuoteFieldVisibility {
  const candidates = providersForDeliveryType(deliveryType);
  const hasRia = candidates.includes("RIA");
  const hasWu = candidates.includes("WU");
  const hasQpay = candidates.includes("QPAY");
  const hasTerraPay = candidates.includes("TERRAPAY");

  return {
    showRiaPartnerLocation: hasRia && deliveryType === "CASH",
    showWuService: hasWu,
    showQpayCompany: hasQpay,
    showTerraPayBank: hasTerraPay && deliveryType === "BANK",
    showTerraPayWallet: hasTerraPay && deliveryType === "WALLET",
  };
}

export const WU_SERVICE_OPTIONS: Record<DeliveryTypeId, string[]> = {
  CASH: ["Dinero en minutos (000)", "24 horas"],
  BANK: ["Direct to bank (500)"],
  WALLET: ["Direct to wallet (800)", "Wallet (50A)"],
};

export const QPAY_COMPANY_OPTIONS = [
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

const QUOTE_BASE: Record<
  ProviderId,
  Omit<ProviderQuote, "amount" | "deliveryType">
> = {
  RIA: { provider: "RIA", fee: 5, tax: 0.91, rate: 6.96 },
  WU: { provider: "WU", fee: 7.5, tax: 0.98, rate: 6.94 },
  QPAY: { provider: "QPAY", fee: 4.2, tax: 0.85, rate: 6.97 },
  TERRAPAY: { provider: "TERRAPAY", fee: 6, tax: 0.9, rate: 6.95 },
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
