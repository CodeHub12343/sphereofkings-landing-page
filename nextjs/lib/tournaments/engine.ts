import "server-only";
import { randomUUID } from "crypto";
import {
  Tournament, TournamentEntry, getTournamentBySlug, listEntries,
  updateTournament, updateEntry,
} from "@/lib/db/collections/tournaments";
import {
  advance, buildInitial, champion, readyToSchedule, seedByRating, Bracket,
} from "./bracket";
import { Match, insertMatch, updateMatch, ensureMatchIndexes } from "@/lib/db/collections/matches";
import { initialState } from "@/lib/realtime/match-engine";
import { getDb } from "@/lib/db/mongo";
import type { PlayerProfile, Ranking } from "@/lib/db/collections/players";

const TURN_SECONDS = 120;

/**
 * Transition registration -> active. Reads entries, seeds by current
 * rating in the tournament's game, builds the bracket, and creates
 * the first-round matches.
 *
 * Returns the updated Tournament.
 */
export async function startTournament(slug: string): Promise<Tournament | null> {
  const t = await getTournamentBySlug(slug);
  if (!t) return null;
  if (t.status !== "registration") return t;
  const entries = await listEntries(slug);
  if (entries.length !== t.size) {
    // Not enough entries — cancel the tournament.
    await updateTournament(slug, {
      status: "cancelled",
      endedAt: new Date().toISOString(),
    });
    return getTournamentBySlug(slug);
  }

  // Pull ratings for all entrants in a single query.
  const db = await getDb();
  const ratings = await db
    .collection<Ranking>("rankings")
    .find({ playerId: { $in: entries.map((e) => e.playerId) }, game: t.game })
    .toArray();
  const byPlayer = new Map(ratings.map((r) => [r.playerId, r.rating] as const));

  const seeded = seedByRating(
    entries.map((e) => ({
      playerId: e.playerId,
      username: e.username,
      displayName: e.displayName,
      rating: byPlayer.get(e.playerId) ?? 1500,
    })),
    t.size,
  );
  const bracket = buildInitial(t.size, seeded);

  // Persist seeds on each entry row for display.
  for (const slot of seeded) {
    if (!slot.playerId) continue;
    await updateEntry(slug, slot.playerId, { seed: slot.seed });
  }
  await updateTournament(slug, { status: "active", bracket });

  // Create first-round matches.
  await ensureMatchIndexes();
  const refreshed = await getTournamentBySlug(slug);
  if (refreshed?.bracket) {
    await scheduleReady(refreshed, refreshed.bracket);
  }
  return getTournamentBySlug(slug);
}

/**
 * Create matches for every bracket node whose both sides are known
 * and no match row yet exists. Updates the tournament's bracket with
 * the newly-minted match ids.
 */
async function scheduleReady(t: Tournament, bracket: Bracket): Promise<void> {
  const nodes = readyToSchedule(bracket);
  if (nodes.length === 0) return;
  const updated = { size: bracket.size, rounds: bracket.rounds.map((r) => r.map((m) => ({ ...m }))) };
  for (const node of nodes) {
    if (!node.a?.playerId || !node.b?.playerId) continue;
    const matchId = randomUUID();
    const now = new Date();
    const match: Match = {
      id: matchId,
      game: t.game,
      status: "active",
      challenger: {
        playerId: node.a.playerId,
        username: node.a.username,
        displayName: node.a.displayName,
      },
      opponent: {
        playerId: node.b.playerId,
        username: node.b.username,
        displayName: node.b.displayName,
      },
      state: initialState(t.game),
      toMoveSide: "red-or-white",
      moves: [],
      invitedAt: now.toISOString(),
      acceptedAt: now.toISOString(),
      startedAt: now.toISOString(),
      turnExpiresAt: new Date(now.getTime() + TURN_SECONDS * 1000).toISOString(),
      tournamentId: t.slug,
      tournamentRoundIdx: node.roundIdx,
      tournamentNodeIdx: node.idxInRound,
    };
    await insertMatch(match);
    updated.rounds[node.roundIdx][node.idxInRound].matchId = matchId;
  }
  await updateTournament(t.slug, { bracket: updated });
}

/**
 * Called from the match pipeline when a tournament match finishes.
 * Updates the bracket, marks the loser eliminated, and schedules the
 * next round's matches (or finalises the tournament).
 */
export async function onTournamentMatchFinish(opts: {
  tournamentId: string;
  roundIdx: number;
  nodeIdx: number;
  winnerPlayerId: string;
  loserPlayerId: string | null; // null = draw (we re-run; tournaments can't tie — ADR follow-up)
}): Promise<void> {
  const t = await getTournamentBySlug(opts.tournamentId);
  if (!t || !t.bracket || t.status !== "active") return;
  const node = t.bracket.rounds[opts.roundIdx]?.[opts.nodeIdx];
  if (!node) return;
  const winnerKey: "a" | "b" = node.a?.playerId === opts.winnerPlayerId ? "a" : "b";
  const nextBracket = advance(t.bracket, opts.roundIdx, opts.nodeIdx, winnerKey);
  await updateTournament(opts.tournamentId, { bracket: nextBracket });

  if (opts.loserPlayerId) {
    await updateEntry(opts.tournamentId, opts.loserPlayerId, { status: "eliminated" });
  }

  const refreshed = await getTournamentBySlug(opts.tournamentId);
  if (!refreshed || !refreshed.bracket) return;

  // Final-round complete → crown champion.
  const champ = champion(refreshed.bracket);
  if (champ && champ.playerId) {
    await updateTournament(opts.tournamentId, {
      status: "finished",
      endedAt: new Date().toISOString(),
      championPlayerId: champ.playerId,
      championUsername: champ.username,
      championDisplayName: champ.displayName,
    });
    await updateEntry(opts.tournamentId, champ.playerId, { status: "winner" });
    return;
  }

  await scheduleReady(refreshed, refreshed.bracket);
}

/**
 * Lazy state-machine tick. Any read of a tournament route hits this
 * so the status reflects wall-clock without requiring QStash.
 */
export async function tickTournamentStatus(t: Tournament): Promise<Tournament> {
  const now = Date.now();
  if (t.status === "upcoming" && now >= new Date(t.registrationOpensAt).getTime()) {
    await updateTournament(t.slug, { status: "registration" });
    return { ...t, status: "registration" };
  }
  if (t.status === "registration" && now >= new Date(t.startsAt).getTime()) {
    const started = await startTournament(t.slug);
    return started ?? t;
  }
  return t;
}

export function canRegister(t: Tournament, player: PlayerProfile): string | null {
  if (t.status !== "registration") return "Registration is not open.";
  if (new Date(t.registrationClosesAt).getTime() < Date.now()) return "Registration is closed.";
  if (player.isMinor && player.consentStatus !== "parental-granted") {
    return "Parental consent required before entering tournaments.";
  }
  return null;
}
