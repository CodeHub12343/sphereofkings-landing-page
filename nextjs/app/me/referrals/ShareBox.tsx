"use client";

import { useState } from "react";
import styled from "styled-components";
import { FBtnGold, FBtnGhost } from "@/components/feature/primitives";

export default function ShareBox({ code, url }: { code: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const text = encodeURIComponent(
    "Check out Sphere of Kings — one spherical board, seven games. Join the Christmas Early Bird:",
  );
  return (
    <Panel>
      <Code>{code}</Code>
      <Url>{url}</Url>
      <Row>
        <FBtnGold type="button" onClick={copy}>{copied ? "Copied ✓" : "Copy link"}</FBtnGold>
        <FBtnGhost as="a" href={`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`} target="_blank" rel="noopener">WhatsApp</FBtnGhost>
        <FBtnGhost as="a" href={`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener">X / Twitter</FBtnGhost>
        <FBtnGhost as="a" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener">Facebook</FBtnGhost>
        <FBtnGhost as="a" href={`mailto:?subject=Sphere%20of%20Kings&body=${text}%20${encodeURIComponent(url)}`}>Email</FBtnGhost>
      </Row>
    </Panel>
  );
}

const Panel = styled.div`
  padding:20px;background:var(--bg2,#0d0b08);
  border:1px solid var(--gold,#c9a227);border-radius:10px;
  display:flex;flex-direction:column;gap:12px;
`;
const Code = styled.div`
  font-family:'Cinzel',serif;font-size:28px;color:var(--gold-light,#f0c040);
  letter-spacing:0.15em;font-weight:700;text-align:center;
`;
const Url = styled.div`
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  background:var(--bg3,#111009);border:1px solid var(--border,#2a2218);
  border-radius:6px;padding:10px 12px;color:var(--text,#f5f0e8);word-break:break-all;
  text-align:center;font-size:14px;
`;
const Row = styled.div`display:flex;gap:8px;flex-wrap:wrap;justify-content:center;`;
