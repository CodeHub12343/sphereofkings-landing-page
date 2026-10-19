// Imperial Kings AI — minimax + alpha-beta + iterative deepening,
// shaped by the shared 1–100 difficulty slider.

import {
  COLS, ROWS, GameState, Move, Color,
  apply, legalMoves, outcome, PIECE_VALUES,
} from "./engine";
import { Difficulty, configFor } from "../difficulty";

const INF = 1_000_000;
const WIN = 100_000;

export function evaluate(state: GameState, side: Color): number {
  let score = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      let v = PIECE_VALUES[p.kind];
      // Small centre bonus for pawns and minor pieces.
      if (p.kind === "pawn") {
        const advance = p.color === "white" ? r : ROWS - 1 - r;
        v += advance * 6;
      } else if (p.kind === "knight" || p.kind === "bishop") {
        if (r >= 2 && r <= ROWS - 3) v += 8;
      }
      score += p.color === side ? v : -v;
    }
  }
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
  if (term.kind === "win") return term.winner === side ? WIN + depth : -WIN - depth;
  if (term.kind === "draw") return 0;
  if (depth === 0) return evaluate(state, side);
  if (Date.now() > deadline) return evaluate(state, side);

  const moves = orderMoves(state, legalMoves(state));
  if (state.toMove === side) {
    let best = -INF;
    for (const m of moves) {
      const v = search(apply(state, m), depth - 1, alpha, beta, side, deadline);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = INF;
    for (const m of moves) {
      const v = search(apply(state, m), depth - 1, alpha, beta, side, deadline);
      if (v < best) best = v;
      if (best < beta) beta = best;
      if (alpha >= beta) break;
    }
    return best;
  }
}

/** Rough MVV/LVA ordering — captures and king-captures first. */
function orderMoves(state: GameState, moves: Move[]): Move[] {
  const scored = moves.map((m) => {
    if (!m.captured) return { m, score: 0 };
    let s = PIECE_VALUES[m.captured.kind];
    if (m.captured.kind === "king") s += 50_000;
    return { m, score: s };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((x) => x.m);
}

export function chooseMove(state: GameState, difficulty: Difficulty): Move | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const tier = configFor(difficulty);
  const side = state.toMove;
  const deadline = Date.now() + tier.timeBudgetMs;

  let scored = orderMoves(state, moves).map((m) => ({ m, v: 0 }));

  for (let depth = 1; depth <= tier.maxDepth; depth++) {
    const next: Array<{ m: Move; v: number }> = [];
    for (const entry of scored) {
      if (Date.now() > deadline && depth > 1) {
        next.push(entry);
        continue;
      }
      const v = search(apply(state, entry.m), depth - 1, -INF, INF, side, deadline);
      next.push({ m: entry.m, v });
    }
    next.sort((a, b) => b.v - a.v);
    scored = next;
    if (Date.now() > deadline) break;
  }

  if (tier.noise > 0 && Math.random() < tier.noise) {
    const pool = scored.slice(0, Math.min(3, scored.length));
    return pool[Math.floor(Math.random() * pool.length)].m;
  }
  return scored[0].m;
}
