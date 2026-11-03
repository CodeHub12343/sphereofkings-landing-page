"use client";

// Fixed bottom action bar for full-screen game screens. Replaces the
// tab bar while a game is on screen: a few big thumb-reach buttons,
// with everything else behind "Options" in a BottomSheet.

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { PHONE_LANDSCAPE, backHref } from "@/lib/app-routes";
import AppIcon, { AppIconName } from "./AppIcon";

export function GameDock({ children }: { children: React.ReactNode }) {
  const back = backHref(usePathname() ?? "/play");
  return (
    <Bar role="toolbar" aria-label="Game controls">
      {/* Only shown on a sideways phone, where the top bar is hidden. */}
      {back && (
        <RailBack href={back} aria-label="Back">
          <AppIcon name="back" />
        </RailBack>
      )}
      {children}
    </Bar>
  );
}

interface DockButtonProps {
  icon: AppIconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  // Visual emphasis: "armed" = waiting for a confirming second tap.
  tone?: "default" | "armed";
  badge?: boolean;
  pressed?: boolean;
}

export function DockButton({ icon, label, onClick, disabled, tone = "default", badge, pressed }: DockButtonProps) {
  return (
    <Btn type="button" onClick={onClick} disabled={disabled} $tone={tone} aria-pressed={pressed}>
      <IconWrap>
        <AppIcon name={icon} />
        {badge && <Badge aria-label="new" />}
      </IconWrap>
      <span>{label}</span>
    </Btn>
  );
}

const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
  background: rgba(10, 8, 6, 0.96);
  border-top: 1px solid #2a2218;
  backdrop-filter: blur(10px);

  /* Sideways phone: a slim rail down the right edge. */
  @media ${PHONE_LANDSCAPE} {
    top: 0;
    left: auto;
    width: calc(76px + env(safe-area-inset-right));
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    padding: max(8px, env(safe-area-inset-top)) env(safe-area-inset-right) max(8px, env(safe-area-inset-bottom)) 4px;
    border-top: 0;
    border-left: 1px solid #2a2218;
  }
`;
const RailBack = styled(Link)`
  display: none;
  @media ${PHONE_LANDSCAPE} {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: max(8px, env(safe-area-inset-top));
    left: 4px;
    right: env(safe-area-inset-right);
    height: 44px;
    border-radius: 10px;
    color: var(--text, #f5f0e8);
    &:active { background: rgba(201, 162, 39, 0.12); }
  }
`;
const Btn = styled.button<{ $tone: "default" | "armed" }>`
  flex: 1;
  max-width: 120px;
  min-height: 52px;
  @media ${PHONE_LANDSCAPE} { flex: 0 0 auto; max-width: none; width: 100%; min-height: 56px; }
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 0;
  border-radius: 10px;
  background: ${(p) => (p.$tone === "armed" ? "rgba(198,43,68,.18)" : "transparent")};
  color: ${(p) => (p.$tone === "armed" ? "#ff6b7a" : "var(--text, #f5f0e8)")};
  font-family: "Inter", sans-serif;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  &[aria-pressed="true"] { color: var(--gold-light, #f0c040); }
  &:active:not(:disabled) { background: rgba(201, 162, 39, 0.12); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid var(--gold-light, #f0c040); outline-offset: -2px; }
`;
const IconWrap = styled.span`
  position: relative;
  display: inline-flex;
`;
const Badge = styled.span`
  position: absolute;
  top: -2px;
  right: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff6b7a;
`;
