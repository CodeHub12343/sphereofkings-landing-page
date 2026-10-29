"use client";

// End-of-game modal — rematch, share, close. Pops when the term flips
// out of "ongoing". Also shows rating delta if the ranked result
// reports one (requires useRankedResult to have reported).

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";

type Outcome = "win" | "loss" | "draw";

type Props = {
  outcome: Outcome;
  reason: string;                   // e.g. "no moves" / "both kings captured" / "resignation"
  gameName: string;                 // "Royal Checkers" | "Imperial Kings"
  onRematch: () => void;
  onClose: () => void;
  shareText?: string;               // "I just won Royal Checkers on sphereofkings.com. Try it."
  shareUrl?: string;
  ratingDelta?: number | null;      // +12 after a ranked win, -9 after a loss, 0 draw
  newRating?: number | null;
};

export default function PostGameModal({
  outcome,
  reason,
  gameName,
  onRematch,
  onClose,
  shareText = "I just played on sphereofkings.com",
  shareUrl = typeof window !== "undefined" ? window.location.origin : "https://sphereofkings.com",
  ratingDelta,
  newRating,
}: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Small delay so the overlay feels like a reaction to the game
    // ending, not an interruption to the final move's animation.
    const t = setTimeout(() => setVisible(true), 450);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const headline =
    outcome === "win" ? "Victory"
      : outcome === "loss" ? "Defeat"
        : "Draw";
  const tone =
    outcome === "win" ? "#f0c040"
      : outcome === "loss" ? "#ff6b7a"
        : "#a89880";

  const share = async () => {
    const payload = { title: `${gameName} — ${headline}`, text: shareText, url: shareUrl };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(`${payload.text} ${payload.url}`);
      }
    } catch {}
  };

  return (
    <Scrim role="dialog" aria-modal="true" aria-labelledby="pg-title" onClick={onClose}>
      <Panel $tone={tone} onClick={(e) => e.stopPropagation()}>
        <Eyebrow>{gameName}</Eyebrow>
        <Headline id="pg-title" $tone={tone}>{headline}</Headline>
        <Reason>{reason}</Reason>

        {ratingDelta != null && newRating != null && (
          <RatingBlock>
            <RatingDelta $up={ratingDelta >= 0}>
              {ratingDelta >= 0 ? "+" : ""}{ratingDelta}
              <Arrow>{ratingDelta >= 0 ? "↑" : "↓"}</Arrow>
            </RatingDelta>
            <RatingNow>
              Rating now <strong>{newRating}</strong>
            </RatingNow>
          </RatingBlock>
        )}

        <Actions>
          <Primary type="button" onClick={onRematch}>Rematch</Primary>
          <Secondary type="button" onClick={share}>Share</Secondary>
          <Tertiary type="button" onClick={onClose}>Close</Tertiary>
        </Actions>
        <HubLink href="/play">← Back to game hub</HubLink>
      </Panel>
    </Scrim>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
  z-index: 180;
  padding: 20px;
  animation: pgFade 0.3s ease-out;
  @keyframes pgFade { from { opacity: 0; } to { opacity: 1; } }
`;

const Panel = styled.div<{ $tone: string }>`
  background: #0e0c09;
  border: 1px solid ${(p) => p.$tone};
  border-radius: 14px;
  padding: 28px clamp(20px, 4vw, 36px);
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.65),
    0 0 60px ${(p) => p.$tone}22;
  animation: pgRise 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);
  @keyframes pgRise {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const Eyebrow = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a89880;
  font-weight: 600;
  margin: 0 0 4px;
`;

const Headline = styled.h2<{ $tone: string }>`
  font-family: "Cinzel", serif;
  font-weight: 800;
  font-size: clamp(2rem, 5vw, 2.6rem);
  margin: 0 0 6px;
  color: ${(p) => p.$tone};
  letter-spacing: 0.04em;
`;

const Reason = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  color: #a89880;
  margin: 0 0 20px;
`;

const RatingBlock = styled.div`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 10px;
  padding: 14px;
  margin: 0 auto 20px;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
`;

const RatingDelta = styled.div<{ $up: boolean }>`
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 1.8rem;
  color: ${(p) => (p.$up ? "#4fb07d" : "#ff6b7a")};
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
`;

const Arrow = styled.span`
  font-size: 1.4rem;
`;

const RatingNow = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #a89880;
  strong { color: #f5f0e8; font-weight: 700; }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 16px;
`;

const Primary = styled.button`
  padding: 12px 22px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  font-family: "Cinzel", serif;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.9rem;
  cursor: pointer;
  flex: 1;
  min-width: 100px;
  &:hover { box-shadow: 0 0 24px rgba(240, 192, 64, 0.3); }
`;

const Secondary = styled.button`
  padding: 12px 20px;
  border: 1px solid #c9a227;
  border-radius: 10px;
  background: transparent;
  color: #f0c040;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 0.86rem;
  cursor: pointer;
  flex: 1;
  min-width: 90px;
  &:hover { background: rgba(240, 192, 64, 0.08); }
`;

const Tertiary = styled.button`
  padding: 12px 18px;
  border: 1px solid #2e2618;
  border-radius: 10px;
  background: transparent;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;
  cursor: pointer;
  flex: 1;
  min-width: 80px;
  &:hover { color: #f5f0e8; border-color: #4a3f32; }
`;

const HubLink = styled(Link)`
  display: inline-block;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  text-decoration: none;
  &:hover { color: #f0c040; }
`;
