"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap, SectionEyebrow, GoldTitle } from "./shared";

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: #0a0a0a;
`;

const Head = styled.header`
  text-align: center;
  margin-bottom: 44px;
`;

const Heading = styled(GoldTitle).attrs({ as: "h2" })`
  text-align: center;
  font-size: clamp(1.8rem, 3.5vw, 2.7rem);
  margin: 0 0 10px;
  font-weight: 900;
`;

const Lede = styled.p`
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Link)<{ $accent: "gold" | "crim" | "royal" | "silver" }>`
  position: relative;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${(p) =>
      p.$accent === "gold"
        ? "#c9a227"
        : p.$accent === "crim"
        ? "#c62b44"
        : p.$accent === "royal"
        ? "#4c7ce0"
        : "#8a8a8a"};
    opacity: 0.7;
  }

  &:hover {
    border-color: ${(p) =>
      p.$accent === "gold"
        ? "#c9a227"
        : p.$accent === "crim"
        ? "#c62b44"
        : p.$accent === "royal"
        ? "#4c7ce0"
        : "#a89880"};
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  }
  &:focus-visible {
    outline: 2px solid #f0c040;
    outline-offset: 2px;
  }
`;

const CardIcon = styled.div<{ $accent: "gold" | "crim" | "royal" | "silver" }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${(p) =>
    p.$accent === "gold"
      ? "rgba(201, 162, 39, 0.12)"
      : p.$accent === "crim"
      ? "rgba(198, 43, 68, 0.12)"
      : p.$accent === "royal"
      ? "rgba(76, 124, 224, 0.12)"
      : "rgba(255, 255, 255, 0.04)"};
  color: ${(p) =>
    p.$accent === "gold"
      ? "#f0c040"
      : p.$accent === "crim"
      ? "#ff6b7a"
      : p.$accent === "royal"
      ? "#7fa3ff"
      : "#a89880"};
`;

const CardTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #f5f0e8;
  margin: 0;
`;

const CardBody = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  line-height: 1.55;
  color: #a89880;
  margin: 0;
  flex: 1;
`;

const CardCta = styled.span`
  font-family: "Cinzel", serif;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f0c040;
  font-weight: 700;
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export default function BecomeKingdom() {
  return (
    <Section id="kingdom">
      <Wrap>
        <Head>
          <SectionEyebrow>Join the Kingdom</SectionEyebrow>
          <Heading>Become Part of the Kingdom</Heading>
          <Lede>
            Four ways in — buy, promote, stock, or support. Each unlocks a
            different side of the Sphere of Kings community.
          </Lede>
        </Head>
        <Grid>
          <Card href="/shop" $accent="gold" aria-label="Shop the collection">
            <CardIcon $accent="gold" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 5h14l-1 10H4L3 5Zm2 0 1-3h8l1 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardIcon>
            <CardTitle>Browse the Rewards</CardTitle>
            <CardBody>
              Explore the full reward lineup. All pledges are backed
              exclusively through our Kickstarter campaign.
            </CardBody>
            <CardCta>
              View Rewards
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M2 5h6m-2-2 2 2-2 2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardCta>
          </Card>

          <Card href="/affiliate" $accent="crim" aria-label="Become an affiliate">
            <CardIcon $accent="crim" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12 3 7 17m2-11H5a2 2 0 0 0 0 4h3M11 10h4a2 2 0 0 1 0 4h-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardIcon>
            <CardTitle>Become an Affiliate</CardTitle>
            <CardBody>
              Promote Sphere of Kings through your unique referral link,
              QR code and printable poster. Six-tier commission ladder.
            </CardBody>
            <CardCta>
              Explore Affiliate Program
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M2 5h6m-2-2 2 2-2 2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardCta>
          </Card>

          <Card href="/wholesale" $accent="royal" aria-label="Wholesale and bulk orders">
            <CardIcon $accent="royal" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="7" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M3 11h14M8 7V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </CardIcon>
            <CardTitle>Wholesale &amp; Bulk Orders</CardTitle>
            <CardBody>
              For retailers, schools, game cafés and organisations.
              Automatic bands up to 30%; 40% through an owner-reviewed quote.
            </CardBody>
            <CardCta>
              Explore Wholesale
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M2 5h6m-2-2 2 2-2 2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardCta>
          </Card>

          <Card href="/donate" $accent="silver" aria-label="Support the project">
            <CardIcon $accent="silver" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 17s-6-3.5-6-8a3.5 3.5 0 0 1 6-2.5A3.5 3.5 0 0 1 16 9c0 4.5-6 8-6 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </CardIcon>
            <CardTitle>Support the Kingdom</CardTitle>
            <CardBody>
              Give supporters a chance to contribute to prototyping,
              community play and the launch batch. No product required.
            </CardBody>
            <CardCta>
              Support the Project
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M2 5h6m-2-2 2 2-2 2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardCta>
          </Card>
        </Grid>
      </Wrap>
    </Section>
  );
}
