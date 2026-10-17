"use client";

import { useState } from "react";
import styled from "styled-components";

type Mode = {
  id: string;
  name: string;
  accent: "royal" | "crimson" | "gold";
  status: "approved" | "approved-partial" | "draft";
  short: string;
  // Content when status !== "draft". For now this is set only for the two
  // modes with owner-approved rules.
  rules?: {
    headline: string;
    sections: Array<
      | { kind: "approved"; no: string; title: string; body: React.ReactNode }
      | { kind: "draft"; no: string; title: string; note: string }
    >;
  };
};

const MODES: Mode[] = [
  {
    id: "royal-checkers",
    name: "Royal Checkers",
    accent: "royal",
    status: "approved-partial",
    short: "Regular checkers on a 14 × 8 spherical board.",
    rules: {
      headline: "Checkers, on a sphere.",
      sections: [
        {
          kind: "approved",
          no: "01",
          title: "The board",
          body: (
            <p>
              Play on the <strong>14 × 8 spherical board</strong>. The board
              wraps around a sphere: pieces that leave one edge of the long
              dimension re-enter at the opposite edge. Standard checkers
              squares and standard checkers pieces.
            </p>
          ),
        },
        {
          kind: "approved",
          no: "02",
          title: "The rules",
          body: (
            <p>
              The rules of regular checkers apply. Setup, movement, mandatory
              captures, kinging and win conditions are all unchanged from the
              traditional game — the only difference is the surface the pieces
              move across.
            </p>
          ),
        },
        {
          kind: "draft",
          no: "03",
          title: "Movement across the sphere's seam",
          note: "The exact squares that connect at the sphere's seam, and whether multi-jumps may cross it mid-combo, are being finalised by the owner. We will publish the specific adjacency map once it is approved.",
        },
      ],
    },
  },
  {
    id: "imperial-kings",
    name: "Imperial Kings",
    accent: "crimson",
    status: "approved-partial",
    short: "Chess on the 14 × 8 spherical board.",
    rules: {
      headline: "Chess, elevated.",
      sections: [
        {
          kind: "approved",
          no: "01",
          title: "Winning",
          body: (
            <p>
              <strong>Both kings must be captured.</strong> A single-king
              capture does not end the match — the second king must also be
              taken for the opposing player to win.
            </p>
          ),
        },
        {
          kind: "approved",
          no: "02",
          title: "The board",
          body: (
            <p>
              Play on the <strong>14 × 8 spherical board</strong>. The board
              wraps along the long dimension — pieces leaving one edge
              re-enter on the opposite edge. Standard chess pieces,
              re-arranged for the wider surface.
            </p>
          ),
        },
        {
          kind: "draft",
          no: "03",
          title: "Setup",
          note: "Starting positions on the 14 × 8 spherical board are being finalised. We will publish a diagram once the owner confirms placement for both players.",
        },
        {
          kind: "draft",
          no: "04",
          title: "Movement · captures · draws",
          note: "Movement across the spherical seam, piece promotion, repetition and stalemate rules all remain open. We will publish them one section at a time, each tagged with the date of approval.",
        },
      ],
    },
  },
  {
    id: "spherical-puzzle",
    name: "Spherical Puzzle",
    accent: "gold",
    status: "draft",
    short: "A puzzle variant on the sphere.",
  },
  {
    id: "diy-puzzle-kit",
    name: "DIY Puzzle Kit",
    accent: "gold",
    status: "draft",
    short: "Design your own puzzle for the sphere.",
  },
  {
    id: "custom-upload-puzzle",
    name: "Custom Upload Puzzle",
    accent: "gold",
    status: "draft",
    short: "Upload an image, we print it as a sphere.",
  },
  {
    id: "diy-checkers-kit",
    name: "DIY Checkers Kit",
    accent: "royal",
    status: "draft",
    short: "Build a Royal Checkers variant.",
  },
  {
    id: "diy-imperial-kings",
    name: "DIY Imperial Kings",
    accent: "crimson",
    status: "draft",
    short: "Build an Imperial Kings variant.",
  },
];

const Layout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Rail = styled.nav`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: sticky;
  top: 86px;

  @media (max-width: 900px) {
    position: static;
  }
`;

const RailHead = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a89880;
  padding: 10px 12px 6px;
`;

const RailBtn = styled.button<{ $on: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: ${(p) => (p.$on ? "#1a1612" : "transparent")};
  border: 0;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: #f5f0e8;
  transition: background 0.15s;

  &:hover {
    background: #140f0a;
  }
`;

const Dot = styled.span<{ $accent: "royal" | "crimson" | "gold" }>`
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
  background: ${(p) =>
    p.$accent === "royal"
      ? "#4c7ce0"
      : p.$accent === "crimson"
      ? "#c62b44"
      : "#c9a227"};
`;

const RailBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const RailName = styled.span<{ $on: boolean }>`
  font-family: "Cinzel", serif;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.15;
  color: ${(p) => (p.$on ? "#f0c040" : "#f5f0e8")};
`;

const RailChip = styled.span<{ $kind: "ok" | "draft" }>`
  font-family: "Inter", sans-serif;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 3px;
  align-self: flex-start;
  margin-top: 2px;
  background: ${(p) =>
    p.$kind === "ok" ? "rgba(79,176,125,0.12)" : "rgba(224,169,74,0.12)"};
  color: ${(p) => (p.$kind === "ok" ? "#4fb07d" : "#e0a94a")};
`;

const Pane = styled.article`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(24px, 3.5vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PaneHead = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid #1e1a12;
  flex-wrap: wrap;
`;

const Eye = styled.div<{ $accent: "royal" | "crimson" | "gold" }>`
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 6px;
  color: ${(p) =>
    p.$accent === "royal"
      ? "#7fa3ff"
      : p.$accent === "crimson"
      ? "#ff6b7a"
      : "#f0c040"};
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #f5f0e8;
  margin: 0 0 4px;
  font-weight: 800;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  color: #a89880;
  margin: 0;
  line-height: 1.5;
`;

const Aux = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const AuxBtn = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const SectionBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionNo = styled.span<{ $tone: "ok" | "draft" }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 3px;
  background: ${(p) =>
    p.$tone === "ok" ? "rgba(79,176,125,0.12)" : "rgba(224,169,74,0.12)"};
  color: ${(p) => (p.$tone === "ok" ? "#4fb07d" : "#e0a94a")};
`;

const SectionTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.1rem;
  color: #f5f0e8;
  margin: 0;
  font-weight: 700;
`;

const SectionBody = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #f5f0e8;
  padding-left: 50px;

  p {
    margin: 0;
  }
  strong {
    color: #f0c040;
    font-weight: 700;
  }

  @media (max-width: 540px) {
    padding-left: 0;
  }
`;

const DraftBlock = styled.div`
  margin-left: 50px;
  background: rgba(224, 169, 74, 0.08);
  border-left: 3px solid #e0a94a;
  border-radius: 4px;
  padding: 14px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  @media (max-width: 540px) {
    margin-left: 0;
  }
`;

const DraftIcon = styled.svg`
  color: #e0a94a;
  flex-shrink: 0;
  margin-top: 2px;
`;

const DraftTitle = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #e0a94a;
  margin-bottom: 4px;
`;

const DraftNote = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #a89880;
  margin: 0;
`;

const Foot = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid #1e1a12;
  flex-wrap: wrap;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #a89880;
`;

const FootLink = styled.a`
  background: transparent;
  border: 0;
  padding: 0;
  color: #c9a227;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const DraftOnly = styled.div`
  padding: 40px;
  text-align: center;
  background: rgba(224, 169, 74, 0.06);
  border: 1px dashed #e0a94a;
  border-radius: 12px;

  h3 {
    font-family: "Cinzel", serif;
    font-size: 1.2rem;
    color: #e0a94a;
    margin: 0 0 8px;
  }
  p {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.95rem;
    line-height: 1.55;
    margin: 0 auto;
    max-width: 440px;
  }
`;

export default function HowToPlay() {
  const [activeId, setActiveId] = useState<string>(MODES[0].id);
  const active = MODES.find((m) => m.id === activeId) ?? MODES[0];

  return (
    <Layout>
      <Rail aria-label="Game modes">
        <RailHead>Seven in one</RailHead>
        {MODES.map((m) => {
          const on = m.id === activeId;
          return (
            <RailBtn
              key={m.id}
              type="button"
              $on={on}
              onClick={() => setActiveId(m.id)}
              aria-current={on ? "page" : undefined}
            >
              <Dot $accent={m.accent} aria-hidden="true" />
              <RailBody>
                <RailName $on={on}>{m.name}</RailName>
                <RailChip $kind={m.status === "draft" ? "draft" : "ok"}>
                  {m.status === "approved"
                    ? "Approved"
                    : m.status === "approved-partial"
                    ? "Approved (partial)"
                    : "Draft"}
                </RailChip>
              </RailBody>
            </RailBtn>
          );
        })}
      </Rail>

      <Pane aria-labelledby="mode-title">
        <PaneHead>
          <div>
            <Eye $accent={active.accent}>Mode</Eye>
            <Title id="mode-title">{active.name}</Title>
            <Sub>{active.short}</Sub>
          </div>
          <Aux>
            <AuxBtn type="button" onClick={() => window.print()}>
              Print rules
            </AuxBtn>
          </Aux>
        </PaneHead>

        {active.rules ? (
          <>
            {active.rules.sections.map((s) =>
              s.kind === "approved" ? (
                <SectionBlock key={s.no}>
                  <SectionHead>
                    <SectionNo $tone="ok">{s.no}</SectionNo>
                    <SectionTitle>{s.title}</SectionTitle>
                  </SectionHead>
                  <SectionBody>{s.body}</SectionBody>
                </SectionBlock>
              ) : (
                <SectionBlock key={s.no}>
                  <SectionHead>
                    <SectionNo $tone="draft">{s.no}</SectionNo>
                    <SectionTitle>{s.title}</SectionTitle>
                  </SectionHead>
                  <DraftBlock>
                    <DraftIcon
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                      <path
                        d="M8 4.5v4m0 2v.3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </DraftIcon>
                    <div>
                      <DraftTitle>Draft — awaiting owner approval</DraftTitle>
                      <DraftNote>{s.note}</DraftNote>
                    </div>
                  </DraftBlock>
                </SectionBlock>
              ),
            )}
          </>
        ) : (
          <DraftOnly>
            <h3>Rules are being finalised.</h3>
            <p>
              The owner is still writing the approved rules for{" "}
              {active.name}. We will publish them one section at a time —
              setup, how to move, captures, draws and win conditions — as each
              is confirmed. Nothing is invented in the meantime.
            </p>
          </DraftOnly>
        )}

        <Foot>
          <span>
            Only owner-approved rules are published. Nothing on this page is
            invented.
          </span>
          <FootLink href="mailto:eadepoju16@gmail.com?subject=Rules%20correction">
            Suggest a correction →
          </FootLink>
        </Foot>
      </Pane>
    </Layout>
  );
}
