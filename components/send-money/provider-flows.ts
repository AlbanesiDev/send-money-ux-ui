import providersCatalogJson from "@/public/catalogs/catalog-providers.json";
import type {
  CatalogProvider,
  DeliveryTypeId,
  ProviderFlow,
  ProviderId,
  ProviderQuote,
} from "./types";

const providersCatalog = providersCatalogJson as CatalogProvider[];

export const BASE_STEPS = ["Identificación", "Cotización"] as const;

/** Shared provider step labels — every provider uses the same sequence. */
export const PARTIES_STEP_LABEL = "Remitente y beneficiario";
export const REVIEW_STEP_LABEL = "Revisión";

/**
 * Stable stepper labels before a provider is chosen.
 * New flow: 4 steps. Repeat flow (skip parties): 3 steps.
 */
export function buildQuoteLoadingSteps(skipParties: boolean): string[] {
  return skipParties
    ? [...BASE_STEPS, REVIEW_STEP_LABEL]
    : [...BASE_STEPS, PARTIES_STEP_LABEL, REVIEW_STEP_LABEL];
}

export const PROVIDER_IDS: ProviderId[] = providersCatalog.map(
  (item) => item.code,
);

export const DELIVERY_TYPE_OPTIONS: {
  id: DeliveryTypeId;
  label: string;
}[] = [
  { id: "CASH", label: "Envío - Dinero en minutos" },
  { id: "CASH24", label: "Envío - 24 horas" },
  { id: "BANK", label: "Direct to bank" },
  { id: "WALLET", label: "Direct to wallet" },
];

export const providerDeliverySupport: Record<ProviderId, DeliveryTypeId[]> =
  Object.fromEntries(
    providersCatalog.map((item) => [item.code, item.sendingTypes]),
  ) as Record<ProviderId, DeliveryTypeId[]>;

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

const SHARED_PROVIDER_STEP_LABELS = [PARTIES_STEP_LABEL, REVIEW_STEP_LABEL];

export const providerFlows: Record<ProviderId, ProviderFlow> = {
  RIA: {
    stepLabels: SHARED_PROVIDER_STEP_LABELS,
    stepKeys: ["parties", "review"],
  },
  WU: {
    stepLabels: SHARED_PROVIDER_STEP_LABELS,
    stepKeys: ["parties", "review"],
  },
  MONEYGRAM: {
    stepLabels: SHARED_PROVIDER_STEP_LABELS,
    stepKeys: ["parties", "review"],
  },
  TERRAPAY: {
    stepLabels: SHARED_PROVIDER_STEP_LABELS,
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

export function buildProviderQuotes(
  amount: number,
  deliveryType: DeliveryTypeId,
): ProviderQuote[] {
  let feeMultiplier = 1;
  let ivaMultiplier = 1;
  let rateMultiplier = 1;
  if (deliveryType === "CASH") {
    feeMultiplier = 1.1;
    ivaMultiplier = 1.08;
    rateMultiplier = 0.982;
  } else if (deliveryType === "CASH24") {
    feeMultiplier = 1.04;
    ivaMultiplier = 1.03;
    rateMultiplier = 0.991;
  } else if (deliveryType === "BANK") {
    feeMultiplier = 0.82;
    ivaMultiplier = 0.88;
    rateMultiplier = 1.018;
  } else if (deliveryType === "WALLET") {
    feeMultiplier = 0.9;
    ivaMultiplier = 0.94;
    rateMultiplier = 1.01;
  }

  const amountFeeShare = amount * 0.0025;
  const candidates = providersCatalog.filter((item) =>
    item.sendingTypes.includes(deliveryType),
  );
  const feeWeights = candidates.map(() => Math.random());
  const minWeight = Math.min(...feeWeights);
  const maxWeight = Math.max(...feeWeights);
  const weightSpan = maxWeight - minWeight;

  return candidates.map((item, index) => {
    const feeJitter = 1 + (Math.random() * 0.07 - 0.035);
    const ivaJitter = 1 + (Math.random() * 0.07 - 0.035);
    const rateJitter = 1 + (Math.random() * 0.07 - 0.035);
    const feeSpread = ((feeWeights[index] - minWeight) / weightSpan) * 10;
    const fee =
      Math.round(
        (5 * feeMultiplier + amountFeeShare + feeSpread) * feeJitter * 100,
      ) / 100;
    const tax = Math.round(0.91 * ivaMultiplier * ivaJitter * 100) / 100;
    const rate = Math.round(6.9 * rateMultiplier * rateJitter * 10000) / 10000;

    return {
      provider: item.code,
      label: item.name,
      fee,
      tax,
      rate,
      logo: item.logo,
      amount,
      deliveryType,
    };
  });
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
