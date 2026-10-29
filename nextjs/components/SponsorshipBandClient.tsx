"use client";

import Link from "next/link";
import styled from "styled-components";
import { Wrap, SectionEyebrow, GoldTitle } from "./shared";
import { SponsorshipTier } from "@/lib/sponsorship";
import { AvailabilityByTier } from "@/app/sponsorship/actions";

const Section = styled.section`
  padding: var(--section-pad) 0;
  background:
    radial-gradient(ellipse at top, rgba(201, 162, 39, 0.08), transparent 60%),
    #0a0a0a;
  border-top: 1px solid #1a1510;
  border-bottom: 1px solid #1a1510;
`;

const Head = styled.header`
  text-align: center;
  margin-bottom: 36px;
`;

const Heading = styled(GoldTitle).attrs({ as: "h2" })`
  text-align: center;
  font-size: clamp(1.8rem, 3.5vw, 2.7rem);
  margin: 0 0 12px;
  font-weight: 900;
`;

const Lede = styled.p`
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 1.02rem;
  line-height: 1.6;
  max-width: 680px;
  margin: 0 auto;

  strong {
    color: #f5f0e8;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $gold?: boolean }>`
  background: ${(p) =>
    p.$gold
      ? "linear-gradient(180deg, rgba(201,162,39,0.1), #0e0c09)"
      : "#0e0c09"};
  border: 1.5px solid ${(p) => (p.$gold ? "#c9a227" : "#1e1a12")};
  border-radius: 14px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;

  @media (max-width: 520px) {
    padding: 22px 20px;
  }
`;

const Ribbon = styled.span`
  position: absolute;
  top: 14px;
  right: 14px;
  background: #c9a227;
  color: #0a0a0a;
  font-family: "Cinzel", serif;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 700;
`;

const Eyebrow = styled.p<{ $gold?: boolean }>`
  margin: 0;
  font-family: "Cinzel", serif;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${(p) => (p.$gold ? "#f0c040" : "#a89880")};
`;

const Name = styled.h3`
  margin: 0;
  font-family: "Cinzel", Georgia, serif;
  font-size: clamp(1.3rem, 2vw, 1.6rem);
  color: #f5f0e8;
  font-weight: 800;
`;

const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const Amount = styled.span`
  font-family: "Cinzel", serif;
  font-size: 2.1rem;
  font-weight: 900;
  color: #f5f0e8;
  line-height: 1;
`;

const PriceTag = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #a89880;
`;

const Avail = styled.div<{ $soldOut: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: ${(p) =>
    p.$soldOut ? "rgba(255,107,122,0.1)" : "rgba(79,176,125,0.1)"};
  color: ${(p) => (p.$soldOut ? "#ff6b7a" : "#4fb07d")};
  border: 1px solid
    ${(p) => (p.$soldOut ? "rgba(255,107,122,0.4)" : "rgba(79,176,125,0.4)")};
  align-self: flex-start;
`;

const Dot = styled.span<{ $soldOut: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${(p) => (p.$soldOut ? "#ff6b7a" : "#4fb07d")};
`;

const Highlights = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2px 0 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const Hi = styled.li`
  position: relative;
  padding-left: 20px;
  color: #d9cfbe;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  line-height: 1.45;

  &::before {
    content: "✦";
    position: absolute;
    left: 0;
    top: 0;
    color: #c9a227;
  }
`;

const PrimaryCTA = styled(Link)<{ $gold?: boolean }>`
  display: inline-block;
  margin-top: 6px;
  text-align: center;
  padding: 13px 20px;
  border-radius: 6px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: box-shadow 0.25s, background-position 0.3s;
  background: ${(p) =>
    p.$gold
      ? "linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%)"
      : "transparent"};
  background-size: 200% auto;
  color: ${(p) => (p.$gold ? "#0a0a0a" : "#f0c040")} !important;
  border: ${(p) => (p.$gold ? "none" : "1.5px solid #c9a227")};

  &:hover {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
    ${(p) => (p.$gold ? "background-position: right center;" : "background: rgba(201, 162, 39, 0.08);")}
  }
`;

const Foot = styled.p`
  text-align: center;
  color: #5a4a38;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  line-height: 1.55;
  margin: 32px auto 0;
  max-width: 640px;
`;

const DetailLink = styled(Link)`
  color: #c9a227;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: #f0c040;
  }
`;

type Props = {
  availability: AvailabilityByTier;
  tiers: SponsorshipTier[];
  launchDate: string;
};

export default function SponsorshipBandClient({
  availability,
  tiers,
  launchDate,
}: Props) {
  return (
    <Section id="sponsorship">
      <Wrap>
        <Head>
          <SectionEyebrow>Official Kickstarter Sponsorship</SectionEyebrow>
          <Heading>Partner with the launch.</Heading>
          <Lede>
            Our Kickstarter launches <strong>{launchDate}</strong>. A limited
            number of businesses can lock in a <strong>90-day promotional
            partnership</strong> that runs through launch and beyond — social
            shoutouts, branded videos, website placement, retail opportunities.
            Only <strong>{tiers[0].totalSlots} Silver</strong> and{" "}
            <strong>{tiers[1].totalSlots} Gold Premier</strong> slots are
            available.
          </Lede>
        </Head>

        <Grid>
          {tiers.map((t) => {
            const a = availability[t.id];
            const soldOut = a.remaining <= 0;
            const isGold = t.id === "gold";
            return (
              <Card key={t.id} $gold={isGold}>
                {isGold && <Ribbon>Most Visibility</Ribbon>}
                <Eyebrow $gold={isGold}>
                  {isGold
                    ? "Premium Partnership"
                    : "Promotional Partnership"}
                </Eyebrow>
                <Name>{t.name}</Name>
                <Price>
                  <Amount>{t.priceDisplay}</Amount>
                  <PriceTag>· 90 days</PriceTag>
                </Price>
                <Avail $soldOut={soldOut}>
                  <Dot $soldOut={soldOut} />
                  {soldOut
                    ? `All ${a.total} slots claimed`
                    : `${a.remaining} of ${a.total} slots available`}
                </Avail>
                <Highlights>
                  {t.highlights.slice(0, 4).map((h) => (
                    <Hi key={h}>{h}</Hi>
                  ))}
                </Highlights>
                <PrimaryCTA
                  href={soldOut ? "/sponsorship" : "/sponsorship"}
                  $gold={isGold}
                >
                  {soldOut
                    ? "Join the waitlist"
                    : `Sponsor at ${t.priceDisplay}`}
                </PrimaryCTA>
              </Card>
            );
          })}
        </Grid>

        <Foot>
          See the full benefit breakdown, business reporting commitments and
          sponsorship agreement details on the{" "}
          <DetailLink href="/sponsorship">
            sponsorship program page
          </DetailLink>
          . Advertising budgets, physical printing and giveaway costs are
          defined in a written agreement sent after payment.
        </Foot>
      </Wrap>
    </Section>
  );
}
