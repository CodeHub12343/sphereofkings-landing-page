"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  STANDARD_COLORS, SPECIALTY_COLORS, FilamentColor, findColor,
} from "@/lib/filament-colors";

interface Props {
  productSlug: string;
  pattern: "two-color" | "single";
  defaultColors?: [string, string?];
  helper?: string;
}

const KEY = (slug: string) => `sok.color-choice.${slug}`;

/**
 * Shop detail-page picker for 3D-print filament colour.
 *   • two-color: buyer selects exactly 2 distinct colours (slot A + B)
 *   • single   : buyer selects 1 colour (DIY piece sets)
 *
 * Choice is persisted in localStorage under a per-product key so the
 * cart drawer + checkout can read it. The server-side order route
 * validates the ids against ALL_COLORS before saving to the order.
 */
export default function ColorPicker({ productSlug, pattern, defaultColors, helper }: Props) {
  const seed = useMemo<[string, string | null]>(() => {
    const a = defaultColors?.[0] ?? "royal-red";
    const b = pattern === "two-color" ? (defaultColors?.[1] ?? "jet-black") : null;
    return [a, b];
  }, [pattern, defaultColors]);

  const [picked, setPicked] = useState<[string, string | null]>(seed);
  const [showSpecialty, setShowSpecialty] = useState(false);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY(productSlug));
      if (saved) {
        const parsed = JSON.parse(saved) as { a: string; b: string | null };
        if (findColor(parsed.a) && (parsed.b === null || findColor(parsed.b))) {
          setPicked([parsed.a, parsed.b]);
        }
      }
    } catch {}
  }, [productSlug]);

  const commit = useCallback((next: [string, string | null]) => {
    setPicked(next);
    try {
      localStorage.setItem(KEY(productSlug), JSON.stringify({ a: next[0], b: next[1] }));
    } catch {}
  }, [productSlug]);

  const chooseColor = useCallback((id: string) => {
    if (pattern === "single") {
      commit([id, null]);
      return;
    }
    // Two-color: write into the active slot; disallow picking the
    // same colour for both slots.
    const other = activeSlot === 0 ? picked[1] : picked[0];
    if (other === id) return; // ignore — same colour both sides is not allowed
    const next: [string, string | null] = activeSlot === 0
      ? [id, picked[1]]
      : [picked[0], id];
    commit(next);
    setActiveSlot((s) => (s === 0 ? 1 : 0));
  }, [pattern, activeSlot, picked, commit]);

  const colorA = findColor(picked[0]);
  const colorB = picked[1] ? findColor(picked[1]) : undefined;

  return (
    <Wrap>
      <Label>Choose your colours</Label>
      {helper && <Helper>{helper}</Helper>}

      {pattern === "two-color" && (
        <SlotsRow>
          <SlotCard $active={activeSlot === 0} onClick={() => setActiveSlot(0)} type="button">
            <SlotEye>Slot A · colour 1</SlotEye>
            {colorA && <>
              <Dot $color={colorA} />
              <SlotName>{colorA.name}</SlotName>
            </>}
          </SlotCard>
          <SlotCard $active={activeSlot === 1} onClick={() => setActiveSlot(1)} type="button">
            <SlotEye>Slot B · colour 2</SlotEye>
            {colorB && <>
              <Dot $color={colorB} />
              <SlotName>{colorB.name}</SlotName>
            </>}
          </SlotCard>
        </SlotsRow>
      )}

      {pattern === "single" && colorA && (
        <SinglePreview>
          <Dot $color={colorA} />
          <SlotName>{colorA.name}</SlotName>
        </SinglePreview>
      )}

      <SwatchHeader>
        <SwatchHeading>Standard colours</SwatchHeading>
        <SwatchCount>{STANDARD_COLORS.length}</SwatchCount>
      </SwatchHeader>
      <SwatchGrid>
        {STANDARD_COLORS.map((c) => (
          <Swatch key={c.id} $color={c}
                  $selected={picked[0] === c.id || picked[1] === c.id}
                  $disabled={pattern === "two-color" && (
                    (activeSlot === 0 && picked[1] === c.id) ||
                    (activeSlot === 1 && picked[0] === c.id)
                  )}
                  onClick={() => chooseColor(c.id)}
                  type="button"
                  aria-label={c.name}
                  title={c.name}>
            {(picked[0] === c.id || picked[1] === c.id) && <Check>✓</Check>}
          </Swatch>
        ))}
      </SwatchGrid>

      <SpecialtyToggle onClick={() => setShowSpecialty(!showSpecialty)} type="button" aria-expanded={showSpecialty}>
        {showSpecialty ? "▾" : "▸"} Specialty finishes ({SPECIALTY_COLORS.length})
      </SpecialtyToggle>
      {showSpecialty && (
        <>
          <SwatchGrid>
            {SPECIALTY_COLORS.map((c) => (
              <Swatch key={c.id} $color={c}
                      $selected={picked[0] === c.id || picked[1] === c.id}
                      $disabled={pattern === "two-color" && (
                        (activeSlot === 0 && picked[1] === c.id) ||
                        (activeSlot === 1 && picked[0] === c.id)
                      )}
                      onClick={() => chooseColor(c.id)}
                      type="button"
                      aria-label={c.name}
                      title={c.name}>
                {(picked[0] === c.id || picked[1] === c.id) && <Check>✓</Check>}
              </Swatch>
            ))}
          </SwatchGrid>
          {(colorA?.tier === "specialty" && colorA.note) && <Note>{colorA.note}</Note>}
          {(colorB?.tier === "specialty" && colorB.note) && <Note>{colorB.note}</Note>}
        </>
      )}

      <Hint>Your selection is saved and sent to the manufacturer with your order.</Hint>
    </Wrap>
  );
}

/* ----- Styles — matches landing's brand palette ----- */

const Wrap = styled.div`
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--border, #2a2218);
  border-radius: 10px;
  background: var(--bg2, #0d0b08);
`;
const Label = styled.div`
  font-family: "Cinzel", Georgia, serif;
  color: var(--gold-light, #f0c040);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 6px;
`;
const Helper = styled.p`
  color: var(--text-muted, #a89880);
  font-size: 0.86rem;
  line-height: 1.55;
  margin: 0 0 12px;
`;
const SlotsRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;
`;
const SlotCard = styled.button<{ $active: boolean }>`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px; border-radius: 8px; cursor: pointer;
  background: var(--bg3, #111009);
  border: 2px solid ${(p) => (p.$active ? "var(--gold, #c9a227)" : "var(--border, #2a2218)")};
  box-shadow: ${(p) => (p.$active ? "0 0 0 2px rgba(201, 162, 39, 0.25)" : "none")};
  color: var(--text, #f5f0e8);
  transition: border-color 0.2s, box-shadow 0.2s;
  &:hover { border-color: var(--gold, #c9a227); }
`;
const SlotEye = styled.span`
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted, #a89880);
`;
const SinglePreview = styled.div`
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  padding: 10px 14px; background: var(--bg3, #111009);
  border: 1px solid var(--gold, #c9a227); border-radius: 8px;
`;
const Dot = styled.span<{ $color: FilamentColor }>`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${(p) => p.$color.gradient ?? p.$color.hex};
  border: 2px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4);
`;
const SlotName = styled.span`
  font-size: 0.9rem;
  color: var(--text, #f5f0e8);
`;
const SwatchHeader = styled.div`
  display: flex; justify-content: space-between; align-items: baseline;
  margin: 10px 0 8px;
`;
const SwatchHeading = styled.div`
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted, #a89880);
`;
const SwatchCount = styled.span`
  font-size: 0.72rem;
  color: var(--text-muted, #a89880);
`;
const SwatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
`;
const Swatch = styled.button<{ $color: FilamentColor; $selected: boolean; $disabled: boolean }>`
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: ${(p) => p.$color.gradient ?? p.$color.hex};
  border: 2px solid ${(p) =>
    p.$selected ? "var(--gold-light, #f0c040)" :
    p.$disabled ? "rgba(255,255,255,0.03)" :
    "rgba(255,255,255,0.08)"};
  box-shadow: ${(p) =>
    p.$selected ? "0 0 0 2px var(--gold, #c9a227), 0 0 10px rgba(240,192,64,0.4)" :
    "inset 0 1px 3px rgba(0, 0, 0, 0.4)"};
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.35 : 1)};
  transition: transform 0.1s, box-shadow 0.2s;
  &:hover:not(:disabled) { transform: scale(1.08); }
  &:focus-visible { outline: 3px solid var(--gold-light, #f0c040); outline-offset: 2px; }
`;
const Check = styled.span`
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 16px; font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
`;
const SpecialtyToggle = styled.button`
  background: transparent; border: none;
  color: var(--gold-light, #f0c040);
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.74rem; letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; padding: 6px 0; margin: 4px 0;
  &:hover { color: var(--gold, #c9a227); }
`;
const Note = styled.p`
  color: var(--text-muted, #a89880);
  font-size: 0.82rem;
  margin: 8px 0 0;
  padding: 8px 10px;
  background: rgba(201, 162, 39, 0.06);
  border-left: 2px solid var(--gold, #c9a227);
  border-radius: 4px;
`;
const Hint = styled.p`
  font-size: 0.76rem;
  color: var(--text-muted, #a89880);
  margin: 10px 0 0;
`;
