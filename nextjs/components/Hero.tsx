"use client";

import styled from "styled-components";
import { Wrap, GoldTitle } from "./shared";
import SignupForm from "./SignupForm";

const Section = styled.section`
  background: linear-gradient(160deg, #0a0a0a 0%, #0e0c08 60%, #0a0a0a 100%);
  padding: var(--section-pad) 0;
  min-height: 88vh;
  display: flex;
  align-items: center;

  @media (max-width: 720px) {
    min-height: 0;
    padding: 48px 0;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 48px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 720px) {
    gap: 32px;
  }
`;

const Left = styled.div`
  flex: 1 1 340px;
  min-width: 0;
`;

const Right = styled.div`
  flex: 1 1 280px;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Tag = styled.div`
  display: inline-block;
  border: 1px solid #4a3a18;
  border-radius: 20px;
  padding: 5px 18px;
  font-size: 0.78rem;
  color: #c9a227;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 20px;

  @media (max-width: 420px) {
    font-size: 0.7rem;
    padding: 4px 14px;
    letter-spacing: 0.1em;
  }
`;

const Title = styled(GoldTitle).attrs({ as: "h1" })`
  font-size: clamp(2rem, 4.5vw, 3.6rem);
  line-height: 1.12;
  margin: 0 0 18px;
  font-weight: 900;
  letter-spacing: -0.01em;
`;

const Sub = styled.p`
  font-size: clamp(1rem, 1.4vw, 1.2rem);
  color: #a89880;
  line-height: 1.72;
  margin: 0 0 36px;
  max-width: 520px;
`;

const OrbImg = styled.img`
  width: 100%;
  max-width: 460px;
  border-radius: 14px;
  box-shadow: 0 0 80px rgba(201, 162, 39, 0.14), 0 24px 64px rgba(0, 0, 0, 0.7);
  object-fit: cover;
  animation: float-orb 6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default function Hero() {
  return (
    <Section id="hero">
      <Wrap>
        <Row>
          <Left>
            <Tag>Launching on Kickstarter · November 19, 2026</Tag>
            <Title>The Future of Strategic Royalty is Coming.</Title>
            <Sub>
              A revolutionary 360° board game where strategy, creativity, and imagination
              collide. Paint your kingdom. Conquer the sphere.
            </Sub>
            <div id="signup">
              <SignupForm
                source="hero"
                maxWidth="480px"
                finePrint="Be first to know when we launch on Kickstarter on November 19. No spam, unsubscribe anytime."
              />
            </div>
          </Left>
          <Right>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <OrbImg
              src="/images/d846e954-7329-421e-9b42-85a07f82d117.jpg"
              alt="Sphere of Kings — Royal Checkers spherical game board, red and black"
              loading="lazy"
              width={480}
              height={480}
            />
          </Right>
        </Row>
      </Wrap>
    </Section>
  );
}
