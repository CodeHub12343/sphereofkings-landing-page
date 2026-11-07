"use client";

// Landing-page promo band for the two flagship product surfaces added
// on 2026-11-07: the Creation Station (/create) and Creator Kingdom
// (/creators). Mirrors the PlayGamesBand look — eyebrow + headline over
// two side-by-side cards — so the homepage reads as one system.

import Link from "next/link";
import styled from "styled-components";

export default function CreateAndEarnBand() {
  return (
    <Section>
      <Wrap>
        <Head>
          <Eyebrow>Make it yours · Earn free games</Eyebrow>
          <Title>
            Two new ways to join the kingdom.
            <GoldSpan> Create it, or earn it.</GoldSpan>
          </Title>
          <Sub>
            Design your own Sphere of Kings board and have it printed, or
            promote the game as a creator and earn free products.
          </Sub>
        </Head>

        <Cards>
          <Card href="/create">
            <CardMedia aria-hidden="true">
              <SphereOrb>
                {/* Six color bands suggest the 9-color manufacturing palette. */}
                {["#D4AF37", "#1565C0", "#D32F2F", "#2E7D32", "#8E24AA", "#FF8F00"].map((c, i) => (
                  <Band key={i} style={{ background: c, top: `${12 + i * 13}%` }} />
                ))}
                <OrbHighlight />
              </SphereOrb>
            </CardMedia>
            <CardBody>
              <CardTag>Creation Station</CardTag>
              <CardName>Design your own sphere</CardName>
              <Bullets>
                <li>Nine-color palette with unlimited custom HEX</li>
                <li>Upload artwork or describe the design to the AI</li>
                <li>Live 3D preview, pricing, and manufacturing-ready files</li>
              </Bullets>
              <CardCta>
                Start designing
                <Arrow />
              </CardCta>
            </CardBody>
          </Card>

          <Card href="/creators">
            <CardMedia aria-hidden="true">
              <CrownStack>
                <Crown />
                <Chip style={{ background: "#D4AF37" }}>500</Chip>
                <Chip style={{ background: "#1565C0", marginLeft: 40 }}>500</Chip>
                <Chip style={{ background: "#D32F2F", marginLeft: 80 }}>500</Chip>
              </CrownStack>
            </CardMedia>
            <CardBody>
              <CardTag>Creator Kingdom</CardTag>
              <CardName>Earn free games as a creator</CardName>
              <Bullets>
                <li>Content assignments scaled to your audience</li>
                <li>500 Creator Credits per completed assignment</li>
                <li>Redeem credits for real Sphere of Kings products</li>
              </Bullets>
              <CardCta>
                Apply to join
                <Arrow />
              </CardCta>
            </CardBody>
          </Card>
        </Cards>
      </Wrap>
    </Section>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------- styles ----------

const Section = styled.section`
  background:
    radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201, 162, 39, 0.10), transparent 70%),
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
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Link)`
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

const CardMedia = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(180deg, #15110c 0%, #0a0806 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
`;

const SphereOrb = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #1a1510;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(240, 192, 64, 0.18), inset -14px -14px 30px rgba(0,0,0,0.6);
  border: 2px solid #c9a227;
`;

const Band = styled.div`
  position: absolute;
  left: -10%;
  width: 120%;
  height: 11%;
  opacity: 0.85;
`;

const OrbHighlight = styled.div`
  position: absolute;
  top: 10%;
  left: 15%;
  width: 40%;
  height: 25%;
  background: radial-gradient(ellipse, rgba(255,255,255,0.35), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
`;

const CrownStack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
`;

const Crown = styled.div`
  width: 100px;
  height: 36px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  clip-path: polygon(0% 100%, 8% 30%, 22% 80%, 36% 15%, 50% 80%, 64% 15%, 78% 80%, 92% 30%, 100% 100%);
  margin-bottom: 10px;
  filter: drop-shadow(0 4px 12px rgba(240, 192, 64, 0.4));
`;

const Chip = styled.div`
  color: #000;
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 0.82rem;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #0006;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
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
  margin: 0 0 6px;
  font-weight: 800;
`;

const Bullets = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  li {
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
    color: #a89880;
    line-height: 1.5;
    padding-left: 16px;
    position: relative;
  }
  li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c9a227;
  }
`;

const CardCta = styled.span`
  margin-top: 14px;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #000;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  padding: 10px 18px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
`;
