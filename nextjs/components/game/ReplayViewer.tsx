"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import * as rc from "@/lib/games/royal-checkers/engine";
import * as ik from "@/lib/games/imperial-kings/engine";
import type { Match } from "@/lib/db/collections/matches";

interface Props { match: Match; }

// Rebuilds the state at each ply from match.moves, which store the
// serialized post-move state alongside the move itself. This means
// no engine math at replay time — we just hop between snapshots.

export default function ReplayViewer({ match }: Props) {
  // Index 0 = initial position. Index i (1..moves.length) = state after move i-1.
  const snapshots = useMemo<string[]>(() => {
    const out: string[] = [];
    // We need the initial state. The engine builds it from initial().
    const initial = match.game === "royal-checkers"
      ? rc.encode(rc.initial())
      : ik.encode(ik.initial());
    out.push(initial);
    for (const m of match.moves) out.push(m.resultingState);
    return out;
  }, [match]);

  const [ply, setPly] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPly((p) => {
        const next = p + 1;
        if (next >= snapshots.length) { setPlaying(false); return p; }
        return next;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing, snapshots.length]);

  const current = snapshots[ply];
  const totalPlies = snapshots.length - 1;

  const scrub = useCallback((n: number) => {
    setPly(Math.max(0, Math.min(snapshots.length - 1, n)));
  }, [snapshots.length]);

  return (
    <Wrap>
      <Players>
        <strong>{match.challenger.displayName}</strong>
        <span>vs</span>
        <strong>{match.opponent.displayName}</strong>
      </Players>
      {match.game === "royal-checkers"
        ? <RcSnapshotBoard encoded={current} />
        : <IkSnapshotBoard encoded={current} />}
      <Controls>
        <Btn onClick={() => scrub(0)} disabled={ply === 0}>|◀</Btn>
        <Btn onClick={() => scrub(ply - 1)} disabled={ply === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(!playing)}>{playing ? "⏸" : "▶"}</Btn>
        <Btn onClick={() => scrub(ply + 1)} disabled={ply >= totalPlies}>▶</Btn>
        <Btn onClick={() => scrub(totalPlies)} disabled={ply >= totalPlies}>▶|</Btn>
        <Scrubber>
          <input type="range" min={0} max={totalPlies} value={ply}
                 onChange={(e) => scrub(Number.parseInt(e.target.value, 10))} />
          <span>Ply {ply} / {totalPlies}</span>
        </Scrubber>
      </Controls>
    </Wrap>
  );
}

const SQ = 40;

function RcSnapshotBoard({ encoded }: { encoded: string }) {
  const state = useMemo(() => rc.decode(encoded), [encoded]);
  return (
    <BoardFrame>
      <svg viewBox={`0 0 ${rc.COLS * SQ} ${rc.ROWS * SQ}`}>
        {Array.from({ length: rc.ROWS }).map((_, ri) =>
          Array.from({ length: rc.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const x = ci * SQ, y = (rc.ROWS - row) * SQ;
            const dark = rc.isDark(col, row);
            const p = state.board[ri][ci];
            return (
              <g key={`${col}-${row}`}>
                <rect x={x} y={y} width={SQ} height={SQ}
                      fill={dark ? "var(--board-dark,#2b2210)" : "var(--board-light,#f3e1a7)"} />
                {p && (
                  <circle cx={x + SQ / 2} cy={y + SQ / 2} r={SQ * 0.36}
                          fill={p.color === "red" ? "var(--piece-red,#c62b44)" : "var(--piece-black,#1a1510)"}
                          stroke="#000" strokeWidth={1} />
                )}
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

function IkSnapshotBoard({ encoded }: { encoded: string }) {
  const state = useMemo(() => ik.decode(encoded), [encoded]);
  return (
    <BoardFrame>
      <svg viewBox={`0 0 ${ik.COLS * SQ} ${ik.ROWS * SQ}`}>
        {Array.from({ length: ik.ROWS }).map((_, ri) =>
          Array.from({ length: ik.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const x = ci * SQ, y = (ik.ROWS - row) * SQ;
            const light = (col + row) % 2 === 0;
            const p = state.board[ri][ci];
            return (
              <g key={`${col}-${row}`}>
                <rect x={x} y={y} width={SQ} height={SQ}
                      fill={light ? "var(--board-light,#f3e1a7)" : "var(--board-dark,#2b2210)"} />
                {p && (
                  <text x={x + SQ / 2} y={y + SQ / 2 + 10} textAnchor="middle" fontSize={28}
                        fill={p.color === "white" ? "var(--piece-white,#f5efd8)" : "var(--piece-black,#1a1510)"}>
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

const Wrap = styled.div`display:flex;flex-direction:column;gap:12px;`;
const Players = styled.div`
  display:flex;gap:12px;align-items:center;color:var(--text,#f5f0e8);font-size:15px;
  span{color:var(--text-muted,#a89880);font-size:13px;}
`;
const BoardFrame = styled.div`
  width:100%;max-width:980px;background:var(--bg2,#0d0b08);
  border:1px solid var(--border,#2a2218);border-radius:10px;padding:8px;overflow-x:auto;
  svg{width:100%;height:auto;display:block;}
`;
const Controls = styled.div`display:flex;gap:8px;align-items:center;flex-wrap:wrap;`;
const Btn = styled.button`
  background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:5px;
  padding:6px 10px;font-size:14px;cursor:pointer;min-width:40px;
  &:disabled{opacity:.4;cursor:not-allowed;}
`;
const Scrubber = styled.div`
  display:flex;flex-direction:column;flex:1;min-width:200px;gap:4px;
  input{width:100%;accent-color:var(--gold,#c9a227);}
  span{font-size:12px;color:var(--text-muted,#a89880);}
`;
