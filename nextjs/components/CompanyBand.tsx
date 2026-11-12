"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap } from "./shared";

const Band = styled.section`
  position: relative;
  padding: clamp(48px, 7vw, 80px) 0;
  background: linear-gradient(
    180deg,
    #0e0c08 0%,
    #151008 40%,
    #0e0c08 100%
  );
  border-top: 1px solid #2e2618;
  border-bottom: 1px solid #2e2618;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 70% 60% at 50% 0%,
      rgba(201, 162, 39, 0.06) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

const Inner = styled.div`
  position: relative;
  display: flex;
  gap: clamp(28px, 4vw, 56px);
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 720px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Badge = styled.div`
  flex: 0 0 auto;
  width: clamp(100px, 14vw, 140px);
  height: clamp(100px, 14vw, 140px);
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(201, 162, 39, 0.15) 0%,
    rgba(240, 192, 64, 0.08) 100%
  );
  border: 2px solid #c9a227;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BadgeLabel = styled.span`
  font-family: "Cinzel", serif;
  font-weight: 900;
  font-size: clamp(1.3rem, 2.4vw, 1.8rem);
  background: linear-gradient(
    135deg,
    #c9a227 0%,
    #f0c040 50%,
    #c9a227 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  letter-spacing: 0.04em;
`;

const BadgeSub = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #a89880;
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Eyebrow = styled.p`
  color: #c9a227;
  font-family: "Cinzel", serif;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 8px;
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.3rem, 2.8vw, 2rem);
  font-weight: 800;
  color: #f5f0e8;
  margin: 0 0 12px;
  line-height: 1.25;
`;

const Desc = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #c8b898;
  margin: 0 0 20px;
  max-width: 600px;

  strong {
    color: #f0c040;
    font-weight: 600;
  }

  @media (max-width: 720px) {
    max-width: none;
  }
`;

const Chips = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;

  @media (max-width: 720px) {
    justify-content: center;
  }
`;

const Chip = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #f0c040;
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid #2e2618;
  border-radius: 999px;
  padding: 5px 14px;
  white-space: nowrap;
`;

const Cta = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0a0a0a;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  background-size: 200% auto;
  padding: 11px 24px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-position 0.3s ease, box-shadow 0.3s ease;
  -webkit-text-fill-color: #0a0a0a;

  &:hover {
    background-position: right center;
    box-shadow: 0 0 28px rgba(240, 192, 64, 0.35);
  }
`;

export default function CompanyBand() {
  return (
    <Band>
      <Wrap>
        <Inner>
          <Badge aria-hidden="true">
            <BadgeLabel>CDN</BadgeLabel>
            <BadgeSub>Parent Co.</BadgeSub>
          </Badge>

          <Content>
            <Eyebrow>A Creative Design Networks Company</Eyebrow>
            <Title>
              Founded &amp; owned by Creative Design Networks
            </Title>
            <Desc>
              Sphere of Kings is a product of{" "}
              <strong>Creative Design Networks</strong> — a licensed
              technology and product-design company based in{" "}
              <strong>Modesto, California</strong>. CDN handles everything
              from physical product engineering and 3D-printed manufacturing
              to the digital gaming platform you play on today.
            </Desc>
            <Chips>
              <Chip>Hardware &amp; Manufacturing</Chip>
              <Chip>Digital Platform</Chip>
              <Chip>3D Printing &amp; Design</Chip>
              <Chip>AI &amp; Software</Chip>
            </Chips>
            <Cta href="/company">
              Meet Creative Design Networks
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
            </Cta>
          </Content>
        </Inner>
      </Wrap>
    </Band>
  );
}
