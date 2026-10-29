"use client";

// Modal that pops when an Imperial Kings pawn reaches the promotion
// rank with more than one candidate piece. The player picks queen,
// rook, bishop, or knight; the chosen Move is passed back and the
// parent applies it exactly like any other move.

import styled from "styled-components";
import type { PieceKind, Color } from "@/lib/games/imperial-kings/engine";

const GLYPH: Record<string, string> = {
  "white-queen": "♛",
  "white-rook": "♜",
  "white-bishop": "♝",
  "white-knight": "♞",
  "black-queen": "♛",
  "black-rook": "♜",
  "black-bishop": "♝",
  "black-knight": "♞",
};

const LABEL: Record<PieceKind, string> = {
  queen: "Queen",
  rook: "Rook",
  bishop: "Bishop",
  knight: "Knight",
  pawn: "Pawn",
  king: "King",
};

export type PromotionPickerProps = {
  color: Color;
  kinds: PieceKind[]; // typically ["queen", "rook", "bishop", "knight"]
  onPick: (kind: PieceKind) => void;
  onCancel: () => void;
};

export default function PromotionPicker({
  color,
  kinds,
  onPick,
  onCancel,
}: PromotionPickerProps) {
  return (
    <Scrim role="dialog" aria-modal="true" aria-labelledby="promo-title" onClick={onCancel}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Title id="promo-title">Promote your pawn</Title>
        <Sub>Pick which piece to upgrade to.</Sub>
        <Grid>
          {kinds.map((k) => (
            <Choice key={k} type="button" onClick={() => onPick(k)}>
              <Glyph $white={color === "white"}>
                {GLYPH[`${color}-${k}`] ?? "?"}
              </Glyph>
              <ChoiceLabel>{LABEL[k]}</ChoiceLabel>
            </Choice>
          ))}
        </Grid>
        <Cancel type="button" onClick={onCancel}>
          Cancel
        </Cancel>
      </Panel>
    </Scrim>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 200;
  padding: 20px;
`;

const Panel = styled.div`
  background: #0e0c09;
  border: 1px solid #c9a227;
  border-radius: 14px;
  padding: 24px;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  color: #f5f0e8;
  font-weight: 800;
  font-size: 1.3rem;
  margin: 0 0 4px;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  color: #a89880;
  font-size: 0.88rem;
  margin: 0 0 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  @media (max-width: 420px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Choice = styled.button`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 10px;
  padding: 16px 10px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
  &:hover {
    border-color: #c9a227;
    background: #221c15;
    transform: translateY(-1px);
  }
`;

const Glyph = styled.span<{ $white: boolean }>`
  font-size: 2.5rem;
  line-height: 1;
  color: ${(p) => (p.$white ? "#f0e6c6" : "#1a1510")};
  text-shadow: ${(p) =>
    p.$white
      ? "0 0 1px #6b5a3a, 0 1px 2px rgba(0,0,0,0.4)"
      : "0 0 1px #000, 0 1px 2px rgba(0,0,0,0.6)"};
`;

const ChoiceLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #f5f0e8;
  font-weight: 600;
`;

const Cancel = styled.button`
  margin-top: 16px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  color: #a89880;
  border: 1px solid #2e2618;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  &:hover { color: #f0c040; border-color: #c9a227; }
`;
