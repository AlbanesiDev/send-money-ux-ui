import {
  quoteFieldVisibility,
  type QuoteFieldVisibility,
} from "./provider-flows";
import type { DeliveryTypeId } from "./types";

export function isQuoteAmountUnlocked(
  deliveryType: DeliveryTypeId,
  values: {
    payingPartner: string;
    location: string;
    wuService: string;
    moneygramCompany: string;
  },
): boolean {
  const visibility: QuoteFieldVisibility = quoteFieldVisibility(deliveryType);
  if (visibility.showRiaPartnerLocation) {
    if (!values.payingPartner || !values.location) return false;
  }
  if (visibility.showWuService && !values.wuService) return false;
  if (visibility.showMoneygramCompany && !values.moneygramCompany) return false;
  return true;
}
