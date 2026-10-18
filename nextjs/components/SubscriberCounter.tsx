"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { SUBSCRIBED_EVENT } from "./shared";

// Reads the live subscriber count from abacus.jasoncameron.dev — a
// public free counter that SignupForm bumps on each successful signup.
// Formspree receives each signup into the operator's inbox, but it
// doesn't expose a public submission count, so abacus is the display
// source. SUBSCRIBED_EVENT (dispatched by SignupForm after a signup)
// triggers a refetch so the number ticks up live without a reload.

const COUNTER_URL =
  "https://abacus.jasoncameron.dev/get/sphereofkings/subscribers";

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
        const r = await fetch(COUNTER_URL, { cache: "no-store" });
        if (!r.ok) return;
        const d = (await r.json()) as { value?: unknown };
        if (!cancelled && typeof d.value === "number") setCount(d.value);
      } catch {
        // Keep the counter hidden rather than render a fabricated
        // fallback when the public counter is unreachable.
      }
    }

    fetchCount();
    window.addEventListener(SUBSCRIBED_EVENT, fetchCount);
    return () => {
      cancelled = true;
      window.removeEventListener(SUBSCRIBED_EVENT, fetchCount);
    };
  }, []);

  if (count === null) return null;

  return (
    <Box aria-live="polite">
      <Dot />
      <span>
        {count === 0 ? (
          <>Be the first supporter to join the Kingdom.</>
        ) : (
          <>
            <strong>{count.toLocaleString()}</strong>{" "}
            {count === 1 ? "supporter has" : "supporters have"} joined the
            Kingdom
          </>
        )}
      </span>
    </Box>
  );
}
