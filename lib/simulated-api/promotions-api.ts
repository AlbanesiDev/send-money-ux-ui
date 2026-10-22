import type { ProviderId, QuotePromotion } from "@/components/send-money/types";

/** Providers whose quote services accept a promo code. */
export const PROMO_CODE_PROVIDERS: ProviderId[] = ["WU", "RIA"];

/**
 * `promotions` block of GetChargesTaxes (WU). `promo_discount_amount` comes in
 * cents (50000 = 500,00) and is "" or [] when the code is not valid.
 */
export type WuFeeInquiryPromotions = {
  promo_code_description: string | [];
  promo_sequence_no: number | [];
  promo_name: string | [];
  promo_discount_amount: number | "" | [];
};

/** `Response.Promotion` block of GetAmountsAndRequirements (RIA). */
export type RiaPromotion = {
  OriginalCustomerCharge: number;
  CustomerChargePromoIncluded: number;
  PromoDiscount: number;
  PromoCode: string;
  PromoMessage: string;
};

type SimulatedPromo = {
  code: string;
  description: string;
  providers: ProviderId[];
  /** Percentage of the fee, or fixed USD amount. */
  kind: "percent" | "fixed";
  value: number;
  minAmount: number;
  sequenceNo: number;
};

const SIMULATED_PROMOS: SimulatedPromo[] = [
  {
    code: "PROMO10",
    description: "10% de descuento en el cargo de envío",
    providers: ["WU", "RIA"],
    kind: "percent",
    value: 10,
    minAmount: 0,
    sequenceNo: 77,
  },
  {
    code: "WU5OFF",
    description: "5 USD de descuento en el cargo (envíos desde 100 USD)",
    providers: ["WU"],
    kind: "fixed",
    value: 5,
    minAmount: 100,
    sequenceNo: 81,
  },
  {
    code: "RIAFREE",
    description: "Cargo de envío sin costo",
    providers: ["RIA"],
    kind: "percent",
    value: 100,
    minAmount: 0,
    sequenceNo: 0,
  },
];

export function normalizePromoCode(value: string): string {
  return value.replace(/\s/g, "").toUpperCase();
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function findPromo(
  provider: ProviderId,
  code: string,
  amount: number,
): SimulatedPromo | null {
  const normalized = normalizePromoCode(code);
  for (const promo of SIMULATED_PROMOS) {
    if (promo.code !== normalized) continue;
    if (!promo.providers.includes(provider)) return null;
    if (amount < promo.minAmount) return null;
    return promo;
  }
  return null;
}

function discountCents(promo: SimulatedPromo, fee: number): number {
  const feeCents = toCents(fee);
  if (promo.kind === "percent") {
    return Math.min(feeCents, Math.round((feeCents * promo.value) / 100));
  }
  return Math.min(feeCents, toCents(promo.value));
}

/** Simulates the `promotions` block WU returns for `promo_code`. */
export function simulateWuPromotions(
  code: string,
  fee: number,
  amount: number,
): WuFeeInquiryPromotions {
  const promo = findPromo("WU", code, amount);
  if (promo === null) {
    return {
      promo_code_description: [],
      promo_sequence_no: [],
      promo_name: [],
      promo_discount_amount: "",
    };
  }
  return {
    promo_code_description: promo.description,
    promo_sequence_no: promo.sequenceNo,
    promo_name: promo.code,
    promo_discount_amount: discountCents(promo, fee),
  };
}

/** Simulates the `Promotion` block RIA returns for `PromoCode`. */
export function simulateRiaPromotion(
  code: string,
  fee: number,
  amount: number,
): RiaPromotion | null {
  const promo = findPromo("RIA", code, amount);
  if (promo === null) return null;
  const discount = discountCents(promo, fee) / 100;
  return {
    OriginalCustomerCharge: fee,
    CustomerChargePromoIncluded: Math.round((fee - discount) * 100) / 100,
    PromoDiscount: discount,
    PromoCode: promo.code,
    PromoMessage: promo.description,
  };
}

function firstString(value: string | []): string {
  return Array.isArray(value) ? "" : value;
}

/**
 * Same rule as mobile-legacy `getValidPromoDiscountAmount`: "" or [] means no
 * valid promotion, and the amount must be divided by 100.
 */
export function parseWuPromotions(
  raw: WuFeeInquiryPromotions | null,
): QuotePromotion | null {
  if (raw === null) return null;
  const amount = raw.promo_discount_amount;
  if (amount === "" || Array.isArray(amount)) return null;
  const discount = Number(amount) / 100;
  if (!Number.isFinite(discount) || discount <= 0) return null;
  return {
    code: firstString(raw.promo_name),
    name: firstString(raw.promo_name),
    description: firstString(raw.promo_code_description),
    discount,
  };
}

export function parseRiaPromotion(
  raw: RiaPromotion | null,
): QuotePromotion | null {
  if (raw === null || raw.PromoDiscount <= 0) return null;
  return {
    code: raw.PromoCode,
    name: raw.PromoCode,
    description: raw.PromoMessage,
    discount: raw.PromoDiscount,
  };
}

/** Promotion the provider would apply to a quote, or null if it does not. */
export function resolveQuotePromotion(
  provider: ProviderId,
  code: string,
  fee: number,
  amount: number,
): QuotePromotion | null {
  if (normalizePromoCode(code) === "") return null;
  if (provider === "WU") {
    return parseWuPromotions(simulateWuPromotions(code, fee, amount));
  }
  if (provider === "RIA") {
    return parseRiaPromotion(simulateRiaPromotion(code, fee, amount));
  }
  return null;
}
