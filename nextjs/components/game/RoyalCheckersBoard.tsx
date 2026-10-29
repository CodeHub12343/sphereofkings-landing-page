"use client";

// 2D projected cylindrical board. The seam between column 14 and
// column 1 is marked with a gold vertical line so the player can see
// where their pieces will wrap.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  COLS,
  ROWS,
  GameState,
  Move,
  Square,
  apply,
  decode,
  encode,
  initial,
  isDark,
  legalMoves,
  outcome,
  pieceAt,
} from "@/lib/games/royal-checkers/engine";
import { Difficulty, PRESETS, clampDifficulty, labelFor } from "@/lib/games/difficulty";
import { useAiWorker } from "./useAiWorker";
import { DifficultySlider } from "./DifficultySlider";
import { useRankedResult } from "./useRankedResult";
import {
  BoardChrome,
  BoardDefs,
  CheckerPiece,
  LegalDot,
  SeamLine,
  Square as SkinSquare,
} from "./BoardSkin";
import BoardViewToggle from "./BoardViewToggle";
import type { SpherePiece } from "./SphereBoardView";
import ResignButton from "./ResignButton";
import FirstTimeWelcome from "./FirstTimeWelcome";
import PostGameModal from "./PostGameModal";
import GameClock from "./GameClock";
import { fx } from "@/lib/game-feedback";

const STORAGE_KEY = "sok.rc.save.v1";

interface SaveSlot {
  state: string;
  difficulty: Difficulty;
  humanColor: "red" | "black";
}

function readSave(): SaveSlot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveSlot;
    if (!parsed.state) return null;
    // Validate by trying to decode.
    decode(parsed.state);
    return parsed;
  } catch {
    return null;
  }
}

function writeSave(slot: SaveSlot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slot));
  } catch {
    // Private mode or quota — accept that the save won't persist.
  }
}

function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default function RoyalCheckersBoard() {
  const [state, setState] = useState<GameState>(() => initial());
  const [difficulty, setDifficulty] = useState<Difficulty>(PRESETS.medium);
  const [humanColor, setHumanColor] = useState<"red" | "black">("red");
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [resigned, setResigned] = useState(false);
  // History stack: snapshots of (state, humanColor) BEFORE each
  // human-initiated move pair. Undo restores the most recent.
  const historyRef = useRef<{ state: GameState; humanColor: "red" | "black" }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [clockOn, setClockOn] = useState(false);
  const [clockKey, setClockKey] = useState(0); // bumps to reset clocks on new game
  const aiBusy = useRef(false);
  const { askMove } = useAiWorker();
  const { me, report, reset: resetRanking, newRating, newAchievements } = useRankedResult("royal-checkers");

  // Hydrate from save on first mount.
  useEffect(() => {
    const saved = readSave();
    if (saved) {
      setState(decode(saved.state));
      setDifficulty(clampDifficulty(saved.difficulty as unknown as number));
      setHumanColor(saved.humanColor);
      setMessage("Resumed your saved game.");
    }
  }, []);

  // Persist on every state change.
  useEffect(() => {
    writeSave({ state: encode(state), difficulty, humanColor });
  }, [state, difficulty, humanColor]);

  // If the player resigned, overlay a synthetic win-for-opponent on
  // whatever the engine thinks.
  const rawTerm = outcome(state);
  const term = resigned
    ? ({ kind: "win", winner: humanColor === "red" ? "black" : "red", reason: "resignation" } as typeof rawTerm)
    : rawTerm;
  const myTurn = state.toMove === humanColor && term.kind === "ongoing";

  useEffect(() => {
    if (term.kind !== "win" && term.kind !== "draw") return;
    const result: "win" | "loss" | "draw" =
      term.kind === "draw" ? "draw" : term.winner === humanColor ? "win" : "loss";
    // Game-over sfx + show the post-game modal.
    fx(result);
    setShowEndModal(true);
    if (!me) return;
    void report(result, difficulty);
  }, [term, me, humanColor, difficulty, report]);

  const legal = useMemo(() => legalMoves(state), [state]);
  const legalBySource = useMemo(() => {
    const map = new Map<string, Move[]>();
    for (const m of legal) {
      const key = `${m.from.col},${m.from.row}`;
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return map;
  }, [legal]);

  const legalForSelected = useMemo(() => {
    if (!selected) return [];
    return legalBySource.get(`${selected.col},${selected.row}`) ?? [];
  }, [selected, legalBySource]);

  // Legal destinations shaped for the sphere view (same geometry as the
  // flat dots). `path` ends at the landing square; captures light up red.
  const sphereLegalDests = useMemo(() => {
    return legalForSelected.map((m) => {
      const land = m.path[m.path.length - 1];
      return { col: land.col, row: land.row, capture: m.captured.length > 0 };
    });
  }, [legalForSelected]);

  // AI turn: pick a move and apply after a small delay for feel.
  useEffect(() => {
    if (term.kind !== "ongoing") return;
    if (state.toMove === humanColor) return;
    if (aiBusy.current) return;
    aiBusy.current = true;
    setThinking(true);
    askMove("rc", encode(state), difficulty)
      .then((r) => setState(decode(r.state)))
      .catch(() => setMessage("Computer could not move."))
      .finally(() => {
        aiBusy.current = false;
        setThinking(false);
      });
  }, [state, humanColor, difficulty, term.kind, askMove]);

  const onSquareClick = useCallback(
    (sq: Square) => {
      if (!myTurn) return;
      // Picking a destination?
      if (selected) {
        const dest = legalForSelected.find((m) => {
          const land = m.path[m.path.length - 1];
          return land.col === sq.col && land.row === sq.row;
        });
        if (dest) {
          // Snapshot for undo BEFORE applying.
          historyRef.current.push({ state, humanColor });
          setCanUndo(true);
          setState((prev) => apply(prev, dest));
          fx(dest.captured.length > 0 ? "capture" : "move");
          setSelected(null);
          setMessage("");
          return;
        }
      }
      // Picking a source?
      const piece = pieceAt(state, sq);
      if (piece && piece.color === humanColor) {
        if (legalBySource.has(`${sq.col},${sq.row}`)) {
          setSelected(sq);
          fx("select");
          setMessage("");
        } else if (legal.some((m) => m.captured.length > 0)) {
          setMessage("Captures are mandatory — pick a jumping piece.");
        } else {
          setMessage("That piece has no legal moves.");
        }
      } else {
        setSelected(null);
      }
    },
    [myTurn, selected, legalForSelected, state, humanColor, legalBySource, legal],
  );

  const newGame = useCallback(() => {
    clearSave();
    setState(initial());
    setSelected(null);
    setMessage("");
    setResigned(false);
    historyRef.current = [];
    setCanUndo(false);
    setShowEndModal(false);
    setClockKey((k) => k + 1);
    resetRanking();
  }, [resetRanking]);

  const undoLast = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    setState(prev.state);
    setHumanColor(prev.humanColor);
    setSelected(null);
    setMessage("Undid last move.");
    setResigned(false);
    setCanUndo(historyRef.current.length > 0);
  }, []);

  const flipSides = useCallback(() => {
    const next = humanColor === "red" ? "black" : "red";
    setHumanColor(next);
    setMessage(`You play ${next === "red" ? "red" : "black"} now.`);
  }, [humanColor]);

  // Build the SVG grid. 14 cols × 8 rows; square size 44 for desktop,
  // responsive-scaled by the SVG viewBox. Red is drawn on rows 1..3,
  // Black on rows 6..8. We flip the Y-axis so row 1 shows at the
  // bottom from Red's perspective by default.
  const sqSize = 44;
  const width = COLS * sqSize;
  const height = ROWS * sqSize;

  // Flatten the board into the piece list the sphere renderer expects.
  const spherePieces: SpherePiece[] = useMemo(() => {
    const out: SpherePiece[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = state.board[r][c];
        if (!p) continue;
        out.push({ col: c + 1, row: r + 1, color: p.color, kind: "checker" });
      }
    }
    return out;
  }, [state.board]);

  const renderRow = humanColor === "red" ? (r: number) => ROWS - r : (r: number) => r - 1;

  return (
    <Wrap>
      <Controls>
        <DifficultySlider value={difficulty} onChange={setDifficulty} />
        <ControlGroup>
          <button onClick={flipSides}>Switch sides</button>
          <button onClick={newGame}>New game</button>
          <button
            onClick={undoLast}
            disabled={!canUndo || thinking || term.kind !== "ongoing"}
            title="Undo your last move (also undoes the computer's reply)"
          >
            Undo
          </button>
          <ResignButton
            disabled={term.kind !== "ongoing"}
            onResign={() => {
              setResigned(true);
              setSelected(null);
              setMessage("");
            }}
          />
          <button
            onClick={() => { setClockOn((v) => !v); setClockKey((k) => k + 1); }}
            title="Toggle a 10-minute per-side chess clock"
            aria-pressed={clockOn}
            style={clockOn ? { borderColor: "#c9a227", color: "#f0c040" } : {}}
          >
            Clock: {clockOn ? "10 min on" : "off"}
          </button>
        </ControlGroup>
      </Controls>
      <Status>
        {term.kind === "win" && (
          <strong>{term.winner === humanColor ? "You win." : "Computer wins."}</strong>
        )}
        {term.kind === "draw" && <strong>Draw — {term.reason}.</strong>}
        {term.kind === "ongoing" && (
          <>
            {thinking ? "Computer is thinking…" : myTurn ? "Your move." : "…"}
            {message && <Hint> {message}</Hint>}
          </>
        )}
        <Tier> · {labelFor(difficulty)} ({difficulty})</Tier>
        {newRating !== null && (
          <RankBadge>Rating now <strong>{newRating}</strong></RankBadge>
        )}
        {newAchievements.length > 0 && (
          <RankBadge>Earned: {newAchievements.join(", ")}</RankBadge>
        )}
      </Status>

      {clockOn && (
        <GameClock
          key={clockKey}
          perSideSeconds={600}
          toMove={state.toMove === "red" ? "a" : "b"}
          running={term.kind === "ongoing"}
          myLabel="You"
          opponentLabel="Computer"
          mySide={humanColor === "red" ? "a" : "b"}
          onFlag={(side) => {
            // Flag → treat as a loss for whoever ran out of time.
            // Easiest: if the flagged side is us, mark resigned; else
            // mark the opposite as resigned (opponent). resigned maps
            // to a win for the OTHER side.
            if (
              (side === "a" && humanColor === "red") ||
              (side === "b" && humanColor === "black")
            ) {
              setResigned(true);
            } else {
              // AI's clock ran out — synthesize a win by resigning for
              // the AI side. We flip humanColor momentarily so the
              // resigned-overlay flips the winner.
              setResigned(true);
              setHumanColor((c) => (c === "red" ? "black" : "red"));
            }
          }}
        />
      )}

      <BoardViewToggle
        cols={COLS}
        rows={ROWS}
        pieces={spherePieces}
        selected={selected}
        legalDests={sphereLegalDests}
        onCellClick={onSquareClick}
      >
      <BoardChrome>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Royal Checkers board"
        >
          <BoardDefs />
          {/* Squares */}
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1;
              const row = rIdx + 1;
              const dark = isDark(col, row);
              const y = renderRow(row) * sqSize;
              const x = cIdx * sqSize;
              const isSelected =
                selected !== null && selected.col === col && selected.row === row;
              const legalDest = legalForSelected.find((m) => {
                const land = m.path[m.path.length - 1];
                return land.col === col && land.row === row;
              });
              return (
                <g key={`${col}-${row}`}>
                  <SkinSquare
                    x={x}
                    y={y}
                    size={sqSize}
                    dark={dark}
                    selected={isSelected}
                    onClick={() => onSquareClick({ col, row })}
                  />
                  {legalDest && (
                    <LegalDot
                      cx={x + sqSize / 2}
                      cy={y + sqSize / 2}
                      size={sqSize}
                      capture={legalDest.captured.length > 0}
                    />
                  )}
                </g>
              );
            }),
          )}

          {/* Seam line between col 14 and col 1 (wraps the cylinder). */}
          <SeamLine x={0} height={height} />
          <SeamLine x={width} height={height} />

          {/* Pieces */}
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1;
              const row = rIdx + 1;
              const piece = state.board[rIdx][cIdx];
              if (!piece) return null;
              const y = renderRow(row) * sqSize + sqSize / 2;
              const x = cIdx * sqSize + sqSize / 2;
              return (
                <CheckerPiece
                  key={`p-${col}-${row}`}
                  cx={x}
                  cy={y}
                  size={sqSize}
                  color={piece.color}
                  king={piece.kind === "king"}
                  onClick={() => onSquareClick({ col, row })}
                />
              );
            }),
          )}
        </svg>
      </BoardChrome>
      </BoardViewToggle>

      <Legend>
        <span><Dot $color="#d8324c" /> Red team (home row 1)</span>
        <span><Dot $color="#1a1510" /> Black team (home row 8)</span>
        <span><SeamSwatch /> Cylinder seam — columns 14 & 1 are neighbours</span>
      </Legend>
      <FirstTimeWelcome gameSlug="royal-checkers" gameName="Royal Checkers" />
      {showEndModal && (term.kind === "win" || term.kind === "draw") && (
        <PostGameModal
          outcome={
            term.kind === "draw"
              ? "draw"
              : term.winner === humanColor
                ? "win"
                : "loss"
          }
          reason={term.reason ?? (term.kind === "draw" ? "No further moves" : "")}
          gameName="Royal Checkers"
          onRematch={() => { newGame(); }}
          onClose={() => setShowEndModal(false)}
          shareText="I just played Royal Checkers on sphereofkings.com — checkers on a spherical board."
          newRating={newRating}
        />
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: var(--text, #f5f0e8);
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
  justify-content: space-between;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;

  label {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    color: var(--text-muted, #a89880);
  }

  select, button {
    background: var(--bg2, #0d0b08);
    color: var(--text, #f5f0e8);
    border: 1px solid var(--border, #2a2218);
    border-radius: 6px;
    padding: 7px 12px;
    font-size: 14px;
    cursor: pointer;
  }
  button:hover, select:hover { border-color: var(--gold, #c9a227); }
`;

const Status = styled.div`
  font-size: 14px;
  color: var(--text, #f5f0e8);
  strong { color: var(--gold-light, #f0c040); }
`;

const Tier = styled.span`color: var(--text-muted, #a89880); font-size: 13px;`;
const RankBadge = styled.span`
  margin-left: 10px; padding: 2px 8px; border-radius: 4px;
  background: rgba(201,162,39,.1); color: var(--gold-light, #f0c040); font-size: 12px;
  strong { font-weight: 700; }
`;

const Hint = styled.span`
  color: var(--text-muted, #a89880);
  margin-left: 8px;
  font-style: italic;
`;

const BoardFrame = styled.div`
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  background: var(--bg2, #0d0b08);
  border: 1px solid var(--border, #2a2218);
  border-radius: 10px;
  padding: 10px;
  overflow-x: auto;

  svg {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  color: var(--text-muted, #a89880);
`;

const Dot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  margin-right: 6px;
  vertical-align: middle;
`;

const SeamSwatch = styled.span`
  display: inline-block;
  width: 14px;
  height: 2px;
  background: var(--board-seam, #f0c040);
  margin-right: 6px;
  vertical-align: middle;
`;
