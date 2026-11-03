"use client";

// Screen body inside the app chrome. Tab screens get a compact title
// block; game screens get a single slim row (title + Rules) so the
// board gets the height, with the long rules text moved into a sheet.

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import BottomSheet from "./BottomSheet";
import AppIcon from "./AppIcon";

interface Props {
  mode: "tab" | "game";
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  narrow?: boolean;
  children: React.ReactNode;
}

export default function AppScreen({ mode, title, subtitle, action, narrow, children }: Props) {
  const [rulesOpen, setRulesOpen] = useState(false);

  if (mode === "game") {
    return (
      <GameMain>
        <GameHead>
          <h1>{title}</h1>
          {subtitle && (
            <RulesBtn type="button" onClick={() => setRulesOpen(true)}>
              <AppIcon name="info" size={18} />
              About
            </RulesBtn>
          )}
          {action}
        </GameHead>
        {children}
        {subtitle && (
          <BottomSheet open={rulesOpen} onClose={() => setRulesOpen(false)} title={title}>
            <SheetText>{subtitle}</SheetText>
            <SheetLink href="/how-to-play">Full rules →</SheetLink>
          </BottomSheet>
        )}
      </GameMain>
    );
  }

  return (
    <TabMain $narrow={!!narrow}>
      <TabHead>
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <Action>{action}</Action>}
      </TabHead>
      {children}
    </TabMain>
  );
}

const TabMain = styled.main<{ $narrow: boolean }>`
  max-width: ${(p) => (p.$narrow ? "560px" : "1100px")};
  margin: 0 auto;
  padding: 18px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  color: var(--text, #f5f0e8);
`;
const TabHead = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  h1 {
    margin: 0;
    font-family: "Cinzel", serif;
    font-size: clamp(1.4rem, 5vw, 1.9rem);
    font-weight: 900;
    line-height: 1.15;
    color: var(--gold-light, #f0c040);
  }
  p {
    margin: 6px 0 0;
    color: var(--text-muted, #a89880);
    font-size: 0.92rem;
    line-height: 1.5;
    max-width: 640px;
  }
`;
const Action = styled.div`flex-shrink: 0;`;

const GameMain = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 8px max(6px, env(safe-area-inset-right)) 0 max(6px, env(safe-area-inset-left));
  color: var(--text, #f5f0e8);
`;
const GameHead = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 4px 6px;
  h1 {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-family: "Cinzel", serif;
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--gold-light, #f0c040);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
const RulesBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #2a2218;
  background: transparent;
  color: var(--text-muted, #a89880);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { color: var(--gold-light, #f0c040); border-color: var(--gold, #c9a227); }
`;
const SheetText = styled.div`
  color: var(--text, #f5f0e8);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 14px;
`;
const SheetLink = styled(Link)`
  color: var(--gold-light, #f0c040);
  font-weight: 600;
  text-decoration: none;
`;
