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
  const aiBusy = useRef(false);
  const { askMove } = useAiWorker();

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

  const term = outcome(state);
  const myTurn = state.toMove === humanColor && term.kind === "ongoing";

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
          setState((prev) => apply(prev, dest));
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

  const renderRow = humanColor === "red" ? (r: number) => ROWS - r : (r: number) => r - 1;

  return (
    <Wrap>
      <Controls>
        <DifficultySlider value={difficulty} onChange={setDifficulty} />
        <ControlGroup>
          <button onClick={flipSides}>Switch sides</button>
          <button onClick={newGame}>New game</button>
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
      </Status>

      <BoardFrame>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Royal Checkers board"
        >
          {/* Squares */}
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1;
              const row = rIdx + 1;
              const dark = isDark(col, row);
              const y = renderRow(row) * sqSize;
              const x = cIdx * sqSize;
              const isSelected =
                selected && selected.col === col && selected.row === row;
              const legalDest = legalForSelected.find((m) => {
                const land = m.path[m.path.length - 1];
                return land.col === col && land.row === row;
              });
              return (
                <g key={`${col}-${row}`}>
                  <rect
                    x={x}
                    y={y}
                    width={sqSize}
                    height={sqSize}
                    fill={dark ? "var(--board-dark, #2b2210)" : "var(--board-light, #f3e1a7)"}
                    stroke={isSelected ? "var(--board-seam, #f0c040)" : "none"}
                    strokeWidth={isSelected ? 3 : 0}
                    onClick={() => onSquareClick({ col, row })}
                    style={{ cursor: dark ? "pointer" : "default" }}
                  />
                  {legalDest && (
                    <circle
                      cx={x + sqSize / 2}
                      cy={y + sqSize / 2}
                      r={8}
                      fill={
                        legalDest.captured.length > 0
                          ? "var(--board-capture-move, rgba(198,43,68,0.45))"
                          : "var(--board-legal-move, rgba(79,176,125,0.45))"
                      }
                      pointerEvents="none"
                    />
                  )}
                </g>
              );
            }),
          )}

          {/* Seam line between col 14 and col 1 (wraps the cylinder). */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={height}
            stroke="var(--board-seam, #f0c040)"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <line
            x1={width}
            y1={0}
            x2={width}
            y2={height}
            stroke="var(--board-seam, #f0c040)"
            strokeWidth={2}
            strokeDasharray="4 4"
          />

          {/* Pieces */}
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1;
              const row = rIdx + 1;
              const piece = state.board[rIdx][cIdx];
              if (!piece) return null;
              const y = renderRow(row) * sqSize + sqSize / 2;
              const x = cIdx * sqSize + sqSize / 2;
              const fill =
                piece.color === "red"
                  ? "var(--piece-red, #c62b44)"
                  : "var(--piece-black, #1a1510)";
              const stroke =
                piece.color === "red"
                  ? "var(--piece-red-stroke, #8a1420)"
                  : "var(--piece-black-stroke, #000)";
              return (
                <g key={`p-${col}-${row}`} onClick={() => onSquareClick({ col, row })}
                   style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r={sqSize * 0.38} fill={fill} stroke={stroke} strokeWidth={2} />
                  {piece.kind === "king" && (
                    <text
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      fontSize={16}
                      fill="var(--king-crown, #f0c040)"
                      fontWeight={700}
                      pointerEvents="none"
                    >
                      ♔
                    </text>
                  )}
                </g>
              );
            }),
          )}
        </svg>
      </BoardFrame>

      <Legend>
        <span><Dot $color="var(--piece-red, #c62b44)" /> Red (home row 1)</span>
        <span><Dot $color="var(--piece-black, #1a1510)" /> Black (home row 8)</span>
        <span><SeamSwatch /> Cylinder seam — columns 14 & 1 are neighbours</span>
      </Legend>
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
