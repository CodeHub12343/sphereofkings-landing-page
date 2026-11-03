"use client";

// The game app's home screen (/play). Layout, top to bottom:
//   greeting → (your turn) → game switch → one primary action (Quick
//   match) + two secondary tiles → today's puzzle → waiting → more.
// Visual rules: one gold call-to-action per screen, surfaces instead of
// outlines, Cinzel only for the greeting, sentence-case section titles.

import { useEffect, useState } from "react";
import Link from "next/link";
import styled, { css } from "styled-components";
import type { GameId } from "@/lib/db/collections/players";
import { useCreateInvite, useQuickMatch } from "@/components/game/usePlayOnline";
import AppIcon, { AppIconName } from "./AppIcon";
import BottomSheet from "./BottomSheet";

export interface HomeMatch {
  id: string;
  kind: "invite" | "your-move" | "their-move";
  game: GameId;
  opponent: string;
  turnExpiresAt: string | null;
}

interface Props {
  player: { displayName: string } | null;
  ratings: Record<GameId, number | null>;
  yourTurn: HomeMatch[];
  waiting: HomeMatch[];
  daily: { slug: string; title: string; game: GameId; tier: string; prompt: string } | null;
}

const GAMES: Array<{ id: GameId; label: string; short: string }> = [
  { id: "royal-checkers", label: "Royal Checkers", short: "Checkers" },
  { id: "imperial-kings", label: "Imperial Kings", short: "Kings" },
];
const gameLabel = (g: GameId) => GAMES.find((x) => x.id === g)?.label ?? g;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function timeLeft(iso: string | null): string | null {
  if (!iso) return null;
  const s = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  if (s <= 0) return null;
  if (s < 60) return `${s}s left`;
  return `${Math.floor(s / 60)}m left`;
}

export default function PlayHome({ player, ratings, yourTurn, waiting, daily }: Props) {
  const [game, setGame] = useState<GameId>("royal-checkers");
  // Greeting and countdowns depend on the device clock — render them
  // after mount so server and client markup agree.
  const [hello, setHello] = useState("Welcome");
  const [, tick] = useState(0);
  useEffect(() => {
    setHello(greeting());
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const quick = useQuickMatch();
  const invite = useCreateInvite();
  const error = quick.error ?? invite.error;
  const signinHref = "/signin?next=%2Fplay";
  const online = quick.counts?.[game] ?? 0;

  return (
    <Main>
      <Hello>
        <Eyebrow>{hello}</Eyebrow>
        <Name>{player ? player.displayName : "Welcome to the court"}</Name>
        {player ? (
          <Sub>
            {GAMES.map((g, i) => (
              <span key={g.id}>
                {i > 0 && <Sep aria-hidden="true">·</Sep>}
                {g.short} <strong>{ratings[g.id] ?? "unrated"}</strong>
              </span>
            ))}
          </Sub>
        ) : (
          <Sub>
            Play the computer now, no account needed.{" "}
            <InlineLink href="/signup?next=%2Fplay">Create a free account</InlineLink> to play online.
          </Sub>
        )}
      </Hello>

      {yourTurn.length > 0 && (
        <Section aria-labelledby="h-turn">
          <SectionHead><h2 id="h-turn">Your turn</h2><Link href="/matches">See all</Link></SectionHead>
          <Rows>
            {yourTurn.slice(0, 3).map((m) => (
              <RowLink key={m.id} href={`/match/${m.id}`}>
                <LiveDot aria-hidden="true" />
                <RowText>
                  <strong>{m.kind === "invite" ? `${m.opponent} challenged you` : `vs ${m.opponent}`}</strong>
                  <span>
                    {gameLabel(m.game)}
                    {m.kind === "invite" ? " · tap to respond" : timeLeft(m.turnExpiresAt) ? ` · ${timeLeft(m.turnExpiresAt)}` : ""}
                  </span>
                </RowText>
                <Chevron><AppIcon name="chevron" size={18} /></Chevron>
              </RowLink>
            ))}
          </Rows>
        </Section>
      )}

      <Section id="online" aria-label="Start a game">
        <Segmented role="radiogroup" aria-label="Game">
          {GAMES.map((g) => (
            <SegBtn
              key={g.id}
              type="button"
              role="radio"
              aria-checked={game === g.id}
              onClick={() => setGame(g.id)}
            >
              {g.label}
            </SegBtn>
          ))}
        </Segmented>

        <Action
          Link={PrimaryLink}
          Button={PrimaryButton}
          href={player ? undefined : signinHref}
          onClick={player ? () => quick.start(game) : undefined}
        >
          <PrimaryIcon><AppIcon name="bolt" size={22} /></PrimaryIcon>
          <PrimaryText>
            <strong>Quick match</strong>
            <span>
              {player ? "Paired with a player near your rating" : "Sign in to find an opponent"}
              {online > 0 && ` · ${online} searching`}
            </span>
          </PrimaryText>
          <AppIcon name="chevron" size={20} />
        </Action>

        <Pair>
          <Action
            Link={SecondaryLink}
            Button={SecondaryButton}
            href={player ? undefined : signinHref}
            onClick={player ? () => { if (!invite.creating) void invite.create(game); } : undefined}
          >
            <SecondaryIcon><AppIcon name="link" size={20} /></SecondaryIcon>
            <strong>{invite.creating ? "Creating…" : "Play a friend"}</strong>
            <span>Send an invite link</span>
          </Action>
          <SecondaryLink href={`/play/${game}`}>
            <SecondaryIcon><AppIcon name="cpu" size={20} /></SecondaryIcon>
            <strong>vs Computer</strong>
            <span>Easy to expert</span>
          </SecondaryLink>
        </Pair>
        {error && <ErrorText role="alert">{error}</ErrorText>}
      </Section>

      {daily && (
        <Section aria-labelledby="h-daily">
          <SectionHead><h2 id="h-daily">Today&apos;s puzzle</h2><Link href="/puzzles">See all</Link></SectionHead>
          <RowLink href={`/puzzles/${daily.slug}`}>
            <Tile aria-hidden="true"><AppIcon name="puzzle" size={20} /></Tile>
            <RowText>
              <strong>{daily.title}</strong>
              <span>{gameLabel(daily.game)} · {daily.tier.charAt(0).toUpperCase() + daily.tier.slice(1)}</span>
            </RowText>
            <Chevron><AppIcon name="chevron" size={18} /></Chevron>
          </RowLink>
        </Section>
      )}

      {waiting.length > 0 && (
        <Section aria-labelledby="h-wait">
          <SectionHead><h2 id="h-wait">Waiting on opponent</h2></SectionHead>
          <Rows>
            {waiting.slice(0, 3).map((m) => (
              <RowLink key={m.id} href={`/match/${m.id}`}>
                <IdleDot aria-hidden="true" />
                <RowText>
                  <strong>vs {m.opponent}</strong>
                  <span>{gameLabel(m.game)} · their move</span>
                </RowText>
                <Chevron><AppIcon name="chevron" size={18} /></Chevron>
              </RowLink>
            ))}
          </Rows>
        </Section>
      )}

      <Section aria-labelledby="h-more">
        <SectionHead><h2 id="h-more">More</h2></SectionHead>
        <List>
          <MoreLink href="/tournaments" icon="trophy" label="Tournaments" />
          <MoreLink href="/champions" icon="swords" label="Champions" />
          <MoreLink href="/how-to-play" icon="book" label="How to play" />
          <MoreLink href="/" icon="globe" label="Sphere of Kings website" />
        </List>
      </Section>

      <BottomSheet
        open={!!quick.search}
        onClose={() => void quick.cancel()}
        title="Finding an opponent"
      >
        {quick.search && (
          <Searching role="status" aria-live="polite">
            <Spinner aria-hidden="true" />
            <strong>{gameLabel(quick.search.game)}</strong>
            <span>
              {quick.search.waitedSeconds}s waited
              {quick.search.rating > 0 && <> · rating {Math.round(quick.search.rating)} · ±{quick.search.window}</>}
            </span>
            <p>Keep this screen open — the game starts automatically when someone is found.</p>
            <CancelBtn type="button" onClick={() => void quick.cancel()}>Cancel search</CancelBtn>
          </Searching>
        )}
      </BottomSheet>
    </Main>
  );
}

// Signed-out visitors get a link to sign in; signed-in players get a
// button that starts the action. Same look either way.
function Action({ Link: L, Button: B, href, onClick, children }: {
  Link: React.ComponentType<{ href: string; children: React.ReactNode }>;
  Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return href
    ? <L href={href}>{children}</L>
    : <B type="button" onClick={onClick}>{children}</B>;
}

function MoreLink({ href, icon, label }: { href: string; icon: AppIconName; label: string }) {
  return (
    <ListItem href={href}>
      <AppIcon name={icon} size={20} />
      <span>{label}</span>
      <Chevron><AppIcon name="chevron" size={18} /></Chevron>
    </ListItem>
  );
}

/* ---------- tokens ---------- */
const SURFACE = "#13100c";
const SURFACE_HI = "#1a1610";
const HAIRLINE = "rgba(255, 255, 255, 0.06)";
const MUTED = "#9a8d78";
const GOLD = "#f0c040";

/* ---------- layout ---------- */
const Main = styled.main`
  max-width: 640px;
  margin: 0 auto;
  padding: 24px max(20px, env(safe-area-inset-right)) 8px max(20px, env(safe-area-inset-left));
  color: var(--text, #f5f0e8);
`;
const Section = styled.section`
  margin-top: 32px;
  scroll-margin-top: 80px;
`;
const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text, #f5f0e8);
  }
  a { font-size: 0.85rem; color: ${MUTED}; text-decoration: none; }
  a:hover { color: ${GOLD}; }
`;

/* ---------- greeting ---------- */
const Hello = styled.header`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const Eyebrow = styled.span`
  font-size: 0.85rem;
  color: ${MUTED};
`;
const Name = styled.h1`
  margin: 0;
  font-family: "Cinzel", serif;
  font-size: clamp(1.5rem, 6.5vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  color: ${GOLD};
`;
const Sub = styled.p`
  margin: 6px 0 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${MUTED};
  strong { color: var(--text, #f5f0e8); font-weight: 600; }
`;
const Sep = styled.span`margin: 0 8px; opacity: 0.6;`;
const InlineLink = styled(Link)`
  color: ${GOLD};
  text-decoration: none;
  font-weight: 600;
  &:hover { color: ${GOLD}; text-decoration: underline; }
`;

/* ---------- game switch ---------- */
const Segmented = styled.div`
  display: flex;
  padding: 3px;
  margin-bottom: 14px;
  border-radius: 12px;
  background: ${SURFACE};
`;
const SegBtn = styled.button`
  flex: 1;
  padding: 9px 6px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: ${MUTED};
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  &[aria-checked="true"] {
    background: ${SURFACE_HI};
    color: var(--text, #f5f0e8);
    box-shadow: 0 1px 0 ${HAIRLINE} inset, 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  &:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
`;

/* ---------- primary action ---------- */
const pressable = `
  cursor: pointer;
  text-decoration: none;
  font: inherit;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s ease, filter 0.15s ease, background 0.15s ease;
  &:active { transform: scale(0.98); }
  &:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 3px; }
`;
const primaryCss = css`
  ${pressable}
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 18px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(135deg, #c99a22 0%, #f0c040 55%, #d8a92c 100%);
  color: #120e06;
  box-shadow: 0 8px 24px rgba(240, 192, 64, 0.18);
  > svg { flex-shrink: 0; opacity: 0.7; }
  &:hover { color: #120e06; filter: brightness(1.05); }
`;
const PrimaryLink = styled(Link)`${primaryCss}`;
const PrimaryButton = styled.button`${primaryCss}`;
const PrimaryIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(18, 14, 6, 0.12);
`;
const PrimaryText = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  strong { font-size: 1.05rem; font-weight: 700; }
  span { font-size: 0.82rem; opacity: 0.75; }
`;

/* ---------- secondary actions ---------- */
const Pair = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
`;
const secondaryCss = css`
  ${pressable}
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 16px;
  border: 0;
  border-radius: 16px;
  background: ${SURFACE};
  color: var(--text, #f5f0e8);
  strong { margin-top: 10px; font-size: 0.95rem; font-weight: 600; }
  span { font-size: 0.78rem; color: ${MUTED}; }
  &:hover { color: var(--text, #f5f0e8); background: ${SURFACE_HI}; }
`;
const SecondaryLink = styled(Link)`${secondaryCss}`;
const SecondaryButton = styled.button`${secondaryCss}`;
const SecondaryIcon = styled.span`
  display: inline-flex;
  color: ${GOLD};
`;
const ErrorText = styled.p`
  margin: 12px 0 0;
  color: #ff6b7a;
  font-size: 0.85rem;
`;

/* ---------- rows (your turn, puzzle, waiting) ---------- */
const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const RowLink = styled(Link)`
  ${pressable}
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: ${SURFACE};
  color: var(--text, #f5f0e8);
  &:hover { color: var(--text, #f5f0e8); background: ${SURFACE_HI}; }
`;
const RowText = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  strong {
    font-size: 0.95rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span { font-size: 0.8rem; color: ${MUTED}; }
`;
const Tile = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: ${SURFACE_HI};
  color: ${GOLD};
`;
const Chevron = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: #5e5444;
`;
const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin: 0 4px;
  border-radius: 50%;
  background: #6fcf8a;
  box-shadow: 0 0 0 4px rgba(111, 207, 138, 0.15);
`;
const IdleDot = styled(LiveDot)`
  background: #5a4e3a;
  box-shadow: none;
`;

/* ---------- more ---------- */
const List = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: ${SURFACE};
`;
const ListItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  color: var(--text, #f5f0e8);
  font-size: 0.95rem;
  text-decoration: none;
  & + & { border-top: 1px solid ${HAIRLINE}; }
  > svg { color: ${MUTED}; flex-shrink: 0; }
  > span:not(:last-child) { flex: 1; }
  &:hover, &:active { background: ${SURFACE_HI}; color: var(--text, #f5f0e8); }
`;

/* ---------- quick-match sheet ---------- */
const Searching = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0 6px;
  text-align: center;
  strong { font-family: "Cinzel", serif; font-size: 1.1rem; color: ${GOLD}; }
  span { font-size: 0.85rem; color: ${MUTED}; }
  p { margin: 8px 0 12px; font-size: 0.85rem; color: ${MUTED}; }
`;
const Spinner = styled.span`
  width: 36px;
  height: 36px;
  margin-bottom: 6px;
  border-radius: 50%;
  border: 3px solid rgba(201, 162, 39, 0.25);
  border-top-color: ${GOLD};
  animation: sok-spin 0.9s linear infinite;
  @keyframes sok-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const CancelBtn = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 12px;
  border-radius: 12px;
  border: 0;
  background: ${SURFACE_HI};
  color: var(--text, #f5f0e8);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  &:hover { background: #221c14; }
`;
