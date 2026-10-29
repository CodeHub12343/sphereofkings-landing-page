"use client";

// Shared visual skin for the Royal Checkers and Imperial Kings boards.
// Reskins both to match the physical Sphere of Kings product: pure
// black & white alternating squares, metallic magnetic pucks for the
// checkers, chess-piece glyphs with a gold-rimmed base for Imperial
// Kings, a gold crown-and-shield frame around the whole board, and a
// subtle gold glow backdrop.
//
// Nothing in here touches game logic — these are pure render helpers.
// Pass board coordinates and the component emits a styled SVG element
// in-place of the plain primitives the boards used to draw.

import styled from "styled-components";
import type { ReactNode } from "react";

/* --------------------------- Palette ------------------------------- */

export const SKIN = {
  squareLight: "#f1ecde",       // ivory, matches the physical white squares
  squareDark: "#171310",        // deep onyx
  squareDarkStripe: "#1f1813",  // subtle shade for depth
  seam: "#f0c040",              // gold wrap-around seam
  selected: "#f0c040",
  legalMove: "rgba(79, 176, 125, 0.55)",
  captureMove: "rgba(239, 68, 97, 0.6)",
  frame: "#c9a227",
  framePolish: "#f0c040",
  stage: "#0a0806",
};

/* -------------------------- SVG defs ------------------------------- */
/* Gradients / filters used by the pieces. Mount <BoardDefs/> inside
   the <svg> ONCE, then reference the ids below. */

export function BoardDefs() {
  return (
    <defs>
      {/* Light-square inset gradient — faint cream shimmer */}
      <linearGradient id="sok-sq-light" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#faf5e6" />
        <stop offset="100%" stopColor="#e4ddc8" />
      </linearGradient>
      <linearGradient id="sok-sq-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1f1813" />
        <stop offset="100%" stopColor="#0f0b08" />
      </linearGradient>

      {/* Metallic checker puck — "red" team (crimson face) */}
      <radialGradient id="sok-puck-red" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ff8a9c" />
        <stop offset="35%" stopColor="#d8324c" />
        <stop offset="90%" stopColor="#6b1222" />
        <stop offset="100%" stopColor="#3a0810" />
      </radialGradient>
      {/* Metallic checker puck — "black" team */}
      <radialGradient id="sok-puck-black" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#4a3f32" />
        <stop offset="40%" stopColor="#191410" />
        <stop offset="100%" stopColor="#000" />
      </radialGradient>

      {/* Chess-piece team fills */}
      <radialGradient id="sok-chess-white" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#f0e6c6" />
        <stop offset="100%" stopColor="#b7a46d" />
      </radialGradient>
      <radialGradient id="sok-chess-black" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#4a4238" />
        <stop offset="60%" stopColor="#1a1510" />
        <stop offset="100%" stopColor="#000" />
      </radialGradient>

      {/* Chrome bezel ring — polished gold */}
      <linearGradient id="sok-bezel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff2b8" />
        <stop offset="50%" stopColor="#c9a227" />
        <stop offset="100%" stopColor="#8a6f1a" />
      </linearGradient>

      {/* Soft drop shadow for pieces */}
      <filter id="sok-piece-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#000" floodOpacity="0.55" />
      </filter>

      {/* Specular highlight for the gloss arc on each piece */}
      <radialGradient id="sok-gloss" cx="40%" cy="25%" r="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
  );
}

/* -------------------------- Squares -------------------------------- */

export function Square({
  x,
  y,
  size,
  dark,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  size: number;
  dark: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={dark ? "url(#sok-sq-dark)" : "url(#sok-sq-light)"}
      />
      {selected && (
        <rect
          x={x + 1.5}
          y={y + 1.5}
          width={size - 3}
          height={size - 3}
          fill="none"
          stroke={SKIN.selected}
          strokeWidth={2.5}
          rx={2}
        />
      )}
    </g>
  );
}

/* ---------------------- Legal-move dots ---------------------------- */

export function LegalDot({
  cx,
  cy,
  size,
  capture,
}: {
  cx: number;
  cy: number;
  size: number;
  capture?: boolean;
}) {
  if (capture) {
    // Ring, not a dot, so the piece being captured is still readable.
    return (
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.42}
        fill="none"
        stroke={SKIN.captureMove}
        strokeWidth={3}
        pointerEvents="none"
      />
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={size * 0.14}
      fill={SKIN.legalMove}
      pointerEvents="none"
    />
  );
}

/* -------------------- Royal Checkers piece ------------------------- */

export function CheckerPiece({
  cx,
  cy,
  size,
  color,
  king,
  onClick,
}: {
  cx: number;
  cy: number;
  size: number;
  color: "red" | "black";
  king: boolean;
  onClick?: () => void;
}) {
  const r = size * 0.4;
  const bezel = r * 0.92;
  const face = r * 0.78;
  return (
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}
       filter="url(#sok-piece-shadow)">
      {/* Outer gold bezel — the magnetic rim on the physical puck */}
      <circle cx={cx} cy={cy} r={r} fill="url(#sok-bezel)" />
      {/* Face */}
      <circle
        cx={cx}
        cy={cy}
        r={bezel}
        fill={color === "red" ? "url(#sok-puck-red)" : "url(#sok-puck-black)"}
      />
      {/* Inner engraved circle for depth */}
      <circle
        cx={cx}
        cy={cy}
        r={face}
        fill="none"
        stroke={color === "red" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}
        strokeWidth={1}
      />
      {/* Gloss highlight */}
      <ellipse
        cx={cx - r * 0.28}
        cy={cy - r * 0.3}
        rx={r * 0.45}
        ry={r * 0.28}
        fill="url(#sok-gloss)"
        pointerEvents="none"
      />
      {king && (
        <text
          x={cx}
          y={cy + size * 0.11}
          textAnchor="middle"
          fontSize={size * 0.42}
          fill={SKIN.framePolish}
          stroke="#8a6f1a"
          strokeWidth={0.6}
          fontWeight={700}
          pointerEvents="none"
        >
          ♛
        </text>
      )}
    </g>
  );
}

/* ---------------------- Imperial Kings piece ----------------------- */

const CHESS_GLYPH: Record<string, string> = {
  "white-king": "♚",
  "white-queen": "♛",
  "white-rook": "♜",
  "white-bishop": "♝",
  "white-knight": "♞",
  "white-pawn": "♟",
  "black-king": "♚",
  "black-queen": "♛",
  "black-rook": "♜",
  "black-bishop": "♝",
  "black-knight": "♞",
  "black-pawn": "♟",
};

export function ChessPiece({
  cx,
  cy,
  size,
  color,
  kind,
  onClick,
}: {
  cx: number;
  cy: number;
  size: number;
  color: "white" | "black";
  kind: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
  onClick?: () => void;
}) {
  const baseR = size * 0.38;
  const glyph = CHESS_GLYPH[`${color}-${kind}`] ?? "?";
  const fill = color === "white" ? "url(#sok-chess-white)" : "url(#sok-chess-black)";
  const stroke = color === "white" ? "#6b5a3a" : "#000";
  return (
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}
       filter="url(#sok-piece-shadow)">
      {/* Chrome base disc — the magnetic foot */}
      <ellipse
        cx={cx}
        cy={cy + baseR * 0.55}
        rx={baseR * 0.95}
        ry={baseR * 0.3}
        fill="url(#sok-bezel)"
      />
      {/* Piece body — solid colored disc the glyph sits on */}
      <circle cx={cx} cy={cy} r={baseR} fill={fill} />
      {/* Gloss */}
      <ellipse
        cx={cx - baseR * 0.3}
        cy={cy - baseR * 0.3}
        rx={baseR * 0.42}
        ry={baseR * 0.25}
        fill="url(#sok-gloss)"
        pointerEvents="none"
      />
      {/* Glyph itself */}
      <text
        x={cx}
        y={cy + size * 0.14}
        textAnchor="middle"
        fontSize={size * 0.56}
        fill={color === "white" ? "#1a1510" : "#f0e6c6"}
        stroke={stroke}
        strokeWidth={0.5}
        pointerEvents="none"
        style={{ userSelect: "none" }}
      >
        {glyph}
      </text>
    </g>
  );
}

/* -------------------- Seam line (wrap edge) ------------------------- */

export function SeamLine({ x, height }: { x: number; height: number }) {
  return (
    <>
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={SKIN.seam}
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.9}
      />
    </>
  );
}

/* -------------------- Gold crown-and-shield frame ------------------- */

export function BoardChrome({ children }: { children: ReactNode }) {
  return (
    <BoardChromeOuter>
      <div className="sok-board-scroll">{children}</div>
      <div className="sok-pan-hint" aria-hidden="true">
        swipe sideways to see more board
      </div>
    </BoardChromeOuter>
  );
}

const BoardChromeOuter = styled.div`
  position: relative;
  padding: 18px;
  border-radius: 16px;
  background:
    radial-gradient(ellipse 60% 50% at 50% 55%, rgba(240, 192, 64, 0.08), transparent 70%),
    linear-gradient(180deg, #15110c 0%, #0a0806 100%);
  border: 1px solid #2a2218;
  box-shadow:
    0 0 0 2px rgba(201, 162, 39, 0.08) inset,
    0 20px 60px rgba(0, 0, 0, 0.55),
    0 0 40px rgba(240, 192, 64, 0.06);

  /* Mobile: tighten up the padding so the board gets every pixel. */
  @media (max-width: 640px) {
    padding: 10px;
    border-radius: 12px;
  }

  /* Gold frame rail around the actual board */
  &::before {
    content: "";
    position: absolute;
    inset: 10px;
    border-radius: 10px;
    padding: 2px;
    background: linear-gradient(135deg, #8a6f1a 0%, #f0c040 50%, #8a6f1a 100%);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  /* Scrollable board viewport. On wider screens the SVG fits; on phones
     it keeps a minimum per-square size (so pieces stay tappable) and
     scrolls horizontally with native momentum + pinch-zoom. */
  .sok-board-scroll {
    position: relative;
    z-index: 2;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    border-radius: 6px;
    touch-action: pan-x pan-y pinch-zoom;

    /* Hide the scrollbar but keep scroll behavior. */
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb {
      background: rgba(240, 192, 64, 0.25);
      border-radius: 3px;
    }
    scrollbar-color: rgba(240, 192, 64, 0.25) transparent;
    scrollbar-width: thin;
  }

  svg {
    display: block;
    height: auto;
    border-radius: 6px;
    overflow: hidden;
    /* Desktop: fill the available width. */
    width: 100%;
    /* Mobile: force a minimum width so each square stays big enough to
       tap (14 cols × 38px = 532px). Narrower viewports then scroll. */
    @media (max-width: 640px) {
      width: auto;
      min-width: 532px;
    }
  }

  /* Pan hint — only visible on mobile when the board overflows. */
  .sok-pan-hint {
    display: none;
    @media (max-width: 640px) {
      display: block;
      margin-top: 6px;
      text-align: center;
      font-family: "Inter", sans-serif;
      font-size: 11px;
      color: rgba(240, 192, 64, 0.6);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  }
`;
