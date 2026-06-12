/** Nepal-focused currency and address formatting for the app. */

export const DEFAULT_CURRENCY = 'NPR';
export const DEFAULT_COUNTRY = 'Nepal';

/** Nepal provinces for address forms (replaces Australian states). */
export const NEPAL_PROVINCES: { value: string; label: string }[] = [
  { value: '', label: 'Select province' },
  { value: 'Koshi', label: 'Koshi Province' },
  { value: 'Madhesh', label: 'Madhesh Province' },
  { value: 'Bagmati', label: 'Bagmati Province' },
  { value: 'Gandaki', label: 'Gandaki Province' },
  { value: 'Lumbini', label: 'Lumbini Province' },
  { value: 'Karnali', label: 'Karnali Province' },
  { value: 'Sudurpashchim', label: 'Sudurpashchim Province' },
];

export const BUDGET_MIN_NPR = 10;
export const BUDGET_MAX_NPR = 9999;

export function formatNPR(
  amount: number | string | null | undefined,
  options?: { compact?: boolean; showCode?: boolean }
): string {
  const num = Number(amount ?? 0);
  if (!Number.isFinite(num)) {
    return options?.showCode ? 'NPR 0' : 'Rs. 0';
  }

  if (options?.compact && Math.abs(num) >= 1000) {
    const compact =
      Math.abs(num) >= 1_000_000
        ? `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
        : `${(num / 1000).toFixed(num >= 10_000 ? 0 : 1).replace(/\.0$/, '')}k`;
    return options?.showCode ? `NPR ${compact}` : `Rs. ${compact}`;
  }

  const formatted = new Intl.NumberFormat('en-NP', {
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);

  return options?.showCode ? `NPR ${formatted}` : `Rs. ${formatted}`;
}

export function formatBudgetRange(min: number, max: number): string {
  return `${formatNPR(min)} – ${formatNPR(max)}`;
}

/** Prefix shown inside amount inputs (cost, price, payout, etc.). */
export const CURRENCY_INPUT_PREFIX = 'Rs.';

export function formatHourlyRate(amount: number): string {
  return `${formatNPR(amount)} / hr`;
}

export function formatHourlyRange(min: number, max: number): string {
  return `${formatNPR(min)} – ${formatNPR(max)} / hr`;
}

/** Standard freelancer hourly rate dropdown values (NPR). */
export const STANDARD_HOURLY_RATE_AMOUNTS = [2500, 4500, 6500, 8500, 12000] as const;

export const STANDARD_HOURLY_RATE_OPTIONS = STANDARD_HOURLY_RATE_AMOUNTS.map((amount) => {
  const label = formatHourlyRate(amount);
  return { value: label, label, amount };
});

/** Dashboard tables: "Rs. 4,000 - 6,000/Hour" or "Rs. 25,000/Fixed". */
export function formatDashboardTypeCost(
  priceType: string,
  cost: number,
  costMax?: number,
): string {
  if (/hour/i.test(priceType)) {
    const max = costMax ?? cost + 500;
    return `${formatNPR(cost)} - ${formatNPR(max)}/Hour`;
  }
  return `${formatNPR(cost)}/Fixed`;
}

/** Convert legacy USD seed/mock amounts to NPR (×40). */
export function legacyUsdToNpr(amount: number): number {
  return Math.round(amount * 40);
}

/** Hourly range label from legacy USD mock min/max. */
export function legacyUsdHourlyRange(usdMin: number, usdMax: number): string {
  return formatHourlyRange(legacyUsdToNpr(usdMin), legacyUsdToNpr(usdMax));
}

/** Replace legacy USD-style $ amounts in notification copy with NPR formatting. */
export function normalizeNotificationCurrency(text: string): string {
  if (!text) return text;
  return text.replace(
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g,
    (_, amount: string) => formatNPR(amount.replace(/,/g, ''), { showCode: true }),
  );
}

export const BUDGET_VALIDATION_MESSAGE = `Budget must be between ${formatNPR(BUDGET_MIN_NPR)} and ${formatNPR(BUDGET_MAX_NPR)}`;

type TaskLocationFields = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  full_address?: string | null;
  work_type?: string | null;
  location_type?: string | null;
};

export function isRemoteTask(task: TaskLocationFields): boolean {
  const wt = task.work_type || task.location_type;
  return wt === 'remote' || wt === 'online';
}

/** Display line for task location (always Nepal-biased for in-person tasks). */
export function formatTaskLocation(
  task: TaskLocationFields,
  fallback = 'Remote'
): string {
  if (isRemoteTask(task)) return 'Remote';

  if (task.full_address?.trim()) {
    return ensureNepalInAddress(task.full_address.trim());
  }

  const parts = [task.address, task.city, task.state]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);

  if (parts.length === 0) return fallback;

  return ensureNepalInAddress(parts.join(', '));
}

/** Split comma-separated location text and drop consecutive duplicates (e.g. "Nepal, Nepal"). */
export function splitLocationParts(line: string): string[] {
  const parts = line.split(',').map((p) => p.trim()).filter(Boolean);
  const deduped: string[] = [];
  for (const part of parts) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.toLowerCase() === part.toLowerCase()) continue;
    deduped.push(part);
  }
  return deduped;
}

/** Short UI label — first locality segment only (e.g. "Baneshwar"). */
export function shortenCommaSeparatedLocation(line: string, maxParts = 1): string {
  const parts = splitLocationParts(line);
  if (parts.length === 0) return line.trim();
  if (parts.length <= maxParts) return parts.join(', ');
  return parts.slice(0, maxParts).join(', ');
}

/** Compact location for cards and task detail headers. */
export function formatTaskLocationShort(
  task: TaskLocationFields,
  fallback = 'Remote'
): string {
  const full = formatTaskLocation(task, fallback);
  if (full === 'Remote' || full === fallback) return full;
  return shortenCommaSeparatedLocation(full, 1);
}

export function ensureNepalInAddress(line: string): string {
  if (/nepal/i.test(line)) return line;
  return `${line}, ${DEFAULT_COUNTRY}`;
}

/** Build a display address from Nominatim reverse-geocode `address` object. */
export function formatNominatimNepalAddress(
  address: Record<string, string | undefined> | undefined
): string {
  if (!address) return DEFAULT_COUNTRY;

  const locality =
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.city_district ||
    address.ward;
  const city =
    address.city || address.municipality || address.town || address.village;
  const province = address.state;

  const parts = [locality, city, province]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);

  if (parts.length === 0) {
    return address.country === 'Nepal' ? DEFAULT_COUNTRY : address.country || DEFAULT_COUNTRY;
  }

  return ensureNepalInAddress(parts.join(', '));
}

/** Query string bias for OpenStreetMap searches in Nepal. */
/** Map Nominatim state/region string to a NEPAL_PROVINCES value. */
export function mapToNepalProvince(stateName?: string): string {
  if (!stateName?.trim()) return '';
  const normalized = stateName.toLowerCase();
  for (const province of NEPAL_PROVINCES) {
    if (!province.value) continue;
    const key = province.value.toLowerCase();
    const label = province.label.toLowerCase().replace(/\s+province$/, '');
    if (normalized.includes(key) || normalized.includes(label)) {
      return province.value;
    }
  }
  return '';
}

const NOMINATIM_HEADERS: HeadersInit = {
  'Accept-Language': 'en',
  'User-Agent': 'tasknepal/1.0 (location search)',
};

/** Reverse geocode coordinates in Nepal (Nominatim). */
export async function reverseGeocodeNepal(
  lat: number,
  lon: number,
  options?: { signal?: AbortSignal }
): Promise<{ address?: Record<string, string | undefined> }> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&countrycodes=np`,
    { headers: NOMINATIM_HEADERS, signal: options?.signal }
  );

  if (!response.ok) {
    throw new Error('Failed to reverse geocode location');
  }

  return response.json();
}

/** Split Nominatim reverse-geocode `address` into billing form fields. */
export function parseNepalBillingFromNominatim(
  address: Record<string, string | undefined> | undefined
): { streetAddress: string; city: string; postcode: string; state: string } {
  if (!address) {
    return { streetAddress: '', city: '', postcode: '', state: '' };
  }

  const streetParts = [
    address.house_number,
    address.road,
    address.suburb,
    address.neighbourhood,
    address.quarter,
    address.city_district,
    address.ward,
  ]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);

  const streetAddress =
    streetParts.join(', ') ||
    [address.hamlet, address.village].filter(Boolean).map(String).join(', ');

  const city =
    address.city ||
    address.municipality ||
    address.town ||
    address.village ||
    '';

  const postcode = String(address.postcode || '')
    .replace(/\D/g, '')
    .slice(0, 5);

  const state = mapToNepalProvince(address.state);

  return {
    streetAddress,
    city: String(city).trim(),
    postcode,
    state,
  };
}

/** Split Nominatim reverse-geocode `address` into structured profile address fields. */
export function parseNepalAddressFromNominatim(
  address: Record<string, string | undefined> | undefined
): { streetAddress: string; city: string; postcode: string; state: string; country: string } {
  const parsed = parseNepalBillingFromNominatim(address);
  return {
    ...parsed,
    country: address?.country?.trim() || DEFAULT_COUNTRY,
  };
}

/** One-line billing / profile address for display. */
export function formatBillingAddressSummary(parts: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}): string {
  const segments = [parts.address, parts.city, parts.state, parts.postal_code]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);
  if (segments.length === 0) return '';
  const base = segments.join(', ');
  return ensureNepalInAddress(base);
}

export function withNepalGeocodeQuery(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) return trimmed;
  if (/nepal/i.test(trimmed)) return trimmed;
  return `${trimmed}, Nepal`;
}

export type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

/** Forward geocode search in Nepal (Nominatim). Min 3 characters recommended. */
export async function searchNominatimNepal(
  query: string,
  options?: { limit?: number; signal?: AbortSignal }
): Promise<NominatimPlace[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${encodeURIComponent(withNepalGeocodeQuery(trimmed))}&limit=${options?.limit ?? 5}`;

  const response = await fetch(url, {
    headers: NOMINATIM_HEADERS,
    signal: options?.signal,
  });

  if (!response.ok) return [];

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    place_id: item.place_id,
    display_name: item.display_name,
    lat: item.lat,
    lon: item.lon,
  }));
}

/** Shorter label for autocomplete rows (first segments of display_name). */
export function shortenNominatimDisplayName(displayName: string, maxParts = 3): string {
  const parts = displayName.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= maxParts) return displayName;
  return parts.slice(0, maxParts).join(', ');
}
