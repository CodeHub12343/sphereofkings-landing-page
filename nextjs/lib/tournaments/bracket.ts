// Pure bracket computation. No DB, no network, no clocks — the only
// input is the list of entries + current match outcomes, and the only
// output is the bracket shape + the next pair of matchups to create.
//
// Format: single-elimination with sizes 4, 8, 16, 32. We ONLY support
// powers of two at launch — padding with byes is a Phase 6 ADR.
//
// Seed ordering uses the classic 1-vs-N bracket pairing:
//   Round of 16: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15.
// This keeps top seeds apart until later rounds, matching every
// major chess / checkers federation's bracket seeding.

export type TournamentSize = 4 | 8 | 16 | 32;

export interface BracketSlot {
  seed: number;
  playerId: string | null; // null = bye (shouldn't happen at launch)
  displayName: string;
  username: string;
}

export interface BracketMatchNode {
  roundIdx: number;       // 0 = round of N, 1 = next round, …
  idxInRound: number;     // 0..(round size - 1)
  a: BracketSlot | null;  // top side
  b: BracketSlot | null;  // bottom side
  matchId: string | null; // id in the matches collection once created
  winner: "a" | "b" | null;
}

export interface Bracket {
  size: TournamentSize;
  rounds: BracketMatchNode[][];
}

const SEED_ORDER: Record<TournamentSize, number[]> = {
  4: [1, 4, 2, 3],
  8: [1, 8, 4, 5, 2, 7, 3, 6],
  16: [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11],
  32: [
    1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21,
    2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22,
  ],
};

/**
 * Build the initial bracket from a seeded list of entries. Entries
 * must be ordered by seed ascending (seed 1 first). Length must equal
 * the configured size.
 */
export function buildInitial(size: TournamentSize, entries: BracketSlot[]): Bracket {
  if (entries.length !== size) {
    throw new Error(`buildInitial: expected ${size} entries, got ${entries.length}`);
  }
  const order = SEED_ORDER[size];
  const seeded = order.map((seed) => entries.find((e) => e.seed === seed) ?? null);
  const firstRound: BracketMatchNode[] = [];
  for (let i = 0; i < size / 2; i++) {
    firstRound.push({
      roundIdx: 0,
      idxInRound: i,
      a: seeded[i * 2],
      b: seeded[i * 2 + 1],
      matchId: null,
      winner: null,
    });
  }
  const rounds: BracketMatchNode[][] = [firstRound];
  // Pre-materialise empty follow-up rounds so the UI has slots to render.
  let roundSize = size / 2;
  let r = 1;
  while (roundSize > 1) {
    const half = roundSize / 2;
    const empty: BracketMatchNode[] = [];
    for (let i = 0; i < half; i++) {
      empty.push({ roundIdx: r, idxInRound: i, a: null, b: null, matchId: null, winner: null });
    }
    rounds.push(empty);
    roundSize = half;
    r++;
  }
  return { size, rounds };
}

/**
 * Record a round-N node's winner and propagate the winning slot to
 * the correct position in round N+1. Returns a new Bracket.
 */
export function advance(
  bracket: Bracket,
  roundIdx: number,
  idxInRound: number,
  winnerKey: "a" | "b",
): Bracket {
  const next: BracketMatchNode[][] = bracket.rounds.map((r) => r.map((m) => ({ ...m })));
  const node = next[roundIdx][idxInRound];
  node.winner = winnerKey;
  const winningSlot = winnerKey === "a" ? node.a : node.b;
  if (!winningSlot) return { size: bracket.size, rounds: next };
  const nextRound = next[roundIdx + 1];
  if (!nextRound) return { size: bracket.size, rounds: next }; // tournament over
  const targetIdx = Math.floor(idxInRound / 2);
  const target = nextRound[targetIdx];
  if (idxInRound % 2 === 0) target.a = winningSlot;
  else target.b = winningSlot;
  return { size: bracket.size, rounds: next };
}

/**
 * Nodes whose match has not yet been scheduled but both opponents are
 * known. Called after each round completes to spawn the next layer's
 * matches collection rows.
 */
export function readyToSchedule(bracket: Bracket): BracketMatchNode[] {
  const out: BracketMatchNode[] = [];
  for (const round of bracket.rounds) {
    for (const node of round) {
      if (node.matchId) continue;
      if (!node.a || !node.b) continue;
      if (node.winner) continue; // already resolved via walkover
      out.push(node);
    }
  }
  return out;
}

/** The bracket's final (champion) slot, or null if not yet decided. */
export function champion(bracket: Bracket): BracketSlot | null {
  const final = bracket.rounds[bracket.rounds.length - 1][0];
  if (!final.winner) return null;
  return final.winner === "a" ? final.a : final.b;
}

/** Seed a list of entries deterministically from an unseeded array. */
export function seedByRating(
  entries: Array<Omit<BracketSlot, "seed"> & { rating: number }>,
  size: TournamentSize,
): BracketSlot[] {
  if (entries.length !== size) throw new Error("seedByRating: wrong count");
  const sorted = [...entries].sort((a, b) => b.rating - a.rating);
  return sorted.map((e, i) => ({
    seed: i + 1,
    playerId: e.playerId,
    username: e.username,
    displayName: e.displayName,
  }));
}
