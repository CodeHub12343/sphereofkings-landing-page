"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WholesaleInquiry from "@/components/wholesale/WholesaleInquiry";
import { Wrap, SectionEyebrow, GoldTitle } from "@/components/shared";

const Section = styled.section`
  padding: clamp(48px, 7vw, 96px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

const Head = styled.header`
  text-align: center;
  max-width: 720px;
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

const Legal = styled.p`
  text-align: center;
  color: #5a4a38;
  font-size: 0.78rem;
  line-height: 1.55;
  margin: 36px auto 0;
  max-width: 720px;
`;

export default function WholesalePage() {
  return (
    <>
      <Header />
      <main>
        <Section id="wholesale">
          <Wrap>
            <Head>
              <SectionEyebrow>Wholesale</SectionEyebrow>
              <GoldTitle as="h1">Stock Sphere of Kings at scale.</GoldTitle>
              <p>
                Shops, clubs, classrooms and tournament directors — order in
                bulk with automatic bands up to 30%. Larger orders go through
                an owner-reviewed quote.
              </p>
            </Head>
            <WholesaleInquiry />
            <Legal>
              Automatic wholesale bands and the 40% quote threshold are
              preserved exactly as requested. Quantity bands and stacking
              rules remain pending owner approval; this form does not yet
              reach the admin queue or an email relay. Inventory caps apply
              across retail, wholesale and affiliate channels.
            </Legal>
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
