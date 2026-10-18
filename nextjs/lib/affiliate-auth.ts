// Affiliate authentication — stop-gap demo. One shared password for all
// seeded affiliates while a real credential store is wired. Never ship
// this to production without a real password hash per account.

import { SAMPLE_AFFILIATES, SampleAffiliate } from "@/lib/sample-affiliates";

// Attribution cookies (client-readable).
//
// AFF_ATTR_COOKIE (sok_aff) — LAST-TOUCH. Overwritten on every click.
// AFF_FIRST_COOKIE (sok_aff_first) — FIRST-TOUCH. Written once and
//   never overwritten unless cleared.
// AFF_TOUCHES_COOKIE (sok_aff_touches) — the full ordered list of
//   UNIQUE affiliate code touches, oldest-first, used by the linear
//   and u-shape attribution models.
//
// Value shape for first/last: "<CODE>|<clickISO>".
// Value shape for touches:    "<CODE1>|<ISO1>,<CODE2>|<ISO2>,...".
export const AFF_ATTR_COOKIE = "sok_aff";
export const AFF_FIRST_COOKIE = "sok_aff_first";
export const AFF_TOUCHES_COOKIE = "sok_aff_touches";
export const AFF_ATTR_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
// Cap the touches history so a cookie can't balloon. Beyond this, the
// OLDEST entry is dropped on every new unique touch.
export const AFF_TOUCHES_MAX = 8;

// Attribution model.
//   last-touch (default) — one row, 100% to the most recent click.
//   first-touch          — one row, 100% to the very first click.
//   split                — first & last split 50/50 when they differ.
//   linear               — every unique touch gets 100/N %.
//   u-shape              — first 40% + last 40% + 20% split across
//                          middle touches (if any).
// Override via AFFILIATE_ATTRIBUTION_MODEL env var.
export type AttributionModel =
  | "last-touch"
  | "first-touch"
  | "split"
  | "linear"
  | "u-shape";
export const ATTRIBUTION_MODEL: AttributionModel = (() => {
  const raw = (process.env.AFFILIATE_ATTRIBUTION_MODEL ?? "")
    .trim()
    .toLowerCase();
  if (
    raw === "first-touch" ||
    raw === "split" ||
    raw === "linear" ||
    raw === "u-shape"
  ) {
    return raw;
  }
  return "last-touch";
})();

export type Touch = { code: string; clickISO: string };

export function parseTouchesCookie(raw: string): Touch[] {
  if (!raw) return [];
  const value = decodeURIComponent(raw);
  const entries = value.split(",");
  const out: Touch[] = [];
  for (const entry of entries) {
    const sep = entry.indexOf("|");
    if (sep < 1) continue;
    const code = entry.slice(0, sep).trim().toUpperCase();
    const clickISO = entry.slice(sep + 1).trim();
    if (!code || !clickISO) continue;
    if (Number.isNaN(Date.parse(clickISO))) continue;
    out.push({ code, clickISO });
  }
  return out;
}

export function encodeTouchesCookie(touches: Touch[]): string {
  return touches.map((t) => `${t.code}|${t.clickISO}`).join(",");
}

/**
 * Append a new touch to the history, removing any older occurrence of
 * the same code so each code appears at most once (at its most-recent
 * position). Caps the list at AFF_TOUCHES_MAX, dropping the oldest.
 */
export function appendTouch(
  existing: Touch[],
  code: string,
  clickISO: string,
): Touch[] {
  const upper = code.toUpperCase();
  const filtered = existing.filter((t) => t.code !== upper);
  filtered.push({ code: upper, clickISO });
  while (filtered.length > AFF_TOUCHES_MAX) filtered.shift();
  return filtered;
}

export function withinWindowTouches(
  touches: Touch[],
  predicate: (iso: string) => boolean,
): Touch[] {
  return touches.filter((t) => predicate(t.clickISO));
}

// Attribution window — the maximum age of a first click that still
// counts toward a commission. Defaults to 30 days; override with
// AFFILIATE_ATTRIBUTION_WINDOW_DAYS in the environment.
export const ATTRIBUTION_WINDOW_DAYS = (() => {
  const raw = Number.parseInt(
    process.env.AFFILIATE_ATTRIBUTION_WINDOW_DAYS ?? "",
    10,
  );
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
})();

export function encodeAttrCookie(code: string, firstClickISO: string): string {
  return `${code}|${firstClickISO}`;
}

export type ParsedAttrCookie = {
  code: string;
  firstClickISO: string;
};

export function parseAttrCookie(raw: string): ParsedAttrCookie | null {
  if (!raw) return null;
  // Back-compat: old cookies stored only the code. Treat them as "no
  // first-click timestamp known" — the window check below falls through
  // to using the current time, which is strict (any order placed in
  // the same session is in-window; the next refresh of the cookie
  // writes the timestamp properly).
  const value = decodeURIComponent(raw);
  const sep = value.indexOf("|");
  if (sep < 0) {
    const code = value.trim().toUpperCase();
    if (!code) return null;
    return { code, firstClickISO: new Date().toISOString() };
  }
  const code = value.slice(0, sep).trim().toUpperCase();
  const firstClickISO = value.slice(sep + 1).trim();
  if (!code || !firstClickISO) return null;
  if (Number.isNaN(Date.parse(firstClickISO))) return null;
  return { code, firstClickISO };
}

export function isWithinAttributionWindow(firstClickISO: string): boolean {
  const first = new Date(firstClickISO).getTime();
  if (!Number.isFinite(first)) return false;
  const ageMs = Date.now() - first;
  const windowMs = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return ageMs >= 0 && ageMs <= windowMs;
}

// Session cookie (httpOnly). Set by signInAction, read by the gated
// /affiliate route. Cookie value is now an HMAC-signed stateless token
// (see lib/auth/token.ts) — the cookie *name* constant below still
// matches the one exported from that module for clarity.
export { AFF_SESSION_COOKIE } from "@/lib/auth/token";
export const AFF_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

// Password used for every seeded affiliate in this demo. The signin page
// shows it inline so operators can click through without guessing.
export const DEMO_AFF_PASSWORD = "sphere";

export function findAffiliateByCode(code: string): SampleAffiliate | undefined {
  const upper = code.trim().toUpperCase();
  return SAMPLE_AFFILIATES.find((a) => a.code === upper);
}

export function findAffiliateByEmail(email: string): SampleAffiliate | undefined {
  const lower = email.trim().toLowerCase();
  return SAMPLE_AFFILIATES.find((a) => a.email.toLowerCase() === lower);
}

export type SignInResult =
  | { ok: true; affiliate: SampleAffiliate }
  | { ok: false; reason: string };

export function tryDemoSignIn(email: string, password: string): SignInResult {
  const aff = findAffiliateByEmail(email);
  if (!aff) {
    return { ok: false, reason: "No affiliate account with that email." };
  }
  if (aff.state === "pending") {
    return {
      ok: false,
      reason:
        "Your application is still pending approval. Hold tight — you will receive an email when the owner approves it.",
    };
  }
  if (aff.state === "suspended") {
    return {
      ok: false,
      reason:
        "This account is suspended. Contact hello@sphereofkings.com if you believe this is a mistake.",
    };
  }
  if (password !== DEMO_AFF_PASSWORD) {
    return { ok: false, reason: "Wrong password." };
  }
  return { ok: true, affiliate: aff };
}
