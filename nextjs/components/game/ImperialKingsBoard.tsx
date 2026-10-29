"use client";

// NOTE: Next 15 + SWC occasionally mis-parses this file on a cold HMR
// pass and complains about "Unexpected token" near the final `}`. The
// file is syntactically correct — production builds compile cleanly
// and a plain `touch` on the file clears the dev cache. Not a code bug;
// a documented Next bug not worth chasing.

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
import {
  BoardChrome,
  BoardDefs,
  ChessPiece,
  LegalDot,
  SeamLine,
  Square as SkinSquare,
} from "./BoardSkin";
import BoardViewToggle from "./BoardViewToggle";
import type { SpherePiece } from "./SphereBoardView";
import PromotionPicker from "./PromotionPicker";
import ResignButton from "./ResignButton";
import FirstTimeWelcome from "./FirstTimeWelcome";
import PostGameModal from "./PostGameModal";
import GameClock from "./GameClock";
import { fx } from "@/lib/game-feedback";

const STORAGE_KEY = "sok.ik.save.v1";
interface Save { state: string; difficulty: Difficulty; humanColor: "white" | "black"; }

export default function ImperialKingsBoard() {
  const [state, setState] = useState<GameState>(() => initial());
  const [difficulty, setDifficulty] = useState<Difficulty>(PRESETS.medium);
  const [humanColor, setHumanColor] = useState<"white" | "black">("white");
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [message, setMessage] = useState("");
  const [resigned, setResigned] = useState(false);
  const historyRef = useRef<{ state: GameState; humanColor: "white" | "black" }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [clockOn, setClockOn] = useState(false);
  const [clockKey, setClockKey] = useState(0);
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

  const rawTerm = outcome(state);
  const term = resigned
    ? ({ kind: "win", winner: humanColor === "white" ? "black" : "white", reason: "resignation" } as typeof rawTerm)
    : rawTerm;
  const myTurn = state.toMove === humanColor && term.kind === "ongoing";
  const legal = useMemo(() => legalMoves(state), [state]);

  useEffect(() => {
    if (term.kind !== "win" && term.kind !== "draw") return;
    const result: "win" | "loss" | "draw" =
      term.kind === "draw" ? "draw" : term.winner === humanColor ? "win" : "loss";
    fx(result);
    setShowEndModal(true);
    if (!me) return;
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

  // De-dupe by target square — a promoting pawn has 4 Move entries
  // sharing the same (to.col, to.row). The sphere view should render
  // one ring per square, not four stacked.
  const sphereLegalDests = useMemo(
    () => {
      const seen = new Set<string>();
      const out: { col: number; row: number; capture: boolean }[] = [];
      for (const m of legalForSelected) {
        const key = `${m.to.col},${m.to.row}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ col: m.to.col, row: m.to.row, capture: Boolean(m.captured) });
      }
      return out;
    },
    [legalForSelected],
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

  // Promotion state — when the player picks a destination that has >1
  // candidate move (one per promotion piece), we stash the pending
  // moves and surface the picker. The user's choice resolves which
  // Move to apply.
  const [pendingPromotion, setPendingPromotion] = useState<Move[] | null>(null);

  const onSquareClick = useCallback((sq: Square) => {
    if (!myTurn) return;
    if (selected) {
      const dests = legalForSelected.filter(
        (m) => m.to.col === sq.col && m.to.row === sq.row,
      );
      if (dests.length === 1) {
        historyRef.current.push({ state, humanColor });
        setCanUndo(true);
        setState((p) => apply(p, dests[0]));
        fx(dests[0].captured ? "capture" : "move");
        setSelected(null);
        setMessage("");
        return;
      }
      if (dests.length > 1) {
        // All should share from/to; only the `promotion` field differs.
        setPendingPromotion(dests);
        return;
      }
    }
    const p = pieceAt(state, sq);
    if (p && p.color === humanColor) {
      if (legalBySource.has(`${sq.col},${sq.row}`)) {
        setSelected(sq);
        fx("select");
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

  const sqSize = 44;

  const spherePieces: SpherePiece[] = useMemo(() => {
    const out: SpherePiece[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = state.board[r][c];
        if (!p) continue;
        out.push({ col: c + 1, row: r + 1, color: p.color, kind: p.kind });
      }
    }
    return out;
  }, [state.board]);

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

      {clockOn && (
        <GameClock
          key={clockKey}
          perSideSeconds={600}
          toMove={state.toMove === "white" ? "a" : "b"}
          running={term.kind === "ongoing"}
          myLabel="You"
          opponentLabel="Computer"
          mySide={humanColor === "white" ? "a" : "b"}
          onFlag={(side) => {
            if (
              (side === "a" && humanColor === "white") ||
              (side === "b" && humanColor === "black")
            ) {
              setResigned(true);
            } else {
              setResigned(true);
              setHumanColor((c) => (c === "white" ? "black" : "white"));
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
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
             role="img" aria-label="Imperial Kings board">
          <BoardDefs />
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1; const row = rIdx + 1;
              const light = (col + row) % 2 === 0;
              const x = cIdx * sqSize; const y = renderRow(row) * sqSize;
              const isSel = selected !== null && selected.col === col && selected.row === row;
              const dest = legalForSelected.find((m) => m.to.col === col && m.to.row === row);
              return (
                <g key={`${col}-${row}`}>
                  <SkinSquare
                    x={x}
                    y={y}
                    size={sqSize}
                    dark={!light}
                    selected={isSel}
                    onClick={() => onSquareClick({ col, row })}
                  />
                  {dest && (
                    <LegalDot
                      cx={x + sqSize / 2}
                      cy={y + sqSize / 2}
                      size={sqSize}
                      capture={Boolean(dest.captured)}
                    />
                  )}
                </g>
              );
            }),
          )}
          <SeamLine x={0} height={height} />
          <SeamLine x={width} height={height} />
          {Array.from({ length: ROWS }).map((_, rIdx) =>
            Array.from({ length: COLS }).map((__, cIdx) => {
              const col = cIdx + 1; const row = rIdx + 1;
              const p = state.board[rIdx][cIdx];
              if (!p) return null;
              const x = cIdx * sqSize + sqSize / 2;
              const y = renderRow(row) * sqSize + sqSize / 2;
              return (
                <ChessPiece
                  key={`p-${col}-${row}`}
                  cx={x}
                  cy={y}
                  size={sqSize}
                  color={p.color}
                  kind={p.kind}
                  onClick={() => onSquareClick({ col, row })}
                />
              );
            }),
          )}
        </svg>
      </BoardChrome>
      </BoardViewToggle>
      <Legend>
        <span><Dot $color="var(--piece-white,#f5efd8)" /> White (home rows 1–3)</span>
        <span><Dot $color="var(--piece-black,#1a1510)" /> Black (home rows 6–8)</span>
        <span><SeamSwatch /> Seam — slides and knight-jumps wrap</span>
        <span>Win: capture both opponent kings</span>
      </Legend>
      <FirstTimeWelcome gameSlug="imperial-kings" gameName="Imperial Kings" />
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
          gameName="Imperial Kings"
          onRematch={() => { newGame(); }}
          onClose={() => setShowEndModal(false)}
          shareText="I just played Imperial Kings on sphereofkings.com — chess with two kings on a spherical board."
          newRating={newRating}
        />
      )}
      {pendingPromotion && pendingPromotion.length > 0 && (
        <PromotionPicker
          color={humanColor}
          kinds={pendingPromotion
            .map((m) => m.promotion!)
            .filter((k): k is NonNullable<typeof k> => Boolean(k))}
          onPick={(kind) => {
            const chosen = pendingPromotion.find((m) => m.promotion === kind);
            if (chosen) {
              historyRef.current.push({ state, humanColor });
              setCanUndo(true);
              setState((p) => apply(p, chosen));
              fx("promote");
              setSelected(null);
              setMessage("");
            }
            setPendingPromotion(null);
          }}
          onCancel={() => setPendingPromotion(null)}
        />
      )}
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
