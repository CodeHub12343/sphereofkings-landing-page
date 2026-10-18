// Tokens used by the double-opt-in subscriber flow. Each subscriber
// record carries two tokens: one that confirms their email (double-
// opt-in) and one that unsubscribes them. Both are URL-safe hex and
// unguessable.

import { randomBytes } from "node:crypto";

export type ConfirmTokenKind = "confirm" | "unsubscribe";

export function newToken(): string {
  // 32 hex chars — 128 bits, more than enough entropy for a one-time
  // URL. We never surface this token in the admin UI except through the
  // "Resend confirmation" workflow, which produces the full URL.
  return randomBytes(16).toString("hex");
}

export function confirmPath(token: string): string {
  return `/subscribe/confirm/${encodeURIComponent(token)}`;
}

export function unsubscribePath(token: string): string {
  return `/subscribe/unsubscribe/${encodeURIComponent(token)}`;
}
