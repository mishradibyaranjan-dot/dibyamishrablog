/** Location helpers: build a demand-ranked place list and guess a visitor's region from their time zone. */
const GENERIC = /^(remote|hybrid|distributed|in-office|onsite|on-site|anywhere|worldwide.*|multiple locations?)$/i;

/** Split a raw job location into filterable place labels (each is a substring of the original). */
export function placesFromLocation(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(/[•;|/]/).map((s) => s.replace(/\(.*?\)/g, "").trim()).filter(Boolean).map((seg) => {
    if (/^remote\b/i.test(seg)) return seg.replace(/\s+/g, " ");
    return seg.split(",")[0].trim();
  }).filter((p) => p.length > 1 && !GENERIC.test(p));
}

export type LocationCount = { name: string; count: number };

/** Count jobs per place (case-insensitive), most in-demand first. */
export function rankLocations(locations: (string | null)[]): LocationCount[] {
  const m = new Map<string, LocationCount>();
  for (const loc of locations) {
    for (const p of new Set(placesFromLocation(loc).map((x) => x.toLowerCase()))) {
      const orig = placesFromLocation(loc).find((x) => x.toLowerCase() === p)!;
      const e = m.get(p) ?? { name: orig, count: 0 };
      e.count++; m.set(p, e);
    }
  }
  return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const REGION_PLACES: Record<string, string[]> = {
  India: ["India", "Bengaluru", "Bangalore", "Mumbai", "Delhi", "New Delhi", "Gurugram", "Gurgaon", "Noida", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"],
  "United States": ["United States", "USA", "New York", "San Francisco", "Seattle", "Austin", "Boston", "Chicago", "Los Angeles"],
  "United Kingdom": ["United Kingdom", "UK", "London", "Manchester", "Edinburgh"],
  Ireland: ["Ireland", "Dublin"], Canada: ["Canada", "Toronto", "Vancouver", "Montreal"],
  Singapore: ["Singapore"], Japan: ["Japan", "Tokyo"], Germany: ["Germany", "Berlin", "Munich"],
  Australia: ["Australia", "Sydney", "Melbourne"], France: ["France", "Paris"], Netherlands: ["Netherlands", "Amsterdam"],
};
const TZ_REGION: Record<string, string> = {
  "Asia/Kolkata": "India", "Asia/Calcutta": "India", "Europe/London": "United Kingdom", "Europe/Dublin": "Ireland",
  "Asia/Singapore": "Singapore", "Asia/Tokyo": "Japan", "Europe/Berlin": "Germany", "Europe/Paris": "France", "Europe/Amsterdam": "Netherlands",
  "Australia/Sydney": "Australia", "Australia/Melbourne": "Australia", "America/Toronto": "Canada", "America/Vancouver": "Canada",
};

/** Pick the most in-demand listed place in the visitor's region, or null. */
export function nearestLocation(timeZone: string, ranked: LocationCount[]): string | null {
  const region = TZ_REGION[timeZone] ?? (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage)$/.test(timeZone) ? "United States" : null);
  const tzCity = timeZone.split("/").pop()?.replace(/_/g, " ").toLowerCase();
  const wanted = [...(region ? REGION_PLACES[region] : []), ...(tzCity ? [tzCity] : [])].map((s) => s.toLowerCase());
  return ranked.find((l) => wanted.some((w) => l.name.toLowerCase().includes(w)))?.name ?? null;
}

/** Major Indian job hubs, always listed so visitors can pick any India location. */
export const INDIA_LOCATIONS = ["India", "Remote India", "Bengaluru", "Mumbai", "Delhi", "New Delhi", "Gurugram", "Noida", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh", "Kochi", "Thiruvananthapuram", "Coimbatore", "Indore", "Bhubaneswar", "Nagpur", "Lucknow", "Mysuru", "Visakhapatnam", "Vadodara", "Surat", "Goa"];
const INDIA_ALIASES = [...INDIA_LOCATIONS, ...REGION_PLACES.India, "Bangalore", "Gurgaon", "Bombay", "Madras", "Calcutta", "Cochin", "Mysore"].map((s) => s.toLowerCase());

export function isIndianPlace(name: string): boolean {
  const n = name.toLowerCase();
  return INDIA_ALIASES.some((a) => n === a || n.includes(a));
}

/** Split ranked places into all India hubs (zero-count included) and demand-ranked international places. */
export function splitLocations(ranked: LocationCount[]): { india: LocationCount[]; international: LocationCount[] } {
  const india = ranked.filter((l) => isIndianPlace(l.name));
  for (const name of INDIA_LOCATIONS) if (!india.some((l) => l.name.toLowerCase() === name.toLowerCase())) india.push({ name, count: 0 });
  india.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { india, international: ranked.filter((l) => !isIndianPlace(l.name)) };
}
