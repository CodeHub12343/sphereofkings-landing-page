"use client";

// Online-play panel: pick a game, then either create an invite link for
// a friend or join the quick-match queue. Used at the top of /matches;
// the app home screen uses the same hooks with a tile layout.

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import type { GameId } from "@/lib/db/collections/players";
import { useCreateInvite, useQuickMatch } from "./usePlayOnline";

const GAMES: Array<{ id: GameId; label: string }> = [
  { id: "royal-checkers", label: "Royal Checkers" },
  { id: "imperial-kings", label: "Imperial Kings" },
];

interface Props {
  signedIn: boolean;
  // Where to send a signed-out visitor back to after sign-in.
  returnTo?: string;
}

export default function PlayOnlinePanel({ signedIn, returnTo = "/play" }: Props) {
  const [game, setGame] = useState<GameId>("royal-checkers");
  const { search, counts, error: queueError, start: startSearch, cancel: cancelSearch } = useQuickMatch();
  const { create, creating, error: inviteError } = useCreateInvite();
  const busy = creating ? "invite" : null;
  const error = queueError ?? inviteError;

  // A resumed search may be for the other game — show its chip.
  useEffect(() => { if (search) setGame(search.game); }, [search]);

  const createInvite = () => create(game);
  const signinHref = `/signin?next=${encodeURIComponent(returnTo)}`;
  const gameLabel = (g: GameId) => GAMES.find((x) => x.id === g)?.label ?? g;


  return (
    <Panel aria-labelledby="play-online-title">
      <Title id="play-online-title">Play online</Title>
      <Sub>Real opponents, live board, ranked results.</Sub>

      <Games role="radiogroup" aria-label="Game">
        {GAMES.map((g) => (
          <GameChip
            key={g.id}
            type="button"
            role="radio"
            aria-checked={game === g.id}
            $on={game === g.id}
            disabled={!!search}
            onClick={() => setGame(g.id)}
          >
            {g.label}
            {counts && counts[g.id] > 0 && <Count>{counts[g.id]} searching</Count>}
          </GameChip>
        ))}
      </Games>

      {search ? (
        <Searching role="status" aria-live="polite">
          <Spinner aria-hidden="true" />
          <div>
            <strong>Finding an opponent for {gameLabel(search.game)}…</strong>
            <Small>
              {search.waitedSeconds}s waited
              {search.rating > 0 && <> · your rating {Math.round(search.rating)} · matching within ±{search.window}</>}
            </Small>
          </div>
          <Ghost type="button" onClick={cancelSearch}>Cancel</Ghost>
        </Searching>
      ) : !signedIn ? (
        <Actions>
          <GoldLink href={signinHref}>Sign in to play online</GoldLink>
          <GhostLink href={`/signup?next=${encodeURIComponent(returnTo)}`}>Create a free account</GhostLink>
        </Actions>
      ) : (
        <Actions>
          <Gold type="button" onClick={() => startSearch(game)} disabled={busy !== null}>
            Find opponent
          </Gold>
          <Ghost type="button" onClick={createInvite} disabled={busy !== null}>
            {busy === "invite" ? "Creating link…" : "Play a friend (invite link)"}
          </Ghost>
        </Actions>
      )}

      {error && <ErrorBanner role="alert">{error}</ErrorBanner>}
    </Panel>
  );
}

const Panel = styled.section`
  max-width: 640px;
  margin: 0 auto 36px;
  padding: 22px;
  background: var(--bg2, #0d0b08);
  border: 1px solid var(--gold, #c9a227);
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(201, 162, 39, 0.2), 0 10px 30px rgba(0, 0, 0, 0.4);
  color: var(--text, #f5f0e8);
  text-align: left;
`;
const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: 1.35rem;
  margin: 0 0 4px;
  color: var(--gold-light, #f0c040);
`;
const Sub = styled.p`
  margin: 0 0 16px;
  color: var(--text-muted, #a89880);
  font-size: 0.92rem;
`;
const Games = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;
const GameChip = styled.button<{ $on: boolean }>`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 9px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  background: ${(p) => (p.$on ? "rgba(201,162,39,.14)" : "transparent")};
  color: ${(p) => (p.$on ? "var(--gold-light,#f0c040)" : "var(--text,#f5f0e8)")};
  border: 1px solid ${(p) => (p.$on ? "var(--gold,#c9a227)" : "var(--border,#2a2218)")};
  &:disabled { cursor: default; opacity: 0.7; }
  &:focus-visible { outline: 2px solid var(--gold-light, #f0c040); outline-offset: 2px; }
`;
const Count = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  color: #6fcf8a;
`;
const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
const btn = `
  display: inline-flex; align-items: center; justify-content: center;
  padding: 11px 18px; border-radius: 8px; font-size: 0.95rem; font-weight: 700;
  cursor: pointer; text-decoration: none;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid var(--gold-light, #f0c040); outline-offset: 2px; }
`;
const Gold = styled.button`
  ${btn}
  border: none;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
`;
const GoldLink = styled(Link)`
  ${btn}
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
`;
const Ghost = styled.button`
  ${btn}
  background: transparent;
  color: var(--text, #f5f0e8);
  border: 1px solid var(--border, #2a2218);
  &:hover:not(:disabled) { border-color: var(--gold, #c9a227); color: var(--gold-light, #f0c040); }
`;
const GhostLink = styled(Link)`
  ${btn}
  background: transparent;
  color: var(--text, #f5f0e8);
  border: 1px solid var(--border, #2a2218);
  &:hover { border-color: var(--gold, #c9a227); color: var(--gold-light, #f0c040); }
`;
const Searching = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border: 1px dashed var(--gold, #c9a227);
  border-radius: 8px;
  > div { flex: 1; min-width: 180px; }
`;
const Small = styled.div`
  font-size: 0.8rem;
  color: var(--text-muted, #a89880);
  margin-top: 3px;
`;
const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(201, 162, 39, 0.3);
  border-top-color: var(--gold-light, #f0c040);
  animation: spin 0.9s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const ErrorBanner = styled.div`
  margin-top: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--status-urgent, #ff6b7a);
  background: rgba(255, 107, 122, 0.08);
  border: 1px solid var(--status-urgent, #ff6b7a);
`;
