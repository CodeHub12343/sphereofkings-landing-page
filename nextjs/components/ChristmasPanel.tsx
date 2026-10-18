"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap } from "./shared";

const Section = styled.section`
  padding: calc(var(--section-pad) * 0.65) 0;
  background: #050403;
`;

const Panel = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 36px;
  align-items: center;
  padding: clamp(32px, 5vw, 56px);
  background: linear-gradient(135deg, #0f0d08 0%, #0a0a0a 65%);
  border: 1px solid #c9a227;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(201, 162, 39, 0.1),
    0 30px 80px rgba(0, 0, 0, 0.5);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 80% 20%,
      rgba(201, 162, 39, 0.12),
      transparent 55%
    );
    pointer-events: none;
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const Body = styled.div`
  position: relative;
  z-index: 1;
`;

const Eye = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c9a227;
  margin-bottom: 16px;

  &::before {
    content: "";
    width: 24px;
    height: 1px;
    background: #c9a227;
  }
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.8rem, 3.6vw, 2.6rem);
  line-height: 1.15;
  color: #f5f0e8;
  margin: 0 0 16px;
  font-weight: 800;
`;

const TitleEm = styled.span`
  background: linear-gradient(90deg, #c9a227, #f0c040, #c9a227);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #a89880;
  margin: 0 0 20px;
  max-width: 520px;
`;

const Delivery = styled.p`
  font-family: "Cinzel", serif;
  font-size: 0.84rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f0c040;
  margin: 0 0 28px;
`;

const Ctas = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Primary = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 14px 26px;
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

const Secondary = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 13px 22px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #4a3a18;
  color: #f5f0e8;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Fine = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #5a4a38;
  line-height: 1.5;
  margin: 20px 0 0;
  max-width: 480px;
`;

const Media = styled.div`
  position: relative;
  z-index: 1;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #4a3a18;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export default function ChristmasPanel() {
  return (
    <Section id="christmas">
      <Wrap>
        <Panel>
          <Body>
            <Eye>Christmas Early Bird</Eye>
            <Title>
              Make This Christmas a <TitleEm>Royal Affair.</TitleEm>
            </Title>
            <Sub>
              Bring a new kind of strategy, creativity and friendly
              competition to your game nights. Explore the Christmas Early
              Bird collection and discover the Sphere of Kings experience.
            </Sub>
            <Delivery>Deliveries start December 1, 2026</Delivery>
            <Ctas>
              <Primary href="/shop">
                Explore Christmas Early Bird
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
              <Secondary href="/how-to-play">How to Play</Secondary>
            </Ctas>
            <Fine>
              Orders are shipped in the sequence they are paid. Not every
              parcel will arrive on December 1 — your tracking number is
              sent the moment your Sphere leaves the workshop.
            </Fine>
          </Body>
          <Media>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/0426fb4f-6550-4e4d-b8c2-42ce56f2a2ef.jpg"
              alt="Complete 7-in-1 Sphere of Kings game set"
              loading="lazy"
            />
          </Media>
        </Panel>
      </Wrap>
    </Section>
  );
}
