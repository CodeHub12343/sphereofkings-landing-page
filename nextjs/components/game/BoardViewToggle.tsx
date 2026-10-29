"use client";

// A small segmented control that flips between the flat playable board
// and the 3D sphere "overview" preview. The sphere view imports Three
// dynamically so the WebGL stack code-splits off the main bundle.

import { ReactNode, useState } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import type { SpherePiece, SphereCell, LegalDest } from "./SphereBoardView";

const SphereBoardView = dynamic(() => import("./SphereBoardView"), {
  ssr: false,
  loading: () => (
    <Loading>Loading sphere view…</Loading>
  ),
});

type Props = {
  cols: number;
  rows: number;
  pieces: SpherePiece[];
  children: ReactNode; // the flat board
  // Interactive props — when supplied, the sphere becomes fully
  // playable. onCellClick receives (col, row) in exactly the same way
  // the flat board's square-click handler does, so the parent can
  // reuse its existing move logic.
  selected?: SphereCell | null;
  legalDests?: LegalDest[];
  onCellClick?: (cell: SphereCell) => void;
};

export default function BoardViewToggle({
  cols,
  rows,
  pieces,
  children,
  selected,
  legalDests,
  onCellClick,
}: Props) {
  const [mode, setMode] = useState<"flat" | "sphere">("flat");
  return (
    <>
      <Switcher role="tablist" aria-label="Board view">
        <Btn
          type="button"
          role="tab"
          aria-selected={mode === "flat"}
          $on={mode === "flat"}
          onClick={() => setMode("flat")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 1v12M9 1v12M1 5h12M1 9h12" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          Flat board
        </Btn>
        <Btn
          type="button"
          role="tab"
          aria-selected={mode === "sphere"}
          $on={mode === "sphere"}
          onClick={() => setMode("sphere")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
            <ellipse cx="7" cy="7" rx="6" ry="2.3" stroke="currentColor" strokeWidth="1.1" fill="none" />
            <ellipse cx="7" cy="7" rx="2.3" ry="6" stroke="currentColor" strokeWidth="1.1" fill="none" />
          </svg>
          Sphere board
        </Btn>
      </Switcher>

      {mode === "flat" ? (
        children
      ) : (
        <>
          <SphereBoardView
            cols={cols}
            rows={rows}
            pieces={pieces}
            selected={selected}
            legalDests={legalDests}
            onCellClick={onCellClick}
          />
          <SphereHint>
            Tap a piece to select it, then tap a gold ring to move.
            Drag empty space to rotate · scroll to zoom.
          </SphereHint>
        </>
      )}
    </>
  );
}

const Switcher = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 10px;
  align-self: flex-start;
  margin-bottom: 10px;
`;

const Btn = styled.button<{ $on: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 7px;
  border: 0;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${(p) => (p.$on ? "#0a0a0a" : "#a89880")};
  background: ${(p) =>
    p.$on
      ? "linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%)"
      : "transparent"};
  transition: color 0.15s, background 0.15s;
  &:hover { color: ${(p) => (p.$on ? "#0a0a0a" : "#f0c040")}; }
`;

const Beta = styled.span`
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  color: inherit;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Loading = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 560px;
  background: linear-gradient(180deg, #15110c 0%, #0a0806 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 14px;
`;

const SphereHint = styled.p`
  margin: 10px 0 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
`;
