"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Wrap, SectionEyebrow } from "./shared";

const LAUNCH = new Date("2026-11-19T12:00:00-05:00").getTime();

const Section = styled.section`
  background: #0d0b08;
  border-top: 1px solid #1a1510;
  border-bottom: 1px solid #1a1510;
  padding: 56px 0;
  text-align: center;
`;

const DateLine = styled.p`
  color: #f5f0e8;
  font-family: 'Cinzel', serif;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  margin: 6px 0 28px;
`;

const Grid = styled.div`
  display: flex;
  gap: clamp(10px, 2.4vw, 32px);
  justify-content: center;
  flex-wrap: wrap;
  align-items: flex-start;

  @media (max-width: 480px) {
    gap: 18px 24px;
  }
`;

const Cell = styled.div`
  text-align: center;
  min-width: 72px;

  @media (max-width: 480px) {
    min-width: 64px;
  }
`;

const Num = styled.div`
  font-family: 'Cinzel', serif;
  font-size: clamp(2.4rem, 6vw, 4.8rem);
  font-weight: 900;
  color: #f0c040;
  line-height: 1;
  letter-spacing: -0.02em;
  min-width: 2ch;
  display: inline-block;
  text-shadow: 0 0 24px rgba(240, 192, 64, 0.18);

  @media (max-width: 420px) {
    min-width: 1.5ch;
  }
`;

const Label = styled.div`
  color: #c9a227;
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-top: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
`;

const Sep = styled.div`
  font-family: 'Cinzel', serif;
  font-size: clamp(2rem, 5vw, 4rem);
  color: #6b5a30;
  line-height: 1;
  padding-top: 4px;

  @media (max-width: 480px) {
    display: none;
  }
`;

const Footnote = styled.p`
  color: #7a6a5a;
  font-size: 0.85rem;
  margin: 24px 0 0;
  font-family: 'Inter', sans-serif;
  font-style: italic;
`;

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

function compute() {
  let delta = Math.max(0, LAUNCH - Date.now());
  const days = Math.floor(delta / 86400000);
  delta -= days * 86400000;
  const hours = Math.floor(delta / 3600000);
  delta -= hours * 3600000;
  const minutes = Math.floor(delta / 60000);
  delta -= minutes * 60000;
  const seconds = Math.floor(delta / 1000);
  return { days, hours, minutes, seconds };
}

export default function Countdown() {
  const [t, setT] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(
    null,
  );

  useEffect(() => {
    const update = () => setT(compute());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const d = t?.days ?? 0;
  const h = t ? pad(t.hours) : "--";
  const m = t ? pad(t.minutes) : "--";
  const s = t ? pad(t.seconds) : "--";

  return (
    <Section>
      <Wrap>
        <SectionEyebrow>Kickstarter Launches In</SectionEyebrow>
        <DateLine>November 19, 2026 · 12:00 PM EST</DateLine>
        <Grid>
          <Cell>
            <Num>{t ? d : "--"}</Num>
            <Label>Days</Label>
          </Cell>
          <Sep>:</Sep>
          <Cell>
            <Num>{h}</Num>
            <Label>Hours</Label>
          </Cell>
          <Sep>:</Sep>
          <Cell>
            <Num>{m}</Num>
            <Label>Minutes</Label>
          </Cell>
          <Sep>:</Sep>
          <Cell>
            <Num>{s}</Num>
            <Label>Seconds</Label>
          </Cell>
        </Grid>
        <Footnote>Until Sphere of Kings goes live on Kickstarter</Footnote>
      </Wrap>
    </Section>
  );
}
