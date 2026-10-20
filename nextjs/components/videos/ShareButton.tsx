"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface Props {
  // Content hint for the native Share Sheet title line.
  title: string;
  // Content hint for the native Share Sheet body / posted-link preamble.
  text: string;
  // The anchor on /videos the shared URL should jump to (video id).
  // The share URL ends up as `${origin}/videos#${hash}`.
  hash?: string;
}

/**
 * Share button for video cards + the landing-page hero video.
 *
 *  • On devices that expose the Web Share API (every modern phone,
 *    recent desktop Safari / Edge), one tap opens the native share
 *    sheet with the OS-provided target picker.
 *  • On the rest, a styled popover offers copy-link + direct intents
 *    for WhatsApp, X, Facebook, Reddit, and email.
 *
 * The share URL always goes to the Videos gallery with the specific
 * video's anchor, so when the shared link is opened the page scrolls
 * to and auto-focuses that video.
 */
export default function ShareButton({ title, text, hash }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const shareUrl = useCallback((): string => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    return hash ? `${origin}/videos#${hash}` : `${origin}/videos`;
  }, [hash]);

  const onClick = useCallback(async () => {
    if (canNativeShare) {
      try {
        await navigator.share({ title, text, url: shareUrl() });
        return;
      } catch {
        // User dismissed or the API threw — fall back to popover.
      }
    }
    setOpen((o) => !o);
  }, [canNativeShare, title, text, shareUrl]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [shareUrl]);

  // Close the popover when clicking outside or pressing Esc.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const url = encodeURIComponent(shareUrl());
  const t = encodeURIComponent(text);

  return (
    <Wrap>
      <Btn ref={btnRef} onClick={onClick} aria-expanded={open} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </Btn>
      {open && !canNativeShare && (
        <Popover ref={popoverRef} role="menu">
          <Row>
            <Chip onClick={copy} type="button">
              {copied ? "Copied ✓" : "Copy link"}
            </Chip>
          </Row>
          <Grid>
            <Social href={`https://wa.me/?text=${t}%20${url}`} target="_blank" rel="noopener">WhatsApp</Social>
            <Social href={`https://twitter.com/intent/tweet?text=${t}&url=${url}`} target="_blank" rel="noopener">X / Twitter</Social>
            <Social href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noopener">Facebook</Social>
            <Social href={`https://www.reddit.com/submit?url=${url}&title=${t}`} target="_blank" rel="noopener">Reddit</Social>
            <Social href={`mailto:?subject=${encodeURIComponent(title)}&body=${t}%20${url}`}>Email</Social>
          </Grid>
        </Popover>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`position:relative;display:inline-flex;`;

const Btn = styled.button`
  display: inline-flex; align-items: center; gap: 8px;
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700; font-size: 0.76rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  background: transparent;
  color: var(--gold-light, #f0c040);
  border: 1px solid var(--gold, #c9a227);
  border-radius: 999px;
  padding: 8px 14px; cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, color 0.2s;

  &:hover {
    background: rgba(201, 162, 39, 0.08);
    box-shadow: 0 0 18px rgba(201, 162, 39, 0.15);
  }
  &:focus-visible {
    outline: 3px solid var(--gold-light, #f0c040);
    outline-offset: 2px;
  }
`;

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 40;
  min-width: 220px;
  padding: 10px;
  background: var(--bg2, #0d0b08);
  border: 1px solid var(--gold, #c9a227);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: in 0.15s ease-out;
  @keyframes in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const Row = styled.div`display:flex;gap:6px;`;

const Chip = styled.button`
  flex: 1;
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700; font-size: 0.72rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: none; border-radius: 6px;
  padding: 8px 12px; cursor: pointer;
  transition: background-position 0.3s, box-shadow 0.3s;
  background-size: 200% auto;
  &:hover { background-position: right center; box-shadow: 0 0 18px rgba(240, 192, 64, 0.3); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const Social = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 10px;
  background: var(--bg3, #111009);
  color: var(--text, #f5f0e8);
  border: 1px solid var(--border, #2a2218);
  border-radius: 5px;
  font-size: 0.78rem;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
  &:hover {
    border-color: var(--gold, #c9a227);
    color: var(--gold-light, #f0c040);
  }
`;
