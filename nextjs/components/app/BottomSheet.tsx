"use client";

// Slide-up panel used for game options, rules, chat and confirmations.
// Rendered in a portal so it always sits above the dock and tab bar.
// Closes on backdrop tap, Escape, or a downward swipe on the handle.
// `keepMounted` keeps children alive while closed (e.g. match chat,
// which polls and keeps its draft).

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import AppIcon from "./AppIcon";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  keepMounted?: boolean;
}

export default function BottomSheet({ open, onClose, title, children, keepMounted = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dragStart = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;
  if (!open && !keepMounted) return null;

  const onTouchStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientY; };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - dragStart.current));
  };
  const onTouchEnd = () => {
    if (dragY > 80) onClose();
    dragStart.current = null;
    setDragY(0);
  };

  return createPortal(
    <Layer $open={open} aria-hidden={!open}>
      <Backdrop onClick={onClose} />
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        $open={open}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined}
        inert={!open}
      >
        <HandleZone onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <Handle />
        </HandleZone>
        <Head>
          <h2>{title}</h2>
          <Close type="button" onClick={onClose} aria-label="Close">
            <AppIcon name="close" size={20} />
          </Close>
        </Head>
        <Body>{children}</Body>
      </Panel>
    </Layer>,
    document.body,
  );
}

const Layer = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1200;
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  visibility: ${(p) => (p.$open ? "visible" : "hidden")};
  transition: visibility 0s linear ${(p) => (p.$open ? "0s" : "0.25s")};
`;
const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  ${Layer}[aria-hidden="true"] & { opacity: 0; }
  transition: opacity 0.25s ease;
`;
const Panel = styled.div<{ $open: boolean }>`
  position: absolute;
  left: 50%;
  bottom: 0;
  width: min(100%, 640px);
  max-height: 85dvh;
  display: flex;
  flex-direction: column;
  background: #120f0a;
  border: 1px solid #2a2218;
  border-bottom: 0;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.6);
  padding-bottom: env(safe-area-inset-bottom);
  transform: translate(-50%, ${(p) => (p.$open ? "0" : "100%")});
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
  outline: none;
  color: var(--text, #f5f0e8);
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;
const HandleZone = styled.div`
  padding: 10px 0 4px;
  display: flex;
  justify-content: center;
  touch-action: none;
  cursor: grab;
`;
const Handle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #3a3020;
`;
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 18px 10px;
  h2 {
    margin: 0;
    font-family: "Cinzel", serif;
    font-size: 1.05rem;
    color: var(--gold-light, #f0c040);
  }
`;
const Close = styled.button`
  display: inline-flex;
  padding: 8px;
  margin-right: -8px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted, #a89880);
  cursor: pointer;
  &:hover { color: var(--text, #f5f0e8); }
`;
const Body = styled.div`
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 18px 20px;
`;
