"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { SUBSCRIBED_EVENT } from "./shared";

const NS = "sphereofkings";
const KEY = "subscribers";

const Box = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0 0;
  padding: 10px 14px;
  background: rgba(201, 162, 39, 0.08);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 8px;
  color: #d9c9a8;
  font-size: 0.88rem;
  line-height: 1.4;
  font-family: 'Inter', sans-serif;

  strong {
    color: #f0c040;
    font-weight: 700;
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    letter-spacing: 0.02em;
  }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  animation: pulse-dot 2s ease-out infinite;
  flex-shrink: 0;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default function SubscriberCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const r = await fetch(`https://abacus.jasoncameron.dev/get/${NS}/${KEY}`);
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled && typeof d.value === "number") setCount(d.value);
      } catch {
        /* ignore */
      }
    }

    async function bumpCount() {
      try {
        const r = await fetch(`https://abacus.jasoncameron.dev/hit/${NS}/${KEY}`);
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled && typeof d.value === "number") setCount(d.value);
      } catch {
        /* ignore */
      }
    }

    fetchCount();
    window.addEventListener(SUBSCRIBED_EVENT, bumpCount);
    return () => {
      cancelled = true;
      window.removeEventListener(SUBSCRIBED_EVENT, bumpCount);
    };
  }, []);

  if (count === null) return null;

  return (
    <Box aria-live="polite">
      <Dot />
      <span>
        <strong>{count.toLocaleString()}</strong> early supporters have joined the Kingdom
      </span>
    </Box>
  );
}
