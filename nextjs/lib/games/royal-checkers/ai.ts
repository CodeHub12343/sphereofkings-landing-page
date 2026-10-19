// Royal Checkers AI — minimax + alpha-beta + iterative deepening.
//
// Three preset tiers wired from the UI. All tiers can run client-side;
// the Hard tier is also exposed through /api/games/royal-checkers/move
// as a server-side backup so a low-end phone doesn't stall.

import {
  COLS,
  ROWS,
  GameState,
  Move,
  Color,
  apply,
  legalMoves,
  outcome,
  pieceAt,
} from "./engine";

export type Difficulty = "easy" | "medium" | "hard";

interface TierConfig {
  maxDepth: number;
  // Chance we pick a non-best move among the top candidates. Keeps the
  // Easy tier beatable by a human who's still learning the seam.
  noise: number;
  // Soft budget — we stop iterating once we cross this.
  timeBudgetMs: number;
}

const TIERS: Record<Difficulty, TierConfig> = {
  easy: { maxDepth: 2, noise: 0.4, timeBudgetMs: 300 },
  medium: { maxDepth: 4, noise: 0.1, timeBudgetMs: 1000 },
  hard: { maxDepth: 6, noise: 0, timeBudgetMs: 2500 },
};

const INF = 1_000_000;
const WIN = 100_000;

/** Evaluate from `side`'s perspective. Positive = good for `side`. */
export function evaluate(state: GameState, side: Color): number {
  let score = 0;
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      const p = pieceAt(state, { col: c, row: r });
      if (!p) continue;
      let v = p.kind === "king" ? 180 : 100;
      // Positional bonus: men want to advance; kings want the centre.
      if (p.kind === "man") {
        const advance = p.color === "red" ? r - 1 : ROWS - r;
        v += advance * 4;
      } else {
        // Centre rows get a small bonus (rows 4,5 nearest the middle).
        const centreBonus = r === 4 || r === 5 ? 6 : 0;
        v += centreBonus;
      }
      score += p.color === side ? v : -v;
    }
  }
  // Mobility differential — small weight, big effect in endgames.
  const toMoveMoves = legalMoves(state).length;
  if (state.toMove === side) score += toMoveMoves;
  else score -= toMoveMoves;
  return score;
}

function search(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  side: Color,
  deadline: number,
): number {
  const term = outcome(state);
  if (term.kind === "win") {
    return term.winner === side ? WIN + depth : -WIN - depth;
  }
  if (term.kind === "draw") return 0;
  if (depth === 0) return evaluate(state, side);
  if (Date.now() > deadline) return evaluate(state, side);

  const moves = legalMoves(state);
  if (state.toMove === side) {
    let best = -INF;
    for (const m of moves) {
      const value = search(apply(state, m), depth - 1, alpha, beta, side, deadline);
      if (value > best) best = value;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = INF;
    for (const m of moves) {
      const value = search(apply(state, m), depth - 1, alpha, beta, side, deadline);
      if (value < best) best = value;
      if (best < beta) beta = best;
      if (alpha >= beta) break;
    }
    return best;
  }
}

/**
 * Pick a move for the side to move. Uses iterative deepening so we
 * always have a best move in hand if the time budget expires.
 */
export function chooseMove(
  state: GameState,
  difficulty: Difficulty,
): Move | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const tier = TIERS[difficulty];
  const side = state.toMove;
  const deadline = Date.now() + tier.timeBudgetMs;

  let scored: Array<{ move: Move; value: number }> = moves.map((m) => ({
    move: m,
    value: 0,
  }));

  for (let depth = 1; depth <= tier.maxDepth; depth++) {
    const next: Array<{ move: Move; value: number }> = [];
    for (const entry of scored) {
      if (Date.now() > deadline && depth > 1) {
        next.push(entry); // keep prior score
        continue;
      }
      const value = search(
        apply(state, entry.move),
        depth - 1,
        -INF,
        INF,
        side,
        deadline,
      );
      next.push({ move: entry.move, value });
    }
    // Sort best-first so alpha-beta cuts more at the next depth.
    next.sort((a, b) => b.value - a.value);
    scored = next;
    if (Date.now() > deadline) break;
  }

  // Noise: with probability `noise`, pick randomly among the top three.
  if (tier.noise > 0 && Math.random() < tier.noise) {
    const pool = scored.slice(0, Math.min(3, scored.length));
    return pool[Math.floor(Math.random() * pool.length)].move;
  }
  return scored[0].move;
}
