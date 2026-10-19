// Royal Checkers — pure game engine.
//
// Source of truth: /content/rules/royal-checkers.md (owner-signed).
// Keep this file deterministic, side-effect free, and framework-free.
// Rendering, AI, networking, and persistence all import from here but
// must not reach in to touch internals.
//
// Board model:
//   14 columns × 8 rows, dark-squares-only play (standard checkers).
//   A square is dark when (col + row) is odd — using 1-indexed col/row.
//   The long dimension (columns) wraps as a cylinder; rows do not.
//   See ADR-0001 for the geometry decision.

/* ------------------------------- Types ------------------------------ */

export const COLS = 14;
export const ROWS = 8;

export type Color = "red" | "black";
export type PieceKind = "man" | "king";

export interface Piece {
  color: Color;
  kind: PieceKind;
}

/** Game state is immutable; every operation returns a fresh value. */
export interface GameState {
  // Row-major 2D array indexed board[row-1][col-1]. null = empty.
  board: (Piece | null)[][];
  toMove: Color;
  // Plies since the last capture or non-king man move. Hits the §9
  // 40-move draw threshold at 80 (plies are half-moves per player).
  halfmoveClock: number;
  // Full-position history for threefold-repetition detection. We hash
  // "board + toMove" per position.
  positionHistory: string[];
  // Chosen game-type variation. "standard" is base rules + the
  // stacked-king-returns-home option (§10). "kings-face-off" starts
  // every piece as a king and disables the home-row split (§11).
  variant: "standard" | "kings-face-off";
}

export interface Square {
  col: number; // 1..14
  row: number; // 1..8
}

/** A fully-expanded move: `path` is `[from, ...landings]`. */
export interface Move {
  from: Square;
  path: Square[];
  // Opponent squares captured during this move's path (0 for a simple
  // move; 1+ for a jump combo).
  captured: Square[];
  // True when the moving piece ends the move crowned (mid-combo
  // kinging does NOT continue the combo per rules §12).
  crowned: boolean;
  // True when this move is the home-row split action for the
  // "stacked king returns home" variation — expands into two kings
  // placed on the home row. Not implemented at MVP; schema reserved.
  splitHomeRow?: boolean;
}

export type Outcome =
  | { kind: "ongoing" }
  | { kind: "win"; winner: Color; reason: "no-moves" | "resignation" }
  | { kind: "draw"; reason: "no-progress" | "threefold" | "insufficient-material" };

/* ------------------------------- Setup ------------------------------ */

/** Dark-square check (1-indexed). */
export function isDark(col: number, row: number): boolean {
  return (col + row) % 2 === 1;
}

/**
 * §12 Standard Starting Position: three rows per side on dark squares.
 * 7 pieces per row × 3 rows = 21 pieces per color (42 total).
 */
export function initial(variant: GameState["variant"] = "standard"): GameState {
  const board: (Piece | null)[][] = Array.from({ length: ROWS }, () =>
    Array<Piece | null>(COLS).fill(null),
  );
  const kind: PieceKind = variant === "kings-face-off" ? "king" : "man";
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= COLS; col++) {
      if (isDark(col, row)) {
        board[row - 1][col - 1] = { color: "red", kind };
      }
    }
  }
  for (let row = ROWS - 2; row <= ROWS; row++) {
    for (let col = 1; col <= COLS; col++) {
      if (isDark(col, row)) {
        board[row - 1][col - 1] = { color: "black", kind };
      }
    }
  }
  const state: GameState = {
    board,
    toMove: "red",
    halfmoveClock: 0,
    positionHistory: [],
    variant,
  };
  // Seed the position history with the initial position so threefold
  // works correctly from move 1.
  return { ...state, positionHistory: [positionKey(state)] };
}

/* ---------------------------- Seam helpers -------------------------- */

/** Wrap a column into 1..COLS. Handles both +1 overflow and -1 underflow. */
export function wrapCol(col: number): number {
  const mod = ((col - 1) % COLS + COLS) % COLS;
  return mod + 1;
}

export function pieceAt(state: GameState, sq: Square): Piece | null {
  if (sq.row < 1 || sq.row > ROWS) return null;
  const col = wrapCol(sq.col);
  return state.board[sq.row - 1][col - 1];
}

function setPiece(
  board: (Piece | null)[][],
  sq: Square,
  piece: Piece | null,
): void {
  board[sq.row - 1][wrapCol(sq.col) - 1] = piece;
}

/* ------------------------------ Movement ---------------------------- */

/**
 * Diagonal directions for a piece. Men move only toward the opponent's
 * home row; kings move both ways. Column deltas are ±1 but the actual
 * landing column goes through wrapCol so the seam is transparent.
 */
function diagonals(piece: Piece): Array<[dCol: 1 | -1, dRow: 1 | -1]> {
  if (piece.kind === "king") {
    return [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  }
  // Red advances up (row++), Black advances down (row--).
  return piece.color === "red"
    ? [[1, 1], [-1, 1]]
    : [[1, -1], [-1, -1]];
}

/** Simple one-square diagonals from `sq` for `piece`, legal landings only. */
function simpleMoves(state: GameState, from: Square, piece: Piece): Move[] {
  const moves: Move[] = [];
  for (const [dc, dr] of diagonals(piece)) {
    const landRow = from.row + dr;
    if (landRow < 1 || landRow > ROWS) continue;
    const land: Square = { col: wrapCol(from.col + dc), row: landRow };
    if (pieceAt(state, land)) continue;
    const crowned = willCrown(piece, land);
    moves.push({
      from,
      path: [from, land],
      captured: [],
      crowned,
    });
  }
  return moves;
}

function willCrown(piece: Piece, land: Square): boolean {
  if (piece.kind === "king") return false;
  if (piece.color === "red" && land.row === ROWS) return true;
  if (piece.color === "black" && land.row === 1) return true;
  return false;
}

/**
 * Full jump expansion for one piece — depth-first search of every
 * reachable landing square via chains of captures. §5 captures are
 * mandatory, §12 mid-combo kinging ends the turn (so once a man
 * crowns during a combo, no further jumps are enumerated from that
 * landing).
 */
function jumpMoves(
  state: GameState,
  from: Square,
  piece: Piece,
): Move[] {
  const results: Move[] = [];
  const stack: Array<{
    piece: Piece;
    path: Square[];
    captured: Square[];
    boardSnapshot: (Piece | null)[][];
  }> = [
    {
      piece,
      path: [from],
      captured: [],
      boardSnapshot: cloneBoard(state.board),
    },
  ];
  while (stack.length) {
    const node = stack.pop()!;
    const current = node.path[node.path.length - 1];
    let anyMore = false;

    for (const [dc, dr] of diagonals(node.piece)) {
      const overRow = current.row + dr;
      const landRow = current.row + dr * 2;
      if (landRow < 1 || landRow > ROWS) continue;
      const over: Square = { col: wrapCol(current.col + dc), row: overRow };
      const land: Square = { col: wrapCol(current.col + dc * 2), row: landRow };

      // Can't re-capture a square we already captured this combo.
      if (
        node.captured.some(
          (c) => c.col === over.col && c.row === over.row,
        )
      ) continue;
      const overPiece = node.boardSnapshot[over.row - 1][over.col - 1];
      if (!overPiece || overPiece.color === node.piece.color) continue;
      const landPiece = node.boardSnapshot[land.row - 1][land.col - 1];
      // The landing square must be empty UNLESS it's the start square
      // (jumping back onto your own origin after a loop is impossible
      // because you'd have to re-capture an already-captured square).
      if (
        landPiece &&
        !(land.col === from.col && land.row === from.row)
      ) continue;

      // Build a new snapshot with the captured piece removed and the
      // moving piece re-placed on the landing. This matches §5
      // "captured pieces are removed at the end of the full combo" in
      // appearance (we never show mid-combo removals to the renderer)
      // while making the DFS correct — the key constraint is "a
      // captured square cannot be reused this combo", which `captured`
      // tracks explicitly.
      const nextBoard = cloneBoard(node.boardSnapshot);
      nextBoard[current.row - 1][current.col - 1] = null;
      nextBoard[over.row - 1][over.col - 1] = null;
      // If the moving piece crowns on this landing, stop extending.
      const crowns = willCrown(node.piece, land);
      const nextPiece: Piece = crowns
        ? { color: node.piece.color, kind: "king" }
        : node.piece;
      nextBoard[land.row - 1][land.col - 1] = nextPiece;

      const nextPath = [...node.path, land];
      const nextCaptured = [...node.captured, over];
      anyMore = true;
      if (crowns) {
        // §12: mid-combo kinging ends the turn. Terminal.
        results.push({ from, path: nextPath, captured: nextCaptured, crowned: true });
      } else {
        stack.push({
          piece: nextPiece,
          path: nextPath,
          captured: nextCaptured,
          boardSnapshot: nextBoard,
        });
      }
    }
    // §5: captures are mandatory, and a jump combo must be continued
    // whenever a further jump is available. So we only record a path
    // as a legal move when the piece has no further jumps from here.
    if (!anyMore && node.path.length > 1) {
      results.push({
        from,
        path: node.path,
        captured: node.captured,
        crowned: false,
      });
    }
  }
  return results;
}

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => row.slice());
}

/**
 * All legal moves for the side to move.
 *
 * §5: Captures are mandatory. If any jump is available anywhere on the
 * board, the returned list is the set of jumps only; otherwise simple
 * moves.
 */
export function legalMoves(state: GameState): Move[] {
  const jumps: Move[] = [];
  const simples: Move[] = [];
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      const sq: Square = { col: c, row: r };
      const piece = pieceAt(state, sq);
      if (!piece || piece.color !== state.toMove) continue;
      const theseJumps = jumpMoves(state, sq, piece);
      if (theseJumps.length) jumps.push(...theseJumps);
      else simples.push(...simpleMoves(state, sq, piece));
    }
  }
  return jumps.length ? jumps : simples;
}

/* --------------------------- Apply a move --------------------------- */

/**
 * Apply a move and return the next state. The move must be a legal
 * move produced by `legalMoves(state)`. We trust the caller; the UI
 * and AI always pick from `legalMoves`.
 */
export function apply(state: GameState, move: Move): GameState {
  const board = cloneBoard(state.board);
  const originalPiece = board[move.from.row - 1][wrapCol(move.from.col) - 1];
  if (!originalPiece) {
    throw new Error("apply: no piece on from-square");
  }
  // Remove the moving piece and every captured piece.
  setPiece(board, move.from, null);
  for (const cap of move.captured) setPiece(board, cap, null);
  // Place the piece on the landing square, promoted if necessary.
  const landing = move.path[move.path.length - 1];
  const landed: Piece = move.crowned
    ? { color: originalPiece.color, kind: "king" }
    : originalPiece;
  setPiece(board, landing, landed);

  const isCapture = move.captured.length > 0;
  const movedMan = originalPiece.kind === "man";
  const nextHalfmove = isCapture || movedMan ? 0 : state.halfmoveClock + 1;

  const nextState: GameState = {
    board,
    toMove: state.toMove === "red" ? "black" : "red",
    halfmoveClock: nextHalfmove,
    positionHistory: state.positionHistory,
    variant: state.variant,
  };
  return {
    ...nextState,
    positionHistory: [...state.positionHistory, positionKey(nextState)],
  };
}

/* ------------------------------ Outcome ----------------------------- */

export function outcome(state: GameState): Outcome {
  if (legalMoves(state).length === 0) {
    return {
      kind: "win",
      winner: state.toMove === "red" ? "black" : "red",
      reason: "no-moves",
    };
  }
  if (state.halfmoveClock >= 80) {
    return { kind: "draw", reason: "no-progress" };
  }
  // Threefold: last position in history occurs 3+ times.
  const last = state.positionHistory[state.positionHistory.length - 1];
  const count = state.positionHistory.filter((p) => p === last).length;
  if (count >= 3) {
    return { kind: "draw", reason: "threefold" };
  }
  if (isInsufficientMaterial(state)) {
    return { kind: "draw", reason: "insufficient-material" };
  }
  return { kind: "ongoing" };
}

function isInsufficientMaterial(state: GameState): boolean {
  // Reduce to total men + total kings per side. A single king vs. a
  // single king with no men on either side cannot force a win.
  let redMen = 0, redKings = 0, blackMen = 0, blackKings = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      if (p.color === "red") p.kind === "king" ? redKings++ : redMen++;
      else p.kind === "king" ? blackKings++ : blackMen++;
    }
  }
  return (
    redMen === 0 &&
    blackMen === 0 &&
    redKings <= 1 &&
    blackKings <= 1
  );
}

/* -------------------------- Serialization --------------------------- */

/**
 * Compact wire format for the whole state. Used for API payloads,
 * local-storage saves, and replay snapshots. Keep it stable; a format
 * change requires a version bump.
 */
export function encode(state: GameState): string {
  const rows: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let s = "";
    for (let c = 0; c < COLS; c++) {
      const p = state.board[r][c];
      if (!p) s += ".";
      else if (p.color === "red") s += p.kind === "king" ? "R" : "r";
      else s += p.kind === "king" ? "B" : "b";
    }
    rows.push(s);
  }
  const positions = state.positionHistory.join(",");
  return [
    "sok-rc-1",
    rows.join("/"),
    state.toMove[0], // "r" | "b"
    state.halfmoveClock,
    state.variant,
    positions,
  ].join("|");
}

export function decode(s: string): GameState {
  const parts = s.split("|");
  if (parts[0] !== "sok-rc-1") throw new Error("decode: unknown format");
  const [, rowsStr, toMoveStr, halfmoveStr, variantStr, positionsStr] = parts;
  const board: (Piece | null)[][] = rowsStr.split("/").map((row) =>
    [...row].map((ch) => {
      if (ch === ".") return null;
      const color: Color = ch === "r" || ch === "R" ? "red" : "black";
      const kind: PieceKind = ch === ch.toUpperCase() ? "king" : "man";
      return { color, kind };
    }),
  );
  const toMove: Color = toMoveStr === "r" ? "red" : "black";
  const halfmoveClock = Number.parseInt(halfmoveStr, 10) || 0;
  const variant =
    variantStr === "kings-face-off" ? "kings-face-off" : "standard";
  const positionHistory = positionsStr ? positionsStr.split(",") : [];
  return { board, toMove, halfmoveClock, positionHistory, variant };
}

/** Just the position part (board + toMove) for repetition detection. */
export function positionKey(state: GameState): string {
  const rows: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let s = "";
    for (let c = 0; c < COLS; c++) {
      const p = state.board[r][c];
      if (!p) s += ".";
      else if (p.color === "red") s += p.kind === "king" ? "R" : "r";
      else s += p.kind === "king" ? "B" : "b";
    }
    rows.push(s);
  }
  return rows.join("/") + ":" + state.toMove[0];
}

/* --------------------------- Introspection -------------------------- */

export function materialBalance(state: GameState): { red: number; black: number } {
  let red = 0, black = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      const value = p.kind === "king" ? 180 : 100;
      if (p.color === "red") red += value;
      else black += value;
    }
  }
  return { red, black };
}
