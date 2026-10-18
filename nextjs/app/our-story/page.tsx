"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OurStory from "@/components/ourstory/OurStory";
import { Wrap } from "@/components/shared";

const Section = styled.section`
  padding: clamp(32px, 5vw, 72px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

export default function OurStoryPage() {
  return (
    <>
      <Header />
      <main>
        <Section id="our-story">
          <Wrap>
            <OurStory />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
