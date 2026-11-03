import type { Match } from "@/lib/db/collections/matches";
import type { Puzzle } from "@/lib/games/puzzles/official";

// Pure helpers shared by the app home screen and the chrome summary.

export function isMyTurn(m: Match, playerId: string): boolean {
  if (m.status !== "active") return false;
  return m.toMoveSide === "red-or-white"
    ? m.challenger.playerId === playerId
    : m.opponent.playerId === playerId;
}

/** A direct challenge sent to this player that they haven't answered. */
export function isIncomingInvite(m: Match, playerId: string): boolean {
  return m.status === "pending" && !m.openInvite && m.opponent.playerId === playerId;
}

/** Matches that need this player to act: their move, or an invite to answer. */
export function yourTurnCount(matches: Match[], playerId: string): number {
  return matches.filter((m) => isMyTurn(m, playerId) || isIncomingInvite(m, playerId)).length;
}

/**
 * Today's puzzle: a stable pick per UTC day, so everyone sees the same
 * one and it rotates at midnight UTC. Kid-tier puzzles are skipped —
 * they're in the library but too easy for a daily challenge.
 */
export function puzzleOfTheDay(puzzles: Puzzle[], now = new Date()): Puzzle | null {
  const pool = puzzles.filter((p) => p.tier !== "kid");
  const list = pool.length > 0 ? pool : puzzles;
  if (list.length === 0) return null;
  const day = Math.floor(now.getTime() / 86_400_000);
  return list[day % list.length];
}
