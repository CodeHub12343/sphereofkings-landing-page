"use client";

// Brand primitives shared across every feature page: Card, FormField,
// Button, Chip, Section headings. Matches the landing's Features /
// Showcase / Contact styles.

import styled, { css } from "styled-components";

export const FCard = styled.div`
  background: var(--bg3, #111009);
  border: 1px solid var(--border, #2a2218);
  border-radius: 10px;
  padding: 22px 22px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #4a3c1e;
    box-shadow: 0 4px 24px rgba(201, 162, 39, 0.06);
  }

  h3, h2 {
    font-family: "Cinzel", Georgia, serif;
    color: var(--text, #f5f0e8);
    font-size: 1.05rem;
    margin: 0 0 10px;
    font-weight: 700;
  }

  p {
    color: var(--text-muted, #a89880);
    font-size: 0.94rem;
    line-height: 1.6;
    margin: 0;
  }
`;

export const FCardLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
`;

export const FGrid = styled.div<{ $min?: string }>`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(${(p) => p.$min ?? "260px"}, 1fr));
`;

export const FEyebrow = styled.div`
  color: var(--gold, #c9a227);
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

export const FSectionTitle = styled.h2`
  font-family: "Cinzel", Georgia, serif;
  color: var(--gold-light, #f0c040);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin: 0 0 16px;
`;

export const FLabel = styled.label`
  font-family: "Cinzel", Georgia, serif;
  color: var(--text-muted, #a89880);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const inputBase = css`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 6px;
  color: var(--text, #f5f0e8);
  font-family: "Inter", system-ui, sans-serif;
  font-size: 1rem;
  padding: 12px 14px;
  width: 100%;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--gold, #c9a227);
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
  }
  &::placeholder {
    color: #5a4a38;
  }
`;

export const FInput = styled.input`${inputBase}`;
export const FTextarea = styled.textarea`${inputBase} resize: vertical; min-height: 120px;`;
export const FSelect = styled.select`${inputBase}`;

export const FField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const btnBase = css`
  display: inline-block;
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 11px 24px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: box-shadow 0.2s, background-position 0.3s, border-color 0.2s, color 0.2s;
  border: none;

  &:disabled { opacity: 0.55; cursor: not-allowed; }
  &:focus-visible { outline: 3px solid var(--gold-light, #f0c040); outline-offset: 3px; }
`;

export const FBtnGold = styled.button`
  ${btnBase}
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  background-size: 200% auto;
  color: #0a0a0a;

  &:hover:not(:disabled) {
    background-position: right center;
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
`;

export const FBtnGhost = styled.button`
  ${btnBase}
  background: transparent;
  color: var(--text, #f5f0e8);
  border: 1px solid var(--border, #2a2218);

  &:hover:not(:disabled) {
    border-color: var(--gold, #c9a227);
    color: var(--gold-light, #f0c040);
  }
`;

export const FBtnDanger = styled.button`
  ${btnBase}
  background: transparent;
  color: var(--status-urgent, #ff6b7a);
  border: 1px solid var(--status-urgent, #ff6b7a);

  &:hover:not(:disabled) {
    background: rgba(255, 107, 122, 0.08);
  }
`;

export const FBtnGoldLink = styled.a`${btnBase}
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  background-size: 200% auto;
  color: #0a0a0a !important;
  -webkit-text-fill-color: #0a0a0a;
  &:hover { background-position: right center; box-shadow: 0 0 24px rgba(240,192,64,.3); }
`;

export const FChip = styled.span<{ $tone?: "gold" | "muted" | "danger" | "success" | "info" }>`
  display: inline-block;
  padding: 3px 10px;
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border-radius: 20px;
  border: 1px solid;
  ${(p) => {
    switch (p.$tone) {
      case "danger":
        return css`background:rgba(255,107,122,.08);color:var(--status-urgent,#ff6b7a);border-color:var(--status-urgent,#ff6b7a);`;
      case "success":
        return css`background:rgba(79,176,125,.08);color:var(--status-online,#4fb07d);border-color:var(--status-online,#4fb07d);`;
      case "info":
        return css`background:rgba(76,124,224,.1);color:var(--minor-badge,#4c7ce0);border-color:var(--minor-badge,#4c7ce0);`;
      case "muted":
        return css`background:var(--bg2,#0d0b08);color:var(--text-muted,#a89880);border-color:var(--border,#2a2218);`;
      default:
        return css`background:rgba(201,162,39,.08);color:var(--gold-light,#f0c040);border-color:var(--gold,#c9a227);`;
    }
  }}
`;

export const FBanner = styled.div<{ $tone?: "info" | "success" | "danger" }>`
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 0.92rem;
  line-height: 1.55;
  ${(p) => {
    switch (p.$tone) {
      case "danger":
        return css`background:rgba(255,107,122,.08);color:var(--status-urgent,#ff6b7a);border:1px solid var(--status-urgent,#ff6b7a);`;
      case "success":
        return css`background:rgba(79,176,125,.08);color:var(--status-online,#4fb07d);border:1px solid var(--status-online,#4fb07d);`;
      default:
        return css`background:rgba(76,124,224,.08);color:var(--text,#f5f0e8);border:1px solid var(--minor-badge,#4c7ce0);`;
    }
  }}
`;
