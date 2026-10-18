// Helpers for the one-click wholesale checkout link. The token is a
// 32-character hex string that lives alongside the quote; a visitor who
// opens /wholesale-checkout/[token] within the reservation window can
// start a wholesale checkout pre-seeded with the agreed line items.

export const RESERVATION_TTL_DAYS = 7;

export function generateCheckoutToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function computeReservationExpiry(
  ttlDays: number = RESERVATION_TTL_DAYS,
): string {
  return new Date(Date.now() + ttlDays * 86_400_000).toISOString();
}

export function isExpired(iso?: string): boolean {
  if (!iso) return true;
  return new Date(iso).getTime() < Date.now();
}

export function wholesaleCheckoutPath(token: string): string {
  return `/wholesale-checkout/${encodeURIComponent(token)}`;
}
