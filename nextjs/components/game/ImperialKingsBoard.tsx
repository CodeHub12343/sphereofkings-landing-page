"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  COLS, ROWS, GameState, Move, Square,
  apply, decode, encode, initial, legalMoves, outcome, pieceAt,
} from "@/lib/games/imperial-kings/engine";
import { Difficulty, PRESETS, clampDifficulty, labelFor } from "@/lib/games/difficulty";
import { useAiWorker } from "./useAiWorker";
import { DifficultySlider } from "./DifficultySlider";
import { useRankedResult } from "./useRankedResult";

const STORAGE_KEY = "sok.ik.save.v1";
interface Save { state: string; difficulty: Difficulty; humanColor: "white" | "black"; }

const GLYPH: Record<string, string> = {
  "white-pawn": "♙", "white-knight": "♘", "white-bishop": "♗",
  "white-rook": "♖", "white-queen": "♕", "white-king": "♔",
  "black-pawn": "♟", "black-knight": "♞", "black-bishop": "♝",
  "black-rook": "♜", "black-queen": "♛", "black-king": "♚",
};

export default function ImperialKingsBoard() {
  const [state, setState] = useState<GameState>(() => initial());
  const [difficulty, setDifficulty] = useState<Difficulty>(PRESETS.medium);
  const [humanColor, setHumanColor] = useState<"white" | "black">("white");
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [message, setMessage] = useState("");
  const { askMove } = useAiWorker();
  const aiBusy = useRef(false);
  const { me, report, reset: resetRanking, newRating, newAchievements } = useRankedResult("imperial-kings");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Save;
      setState(decode(parsed.state));
      setDifficulty(clampDifficulty(parsed.difficulty));
      setHumanColor(parsed.humanColor);
      setMessage("Resumed your saved game.");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        state: encode(state), difficulty, humanColor,
      } satisfies Save));
    } catch {}
  }, [state, difficulty, humanColor]);

  const term = outcome(state);
  const myTurn = state.toMove === humanColor && term.kind === "ongoing";
  const legal = useMemo(() => legalMoves(state), [state]);

  useEffect(() => {
    if (term.kind !== "win" && term.kind !== "draw") return;
    if (!me) return;
    const result: "win" | "loss" | "draw" =
      term.kind === "draw" ? "draw" : term.winner === humanColor ? "win" : "loss";
    void report(result, difficulty);
  }, [term, me, humanColor, difficulty, report]);

  const legalBySource = useMemo(() => {
    const m = new Map<string, Move[]>();
    for (const mv of legal) {
      const k = `${mv.from.col},${mv.from.row}`;
      const arr = m.get(k) ?? [];
      arr.push(mv);
      m.set(k, arr);
    }
    return m;
  }, [legal]);

  const legalForSelected = useMemo(() =>
    selected ? legalBySource.get(`${selected.col},${selected.row}`) ?? [] : [],
    [selected, legalBySource],
  );

  useEffect(() => {
    if (term.kind !== "ongoing") return;
    if (state.toMove === humanColor) return;
    if (aiBusy.current) return;
    aiBusy.current = true;
    setThinking(true);
    askMove("ik", encode(state), difficulty)
      .then((r) => setState(decode(r.state)))
      .catch(() => setMessage("Computer could not move."))
      .finally(() => {
        aiBusy.current = false;
        setThinking(false);
      });
  }, [state, humanColor, difficulty, term.kind, askMove]);

  const onSquareClick = useCallback((sq: Square) => {
    if (!myTurn) return;
    if (selected) {
      const dest = legalForSelected.find((m) => m.to.col === sq.col && m.to.row === sq.row);
      if (dest) {
        setState((p) => apply(p, dest));
        setSelected(null); setMessage("");
        return;
      }
    }
    const p = pieceAt(state, sq);
    if (p && p.color === humanColor) {
      if (legalBySource.has(`${sq.col},${sq.row}`)) {
        setSelected(sq);
      } else {
        setMessage("That piece has no legal moves.");
      }
    } else {
      setSelected(null);
    }
  }, [myTurn, selected, legalForSelected, state, humanColor, legalBySource]);

  const newGame = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setState(initial()); setSelected(null); setMessage("");
    resetRanking();
  }, [resetRanking]);

  const sqSize = 44;
  const width = COLS * sqSize;
  const height = ROWS * sqSize;
  const renderRow = humanColor === "white" ? (r: number) => ROWS - r : (r: number) => r - 1;

  return (
    <Wrap>
      <TopRow>
        <DifficultySlider value={difficulty} onChange={setDifficulty} />
        <Buttons>
          <button onClick={() => setHumanColor(humanColor === "white" ? "black" : "white")}>
            Switch sides
          </button>
          <button onClick={newGame}>New game</button>
        </Buttons>
      </TopRow>
      <Status>
        {term.kind === "win" && (
          <strong>
            {term.winner === humanColor ? "You win" : "Computer wins"} — {term.reason}.
          </strong>
        )}
        {term.kind === "draw" && <strong>Draw — {term.reason}.</strong>}
        {term.kind === "ongoing" && (
          <>
            {thinking ? "Computer is thinking…" : myTurn ? "Your move." : "…"}
            {message && <Hint> {message}</Hint>}
          </>
        )}
        <Tier>Difficulty: {labelFor(difficulty)} ({difficulty})</Tier>
        {newRating !== null && (
          <RankBadge>Rating now <strong>{newRating}</strong></RankBadge>
        )}
        {newAchievements.length > 0 && (
          <RankBadge>Earned: {newAchievements.join(", ")}</RankBadge>
        )}
      </Status>

      <BoardFrame>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
             role="img" aria-label="Imperial Kings board">
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1; const row = rIdx + 1;
              const light = (col + row) % 2 === 0;
              const x = cIdx * sqSize; const y = renderRow(row) * sqSize;
              const isSel = selected && selected.col === col && selected.row === row;
              const dest = legalForSelected.find((m) => m.to.col === col && m.to.row === row);
              return (
                <g key={`${col}-${row}`}>
                  <rect x={x} y={y} width={sqSize} height={sqSize}
                        fill={light ? "var(--board-light,#f3e1a7)" : "var(--board-dark,#2b2210)"}
                        stroke={isSel ? "var(--board-seam,#f0c040)" : "none"}
                        strokeWidth={isSel ? 3 : 0}
                        onClick={() => onSquareClick({ col, row })}
                        style={{ cursor: "pointer" }} />
                  {dest && (
                    <circle cx={x + sqSize / 2} cy={y + sqSize / 2} r={8}
                            fill={dest.captured
                              ? "var(--board-capture-move,rgba(198,43,68,0.45))"
                              : "var(--board-legal-move,rgba(79,176,125,0.45))"}
                            pointerEvents="none" />
                  )}
                </g>
              );
            }),
          )}
          <line x1={0} y1={0} x2={0} y2={height}
                stroke="var(--board-seam,#f0c040)" strokeWidth={2} strokeDasharray="4 4" />
          <line x1={width} y1={0} x2={width} y2={height}
                stroke="var(--board-seam,#f0c040)" strokeWidth={2} strokeDasharray="4 4" />
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1; const row = rIdx + 1;
              const p = state.board[rIdx][cIdx];
              if (!p) return null;
              const x = cIdx * sqSize + sqSize / 2;
              const y = renderRow(row) * sqSize + sqSize / 2 + 11;
              const glyph = GLYPH[`${p.color}-${p.kind}`] ?? "?";
              return (
                <text key={`p-${col}-${row}`} x={x} y={y} textAnchor="middle"
                      fontSize={30}
                      fill={p.color === "white" ? "var(--piece-white,#f5efd8)" : "var(--piece-black,#1a1510)"}
                      stroke={p.color === "white" ? "var(--piece-white-stroke,#b8901e)" : "var(--piece-black-stroke,#000)"}
                      strokeWidth={0.6}
                      onClick={() => onSquareClick({ col, row })}
                      style={{ cursor: "pointer", userSelect: "none" }}>
                  {glyph}
                </text>
              );
            }),
          )}
        </svg>
      </BoardFrame>
      <Legend>
        <span><Dot $color="var(--piece-white,#f5efd8)" /> White (home rows 1–3)</span>
        <span><Dot $color="var(--piece-black,#1a1510)" /> Black (home rows 6–8)</span>
        <span><SeamSwatch /> Seam — slides and knight-jumps wrap</span>
        <span>Win: capture both opponent kings</span>
      </Legend>
    </Wrap>
  );
}

const Wrap = styled.div`display:flex;flex-direction:column;gap:14px;color:var(--text,#f5f0e8);`;
const TopRow = styled.div`display:flex;flex-wrap:wrap;gap:14px 20px;align-items:center;justify-content:space-between;`;
const Buttons = styled.div`
  display:flex;gap:10px;
  button{background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);border:1px solid var(--border,#2a2218);
    border-radius:6px;padding:7px 12px;font-size:14px;cursor:pointer;}
  button:hover{border-color:var(--gold,#c9a227);}
`;
const Status = styled.div`font-size:14px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;
  strong{color:var(--gold-light,#f0c040);}`;
const Tier = styled.span`color:var(--text-muted,#a89880);font-size:13px;`;
const RankBadge = styled.span`
  padding:2px 8px;border-radius:4px;background:rgba(201,162,39,.1);
  color:var(--gold-light,#f0c040);font-size:12px;
  strong{font-weight:700;}
`;
const Hint = styled.span`color:var(--text-muted,#a89880);font-style:italic;`;
const BoardFrame = styled.div`
  width:100%;max-width:980px;margin:0 auto;background:var(--bg2,#0d0b08);
  border:1px solid var(--border,#2a2218);border-radius:10px;padding:10px;overflow-x:auto;
  svg{width:100%;height:auto;display:block;}`;
const Legend = styled.div`display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--text-muted,#a89880);`;
const Dot = styled.span<{ $color: string }>`display:inline-block;width:12px;height:12px;border-radius:50%;
  background:${(p)=>p.$color};margin-right:6px;vertical-align:middle;border:1px solid #000;`;
const SeamSwatch = styled.span`display:inline-block;width:14px;height:2px;background:var(--board-seam,#f0c040);
  margin-right:6px;vertical-align:middle;`;
