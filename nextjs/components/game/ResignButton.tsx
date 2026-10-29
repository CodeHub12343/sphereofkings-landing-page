"use client";

// Resign / give-up button. Shows a two-step confirm so a stray tap
// doesn't throw a game away. On confirm the parent decides what to do:
// single-player games end the local game; multiplayer calls the
// /api/matches/[id]/resign endpoint.

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";

type Props = {
  onResign: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;        // default "Resign"
  confirmLabel?: string; // default "Resign for real"
};

export default function ResignButton({
  onResign,
  disabled,
  label = "Resign",
  confirmLabel = "Resign for real",
}: Props) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Disarm after 4s so a half-tapped confirm doesn't linger.
  useEffect(() => {
    if (!armed) return;
    timeoutRef.current = setTimeout(() => setArmed(false), 4000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [armed]);

  if (!armed) {
    return (
      <Base
        type="button"
        disabled={disabled}
        onClick={() => setArmed(true)}
      >
        {label}
      </Base>
    );
  }
  return (
    <Row>
      <Confirm
        type="button"
        disabled={disabled || busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onResign();
          } finally {
            setBusy(false);
            setArmed(false);
          }
        }}
      >
        {busy ? "Resigning…" : confirmLabel}
      </Confirm>
      <Cancel type="button" onClick={() => setArmed(false)}>
        Cancel
      </Cancel>
    </Row>
  );
}

const Base = styled.button`
  background: transparent;
  color: #a89880;
  border: 1px solid #2e2618;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  &:hover:not(:disabled) {
    border-color: #c62b44;
    color: #ff6b7a;
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const Row = styled.div`
  display: inline-flex;
  gap: 6px;
  align-items: center;
`;

const Confirm = styled.button`
  background: #c62b44;
  color: #fff;
  border: 1px solid #c62b44;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  &:hover:not(:disabled) { background: #a01830; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Cancel = styled.button`
  background: transparent;
  color: #a89880;
  border: 1px solid #2e2618;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  &:hover { color: #f0c040; border-color: #c9a227; }
`;
