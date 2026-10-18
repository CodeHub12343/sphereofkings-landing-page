"use client";

import styled from "styled-components";
import Link from "next/link";

const Shell = styled.article`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 16px;
  overflow: hidden;
`;

// Intro
const Intro = styled.section`
  padding: clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px);
  position: relative;
  background: radial-gradient(
      circle at 85% 20%,
      rgba(201, 162, 39, 0.12),
      transparent 55%
    ),
    radial-gradient(circle at 15% 90%, rgba(76, 124, 224, 0.08), transparent 55%);
  border-bottom: 1px solid #1e1a12;
`;

const Grid = styled.div`
  position: relative;
  background-image: linear-gradient(rgba(201, 162, 39, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201, 162, 39, 0.04) 1px, transparent 1px);
  background-size: 44px 44px;
  position: absolute;
  inset: 0;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
  pointer-events: none;
`;

const Eye = styled.div`
  position: relative;
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c9a227;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;

  &::before {
    content: "";
    width: 28px;
    height: 1px;
    background: #c9a227;
  }
`;

const IntroH = styled.h1`
  position: relative;
  font-family: "Cinzel", serif;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1.1;
  color: #f5f0e8;
  font-weight: 800;
  letter-spacing: -0.015em;
  margin: 0 0 18px;
  max-width: 760px;
`;

const IntroEm = styled.span`
  color: #f0c040;
  font-style: italic;
`;

const IntroLede = styled.p`
  position: relative;
  font-family: "Inter", sans-serif;
  font-size: 1.08rem;
  line-height: 1.65;
  color: #a89880;
  max-width: 640px;
  margin: 0;
`;

// Section scaffolding
const Section = styled.section`
  padding: clamp(40px, 5.5vw, 64px) clamp(24px, 4vw, 48px);
  border-bottom: 1px solid #1e1a12;

  &:last-of-type {
    border-bottom: 0;
  }
`;

const Head = styled.header`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 24px;
`;

const HeadNo = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  color: #c9a227;
  background: rgba(201, 162, 39, 0.12);
  padding: 3px 9px;
  border-radius: 4px;
  letter-spacing: 0.04em;
`;

const HeadT = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  color: #f5f0e8;
  margin: 0;
  font-weight: 700;
`;

// Invention
const Invent = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 32px;
  align-items: center;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Para = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #f5f0e8;
  margin: 0 0 16px;

  b {
    color: #f0c040;
    font-weight: 600;
  }
`;

// "What if…" callout list — a visually distinct block for the series of
// rhetorical questions at the heart of the founding story.
const WhatIfs = styled.ul`
  list-style: none;
  margin: 20px 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  li {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 12px;
    align-items: start;
    padding: 12px 14px;
    background: #1a1612;
    border: 1px solid #2e2618;
    border-left: 3px solid #c9a227;
    border-radius: 6px;
    font-family: "Inter", sans-serif;
    font-size: 0.98rem;
    line-height: 1.6;
    color: #f5f0e8;
  }
`;

const WhatIfMark = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(201, 162, 39, 0.14);
  color: #f0c040;
  font-family: "Cinzel", serif;
  font-size: 1rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const Pull = styled.blockquote`
  margin: 24px 0 0;
  padding: 20px 24px;
  background: #1a1612;
  border-left: 3px solid #c9a227;
  border-radius: 4px;

  p {
    font-family: "Cinzel", serif;
    font-size: 1.15rem;
    line-height: 1.5;
    font-style: italic;
    color: #f5f0e8;
    margin: 0 0 6px;
  }
  cite {
    font-family: "Inter", sans-serif;
    font-size: 0.75rem;
    color: #a89880;
    font-style: normal;
    letter-spacing: 0.04em;
  }
`;

const Art = styled.figure`
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #c9a227;
  margin: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  figcaption {
    position: absolute;
    bottom: 10px;
    left: 12px;
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 0.72rem;
    color: #c9a227;
    letter-spacing: 0.04em;
    background: rgba(10, 10, 12, 0.72);
    padding: 2px 8px;
    border-radius: 3px;
  }
`;

// Timeline
const Timeline = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const TlSide = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  line-height: 1.6;
  color: #a89880;

  strong {
    color: #e0a94a;
    font-weight: 700;
  }

  .k {
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    color: #c9a227;
    margin-bottom: 8px;
  }
`;

const Tl = styled.ol`
  position: relative;
  padding: 0 0 0 28px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  list-style: none;

  &::before {
    content: "";
    position: absolute;
    left: 7px;
    top: 14px;
    bottom: 14px;
    width: 1px;
    background: #2e2618;
  }
`;

type TlState = "done" | "now" | "future" | "planned";

const TlItem = styled.li<{ $state: TlState }>`
  position: relative;
  padding: 14px 18px;
  background: #1a1612;
  border: 1px solid ${(p) => (p.$state === "planned" ? "#2e2618" : "#2e2618")};
  border-style: ${(p) => (p.$state === "planned" ? "dashed" : "solid")};
  border-radius: 10px;

  &::before {
    content: "";
    position: absolute;
    left: -28px;
    top: 18px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${(p) =>
      p.$state === "done" || p.$state === "now" ? "#c9a227" : "#0a0a0a"};
    border: 2px solid
      ${(p) =>
        p.$state === "done" || p.$state === "now"
          ? "#c9a227"
          : p.$state === "planned"
          ? "#e0a94a"
          : "#2e2618"};
    border-style: ${(p) => (p.$state === "planned" ? "dashed" : "solid")};
    box-shadow: ${(p) =>
      p.$state === "now"
        ? "0 0 0 3px rgba(201, 162, 39, 0.18)"
        : p.$state === "done"
        ? "0 0 0 3px #0e0c09, 0 0 0 4px #c9a227"
        : "none"};
  }
`;

const TlHead = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const TlDate = styled.span<{ $state: TlState }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${(p) => (p.$state === "planned" ? "#e0a94a" : "#c9a227")};
`;

const TlChip = styled.span<{ $tone: "ok" | "now" | "planned" | "muted" }>`
  font-family: "Inter", sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 3px;

  ${(p) => {
    if (p.$tone === "ok")
      return "background: rgba(79,176,125,0.14); color: #4fb07d;";
    if (p.$tone === "now")
      return "background: rgba(201,162,39,0.14); color: #f0c040;";
    if (p.$tone === "planned")
      return "background: rgba(224,169,74,0.14); color: #e0a94a;";
    return "background: #1a1612; color: #a89880;";
  }}
`;

const TlTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.08rem;
  font-weight: 700;
  color: #f5f0e8;
  margin: 0 0 2px;
`;

const TlSub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #a89880;
  margin: 0;
`;

// Reusable card grid used by Games (02), Design (03), Learning (05),
// Sustainability (06), Risks (09).
const Grid3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Tile = styled.article`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const TileEye = styled.span`
  font-family: "Cinzel", serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c9a227;
`;

const TileH = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.08rem;
  color: #f5f0e8;
  margin: 0;
  font-weight: 700;
  line-height: 1.25;
`;

const TileP = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #a89880;
  margin: 0;
`;

const TileTag = styled.span`
  font-family: "Cinzel", serif;
  font-size: 0.78rem;
  font-style: italic;
  color: #f0c040;
  margin-top: auto;
`;

const SectionLede = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #a89880;
  margin: 0 0 20px;
  max-width: 760px;
`;

const Note = styled.aside`
  margin-top: 14px;
  padding: 12px 14px;
  background: rgba(224, 169, 74, 0.08);
  border-left: 3px solid #e0a94a;
  border-radius: 4px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #a89880;

  strong {
    color: #e0a94a;
  }
`;

// Team
const Team = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Member = styled.article`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Ava = styled.div<{ $tone: "gold" | "royal" | "crim" }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: "Cinzel", serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: ${(p) => (p.$tone === "gold" ? "#0a0a0a" : "#fff")};
  border: 2px solid
    ${(p) =>
      p.$tone === "royal" ? "#4c7ce0" : p.$tone === "crim" ? "#c62b44" : "#c9a227"};
  background: ${(p) =>
    p.$tone === "royal"
      ? "radial-gradient(circle at 32% 28%, #a0bfff 0%, #4c7ce0 40%, #1a2448 80%)"
      : p.$tone === "crim"
      ? "radial-gradient(circle at 32% 28%, #e78591 0%, #c62b44 42%, #4a0a16 80%)"
      : "radial-gradient(circle at 32% 28%, #e7cb70 0%, #d4af37 25%, #8a6e1f 55%, #1a1510 90%)"};
`;

const MemberName = styled.h4`
  font-family: "Cinzel", serif;
  font-size: 1.1rem;
  color: #f5f0e8;
  margin: 0;
  font-weight: 700;
`;

const MemberRole = styled.p<{ $tone: "gold" | "royal" | "crim" }>`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${(p) =>
    p.$tone === "royal"
      ? "#7fa3ff"
      : p.$tone === "crim"
      ? "#ff6b7a"
      : "#f0c040"};
`;

const MemberBio = styled.p`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  line-height: 1.55;
  color: #a89880;
`;

const Draft = styled.div`
  background: rgba(224, 169, 74, 0.08);
  border: 1px dashed #e0a94a;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  gap: 10px;
  align-items: flex-start;

  svg {
    color: #e0a94a;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .t {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #e0a94a;
    margin-bottom: 4px;
  }
  .s {
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
    line-height: 1.55;
    color: #a89880;
    margin: 0;
  }
`;

// Closing CTA
const Closing = styled.section`
  padding: clamp(40px, 6vw, 64px) clamp(24px, 4vw, 48px);
  text-align: center;
  background: radial-gradient(circle at center, rgba(201, 162, 39, 0.1), transparent 65%);
`;

const ClosingH = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: #f5f0e8;
  margin: 0 0 12px;
  font-weight: 700;
`;

const ClosingEm = styled.span`
  color: #f0c040;
  font-style: italic;
`;

const ClosingS = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  color: #a89880;
  line-height: 1.6;
  max-width: 540px;
  margin: 0 auto 24px;
`;

const CTA = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 14px 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  background-size: 200% auto;
  color: #0a0a0a;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: background-position 0.3s, box-shadow 0.3s;

  &:hover {
    background-position: right center;
    box-shadow: 0 0 28px rgba(240, 192, 64, 0.35);
  }
  &:focus-visible {
    outline: 3px solid #f0c040;
    outline-offset: 3px;
  }
`;

export default function OurStory() {
  return (
    <Shell>
      <Intro>
        <Grid aria-hidden="true" />
        <Eye>Our story</Eye>
        <IntroH>
          A game for the <IntroEm>long shelf</IntroEm>.
        </IntroH>
        <IntroLede>
          Sphere of Kings is one object a family keeps for years — seven games
          built into a 14 × 8 spherical board, with room for puzzles people
          design themselves. This page is how it came to be, where it is
          going, and who is behind it.
        </IntroLede>
      </Intro>

      <Section>
        <Head>
          <HeadNo>01</HeadNo>
          <HeadT>Where the vision began</HeadT>
        </Head>
        <Invent>
          <div>
            <Para>
              <b>Every great invention begins with an idea.</b> Sphere of Kings
              began with a vision: to reimagine the traditional board game and
              create something that would stand apart from everything else on
              the market.
            </Para>
            <Para>
              For generations, families have gathered around tables to enjoy
              chess, checkers, puzzles, and other classic games. These games
              have brought people together, encouraged strategic thinking, and
              created countless memories.
            </Para>
            <Para>But we asked ourselves one important question:</Para>

            <WhatIfs aria-label="Design questions that led to Sphere of Kings">
              <li>
                <WhatIfMark aria-hidden="true">?</WhatIfMark>
                <span>
                  What if we could take these timeless experiences and
                  transform them into something entirely new?
                </span>
              </li>
              <li>
                <WhatIfMark aria-hidden="true">?</WhatIfMark>
                <span>What if a game board didn't have to be flat?</span>
              </li>
              <li>
                <WhatIfMark aria-hidden="true">?</WhatIfMark>
                <span>What if the playing surface could become a sphere?</span>
              </li>
              <li>
                <WhatIfMark aria-hidden="true">?</WhatIfMark>
                <span>
                  What if multiple games could share one interchangeable
                  gaming system?
                </span>
              </li>
              <li>
                <WhatIfMark aria-hidden="true">?</WhatIfMark>
                <span>
                  What if players could customize their experience, create
                  their own puzzles, and enjoy different challenges without
                  purchasing an entirely new board?
                </span>
              </li>
            </WhatIfs>

            <Pull>
              <p>
                "These questions inspired the creation of Sphere of Kings."
              </p>
              <cite>Owner · founding note</cite>
            </Pull>

            <Para>
              What started as a concept for a unique spherical gaming platform
              evolved into an ambitious seven-in-one entertainment system.
              Through continuous design, development, experimentation, and
              refinement, Sphere of Kings has grown into something much bigger
              than our original vision.
            </Para>
            <Para>
              <b>
                Today, we're preparing to introduce Sphere of Kings to the
                world.
              </b>
            </Para>
          </div>
          <Art>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/d846e954-7329-421e-9b42-85a07f82d117.jpg"
              alt="Early prototype of the Sphere of Kings spherical board"
              loading="lazy"
            />
            <figcaption>Supplied imagery</figcaption>
          </Art>
        </Invent>
      </Section>

      <Section>
        <Head>
          <HeadNo>02</HeadNo>
          <HeadT>Introducing the 7-in-1 experience</HeadT>
        </Head>
        <SectionLede>
          Seven gaming experiences on one spherical platform. Something for
          strategy players, puzzle fans, families, collectors, and anyone who
          likes to make a game their own.
        </SectionLede>
        <Grid3>
          <Tile>
            <TileEye>Game 1</TileEye>
            <TileH>Royal Checkers™</TileH>
            <TileP>
              Classic checkers reimagined on a spherical playing surface.
              Players must think strategically and adapt to the curved layout.
            </TileP>
            <TileTag>Classic strategy. A whole new perspective.</TileTag>
          </Tile>
          <Tile>
            <TileEye>Game 2</TileEye>
            <TileH>Imperial Kings™</TileH>
            <TileP>
              Our chess-inspired strategy experience. Every move matters,
              every decision creates new opportunities, every player must
              think ahead.
            </TileP>
            <TileTag>Think like a strategist. Play like royalty.</TileTag>
          </Tile>
          <Tile>
            <TileEye>Game 3</TileEye>
            <TileH>Spherical Puzzle™</TileH>
            <TileP>
              Assemble puzzle pieces around a curved surface. Shapes, patterns
              and images across a three-dimensional form, with multiple
              difficulty levels planned.
            </TileP>
            <TileTag>One sphere. Countless possibilities.</TileTag>
          </Tile>
          <Tile>
            <TileEye>Game 4</TileEye>
            <TileH>DIY Paintable Experience™</TileH>
            <TileP>
              Personalize compatible components with your own colors and
              designs. Children, families, artists — the sphere becomes a
              canvas.
            </TileP>
            <TileTag>Create it. Paint it. Make it yours.</TileTag>
          </Tile>
          <Tile>
            <TileEye>Game 5</TileEye>
            <TileH>Custom Sphere Upload™</TileH>
            <TileP>
              Transform a favorite photograph or design into a spherical puzzle
              — birthdays, anniversaries, weddings, holiday gifts, original
              artwork.
            </TileP>
            <TileTag>Your picture. Your puzzle. Your Sphere.</TileTag>
          </Tile>
          <Tile>
            <TileEye>Game 6</TileEye>
            <TileH>Expanded Sphere Challenges™</TileH>
            <TileP>
              New patterns, combinations, strategies and creative solutions
              that extend replay value. Play solo, with friends, or
              cooperatively.
            </TileP>
            <TileTag>The challenge continues.</TileTag>
          </Tile>
          <Tile>
            <TileEye>Game 7</TileEye>
            <TileH>Creator's Edition™</TileH>
            <TileP>
              Experiment with new layouts, designs and gameplay ideas using
              compatible components. Sphere of Kings as a platform to shape,
              not just play.
            </TileP>
            <TileTag>Don't just play the game. Help shape it.</TileTag>
          </Tile>
        </Grid3>
        <Note>
          <strong>Note.</strong> Games 6 and 7 are proposed descriptions for
          the expanded seven-in-one concept. Their final names, rules, and
          included components will be confirmed before launch.
        </Note>
      </Section>

      <Section>
        <Head>
          <HeadNo>03</HeadNo>
          <HeadT>The design — a game board unlike traditional boards</HeadT>
        </Head>
        <SectionLede>
          At the heart of Sphere of Kings is its distinctive spherical
          construction. Four design decisions shape the experience.
        </SectionLede>
        <Grid2>
          <Tile>
            <TileH>Innovative spherical structure</TileH>
            <TileP>
              An approximately eight-inch spherical board — compact, visually
              distinctive, and designed to transform the feel of familiar
              games.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Magnetic gaming components</TileH>
            <TileP>
              Magnetic connections hold compatible pieces to the curved
              surface, improving stability and making spherical play
              practical.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Interchangeable gaming systems</TileH>
            <TileP>
              One board, many games — switch between compatible checker,
              chess and puzzle sets instead of buying a new board for every
              activity.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Portable and customizable</TileH>
            <TileP>
              Compact enough to store, carry and play anywhere. From
              personalized puzzles to paintable components, customization is
              central to the long-term vision.
            </TileP>
          </Tile>
        </Grid2>
      </Section>

      <Section>
        <Head>
          <HeadNo>04</HeadNo>
          <HeadT>Built for families, friends, and generations</HeadT>
        </Head>
        <Para>
          Technology has transformed entertainment — video games, phones,
          tablets, streaming. But something meaningful still happens when
          people sit together, challenge one another, laugh, compete, and
          create memories.
        </Para>
        <Para>
          Sphere of Kings is being developed with those moments in mind. For
          grandparents introducing younger generations to strategic games.
          For children discovering the excitement of puzzles. For friends
          enjoying friendly competition. For adults who want a distinctive
          tabletop experience that challenges their thinking.
        </Para>
        <Note>
          <strong>Supervision.</strong> For younger children, adult
          supervision is recommended — particularly when using small
          components, magnets, or painting materials.
        </Note>
      </Section>

      <Section>
        <Head>
          <HeadNo>05</HeadNo>
          <HeadT>Learning through play</HeadT>
        </Head>
        <SectionLede>
          Games can offer much more than entertainment. Sphere of Kings is
          being designed to support six skills in particular.
        </SectionLede>
        <Grid3>
          <Tile>
            <TileH>Strategic thinking</TileH>
            <TileP>
              Players consider their options, plan moves, and anticipate
              outcomes.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Problem-solving</TileH>
            <TileP>
              Puzzles and challenges encourage players to explore solutions.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Spatial awareness</TileH>
            <TileP>
              Spherical gameplay introduces an unusual three-dimensional
              environment.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Creativity</TileH>
            <TileP>
              Customization and artistic activities encourage personal
              expression.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Patience &amp; concentration</TileH>
            <TileP>
              Puzzle assembly and strategic competition reward focused
              participation.
            </TileP>
          </Tile>
          <Tile>
            <TileH>Social interaction</TileH>
            <TileP>
              Multiplayer games encourage communication, cooperation, and
              friendly competition.
            </TileP>
          </Tile>
        </Grid3>
      </Section>

      <Section>
        <Head>
          <HeadNo>06</HeadNo>
          <HeadT>Built to last — sustainably</HeadT>
        </Head>
        <SectionLede>
          Every board and piece is crafted with precision 3D printing in
          environmentally friendly factories, using high-quality,
          eco-conscious materials.
        </SectionLede>
        <Grid2>
          <Tile>
            <TileEye>Design</TileEye>
            <TileH>Precision 3D printing</TileH>
            <TileP>
              Sharp detail, smooth surfaces, and consistent fit across every
              set — components built to withstand years of gameplay without
              warping or breaking.
            </TileP>
          </Tile>
          <Tile>
            <TileEye>Materials</TileEye>
            <TileH>Reusable &amp; recyclable</TileH>
            <TileP>
              DIY pieces can be repainted again and again with no waste. The
              fully assembled edition can be recycled responsibly at the end
              of its life.
            </TileP>
          </Tile>
          <Tile>
            <TileEye>Production</TileEye>
            <TileH>Eco-friendly factories</TileH>
            <TileP>
              Our production process minimises waste, reduces energy use, and
              prioritises eco-conscious practices — so the game is gentle on
              the planet as well as fun to play.
            </TileP>
          </Tile>
          <Tile>
            <TileEye>Fulfilment</TileEye>
            <TileH>Sustainable distribution</TileH>
            <TileP>
              Orders ship through sustainable fulfilment partners, keeping
              our carbon footprint low while reaching backers quickly after
              the campaign ends.
            </TileP>
          </Tile>
        </Grid2>
      </Section>

      <Section>
        <Head>
          <HeadNo>07</HeadNo>
          <HeadT>Timeline</HeadT>
        </Head>
        <Timeline>
          <TlSide>
            <div className="k">A living plan</div>
            Dates confirmed by the owner are solid; everything else is marked{" "}
            <strong>Planned</strong> and may still move. Fabricated dates
            never appear on this page.
          </TlSide>
          <Tl>
            <TlItem $state="done">
              <TlHead>
                <TlDate $state="done">2024 — 2026</TlDate>
                <TlChip $tone="ok">Confirmed</TlChip>
              </TlHead>
              <TlTitle>Prototyping and play-testing</TlTitle>
              <TlSub>
                Three generations of the spherical board, carried through
                family game nights, two chess clubs and one classroom.
              </TlSub>
            </TlItem>
            <TlItem $state="done">
              <TlHead>
                <TlDate $state="done">September 2026</TlDate>
                <TlChip $tone="ok">Confirmed</TlChip>
              </TlHead>
              <TlTitle>Pre-launch landing page</TlTitle>
              <TlSub>
                The Kickstarter waiting list opens. First subscribers join
                the launch list.
              </TlSub>
            </TlItem>
            <TlItem $state="now">
              <TlHead>
                <TlDate $state="now">October 2026</TlDate>
                <TlChip $tone="now">You are here</TlChip>
              </TlHead>
              <TlTitle>Christmas Early Bird opens</TlTitle>
              <TlSub>
                Website preorders begin, with the 1,000-unit Early Bird cap
                per product.
              </TlSub>
            </TlItem>
            <TlItem $state="future">
              <TlHead>
                <TlDate $state="future">November 19, 2026</TlDate>
                <TlChip $tone="ok">Confirmed</TlChip>
              </TlHead>
              <TlTitle>Kickstarter launch</TlTitle>
              <TlSub>
                The campaign goes live on Kickstarter alongside the Early
                Bird shop.
              </TlSub>
            </TlItem>
            <TlItem $state="future">
              <TlHead>
                <TlDate $state="future">December 1, 2026</TlDate>
                <TlChip $tone="ok">Confirmed</TlChip>
              </TlHead>
              <TlTitle>Early Bird deliveries start</TlTitle>
              <TlSub>
                We begin shipping in the sequence Early Bird orders were
                paid. Not every parcel arrives on December 1.
              </TlSub>
            </TlItem>
            <TlItem $state="future">
              <TlHead>
                <TlDate $state="future">Mid-December 2026</TlDate>
                <TlChip $tone="ok">Expectation</TlChip>
              </TlHead>
              <TlTitle>Kickstarter deliveries</TlTitle>
              <TlSub>
                Backers of the Kickstarter campaign ship on a separate
                schedule. Timeline is an expectation, not a guarantee.
              </TlSub>
            </TlItem>
            <TlItem $state="planned">
              <TlHead>
                <TlDate $state="planned">Early 2027</TlDate>
                <TlChip $tone="planned">Planned</TlChip>
              </TlHead>
              <TlTitle>Custom-upload puzzle</TlTitle>
              <TlSub>
                The web uploader for Custom Sphere puzzles is approved for
                a Q1 release.
              </TlSub>
            </TlItem>
          </Tl>
        </Timeline>
      </Section>

      <Section>
        <Head>
          <HeadNo>08</HeadNo>
          <HeadT>The team</HeadT>
        </Head>
        <Pull>
          <p>
            "Sphere of Kings began with a simple belief: there is always room
            to create something new. I wanted to develop a game board that
            would stand out, challenge conventional thinking, and bring people
            together — not just another version of a traditional board game,
            but an experience people would remember."
          </p>
          <cite>James Scott Bowser · Founder &amp; Creator</cite>
        </Pull>
        <Team>
          <Member>
            <Ava $tone="gold" aria-hidden="true">
              JB
            </Ava>
            <MemberName>James Bowser</MemberName>
            <MemberRole $tone="gold">Founder · Creator</MemberRole>
            <MemberBio>
              Conceived the Sphere of Kings vision, shaped the geometry of the
              spherical board, and leads the project end to end.
            </MemberBio>
          </Member>
          <Member>
            <Ava $tone="royal" aria-hidden="true">
              BO
            </Ava>
            <MemberName>Benjamin Osei</MemberName>
            <MemberRole $tone="royal">Fulfillment lead</MemberRole>
            <MemberBio>
              Runs production, packs and ships every Christmas Early Bird order.
            </MemberBio>
          </Member>
          <Draft>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3v9m0 2v.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <div>
              <div className="t">Draft</div>
              <p className="s">
                The owner has not yet confirmed a third team member for this
                page. The slot stays here, honest and empty, until approval.
              </p>
            </div>
          </Draft>
        </Team>
      </Section>

      <Section>
        <Head>
          <HeadNo>09</HeadNo>
          <HeadT>Risks &amp; our commitments</HeadT>
        </Head>
        <SectionLede>
          Bringing a new product to life carries real risk. We'd rather name
          each one and the step we're taking to address it than pretend
          they're not there.
        </SectionLede>
        <Grid2>
          <Tile>
            <TileEye>Manufacturing</TileEye>
            <TileH>Precision &amp; quality control</TileH>
            <TileP>
              3D printing is precise, but any production run can hit delays.
              We've partnered with experienced manufacturers and will keep
              strict quality control on every board and piece.
            </TileP>
          </Tile>
          <Tile>
            <TileEye>Shipping</TileEye>
            <TileH>Fulfilment &amp; logistics</TileH>
            <TileP>
              We aim to ship one month after the campaign ends. Global
              logistics can be unpredictable; our fulfilment partners are
              lined up and we'll communicate transparently about any delays.
            </TileP>
          </Tile>
          <Tile>
            <TileEye>DIY kits</TileEye>
            <TileH>Customisation variability</TileH>
            <TileP>
              Painted results vary from player to player. We provide guidance
              and support, but your creative outcome is yours — and that's
              the point.
            </TileP>
          </Tile>
          <Tile>
            <TileEye>Supply chain</TileEye>
            <TileH>Materials sourcing</TileH>
            <TileP>
              Our materials are sourced responsibly and sustainably. If
              shortages hit, contingency plans are in place to keep delays to
              a minimum.
            </TileP>
          </Tile>
          <Tile>
            <TileEye>Environment</TileEye>
            <TileH>Sustainability tradeoffs</TileH>
            <TileP>
              Our focus on sustainability adds planning complexity. We'd
              rather carry that cost than lower our environmental standards —
              the planet matters as much as the play experience.
            </TileP>
          </Tile>
        </Grid2>
      </Section>

      <Closing>
        <ClosingH>
          Be among the <ClosingEm>first families</ClosingEm> playing.
        </ClosingH>
        <ClosingS>
          Christmas Early Bird deliveries start December 1, 2026. Order now
          to join the first shipping batch.
        </ClosingS>
        <CTA href="/shop">
          Shop the Early Bird
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 6h8m-3-3 3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CTA>
      </Closing>
    </Shell>
  );
}
