"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap, GoldTitle } from "@/components/shared";

/* ── layout ────────────────────────────────────────── */

const Page = styled.main`
  background: #0a0a0a;
`;

const HeroSection = styled.section`
  position: relative;
  padding: clamp(56px, 9vw, 112px) 0 clamp(40px, 6vw, 72px);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 80% 50% at 50% 20%,
      rgba(201, 162, 39, 0.08) 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;

const Section = styled.section<{ $alt?: boolean }>`
  padding: clamp(48px, 7vw, 80px) 0;
  background: ${(p) => (p.$alt ? "#0e0c08" : "#0a0a0a")};
  border-top: 1px solid #1a1510;
`;

/* ── hero ──────────────────────────────────────────── */

const HeroEyebrow = styled.p`
  color: #c9a227;
  font-family: "Cinzel", serif;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 12px;
  text-align: center;
`;

const HeroHeading = styled(GoldTitle)`
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  margin: 0 0 20px;
  font-weight: 900;
  text-align: center;
  line-height: 1.15;
`;

const HeroLede = styled.p`
  font-family: "Cinzel", serif;
  font-style: italic;
  font-size: clamp(1.05rem, 1.6vw, 1.22rem);
  color: #e8d8b4;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 32px;
  line-height: 1.55;
`;

const LicenseBadge = styled.div`
  max-width: 520px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(14, 12, 8, 0.6) 100%);
  border: 1px solid #2e2618;
  border-radius: 12px;
  padding: 24px 28px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: center;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 20px;
  }
`;

const LicenseIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 520px) {
    margin: 0 auto;
  }
`;

const LicenseBody = styled.div`
  min-width: 0;
`;

const LicenseTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #f0c040;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 6px;
`;

const LicenseDetail = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: #c8b898;
  line-height: 1.55;
  margin: 0;

  strong {
    color: #f5f0e8;
    font-weight: 600;
  }
`;

/* ── dual-role cards ──────────────────────────────── */

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
  gap: 28px;
`;

const Card = styled.div`
  background: #121010;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(28px, 4vw, 40px);
`;

const CardIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid #2e2618;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #f0c040;
`;

const CardEyebrow = styled.p`
  color: #c9a227;
  font-family: "Cinzel", serif;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin: 0 0 6px;
`;

const CardTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: clamp(1.2rem, 2.2vw, 1.5rem);
  font-weight: 800;
  color: #f5f0e8;
  margin: 0 0 14px;
  line-height: 1.25;
`;

const CardBody = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #c8b898;
  margin: 0 0 18px;

  strong {
    color: #f0c040;
    font-weight: 600;
  }
`;

const CardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CardItem = styled.li`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #c8b898;
  line-height: 1.55;
  padding-left: 18px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c9a227;
  }
`;

/* ── relationship section ─────────────────────────── */

const SectionEyebrow = styled.p`
  color: #c9a227;
  font-family: "Cinzel", serif;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 10px;
  text-align: center;
`;

const SectionHeading = styled(GoldTitle)`
  font-size: clamp(1.5rem, 3.2vw, 2.4rem);
  margin: 0 0 16px;
  font-weight: 900;
  text-align: center;
`;

const SectionBody = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.75;
  color: #c8b898;
  max-width: 720px;
  margin: 0 auto 40px;
  text-align: center;

  strong {
    color: #f0c040;
    font-weight: 600;
  }
`;

const RelationshipRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 3vw, 32px);
  flex-wrap: wrap;
  margin-bottom: 40px;
`;

const RelNode = styled.div<{ $primary?: boolean }>`
  padding: ${(p) => (p.$primary ? "18px 28px" : "14px 24px")};
  border-radius: 12px;
  border: ${(p) =>
    p.$primary ? "2px solid #c9a227" : "1px solid #2e2618"};
  background: ${(p) =>
    p.$primary
      ? "linear-gradient(135deg, rgba(201,162,39,0.12), rgba(14,12,8,0.8))"
      : "#121010"};
  text-align: center;
`;

const RelLabel = styled.span<{ $primary?: boolean }>`
  font-family: "Cinzel", serif;
  font-weight: 800;
  font-size: ${(p) => (p.$primary ? "1.1rem" : "0.95rem")};
  color: ${(p) => (p.$primary ? "#f0c040" : "#f5f0e8")};
  display: block;
  line-height: 1.3;
`;

const RelSub = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Arrow = styled.span`
  color: #c9a227;
  font-size: 1.6rem;
  line-height: 1;

  @media (max-width: 520px) {
    transform: rotate(90deg);
    display: inline-block;
  }
`;

/* ── vision section ───────────────────────────────── */

const VisionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 20px;
  margin-top: 32px;
`;

const VisionItem = styled.div`
  background: #121010;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
`;

const VisionNumber = styled.span`
  font-family: "Cinzel", serif;
  font-weight: 900;
  font-size: 1.8rem;
  background: linear-gradient(135deg, #c9a227, #f0c040);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  margin-bottom: 6px;
`;

const VisionLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #c8b898;
  line-height: 1.5;
`;

/* ── page ──────────────────────────────────────────── */

export default function CompanyPage() {
  return (
    <>
      <Header />
      <Page>
        {/* ── Hero ─────────────────────────────────── */}
        <HeroSection>
          <Wrap>
            <HeroEyebrow>Parent Company</HeroEyebrow>
            <HeroHeading>Creative Design Networks</HeroHeading>
            <HeroLede>
              The technology and product-design company behind Sphere of
              Kings — bridging physical craftsmanship with digital
              innovation.
            </HeroLede>

            <LicenseBadge>
              <LicenseIcon aria-hidden="true">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a0a0a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M5 12h6" />
                  <path d="M8 9v6" />
                </svg>
              </LicenseIcon>
              <LicenseBody>
                <LicenseTitle>Licensed Business</LicenseTitle>
                <LicenseDetail>
                  <strong>City of Modesto</strong> Business License —
                  Computer / Software Store
                  <br />
                  Owner: <strong>James Bowser</strong> · Modesto, CA 95351
                  <br />
                  Active through 12/31/2026
                </LicenseDetail>
              </LicenseBody>
            </LicenseBadge>
          </Wrap>
        </HeroSection>

        {/* ── Relationship diagram ─────────────────── */}
        <Section>
          <Wrap>
            <SectionEyebrow>Company Structure</SectionEyebrow>
            <SectionHeading>
              How CDN &amp; Sphere of Kings Connect
            </SectionHeading>
            <SectionBody>
              Creative Design Networks is the <strong>parent company</strong>{" "}
              that <strong>founded and owns</strong> Sphere of Kings.
              CDN provides the business infrastructure, intellectual
              property, product engineering, and technology platform that
              make Sphere of Kings possible — from the physical game board
              in your hands to the online matches you play on screen.
            </SectionBody>

            <RelationshipRow>
              <RelNode $primary>
                <RelLabel $primary>Creative Design Networks</RelLabel>
                <RelSub>Parent Company</RelSub>
              </RelNode>
              <Arrow aria-hidden="true">→</Arrow>
              <RelNode>
                <RelLabel>Sphere of Kings</RelLabel>
                <RelSub>Flagship Product</RelSub>
              </RelNode>
            </RelationshipRow>
          </Wrap>
        </Section>

        {/* ── Hardware + Digital dual-role ──────────── */}
        <Section $alt>
          <Wrap>
            <SectionEyebrow>What CDN Does</SectionEyebrow>
            <SectionHeading>
              Hardware Meets Digital
            </SectionHeading>
            <SectionBody>
              Creative Design Networks operates across two complementary
              divisions. The <strong>hardware side</strong> brings the
              physical Sphere of Kings game board to life, while the{" "}
              <strong>digital side</strong> powers the online gaming
              experience, creator ecosystem, and software platform.
            </SectionBody>

            <CardGrid>
              {/* Hardware card */}
              <Card>
                <CardIcon>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </CardIcon>
                <CardEyebrow>Hardware Division</CardEyebrow>
                <CardTitle>
                  Physical Product &amp; Manufacturing
                </CardTitle>
                <CardBody>
                  CDN designs, engineers, and manufactures the physical
                  7-in-1 spherical game board — from initial concept
                  sketches through 3D printing and precision production.
                </CardBody>
                <CardList>
                  <CardItem>
                    Product design &amp; industrial engineering
                  </CardItem>
                  <CardItem>
                    3D printing &amp; rapid prototyping
                  </CardItem>
                  <CardItem>
                    Precision manufacturing &amp; quality control
                  </CardItem>
                  <CardItem>
                    Sustainable materials &amp; eco-friendly packaging
                  </CardItem>
                  <CardItem>
                    Magnetic game-piece systems &amp; interchangeable sets
                  </CardItem>
                  <CardItem>
                    Supply chain, inventory &amp; fulfilment
                  </CardItem>
                </CardList>
              </Card>

              {/* Digital card */}
              <Card>
                <CardIcon>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </CardIcon>
                <CardEyebrow>Digital Division</CardEyebrow>
                <CardTitle>
                  Platform, Software &amp; Technology
                </CardTitle>
                <CardBody>
                  CDN builds and operates the digital infrastructure
                  behind Sphere of Kings — the online gaming platform,
                  Creation Station, creator ecosystem, and all supporting
                  software technology.
                </CardBody>
                <CardList>
                  <CardItem>
                    Online gaming platform (Royal Checkers, Imperial Kings &amp; more)
                  </CardItem>
                  <CardItem>
                    Creation Station — user-designed sphere skins
                  </CardItem>
                  <CardItem>
                    Creator Kingdom ecosystem &amp; marketplace
                  </CardItem>
                  <CardItem>
                    Real-time multiplayer &amp; matchmaking engine
                  </CardItem>
                  <CardItem>
                    E-commerce, payments &amp; subscription systems
                  </CardItem>
                  <CardItem>
                    AI-powered features &amp; platform intelligence
                  </CardItem>
                </CardList>
              </Card>
            </CardGrid>
          </Wrap>
        </Section>

        {/* ── Vision / at-a-glance ─────────────────── */}
        <Section>
          <Wrap>
            <SectionEyebrow>At a Glance</SectionEyebrow>
            <SectionHeading>
              Building the Future of Gaming
            </SectionHeading>
            <SectionBody>
              Creative Design Networks is more than a game company.
              CDN is a full-spectrum technology and design studio combining{" "}
              <strong>physical craftsmanship</strong> with{" "}
              <strong>cutting-edge software</strong> to create products
              that bridge the physical and digital worlds.
            </SectionBody>

            <VisionGrid>
              <VisionItem>
                <VisionNumber>7-in-1</VisionNumber>
                <VisionLabel>
                  Games in one spherical board
                </VisionLabel>
              </VisionItem>
              <VisionItem>
                <VisionNumber>360°</VisionNumber>
                <VisionLabel>
                  Revolutionary board design
                </VisionLabel>
              </VisionItem>
              <VisionItem>
                <VisionNumber>2</VisionNumber>
                <VisionLabel>
                  Divisions — Hardware &amp; Digital
                </VisionLabel>
              </VisionItem>
              <VisionItem>
                <VisionNumber>CA</VisionNumber>
                <VisionLabel>
                  Based in Modesto, California
                </VisionLabel>
              </VisionItem>
            </VisionGrid>
          </Wrap>
        </Section>
      </Page>
      <Footer />
    </>
  );
}
