#!/usr/bin/env node
// Builds the CLIENT-FRIENDLY version of the Sphere of Kings design doc.
// Strips every developer-facing reference (file paths, API endpoints,
// collection names, type signatures, engine internals) so the document
// reads as a product brief suitable for sharing with James / investors
// / Kickstarter backers.

import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel,
  LevelFormat, PageBreak, PageNumber, Packer, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from "docx";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const GOLD = "C9A227";
const INK = "1A1510";
const BODY = "2A2218";
const MUTED = "8C7A5C";

/* --------------------------- Helpers ------------------------------- */

const H1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 160 },
    children: [
      new TextRun({ text, font: "Georgia", size: 44, bold: true, color: GOLD, characterSpacing: 20 }),
    ],
    border: { bottom: { color: GOLD, space: 8, style: BorderStyle.SINGLE, size: 6 } },
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
    children: [new TextRun({ text, font: "Calibri", size: 22, color: BODY, ...opts.run })],
  });

const BULLET = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "sok-bullets", level },
    spacing: { after: 80, line: 300 },
    children: [new TextRun({ text, font: "Calibri", size: 22, color: BODY })],
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
      new TextRun({ text: `${title.toUpperCase()}  `, font: "Georgia", size: 18, bold: true, color: tone, characterSpacing: 30 }),
      new TextRun({ text: body, font: "Calibri", size: 22, color: BODY }),
    ],
  });

const SPACER = (lines = 1) =>
  Array.from({ length: lines }).map(() =>
    new Paragraph({ children: [new TextRun({ text: " ", size: 16 })] }),
  );

const TBL = (headers, rows) => {
  const colWidths = headers.map(() => Math.floor(9000 / headers.length));
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: INK },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: h, font: "Georgia", size: 18, bold: true, color: "F5EFD8", characterSpacing: 20 })] })],
      }),
    ),
  });
  const bodyRows = rows.map((row, r) =>
    new TableRow({
      children: row.map((c, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: r % 2 === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "FBF7EC" } : undefined,
          margins: { top: 90, bottom: 90, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: c, font: "Calibri", size: 20, color: BODY })] })],
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
  children: [new TextRun({ text: "SPHERE OF KINGS", font: "Georgia", size: 24, bold: true, color: GOLD, characterSpacing: 80 })],
});
const coverTitle = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
  children: [new TextRun({ text: "The Game App", font: "Georgia", size: 80, bold: true, color: INK })],
});
const coverSub = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 180 },
  children: [new TextRun({ text: "Product Overview", font: "Georgia", size: 36, italics: true, color: BODY })],
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
  children: [new TextRun({ text: "Royal Checkers  ·  Imperial Kings  ·  Spherical Puzzle", font: "Calibri", size: 22, color: MUTED })],
});
const coverDate = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: "Prepared for James Bowser · 2026", font: "Calibri", size: 20, color: MUTED, italics: true })],
});

/* ------------------------------ TOC -------------------------------- */

const TOC_HEAD = H1("Contents");
const TOC_ITEMS = [
  "01  Overview",
  "02  Brand & experience",
  "03  The sphere board",
  "04  Royal Checkers",
  "05  Imperial Kings",
  "06  Playing against the computer",
  "07  How the game looks — flat board, 3D sphere, mobile",
  "08  Game modes",
  "09  Player accounts & the ranked ladder",
  "10  In-game features",
  "11  Sound, feel, and first impressions",
  "12  What's next",
].map((t) =>
  new Paragraph({
    spacing: { after: 60, line: 320 },
    children: [new TextRun({ text: t, font: "Calibri", size: 22, color: BODY })],
  }),
);

/* ------------------------- 01 Overview ---------------------------- */

const sec01 = [
  H1("01  Overview"),
  CALLOUT(
    "In one line",
    "Sphere of Kings is a game app for two reinvented board games — classic checkers and chess — both played on a 14-column cylindrical sphere.",
  ),
  P("The physical Sphere of Kings 7-in-1 set is a magnetic sphere that unlocks seven game modes. The game app is the digital companion to that set: a web-first experience with mobile apps on the roadmap, built around the same spherical board."),
  P("This document is a product overview of the game app as it stands today. It covers the games themselves, how players access them, and the features that make the experience feel polished."),
  H3("What players can do right now"),
  BULLET("Play Royal Checkers against the computer, with difficulty from Easy to Hard."),
  BULLET("Play Imperial Kings — the chess variant — against the computer."),
  BULLET("Solve a daily tactical puzzle library spanning both games."),
  BULLET("Challenge another player to an online match and chat with them during the game."),
  BULLET("Enter tournaments with bracket play."),
  BULLET("Climb a ranked ladder shared across both games."),
  BULLET("Choose between a classic flat board view and a fully-playable 3D rotating sphere."),
];

/* ------------------------- 02 Brand ------------------------------- */

const sec02 = [
  H1("02  Brand & experience"),
  P("Every surface in the game app mirrors the physical product. The same gold-trim-on-dark palette carries through from the Kickstarter crown-and-shield logo into every button, every board edge, and every piece on the board."),
  H3("What that looks like in practice"),
  BULLET("Pure black and white alternating squares matching the magnetic pucks."),
  BULLET("Every piece renders with a polished gold bezel ring, mirroring the magnetic rim on the physical set."),
  BULLET("A gold crown-and-shield frame around every board."),
  BULLET("A visible gold meridian marks where columns 14 and 1 meet, so players immediately understand the board wraps around."),
  BULLET("Headings use the Cinzel serif (Roman-inscription feel); body copy uses Inter (clean, modern sans-serif)."),
  CALLOUT(
    "Design intent",
    "Backers who have seen the physical set recognise the digital version instantly. The two products feel like one brand even though they ship separately.",
  ),
];

/* ------------------------- 03 Sphere board ------------------------ */

const sec03 = [
  H1("03  The sphere board"),
  P("Both games share the same geometry: a 14-column by 8-row grid wrapped around a cylinder. Columns wrap — column 14 is the neighbour of column 1. Rows do not wrap. This single twist is what makes every game on this board different from its classical cousin."),
  CALLOUT(
    "Why 14 columns",
    "The sphere's equator must divide into an even number of alternating light and dark squares with enough per-side pieces for a serious opening. 14 columns gives 7 pawns per side plus a 2-king chess back rank, and lets Royal Checkers scale from 12 pieces per side (standard 8×8 draughts) up to 28.",
  ),
  H3("How players experience the seam"),
  BULLET("A pawn pushed along the far edge of the board wraps around and attacks pieces on the near edge."),
  BULLET("A rook can start on column 1 and slide left all the way around to come back to its own starting square."),
  BULLET("A checker piece on column 14 can jump a defender into column 1 as if the two were adjacent."),
  P("The flat board view marks this seam with a gold dashed line so new players see it at a glance. The 3D sphere view makes it obvious — there is no seam, because the board really does wrap."),
];

/* ------------------------- 04 Royal Checkers --------------------- */

const sec04 = [
  H1("04  Royal Checkers"),
  P("Our take on draughts, extended to the sphere. Classic rules — mandatory captures, multi-jump combos, king promotion with backward movement — layered on a 14-column cylindrical board with 28 pieces per side."),
  TBL(
    ["Attribute", "Value"],
    [
      ["Board", "14 columns by 8 rows (cylinder)"],
      ["Pieces per side", "28 (standard draughts is 12)"],
      ["First to move", "Red"],
      ["Winning", "The opponent runs out of legal moves"],
      ["Captures", "Mandatory. Longer multi-jump combos win out over shorter ones."],
      ["King promotion", "Automatic when a piece reaches the opponent's home row"],
      ["Seam wrap", "Captures and jumps may cross the sphere's seam"],
    ],
  ),
  H3("What it feels like to play"),
  BULLET("Red pieces are crimson metallic pucks with gold rims. Black pieces are deep onyx with gold rims. Kings get a crown glyph in the centre."),
  BULLET("Selecting a piece highlights it in gold. Legal destinations light up as small markers — capture squares in red, quiet moves in green."),
  BULLET("Every move plays a soft wood-knock sound. Captures play a brighter knock with a bell overtone."),
  BULLET("The entire game autosaves to the browser so a player can close the tab mid-game and resume later."),
];

/* ------------------------- 05 Imperial Kings ---------------------- */

const sec05 = [
  H1("05  Imperial Kings"),
  P("Chess, reinvented on the sphere. Standard chess movement rules; the defining twists are the wrap-around board and the two-kings victory condition."),
  TBL(
    ["Attribute", "Value"],
    [
      ["Board", "14 columns by 8 rows (cylinder)"],
      ["Pieces per side", "30 — 2 kings, 2 queens, 4 rooks, 4 bishops, 4 knights, 14 pawns"],
      ["First to move", "White"],
      ["Winning", "Capture BOTH opposing kings. No check, no checkmate."],
      ["Pawn promotion", "Player picks queen, rook, bishop, or knight on the back rank"],
      ["Seam wrap", "Rook, bishop, and queen slides wrap around the sphere; knights jump across it"],
    ],
  ),
  H3("Two-king gameplay"),
  P("The game only ends when BOTH opposing kings have been captured. A player may legally make a move that leaves one of their own kings under attack. The opponent must still actually capture it to score the win. This removes the entire concept of \"check\" and \"checkmate\" from the game."),
  CALLOUT(
    "Design intent",
    "Two kings turns the end-game into something unlike classical chess. A single trade may leave you with one king and both opponent kings still on the board — you have to be the one to force the second capture.",
  ),
  H3("Promotion"),
  P("When a pawn reaches the back rank, a modal pops up offering queen, rook, bishop, or knight. The player taps the piece they want and the move applies. On the 3D sphere view, the same choice appears cleanly without obscuring the live board."),
];

/* ------------------------- 06 AI ---------------------------------- */

const sec06 = [
  H1("06  Playing against the computer"),
  P("Both games ship with a strong computer opponent. The player picks the difficulty from a single slider — Easy, Medium, or Hard — and the computer adjusts its depth of calculation, how often it makes random mistakes, and how long it thinks per move."),
  TBL(
    ["Difficulty", "Approximate style"],
    [
      ["Easy", "Thinks a couple of moves ahead. Makes occasional random choices. Great for beginners and children."],
      ["Medium", "Thinks four moves ahead. Beats casual players reliably."],
      ["Hard", "Thinks six moves ahead with no random mistakes. A credible fight for serious players."],
    ],
  ),
  P("The computer runs on a background worker so the board stays responsive even while it's thinking. Players see a quiet \"Computer is thinking…\" status instead of a frozen screen."),
];

/* ------------------------- 07 UI surfaces ------------------------- */

const sec07 = [
  H1("07  How the game looks — flat board, 3D sphere, mobile"),
  P("Every game has two interchangeable views, with a toggle at the top of each board. Players switch between them freely at any point in a game."),
  H3("Flat board"),
  BULLET("The default view. Classic black-and-white alternating squares."),
  BULLET("Pieces render with the premium metallic look that matches the physical set."),
  BULLET("Legal moves highlight as the player selects a piece."),
  BULLET("Gold-dashed markers show the sphere's seam on the left and right edges."),
  H3("3D sphere"),
  BULLET("The entire board wrapped around a rotating sphere, exactly like the physical product."),
  BULLET("A gold band runs around the equator matching the physical frame."),
  BULLET("Pieces are three-dimensional — chess kings tower above pawns with a gold cross on top; checkers pucks have a chamfered gold rim."),
  BULLET("Selecting a piece lifts it off the surface with a glowing gold ring."),
  BULLET("Legal destinations pulse as gold rings; captures appear as red rings."),
  BULLET("Players drag to rotate the sphere, pinch to zoom, and can toggle an auto-rotate button to show the board off."),
  BULLET("The 3D view is fully playable, not just a preview — players make moves directly on the sphere."),
  H3("Mobile"),
  BULLET("Boards remain the proper size on phones — pieces stay large enough to tap comfortably."),
  BULLET("A gold hint beneath the board invites the player to swipe sideways to see the full 14-column width."),
  BULLET("Pinch-zoom and smooth momentum scrolling make the touch experience feel native."),
  BULLET("When added to the home screen, the app launches in standalone mode with the Sphere of Kings crown-and-shield icon."),
];

/* ------------------------- 08 Modes ------------------------------- */

const sec08 = [
  H1("08  Game modes"),
  H2("Playing solo"),
  P("Open any game from the main menu, pick a difficulty, and start playing. No account required. The game saves to the browser so the player can resume later. A control row offers Switch sides, New game, Undo last move, Resign, and an optional 10-minute per-side chess clock."),
  H2("Online multiplayer"),
  P("Players sign in, open another player's profile, and send a challenge. The invitee sees it in their lobby, accepts (or declines), and both players land in a live match. Moves sync in real time. There's a 2-minute turn clock to keep abandoned games from clogging the system."),
  H2("Spectator mode"),
  P("During any live match, players can share a special spectator link. Anyone with the link can watch the game live without signing in. Spectators see every move land but cannot click, chat, or interrupt."),
  H2("Daily puzzles"),
  P("A curated feed of tactical positions across both games, grouped by difficulty from Beginner to Hard. Players work through them to sharpen specific skills."),
  H2("Tournaments"),
  P("Bracketed play with scheduling and seeding. Players register for an open tournament; the system pairs them, schedules their matches, and advances winners through the bracket."),
];

/* ------------------------- 09 Accounts / Glicko ------------------- */

const sec09 = [
  H1("09  Player accounts & the ranked ladder"),
  P("Players sign up with an email, pick a username, and get a profile. From there they can track their matches, their rating, and their history. Playing against the computer works without an account, but ranked matches require sign-in so results can count toward the ladder."),
  H3("The rating system"),
  P("The game uses Glicko-2 — the same ranking system used by Chess.com and Lichess. It gives every player a rating that moves up or down after each game, weighted by how uncertain the system is about their skill. New players climb (or fall) quickly; established players move more slowly."),
  BULLET("Every new player starts at a rating of 1500."),
  BULLET("A win against a higher-rated player moves the rating up more than a win against a lower-rated player."),
  BULLET("A single rating ladder spans both games, so a top player must be strong at both to lead the Champions page."),
  H3("The Champions page"),
  P("A public leaderboard at /champions showing the top players by rating. Each row shows their name, their current rating, and their recent form."),
];

/* ------------------------- 10 In-match features ------------------- */

const sec10 = [
  H1("10  In-game features"),
  H2("Resign"),
  P("A two-step button so a stray tap doesn't throw a game away. First click arms it; second click confirms. In an online match, resigning ends the game cleanly for both players."),
  H2("Undo (single-player)"),
  P("In solo games, players can undo their last move — useful for casual players recovering from a mis-tap. Not available in ranked online matches."),
  H2("Game clock"),
  P("An optional 10-minute per side chess clock. Players turn it on with a toggle; whichever side's turn it is counts down. The clock treats a flagged side as a resign."),
  H2("In-match chat"),
  P("A chat panel below the board. Both players send short messages during the game. Spectators see the chat read-only. Chat stays with the match for its lifetime."),
  H2("Share spectator link"),
  P("Any active match offers a one-click way to copy a shareable spectator URL. Great for showing off a tight finish or getting a friend to watch."),
  H2("End-of-game modal"),
  P("When a game ends, a modal pops up with the result — Victory, Defeat, or Draw — the reason, a rating-change indicator (for ranked games), and three buttons: Rematch, Share, and Close."),
];

/* ------------------------- 11 Feedback ---------------------------- */

const sec11 = [
  H1("11  Sound, feel, and first impressions"),
  H2("Sound effects"),
  P("Every important moment has a sound. Selecting a piece plays a soft tap. Moving a piece plays a wood-knock. Capturing an opponent plays a louder knock with a brass bell overtone. Winning a game plays a short trumpet fanfare; losing plays a short falling cadence. Players can mute from the settings menu — the preference is remembered."),
  H2("Haptic feedback on mobile"),
  P("On phones that support it, every move produces a subtle vibration — a quick tick on a move, a slightly longer one on a capture, a short pattern on a win. Nothing jarring; nothing that drains the battery."),
  H2("First-time welcome"),
  P("New players to each game see a one-shot welcome overlay that explains the three things that make the sphere different from a classic board — the cylinder, the seam, and the game-specific win condition — with a mini board visualising the seam. One tap and it's dismissed; it never shows again for that player."),
];

/* ------------------------- 12 What's next ------------------------- */

const sec12 = [
  H1("12  What's next"),
  P("The web experience is in place and playable today. The next phase is the Game App Kickstarter, which funds the pieces that turn this from a browser game into a product people install:"),
  H3("Native mobile apps"),
  BULLET("iOS and Android apps, published to the App Store and Google Play."),
  BULLET("Shared accounts and ladder across web, iOS, and Android."),
  BULLET("Push notifications: \"Your opponent moved\", \"Tournament starting\", etc."),
  H3("Social & community"),
  BULLET("Opponent matchmaking — a \"find me a game\" button that pairs players automatically."),
  BULLET("A public players directory so new sign-ups can find opponents."),
  BULLET("Spectator chat on live matches."),
  H3("Expanded game content"),
  BULLET("A fuller puzzle library — enough positions for a fresh daily puzzle every day for a year."),
  BULLET("Rotating weekly tournaments with real prize structure."),
  BULLET("Advanced chess rules — castling and en passant on the sphere (deliberately deferred from the first version to keep the launch focused)."),
  P(
    "Everything above sits in a prioritised backlog. The Game App Kickstarter funds the native apps and matchmaking first, with the social and content expansions following in a published roadmap.",
    { run: { italics: true, color: MUTED } },
  ),
];

/* ------------------------- Closing page --------------------------- */

const closing = [
  H1("Signed off"),
  P("Prepared by Santiago for James Bowser."),
  P("The rules for both games are owner-signed, dated 2026-10-19. The engines behind each game are reference-tested against those rules documents."),
  ...SPACER(2),
  P("— End —", { align: AlignmentType.CENTER, run: { italics: true, color: MUTED, size: 18 } }),
];

/* ------------------------- Document build ------------------------- */

const doc = new Document({
  creator: "Sphere of Kings",
  title: "Sphere of Kings — The Game App — Product Overview",
  description: "Product overview of the Sphere of Kings game app for the Game App Kickstarter.",
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
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 240 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 240 } } } },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
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
                  text: "Sphere of Kings · The Game App",
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
                new TextRun({ text: "Page ", font: "Calibri", size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: MUTED }),
                new TextRun({ text: "  of  ", font: "Calibri", size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 16, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      children: [
        coverEyebrow, coverTitle, coverSub, coverRule, coverMeta, coverDate,
        new Paragraph({ children: [new PageBreak()] }),
        TOC_HEAD, ...TOC_ITEMS,
        new Paragraph({ children: [new PageBreak()] }),
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
        ...closing,
      ],
    },
  ],
});

const outPath = resolve(
  __dirname,
  "Sphere of Kings — The Game App — Product Overview.docx",
);
Packer.toBuffer(doc).then((buf) => {
  writeFileSync(outPath, buf);
  console.log(`wrote: ${outPath}`);
});
