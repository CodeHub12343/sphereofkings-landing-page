"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap, GoldTitle } from "./shared";
import SubscriberCounter from "./SubscriberCounter";

// Kickstarter campaign URL. Set NEXT_PUBLIC_KICKSTARTER_URL in env
// when the campaign goes live; falls back to the on-page signup
// anchor so the button is always clickable.
const KICKSTARTER_URL =
  process.env.NEXT_PUBLIC_KICKSTARTER_URL ?? "/#signup";

const Section = styled.section`
  background: linear-gradient(160deg, #0a0a0a 0%, #0e0c08 60%, #0a0a0a 100%);
  padding: var(--section-pad) 0;
  min-height: 88vh;
  display: flex;
  align-items: center;

  @media (max-width: 720px) {
    min-height: 0;
    padding: 56px 0 40px;
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

const Eye = styled.div`
  display: inline-block;
  border: 1px solid #4a3a18;
  border-radius: 20px;
  padding: 5px 18px;
  font-size: 0.74rem;
  color: #c9a227;
  font-family: "Cinzel", serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 22px;

  @media (max-width: 420px) {
    font-size: 0.68rem;
    padding: 4px 14px;
    letter-spacing: 0.1em;
  }
`;

const Title = styled(GoldTitle).attrs({ as: "h1" })`
  font-size: clamp(2.1rem, 4.6vw, 3.6rem);
  line-height: 1.1;
  margin: 0 0 18px;
  font-weight: 900;
  letter-spacing: -0.015em;
`;

const Sub = styled.p`
  font-size: clamp(1rem, 1.4vw, 1.18rem);
  color: #a89880;
  line-height: 1.7;
  margin: 0 0 24px;
  max-width: 540px;
`;

const EarlyBird = styled.aside`
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  background: rgba(201, 162, 39, 0.08);
  border: 1px solid #c9a227;
  border-radius: 10px;
  margin-bottom: 28px;
  max-width: 540px;
`;

const EBIcon = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #c9a227;
  color: #0a0a0a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const EBBody = styled.div`
  min-width: 0;
`;

const EBTitle = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f0c040;
`;

const EBSub = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #a89880;
  margin-top: 2px;
`;

const Ctas = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
`;

const Primary = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.98rem;
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

  @media (max-width: 420px) {
    padding: 13px 20px;
    font-size: 0.9rem;
  }
`;

const Secondary = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 13px 24px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #4a3a18;
  color: #f5f0e8;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: 3px;
  }

  @media (max-width: 420px) {
    padding: 12px 18px;
    font-size: 0.88rem;
  }
`;

const Benefits = styled.ul`
  list-style: none;
  padding: 0;
  /* Breathing room from the Kickstarter CTA strip above.
     Matches the Hero's existing rhythm (eyebrow→title 22px,
     sub→buttons 20px). */
  margin: 24px 0 0;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;

  @media (max-width: 420px) {
    margin-top: 20px;
  }

  li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  li::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c9a227;
    flex-shrink: 0;
  }
`;

const KickstarterStrip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
  max-width: 440px;
`;

const KsBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #2b7a3a 0%, #4fb07d 50%, #2b7a3a 100%);
  background-size: 200% auto;
  color: #0a0a0a;
  text-decoration: none;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(44, 122, 58, 0.35);
  transition: background-position 0.3s ease, box-shadow 0.3s ease,
    transform 0.2s ease;
  width: fit-content;

  &:hover {
    background-position: right center;
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(79, 176, 125, 0.45);
    color: #0a0a0a;
  }
  &:focus-visible {
    outline: 3px solid #4fb07d;
    outline-offset: 3px;
  }
`;

const KsIcon = styled.span`
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  background: #0a0a0a;
  color: #4fb07d;
  border-radius: 4px;
`;

const KsHint = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(10, 10, 10, 0.72);
  margin-left: 6px;
  padding-left: 10px;
  border-left: 1px solid rgba(10, 10, 10, 0.25);
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
            <Eye>Sphere of Kings · The 7-in-1 Spherical Board Game</Eye>
            <Title>Strategy Has a New Dimension.</Title>
            <Sub>
              A revolutionary spherical board game where classic strategy,
              creative expression and seven unique experiences come together.
              Discover your kingdom and get ready for the next move.
            </Sub>
            <EarlyBird role="note">
              <EBIcon aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1.5 8.5 4.7 12 5.2l-2.5 2.5.6 3.4L7 9.5l-3.1 1.6.6-3.4L1 5.2l3.5-.5L7 1.5Z"
                    fill="currentColor"
                  />
                </svg>
              </EBIcon>
              <EBBody>
                <EBTitle>Live on Kickstarter</EBTitle>
                <EBSub>All rewards ship exclusively through our campaign.</EBSub>
              </EBBody>
            </EarlyBird>
            <Ctas>
              <Primary href="/shop">
                Explore the Rewards
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6h8m-3-3 3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Primary>
              <Secondary href="/how-to-play">Discover How to Play</Secondary>
            </Ctas>

            {/* Kickstarter strip — subscriber counter + Back on
                Kickstarter CTA, lifted to the top of the page per
                owner request. */}
            <KickstarterStrip>
              <SubscriberCounter />
              <KsBtn
                href={KICKSTARTER_URL}
                target={KICKSTARTER_URL.startsWith("http") ? "_blank" : undefined}
                rel={KICKSTARTER_URL.startsWith("http") ? "noreferrer" : undefined}
              >
                <KsIcon aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 2h2v10H3zM11 7l-4-4v8z"
                      fill="currentColor"
                    />
                  </svg>
                </KsIcon>
                Back on Kickstarter
                <KsHint>Launches Nov 19, 2026</KsHint>
              </KsBtn>
            </KickstarterStrip>
            <Benefits>
              <li>360° spherical play</li>
              <li>Seven games on one board</li>
              <li>Collector-grade build</li>
            </Benefits>
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
