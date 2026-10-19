// Official puzzle set for Phase 2 — three tiers per game, plus a
// kid-friendly set with simpler positions and no sharing surfaces.
//
// A puzzle is: "from this state, find the move that leads to the
// listed goal". The engine validates by applying the player's move
// and comparing to the recorded solution.
//
// `state`  = engine-encoded position (sok-rc-1 or sok-ik-1 format)
// `solution` = ordered list of expected player moves; the engine
//              plays the opponent response from `opponentMoves`.
// For MVP, we accept any first move that captures the required
// opponent piece or reaches the required square. The data file is
// seeded into Mongo by scripts/seed-puzzles.mjs.

export type PuzzleGame = "royal-checkers" | "imperial-kings";
export type PuzzleTier = "easy" | "medium" | "hard" | "kid";

export interface Puzzle {
  slug: string;
  game: PuzzleGame;
  tier: PuzzleTier;
  title: string;
  prompt: string;
  // Initial state. Players are always "to move" from here.
  state: string;
  // Accept move: the move is "correct" if the piece lands on this
  // square. For jump combos (Royal Checkers), the final landing
  // suffices; for Imperial Kings, the destination of the single
  // chosen move suffices.
  goalLandingCol: number;
  goalLandingRow: number;
  // Human-readable explanation shown after the player solves it.
  explanation: string;
}

// Encoded Royal Checkers states (14 cols × 8 rows), lowercase = man,
// uppercase = king, `.` empty, side-to-move `r` or `b`.
// For readability each row is 14 chars; 8 rows separated by `/`.
const rcState = (rows: string[], toMove: "r" | "b", history = ""): string =>
  `sok-rc-1|${rows.join("/")}|${toMove}|0|standard|${history}`;

const ikState = (rows: string[], toMove: "w" | "b", history = ""): string =>
  `sok-ik-1|${rows.join("/")}|${toMove}|0|${history}`;

export const PUZZLES: Puzzle[] = [
  /* ---------------- Royal Checkers · Easy (seam) --------------- */
  {
    slug: "rc-easy-seam-capture",
    game: "royal-checkers",
    tier: "easy",
    title: "Through the Seam",
    prompt: "Red to move. Jump across the seam between column 14 and column 1.",
    state: rcState([
      "..............",
      "..............",
      "..............",
      ".............r",
      "b.............",
      "..............",
      "..............",
      "..............",
    ], "r"),
    goalLandingCol: 2,
    goalLandingRow: 5,
    explanation:
      "The red man on col 14 jumps the black man on col 1 and lands on col 2 — the cylinder makes 14→1→2 a straight diagonal.",
  },
  /* ---------------- Royal Checkers · Easy (kid) --------------- */
  {
    slug: "rc-kid-first-jump",
    game: "royal-checkers",
    tier: "kid",
    title: "Your First Jump",
    prompt: "Red to move. There is one jump — can you find it?",
    state: rcState([
      "..............",
      "..............",
      "....r.........",
      ".....b........",
      "..............",
      "..............",
      "..............",
      "..............",
    ], "r"),
    goalLandingCol: 7,
    goalLandingRow: 5,
    explanation:
      "Red jumps over black and lands on the empty square beyond. That is one capture.",
  },
  /* ---------------- Royal Checkers · Medium --------------- */
  {
    slug: "rc-medium-double-jump",
    game: "royal-checkers",
    tier: "medium",
    title: "Double Jump",
    prompt: "Red to move. Chain two jumps in one move.",
    state: rcState([
      "..............",
      "..............",
      "....r.........",
      ".....b........",
      "..............",
      ".....b........",
      "..............",
      "..............",
    ], "r"),
    goalLandingCol: 5,
    goalLandingRow: 7,
    explanation:
      "Jump over the first black man, then continue the same turn over the second — captures are mandatory, and jump chains are a single move.",
  },
  /* ---------------- Royal Checkers · Hard --------------- */
  {
    slug: "rc-hard-seam-triple",
    game: "royal-checkers",
    tier: "hard",
    title: "Seam Triple",
    prompt: "Red to move. Capture three in one combo, using the seam.",
    state: rcState([
      "..............",
      "..............",
      "..............",
      "r.............",
      ".b............",
      "..............",
      ".............b",
      "............b.",
    ], "r"),
    goalLandingCol: 12,
    goalLandingRow: 8,
    explanation:
      "The red man jumps right across the board, wrapping the seam twice to reach three different black men in one combo — crowning on the final landing (row 8) and ending the turn.",
  },
  /* ---------------- Imperial Kings · Easy --------------- */
  {
    slug: "ik-easy-queen-wrap",
    game: "imperial-kings",
    tier: "easy",
    title: "Queen Across the Seam",
    prompt: "White to move. Capture the black rook — the seam helps.",
    state: ikState([
      "....Q.........",
      "..............",
      "..............",
      "..............",
      "..............",
      "..............",
      "..............",
      ".............r",
    ], "w"),
    goalLandingCol: 14,
    goalLandingRow: 8,
    explanation:
      "The queen slides along the main diagonal, wraps through the seam, and captures the rook on col 14, row 8.",
  },
  /* ---------------- Imperial Kings · Easy (kid) --------------- */
  {
    slug: "ik-kid-knight-fork",
    game: "imperial-kings",
    tier: "kid",
    title: "The Knight's L",
    prompt: "White to move. Capture the black pawn with a knight.",
    state: ikState([
      "..............",
      "..............",
      "..............",
      "....N.........",
      "..............",
      "......p.......",
      "..............",
      "..............",
    ], "w"),
    goalLandingCol: 6,
    goalLandingRow: 6,
    explanation:
      "A knight moves in an L — two squares one way, one square sideways. From col 5 row 4, it reaches col 6 row 6.",
  },
  /* ---------------- Imperial Kings · Medium --------------- */
  {
    slug: "ik-medium-double-king",
    game: "imperial-kings",
    tier: "medium",
    title: "Two Kings, Both Yours",
    prompt: "White to move. The win is capturing both black kings — start with the exposed one.",
    state: ikState([
      "..............",
      ".......R......",
      "..............",
      ".......k......",
      "..............",
      "..............",
      "..............",
      "..............",
    ], "w"),
    goalLandingCol: 8,
    goalLandingRow: 4,
    explanation:
      "The rook slides down the file, captures the first king. The second king still stands — but you have taken one of the two your opponent needs to defend.",
  },
  /* ---------------- Imperial Kings · Hard --------------- */
  {
    slug: "ik-hard-seam-mate",
    game: "imperial-kings",
    tier: "hard",
    title: "Seam Attack",
    prompt: "White to move. A bishop uses the seam to end it.",
    state: ikState([
      "..............",
      "..............",
      "..............",
      "..............",
      "..............",
      "..............",
      "k.............",
      ".............B",
    ], "w"),
    goalLandingCol: 1,
    goalLandingRow: 7,
    explanation:
      "The bishop slides diagonally, wraps across the seam from col 14 to col 1, and captures the king at row 7.",
  },
];

export function puzzleBySlug(slug: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.slug === slug);
}
