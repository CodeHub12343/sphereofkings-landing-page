"use client";

import { useEffect, useCallback } from "react";
import styled from "styled-components";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  bodyMarkdown: string;
}

/**
 * Centre-anchored modal that shows the owner's full product copy.
 * The short description stays on the detail page card; this surface
 * carries the richly-formatted long-form reward description with the
 * headers, bullets, emojis, and section breaks the owner wrote.
 *
 * UX:
 *   • Esc, backdrop click, or close button dismisses.
 *   • Body scroll is locked while open.
 *   • Modal content scrolls independently.
 *   • Full-height on phones; centered + max-width on desktop.
 *   • Markdown rendered via lib/markdown — same renderer as /blog.
 */
export default function FullDetailsModal({ open, onClose, title, bodyMarkdown }: Props) {
  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  const html = renderMarkdown(bodyMarkdown);

  return (
    <Backdrop onClick={close} aria-hidden={!open}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="product-full-title"
              onClick={(e) => e.stopPropagation()}>
        <Header>
          <Eyebrow>Full product description</Eyebrow>
          <Title id="product-full-title">{title}</Title>
          <CloseBtn onClick={close} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M6 18 18 6" />
            </svg>
          </CloseBtn>
        </Header>
        <Body>
          <Prose dangerouslySetInnerHTML={{ __html: html }} />
        </Body>
        <Footer>
          <GoldBtn onClick={close}>Close</GoldBtn>
        </Footer>
      </Dialog>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(0px, 4vw, 40px);
  animation: fade 0.2s ease-out;
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
`;

const Dialog = styled.div`
  background: var(--bg2, #0d0b08);
  border: 1px solid var(--gold, #c9a227);
  border-radius: 14px;
  width: min(760px, 100%);
  max-height: min(92vh, 920px);
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(201, 162, 39, 0.1);
  overflow: hidden;
  animation: pop 0.2s ease-out;
  @keyframes pop {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @media (max-width: 600px) {
    max-height: 100vh;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

const Header = styled.div`
  position: relative;
  padding: 20px 60px 20px 24px;
  border-bottom: 1px solid var(--border, #2a2218);
  background: linear-gradient(180deg, #0f0d0a 0%, var(--bg2, #0d0b08) 100%);
`;

const Eyebrow = styled.div`
  font-family: "Cinzel", Georgia, serif;
  color: var(--gold, #c9a227);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const Title = styled.h2`
  font-family: "Cinzel", Georgia, serif;
  color: var(--gold-light, #f0c040);
  font-size: clamp(1.1rem, 2.4vw, 1.4rem);
  line-height: 1.3;
  margin: 0;
  font-weight: 700;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px; right: 16px;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--bg3, #111009);
  color: var(--text-muted, #a89880);
  border: 1px solid var(--border, #2a2218);
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  &:hover { color: var(--gold-light, #f0c040); border-color: var(--gold, #c9a227); }
  &:focus-visible { outline: 3px solid var(--gold-light, #f0c040); outline-offset: 2px; }
`;

const Body = styled.div`
  padding: 22px 26px 10px;
  overflow-y: auto;
  flex: 1;
  color: var(--text, #f5f0e8);
`;

const Prose = styled.article`
  font-family: "Inter", system-ui, sans-serif;
  font-size: 0.98rem;
  line-height: 1.75;
  color: var(--text, #f5f0e8);

  h1, h2, h3 {
    font-family: "Cinzel", Georgia, serif;
    color: var(--gold-light, #f0c040);
    letter-spacing: 0.02em;
    margin: 1.4em 0 0.5em;
    line-height: 1.3;
  }
  h1 { font-size: 1.35rem; }
  h2 { font-size: 1.15rem; }
  h3 { font-size: 1.02rem; }
  h1:first-child, h2:first-child, h3:first-child { margin-top: 0; }

  p { margin: 0 0 1em; }
  ul, ol { margin: 0.4em 0 1em; padding-left: 1.4em; }
  li { margin-bottom: 0.4em; }
  strong { color: var(--gold-light, #f0c040); font-weight: 700; }
  em { color: var(--text, #f5f0e8); }

  blockquote {
    border-left: 3px solid var(--gold, #c9a227);
    padding-left: 14px;
    margin: 1em 0;
    color: var(--text-muted, #a89880);
    font-style: italic;
  }

  code {
    background: var(--bg3, #111009);
    border: 1px solid var(--border, #2a2218);
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 0.88em;
  }

  a { color: var(--gold-light, #f0c040); }
  a:hover { color: var(--gold, #c9a227); }
`;

const Footer = styled.div`
  padding: 14px 24px 20px;
  border-top: 1px solid var(--border, #2a2218);
  display: flex; justify-content: flex-end;
  background: var(--bg2, #0d0b08);
`;

const GoldBtn = styled.button`
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700; font-size: 0.84rem;
  letter-spacing: 0.14em; text-transform: uppercase;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  background-size: 200% auto;
  color: #0a0a0a; border: none; border-radius: 6px;
  padding: 10px 22px; cursor: pointer;
  transition: background-position 0.3s, box-shadow 0.3s;
  &:hover { background-position: right center; box-shadow: 0 0 20px rgba(240, 192, 64, 0.3); }
`;
