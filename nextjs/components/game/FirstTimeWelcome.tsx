"use client";

// First-game welcome overlay. Shown once per game slug per browser
// (localStorage key per game), so a returning player never sees it
// again unless they explicitly ask by clicking "Show again" from the
// how-to-play page.
//
// Explains the two things that make this game different from classic
// draughts / chess: the 14-column cylindrical board and the seam that
// wraps column 14 ↔ column 1.

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";

type Props = {
  gameSlug: "royal-checkers" | "imperial-kings";
  gameName: string;        // e.g. "Royal Checkers"
  rulesHref?: string;      // link to /how-to-play
};

const storageKey = (slug: string) => `sok.welcome.v1.${slug}`;

export default function FirstTimeWelcome({
  gameSlug,
  gameName,
  rulesHref = "/how-to-play",
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey(gameSlug));
      if (!seen) setOpen(true);
    } catch {
      // Private mode / no storage — just skip; don't annoy the user
      // with the overlay on every page load.
    }
  }, [gameSlug]);

  const close = () => {
    try { localStorage.setItem(storageKey(gameSlug), new Date().toISOString()); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  const bulletsByGame = gameSlug === "royal-checkers"
    ? [
        "The board is a spherical cylinder — 14 columns around, 8 rows top-to-bottom.",
        "Columns 14 and 1 are neighbours. A piece on column 14 can jump to column 1 and the other way around.",
        "Standard draughts rules otherwise: diagonal moves, mandatory captures, multi-jump combos, kinged pieces move backward too.",
      ]
    : [
        "The board is a spherical cylinder — 14 columns around, 8 rows top-to-bottom.",
        "You get two kings per side. Win by capturing BOTH opposing kings — there is no check or checkmate.",
        "Rooks, bishops and queens slide across the seam (column 14 → 1). Knights jump across it too.",
      ];

  return (
    <Scrim onClick={close} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <Panel onClick={(e) => e.stopPropagation()}>
        <Eyebrow>Welcome to {gameName}</Eyebrow>
        <Title id="welcome-title">Three things to know about the sphere</Title>
        <Bullets>
          {bulletsByGame.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </Bullets>
        <Preview aria-hidden="true">
          <PreviewLabel>The seam wraps around</PreviewLabel>
          <MiniBoardRow>
            {Array.from({ length: 14 }).map((_, i) => (
              <MiniSquare key={i} $dark={i % 2 === 0} $edge={i === 0 || i === 13} />
            ))}
          </MiniBoardRow>
          <PreviewHint>←  column 14 and column 1 are neighbours  →</PreviewHint>
        </Preview>
        <Actions>
          <Primary type="button" onClick={close}>
            Got it — let me play
          </Primary>
          <Secondary href={rulesHref} onClick={close}>
            Read the full rules
          </Secondary>
        </Actions>
      </Panel>
    </Scrim>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
  z-index: 150;
  padding: 20px;
  animation: sokFadeIn 0.25s ease-out;
  @keyframes sokFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

const Panel = styled.div`
  background: #0e0c09;
  border: 1px solid #c9a227;
  border-radius: 14px;
  padding: 28px clamp(18px, 4vw, 32px);
  max-width: 540px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(240, 192, 64, 0.08) inset;
  animation: sokRise 0.3s ease-out;
  @keyframes sokRise {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const Eyebrow = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c9a227;
  font-weight: 700;
  margin: 0 0 6px;
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  color: #f5f0e8;
  font-weight: 800;
  font-size: clamp(1.25rem, 3vw, 1.55rem);
  margin: 0 0 16px;
  line-height: 1.2;
`;

const Bullets = styled.ul`
  margin: 0 0 20px;
  padding: 0 0 0 18px;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  line-height: 1.55;
  li { margin-bottom: 8px; }
  li::marker { color: #c9a227; }
`;

const Preview = styled.div`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
`;

const PreviewLabel = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #a89880;
  margin-bottom: 8px;
  text-align: center;
`;

const MiniBoardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 0;
  border: 2px solid #c9a227;
  border-radius: 4px;
  overflow: hidden;
  height: 32px;
`;

const MiniSquare = styled.div<{ $dark: boolean; $edge: boolean }>`
  background: ${(p) => (p.$dark ? "#171310" : "#f1ecde")};
  position: relative;
  ${(p) =>
    p.$edge &&
    `box-shadow: inset 0 0 0 2px #f0c040;`}
`;

const PreviewHint = styled.p`
  margin: 8px 0 0;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #f0c040;
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Primary = styled.button`
  flex: 1;
  min-width: 180px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 12px 20px;
  border-radius: 10px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  &:hover { box-shadow: 0 0 24px rgba(240, 192, 64, 0.3); }
`;

const Secondary = styled(Link)`
  padding: 12px 18px;
  border: 1px solid #2e2618;
  border-radius: 10px;
  color: #a89880;
  text-decoration: none;
  font-family: "Inter", sans-serif;
  font-size: 0.86rem;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { color: #f0c040; border-color: #c9a227; }
`;
