"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HowToPlay from "@/components/howtoplay/HowToPlay";
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

export default function HowToPlayPage() {
  return (
    <>
      <Header />
      <main>
        <Section id="how-to-play">
          <Wrap>
            <Head>
              <SectionEyebrow>How to Play</SectionEyebrow>
              <GoldTitle as="h1">Seven games on one spherical board.</GoldTitle>
              <p>
                Rules are published only when the owner has approved them. The
                sections below start with Royal Checkers and Imperial Kings;
                the other five modes are still being finalised.
              </p>
            </Head>
            <HowToPlay />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
