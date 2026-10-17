"use client";

import { useState } from "react";
import styled from "styled-components";
import { Wrap, GoldTitle, SectionEyebrow } from "./shared";

type Game = {
  title: string;
  body: string;
  images: { src: string; alt: string; w: number; h: number }[];
  note?: string;
  footer?: string;
};

const GAMES: Game[] = [
  {
    title: "Royal Checkers",
    body:
      "The timeless game of checkers, reimagined on a 360° spherical board. Strategy unfolds in every direction — no edge, no escape. The perfect entry point into spherical gameplay for all ages.",
    images: [
      {
        src: "/images/d846e954-7329-421e-9b42-85a07f82d117.jpg",
        alt: "Royal Checkers spherical game board — red and black",
        w: 180,
        h: 180,
      },
      {
        src: "/images/6c2ef074-f40f-41cb-b1cd-ff5add971a7b.jpg",
        alt: "Royal Checkers game pieces — red and black discs",
        w: 180,
        h: 100,
      },
    ],
  },
  {
    title: "Imperial Kings",
    body:
      "Chess-inspired tactical battle on the sphere. The spherical board adds a whole new dimension of attack, defense, and surprise — no blind spots, no safe corners. Outthink your opponent from all angles.",
    images: [
      {
        src: "/images/63cafa47-367f-478a-b35d-01d19733f0e2.jpg",
        alt: "Imperial Kings spherical chess board — white and black",
        w: 180,
        h: 180,
      },
    ],
    footer: "Full rules and detailed gameplay — revealed at launch.",
  },
  {
    title: "Spherical Puzzle",
    body:
      "Assemble a beautifully designed spherical puzzle that becomes a stunning display piece when complete. A calming yet satisfying challenge for puzzle lovers of all ages.",
    images: [
      {
        src: "/images/07f00190-4d22-466d-a5af-f0d872e1c195.jpg",
        alt: "Spherical puzzle pieces",
        w: 180,
        h: 180,
      },
    ],
  },
  {
    title: "DIY Puzzle Kit",
    body:
      "Start with a blank sphere and make the puzzle entirely your own. Paint the pieces, design your pattern, and assemble a truly unique creation. Perfect for young makers and creative families.",
    images: [
      {
        src: "/images/03dd966c-144e-4718-9252-17548b3778e7.jpg",
        alt: "Creator's Edition — DIY puzzle kit with unpainted sphere and all pieces",
        w: 180,
        h: 180,
      },
    ],
  },
  {
    title: "Custom Upload Puzzle",
    body:
      "Upload a photo — your family, your pet, your favorite place — and it becomes a custom spherical puzzle. A gift like no other.",
    images: [
      {
        src: "/images/0426fb4f-6550-4e4d-b8c2-42ce56f2a2ef.jpg",
        alt: "Custom Upload Puzzle — a photo converted into a spherical puzzle",
        w: 180,
        h: 180,
      },
    ],
    note:
      "Note: Uploaded images are converted to a simplified 3D printable model with fewer colors and lower detail. The final puzzle will not look exactly like the original photo, but keeps its main shapes, colors, and design.",
  },
  {
    title: "DIY Checkers Kit",
    body:
      "Design and paint your own checkers board from scratch. Choose your colors, create your patterns, and then play your very own custom Royal Checkers game. Every set becomes a one-of-a-kind heirloom.",
    images: [
      {
        src: "/images/6c2ef074-f40f-41cb-b1cd-ff5add971a7b.jpg",
        alt: "DIY Checkers Kit — red and black checker pieces on a spherical board",
        w: 180,
        h: 180,
      },
    ],
  },
  {
    title: "DIY Imperial Kings",
    body:
      "Craft your own Imperial Kings battle board. Paint your royal colors, customize the grid, and create a uniquely personalized tactical sphere — a creative activity and a collectible all in one.",
    images: [
      {
        src: "/images/63cafa47-367f-478a-b35d-01d19733f0e2.jpg",
        alt: "DIY Imperial Kings board — spherical chess board to paint and customize",
        w: 180,
        h: 180,
      },
    ],
  },
];

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: var(--bg);
`;

const Heading = styled(GoldTitle)`
  text-align: center;
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 12px;
  font-weight: 900;
`;

const Lede = styled.p`
  text-align: center;
  color: #a89880;
  max-width: 600px;
  margin: 0 auto 44px;
  font-size: 0.98rem;
  line-height: 1.65;
`;

const Layout = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const TabList = styled.div`
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 900px) {
    flex: 1 1 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

const TabBtn = styled.button<{ $active: boolean }>`
  cursor: pointer;
  padding: 11px 16px;
  text-align: left;
  width: 100%;
  border: none;
  border-radius: 4px;
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  transition: background 0.18s, color 0.18s;
  border-left: 3px solid ${(p) => (p.$active ? "#c9a227" : "transparent")};
  background: ${(p) => (p.$active ? "#1a1510" : "transparent")};
  color: ${(p) => (p.$active ? "#f0c040" : "#7a6a5a")};

  &:hover {
    color: ${(p) => (p.$active ? "#f0c040" : "#c8b898")};
  }

  @media (max-width: 900px) {
    flex: 1 1 140px;
    text-align: center;
    border-left: none;
    border-bottom: 3px solid ${(p) => (p.$active ? "#c9a227" : "transparent")};
  }
`;

const Panel = styled.div`
  flex: 1 1 360px;
  min-width: 0;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 28px;
  min-height: 280px;
`;

const PanelInner = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
`;

const ImgCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
`;

const PanelImg = styled.img`
  object-fit: cover;
  border-radius: 8px;
`;

const Body = styled.div`
  flex: 1 1 200px;
  min-width: 0;

  h3 {
    font-family: 'Cinzel', serif;
    color: #f0c040;
    margin: 0 0 10px;
    font-size: 1.1rem;
    font-weight: 700;
  }
  p {
    color: #c8b898;
    line-height: 1.72;
    margin: 0;
    font-size: 0.95rem;
  }
`;

const Note = styled.div`
  margin-top: 14px;
  background: #1a1510;
  border: 1px solid #2e2618;
  border-radius: 6px;
  padding: 10px 14px;

  p {
    color: #5a4a38;
    font-size: 0.78rem;
    line-height: 1.55;
    margin: 0;
    font-style: italic;
  }
`;

const PanelFooter = styled.p`
  color: #5a4a38;
  font-size: 0.82rem;
  font-style: italic;
  margin-top: 12px;
`;

export default function Showcase() {
  const [idx, setIdx] = useState(0);
  const game = GAMES[idx];

  return (
    <Section id="showcase">
      <Wrap>
        <SectionEyebrow>One Board. Seven Worlds.</SectionEyebrow>
        <Heading>7-in-1 Showcase</Heading>
        <Lede>
          One spherical board transforms into seven distinct experiences. Choose your game,
          or master them all.
        </Lede>
        <Layout>
          <TabList role="tablist" aria-label="Select a game mode">
            {GAMES.map((g, i) => (
              <TabBtn
                key={g.title}
                role="tab"
                type="button"
                aria-selected={i === idx}
                $active={i === idx}
                onClick={() => setIdx(i)}
              >
                {g.title}
              </TabBtn>
            ))}
          </TabList>
          <Panel>
            <PanelInner>
              {game.images.length > 1 ? (
                <ImgCol>
                  {game.images.map((im) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <PanelImg
                      key={im.src + im.alt}
                      src={im.src}
                      alt={im.alt}
                      loading="lazy"
                      width={im.w}
                      height={im.h}
                      style={{ width: im.w, height: im.h }}
                    />
                  ))}
                </ImgCol>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <PanelImg
                  src={game.images[0].src}
                  alt={game.images[0].alt}
                  loading="lazy"
                  width={game.images[0].w}
                  height={game.images[0].h}
                  style={{ width: game.images[0].w, height: game.images[0].h, flexShrink: 0 }}
                />
              )}
              <Body>
                <h3>{game.title}</h3>
                <p>{game.body}</p>
                {game.note ? (
                  <Note>
                    <p>{game.note}</p>
                  </Note>
                ) : null}
                {game.footer ? <PanelFooter>{game.footer}</PanelFooter> : null}
              </Body>
            </PanelInner>
          </Panel>
        </Layout>
      </Wrap>
    </Section>
  );
}
