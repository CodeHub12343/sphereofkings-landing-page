"use client";

// Short preview of the Our Story page, embedded on the landing page.
// Three chapter cards (vision → seven-in-one → sustainability) plus a
// prominent CTA to the full /our-story. Mirrors the look of other
// landing sections while linking out, not duplicating the whole story.

import styled from "styled-components";
import Link from "next/link";
import { Wrap, SectionEyebrow, GoldTitle } from "@/components/shared";

const Section = styled.section`
  padding: clamp(60px, 9vw, 128px) 0;
  background: #0a0a0a;
  position: relative;

  /* Subtle gold-grid wash matching the Our Story page intro. */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(201, 162, 39, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201, 162, 39, 0.04) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(ellipse at center, black 25%, transparent 70%);
    pointer-events: none;
  }
`;

const Inner = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(28px, 5vw, 48px);
`;

const Head = styled.header`
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
`;

const Lede = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1.02rem;
  line-height: 1.65;
  color: #a89880;
  margin: 14px 0 0;
`;

const Chapters = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Chapter = styled.article`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 22px 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  position: relative;
  transition: border-color 0.25s ease, transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    border-color: #c9a227;
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  }
`;

const ChapterNo = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  color: #c9a227;
  background: rgba(201, 162, 39, 0.12);
  padding: 3px 10px;
  border-radius: 4px;
  letter-spacing: 0.06em;
  align-self: flex-start;
`;

const ChapterH = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.2rem;
  color: #f5f0e8;
  margin: 2px 0 0;
  font-weight: 700;
  line-height: 1.3;
`;

const ChapterP = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  line-height: 1.6;
  color: #a89880;
  margin: 0;

  strong {
    color: #f0c040;
    font-weight: 600;
  }
`;

const ChapterTag = styled.span`
  font-family: "Cinzel", serif;
  font-style: italic;
  font-size: 0.82rem;
  color: #f0c040;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #1e1a12;
`;

const Actions = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const Primary = styled(Link)`
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
  transition: background-position 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-position: right center;
    box-shadow: 0 0 28px rgba(240, 192, 64, 0.35);
  }
  &:focus-visible {
    outline: 3px solid #f0c040;
    outline-offset: 3px;
  }
`;

const Ghost = styled(Link)`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #a89880;
  text-decoration: none;
  padding: 10px 4px;

  &:hover {
    color: #f0c040;
  }
`;

const Arrow = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 7h10m-4-4 4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function OurStoryPreview() {
  return (
    <Section id="our-story-preview">
      <Wrap>
        <Inner>
          <Head>
            <SectionEyebrow>Our story</SectionEyebrow>
            <GoldTitle as="h2">A game for the long shelf.</GoldTitle>
            <Lede>
              Sphere of Kings started with a question — what if a board didn't
              have to be flat? Three chapters of the answer, in short.
            </Lede>
          </Head>

          <Chapters>
            <Chapter>
              <ChapterNo>01</ChapterNo>
              <ChapterH>Where the vision began</ChapterH>
              <ChapterP>
                We asked ourselves what classic family games could become if
                the playing surface itself were different. Those{" "}
                <strong>&quot;what if…&quot;</strong> questions turned into
                Sphere of Kings — one spherical platform, seven ways to play.
              </ChapterP>
              <ChapterTag>“Every great invention begins with an idea.”</ChapterTag>
            </Chapter>
            <Chapter>
              <ChapterNo>02</ChapterNo>
              <ChapterH>Seven experiences, one sphere</ChapterH>
              <ChapterP>
                Royal Checkers, Imperial Kings, Spherical Puzzle, DIY
                Paintable, Custom Upload and more — interchangeable sets on an
                8-inch magnetic board, so one object serves family game nights
                for years.
              </ChapterP>
              <ChapterTag>“Seven experiences. One innovative platform.”</ChapterTag>
            </Chapter>
            <Chapter>
              <ChapterNo>03</ChapterNo>
              <ChapterH>Built to last, built to care</ChapterH>
              <ChapterP>
                Precision 3D printing in environmentally friendly factories,
                reusable and recyclable materials, and sustainable fulfilment.
                A premium game you can enjoy for a decade and recycle at the
                end.
              </ChapterP>
              <ChapterTag>“Play, create, strategize — sustainably.”</ChapterTag>
            </Chapter>
          </Chapters>

          <Actions>
            <Primary href="/our-story">
              Read the full story
              {Arrow}
            </Primary>
            <Ghost href="/shop">Shop the Early Bird →</Ghost>
          </Actions>
        </Inner>
      </Wrap>
    </Section>
  );
}
