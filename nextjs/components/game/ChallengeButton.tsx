"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { GameId } from "@/lib/db/collections/players";

interface Props { opponentUsername: string; opponentDisplayName: string; }

export default function ChallengeButton({ opponentUsername, opponentDisplayName }: Props) {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState<GameId>("royal-checkers");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const send = async () => {
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ opponentUsername, game }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the challenge.");
        return;
      }
      router.push(`/match/${data.match.id}`);
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return <Primary onClick={() => setOpen(true)}>Challenge {opponentDisplayName}</Primary>;
  }

  return (
    <Panel>
      <Row>
        <label>
          Game
          <select value={game} onChange={(e) => setGame(e.target.value as GameId)}>
            <option value="royal-checkers">Royal Checkers</option>
            <option value="imperial-kings">Imperial Kings</option>
          </select>
        </label>
      </Row>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <Row>
        <Primary onClick={send} disabled={sending}>
          {sending ? "Sending…" : "Send invite"}
        </Primary>
        <Secondary onClick={() => setOpen(false)} disabled={sending}>Cancel</Secondary>
      </Row>
    </Panel>
  );
}

const Panel = styled.div`
  display:flex;flex-direction:column;gap:10px;
  padding:14px;background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);border-radius:8px;
  max-width:360px;
`;
const Row = styled.div`
  display:flex;gap:10px;align-items:center;flex-wrap:wrap;
  label{display:flex;gap:8px;align-items:center;color:var(--text-muted,#a89880);font-size:13px;}
  select{background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:5px;padding:5px 8px;font-size:13px;}
`;
const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;}
`;
const Secondary = styled.button`
  background:transparent;color:var(--text-muted,#a89880);border:1px solid var(--border,#2a2218);
  border-radius:6px;padding:8px 12px;font-size:13px;cursor:pointer;
  &:hover{color:var(--text,#f5f0e8);border-color:var(--gold,#c9a227);}
`;
const ErrorBanner = styled.div`
  padding:6px 8px;border-radius:5px;color:var(--status-urgent,#ff6b7a);
  background:rgba(255,107,122,.08);border:1px solid var(--status-urgent,#ff6b7a);font-size:12px;
`;
