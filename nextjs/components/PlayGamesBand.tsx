"use client";

// Homepage promo band for the game app. Sits between the hero and the
// giveaway band so visitors who scroll past the Kickstarter pitch see
// that there are playable games right now, in the browser.

import Link from "next/link";
import styled from "styled-components";

const GAMES = [
  {
    href: "/play/royal-checkers",
    name: "Royal Checkers",
    tag: "Draughts on the sphere",
  },
  {
    href: "/play/imperial-kings",
    name: "Imperial Kings",
    tag: "Chess with two kings",
  },
];

export default function PlayGamesBand() {
  return (
    <Section>
      <Wrap>
        <Head>
          <Eyebrow>Play now · in your browser · no download</Eyebrow>
          <Title>
            The game app is live.
            <GoldSpan> Pick a board and go.</GoldSpan>
          </Title>
          <Sub>
            Royal Checkers and Imperial Kings — both reimagined for the
            spherical board. Switch between a classic flat view and a
            fully-playable rotating 3D sphere. Guest mode works; sign in
            to climb the ranked ladder.
          </Sub>
        </Head>
        <Cards>
          {GAMES.map((g) => (
            <GameCard key={g.href} href={g.href}>
              <CardMedia aria-hidden="true">
                {/* Lightweight CSS board preview — alternating squares
                    behind a mini gold frame. Standalone from the real
                    board so the band stays cheap to render. */}
                <MiniBoard>
                  {Array.from({ length: 48 }).map((_, i) => {
                    const col = i % 8;
                    const row = Math.floor(i / 8);
                    const dark = (col + row) % 2 !== 0;
                    return (
                      <MiniSquare key={i} $dark={dark} />
                    );
                  })}
                </MiniBoard>
              </CardMedia>
              <CardBody>
                <CardTag>{g.tag}</CardTag>
                <CardName>{g.name}</CardName>
                <CardCta>
                  Play now
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </CardCta>
              </CardBody>
            </GameCard>
          ))}
          <ModesCard href="/play">
            <ModesTitle>Also in the app</ModesTitle>
            <ModeRow>
              <ModeDot />
              <span><strong>Daily puzzles</strong> — tactical sets, fresh each day</span>
            </ModeRow>
            <ModeRow>
              <ModeDot />
              <span><strong>Online matches</strong> — challenge a friend by link</span>
            </ModeRow>
            <ModeRow>
              <ModeDot />
              <span><strong>Tournaments</strong> — bracket play with seeding</span>
            </ModeRow>
            <ModeRow>
              <ModeDot />
              <span><strong>Champions ladder</strong> — Glicko-2 ranked</span>
            </ModeRow>
            <ModesCta>
              Explore the full game app
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ModesCta>
          </ModesCard>
        </Cards>
      </Wrap>
    </Section>
  );
}

const Section = styled.section`
  background:
    radial-gradient(ellipse 50% 50% at 50% 30%, rgba(240, 192, 64, 0.07), transparent 70%),
    #0a0806;
  padding: clamp(48px, 7vw, 96px) 0;
  border-top: 1px solid #1a1510;
  border-bottom: 1px solid #1a1510;
`;

const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 48px);
`;

const Head = styled.header`
  text-align: center;
  margin-bottom: 36px;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
`;

const Eyebrow = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c9a227;
  font-weight: 700;
  margin: 0 0 10px;
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: #f5f0e8;
  font-weight: 800;
  margin: 0 0 14px;
  line-height: 1.15;
`;

const GoldSpan = styled.span`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: clamp(0.95rem, 1.8vw, 1.05rem);
  color: #a89880;
  line-height: 1.6;
  margin: 0;
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const CardBase = `
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  &:hover {
    border-color: #c9a227;
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(240, 192, 64, 0.08);
  }
`;

const GameCard = styled(Link)`
  ${CardBase}
`;

const CardMedia = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(180deg, #15110c 0%, #0a0806 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const MiniBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 0;
  width: 80%;
  aspect-ratio: 4 / 3;
  border: 2px solid #c9a227;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 24px rgba(240, 192, 64, 0.15);
`;

const MiniSquare = styled.div<{ $dark: boolean }>`
  background: ${(p) => (p.$dark ? "#171310" : "#f1ecde")};
`;

const CardBody = styled.div`
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTag = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #a89880;
  font-weight: 600;
`;

const CardName = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.3rem;
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
`;

const CardCta = styled.span`
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #f0c040;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
`;

const ModesCard = styled(Link)`
  ${CardBase}
  padding: 22px 24px;
  gap: 10px;
`;

const ModesTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.1rem;
  color: #f0c040;
  margin: 0 0 6px;
  font-weight: 800;
`;

const ModeRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-family: "Inter", sans-serif;
  font-size: 0.86rem;
  color: #a89880;
  line-height: 1.45;
  strong { color: #f5f0e8; font-weight: 700; }
`;

const ModeDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c9a227;
  flex-shrink: 0;
  margin-top: 7px;
`;

const ModesCta = styled.span`
  margin-top: auto;
  padding-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #f0c040;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
`;
