"use client";

import styled from "styled-components";
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

  p {
    color: #c8b898;
    font-size: 1rem;
    line-height: 1.8;
    margin: 0 0 18px;
  }
  p:last-child {
    margin-bottom: 0;
  }
`;

const Eyebrow = styled.p`
  color: #c9a227;
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 10px;
`;

const Heading = styled(GoldTitle)`
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 24px;
  font-weight: 900;
`;

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
            <Eyebrow>The Story Behind</Eyebrow>
            <Heading>Sphere of Kings</Heading>
            <p>
              Sphere of Kings reimagines the classic strategy board game with a completely
              new perspective. Instead of a flat board, players compete on a fully spherical
              battlefield, where strategy unfolds in every direction.
            </p>
            <p>
              Inspired by the timeless challenge of games like checkers and tactical battle
              games, Sphere of Kings introduces dynamic gameplay where positioning, foresight,
              and creativity determine the winner.
            </p>
            <p>
              But the experience doesn&apos;t stop at strategy. Each board can be customized
              and painted, turning every set into a unique piece of art. Whether you&apos;re a
              family looking for fun game nights, kids exploring creativity, or strategy
              enthusiasts seeking a fresh challenge, Sphere of Kings delivers a truly unique
              experience.
            </p>
          </TextCol>
        </Row>
      </Wrap>
    </Section>
  );
}
