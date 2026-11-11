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

const EdiStrip = styled.div`
  max-width: 860px;
  margin: 0 auto 44px;
  padding: 22px 28px;
  background:
    linear-gradient(
      135deg,
      rgba(201, 162, 39, 0.08) 0%,
      rgba(198, 43, 68, 0.04) 100%
    );
  border: 1px solid rgba(201, 162, 39, 0.35);
  border-radius: 12px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 20px;
  }
`;

const EdiBadge = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 18px;
  min-width: 112px;
  background: linear-gradient(135deg, #c9a227 0%, #f0c040 100%);
  color: #0a0a0a;
  border-radius: 10px;
  font-family: "Cinzel", serif;
  font-weight: 800;
  line-height: 1.1;

  .top {
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.85;
  }
  .big {
    font-size: 1.35rem;
    letter-spacing: 0.04em;
    margin-top: 4px;
  }

  @media (max-width: 640px) {
    align-self: start;
  }
`;

const EdiCopy = styled.div`
  font-family: "Inter", sans-serif;
  color: #d8c9a8;
  font-size: 0.9rem;
  line-height: 1.55;

  strong {
    color: #f0c040;
    font-weight: 700;
  }

  .doclist {
    margin-top: 8px;
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 0.78rem;
    color: #a89880;
    letter-spacing: 0.03em;
  }
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
            <EdiStrip
              aria-label="Electronic Data Interchange readiness"
              role="region"
            >
              <EdiBadge>
                <span className="top">ANSI X12</span>
                <span className="big">EDI-Ready</span>
              </EdiBadge>
              <EdiCopy>
                <strong>For retail buyers, distributors, and RangeMe matches:</strong>{" "}
                Sphere of Kings is set up to exchange purchase orders, shipping
                notices, invoices, and inventory updates electronically. We
                support the full ANSI X12 document set and connect through
                established EDI providers (SPS Commerce, Orderful, TrueCommerce)
                on request.
                <div className="doclist">
                  Supported documents: 850 · 855 · 856 · 810 · 846 · 860 · 997/999
                </div>
              </EdiCopy>
            </EdiStrip>
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
