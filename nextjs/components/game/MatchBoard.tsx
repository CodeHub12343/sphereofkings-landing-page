"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import * as rc from "@/lib/games/royal-checkers/engine";
import * as ik from "@/lib/games/imperial-kings/engine";
import type { Match } from "@/lib/db/collections/matches";
import { useMatchStream, ConnState } from "./useMatchStream";
import {
  BoardChrome,
  BoardDefs,
  CheckerPiece,
  ChessPiece,
  LegalDot,
  SeamLine,
  Square as SkinSquare,
} from "./BoardSkin";
import BoardViewToggle from "./BoardViewToggle";
import type { SpherePiece } from "./SphereBoardView";
import ResignButton from "./ResignButton";
import MatchChat from "./MatchChat";

interface Props {
  initial: Match;
  viewerId: string;
  // Read-only spectator view — no click handlers, no resign, no chat.
  // Served from /match/[id]/watch.
  spectator?: boolean;
}

export default function MatchBoard({ initial, viewerId, spectator = false }: Props) {
  const { match, conn, refetch } = useMatchStream(initial.id, initial);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ col: number; row: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const current = match ?? initial;
  const amChallenger = current.challenger.playerId === viewerId;
  const amOpponent = current.opponent.playerId === viewerId;
  const myTurn =
    !spectator &&
    current.status === "active" &&
    ((amChallenger && current.toMoveSide === "red-or-white") ||
      (amOpponent && current.toMoveSide === "black"));

  const sendMove = useCallback(async (moveJson: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${current.id}/move`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ moveJson }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Move was rejected.");
        void refetch();
      }
    } catch {
      setError("Network error. Retrying…");
    } finally {
      setSubmitting(false);
      setSelected(null);
    }
  }, [current.id, refetch]);

  const resign = useCallback(async () => {
    // Confirmation is handled by the ResignButton's two-step UI; just
    // fire the POST when the user confirms.
    await fetch(`/api/matches/${current.id}/resign`, { method: "POST" });
    void refetch();
  }, [current.id, refetch]);

  const accept = useCallback(async () => {
    await fetch(`/api/matches/${current.id}/accept`, { method: "POST" });
    void refetch();
  }, [current.id, refetch]);

  const decline = useCallback(async () => {
    await fetch(`/api/matches/${current.id}/accept`, { method: "DELETE" });
    void refetch();
  }, [current.id, refetch]);

  // Turn countdown
  const turnLeft = useTurnCountdown(current.turnExpiresAt);

  if (current.status === "pending") {
    return (
      <Wrap>
        <Panel>
          <h2>Challenge pending</h2>
          {amOpponent ? (
            <>
              <p><strong>{current.challenger.displayName}</strong> invited you to a game of {current.game.replace("-", " ")}.</p>
              <Row><Primary onClick={accept}>Accept</Primary><Secondary onClick={decline}>Decline</Secondary></Row>
            </>
          ) : (
            <>
              <p>Waiting for <strong>{current.opponent.displayName}</strong> to accept.</p>
              <ShareLine>
                Shareable link: <code>{typeof window !== "undefined" ? window.location.href : ""}</code>
              </ShareLine>
            </>
          )}
        </Panel>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Header>
        <PlayerTag $you={amChallenger}>
          {current.challenger.displayName}
          {current.toMoveSide === "red-or-white" && current.status === "active" && <Dot />}
        </PlayerTag>
        <Vs>vs</Vs>
        <PlayerTag $you={amOpponent}>
          {current.opponent.displayName}
          {current.toMoveSide === "black" && current.status === "active" && <Dot />}
        </PlayerTag>
      </Header>
      <ConnBanner conn={conn} />
      {current.status === "active" && turnLeft !== null && (
        <Timer $urgent={turnLeft < 15}>
          {myTurn ? "Your turn — " : "Opponent's turn — "}
          {turnLeft}s to move
        </Timer>
      )}
      {current.status !== "active" && (
        <EndBanner>
          {current.status === "finished" && current.outcome === "draw" && "Draw."}
          {current.status === "finished" && current.winnerId && (
            current.winnerId === viewerId
              ? <><strong>You won.</strong> ({current.outcome})</>
              : <>Opponent won. ({current.outcome})</>
          )}
          {current.status === "abandoned" && <>Abandoned — {current.outcome}.</>}
          {current.status === "declined" && <>Challenge declined.</>}
          <div style={{ marginTop: 10 }}><Link href="/matches">Back to matches</Link></div>
        </EndBanner>
      )}
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {current.game === "royal-checkers" ? (
        <RcMatchBoard
          match={current}
          myColor={amChallenger ? "red" : "black"}
          myTurn={myTurn && !submitting}
          selected={selected}
          setSelected={setSelected}
          onMove={sendMove}
        />
      ) : (
        <IkMatchBoard
          match={current}
          myColor={amChallenger ? "white" : "black"}
          myTurn={myTurn && !submitting}
          selected={selected}
          setSelected={setSelected}
          onMove={sendMove}
        />
      )}

      {current.status === "active" && !spectator && (
        <ControlsRow>
          <ResignButton onResign={resign} />
          <button
            type="button"
            onClick={() => {
              const url = typeof window !== "undefined"
                ? `${window.location.origin}/match/${current.id}/watch`
                : "";
              try { navigator.clipboard.writeText(url); } catch {}
            }}
            title="Copies a share link that lets anyone spectate this match"
            style={{
              background: "transparent", color: "#a89880",
              border: "1px solid #2e2618", padding: "7px 12px",
              borderRadius: 6, fontSize: 14, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Share spectator link
          </button>
        </ControlsRow>
      )}
      {spectator && (
        <ControlsRow>
          <span style={{ color: "#a89880", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
            Spectator view — read-only. Share this link to invite more viewers.
          </span>
        </ControlsRow>
      )}

      <MatchChat
        matchId={current.id}
        viewerId={viewerId}
        readOnly={spectator}
        initialMessages={current.chatMessages ?? []}
      />
    </Wrap>
  );
}

function useTurnCountdown(iso: string | undefined): number | null {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    if (!iso) { setT(null); return; }
    const tick = () => {
      const ms = new Date(iso).getTime() - Date.now();
      setT(Math.max(0, Math.round(ms / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}

function ConnBanner({ conn }: { conn: ConnState }) {
  if (conn === "live") return null;
  const map: Record<ConnState, { label: string; color: string }> = {
    connecting: { label: "Connecting…", color: "var(--status-waiting,#e0a94a)" },
    live: { label: "", color: "" },
    polling: { label: "Live push offline — polling every 2s", color: "var(--status-waiting,#e0a94a)" },
    offline: { label: "Offline — reconnecting", color: "var(--status-urgent,#ff6b7a)" },
  };
  const { label, color } = map[conn];
  return <Banner $color={color}>{label}</Banner>;
}

/* --------------------------- Boards --------------------------- */

const SQ = 40;

function RcMatchBoard({
  match, myColor, myTurn, selected, setSelected, onMove,
}: {
  match: Match;
  myColor: "red" | "black";
  myTurn: boolean;
  selected: { col: number; row: number } | null;
  setSelected: (s: { col: number; row: number } | null) => void;
  onMove: (moveJson: string) => void;
}) {
  const state = useMemo(() => rc.decode(match.state), [match.state]);
  const legalFromMe = useMemo(() => {
    if (!myTurn) return [];
    const moves = rc.legalMoves(state);
    return moves.filter((m) => {
      const p = state.board[m.from.row - 1][m.from.col - 1];
      return p?.color === myColor;
    });
  }, [state, myTurn, myColor]);
  const bySource = useMemo(() => {
    const m = new Map<string, rc.Move[]>();
    for (const mv of legalFromMe) {
      const k = `${mv.from.col},${mv.from.row}`;
      (m.get(k) ?? m.set(k, []).get(k)!).push(mv);
    }
    return m;
  }, [legalFromMe]);
  const forSelected = selected ? bySource.get(`${selected.col},${selected.row}`) ?? [] : [];

  const renderRow = myColor === "red" ? (r: number) => rc.ROWS - r : (r: number) => r - 1;

  const squareClick = (col: number, row: number) => {
    if (!myTurn) return;
    const forThis = forSelected.find((m) => {
      const land = m.path[m.path.length - 1];
      return land.col === col && land.row === row;
    });
    if (forThis) { onMove(JSON.stringify(forThis)); return; }
    const p = state.board[row - 1][col - 1];
    if (p && p.color === myColor && bySource.has(`${col},${row}`)) {
      setSelected({ col, row });
    } else {
      setSelected(null);
    }
  };
  const boardW = rc.COLS * SQ;
  const boardH = rc.ROWS * SQ;

  const spherePieces = useMemo(() => {
    const out: SpherePiece[] = [];
    for (let r = 0; r < rc.ROWS; r++) {
      for (let c = 0; c < rc.COLS; c++) {
        const p = state.board[r][c];
        if (p) out.push({ col: c + 1, row: r + 1, color: p.color, kind: "checker" });
      }
    }
    return out;
  }, [state.board]);
  const sphereLegalDests = useMemo(() => {
    const seen = new Set<string>();
    const out: { col: number; row: number; capture: boolean }[] = [];
    for (const m of forSelected) {
      const land = m.path[m.path.length - 1];
      const key = `${land.col},${land.row}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ col: land.col, row: land.row, capture: m.captured.length > 0 });
    }
    return out;
  }, [forSelected]);

  return (
    <BoardViewToggle
      cols={rc.COLS}
      rows={rc.ROWS}
      pieces={spherePieces}
      selected={selected}
      legalDests={sphereLegalDests}
      onCellClick={(cell) => squareClick(cell.col, cell.row)}
    >
    <BoardChrome>
      <svg viewBox={`0 0 ${boardW} ${boardH}`}>
        <BoardDefs />
        {Array.from({ length: rc.ROWS }).map((_, ri) =>
          Array.from({ length: rc.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const dark = rc.isDark(col, row);
            const x = ci * SQ, y = renderRow(row) * SQ;
            const sel = selected !== null && selected.col === col && selected.row === row;
            const dest = forSelected.find((m) => {
              const land = m.path[m.path.length - 1];
              return land.col === col && land.row === row;
            });
            return (
              <g key={`${col}-${row}`}>
                <SkinSquare
                  x={x}
                  y={y}
                  size={SQ}
                  dark={dark}
                  selected={sel}
                  onClick={() => squareClick(col, row)}
                />
                {dest && (
                  <LegalDot
                    cx={x + SQ / 2}
                    cy={y + SQ / 2}
                    size={SQ}
                    capture={dest.captured.length > 0}
                  />
                )}
              </g>
            );
          }),
        )}
        <SeamLine x={0} height={boardH} />
        <SeamLine x={boardW} height={boardH} />
        {Array.from({ length: rc.ROWS }).map((_, ri) =>
          Array.from({ length: rc.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const p = state.board[ri][ci];
            if (!p) return null;
            const x = ci * SQ + SQ / 2;
            const y = renderRow(row) * SQ + SQ / 2;
            return (
              <CheckerPiece
                key={`p-${col}-${row}`}
                cx={x}
                cy={y}
                size={SQ}
                color={p.color}
                king={p.kind === "king"}
                onClick={() => squareClick(col, row)}
              />
            );
          }),
        )}
      </svg>
    </BoardChrome>
    </BoardViewToggle>
  );
}

const GLYPH: Record<string, string> = {
  "white-pawn":"♙","white-knight":"♘","white-bishop":"♗","white-rook":"♖","white-queen":"♕","white-king":"♔",
  "black-pawn":"♟","black-knight":"♞","black-bishop":"♝","black-rook":"♜","black-queen":"♛","black-king":"♚",
};

function IkMatchBoard({
  match, myColor, myTurn, selected, setSelected, onMove,
}: {
  match: Match;
  myColor: "white" | "black";
  myTurn: boolean;
  selected: { col: number; row: number } | null;
  setSelected: (s: { col: number; row: number } | null) => void;
  onMove: (moveJson: string) => void;
}) {
  const state = useMemo(() => ik.decode(match.state), [match.state]);
  const legalFromMe = useMemo(() => {
    if (!myTurn) return [];
    const moves = ik.legalMoves(state);
    return moves.filter((m) => {
      const p = state.board[m.from.row - 1][m.from.col - 1];
      return p?.color === myColor;
    });
  }, [state, myTurn, myColor]);
  const bySource = useMemo(() => {
    const m = new Map<string, ik.Move[]>();
    for (const mv of legalFromMe) {
      const k = `${mv.from.col},${mv.from.row}`;
      (m.get(k) ?? m.set(k, []).get(k)!).push(mv);
    }
    return m;
  }, [legalFromMe]);
  const forSelected = selected ? bySource.get(`${selected.col},${selected.row}`) ?? [] : [];
  const renderRow = myColor === "white" ? (r: number) => ik.ROWS - r : (r: number) => r - 1;

  const squareClick = (col: number, row: number) => {
    if (!myTurn) return;
    const forThis = forSelected.find((m) => m.to.col === col && m.to.row === row);
    if (forThis) { onMove(JSON.stringify(forThis)); return; }
    const p = state.board[row - 1][col - 1];
    if (p && p.color === myColor && bySource.has(`${col},${row}`)) {
      setSelected({ col, row });
    } else {
      setSelected(null);
    }
  };
  const boardW = ik.COLS * SQ;
  const boardH = ik.ROWS * SQ;

  const spherePieces = useMemo(() => {
    const out: SpherePiece[] = [];
    for (let r = 0; r < ik.ROWS; r++) {
      for (let c = 0; c < ik.COLS; c++) {
        const p = state.board[r][c];
        if (p) out.push({ col: c + 1, row: r + 1, color: p.color, kind: p.kind });
      }
    }
    return out;
  }, [state.board]);
  const sphereLegalDests = useMemo(() => {
    const seen = new Set<string>();
    const out: { col: number; row: number; capture: boolean }[] = [];
    for (const m of forSelected) {
      const key = `${m.to.col},${m.to.row}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ col: m.to.col, row: m.to.row, capture: Boolean(m.captured) });
    }
    return out;
  }, [forSelected]);

  return (
    <BoardViewToggle
      cols={ik.COLS}
      rows={ik.ROWS}
      pieces={spherePieces}
      selected={selected}
      legalDests={sphereLegalDests}
      onCellClick={(cell) => squareClick(cell.col, cell.row)}
    >
    <BoardChrome>
      <svg viewBox={`0 0 ${boardW} ${boardH}`}>
        <BoardDefs />
        {Array.from({ length: ik.ROWS }).map((_, ri) =>
          Array.from({ length: ik.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const light = (col + row) % 2 === 0;
            const x = ci * SQ, y = renderRow(row) * SQ;
            const sel = selected !== null && selected.col === col && selected.row === row;
            const dest = forSelected.find((m) => m.to.col === col && m.to.row === row);
            return (
              <g key={`${col}-${row}`}>
                <SkinSquare
                  x={x}
                  y={y}
                  size={SQ}
                  dark={!light}
                  selected={sel}
                  onClick={() => squareClick(col, row)}
                />
                {dest && (
                  <LegalDot
                    cx={x + SQ / 2}
                    cy={y + SQ / 2}
                    size={SQ}
                    capture={Boolean(dest.captured)}
                  />
                )}
              </g>
            );
          }),
        )}
        <SeamLine x={0} height={boardH} />
        <SeamLine x={boardW} height={boardH} />
        {Array.from({ length: ik.ROWS }).map((_, ri) =>
          Array.from({ length: ik.COLS }).map((__, ci) => {
            const col = ci + 1, row = ri + 1;
            const p = state.board[ri][ci];
            if (!p) return null;
            const x = ci * SQ + SQ / 2;
            const y = renderRow(row) * SQ + SQ / 2;
            return (
              <ChessPiece
                key={`p-${col}-${row}`}
                cx={x}
                cy={y}
                size={SQ}
                color={p.color}
                kind={p.kind}
                onClick={() => squareClick(col, row)}
              />
            );
          }),
        )}
      </svg>
    </BoardChrome>
    </BoardViewToggle>
  );
}
const Wrap = styled.div`display:flex;flex-direction:column;gap:12px;color:var(--text,#f5f0e8);`;
const Panel = styled.div`
  padding:20px;background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);border-radius:10px;
  h2{margin:0 0 10px;font-size:20px;color:var(--gold-light,#f0c040);}
  p{margin:0 0 10px;color:var(--text,#f5f0e8);}
`;
const Row = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const Header = styled.div`display:flex;gap:14px;align-items:center;font-size:15px;flex-wrap:wrap;`;
const PlayerTag = styled.span<{ $you: boolean }>`
  display:inline-flex;gap:8px;align-items:center;
  padding:5px 10px;border-radius:6px;background:var(--bg2,#0d0b08);
  border:1px solid ${(p)=>p.$you?"var(--gold,#c9a227)":"var(--border,#2a2218)"};
  color:${(p)=>p.$you?"var(--gold-light,#f0c040)":"var(--text,#f5f0e8)"};
`;
const Dot = styled.span`
  width:8px;height:8px;border-radius:50%;background:var(--status-online,#4fb07d);
  display:inline-block;animation:pulse 1.4s infinite;
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
`;
const Vs = styled.span`color:var(--text-muted,#a89880);font-size:13px;`;
const Timer = styled.div<{ $urgent: boolean }>`
  padding:6px 10px;border-radius:6px;font-size:13px;
  background:${(p)=>p.$urgent?"rgba(255,107,122,.1)":"rgba(201,162,39,.1)"};
  color:${(p)=>p.$urgent?"var(--status-urgent,#ff6b7a)":"var(--gold-light,#f0c040)"};
  border:1px solid ${(p)=>p.$urgent?"var(--status-urgent,#ff6b7a)":"var(--border,#2a2218)"};
  align-self:flex-start;
`;
const Banner = styled.div<{ $color: string }>`
  padding:6px 10px;border-radius:6px;font-size:13px;
  color:${(p)=>p.$color};background:rgba(224,169,74,.08);
  border:1px solid ${(p)=>p.$color};align-self:flex-start;
`;
const EndBanner = styled.div`
  padding:14px;border-radius:8px;background:var(--bg2,#0d0b08);
  border:1px solid var(--gold,#c9a227);color:var(--text,#f5f0e8);
  strong{color:var(--gold-light,#f0c040);}
  a{color:var(--gold-light,#f0c040);}
`;
const ErrorBanner = styled.div`
  padding:8px 12px;border-radius:6px;color:var(--status-urgent,#ff6b7a);
  background:rgba(255,107,122,.08);border:1px solid var(--status-urgent,#ff6b7a);font-size:13px;
`;
const BoardFrame = styled.div`
  width:100%;max-width:980px;background:var(--bg2,#0d0b08);
  border:1px solid var(--border,#2a2218);border-radius:10px;padding:8px;overflow-x:auto;
  svg{width:100%;height:auto;display:block;}
`;
const ControlsRow = styled.div`display:flex;gap:10px;`;
const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:9px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);}
`;
const Secondary = styled.button`
  background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);border:1px solid var(--border,#2a2218);
  border-radius:6px;padding:9px 14px;font-size:14px;cursor:pointer;
  &:hover{border-color:var(--gold,#c9a227);}
`;
const ShareLine = styled.p`
  font-size:13px;color:var(--text-muted,#a89880);
  code{background:var(--bg3,#111009);padding:3px 6px;border-radius:4px;}
`;
