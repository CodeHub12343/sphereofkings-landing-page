// Pure wrapper: no network, no DB, no secrets — safe to run in any
// context (server actions, API routes, tests). We deliberately do
// NOT import "server-only" so the smoke test can import it directly.
import * as rc from "@/lib/games/royal-checkers/engine";
import * as ik from "@/lib/games/imperial-kings/engine";

export type GameId = "royal-checkers" | "imperial-kings";

// Server-side wrapper that normalises both engines behind one
// interface. Every move submitted by a client goes through
// `applyServerMove` — the client-sent move JSON is matched against
// the server's own `legalMoves()` output, so the server is always
// authoritative over game state.

export type AnyMove = rc.Move | ik.Move;

export interface MatchOutcome {
  state: string;
  nextToMove: "red-or-white" | "black";
  finished: boolean;
  winnerSide?: "red-or-white" | "black" | "draw";
  reason?: string;
}

function sideOfState(game: GameId, state: string): "red-or-white" | "black" {
  if (game === "royal-checkers") {
    const s = rc.decode(state);
    return s.toMove === "red" ? "red-or-white" : "black";
  }
  const s = ik.decode(state);
  return s.toMove === "white" ? "red-or-white" : "black";
}

/** Initial state for a brand-new match. */
export function initialState(game: GameId): string {
  if (game === "royal-checkers") return rc.encode(rc.initial());
  return ik.encode(ik.initial());
}

/**
 * Validate and apply a move. Throws on illegal input — callers should
 * catch and return a 400. On success, returns the new encoded state
 * and the outcome check.
 */
export function applyServerMove(game: GameId, state: string, moveJson: string): MatchOutcome {
  const incoming = JSON.parse(moveJson) as AnyMove;

  if (game === "royal-checkers") {
    const s = rc.decode(state);
    const legal = rc.legalMoves(s);
    const match = legal.find((m) => sameRcMove(m, incoming as rc.Move));
    if (!match) throw new Error("illegal move");
    const next = rc.apply(s, match);
    const term = rc.outcome(next);
    const nextToMove: "red-or-white" | "black" = next.toMove === "red" ? "red-or-white" : "black";
    if (term.kind === "win") {
      return {
        state: rc.encode(next),
        nextToMove,
        finished: true,
        winnerSide: term.winner === "red" ? "red-or-white" : "black",
        reason: term.reason,
      };
    }
    if (term.kind === "draw") {
      return { state: rc.encode(next), nextToMove, finished: true, winnerSide: "draw", reason: term.reason };
    }
    return { state: rc.encode(next), nextToMove, finished: false };
  }

  const s = ik.decode(state);
  const legal = ik.legalMoves(s);
  const match = legal.find((m) => sameIkMove(m, incoming as ik.Move));
  if (!match) throw new Error("illegal move");
  const next = ik.apply(s, match);
  const term = ik.outcome(next);
  const nextToMove: "red-or-white" | "black" = next.toMove === "white" ? "red-or-white" : "black";
  if (term.kind === "win") {
    return {
      state: ik.encode(next),
      nextToMove,
      finished: true,
      winnerSide: term.winner === "white" ? "red-or-white" : "black",
      reason: term.reason,
    };
  }
  if (term.kind === "draw") {
    return { state: ik.encode(next), nextToMove, finished: true, winnerSide: "draw", reason: term.reason };
  }
  return { state: ik.encode(next), nextToMove, finished: false };
}

function sameRcMove(a: rc.Move, b: rc.Move): boolean {
  if (a.from.col !== b.from.col || a.from.row !== b.from.row) return false;
  if (a.path.length !== b.path.length) return false;
  for (let i = 0; i < a.path.length; i++) {
    if (a.path[i].col !== b.path[i].col || a.path[i].row !== b.path[i].row) return false;
  }
  return true;
}

function sameIkMove(a: ik.Move, b: ik.Move): boolean {
  return (
    a.from.col === b.from.col && a.from.row === b.from.row &&
    a.to.col === b.to.col && a.to.row === b.to.row &&
    (a.promotion ?? null) === (b.promotion ?? null)
  );
}

export { sideOfState };
