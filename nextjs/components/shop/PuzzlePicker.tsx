"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import type { PuzzleDesignOption } from "@/lib/products";

interface Props {
  productSlug: string;
  options: PuzzleDesignOption[];
}

const STORAGE_KEY = (slug: string) => `sok.puzzle-choice.${slug}`;

/**
 * Puzzle design picker for the "Pick Your Puzzle" + "Puzzle Pre-Picks"
 * rewards. The picked design is stored under a per-product localStorage
 * key so checkout can read it when the order is placed. The server-side
 * order step validates the stored value against the product's options.
 */
export default function PuzzlePicker({ productSlug, options }: Props) {
  const [choice, setChoice] = useState<string>(() => options[0]?.slug ?? "");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(productSlug));
      if (saved && options.some((o) => o.slug === saved)) setChoice(saved);
    } catch {}
  }, [productSlug, options]);

  const pick = (slug: string) => {
    setChoice(slug);
    try { localStorage.setItem(STORAGE_KEY(productSlug), slug); } catch {}
  };

  return (
    <Wrap>
      <Label>Choose your puzzle design</Label>
      <Grid>
        {options.map((o) => (
          <Tile key={o.slug} $active={choice === o.slug} onClick={() => pick(o.slug)}
                type="button" aria-pressed={choice === o.slug}>
            <ImgBox>
              <Image src={o.image} alt={o.label} width={200} height={200}
                     sizes="(max-width:600px) 50vw, 160px"
                     style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </ImgBox>
            <Name>{o.label}</Name>
            {choice === o.slug && <Checkmark>✓</Checkmark>}
          </Tile>
        ))}
      </Grid>
      <Caption>Your selection is saved and sent with your order.</Caption>
    </Wrap>
  );
}

const Wrap = styled.div`
  margin:24px 0;padding:16px;border:1px solid var(--border,#2a2218);
  border-radius:10px;background:var(--bg2,#0d0b08);
`;
const Label = styled.div`
  font-family:"Cinzel",Georgia,serif;color:var(--gold-light,#f0c040);
  font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:12px;
`;
const Grid = styled.div`
  display:grid;gap:10px;
  grid-template-columns:repeat(auto-fill,minmax(130px,1fr));
`;
const Tile = styled.button<{ $active: boolean }>`
  position:relative;background:var(--bg3,#111009);
  border:2px solid ${(p)=>p.$active?"var(--gold,#c9a227)":"var(--border,#2a2218)"};
  border-radius:8px;padding:6px;cursor:pointer;display:flex;flex-direction:column;gap:6px;
  box-shadow:${(p)=>p.$active?"0 0 0 2px rgba(201,162,39,.25)":"none"};
  transition:border-color .2s,box-shadow .2s;
  &:hover{border-color:var(--gold,#c9a227);}
`;
const ImgBox = styled.div`aspect-ratio:1/1;overflow:hidden;border-radius:4px;background:#000;`;
const Name = styled.span`
  font-family:"Cinzel",Georgia,serif;font-size:0.78rem;color:var(--text,#f5f0e8);
  letter-spacing:0.08em;text-transform:uppercase;text-align:center;
`;
const Checkmark = styled.span`
  position:absolute;top:8px;right:8px;background:var(--gold,#c9a227);color:#000;
  width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;
`;
const Caption = styled.p`
  font-size:0.76rem;color:var(--text-muted,#a89880);margin:10px 0 0;
`;
