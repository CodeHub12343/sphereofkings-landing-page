"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationCard from "@/components/donate/DonationCard";
import { Wrap, SectionEyebrow, GoldTitle } from "@/components/shared";

const Section = styled.section`
  padding: clamp(48px, 7vw, 96px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

const Head = styled.header`
  text-align: center;
  max-width: 640px;
  margin: 0 auto 36px;

  h1 {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin: 0 0 10px;
    font-weight: 900;
  }

  p {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 1rem;
    line-height: 1.55;
    margin: 0;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 36px;
  align-items: start;
  max-width: 1040px;
  margin: 0 auto;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const SideCard = styled.aside`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  h2 {
    font-family: "Cinzel", serif;
    font-size: 1.1rem;
    color: #f5f0e8;
    margin: 0;
  }
  p {
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    color: #a89880;
    line-height: 1.55;
    margin: 0;
  }
`;

const Pills = styled.ul`
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  li {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    color: #f5f0e8;
    line-height: 1.5;
  }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4c7ce0;
  margin-top: 7px;
  flex-shrink: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: #1e1a12;
`;

const Fine = styled.p`
  font-size: 0.78rem !important;
  color: #5a4a38 !important;
`;

export default function DonatePage() {
  return (
    <>
      <Header />
      <main>
        <Section id="donate">
          <Wrap>
            <Head>
              <SectionEyebrow>Support the project</SectionEyebrow>
              <GoldTitle as="h1">A contribution of any size.</GoldTitle>
              <p>
                A standalone donation that funds product development and
                community events. You do not need to buy a product.
              </p>
            </Head>
            <Layout>
              <DonationCard />
              <SideCard>
                <h2>Where your contribution goes</h2>
                <Pills>
                  <li>
                    <Dot aria-hidden="true" />
                    <span>
                      <strong>Prototyping.</strong> New board variants, custom
                      puzzle moulds, and the Imperial Kings refinement.
                    </span>
                  </li>
                  <li>
                    <Dot aria-hidden="true" />
                    <span>
                      <strong>Community play.</strong> Game-club starter sets
                      and school demos at cost.
                    </span>
                  </li>
                  <li>
                    <Dot aria-hidden="true" />
                    <span>
                      <strong>Launch day.</strong> Shipping, printing and the
                      first Early Bird batch.
                    </span>
                  </li>
                </Pills>
                <Divider />
                <h2>How it is different from a preorder</h2>
                <p>
                  Donations are not purchases. You will not receive a product
                  in exchange. If you want the game, visit the Christmas Early
                  Bird shop instead.
                </p>
                <Divider />
                <Fine>
                  Donation currency, limits, and refund policy are pending
                  owner approval. The DonationCard will enable real charges
                  once Stripe is wired. We never claim a payment went through
                  before Stripe confirms it.
                </Fine>
              </SideCard>
            </Layout>
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
