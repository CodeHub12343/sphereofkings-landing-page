import { getDb } from "@/lib/db/mongo";
import { PUZZLES, Puzzle, PuzzleGame, PuzzleTier } from "@/lib/games/puzzles/official";

// Puzzles live in Mongo so the catalogue can grow without redeploys.
// The seed script `scripts/seed-puzzles.mjs` uploads the official set.
// We mirror the same shape here and read from it at request time.

const COLLECTION = "puzzles";
const RUNS = "puzzleRuns";

export async function listPuzzles(filter?: {
  game?: PuzzleGame;
  tier?: PuzzleTier;
}): Promise<Puzzle[]> {
  try {
    const db = await getDb();
    const q: Record<string, unknown> = {};
    if (filter?.game) q.game = filter.game;
    if (filter?.tier) q.tier = filter.tier;
    const docs = await db
      .collection<Puzzle>(COLLECTION)
      .find(q, { projection: { _id: 0 } })
      .toArray();
    if (docs.length > 0) return docs;
  } catch {
    // Mongo unreachable — fall through to in-code catalogue.
  }
  // Fallback for local dev / unseeded deployments.
  return PUZZLES.filter((p) =>
    (!filter?.game || p.game === filter.game) &&
    (!filter?.tier || p.tier === filter.tier),
  );
}

export async function getPuzzle(slug: string): Promise<Puzzle | null> {
  try {
    const db = await getDb();
    const doc = await db
      .collection<Puzzle>(COLLECTION)
      .findOne({ slug }, { projection: { _id: 0 } });
    if (doc) return doc;
  } catch {}
  return PUZZLES.find((p) => p.slug === slug) ?? null;
}

/* --------------------------- Puzzle runs --------------------------- */

export interface PuzzleRun {
  anonymousSessionId: string;
  slug: string;
  game: PuzzleGame;
  tier: PuzzleTier;
  solved: boolean;
  timeMs: number;
  attempts: number;
  createdAt: string;
}

export async function recordPuzzleRun(run: PuzzleRun): Promise<void> {
  try {
    const db = await getDb();
    await db.collection<PuzzleRun>(RUNS).insertOne(run);
    await db.collection<PuzzleRun>(RUNS).createIndex({ anonymousSessionId: 1, createdAt: -1 }).catch(() => {});
  } catch {
    // Best-effort — failing to log a puzzle run should not break the UI.
  }
}

export async function listPuzzleRunsForSession(
  anonymousSessionId: string,
): Promise<PuzzleRun[]> {
  try {
    const db = await getDb();
    return await db
      .collection<PuzzleRun>(RUNS)
      .find({ anonymousSessionId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
  } catch {
    return [];
  }
}
