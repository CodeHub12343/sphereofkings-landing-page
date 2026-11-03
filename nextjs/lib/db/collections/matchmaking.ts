import "server-only";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db/mongo";
import { GameId, getRanking, PlayerProfile } from "./players";
import { getMatch, insertMatch, Match, MatchSide, TURN_SECONDS } from "./matches";
import { initialState } from "@/lib/realtime/match-engine";

// Quick-match queue. One document per waiting player. The client
// re-POSTs every few seconds while searching; each POST is both a
// heartbeat (lastSeenAt) and a pairing attempt.
//
// Pairing is race-safe without transactions:
//   1. A player only tries to claim entries that joined BEFORE it
//      (ties broken by playerId), so two players never try to claim
//      each other at the same time.
//   2. The claimer locks its own entry first (matchId: null → newId),
//      then claims the candidate with the same conditional update. If
//      the candidate was taken in between, the claimer unlocks itself
//      and tries the next one. An entry with a matchId is never
//      claimed again, so nobody ends up in two matches.

export interface QueueEntry {
  playerId: string;
  username: string;
  displayName: string;
  game: GameId;
  rating: number;
  joinedAt: Date;
  lastSeenAt: Date;
  matchId: string | null;
  lockedAt?: Date;
}

const COL = "matchmaking_queue";
// A searcher that stops heartbeating (closed tab) drops out of pairing
// after this long; the TTL index removes the row a few minutes later.
const STALE_MS = 15_000;
// If the pairing request died between claiming both entries and
// inserting the match, the lock is released after this long.
const LOCK_TIMEOUT_MS = 10_000;

/** Rating gap tolerated after waiting `seconds`: starts tight, widens. */
export function ratingWindow(seconds: number): number {
  return Math.min(100 + seconds * 15, 1000);
}

let indexesReady = false;
async function ensureIndexes() {
  if (indexesReady) return;
  const db = await getDb();
  const col = db.collection<QueueEntry>(COL);
  await Promise.all([
    col.createIndex({ playerId: 1 }, { unique: true }),
    col.createIndex({ game: 1, matchId: 1, joinedAt: 1 }),
    col.createIndex({ lastSeenAt: 1 }, { expireAfterSeconds: 300 }),
  ]);
  indexesReady = true;
}

export type QueueStatus =
  | { status: "searching"; game: GameId; waitedSeconds: number; rating: number; window: number }
  | { status: "matched"; matchId: string }
  | { status: "idle" };

async function resolveMatched(entry: QueueEntry): Promise<QueueStatus | null> {
  if (!entry.matchId) return null;
  const match = await getMatch(entry.matchId);
  const db = await getDb();
  if (match) {
    // The player has been told; the queue row is done.
    await db.collection<QueueEntry>(COL).deleteOne({ playerId: entry.playerId, matchId: entry.matchId });
    return { status: "matched", matchId: match.id };
  }
  // Locked but no match yet — either the pairer is mid-flight or died.
  if (entry.lockedAt && Date.now() - entry.lockedAt.getTime() > LOCK_TIMEOUT_MS) {
    await db.collection<QueueEntry>(COL).updateOne(
      { playerId: entry.playerId, matchId: entry.matchId },
      { $set: { matchId: null }, $unset: { lockedAt: "" } },
    );
  }
  return null;
}

/** Join (or heartbeat) the queue for `game`, then try to pair. */
export async function searchForMatch(me: PlayerProfile, game: GameId): Promise<QueueStatus> {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<QueueEntry>(COL);
  const now = new Date();

  const existing = await col.findOne({ playerId: me.id });
  if (existing?.matchId) {
    const resolved = await resolveMatched(existing);
    if (resolved) return resolved;
    return searching(existing, now);
  }

  let entry: QueueEntry;
  if (!existing || existing.game !== game) {
    // New search, or switched game: start the wait clock over.
    const ranking = await getRanking(me.id, game);
    entry = {
      playerId: me.id,
      username: me.username,
      displayName: me.displayName,
      game,
      rating: ranking.rating,
      joinedAt: now,
      lastSeenAt: now,
      matchId: null,
    };
    await col.replaceOne({ playerId: me.id }, entry, { upsert: true });
  } else {
    await col.updateOne({ playerId: me.id }, { $set: { lastSeenAt: now } });
    entry = { ...existing, lastSeenAt: now };
  }

  const paired = await tryPair(entry, now);
  if (paired) return { status: "matched", matchId: paired };
  return searching(entry, now);
}

function searching(entry: QueueEntry, now: Date): QueueStatus {
  const waitedSeconds = Math.max(0, Math.round((now.getTime() - entry.joinedAt.getTime()) / 1000));
  return {
    status: "searching",
    game: entry.game,
    waitedSeconds,
    rating: entry.rating,
    window: ratingWindow(waitedSeconds),
  };
}

async function tryPair(me: QueueEntry, now: Date): Promise<string | null> {
  const db = await getDb();
  const col = db.collection<QueueEntry>(COL);
  const freshSince = new Date(now.getTime() - STALE_MS);

  const candidates = await col
    .find({
      game: me.game,
      matchId: null,
      playerId: { $ne: me.playerId },
      lastSeenAt: { $gte: freshSince },
      $or: [
        { joinedAt: { $lt: me.joinedAt } },
        { joinedAt: me.joinedAt, playerId: { $lt: me.playerId } },
      ],
    })
    .sort({ joinedAt: 1 })
    .limit(25)
    .toArray();

  const myWait = (now.getTime() - me.joinedAt.getTime()) / 1000;
  for (const cand of candidates) {
    const theirWait = (now.getTime() - cand.joinedAt.getTime()) / 1000;
    // The longer-waiting side's window applies, so nobody waits forever
    // just because a fresh searcher is far from their rating.
    if (Math.abs(cand.rating - me.rating) > ratingWindow(Math.max(myWait, theirWait))) continue;

    const matchId = randomUUID();
    const lockedSelf = await col.updateOne(
      { playerId: me.playerId, matchId: null },
      { $set: { matchId, lockedAt: now } },
    );
    // Someone older claimed us meanwhile; the next heartbeat resolves it.
    if (lockedSelf.modifiedCount === 0) return null;

    const claimed = await col.updateOne(
      { playerId: cand.playerId, matchId: null, lastSeenAt: { $gte: freshSince } },
      { $set: { matchId, lockedAt: now } },
    );
    if (claimed.modifiedCount === 0) {
      await col.updateOne(
        { playerId: me.playerId, matchId },
        { $set: { matchId: null }, $unset: { lockedAt: "" } },
      );
      continue;
    }

    // Coin-flip who takes the first-move side.
    const a: MatchSide = { playerId: me.playerId, username: me.username, displayName: me.displayName };
    const b: MatchSide = { playerId: cand.playerId, username: cand.username, displayName: cand.displayName };
    const [challenger, opponent] = Math.random() < 0.5 ? [a, b] : [b, a];
    const iso = now.toISOString();
    const match: Match = {
      id: matchId,
      game: me.game,
      status: "active",
      challenger,
      opponent,
      state: initialState(me.game),
      toMoveSide: "red-or-white",
      moves: [],
      invitedAt: iso,
      acceptedAt: iso,
      startedAt: iso,
      turnExpiresAt: new Date(now.getTime() + TURN_SECONDS * 1000).toISOString(),
      source: "quick-match",
    };
    await insertMatch(match);
    await col.deleteOne({ playerId: me.playerId, matchId });
    return matchId;
  }
  return null;
}

/** Current queue state without heartbeating or pairing. */
export async function queueStatus(playerId: string): Promise<QueueStatus> {
  await ensureIndexes();
  const db = await getDb();
  const entry = await db.collection<QueueEntry>(COL).findOne({ playerId });
  if (!entry) return { status: "idle" };
  if (entry.matchId) {
    const resolved = await resolveMatched(entry);
    if (resolved) return resolved;
  }
  return searching(entry, new Date());
}

/** Leave the queue. A row that's already been paired is left alone. */
export async function leaveQueue(playerId: string): Promise<QueueStatus> {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<QueueEntry>(COL);
  await col.deleteOne({ playerId, matchId: null });
  const still = await col.findOne({ playerId });
  if (still?.matchId) {
    const resolved = await resolveMatched(still);
    if (resolved) return resolved;
  }
  return { status: "idle" };
}

/** Number of fresh searchers per game — shown as "N players searching". */
export async function searchingCounts(): Promise<Record<GameId, number>> {
  await ensureIndexes();
  const db = await getDb();
  const freshSince = new Date(Date.now() - STALE_MS);
  const rows = await db
    .collection<QueueEntry>(COL)
    .aggregate<{ _id: GameId; n: number }>([
      { $match: { matchId: null, lastSeenAt: { $gte: freshSince } } },
      { $group: { _id: "$game", n: { $sum: 1 } } },
    ])
    .toArray();
  const out: Record<GameId, number> = { "royal-checkers": 0, "imperial-kings": 0 };
  for (const r of rows) out[r._id] = r.n;
  return out;
}
