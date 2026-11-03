"use client";

// What a friend sees when they open an invite link. Signed in: one
// click takes the open seat. Signed out: sign-in / sign-up links that
// bring them straight back here afterwards.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";

interface Props {
  matchId: string;
  hostName: string;
  game: string;
  signedIn: boolean;
}

export default function JoinInvite({ matchId, hostName, game, signedIn }: Props) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = encodeURIComponent(`/match/${matchId}`);

  const join = async () => {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${matchId}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not join this game.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Panel>
      <h2>{hostName} invited you to play</h2>
      <p>A live game of <strong>{game}</strong>. {hostName} moves first; you play the second side.</p>
      {signedIn ? (
        <Row>
          <Primary type="button" onClick={join} disabled={joining}>
            {joining ? "Joining…" : "Join the game"}
          </Primary>
        </Row>
      ) : (
        <Row>
          <PrimaryLink href={`/signin?next=${back}`}>Sign in to join</PrimaryLink>
          <SecondaryLink href={`/signup?next=${back}`}>Create a free account</SecondaryLink>
        </Row>
      )}
      {error && <ErrorBanner role="alert">{error}</ErrorBanner>}
    </Panel>
  );
}

const Panel = styled.div`
  max-width: 560px;
  padding: 22px;
  background: var(--bg2, #0d0b08);
  border: 1px solid var(--gold, #c9a227);
  border-radius: 10px;
  color: var(--text, #f5f0e8);
  h2 { margin: 0 0 10px; font-size: 20px; color: var(--gold-light, #f0c040); }
  p { margin: 0 0 16px; }
`;
const Row = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const base = `
  display:inline-flex;align-items:center;border-radius:6px;padding:10px 16px;
  font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;
  &:disabled{opacity:.6;cursor:not-allowed;}
`;
const Primary = styled.button`
  ${base}
  background:var(--gold,#c9a227);color:#000;border:none;
  &:hover:not(:disabled){background:var(--gold-light,#f0c040);}
`;
const PrimaryLink = styled(Link)`
  ${base}
  background:var(--gold,#c9a227);color:#000;
  &:hover{background:var(--gold-light,#f0c040);}
`;
const SecondaryLink = styled(Link)`
  ${base}
  background:transparent;color:var(--text,#f5f0e8);border:1px solid var(--border,#2a2218);
  &:hover{border-color:var(--gold,#c9a227);}
`;
const ErrorBanner = styled.div`
  margin-top:12px;padding:8px 10px;border-radius:6px;font-size:13px;
  color:var(--status-urgent,#ff6b7a);background:rgba(255,107,122,.08);
  border:1px solid var(--status-urgent,#ff6b7a);
`;
