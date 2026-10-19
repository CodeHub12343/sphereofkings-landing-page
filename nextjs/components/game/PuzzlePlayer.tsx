"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import type { Puzzle } from "@/lib/games/puzzles/official";
import * as rc from "@/lib/games/royal-checkers/engine";
import * as ik from "@/lib/games/imperial-kings/engine";

interface Props { puzzle: Puzzle; }

function getSessionId(): string {
  const key = "sok.anon-session";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

async function recordRun(opts: {
  puzzle: Puzzle;
  solved: boolean;
  timeMs: number;
  attempts: number;
}) {
  try {
    await fetch("/api/puzzles/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        anonymousSessionId: getSessionId(),
        slug: opts.puzzle.slug,
        game: opts.puzzle.game,
        tier: opts.puzzle.tier,
        solved: opts.solved,
        timeMs: opts.timeMs,
        attempts: opts.attempts,
      }),
    });
  } catch {}
}

export default function PuzzlePlayer({ puzzle }: Props) {
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<{ col: number; row: number } | null>(null);
  const startedAt = useMemo(() => Date.now(), [puzzle.slug]);

  if (puzzle.game === "royal-checkers") {
    const state = rc.decode(puzzle.state);
    const legal = rc.legalMoves(state);
    const legalBySource = new Map<string, rc.Move[]>();
    for (const m of legal) {
      const k = `${m.from.col},${m.from.row}`;
      (legalBySource.get(k) ?? legalBySource.set(k, []).get(k)!).push(m);
    }
    const onClick = (col: number, row: number) => {
      if (solved) return;
      if (selected) {
        const forSelected = legalBySource.get(`${selected.col},${selected.row}`) ?? [];
        const chosen = forSelected.find((m) => {
          const land = m.path[m.path.length - 1];
          return land.col === col && land.row === row;
        });
        if (chosen) {
          setAttempts((a) => a + 1);
          const land = chosen.path[chosen.path.length - 1];
          if (land.col === puzzle.goalLandingCol && land.row === puzzle.goalLandingRow) {
            setSolved(true); setFailed(false);
            recordRun({ puzzle, solved: true, timeMs: Date.now() - startedAt, attempts: attempts + 1 });
          } else {
            setFailed(true);
          }
          setSelected(null);
          return;
        }
      }
      const piece = state.board[row - 1][col - 1];
      if (piece && piece.color === state.toMove && legalBySource.has(`${col},${row}`)) {
        setSelected({ col, row });
      } else {
        setSelected(null);
      }
    };
    return (
      <PuzzleShell puzzle={puzzle} solved={solved} failed={failed} attempts={attempts}
                   onReset={() => { setSelected(null); setFailed(false); setAttempts(0); }}>
        <RcBoard state={state} selected={selected} goal={puzzle} onClick={onClick} />
      </PuzzleShell>
    );
  }

  // Imperial Kings
  const state = ik.decode(puzzle.state);
  const legal = ik.legalMoves(state);
  const legalBySource = new Map<string, ik.Move[]>();
  for (const m of legal) {
    const k = `${m.from.col},${m.from.row}`;
    (legalBySource.get(k) ?? legalBySource.set(k, []).get(k)!).push(m);
  }
  const onClick = (col: number, row: number) => {
    if (solved) return;
    if (selected) {
      const forSelected = legalBySource.get(`${selected.col},${selected.row}`) ?? [];
      const chosen = forSelected.find((m) => m.to.col === col && m.to.row === row);
      if (chosen) {
        setAttempts((a) => a + 1);
        if (chosen.to.col === puzzle.goalLandingCol && chosen.to.row === puzzle.goalLandingRow) {
          setSolved(true); setFailed(false);
          recordRun({ puzzle, solved: true, timeMs: Date.now() - startedAt, attempts: attempts + 1 });
        } else {
          setFailed(true);
        }
        setSelected(null);
        return;
      }
    }
    const piece = state.board[row - 1][col - 1];
    if (piece && piece.color === state.toMove && legalBySource.has(`${col},${row}`)) {
      setSelected({ col, row });
    } else {
      setSelected(null);
    }
  };
  return (
    <PuzzleShell puzzle={puzzle} solved={solved} failed={failed} attempts={attempts}
                 onReset={() => { setSelected(null); setFailed(false); setAttempts(0); }}>
      <IkBoard state={state} selected={selected} goal={puzzle} onClick={onClick} />
    </PuzzleShell>
  );
}

function PuzzleShell({ puzzle, solved, failed, attempts, onReset, children }: {
  puzzle: Puzzle;
  solved: boolean;
  failed: boolean;
  attempts: number;
  onReset: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!failed) return;
    const t = setTimeout(() => onReset(), 1200);
    return () => clearTimeout(t);
  }, [failed, onReset]);
  const isKid = puzzle.tier === "kid";
  return (
    <ShellWrap>
      <Prompt>
        <Tier $kid={isKid}>{puzzle.tier.toUpperCase()}</Tier>
        <h2>{puzzle.title}</h2>
        <p>{puzzle.prompt}</p>
      </Prompt>
      {children}
      {solved && (
        <Done>
          <strong>Solved</strong> in {attempts} {attempts === 1 ? "attempt" : "attempts"}.
          <p>{puzzle.explanation}</p>
        </Done>
      )}
      {failed && !solved && <Nope>Not that move — try again.</Nope>}
    </ShellWrap>
  );
}

const SQ = 36;

function RcBoard({ state, selected, goal, onClick }: {
  state: rc.GameState;
  selected: { col: number; row: number } | null;
  goal: Puzzle;
  onClick: (c: number, r: number) => void;
}) {
  const width = rc.COLS * SQ;
  const height = rc.ROWS * SQ;
  return (
    <BoardFrame>
      <svg viewBox={`0 0 ${width} ${height}`}>
        {Array.from({ length: rc.ROWS }).map((_, ri) =>
          Array.from({ length: rc.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const dark = rc.isDark(col, row);
            const x = ci * SQ, y = (rc.ROWS - row) * SQ;
            const isGoal = col === goal.goalLandingCol && row === goal.goalLandingRow;
            const isSel = selected && selected.col === col && selected.row === row;
            return (
              <g key={`${col}-${row}`}>
                <rect x={x} y={y} width={SQ} height={SQ}
                      fill={dark ? "var(--board-dark,#2b2210)" : "var(--board-light,#f3e1a7)"}
                      stroke={isSel ? "var(--gold-light,#f0c040)" : isGoal ? "var(--status-online,#4fb07d)" : "none"}
                      strokeWidth={isSel || isGoal ? 2 : 0}
                      onClick={() => onClick(col, row)}
                      style={{ cursor: "pointer" }} />
                {(() => {
                  const p = state.board[ri][ci];
                  if (!p) return null;
                  const cx = x + SQ / 2, cy = y + SQ / 2;
                  const fill = p.color === "red" ? "var(--piece-red,#c62b44)" : "var(--piece-black,#1a1510)";
                  return <circle cx={cx} cy={cy} r={SQ * 0.36} fill={fill}
                                 stroke="#000" strokeWidth={1}
                                 onClick={() => onClick(col, row)}
                                 style={{ cursor: "pointer" }} />;
                })()}
              </g>
            );
          }),
        )}
      </svg>
    </BoardFrame>
  );
}

const GLYPH: Record<string, string> = {
  "white-pawn":"♙","white-knight":"♘","white-bishop":"♗","white-rook":"♖","white-queen":"♕","white-king":"♔",
  "black-pawn":"♟","black-knight":"♞","black-bishop":"♝","black-rook":"♜","black-queen":"♛","black-king":"♚",
};

function IkBoard({ state, selected, goal, onClick }: {
  state: ik.GameState;
  selected: { col: number; row: number } | null;
  goal: Puzzle;
  onClick: (c: number, r: number) => void;
}) {
  const width = ik.COLS * SQ;
  const height = ik.ROWS * SQ;
  return (
    <BoardFrame>
      <svg viewBox={`0 0 ${width} ${height}`}>
        {Array.from({ length: ik.ROWS }).map((_, ri) =>
          Array.from({ length: ik.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const light = (col + row) % 2 === 0;
            const x = ci * SQ, y = (ik.ROWS - row) * SQ;
            const isGoal = col === goal.goalLandingCol && row === goal.goalLandingRow;
            const isSel = selected && selected.col === col && selected.row === row;
            const p = state.board[ri][ci];
            return (
              <g key={`${col}-${row}`}>
                <rect x={x} y={y} width={SQ} height={SQ}
                      fill={light ? "var(--board-light,#f3e1a7)" : "var(--board-dark,#2b2210)"}
                      stroke={isSel ? "var(--gold-light,#f0c040)" : isGoal ? "var(--status-online,#4fb07d)" : "none"}
                      strokeWidth={isSel || isGoal ? 2 : 0}
                      onClick={() => onClick(col, row)}
                      style={{ cursor: "pointer" }} />
                {p && (
                  <text x={x + SQ / 2} y={y + SQ / 2 + 9} textAnchor="middle"
                        fontSize={26}
                        fill={p.color === "white" ? "var(--piece-white,#f5efd8)" : "var(--piece-black,#1a1510)"}
                        onClick={() => onClick(col, row)}
                        style={{ cursor: "pointer", userSelect: "none" }}>
                    {GLYPH[`${p.color}-${p.kind}`]}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>
    </BoardFrame>
  );
}

const ShellWrap = styled.div`display:flex;flex-direction:column;gap:14px;`;
const Prompt = styled.div`
  h2{margin:4px 0 6px;font-size:22px;color:var(--text,#f5f0e8);}
  p{margin:0;color:var(--text-muted,#a89880);}
`;
const Tier = styled.span<{ $kid: boolean }>`
  display:inline-block;padding:3px 8px;border-radius:4px;font-size:11px;letter-spacing:.1em;
  background:${(p)=>p.$kid?"rgba(76,124,224,.2)":"rgba(201,162,39,.2)"};
  color:${(p)=>p.$kid?"var(--minor-badge,#4c7ce0)":"var(--gold-light,#f0c040)"};
`;
const BoardFrame = styled.div`
  width:100%;max-width:720px;background:var(--bg2,#0d0b08);
  border:1px solid var(--border,#2a2218);border-radius:10px;padding:10px;overflow-x:auto;
  svg{width:100%;height:auto;display:block;}
`;
const Done = styled.div`
  padding:14px;border:1px solid var(--status-online,#4fb07d);border-radius:8px;
  background:rgba(79,176,125,.08);color:var(--text,#f5f0e8);
  strong{color:var(--status-online,#4fb07d);}
  p{margin:6px 0 0;color:var(--text-muted,#a89880);}
`;
const Nope = styled.div`
  padding:10px;border:1px solid var(--status-urgent,#ff6b7a);border-radius:8px;
  background:rgba(255,107,122,.08);color:var(--status-urgent,#ff6b7a);
`;
