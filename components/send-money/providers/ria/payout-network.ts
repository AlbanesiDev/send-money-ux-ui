import networkJson from "@/public/catalogs/RIA/catalog-ria-payout-network.json";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";

/**
 * Red de pago de RIA para la demo (AR y BO). Se genera con
 * `scripts/generate-ria-payout-network.cjs` a partir de los snapshots de RIA
 * más sucursales inventadas en cada provincia: no es data real.
 */
export type RiaPayoutPartner = {
  id: number;
  name: string;
  country: string;
  /**
   * RIA "Open Network": paga en cualquier sucursal del socio. "Point to Point"
   * sólo en la sucursal elegida.
   */
  openNetwork: boolean;
};

export type RiaPayoutLocation = {
  id: number;
  partnerId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  stateName: string;
  country: string;
};

const network = networkJson as {
  partners: RiaPayoutPartner[];
  locations: RiaPayoutLocation[];
};

const searchKeywords = (values: string[]) =>
  Array.from(new Set(values)).join(" ");

export function riaPayoutPartnersFor(
  countryIso: string | undefined,
): RiaPayoutPartner[] {
  return network.partners.filter((partner) => partner.country === countryIso);
}

function locationsOf(partner: RiaPayoutPartner): RiaPayoutLocation[] {
  return network.locations.filter(
    (location) => location.partnerId === partner.id,
  );
}

export function payoutLocationValue(location: RiaPayoutLocation): string {
  return `${location.address}, ${location.city}`;
}

/** Socios del país; se pueden buscar por nombre, provincia o ciudad. */
export function riaPartnerOptions(
  countryIso: string | undefined,
): SearchableSelectOption[] {
  return riaPayoutPartnersFor(countryIso).map((partner) => {
    const locations = locationsOf(partner);
    const states = new Set(locations.map((location) => location.state));
    const reach = partner.openNetwork ? "red abierta" : "sucursal fija";
    return {
      value: partner.name,
      label: `${partner.name} · ${states.size} ${states.size === 1 ? "provincia" : "provincias"} · ${reach}`,
      flagCountry: "",
      keywords: searchKeywords([
        partner.name,
        ...locations.map((location) => location.stateName),
        ...locations.map((location) => location.city),
      ]),
    };
  });
}

/** Sucursales (calle exacta) del socio elegido. */
export function riaLocationOptions(
  countryIso: string | undefined,
  partnerName: string,
): SearchableSelectOption[] {
  const partner = riaPayoutPartnersFor(countryIso).find(
    (item) => item.name === partnerName,
  );
  if (partner === undefined) return [];
  return locationsOf(partner).map((location) => ({
    value: payoutLocationValue(location),
    label: `${payoutLocationValue(location)} (${location.stateName})`,
    flagCountry: "",
    keywords: searchKeywords([
      location.name,
      location.city,
      location.stateName,
    ]),
  }));
}
