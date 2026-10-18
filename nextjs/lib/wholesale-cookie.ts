// Shared constants + types for the wholesale-checkout cookie handoff.
// Lives outside app/wholesale-checkout/actions.ts because that file is
// a "use server" module and can only export async functions.

export const WHOLESALE_TOKEN_COOKIE = "sok_wholesale";

export type BeginResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "consumed" | "revoked" | "not-found" };
