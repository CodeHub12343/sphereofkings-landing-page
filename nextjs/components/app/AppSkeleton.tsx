"use client";

// Placeholder screens shown by the app routes' loading.tsx while the
// server fetches data. The app chrome stays mounted around them, so a
// tap on a tab responds instantly with the right shape of screen.

import styled, { keyframes } from "styled-components";

type Variant = "home" | "list" | "game";

export default function AppSkeleton({ variant = "list" }: { variant?: Variant }) {
  return (
    <Main aria-busy="true" aria-label="Loading" $wide={variant === "game"}>
      {variant === "home" && (
        <>
          <Row><Block w="55%" h={34} /><Block w={150} h={48} r={10} /></Row>
          <Block w="30%" h={12} mt={26} />
          <Block h={46} r={12} mt={12} />
          <Stack>{[0, 1, 2].map((i) => <Block key={i} h={80} r={16} />)}</Stack>
          <Block w="30%" h={12} mt={26} />
          <Block h={86} r={16} mt={12} />
        </>
      )}
      {variant === "list" && (
        <>
          <Block w="45%" h={30} />
          <Block w="70%" h={14} mt={10} />
          <Stack>{[0, 1, 2, 3, 4].map((i) => <Block key={i} h={64} r={12} />)}</Stack>
        </>
      )}
      {variant === "game" && (
        <>
          <Row><Block w="40%" h={22} /><Block w={70} h={28} r={14} /></Row>
          <Block w="35%" h={14} mt={12} />
          <Block w={220} h={34} r={10} mt={12} />
          <Board />
        </>
      )}
      <Sr>Loading…</Sr>
    </Main>
  );
}

const pulse = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`;

const Main = styled.main<{ $wide: boolean }>`
  max-width: ${(p) => (p.$wide ? "1100px" : "720px")};
  margin: 0 auto;
  padding: 18px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;
const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
`;
const Block = styled.div<{ w?: number | string; h: number; r?: number; mt?: number }>`
  width: ${(p) => (typeof p.w === "number" ? `${p.w}px` : p.w ?? "100%")};
  max-width: 100%;
  height: ${(p) => p.h}px;
  margin-top: ${(p) => p.mt ?? 0}px;
  border-radius: ${(p) => p.r ?? 6}px;
  background: linear-gradient(90deg, #15110c, #1f1912, #15110c);
  animation: ${pulse} 1.4s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Board = styled.div`
  width: 100%;
  aspect-ratio: 14 / 8;
  max-height: calc(100dvh - 330px);
  margin-top: 12px;
  border-radius: 16px;
  border: 1px solid #2a2218;
  background:
    repeating-conic-gradient(#15110c 0% 25%, #1c1610 0% 50%) 0 0 / calc(100% / 7) calc(100% / 4);
  animation: ${pulse} 1.4s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Sr = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
`;
