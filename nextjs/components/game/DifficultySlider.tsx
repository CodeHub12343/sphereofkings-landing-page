"use client";

import styled from "styled-components";
import { Difficulty, PRESETS, labelFor, clampDifficulty } from "@/lib/games/difficulty";

interface Props {
  value: Difficulty;
  onChange: (next: Difficulty) => void;
  min?: number;
  max?: number;
}

export function DifficultySlider({ value, onChange, min = 1, max = 100 }: Props) {
  return (
    <Wrap>
      <Row>
        <Label>Difficulty</Label>
        <Value>{labelFor(value)} · {value}</Value>
      </Row>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clampDifficulty(Number.parseInt(e.target.value, 10)))}
      />
      <Presets>
        <button type="button" onClick={() => onChange(PRESETS.easy)}>Easy</button>
        <button type="button" onClick={() => onChange(PRESETS.medium)}>Medium</button>
        <button type="button" onClick={() => onChange(PRESETS.hard)}>Hard</button>
      </Presets>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex; flex-direction: column; gap: 6px; min-width: 220px;
  input[type="range"] {
    accent-color: var(--gold, #c9a227);
    width: 100%;
  }
`;
const Row = styled.div`display:flex;justify-content:space-between;align-items:baseline;`;
const Label = styled.span`font-size:13px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.08em;`;
const Value = styled.span`font-size:13px;color:var(--gold-light,#f0c040);font-weight:600;`;
const Presets = styled.div`
  display:flex;gap:6px;
  button{
    flex:1;background:var(--bg2,#0d0b08);color:var(--text-muted,#a89880);
    border:1px solid var(--border,#2a2218);border-radius:5px;padding:5px 8px;
    font-size:12px;cursor:pointer;
  }
  button:hover{color:var(--gold-light,#f0c040);border-color:var(--gold,#c9a227);}
`;
