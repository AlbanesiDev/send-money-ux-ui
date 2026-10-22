import countriesCatalog from "@/public/catalogs/catalog-countries.json";

const countryIsoByName = new Map(
  countriesCatalog.items.map((item) => [
    item.country.ctyName.trim(),
    item.country.ctyIsoCode.toLowerCase(),
  ]),
);

export function CountryFlag({ country }: { country: string }) {
  const iso = countryIsoByName.get(country);
  if (!iso) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt=""
      width={24}
      height={16}
      loading="lazy"
      className="h-4 w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-[#17233f]/10"
    />
  );
}
