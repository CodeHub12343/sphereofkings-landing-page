import "server-only";
import type { PlayerProfile } from "@/lib/db/collections/players";

// Centralised safety predicates. All features that are gated behind
// parental consent for minors (child-safety.md §3) route through
// here, so the policy is one place to audit and change.

export function canReceiveChallenges(p: PlayerProfile): boolean {
  if (!p.isMinor) return true;
  return p.consentStatus === "parental-granted";
}

export function canSendChallenges(p: PlayerProfile): boolean {
  if (!p.isMinor) return true;
  return p.consentStatus === "parental-granted";
}

export function canMessage(p: PlayerProfile): boolean {
  if (!p.isMinor) return true;
  return p.consentStatus === "parental-granted";
}

export function canAppearOnPublicLeaderboard(p: PlayerProfile): boolean {
  if (!p.isMinor) return true;
  return p.consentStatus === "parental-granted";
}

export function canEnterTournament(p: PlayerProfile): boolean {
  if (!p.isMinor) return true;
  return p.consentStatus === "parental-granted";
}

/** Collected refusal reason for an API 403. */
export function minorGateMessage(action: string): string {
  return `This account is under 18 and still needs parental consent before it can ${action}. Ask a parent to complete the consent flow in your email.`;
}
