"use server";

import { cookies } from "next/headers";
import { getQuoteByToken } from "@/lib/store/quotes-store";
import { isExpired } from "@/lib/wholesale-checkout";

export const WHOLESALE_TOKEN_COOKIE = "sok_wholesale";

export type BeginResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "consumed" | "revoked" | "not-found" };

/**
 * Drops the wholesale token cookie so the next hit to the checkout
 * server action can tag the order as origin="wholesale", apply the
 * agreed discount, and consume the single-use link. Re-validates the
 * token one more time right before writing the cookie so a stale page
 * can't bypass the window.
 */
export async function beginWholesaleCheckoutAction(
  token: string,
): Promise<BeginResult> {
  const quote = await getQuoteByToken(token).catch(() => undefined);
  if (!quote) return { ok: false, reason: "not-found" };
  if (quote.state !== "approved") return { ok: false, reason: "revoked" };
  if (quote.tokenConsumedISO) return { ok: false, reason: "consumed" };
  if (isExpired(quote.reservationExpiresISO)) {
    return { ok: false, reason: "expired" };
  }
  const jar = await cookies();
  jar.set(WHOLESALE_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Short-lived — just has to survive the trip from this page to the
    // Pay step. 30 minutes is more than enough.
    maxAge: 60 * 30,
  });
  return { ok: true };
}
