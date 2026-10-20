"use client";

import Link from "next/link";
import styled from "styled-components";
import { Wrap } from "./shared";

/**
 * Home-page promo band for the Royal Sphere Giveaway + license
 * marketplace. Sits under the hero so every landing visitor sees it
 * without scrolling. Two CTAs:
 *   • "Enter the giveaway" → /sweepstakes (public rules + AMOE)
 *   • "License your design" → /license (B2B / creator)
 *
 * Visually distinct from the surrounding sections — tighter height,
 * gold accent border, split-column layout on desktop, stacks on mobile.
 */
export default function GiveawayBand() {
  return (
    <Band>
      <Wrap>
        <Row>
          <Tile>
            <Eye>Royal Sphere Giveaway</Eye>
            <H>Share. Enter. Win a free sphere.</H>
            <P>
              Every 100 verified entrants, we draw one winner at random for
              a free Sphere of Kings game board. No purchase necessary —
              a free alternative entry method is on the rules page.
            </P>
            <CtaRow>
              <PrimaryCta href="/sweepstakes">See the rules</PrimaryCta>
              <GhostCta href="/me/referrals">Get your referral link</GhostCta>
            </CtaRow>
          </Tile>

          <Divider aria-hidden="true" />

          <Tile>
            <Eye>Designer Licensing</Eye>
            <H>Turn your sphere into a product.</H>
            <P>
              Submit your finished sphere design. If we approve it, we handle
              production, catalog listing, and payment — you earn 10 %
              commission on every unit, 15 % after 1,000 units sold.
            </P>
            <CtaRow>
              <PrimaryCta href="/license">Apply to license</PrimaryCta>
            </CtaRow>
          </Tile>
        </Row>
      </Wrap>
    </Band>
  );
}

const Band = styled.section`
  padding: clamp(32px, 5vw, 56px) 0;
  background: linear-gradient(180deg, #0a0a0a 0%, #0d0b08 100%);
  border-top: 1px solid #1e1a12;
  border-bottom: 1px solid #1e1a12;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 32px;
  align-items: stretch;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Divider = styled.div`
  width: 1px;
  background: linear-gradient(180deg, transparent 0%, #2a2218 50%, transparent 100%);

  @media (max-width: 820px) { display: none; }
`;

const Eye = styled.div`
  font-family: "Cinzel", Georgia, serif;
  color: var(--gold, #c9a227);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const H = styled.h2`
  font-family: "Cinzel", Georgia, serif;
  background: linear-gradient(90deg, #c9a227 0%, #f0c040 33%, #c9a227 66%, #f0c040 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  font-weight: 900;
  margin: 0;
  line-height: 1.2;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const P = styled.p`
  color: #a89880;
  font-size: 0.96rem;
  line-height: 1.55;
  margin: 0;
`;

const CtaRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
`;

const PrimaryCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  background-size: 200% auto;
  color: #0a0a0a !important;
  padding: 10px 20px;
  border-radius: 999px;
  text-decoration: none;
  transition: background-position 0.3s, box-shadow 0.3s;

  &:hover {
    background-position: right center;
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
  &::after {
    content: "→";
    transition: transform 0.2s;
  }
  &:hover::after {
    transform: translateX(2px);
  }
`;

const GhostCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold-light, #f0c040);
  background: transparent;
  border: 1px solid var(--gold, #c9a227);
  padding: 10px 20px;
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(201, 162, 39, 0.08);
    color: var(--gold-light, #f0c040);
  }
`;
