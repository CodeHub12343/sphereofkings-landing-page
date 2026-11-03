"use client";

// Bottom dock for games against the computer (Royal Checkers, Imperial
// Kings): Undo · New game · Options. Less-used settings (difficulty,
// sides, clock, resign) live in the Options sheet so the board keeps
// the screen.

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { GameDock, DockButton } from "@/components/app/GameDock";
import BottomSheet from "@/components/app/BottomSheet";
import { DifficultySlider } from "./DifficultySlider";
import ResignButton from "./ResignButton";
import type { Difficulty } from "@/lib/games/difficulty";

interface Props {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  onUndo: () => void;
  canUndo: boolean;
  onNewGame: () => void;
  // True once moves have been played in an unfinished game — New game
  // then needs a confirming second tap so a stray thumb doesn't wipe it.
  inProgress: boolean;
  onSwitchSides: () => void;
  sideLabel: string;
  clockOn: boolean;
  onToggleClock: () => void;
  onResign: () => void;
  gameOver: boolean;
  legend?: React.ReactNode;
}

export default function VsComputerDock(p: Props) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    if (!confirmNew) return;
    const id = setTimeout(() => setConfirmNew(false), 3000);
    return () => clearTimeout(id);
  }, [confirmNew]);

  const newGame = () => {
    if (p.inProgress && !confirmNew) {
      setConfirmNew(true);
      return;
    }
    setConfirmNew(false);
    p.onNewGame();
  };

  return (
    <>
      <GameDock>
        <DockButton icon="undo" label="Undo" onClick={p.onUndo} disabled={!p.canUndo} />
        <DockButton
          icon="plus"
          label={confirmNew ? "Tap to confirm" : "New game"}
          tone={confirmNew ? "armed" : "default"}
          onClick={newGame}
        />
        <DockButton icon="more" label="Options" onClick={() => setOptionsOpen(true)} />
      </GameDock>

      <BottomSheet open={optionsOpen} onClose={() => setOptionsOpen(false)} title="Game options">
        <Group>
          <DifficultySlider value={p.difficulty} onChange={p.onDifficulty} />
        </Group>
        <Group>
          <OptionRow>
            <span>
              <strong>Your side</strong>
              <small>{p.sideLabel}</small>
            </span>
            <SmallBtn type="button" onClick={p.onSwitchSides}>Switch</SmallBtn>
          </OptionRow>
          <OptionRow>
            <span>
              <strong>Chess clock</strong>
              <small>10 minutes per side</small>
            </span>
            <Toggle
              type="button"
              role="switch"
              aria-checked={p.clockOn}
              aria-label="Chess clock"
              onClick={p.onToggleClock}
            >
              <span />
            </Toggle>
          </OptionRow>
          <OptionRow>
            <span>
              <strong>Resign</strong>
              <small>Concede this game</small>
            </span>
            <ResignButton
              disabled={p.gameOver}
              onResign={() => { p.onResign(); setOptionsOpen(false); }}
            />
          </OptionRow>
        </Group>
        {p.legend && <Legend>{p.legend}</Legend>}
        <RulesLink href="/how-to-play">How to play →</RulesLink>
      </BottomSheet>
    </>
  );
}

const Group = styled.div`
  padding: 14px 0;
  border-bottom: 1px solid #2a2218;
  &:first-child { padding-top: 4px; }
`;
const OptionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  > span { display: flex; flex-direction: column; gap: 2px; }
  strong { font-size: 0.95rem; }
  small { font-size: 0.8rem; color: var(--text-muted, #a89880); }
`;
const SmallBtn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #2a2218;
  background: transparent;
  color: var(--text, #f5f0e8);
  font-weight: 600;
  cursor: pointer;
  &:hover { border-color: var(--gold, #c9a227); }
`;
const Toggle = styled.button`
  position: relative;
  width: 48px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 14px;
  border: 1px solid #2a2218;
  background: #1a150e;
  cursor: pointer;
  span {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6a5d48;
    transition: transform 0.18s ease, background 0.18s ease;
  }
  &[aria-checked="true"] { background: rgba(201, 162, 39, 0.25); border-color: var(--gold, #c9a227); }
  &[aria-checked="true"] span { transform: translateX(20px); background: var(--gold-light, #f0c040); }
`;
const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 0;
  font-size: 0.85rem;
  color: var(--text-muted, #a89880);
  border-bottom: 1px solid #2a2218;
`;
const RulesLink = styled(Link)`
  display: inline-block;
  margin-top: 14px;
  color: var(--gold-light, #f0c040);
  font-weight: 600;
  text-decoration: none;
`;
