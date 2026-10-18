"use server";

// Resolver used by the client-side checkout stepper to turn an
// `sok_aff` cookie value into a display name. The client can't talk to
// Mongo directly, so the stepper calls this instead. Returns null when
// the code is unknown, the affiliate isn't active, OR the cookie's
// first-click timestamp is outside the attribution window.

import { findAffiliateByCode } from "@/lib/db/collections/affiliates";
import {
  isWithinAttributionWindow,
  parseAttrCookie,
} from "@/lib/affiliate-auth";

export type ResolvedAffiliate = {
  code: string;
  displayName: string; // "Benjamin O." — first name + initial of last
};

export async function resolveAffiliateAction(
  cookieValue: string,
): Promise<ResolvedAffiliate | null> {
  const parsed = parseAttrCookie(cookieValue ?? "");
  if (!parsed) return null;
  if (!isWithinAttributionWindow(parsed.firstClickISO)) return null;
  const aff = await findAffiliateByCode(parsed.code).catch(() => undefined);
  if (!aff || aff.state !== "active") return null;
  const initial = aff.lastName?.[0] ?? "";
  return {
    code: aff.code,
    displayName: initial
      ? `${aff.firstName} ${initial}.`
      : aff.firstName,
  };
}
