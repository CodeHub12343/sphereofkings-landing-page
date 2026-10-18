// Carrier catalog. Keeps the Fulfillment view honest: operators pick
// from a list; the UI validates the tracking number against the carrier's
// known format and generates the real public tracking URL. Nothing is
// invented — if a carrier isn't on this list, pick "Other" and the UI
// skips validation and accepts a manual tracking URL.

export type CarrierId =
  | "dhl-express"
  | "ups"
  | "fedex"
  | "usps"
  | "royal-mail"
  | "gls"
  | "other";

export type Carrier = {
  id: CarrierId;
  name: string;
  // Regex that matches the carrier's typical tracking format. `null` means
  // "accept anything" — only used by "Other".
  pattern: RegExp | null;
  // One-line human description of the format. Shown as hint under the
  // tracking input.
  formatHint: string;
  // Builds the public tracking URL. Returns null for "Other".
  trackingUrl: (number: string) => string | null;
};

export const CARRIERS: Carrier[] = [
  {
    id: "dhl-express",
    name: "DHL Express",
    pattern: /^(?:\d{10}|JD\d{18})$/,
    formatHint: "10 digits (e.g. 1234567890) or JD + 18 digits.",
    trackingUrl: (n) =>
      `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(n)}&brand=DHL`,
  },
  {
    id: "ups",
    name: "UPS",
    pattern: /^1Z[A-Z0-9]{16}$/,
    formatHint: "1Z followed by 16 letters or digits (e.g. 1Z999AA10123456784).",
    trackingUrl: (n) =>
      `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(n)}`,
  },
  {
    id: "fedex",
    name: "FedEx",
    pattern: /^\d{12}(?:\d{3}(?:\d{5}(?:\d{2})?)?)?$/,
    formatHint: "12, 15, 20 or 22 digits.",
    trackingUrl: (n) =>
      `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  },
  {
    id: "usps",
    name: "USPS",
    pattern: /^\d{20}(?:\d{2}|\d{6})?$/,
    formatHint: "20, 22 or 26 digits.",
    trackingUrl: (n) =>
      `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${encodeURIComponent(n)}`,
  },
  {
    id: "royal-mail",
    name: "Royal Mail",
    pattern: /^[A-Z]{2}\d{9}GB$/,
    formatHint: "2 letters + 9 digits + GB (e.g. AB123456789GB).",
    trackingUrl: (n) =>
      `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(n)}`,
  },
  {
    id: "gls",
    name: "GLS",
    pattern: /^\d{11}$/,
    formatHint: "11 digits.",
    trackingUrl: (n) =>
      `https://gls-group.eu/app/service/open/rest/EU/en/rstt001?match=${encodeURIComponent(n)}`,
  },
  {
    id: "other",
    name: "Other / Manual",
    pattern: null,
    formatHint:
      "No format check. Paste the carrier's tracking URL manually below.",
    trackingUrl: () => null,
  },
];

export function findCarrier(id: CarrierId): Carrier {
  return CARRIERS.find((c) => c.id === id) ?? CARRIERS[CARRIERS.length - 1];
}

export type TrackingValidation =
  | { kind: "empty" }
  | { kind: "valid"; url: string | null }
  | { kind: "invalid"; hint: string }
  | { kind: "manual" }; // carrier is "other", any non-empty value is accepted

export function validateTracking(
  carrierId: CarrierId,
  raw: string,
): TrackingValidation {
  const carrier = findCarrier(carrierId);
  const number = raw.trim().toUpperCase();
  if (number === "") return { kind: "empty" };
  if (!carrier.pattern) return { kind: "manual" };
  if (!carrier.pattern.test(number)) {
    return { kind: "invalid", hint: carrier.formatHint };
  }
  return { kind: "valid", url: carrier.trackingUrl(number) };
}
