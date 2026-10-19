// Imperial Kings — chess variant on a 14x8 cylinder.
//
// Rules source of truth: /content/rules/imperial-kings.md.
//
// Key differences from standard chess:
//   • Board is 14 columns × 8 rows; columns wrap (cylinder).
//   • Each side has TWO kings. Victory = capture BOTH opponent kings.
//   • No concept of check or checkmate. You may make a move that
//     puts your own king in attack; the opponent must still actually
//     capture it to score the win.
//   • Rook / Queen / Bishop slides wrap the seam. A rook on col 1
//     can slide left into col 14 freely.
//   • Castling does NOT wrap the seam (ADR-0001). MVP skips castling
//     entirely to keep the engine small.
//   • En passant deferred to Phase 3 (noted below). Pawn promotion
//     auto-queens on the last rank.

export const COLS = 14;
export const ROWS = 8;

export type Color = "white" | "black";
export type PieceKind = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export interface Piece {
  color: Color;
  kind: PieceKind;
}

export interface Square { col: number; row: number; }

export interface Move {
  from: Square;
  to: Square;
  captured: Piece | null;
  promotion?: PieceKind;
}

export interface GameState {
  board: (Piece | null)[][];     // board[row-1][col-1]
  toMove: Color;
  halfmoveClock: number;         // for 50-move rule (100 plies)
  positionHistory: string[];
  variant: "standard";
}

export type Outcome =
  | { kind: "ongoing" }
  | { kind: "win"; winner: Color; reason: "both-kings-captured" | "no-moves" }
  | { kind: "draw"; reason: "50-move" | "threefold" | "insufficient-material" };

/* ------------------------------- Setup ------------------------------ */

export function wrapCol(col: number): number {
  const mod = ((col - 1) % COLS + COLS) % COLS;
  return mod + 1;
}

export function pieceAt(state: GameState, sq: Square): Piece | null {
  if (sq.row < 1 || sq.row > ROWS) return null;
  return state.board[sq.row - 1][wrapCol(sq.col) - 1];
}

function cloneBoard(b: (Piece | null)[][]): (Piece | null)[][] {
  return b.map((r) => r.slice());
}

/**
 * Starting position chosen to fit the 2K + 2Q + 4R + 4B + 4N + 14P
 * total per side across a 14-wide board:
 *
 *   row 1 (back):  N B Q N K B R R B K N Q B N
 *   row 2 (mid):   R p p p p p p p p p p p p R
 *   row 3 (pawns): p . . . . . . . . . . . . p
 *
 * Black mirrors on rows 6/7/8. Owner may revise the layout later;
 * the engine is agnostic to the particular starting squares.
 */
const BACK_RANK: PieceKind[] = [
  "knight", "bishop", "queen", "knight", "king", "bishop",
  "rook", "rook", "bishop", "king", "knight", "queen", "bishop", "knight",
];

export function initial(): GameState {
  const board: (Piece | null)[][] = Array.from({ length: ROWS }, () =>
    Array<Piece | null>(COLS).fill(null),
  );
  // White: rows 1,2,3
  for (let c = 1; c <= COLS; c++) {
    board[0][c - 1] = { color: "white", kind: BACK_RANK[c - 1] };
  }
  board[1][0] = { color: "white", kind: "rook" };
  board[1][COLS - 1] = { color: "white", kind: "rook" };
  for (let c = 2; c <= COLS - 1; c++) {
    board[1][c - 1] = { color: "white", kind: "pawn" };
  }
  board[2][0] = { color: "white", kind: "pawn" };
  board[2][COLS - 1] = { color: "white", kind: "pawn" };

  // Black: rows 8,7,6 (mirror)
  for (let c = 1; c <= COLS; c++) {
    board[ROWS - 1][c - 1] = { color: "black", kind: BACK_RANK[c - 1] };
  }
  board[ROWS - 2][0] = { color: "black", kind: "rook" };
  board[ROWS - 2][COLS - 1] = { color: "black", kind: "rook" };
  for (let c = 2; c <= COLS - 1; c++) {
    board[ROWS - 2][c - 1] = { color: "black", kind: "pawn" };
  }
  board[ROWS - 3][0] = { color: "black", kind: "pawn" };
  board[ROWS - 3][COLS - 1] = { color: "black", kind: "pawn" };

  const s: GameState = {
    board, toMove: "white", halfmoveClock: 0,
    positionHistory: [], variant: "standard",
  };
  return { ...s, positionHistory: [positionKey(s)] };
}

/* -------------------------- Move generation ------------------------- */

function slide(
  state: GameState, from: Square, piece: Piece,
  dirs: Array<[number, number]>, moves: Move[],
  verticalWraps = false,
) {
  for (const [dc, dr] of dirs) {
    let col = from.col + dc;
    let row = from.row + dr;
    while (true) {
      if (row < 1 || row > ROWS) break;
      // No vertical wrap; columns always wrap.
      const to: Square = { col: wrapCol(col), row };
      const target = pieceAt(state, to);
      if (!target) {
        moves.push({ from, to, captured: null });
      } else {
        if (target.color !== piece.color) {
          moves.push({ from, to, captured: target });
        }
        break;
      }
      col += dc;
      row += dr;
    }
    void verticalWraps;
  }
}

function step(
  state: GameState, from: Square, piece: Piece,
  offsets: Array<[number, number]>, moves: Move[],
) {
  for (const [dc, dr] of offsets) {
    const row = from.row + dr;
    if (row < 1 || row > ROWS) continue;
    const to: Square = { col: wrapCol(from.col + dc), row };
    const target = pieceAt(state, to);
    if (!target) {
      moves.push({ from, to, captured: null });
    } else if (target.color !== piece.color) {
      moves.push({ from, to, captured: target });
    }
  }
}

function pawnMoves(state: GameState, from: Square, piece: Piece, moves: Move[]) {
  const dir = piece.color === "white" ? 1 : -1;
  const startRow = piece.color === "white" ? 2 : ROWS - 1;
  // Pawns on row 3 (white) or row 6 (black) are also "home-row"
  // starters per our starting layout — give them the 2-square option too.
  const altStartRow = piece.color === "white" ? 3 : ROWS - 2;
  const promoRow = piece.color === "white" ? ROWS : 1;

  // One forward.
  const oneRow = from.row + dir;
  if (oneRow >= 1 && oneRow <= ROWS) {
    const oneSq: Square = { col: from.col, row: oneRow };
    if (!pieceAt(state, oneSq)) {
      if (oneRow === promoRow) {
        moves.push({ from, to: oneSq, captured: null, promotion: "queen" });
      } else {
        moves.push({ from, to: oneSq, captured: null });
      }
      // Two forward from starting rank.
      if (from.row === startRow || from.row === altStartRow) {
        const twoSq: Square = { col: from.col, row: from.row + dir * 2 };
        if (twoSq.row >= 1 && twoSq.row <= ROWS && !pieceAt(state, twoSq)) {
          moves.push({ from, to: twoSq, captured: null });
        }
      }
    }
  }
  // Diagonal captures (seam-wrapping).
  for (const dc of [-1, 1]) {
    const row = from.row + dir;
    if (row < 1 || row > ROWS) continue;
    const to: Square = { col: wrapCol(from.col + dc), row };
    const target = pieceAt(state, to);
    if (target && target.color !== piece.color) {
      if (row === promoRow) {
        moves.push({ from, to, captured: target, promotion: "queen" });
      } else {
        moves.push({ from, to, captured: target });
      }
    }
  }
  // En passant deferred to Phase 3.
}

function pieceMoves(state: GameState, from: Square, piece: Piece): Move[] {
  const moves: Move[] = [];
  switch (piece.kind) {
    case "pawn":
      pawnMoves(state, from, piece, moves); break;
    case "knight":
      step(state, from, piece, [
        [1, 2], [2, 1], [-1, 2], [-2, 1],
        [1, -2], [2, -1], [-1, -2], [-2, -1],
      ], moves); break;
    case "bishop":
      slide(state, from, piece, [[1,1],[1,-1],[-1,1],[-1,-1]], moves); break;
    case "rook":
      slide(state, from, piece, [[1,0],[-1,0],[0,1],[0,-1]], moves); break;
    case "queen":
      slide(state, from, piece, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], moves);
      break;
    case "king":
      step(state, from, piece, [
        [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],
      ], moves);
      // Castling: deferred to Phase 3 per MVP scope note.
      break;
  }
  return moves;
}

export function legalMoves(state: GameState): Move[] {
  const out: Move[] = [];
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      const p = state.board[r - 1][c - 1];
      if (!p || p.color !== state.toMove) continue;
      out.push(...pieceMoves(state, { col: c, row: r }, p));
    }
  }
  return out;
}

/* --------------------------- Apply + outcome ------------------------ */

export function apply(state: GameState, move: Move): GameState {
  const board = cloneBoard(state.board);
  const piece = board[move.from.row - 1][wrapCol(move.from.col) - 1];
  if (!piece) throw new Error("apply: empty from-square");
  board[move.from.row - 1][wrapCol(move.from.col) - 1] = null;
  const landed: Piece = move.promotion
    ? { color: piece.color, kind: move.promotion }
    : piece;
  board[move.to.row - 1][wrapCol(move.to.col) - 1] = landed;

  const isCapture = move.captured != null;
  const isPawnMove = piece.kind === "pawn";
  const nextHalfmove = isCapture || isPawnMove ? 0 : state.halfmoveClock + 1;

  const next: GameState = {
    board,
    toMove: state.toMove === "white" ? "black" : "white",
    halfmoveClock: nextHalfmove,
    positionHistory: state.positionHistory,
    variant: state.variant,
  };
  return { ...next, positionHistory: [...state.positionHistory, positionKey(next)] };
}

function countKings(state: GameState, color: Color): number {
  let n = 0;
  for (const row of state.board) for (const p of row) {
    if (p && p.color === color && p.kind === "king") n++;
  }
  return n;
}

export function outcome(state: GameState): Outcome {
  // Primary win condition: both opponent kings captured.
  if (countKings(state, "white") === 0) {
    return { kind: "win", winner: "black", reason: "both-kings-captured" };
  }
  if (countKings(state, "black") === 0) {
    return { kind: "win", winner: "white", reason: "both-kings-captured" };
  }
  // Stalemate / no-moves — side to move loses (they cannot defend).
  if (legalMoves(state).length === 0) {
    return {
      kind: "win",
      winner: state.toMove === "white" ? "black" : "white",
      reason: "no-moves",
    };
  }
  if (state.halfmoveClock >= 100) {
    return { kind: "draw", reason: "50-move" };
  }
  const last = state.positionHistory[state.positionHistory.length - 1];
  if (state.positionHistory.filter((p) => p === last).length >= 3) {
    return { kind: "draw", reason: "threefold" };
  }
  if (isInsufficient(state)) return { kind: "draw", reason: "insufficient-material" };
  return { kind: "ongoing" };
}

function isInsufficient(state: GameState): boolean {
  // Both sides have only kings left → forced draw.
  let whiteOther = 0, blackOther = 0;
  for (const row of state.board) for (const p of row) {
    if (!p) continue;
    if (p.kind === "king") continue;
    if (p.color === "white") whiteOther++; else blackOther++;
  }
  return whiteOther === 0 && blackOther === 0;
}

/* --------------------------- Serialization -------------------------- */

const KIND_CHAR: Record<PieceKind, string> = {
  pawn: "p", knight: "n", bishop: "b", rook: "r", queen: "q", king: "k",
};
const CHAR_KIND: Record<string, PieceKind> = {
  p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king",
};

function encodeBoard(board: (Piece | null)[][]): string {
  const rows: string[] = [];
  for (const row of board) {
    let s = "";
    for (const p of row) {
      if (!p) s += ".";
      else {
        const ch = KIND_CHAR[p.kind];
        s += p.color === "white" ? ch.toUpperCase() : ch;
      }
    }
    rows.push(s);
  }
  return rows.join("/");
}

export function encode(state: GameState): string {
  return [
    "sok-ik-1",
    encodeBoard(state.board),
    state.toMove[0], // w|b
    state.halfmoveClock,
    state.positionHistory.join(","),
  ].join("|");
}

export function decode(s: string): GameState {
  const parts = s.split("|");
  if (parts[0] !== "sok-ik-1") throw new Error("decode: unknown format");
  const [, boardStr, toMoveStr, halfmoveStr, posStr] = parts;
  const board = boardStr.split("/").map((row) =>
    [...row].map<Piece | null>((ch) => {
      if (ch === ".") return null;
      const lower = ch.toLowerCase();
      return { color: ch === lower ? "black" : "white", kind: CHAR_KIND[lower] };
    }),
  );
  return {
    board,
    toMove: toMoveStr === "w" ? "white" : "black",
    halfmoveClock: Number.parseInt(halfmoveStr, 10) || 0,
    positionHistory: posStr ? posStr.split(",") : [],
    variant: "standard",
  };
}

export function positionKey(state: GameState): string {
  return encodeBoard(state.board) + ":" + state.toMove[0];
}

export const PIECE_VALUES: Record<PieceKind, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000,
};
