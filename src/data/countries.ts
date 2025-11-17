export type CountryDef = { code: string; name: string };

// Minimal but sensible default list. Extend as needed.
export const COUNTRIES: CountryDef[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IL", name: "Israel" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "IE", name: "Ireland" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "ZA", name: "South Africa" },
];

export const countryCodeSet = new Set(COUNTRIES.map((c) => c.code));

export function countryNameFor(code?: string): string {
  if (!code) return "";
  const c = COUNTRIES.find((x) => x.code === code.toUpperCase());
  return c ? c.name : "";
}

