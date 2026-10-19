import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import { Rating, DEFAULT_RATING, GameResult, updateRating, round } from "@/lib/games/glicko2";

export type GameId = "royal-checkers" | "imperial-kings";

export interface PlayerProfile {
  _id?: ObjectId;
  id: string;             // public id (never changes; used in URLs)
  username: string;       // unique, lowercase, URL-safe
  displayName: string;    // shown name; may contain spaces/case
  emailLower: string;
  passwordHash: string;
  yearOfBirth: number;    // for isMinor derivation; see ADR-0005
  isMinor: boolean;       // true at signup if under 18 at account creation
  consentStatus: "none" | "parental-pending" | "parental-granted";
  publicProfile: boolean; // defaults false for minors, true for adults
  achievements: string[]; // array of achievement slugs earned
  bio?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Ranking {
  _id?: ObjectId;
  playerId: string;
  game: GameId;
  rating: number;
  deviation: number;
  volatility: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  lastUpdatedAt: string;
}

/* ---------------------- Collections / indexes ---------------------- */

export async function ensurePlayerIndexes() {
  const db = await getDb();
  await Promise.all([
    db.collection<PlayerProfile>("players").createIndex({ username: 1 }, { unique: true }),
    db.collection<PlayerProfile>("players").createIndex({ emailLower: 1 }, { unique: true }),
    db.collection<PlayerProfile>("players").createIndex({ id: 1 }, { unique: true }),
    db.collection<Ranking>("rankings").createIndex({ playerId: 1, game: 1 }, { unique: true }),
    db.collection<Ranking>("rankings").createIndex({ game: 1, rating: -1 }),
  ]);
}

/* ----------------------------- Players ----------------------------- */

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(u: string): string {
  return u.trim().toLowerCase();
}

export async function findPlayerByUsername(username: string): Promise<PlayerProfile | null> {
  const db = await getDb();
  return db.collection<PlayerProfile>("players").findOne({ username: normalizeUsername(username) });
}

export async function findPlayerByEmail(email: string): Promise<PlayerProfile | null> {
  const db = await getDb();
  return db.collection<PlayerProfile>("players").findOne({ emailLower: email.trim().toLowerCase() });
}

export async function findPlayerById(id: string): Promise<PlayerProfile | null> {
  const db = await getDb();
  return db.collection<PlayerProfile>("players").findOne({ id });
}

export async function createPlayer(p: Omit<PlayerProfile, "_id">): Promise<void> {
  const db = await getDb();
  await db.collection<PlayerProfile>("players").insertOne(p);
}

export async function updatePlayer(
  id: string,
  patch: Partial<Omit<PlayerProfile, "_id" | "id">>,
): Promise<void> {
  const db = await getDb();
  await db.collection<PlayerProfile>("players").updateOne({ id }, { $set: patch });
}

export async function markLogin(id: string): Promise<void> {
  await updatePlayer(id, { lastLoginAt: new Date().toISOString() });
}

/* --------------------------- Rankings ------------------------------ */

export async function getRanking(playerId: string, game: GameId): Promise<Ranking> {
  const db = await getDb();
  const found = await db.collection<Ranking>("rankings").findOne({ playerId, game });
  if (found) return found;
  const seed: Ranking = {
    playerId,
    game,
    rating: DEFAULT_RATING.rating,
    deviation: DEFAULT_RATING.deviation,
    volatility: DEFAULT_RATING.volatility,
    gamesPlayed: 0, wins: 0, losses: 0, draws: 0,
    lastUpdatedAt: new Date().toISOString(),
  };
  await db.collection<Ranking>("rankings").insertOne(seed);
  return seed;
}

export async function listRankings(playerId: string): Promise<Ranking[]> {
  const db = await getDb();
  return db.collection<Ranking>("rankings").find({ playerId }).toArray();
}

export async function topRankings(game: GameId, limit = 50): Promise<Array<Ranking & { username: string; displayName: string; isMinor: boolean }>> {
  const db = await getDb();
  const rankings = await db
    .collection<Ranking>("rankings")
    .find({ game })
    .sort({ rating: -1 })
    .limit(limit)
    .toArray();
  const ids = rankings.map((r) => r.playerId);
  const players = await db
    .collection<PlayerProfile>("players")
    .find({ id: { $in: ids } })
    .project({ id: 1, username: 1, displayName: 1, isMinor: 1, publicProfile: 1 })
    .toArray();
  const byId = new Map(players.map((p) => [p.id as unknown as string, p]));
  return rankings
    .map((r) => {
      const p = byId.get(r.playerId);
      if (!p) return null;
      return {
        ...r,
        username: p.username as unknown as string,
        displayName: p.displayName as unknown as string,
        isMinor: !!p.isMinor,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

/**
 * Record a single ranked game outcome and move the player's rating.
 * `score` is 1 for a win, 0 for a loss, 0.5 for a draw.
 * The opponent is a synthetic AI with a rating derived from the
 * difficulty slider — see ratingForDifficulty below.
 */
export async function recordRankedResult(opts: {
  playerId: string;
  game: GameId;
  score: 0 | 0.5 | 1;
  opponentRating: Rating;
}): Promise<Ranking> {
  const current = await getRanking(opts.playerId, opts.game);
  const playerRating: Rating = {
    rating: current.rating, deviation: current.deviation, volatility: current.volatility,
  };
  const result: GameResult = { opponent: opts.opponentRating, score: opts.score };
  const updated = round(updateRating(playerRating, [result]));
  const db = await getDb();
  const next: Ranking = {
    ...current,
    rating: updated.rating,
    deviation: updated.deviation,
    volatility: updated.volatility,
    gamesPlayed: current.gamesPlayed + 1,
    wins: current.wins + (opts.score === 1 ? 1 : 0),
    losses: current.losses + (opts.score === 0 ? 1 : 0),
    draws: current.draws + (opts.score === 0.5 ? 1 : 0),
    lastUpdatedAt: new Date().toISOString(),
  };
  await db.collection<Ranking>("rankings").updateOne(
    { playerId: opts.playerId, game: opts.game },
    { $set: next },
  );
  return next;
}

/**
 * Map a 1-100 AI difficulty to an opponent rating + RD. Easy ≈ 1100,
 * Medium ≈ 1500, Hard ≈ 1900, Expert ≈ 2100.
 */
export function ratingForDifficulty(difficulty: number): Rating {
  const d = Math.max(1, Math.min(100, Math.round(difficulty)));
  const rating = 1000 + (d / 100) * 1100; // 1000..2100
  const deviation = 80; // AI is a known opponent — low RD
  return { rating, deviation, volatility: 0.06 };
}
