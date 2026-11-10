"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";

/* --- Layout primitives --------------------------------------------------- */

const Page = styled.main`
  background: #0a0a0a;
  color: #f5f0e8;
`;

const Hero = styled.section`
  position: relative;
  padding: clamp(60px, 10vw, 120px) 0 clamp(40px, 6vw, 72px);
  background:
    radial-gradient(1200px 500px at 50% -10%, rgba(201, 162, 39, 0.14), transparent 60%),
    linear-gradient(180deg, #0e0c08 0%, #0a0a0a 100%);
  border-bottom: 1px solid #1e1a12;
  text-align: center;
`;

const Eyebrow = styled.p`
  font-family: "Cinzel", serif;
  color: #f0c040;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 14px;
`;

const HeroTitle = styled.h1`
  font-family: "Cinzel", Georgia, serif;
  font-size: clamp(2rem, 5.2vw, 3.6rem);
  line-height: 1.12;
  margin: 0 auto 18px;
  color: #f5f0e8;
  max-width: 920px;
  background: linear-gradient(90deg, #c9a227 0%, #f0c040 50%, #c9a227 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroLede = styled.p`
  font-size: clamp(1.02rem, 1.4vw, 1.18rem);
  line-height: 1.65;
  color: #d1c7b4;
  max-width: 720px;
  margin: 0 auto;
`;

const LaunchChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  padding: 10px 18px;
  border: 1px solid #c9a227;
  border-radius: 999px;
  background: rgba(201, 162, 39, 0.08);
  font-family: "Cinzel", serif;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #f0c040;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4fb07d;
    box-shadow: 0 0 10px rgba(79, 176, 125, 0.75);
  }
`;

const Section = styled.section`
  padding: clamp(56px, 7vw, 96px) 0;
  border-bottom: 1px solid #1a1510;

  &:last-of-type {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-family: "Cinzel", Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: #f5f0e8;
  margin: 0 0 14px;
  line-height: 1.2;
`;

const SectionLede = styled.p`
  font-size: 1.02rem;
  line-height: 1.7;
  color: #c8b898;
  max-width: 820px;
  margin: 0 0 32px;
`;

const Prose = styled.div`
  color: #d1c7b4;
  font-size: 1rem;
  line-height: 1.75;
  max-width: 820px;

  p { margin: 0 0 16px; }
  strong { color: #f0c040; }
`;

/* --- Pledge summary ------------------------------------------------------ */

const PledgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin: 0 0 24px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const PledgeCard = styled.div<{ $accent?: boolean }>`
  background: ${(p) =>
    p.$accent
      ? "linear-gradient(135deg, rgba(201,162,39,0.14), rgba(198,43,68,0.06))"
      : "#121008"};
  border: 1px solid ${(p) => (p.$accent ? "#c9a227" : "#2e2618")};
  border-radius: 12px;
  padding: 24px 22px;

  .pct {
    font-family: "Cinzel", serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: #f0c040;
    margin-bottom: 6px;
  }
  .label {
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #a89880;
    margin-bottom: 8px;
  }
  h3 {
    font-family: "Cinzel", serif;
    font-size: 1.05rem;
    color: #f5f0e8;
    margin: 0 0 6px;
  }
  p {
    font-size: 0.9rem;
    color: #c8b898;
    line-height: 1.55;
    margin: 0;
  }
`;

/* --- Beneficiary blocks -------------------------------------------------- */

const Beneficiary = styled.article`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 40px;
  padding: 36px 0;
  border-top: 1px solid #1a1510;

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const BeneficiaryAside = styled.aside`
  .pct {
    font-family: "Cinzel", serif;
    font-size: 3rem;
    color: #f0c040;
    line-height: 1;
    margin-bottom: 8px;
  }
  .region {
    font-family: "Cinzel", serif;
    font-size: 0.74rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #a89880;
  }
`;

const BeneficiaryBody = styled.div`
  h3 {
    font-family: "Cinzel", Georgia, serif;
    font-size: 1.5rem;
    color: #f5f0e8;
    margin: 0 0 10px;
  }
  p {
    font-size: 1rem;
    line-height: 1.7;
    color: #d1c7b4;
    margin: 0 0 14px;
  }
  strong { color: #f0c040; }
`;

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0 18px;

  li {
    position: relative;
    padding: 8px 0 8px 22px;
    color: #d1c7b4;
    font-size: 0.96rem;
    line-height: 1.55;
    border-top: 1px solid #1a1510;

    &:first-child { border-top: none; }

    &::before {
      content: "◆";
      position: absolute;
      left: 0;
      top: 8px;
      color: #c9a227;
      font-size: 0.7rem;
    }

    strong { color: #f0c040; }
  }
`;

/* --- Allocation table ---------------------------------------------------- */

const TableWrap = styled.div`
  overflow-x: auto;
  margin: 24px 0 28px;
  border: 1px solid #2e2618;
  border-radius: 10px;
  background: #0e0c08;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th, td {
    text-align: left;
    padding: 14px 18px;
    border-bottom: 1px solid #1a1510;
  }
  th {
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #a89880;
    background: #121008;
  }
  tr:last-child td {
    border-bottom: none;
    color: #f0c040;
    font-weight: 600;
  }
  td:last-child {
    text-align: right;
    font-family: "SF Mono", "Menlo", "Consolas", monospace;
    color: #f5f0e8;
  }
`;

/* --- Scripture -----------------------------------------------------------*/

const Scripture = styled.blockquote`
  margin: 32px auto;
  max-width: 720px;
  padding: 28px 32px;
  border-left: 3px solid #c9a227;
  background: rgba(201, 162, 39, 0.05);
  border-radius: 4px;
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.1rem;
  line-height: 1.65;
  color: #f5f0e8;
  font-style: italic;

  cite {
    display: block;
    margin-top: 12px;
    font-style: normal;
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #f0c040;
  }
`;

/* --- Closing / CTA ------------------------------------------------------- */

const ClosingBanner = styled.section`
  padding: clamp(56px, 7vw, 96px) 0;
  text-align: center;
  background:
    radial-gradient(800px 340px at 50% 50%, rgba(201, 162, 39, 0.10), transparent 70%),
    #0a0806;
  border-top: 1px solid #1e1a12;

  h2 {
    font-family: "Cinzel", Georgia, serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    color: #f5f0e8;
    margin: 0 0 14px;
  }
  p {
    color: #c8b898;
    font-size: 1.02rem;
    line-height: 1.7;
    max-width: 640px;
    margin: 0 auto 28px;
  }
`;

const CtaRow = styled.div`
  display: inline-flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
`;

const BtnPrimary = styled.a`
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  font-family: "Cinzel", serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(201, 162, 39, 0.25);
  transition: transform 0.18s, box-shadow 0.18s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(201, 162, 39, 0.35);
  }
`;

const BtnGhost = styled.a`
  display: inline-block;
  padding: 13px 26px;
  background: transparent;
  color: #f0c040;
  border: 1px solid #c9a227;
  font-family: "Cinzel", serif;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 8px;

  &:hover {
    background: rgba(201, 162, 39, 0.08);
  }
`;

const FinePrint = styled.p`
  font-size: 0.82rem;
  color: #8a7a60;
  line-height: 1.6;
  margin: 20px 0 0;
  max-width: 820px;
`;

/* --- Page ---------------------------------------------------------------- */

const ILLUSTRATIONS: [string, string][] = [
  ["$100,000", "$10,000"],
  ["$500,000", "$50,000"],
  ["$1,000,000", "$100,000"],
  ["$5,000,000", "$500,000"],
  ["$10,000,000", "$1,000,000"],
  ["$20,000,000", "$2,000,000"],
  ["$48,000,000", "$4,800,000"],
];

export default function MissionPage() {
  return (
    <>
      <Header kickstarterBar />
      <Page>
        {/* HERO */}
        <Hero>
          <Wrap>
            <Eyebrow>Our Mission &amp; Giving Back</Eyebrow>
            <HeroTitle>Playing for a Purpose. Building a Better World.</HeroTitle>
            <HeroLede>
              A charitable giving commitment from Creative Design Networks —
              dedicating <strong style={{ color: "#f0c040" }}>10%</strong> of Sphere
              of Kings Kickstarter net earnings to two causes that matter.
            </HeroLede>
            <LaunchChip>Kickstarter launch · November 19, 2026</LaunchChip>
          </Wrap>
        </Hero>

        {/* PLEDGE SUMMARY */}
        <Section>
          <Wrap>
            <SectionTitle>Our 10% Commitment</SectionTitle>
            <SectionLede>
              At Creative Design Networks, we believe success should be measured
              not only by the products we create or the revenue we generate, but
              also by the lives we change along the way. Through the Sphere of
              Kings 7-in-1 spherical game board, we&apos;re building a mission-driven
              business that combines creativity, entrepreneurship, faith,
              community development, and charitable giving.
            </SectionLede>

            <PledgeGrid>
              <PledgeCard>
                <div className="label">Beneficiary 01</div>
                <div className="pct">5%</div>
                <h3>House of Rest Church</h3>
                <p>Modesto, California — ministry, outreach &amp; community support.</p>
              </PledgeCard>
              <PledgeCard>
                <div className="label">Beneficiary 02</div>
                <div className="pct">5%</div>
                <h3>Sarah&apos;s Foundation</h3>
                <p>Uganda — orphanage development toward a self-sustaining community.</p>
              </PledgeCard>
              <PledgeCard $accent>
                <div className="label">Total</div>
                <div className="pct">10%</div>
                <h3>Of Kickstarter Net Earnings</h3>
                <p>Calculated after fees, refunds, taxes &amp; legitimate campaign costs.</p>
              </PledgeCard>
            </PledgeGrid>
          </Wrap>
        </Section>

        {/* BENEFICIARIES */}
        <Section>
          <Wrap>
            <SectionTitle>Where the Giving Goes</SectionTitle>
            <SectionLede>
              Two beneficiaries. One shared purpose: investing in people and
              communities whose work extends far beyond what any single game
              campaign can achieve.
            </SectionLede>

            {/* House of Rest */}
            <Beneficiary>
              <BeneficiaryAside>
                <div className="pct">5%</div>
                <div className="region">Modesto, California</div>
              </BeneficiaryAside>
              <BeneficiaryBody>
                <h3>House of Rest Church</h3>
                <p>
                  We are committing <strong>5% of our Kickstarter net earnings</strong> to
                  House of Rest Church in Modesto, California — to help strengthen
                  the church, support its ministry, and expand its ability to
                  serve individuals and families throughout the community.
                </p>
                <p>These contributions are intended to help support:</p>
                <BulletList>
                  <li><strong>Church development</strong> — improvements and expansion of facilities.</li>
                  <li><strong>Ministry programs</strong> and spiritual outreach.</li>
                  <li><strong>Community assistance</strong> for struggling individuals and families.</li>
                  <li><strong>Faith-based outreach</strong> and evangelism.</li>
                  <li>Programs that provide encouragement, hope, and practical assistance.</li>
                  <li><strong>Long-term financial stability</strong> and opportunities for ministry growth.</li>
                </BulletList>
                <p>
                  We believe that investing in local churches can create lasting
                  positive change for generations.
                </p>
              </BeneficiaryBody>
            </Beneficiary>

            {/* Sarah's Foundation */}
            <Beneficiary>
              <BeneficiaryAside>
                <div className="pct">5%</div>
                <div className="region">Uganda, Africa</div>
              </BeneficiaryAside>
              <BeneficiaryBody>
                <h3>Sarah&apos;s Foundation</h3>
                <p>
                  We are also committing <strong>5% of our Kickstarter net earnings</strong> to
                  support Sarah&apos;s Foundation in Uganda — an orphanage
                  initiative working toward formal registration and the
                  development of a self-sustaining community.
                </p>
                <p>
                  Our vision goes beyond temporary financial assistance. We want
                  to help Sarah&apos;s Foundation develop the resources,
                  infrastructure, and economic opportunities needed to become
                  increasingly self-sufficient. Long-term goals include:
                </p>
                <BulletList>
                  <li><strong>Legal registration</strong> — appropriate structure, accountability, and sustainable operations.</li>
                  <li><strong>Safe housing</strong> — secure, comfortable living environments for vulnerable children.</li>
                  <li><strong>Food security</strong> — gardens, farming projects, and agricultural programs for nutritious food.</li>
                  <li><strong>Clean water</strong> — reliable access to drinking water, sanitation, and storage.</li>
                  <li><strong>Renewable energy</strong> — solar power and other affordable solutions.</li>
                  <li><strong>Education</strong> — schooling, learning materials, technology, and practical skills training.</li>
                  <li><strong>Healthcare &amp; wellness</strong> — essential medical services, hygiene supplies, and healthy living.</li>
                  <li><strong>Small-business development</strong> — locally managed enterprises that generate income.</li>
                  <li><strong>Vocational training</strong> — agriculture, construction, technology, manufacturing, and entrepreneurship.</li>
                  <li><strong>Long-term sustainability</strong> — a community meeting more of its own needs through locally led activity.</li>
                </BulletList>
                <p>
                  All projects involving children will prioritize their safety,
                  well-being, education, and appropriate local oversight.
                </p>
              </BeneficiaryBody>
            </Beneficiary>
          </Wrap>
        </Section>

        {/* GLOBAL VISION */}
        <Section>
          <Wrap>
            <SectionTitle>Our Global Vision — One Orphanage at a Time</SectionTitle>
            <Prose>
              <p>
                We envision a future where orphanages and child-serving
                communities around the world can develop sustainable systems
                that reduce their dependence on continuous charitable donations.
              </p>
              <p>
                <strong>Our model is simple:</strong> help one community · build
                sustainable infrastructure · develop local economic opportunities
                · learn from the experience · then help the next community.
              </p>
              <p>
                As Creative Design Networks grows, we hope to expand this
                mission into additional countries — supporting projects that
                combine charitable giving with entrepreneurship, education,
                agriculture, renewable energy, and sustainable development. Our
                dream is to create a replicable model of community development
                that empowers people to build a stronger future.
              </p>
            </Prose>
          </Wrap>
        </Section>

        {/* HOW THE GIVING WORKS */}
        <Section>
          <Wrap>
            <SectionTitle>How Our Kickstarter Giving Works</SectionTitle>
            <SectionLede>
              For our Sphere of Kings Kickstarter campaign, the intended
              allocation is as follows. These figures are illustrative — net
              earnings depend on final campaign results and permitted expenses.
            </SectionLede>

            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Beneficiary</th>
                    <th style={{ textAlign: "right" }}>Share of net earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>House of Rest Church — Modesto, California</td><td>5%</td></tr>
                  <tr><td>Sarah&apos;s Foundation — Uganda</td><td>5%</td></tr>
                  <tr><td><strong>Total charitable commitment</strong></td><td><strong>10%</strong></td></tr>
                </tbody>
              </Table>
            </TableWrap>

            <Prose>
              <p>
                <strong>Net earnings</strong> means campaign funds remaining
                after Kickstarter and payment-processing fees, refunds, taxes
                attributable to campaign earnings, and legitimate campaign
                fulfillment and operating expenses — using a clearly documented
                accounting method.
              </p>
              <p>
                For illustration, here&apos;s how the 10% commitment would scale
                at different levels of net earnings:
              </p>
            </Prose>

            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Kickstarter net earnings</th>
                    <th style={{ textAlign: "right" }}>Total charitable giving</th>
                  </tr>
                </thead>
                <tbody>
                  {ILLUSTRATIONS.map(([earn, give]) => (
                    <tr key={earn}><td>{earn}</td><td>{give}</td></tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>

            <FinePrint>
              These are hypothetical examples based on net earnings — not
              fundraising projections or guaranteed donations. We intend to
              provide transparency regarding the calculation and distribution
              of contributions.
            </FinePrint>
          </Wrap>
        </Section>

        {/* STRETCH GOAL */}
        <Section>
          <Wrap>
            <SectionTitle>Our $48 Million Personal Stretch Goal</SectionTitle>
            <Prose>
              <p>
                Sphere of Kings is launching on Kickstarter with an official
                funding goal of <strong>$10,000</strong>, while pursuing an
                ambitious personal stretch goal of <strong>$48 million</strong> in
                campaign funding.
              </p>
              <p>
                With support from our marketing collaborators — including{" "}
                <strong>Jellop</strong> and <strong>PostcardMania</strong> —
                and ongoing outreach to potential media partners, sponsors,
                influencers, and licensing partners, we hope to introduce
                Sphere of Kings to audiences around the world.
              </p>
              <p>
                Although achieving this stretch goal is uncertain, we believe
                our campaign can create opportunities that extend far beyond
                gaming. Every supporter helps us pursue both our commercial
                ambitions and our charitable mission.
              </p>
            </Prose>
          </Wrap>
        </Section>

        {/* WHY THIS MATTERS */}
        <Section>
          <Wrap>
            <SectionTitle>Why This Matters</SectionTitle>
            <SectionLede>
              We believe business success and social responsibility should work
              together. Our vision is to:
            </SectionLede>
            <BulletList style={{ maxWidth: 820 }}>
              <li>Create <strong>innovative products</strong> that bring people together.</li>
              <li>Support <strong>churches and faith-based ministries</strong>.</li>
              <li>Help <strong>vulnerable children</strong> and underserved communities.</li>
              <li>Develop <strong>sustainable, locally managed</strong> communities.</li>
              <li>Create <strong>educational and economic opportunities</strong>.</li>
              <li>Inspire other entrepreneurs to incorporate charitable giving into their business models.</li>
            </BulletList>
            <Prose>
              <p>
                We&apos;re not just building a game board. We&apos;re working
                to build a legacy of innovation, generosity, faith, and
                opportunity.
              </p>
            </Prose>

            <Scripture>
              &ldquo;Let your light so shine before men, that they may see your good
              works, and glorify your Father which is in heaven.&rdquo;
              <cite>Matthew 5:16</cite>
            </Scripture>
          </Wrap>
        </Section>

        {/* CLOSING / CTA */}
        <ClosingBanner>
          <Wrap>
            <h2>One Game. One Mission. One Community at a Time.</h2>
            <p>
              When you support Sphere of Kings, you&apos;re helping bring a new
              7-in-1 gaming platform to life while supporting a business committed
              to sharing a portion of its success with meaningful causes.
            </p>
            <CtaRow>
              <BtnPrimary href="/#signup">Back the Kickstarter</BtnPrimary>
              <BtnGhost href="/sponsorship">Explore sponsorship</BtnGhost>
            </CtaRow>
            <FinePrint style={{ margin: "28px auto 0", textAlign: "left" }}>
              <strong style={{ color: "#a89880" }}>A note on this commitment:</strong>{" "}
              This page describes our intended charitable giving. Before contributions
              are distributed, we will confirm that each organization is able to
              receive the funds, finalize the exact net-earnings accounting method,
              and document how transfers will be made. Since Sarah&apos;s Foundation
              is still working toward formal registration, we will verify its legal
              status and the appropriate way to receive funds before the first
              distribution.
            </FinePrint>
          </Wrap>
        </ClosingBanner>
      </Page>
      <Footer />
    </>
  );
}
