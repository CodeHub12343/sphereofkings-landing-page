#!/usr/bin/env node
// Builds "Sphere of Kings — Game Design & Implementation Reference.docx".
//
// Typography / palette translated from the brand (gold on dark,
// Cinzel + Inter) to Word-safe equivalents:
//
//   Headings  → Georgia (serif, carries the Cinzel feel)
//   Body text → Calibri (reliable sans-serif, Inter-adjacent)
//   Code      → Consolas
//   Accent    → gold C9A227 / F0C040, red C62B44, muted 8C7A5C

import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel,
  LevelFormat, PageBreak, PageNumber, PageOrientation, Packer, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
  convertInchesToTwip,
} from "docx";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* --------------------------- Palette ------------------------------- */
const GOLD = "C9A227";
const GOLD_LIGHT = "F0C040";
const INK = "1A1510";
const BODY = "2A2218";
const MUTED = "8C7A5C";
const RED = "C62B44";
const BG_DARK_HEX = "0E0C09";
const CODE_BG = "F6F1E4";

/* --------------------------- Helpers ------------------------------- */

const H1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 160 },
    children: [
      new TextRun({
        text, font: "Georgia", size: 44, bold: true, color: GOLD,
        characterSpacing: 20,
      }),
    ],
    border: {
      bottom: { color: GOLD, space: 8, style: BorderStyle.SINGLE, size: 6 },
    },
  });

const H2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 100 },
    children: [new TextRun({ text, font: "Georgia", size: 30, bold: true, color: INK })],
  });

const H3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text, font: "Georgia", size: 24, bold: true, color: BODY })],
  });

const P = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 140, line: 320 },
    alignment: opts.align ?? AlignmentType.LEFT,
    children: [
      new TextRun({ text, font: "Calibri", size: 22, color: BODY, ...opts.run }),
    ],
  });

const RUNS = (parts, opts = {}) =>
  new Paragraph({
    spacing: { after: 140, line: 320 },
    alignment: opts.align ?? AlignmentType.LEFT,
    children: parts.map((p) =>
      typeof p === "string"
        ? new TextRun({ text: p, font: "Calibri", size: 22, color: BODY })
        : new TextRun({ font: "Calibri", size: 22, color: BODY, ...p }),
    ),
  });

const BULLET = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "sok-bullets", level },
    spacing: { after: 80, line: 300 },
    children: [new TextRun({ text, font: "Calibri", size: 22, color: BODY })],
  });

const NUM = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "sok-numbered", level },
    spacing: { after: 80, line: 300 },
    children: [new TextRun({ text, font: "Calibri", size: 22, color: BODY })],
  });

const CODE = (text) =>
  new Paragraph({
    spacing: { before: 80, after: 160 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: CODE_BG },
    border: {
      left: { color: GOLD, space: 6, style: BorderStyle.SINGLE, size: 12 },
      top: { color: "DDD6C2", space: 2, style: BorderStyle.SINGLE, size: 4 },
      right: { color: "DDD6C2", space: 2, style: BorderStyle.SINGLE, size: 4 },
      bottom: { color: "DDD6C2", space: 2, style: BorderStyle.SINGLE, size: 4 },
    },
    children: [
      new TextRun({ text, font: "Consolas", size: 18, color: INK }),
    ],
  });

const CALLOUT = (title, body, tone = GOLD) =>
  new Paragraph({
    spacing: { before: 160, after: 200 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "FBF6E6" },
    border: {
      left: { color: tone, space: 10, style: BorderStyle.SINGLE, size: 18 },
      top: { color: "EFE6CA", space: 4, style: BorderStyle.SINGLE, size: 4 },
      right: { color: "EFE6CA", space: 4, style: BorderStyle.SINGLE, size: 4 },
      bottom: { color: "EFE6CA", space: 4, style: BorderStyle.SINGLE, size: 4 },
    },
    children: [
      new TextRun({
        text: `${title.toUpperCase()}  `, font: "Georgia", size: 18, bold: true,
        color: tone, characterSpacing: 30,
      }),
      new TextRun({ text: body, font: "Calibri", size: 22, color: BODY }),
    ],
  });

const SPACER = (lines = 1) =>
  Array.from({ length: lines }).map(() =>
    new Paragraph({ children: [new TextRun({ text: " ", size: 16 })] }),
  );

const dxa = (n) => n;

const TBL = (headers, rows) => {
  const colWidths = headers.map(() => Math.floor(9000 / headers.length));
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: INK },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: h, font: "Georgia", size: 18, bold: true,
                color: "F5EFD8", characterSpacing: 20,
              }),
            ],
          }),
        ],
      }),
    ),
  });
  const bodyRows = rows.map((row, r) =>
    new TableRow({
      children: row.map((c, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: r % 2 === 0
            ? { type: ShadingType.CLEAR, color: "auto", fill: "FBF7EC" }
            : undefined,
          margins: { top: 90, bottom: 90, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: c, font: "Calibri", size: 20, color: BODY })],
            }),
          ],
        }),
      ),
    }),
  );
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...bodyRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "DDD6C2" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDD6C2" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "DDD6C2" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "DDD6C2" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E8E0C8" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E8E0C8" },
    },
  });
};

/* --------------------------- Cover page ---------------------------- */

const coverEyebrow = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 2400, after: 200 },
  children: [
    new TextRun({
      text: "SPHERE OF KINGS", font: "Georgia", size: 24, bold: true,
      color: GOLD, characterSpacing: 80,
    }),
  ],
});
const coverTitle = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
  children: [
    new TextRun({
      text: "The Game App", font: "Georgia", size: 80, bold: true, color: INK,
    }),
  ],
});
const coverSub = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 180 },
  children: [
    new TextRun({
      text: "Design & Implementation Reference",
      font: "Georgia", size: 36, italics: true, color: BODY,
    }),
  ],
});
const coverRule = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 240, after: 240 },
  border: { bottom: { color: GOLD, space: 1, style: BorderStyle.SINGLE, size: 18 } },
  children: [new TextRun({ text: " ", size: 2 })],
});
const coverMeta = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [
    new TextRun({
      text: "Royal Checkers  ·  Imperial Kings  ·  Spherical Puzzle",
      font: "Calibri", size: 22, color: MUTED,
    }),
  ],
});
const coverDate = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [
    new TextRun({ text: "Grounded in the live codebase · 2026", font: "Calibri", size: 20, color: MUTED, italics: true }),
  ],
});

/* ------------------------------ TOC -------------------------------- */

const TOC_HEAD = H1("Contents");
const TOC_ITEMS = [
  "01  Executive summary",
  "02  Product context & brand",
  "03  The sphere board — topology & conventions",
  "04  Royal Checkers",
  "05  Imperial Kings",
  "06  AI opponents",
  "07  UI surfaces: flat board, 3D sphere, mobile",
  "08  Game modes",
  "09  Accounts & Glicko-2 ranking",
  "10  In-match features",
  "11  Feedback systems — sound, haptics, overlays",
  "12  Accessibility & performance",
  "13  Known gaps & roadmap",
  "14  Code map — where every feature lives",
].map((t) =>
  new Paragraph({
    spacing: { after: 60, line: 320 },
    children: [
      new TextRun({ text: t, font: "Calibri", size: 22, color: BODY }),
    ],
  }),
);

/* ------------------------- 01 Executive summary -------------------- */

const sec01 = [
  H1("01  Executive summary"),
  CALLOUT(
    "In one line",
    "Sphere of Kings is a web-first game app for two reinvented board games — classic checkers and chess, both played on a 14-column cylindrical sphere.",
  ),
  P(
    "The physical product is a magnetic sphere set that unlocks seven game modes. The game app is the digital companion: two of those modes (Royal Checkers and Imperial Kings) are fully implemented as playable games, with AI opponents, online multiplayer, ranked ladder, tournaments, daily puzzles, spectator viewing, and in-match chat.",
  ),
  P(
    "This document is a reference for the game app as it exists in the codebase today. Every claim is grounded in a file you can open. Known gaps are called out plainly — nothing is painted as finished when it is not.",
  ),
  H3("What is actually playable right now"),
  BULLET("Royal Checkers — single-player vs AI, online multiplayer, full rules."),
  BULLET("Imperial Kings — single-player vs AI, online multiplayer, promotion UI, two-king victory condition."),
  BULLET("Puzzle library — tactical positions across both games, difficulty-tiered."),
  BULLET("Tournaments — bracketed play with scheduling and seeding."),
  BULLET("Champions ladder — Glicko-2 ranked across both games."),
  BULLET("Flat board view and a fully playable 3D rotating sphere view, with a toggle on every surface."),
];

/* ------------------------- 02 Brand / product --------------------- */

const sec02 = [
  H1("02  Product context & brand"),
  P(
    "The physical Sphere of Kings 7-in-1 funds through a Kickstarter campaign (launching November 19, 2026). The game app is positioned to run a second, separate Kickstarter — same brand, independent release path, iOS + Android + web.",
  ),
  P(
    "Brand palette: dark background (#0A0806 / #170809), gold trim (#C9A227, #F0C040), crimson accents (#C62B44), ivory type. The physical set is a black-and-white magnetic sphere framed in a gold crown-and-shield motif; the digital surfaces mirror that frame around every board.",
  ),
  H3("Typography"),
  BULLET("Headings: Cinzel (serif, Roman-inscription feel) across every surface."),
  BULLET("Body copy: Inter (geometric sans-serif, high legibility at small sizes)."),
  BULLET("Monospace (code, references): SF Mono / Consolas stack."),
  H3("Visual continuity with the physical product"),
  BULLET("Pure black and white alternating squares — not brown and tan — matching the magnetic pucks."),
  BULLET("Each piece renders with a polished gold bezel ring, matching the magnetic rim on the physical set."),
  BULLET("Gold crown-and-shield frame around every board instance (desktop and mobile)."),
  BULLET("A gold meridian is drawn where columns 14 ↔ 1 meet, marking the sphere's seam even on the flat view."),
];

/* ------------------------- 03 Sphere board ------------------------ */

const sec03 = [
  H1("03  The sphere board — topology & conventions"),
  P(
    "Both games share the same geometry: a 14 × 8 grid wrapped around a cylinder. Columns wrap (column 14 is adjacent to column 1); rows do not wrap (row 1 and row 8 are the two poles). This is the single rule that distinguishes every game on this board from its classical cousin.",
  ),
  CALLOUT(
    "Why 14 columns",
    "The sphere's equator must divide into an even number of alternating light and dark squares with enough per-side pieces for a serious opening. 14 columns gives 7 pawns per side plus a 2-king chess back rank, and lets Royal Checkers scale from 12 pieces per side (standard 8×8 draughts) up to 28.",
  ),
  H3("Coordinates & conventions"),
  BULLET("1-indexed throughout — col ∈ 1..14, row ∈ 1..8."),
  BULLET("A square is dark when (col + row) is odd. Royal Checkers plays on dark squares only."),
  BULLET("Red / White home row is 1; Black home row is 8."),
  BULLET("Column wrap uses modular arithmetic — col 15 → col 1, col 0 → col 14."),
  BULLET("Rows do not wrap. A pawn pushed past row 8 promotes; it cannot roll over to row 1."),
  H3("Rules source of truth"),
  P(
    "Each engine is reference-tested against an owner-signed Markdown rules document. If the engine disagrees with the document, the engine is wrong.",
  ),
  CODE("content/rules/royal-checkers.md     — Royal Checkers (Phase 0 sign-off)\ncontent/rules/imperial-kings.md     — Imperial Kings  (Phase 0 sign-off)\ncontent/rules/other-modes.md        — Physical-only modes & deferral notes"),
  H3("Non-digital modes"),
  P(
    "The physical 7-in-1 ships with five more modes — Spherical Puzzle, DIY Paintable Experience, Custom Sphere Upload, Expanded Sphere Challenges, Creator's Edition. The app ships the puzzle mode (tactical positions) in Phase 2; the other four are physical-only by design and documented as such.",
  ),
];

/* ------------------------- 04 Royal Checkers --------------------- */

const sec04 = [
  H1("04  Royal Checkers"),
  P(
    "Our take on draughts, extended to the sphere. Classic rules otherwise — mandatory captures, multi-jump combos, king promotion with backward movement — layered on a 14-column cylindrical board with 28 pieces per side.",
  ),
  TBL(
    ["Attribute", "Value", "Source"],
    [
      ["Board", "14 × 8 cylinder (dark squares only)", "engine.ts:11-16"],
      ["Pieces per side", "28 (vs 12 in standard draughts)", "rules §2"],
      ["First to move", "Red", "rules §3"],
      ["Win condition", "Opponent has no legal move (no pieces, or all pieces blocked)", "rules §7"],
      ["Captures", "Mandatory. Multi-jumps allowed and preferred where longer.", "rules §5"],
      ["King promotion", "Reach opponent's home row (auto, non-combo)", "rules §9"],
      ["Draw conditions", "50 move rule + 3-fold repetition, Phase 1", "rules §8"],
      ["Seam wrap", "Captures and jumps may cross columns 14 ↔ 1", "ADR-0001"],
    ],
  ),
  H3("Engine shape"),
  P(
    "Pure, deterministic, framework-free. Game state is immutable; every operation returns a fresh value. Rendering, AI, networking and persistence all import from the engine but never touch its internals.",
  ),
  CODE("export interface GameState {\n  board: (Piece | null)[][];   // row-major, [row-1][col-1]\n  toMove: Color;\n  variation: 'standard';\n  halfMoveClock: number;\n  moveNumber: number;\n  history: string[];           // packed state hashes for 3-fold rep\n}\n\nexport function legalMoves(state: GameState): Move[]\nexport function apply(state: GameState, move: Move): GameState\nexport function outcome(state: GameState): Term"),
  H3("Known engine simplifications"),
  BULLET("Only 'standard' variation shipped; owner-noted variations (flying kings, no mandatory capture) are deferred."),
  BULLET("Promotion ends the combo even if more jumps are available with the newly-crowned piece (per rules §12)."),
  H3("UI particulars"),
  BULLET("Red pieces render as crimson metallic pucks with gold bezel; Black as deep-onyx pucks with gold bezel."),
  BULLET("Kings get a gold crown glyph (♛) in the center of the puck."),
  BULLET("Selection: a gold outline on the chosen square."),
  BULLET("Legal destinations highlight as small translucent dots. Capture destinations are red; quiet moves are gold-green."),
  BULLET("The seam between col 14 ↔ col 1 is marked with a dashed gold line on the flat view."),
];

/* ------------------------- 05 Imperial Kings ---------------------- */

const sec05 = [
  H1("05  Imperial Kings"),
  P(
    "Chess, reinvented on the sphere. Standard chess movement rules; the defining twists are the seam-wrapping board and the two-kings victory condition.",
  ),
  TBL(
    ["Attribute", "Value", "Source"],
    [
      ["Board", "14 × 8 cylinder", "engine.ts:19-20"],
      ["Pieces per side", "30 — 2 kings, 2 queens, 4 rooks, 4 bishops, 4 knights, 14 pawns", "rules §2"],
      ["First to move", "White", "rules §4"],
      ["Win condition", "Capture BOTH opposing kings. No check, no checkmate.", "rules §8"],
      ["Pawn promotion", "To queen / rook / bishop / knight on last rank — player's choice", "engine.ts:170-205"],
      ["Castling", "Not shipped in MVP (ADR-0001); planned for Phase 3", "rules §6"],
      ["En passant", "Deferred to Phase 3", "engine.ts:16"],
      ["Seam wrap", "Rooks, bishops, queens slide across the seam; knights jump across it", "ADR-0001"],
    ],
  ),
  H3("Two-king gameplay"),
  P(
    "The game only ends when BOTH opposing kings have been captured. A player may legally make a move that leaves one of their own kings under attack. The opponent must still actually capture it to score the win. This removes the entire concept of \"check\" and \"checkmate\" from the engine.",
  ),
  CALLOUT(
    "Design intent",
    "Two kings turns the end-game into something unlike classical chess. A single trade may leave you with one king and both opponent kings still on the board — you have to be the one to force the second capture.",
  ),
  H3("Promotion UI"),
  P(
    "When a pawn reaches the back rank, the engine emits four candidate Move entries (one per promotion piece). The UI pops a modal with queen / rook / bishop / knight tappable options; the chosen Move is applied like any other move. The sphere view de-dupes the four rings into one so the destination doesn't look like four stacked highlights.",
  ),
  CODE("components/game/PromotionPicker.tsx     — the modal\ncomponents/game/ImperialKingsBoard.tsx    — pendingPromotion state\nlib/games/imperial-kings/engine.ts        — PROMO_KINDS fan-out"),
];

/* ------------------------- 06 AI ---------------------------------- */

const sec06 = [
  H1("06  AI opponents"),
  P(
    "Both games ship a reference-grade AI opponent: minimax with alpha-beta pruning, iterative deepening, and move-ordering heuristics. The AI runs off the main thread via a Web Worker so the UI stays responsive during a long search.",
  ),
  H3("Difficulty"),
  P(
    "A single 1-100 slider drives three dimensions: search depth (2 → 6), noise factor (50% random → 0% random), and allowed thinking time (150ms → 2.8s). Three named presets sit on the slider for quick selection.",
  ),
  TBL(
    ["Preset", "Slider value", "Approx. search depth", "Allowed time"],
    [
      ["Easy", "20", "~2 ply", "~500ms"],
      ["Medium", "55", "~4 ply", "~1.5s"],
      ["Hard", "90", "~6 ply", "~2.5s"],
    ],
  ),
  H3("Implementation"),
  CODE("lib/games/royal-checkers/ai.ts   — RC alpha-beta engine (140 lines)\nlib/games/imperial-kings/ai.ts   — IK alpha-beta engine (112 lines)\nlib/games/ai-worker.ts           — Web Worker boundary (keeps UI thread free)\nlib/games/difficulty.ts          — Slider → tier config (depth/noise/time)\ncomponents/game/useAiWorker.ts    — React hook over the worker"),
  H3("Evaluation functions"),
  P("Material count + simple positional heuristics (centre control, back-rank discipline, pawn structure). Not a trained net — just hand-tuned weights that beat beginners and give intermediate players a credible fight."),
];

/* ------------------------- 07 UI surfaces ------------------------- */

const sec07 = [
  H1("07  UI surfaces — flat board, 3D sphere, mobile"),
  P(
    "Every game has two interchangeable rendering surfaces, with a segmented toggle at the top of each board page:",
  ),
  H3("Flat board (default)"),
  BULLET("2D SVG, viewport-sized at 14 × 8 squares (sqSize = 44px)."),
  BULLET("Pure black-and-white alternating squares, gold-dashed seam markers at left & right edges."),
  BULLET("Piece rendering uses a shared BoardSkin component (SVG defs: gradients + filters) so Royal Checkers pucks and Imperial Kings pieces look visually consistent."),
  BULLET("Mobile: min square size 38px forces horizontal scroll on narrow viewports; a gold \"swipe sideways to see more board\" hint appears below the board; tighter chrome padding reclaims every pixel."),
  BULLET("Pinch-zoom + momentum scrolling are enabled."),
  H3("3D sphere view (toggle)"),
  BULLET("Three.js + React Three Fiber + Drei (all three deps already in the project)."),
  BULLET("Checkered sphere texture generated from a canvas (14 × 8 × 64px squares), wrapped as a CubeTexture."),
  BULLET("Gold band torus at the equator matching the physical frame rail."),
  BULLET("Pieces are segmented 3D meshes — distinct silhouettes per chess kind (king towers with a gold cross, queen sphere crown, rook block top, bishop cone, knight elongated block, pawn small sphere)."),
  BULLET("Selected piece lifts off the surface with a glowing gold torus around its base."),
  BULLET("Legal destinations render as pulsing gold rings; captures as red rings."),
  BULLET("Drag empty space → orbit; tap pieces or rings → play; auto-rotate button in top-right corner (defaults off while playing)."),
  BULLET("Hit-testing uses invisible generous click targets per cell so taps are forgiving."),
  CODE("components/game/BoardSkin.tsx         — shared flat-board SVG primitives\ncomponents/game/SphereBoardView.tsx   — Three.js scene\ncomponents/game/BoardViewToggle.tsx   — Flat / Sphere segmented toggle (dynamic-imports Three)"),
  H3("Mobile UX"),
  P(
    "The flat board uses a horizontal scroll container with a minimum per-square size so the user never has to pinch-zoom to select a piece. On the sphere view, OrbitControls is tuned so single taps are not confused with pan gestures.",
  ),
  H3("App icons & PWA"),
  BULLET("app/icon.tsx — 512 × 512 PNG for Android launcher, generated with next/og at build time."),
  BULLET("app/apple-icon.tsx — 180 × 180 PNG for iOS \"Add to Home Screen\"."),
  BULLET("app/manifest.ts — standalone-display PWA manifest with gold theme color (#C9A227)."),
  BULLET("layout.tsx — openGraph image, Apple web-app hints, viewport theme-color."),
];

/* ------------------------- 08 Modes ------------------------------- */

const sec08 = [
  H1("08  Game modes"),
  H2("Single-player vs AI"),
  BULLET("/play/royal-checkers — play Royal Checkers against the computer."),
  BULLET("/play/imperial-kings — play Imperial Kings against the computer."),
  BULLET("Difficulty slider (1-100), Switch sides button, New game, Undo (snapshots state before each move), Resign (two-step confirm), Clock (optional 10-min per side)."),
  BULLET("Game state auto-saved to localStorage per game slug — resume mid-game across page reloads."),
  H2("Multiplayer (challenger / opponent)"),
  BULLET("/matches — the player's lobby. Three sections: Invites, Active, History."),
  BULLET("Match lifecycle: pending → active → finished | abandoned | declined."),
  BULLET("Challenge created by visiting /u/<username> on another player's profile."),
  BULLET("/match/<id> — live match board. Pusher channel delivers real-time move updates; server does lazy turn-timeout enforcement on next read."),
  BULLET("Turn clock: 2 minutes per move default; auto-abandon on timeout."),
  BULLET("Resign button, Share spectator link button, in-match chat panel."),
  H2("Spectator mode"),
  BULLET("/match/<id>/watch — read-only live view. No sign-in required."),
  BULLET("Spectator sees the live board (same Pusher channel updates), the chat read-only, and a \"Spectator view — read-only\" banner."),
  BULLET("All click handlers are suppressed; the ResignButton is hidden."),
  H2("Daily / weekly puzzles"),
  BULLET("/puzzles — curated feed of tactical positions across both games."),
  BULLET("Difficulty tiers: Beginner → Easy → Medium → Hard."),
  BULLET("Puzzle runs persisted per player; streak tracking lives at the data level (surfacing in UI is a known gap)."),
  BULLET("Puzzles live in Mongo (collection puzzles); seed script scripts/seed-puzzles.mjs uploads the official set."),
  H2("Tournaments"),
  BULLET("/tournaments — list of open brackets."),
  BULLET("/tournaments/<slug> — bracket detail with register button."),
  BULLET("/admin/tournaments — operator creates, seeds, and advances tournaments."),
  BULLET("Match pipeline writes tournamentId / tournamentRoundIdx / tournamentNodeIdx onto completed matches so bracket progression can call back in."),
];

/* ------------------------- 09 Accounts / Glicko ------------------- */

const sec09 = [
  H1("09  Accounts & Glicko-2 ranking"),
  P(
    "Each player has an account with a Glicko-2 rating per game. Guest mode is allowed for single-player games; ranked games require sign-in.",
  ),
  H3("Glicko-2 parameters"),
  TBL(
    ["Parameter", "Default", "Role"],
    [
      ["rating", "1500", "The actual skill estimate."],
      ["deviation (RD)", "350", "Uncertainty — shrinks after each game, grows between games."],
      ["volatility", "0.06", "How reactive the rating is to upsets."],
      ["τ (tau)", "0.5", "System constant — matches typical chess sites."],
      ["period", "1 game", "Launch cadence: each ranked game is its own rating period."],
    ],
  ),
  H3("Where ranked updates happen"),
  BULLET("Single-player games call POST /api/players/ranked-result after each terminal game (win / loss / draw)."),
  BULLET("Response includes the player's new rating and any achievements unlocked."),
  BULLET("Multiplayer updates are triggered by the server when a match transitions to finished."),
  H3("Code map"),
  CODE("lib/games/glicko2.ts                       — the maths (reference Glickman 2012)\napp/api/players/ranked-result/route.ts     — single-player result endpoint\napp/api/players/me/route.ts                — session + current ratings\ncomponents/game/useRankedResult.ts         — React hook that calls into both\napp/champions/page.tsx                     — public leaderboard"),
  H3("Account pages"),
  BULLET("/me — player dashboard: Glicko ratings, win/loss, recent matches."),
  BULLET("/me/designs — custom sphere designs saved by the player."),
  BULLET("/me/inbox — match-related notifications."),
  BULLET("/me/referrals — the player's unique referral link + conversion counters."),
  BULLET("/me/consent — privacy / minor-safety consent controls."),
];

/* ------------------------- 10 In-match features ------------------- */

const sec10 = [
  H1("10  In-match features"),
  H2("Resign (all modes)"),
  P(
    "Two-step ResignButton: first click arms it, second click confirms. Auto-disarms after 4s. In single-player a synthetic win-for-opponent overlays the engine's outcome; in multiplayer the server-side /api/matches/[id]/resign POST does the equivalent and broadcasts a resign event over Pusher.",
  ),
  H2("Pawn promotion (Imperial Kings only)"),
  P(
    "PromotionPicker modal pops when the chosen move has multiple candidate promotions. Four tappable pieces (queen / rook / bishop / knight) with glyph previews. Dismiss returns to the live board without applying anything.",
  ),
  H2("Undo (single-player only)"),
  P(
    "A historyRef snapshot stack records {state, humanColor} before every move. Undo restores the most recent and clears the current selection. Disabled when the game is over or the AI is thinking.",
  ),
  H2("Game clock"),
  P(
    "Optional per-side 10-minute chess clock. Toggleable via a \"Clock: off / 10 min on\" button in the control row. The side whose turn it is counts down; hitting zero \"flags\" that side (treated as a resign). Persists across turn changes; resets on New game.",
  ),
  H2("In-match chat"),
  P(
    "MatchChat panel below the board. Both players send messages; spectators read-only. Messages stored on the match document (last 50 entries). Pusher broadcast on send; 5s polling as fallback. 240-char per-message cap.",
  ),
  CODE("app/api/matches/[id]/chat/route.ts       — POST (send) and GET (read)\ncomponents/game/MatchChat.tsx            — the panel\nlib/db/collections/matches.ts            — MatchChatMessage shape on Match"),
  H2("Share spectator link"),
  P(
    "In an active multiplayer match, the \"Share spectator link\" button copies /match/<id>/watch to the clipboard. Anyone with the link can watch live, no sign-in required.",
  ),
  H2("Post-game modal"),
  P(
    "PostGameModal pops ~450ms after the game ends (long enough that the final move animation reads). Headline tinted gold (win) / red (loss) / muted (draw), optional rating-movement chip, three actions: Rematch, Share, Close. Share uses the Web Share API with clipboard fallback.",
  ),
];

/* ------------------------- 11 Feedback ---------------------------- */

const sec11 = [
  H1("11  Feedback systems — sound, haptics, overlays"),
  H2("Sound effects"),
  P(
    "Procedural WebAudio tones — no CC0 asset download required. All synthesized at play time. Persist a sok.muted flag per browser.",
  ),
  TBL(
    ["Event", "Tone", "Haptic"],
    [
      ["Piece selected", "Soft 880Hz triangle, 30ms", "—"],
      ["Move landed", "Low noise burst + 220Hz sine, 40ms", "10ms vibrate"],
      ["Capture", "Noise + 180Hz sine + 440Hz bell overtone", "18ms vibrate"],
      ["Promotion", "Rising C-E-G arpeggio (triangle)", "10/30/10ms"],
      ["Win", "C-G-C octave fanfare (sawtooth)", "30/60/30/60ms"],
      ["Loss", "Falling A4 → F4 minor cadence (sine)", "60ms"],
      ["Draw", "C-C sine pair, equal spacing", "40ms"],
    ],
  ),
  P(
    "Audio context auto-resumes on the first user gesture. If the user has blocked audio (private mode, iOS Safari with silent switch), haptics still fire. No audio assets are downloaded — the file lib/game-feedback.ts is self-contained and <5 KB.",
  ),
  H2("Haptic feedback"),
  BULLET("navigator.vibrate() API — supported on Android Chrome / Firefox / Samsung Browser; no-op on iOS Safari and desktop."),
  BULLET("Pattern length encodes event weight — longer buzz for a win than for a selection."),
  H2("First-time welcome overlay"),
  P(
    "FirstTimeWelcome component shows once per browser per game slug (localStorage key sok.welcome.v1.<slug>). Three bullet points explaining the cylindrical board, the seam, and the game-specific win condition, plus a mini-board visualization with gold-highlighted seam edges, a primary \"Got it — let me play\" button, and a secondary \"Read the full rules\" link.",
  ),
];

/* ------------------------- 12 Accessibility ----------------------- */

const sec12 = [
  H1("12  Accessibility & performance"),
  H3("What's in place"),
  BULLET("Every button has a visible label; icon-only buttons carry aria-label."),
  BULLET("Dialogs (promotion, welcome, post-game) use role=\"dialog\" aria-modal=\"true\" and dismiss on scrim click or Escape."),
  BULLET("Status text uses role=\"status\" / aria-live=\"polite\" where appropriate."),
  BULLET("Reduced-motion-aware entry animations where meaningful."),
  BULLET("Color contrast: body text on dark meets WCAG AA; gold-on-dark headings meet AA for large text."),
  H3("Known accessibility gaps"),
  BULLET("Screen reader announcement of individual moves / captures is minimal — a reader hears \"button\" per square."),
  BULLET("No full keyboard-navigation story for either flat or sphere board. Tab order follows DOM, which is left-to-right across rows."),
  BULLET("Sphere view is not keyboard-navigable at all; it's a WebGL canvas with pointer input only."),
  BULLET("Haptic patterns are not configurable (user cannot opt out independently of audio mute)."),
  H3("Performance"),
  BULLET("Three.js chunk is dynamically imported from BoardViewToggle, so visitors who never open the sphere view never pay the WebGL bundle cost."),
  BULLET("Sphere scene uses: ~1 sphere geometry (96 × 64 segs), 1 torus for the equator, N × piece groups (max ~60). Performance on sub-$150 Android is untested."),
  BULLET("The flat board SVG re-renders only on state change — React.memo is not needed because the SVG tree is small enough and renders are infrequent."),
];

/* ------------------------- 13 Gaps / roadmap ---------------------- */

const sec13 = [
  H1("13  Known gaps & roadmap"),
  H3("Blockers before a Game App Kickstarter launch"),
  BULLET("Mobile apps (iOS / Android) — the whole app is browser-only. Ships as a PWA with install prompt; native wrappers are the Game App Kickstarter's premise."),
  BULLET("Opponent discovery — the lobby requires the player to already know a username. No matchmaking queue, no \"find a random opponent\" button, no public players directory."),
  BULLET("Push notifications — manifest exists, service worker + Web Push wiring does not."),
  BULLET("Password reset flow — no self-serve path yet."),
  BULLET("Email verification on signup — not required."),
  BULLET("2FA — not available."),
  H3("Game-feel polish backlog"),
  BULLET("Castling in Imperial Kings (deferred to Phase 3; MVP skipped entirely)."),
  BULLET("En passant in Imperial Kings (also Phase 3)."),
  BULLET("Draw-offer flow — only resign is wired; drawing requires both players to run out the clock or get into a legitimate stalemate."),
  BULLET("Reconnect-after-disconnect in multiplayer — Pusher handles the base case but hasn't been battle-tested."),
  BULLET("3D pieces are procedural meshes — manufacturer .glb files would make them photo-real."),
  H3("Content / growth"),
  BULLET("Puzzle library needs expanded content (official set covers common tactical patterns; daily rotation needs ~90 more positions)."),
  BULLET("Tournament bracket progression is admin-triggered; could be automated once at least one tournament runs end-to-end."),
  BULLET("Prize structure for tournaments is undefined."),
  BULLET("Rules documentation is complete but under-linked from inside the game."),
];

/* ------------------------- 14 Code map ---------------------------- */

const sec14 = [
  H1("14  Code map — where every feature lives"),
  P("Grouped by surface area. Paths are relative to /nextjs."),
  H3("Engines & AI"),
  CODE("lib/games/royal-checkers/engine.ts    — rules engine (471 lines)\nlib/games/royal-checkers/ai.ts        — minimax + αβ (140 lines)\nlib/games/imperial-kings/engine.ts    — rules engine (390 lines)\nlib/games/imperial-kings/ai.ts        — minimax + αβ (112 lines)\nlib/games/ai-worker.ts                — Web Worker boundary\nlib/games/difficulty.ts               — slider → tier config\nlib/games/glicko2.ts                  — Glicko-2 rating maths\nlib/games/puzzles/official.ts         — baked-in puzzle set (fallback)"),
  H3("Board rendering"),
  CODE("components/game/BoardSkin.tsx          — SVG primitives (shared)\ncomponents/game/BoardViewToggle.tsx    — Flat ↔ Sphere segmented control\ncomponents/game/SphereBoardView.tsx    — Three.js scene (R3F + Drei)\ncomponents/game/RoyalCheckersBoard.tsx — Royal Checkers single-player board\ncomponents/game/ImperialKingsBoard.tsx — Imperial Kings single-player board\ncomponents/game/MatchBoard.tsx         — multiplayer board (both games)\ncomponents/game/ReplayViewer.tsx       — move-by-move replay"),
  H3("In-match features"),
  CODE("components/game/PromotionPicker.tsx    — pawn-promotion modal\ncomponents/game/ResignButton.tsx       — two-step resign button\ncomponents/game/GameClock.tsx          — per-side chess clock\ncomponents/game/MatchChat.tsx          — in-match chat panel\ncomponents/game/PostGameModal.tsx      — end-of-game modal\ncomponents/game/FirstTimeWelcome.tsx   — one-shot onboarding overlay\nlib/game-feedback.ts                   — procedural sound + haptics\ncomponents/game/useAiWorker.ts         — React hook over the AI worker\ncomponents/game/useMatchStream.ts      — Pusher subscription + refetch\ncomponents/game/useRankedResult.ts     — ranked result reporter"),
  H3("Routes"),
  CODE("app/play/page.tsx                      — game hub (lists all modes)\napp/play/royal-checkers/page.tsx       — single-player RC\napp/play/imperial-kings/page.tsx       — single-player IK\napp/matches/page.tsx                   — multiplayer lobby\napp/match/[id]/page.tsx                — live match\napp/match/[id]/watch/page.tsx          — spectator (read-only)\napp/puzzles/page.tsx                   — puzzle feed\napp/puzzles/[slug]/page.tsx            — solve a puzzle\napp/tournaments/page.tsx               — open tournaments\napp/tournaments/[slug]/page.tsx        — bracket detail\napp/champions/page.tsx                 — Glicko ladder\napp/how-to-play/page.tsx               — rules explainer\napp/me/* and /admin/tournaments/*      — player and operator surfaces"),
  H3("APIs"),
  CODE("app/api/games/royal-checkers/move/route.ts   — single-player AI move request\napp/api/matches/route.ts                      — list / create matches\napp/api/matches/[id]/route.ts                 — get single match\napp/api/matches/[id]/accept/route.ts          — accept or decline invite\napp/api/matches/[id]/move/route.ts            — submit a move\napp/api/matches/[id]/resign/route.ts          — resign\napp/api/matches/[id]/chat/route.ts            — chat GET + POST\napp/api/puzzles/route.ts                      — puzzle index\napp/api/puzzles/[slug]/route.ts               — puzzle detail\napp/api/puzzles/runs/route.ts                 — submit solve\napp/api/tournaments/route.ts                  — tournament index\napp/api/tournaments/[slug]/route.ts           — tournament detail\napp/api/tournaments/[slug]/register/route.ts  — register for bracket\napp/api/players/me/route.ts                   — session + ratings\napp/api/players/ranked-result/route.ts        — single-player result ingest\napp/api/realtime/auth/route.ts                — Pusher channel auth"),
  H3("Data model"),
  CODE("lib/db/collections/matches.ts     — Match, MatchSide, MatchMove, MatchChatMessage\nlib/db/collections/puzzles.ts     — puzzles + puzzleRuns\nlib/db/collections/players.ts     — players + per-game rankings\nlib/db/mongo.ts                   — connection singleton"),
];

/* ------------------------- Closing page --------------------------- */

const closing = [
  H1("Signed off"),
  CALLOUT(
    "What this document is",
    "A living reference. Every statement should be verifiable against the file paths listed in Section 14. If something here contradicts the code, the code is right — update this file.",
  ),
  P(
    "Document maintainer: Santiago (dev); product owner: James Bowser.",
  ),
  P(
    "Rules sign-off: content/rules/royal-checkers.md and content/rules/imperial-kings.md both carry \"Phase 0 sign-off (2026-10-19)\" at the top.",
  ),
  ...SPACER(2),
  P(
    "— End —",
    { align: AlignmentType.CENTER, run: { italics: true, color: MUTED, size: 18 } },
  ),
];

/* ------------------------- Document build ------------------------- */

const doc = new Document({
  creator: "Sphere of Kings",
  title: "Sphere of Kings — Game Design & Implementation Reference",
  description:
    "Design + implementation reference for the Sphere of Kings game app, covering Royal Checkers, Imperial Kings, all modes, surfaces, and known gaps.",
  styles: {
    paragraphStyles: [
      {
        id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal",
        run: { font: "Calibri", size: 22, color: BODY },
        paragraph: { spacing: { line: 320 } },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "sok-bullets",
        levels: [
          {
            level: 0, format: LevelFormat.BULLET, text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 240 } } },
          },
          {
            level: 1, format: LevelFormat.BULLET, text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 240 } } },
          },
        ],
      },
      {
        reference: "sok-numbered",
        levels: [
          {
            level: 0, format: LevelFormat.DECIMAL, text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 240 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Sphere of Kings · Game Design Reference",
                  font: "Georgia", size: 16, color: MUTED, characterSpacing: 20,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Page ", font: "Calibri", size: 16, color: MUTED,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: "Calibri", size: 16, color: MUTED,
                }),
                new TextRun({
                  text: "  of  ", font: "Calibri", size: 16, color: MUTED,
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: "Calibri", size: 16, color: MUTED,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Cover
        coverEyebrow,
        coverTitle,
        coverSub,
        coverRule,
        coverMeta,
        coverDate,
        new Paragraph({ children: [new PageBreak()] }),
        // TOC
        TOC_HEAD,
        ...TOC_ITEMS,
        new Paragraph({ children: [new PageBreak()] }),
        // Sections
        ...sec01, new Paragraph({ children: [new PageBreak()] }),
        ...sec02, new Paragraph({ children: [new PageBreak()] }),
        ...sec03, new Paragraph({ children: [new PageBreak()] }),
        ...sec04, new Paragraph({ children: [new PageBreak()] }),
        ...sec05, new Paragraph({ children: [new PageBreak()] }),
        ...sec06, new Paragraph({ children: [new PageBreak()] }),
        ...sec07, new Paragraph({ children: [new PageBreak()] }),
        ...sec08, new Paragraph({ children: [new PageBreak()] }),
        ...sec09, new Paragraph({ children: [new PageBreak()] }),
        ...sec10, new Paragraph({ children: [new PageBreak()] }),
        ...sec11, new Paragraph({ children: [new PageBreak()] }),
        ...sec12, new Paragraph({ children: [new PageBreak()] }),
        ...sec13, new Paragraph({ children: [new PageBreak()] }),
        ...sec14, new Paragraph({ children: [new PageBreak()] }),
        ...closing,
      ],
    },
  ],
});

const outPath = resolve(
  __dirname,
  "Sphere of Kings — Game Design & Implementation Reference.docx",
);
Packer.toBuffer(doc).then((buf) => {
  writeFileSync(outPath, buf);
  console.log(`wrote: ${outPath}`);
});
