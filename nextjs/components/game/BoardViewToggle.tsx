"use client";

// A small segmented control that flips between the flat playable board
// and the 3D sphere "overview" preview. The sphere view imports Three
// dynamically so the WebGL stack code-splits off the main bundle.

import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import type { SpherePiece, SphereCell, LegalDest } from "./SphereBoardView";
import { PHONE_LANDSCAPE } from "@/lib/app-routes";
import { useFullscreenLandscape } from "./useFullscreenLandscape";

const SphereBoardView = dynamic(() => import("./SphereBoardView"), {
  ssr: false,
  loading: () => (
    <Loading className="sok-board-area sok-sphere">Loading sphere view…</Loading>
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
  // Viewer plays the side whose home rows are the high row numbers.
  flipped?: boolean;
};

// The player's flat/sphere choice carries across games and visits.
const VIEW_KEY = "sok.board.view";
// Once dismissed, the "turn sideways" tip stays away.
const ROTATE_HINT_KEY = "sok.rotateHint.dismissed";

export default function BoardViewToggle({
  cols,
  rows,
  pieces,
  children,
  selected,
  legalDests,
  onCellClick,
  flipped,
}: Props) {
  const [mode, setModeState] = useState<"flat" | "sphere">("flat");
  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_KEY) === "sphere") setModeState("sphere");
    } catch { /* storage blocked — default to flat */ }
  }, []);
  const setMode = (m: "flat" | "sphere") => {
    setModeState(m);
    try { localStorage.setItem(VIEW_KEY, m); } catch { /* not persisted */ }
  };

  const [hintDismissed, setHintDismissed] = useState(true);
  useEffect(() => {
    try { setHintDismissed(localStorage.getItem(ROTATE_HINT_KEY) === "1"); }
    catch { setHintDismissed(false); }
  }, []);
  const dismissHint = () => {
    setHintDismissed(true);
    try { localStorage.setItem(ROTATE_HINT_KEY, "1"); } catch { /* not persisted */ }
  };

  const fullscreen = useFullscreenLandscape();

  return (
    <>
      <Toolbar>
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
      {fullscreen.supported && (
        <FsBtn type="button" onClick={fullscreen.toggle} aria-pressed={fullscreen.active}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            {fullscreen.active
              ? <path d="M5 1v4H1M9 1v4h4M5 13V9H1M9 13V9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              : <path d="M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          {fullscreen.active ? "Exit full screen" : "Full screen"}
        </FsBtn>
      )}
      </Toolbar>

      {mode === "flat" && !hintDismissed && (
        <RotateHint className="sok-rotate-hint" role="note">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="7" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 16a9 9 0 0 0 9 6l-2-2m2 2-2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Turn your phone sideways for a bigger board.</span>
          <button type="button" onClick={dismissHint} aria-label="Dismiss tip">×</button>
        </RotateHint>
      )}

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
            flipped={flipped}
          />
          <SphereHint className="sok-sphere-hint">
            Tap a piece, then a highlighted square. Drag to turn the
            sphere · pinch or scroll to zoom.
          </SphereHint>
        </>
      )}
    </>
  );
}

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  @media ${PHONE_LANDSCAPE} { flex-direction: column; align-items: stretch; }
`;

const FsBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: 1px solid #2e2618;
  background: transparent;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &[aria-pressed="true"] { color: #f0c040; border-color: #c9a227; }
  @media ${PHONE_LANDSCAPE} { margin-bottom: 0; }
`;

// Only for phones held upright: elsewhere the board already has room.
const RotateHint = styled.div`
  display: none;
  @media (orientation: portrait) and (max-width: 600px) {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 8px 8px 12px;
    border-radius: 10px;
    background: rgba(240, 192, 64, 0.08);
    color: #e8dfcc;
    font-family: "Inter", sans-serif;
    font-size: 13px;
    svg { flex-shrink: 0; color: #f0c040; }
    span { flex: 1; }
    button {
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: #a89880;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
    }
  }
`;

const Switcher = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 10px;
  align-self: flex-start;
  margin-bottom: 10px;
  @media ${PHONE_LANDSCAPE} {
    flex-direction: column;
    align-self: stretch;
    margin-bottom: 0;
  }
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
