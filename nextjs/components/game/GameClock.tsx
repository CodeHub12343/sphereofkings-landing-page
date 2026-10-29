"use client";

// Two-sided chess clock. Decrements the player who's currently to move;
// hitting zero ends the game as a loss for that side. Optional —
// defaults off; a "Start clock" toggle in the parent switches it on.

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

type Props = {
  perSideSeconds: number;              // e.g. 600 = 10 minutes each
  toMove: "a" | "b";                   // which clock ticks right now
  running: boolean;                    // paused when game over or dialogs open
  myLabel: string;                     // "You"
  opponentLabel: string;               // "Computer"
  mySide: "a" | "b";
  onFlag: (side: "a" | "b") => void;   // called once when a side's clock hits 0
};

export default function GameClock({
  perSideSeconds,
  toMove,
  running,
  myLabel,
  opponentLabel,
  mySide,
  onFlag,
}: Props) {
  const [aLeft, setALeft] = useState(perSideSeconds);
  const [bLeft, setBLeft] = useState(perSideSeconds);
  const flaggedRef = useRef<"a" | "b" | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Reset whenever perSideSeconds changes — treats that as "new game".
  useEffect(() => {
    setALeft(perSideSeconds);
    setBLeft(perSideSeconds);
    flaggedRef.current = null;
    lastTickRef.current = Date.now();
  }, [perSideSeconds]);

  useEffect(() => {
    if (!running || flaggedRef.current) return;
    lastTickRef.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      if (toMove === "a") {
        setALeft((v) => {
          const next = Math.max(0, v - dt);
          if (next <= 0 && !flaggedRef.current) {
            flaggedRef.current = "a";
            onFlag("a");
          }
          return next;
        });
      } else {
        setBLeft((v) => {
          const next = Math.max(0, v - dt);
          if (next <= 0 && !flaggedRef.current) {
            flaggedRef.current = "b";
            onFlag("b");
          }
          return next;
        });
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, toMove, onFlag]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Row>
      <Clock
        $active={toMove === "a" && running}
        $urgent={aLeft < 30}
        $isMe={mySide === "a"}
      >
        <Who>{mySide === "a" ? myLabel : opponentLabel}</Who>
        <Time>{fmt(aLeft)}</Time>
      </Clock>
      <Clock
        $active={toMove === "b" && running}
        $urgent={bLeft < 30}
        $isMe={mySide === "b"}
      >
        <Who>{mySide === "b" ? myLabel : opponentLabel}</Who>
        <Time>{fmt(bLeft)}</Time>
      </Clock>
    </Row>
  );
}

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const Clock = styled.div<{ $active: boolean; $urgent: boolean; $isMe: boolean }>`
  background: ${(p) => (p.$active ? "#1a1612" : "#0e0c09")};
  border: 1.5px solid ${(p) =>
    p.$urgent && p.$active
      ? "#c62b44"
      : p.$active
        ? "#c9a227"
        : "#2e2618"};
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: border-color 0.2s, background 0.2s;
`;

const Who = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a89880;
  font-weight: 600;
`;

const Time = styled.div`
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  color: #f5f0e8;
  font-variant-numeric: tabular-nums;
`;
