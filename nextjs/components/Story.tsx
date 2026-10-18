"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap, GoldTitle } from "./shared";

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: var(--bg2);
`;

const Row = styled.div`
  display: flex;
  gap: 56px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 720px) {
    gap: 32px;
  }
`;

const ImgCol = styled.div`
  flex: 1 1 280px;
  min-width: 0;

  img {
    width: 100%;
    border-radius: 14px;
    box-shadow: 0 20px 56px rgba(0, 0, 0, 0.55);
    object-fit: cover;
  }
`;

const TextCol = styled.div`
  flex: 1 1 340px;
  min-width: 0;
`;

const Eyebrow = styled.p`
  color: #c9a227;
  font-family: "Cinzel", serif;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 10px;
`;

const Heading = styled(GoldTitle)`
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 20px;
  font-weight: 900;
`;

const Lede = styled.p`
  color: #e8d8b4;
  font-family: "Cinzel", serif;
  font-style: italic;
  font-size: clamp(1.05rem, 1.6vw, 1.2rem);
  line-height: 1.5;
  margin: 0 0 24px;
`;

const Beats = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  counter-reset: beat;
`;

const Beat = styled.li`
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 14px;
  align-items: start;
`;

const BeatNo = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 800;
  color: #0a0a0a;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  flex-shrink: 0;
`;

const BeatBody = styled.div`
  min-width: 0;
`;

const BeatT = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.02rem;
  font-weight: 700;
  color: #f5f0e8;
  margin: 2px 0 4px;
  line-height: 1.3;
`;

const BeatP = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.65;
  color: #c8b898;
  margin: 0;

  strong {
    color: #f0c040;
    font-weight: 600;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const Primary = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 12px 24px;
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
  position: relative;

  &:hover {
    color: #f0c040;
  }
`;

const Arrow = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 7h10m-4-4 4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Story() {
  return (
    <Section id="story">
      <Wrap>
        <Row>
          <ImgCol>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/e732ab4d-acf4-43fd-b4b1-a1708e5bf027.jpg"
              alt="Complete 7-in-1 Sphere of Kings game showing all game modes and accessories"
              loading="lazy"
              width={560}
              height={560}
            />
          </ImgCol>
          <TextCol>
            <Eyebrow>Our story</Eyebrow>
            <Heading>A game for the long shelf.</Heading>
            <Lede>
              “What if a game board didn&apos;t have to be flat?”
            </Lede>

            <Beats aria-label="Three chapters of the Sphere of Kings story">
              <Beat>
                <BeatNo aria-hidden="true">01</BeatNo>
                <BeatBody>
                  <BeatT>Where the vision began</BeatT>
                  <BeatP>
                    Classic family games on a spherical surface. Those{" "}
                    <strong>&quot;what if…&quot;</strong> questions turned into
                    Sphere of Kings — one platform, seven ways to play.
                  </BeatP>
                </BeatBody>
              </Beat>
              <Beat>
                <BeatNo aria-hidden="true">02</BeatNo>
                <BeatBody>
                  <BeatT>Seven experiences, one sphere</BeatT>
                  <BeatP>
                    Royal Checkers, Imperial Kings, Spherical Puzzle, DIY
                    Paintable, Custom Upload and more — interchangeable sets
                    on an <strong>8-inch magnetic board</strong> built for
                    years of family game nights.
                  </BeatP>
                </BeatBody>
              </Beat>
              <Beat>
                <BeatNo aria-hidden="true">03</BeatNo>
                <BeatBody>
                  <BeatT>Built to last, built to care</BeatT>
                  <BeatP>
                    Precision 3D printing in environmentally friendly
                    factories, reusable and <strong>recyclable</strong>{" "}
                    materials, sustainable fulfilment. A premium game you can
                    enjoy for a decade and recycle at the end.
                  </BeatP>
                </BeatBody>
              </Beat>
            </Beats>

            <Actions>
              <Primary href="/our-story">
                Read the full story
                {Arrow}
              </Primary>
              <Ghost href="/shop">Shop the Early Bird →</Ghost>
            </Actions>
          </TextCol>
        </Row>
      </Wrap>
    </Section>
  );
}
