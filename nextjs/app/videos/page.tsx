"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoGallery from "@/components/videos/VideoGallery";
import { Wrap, SectionEyebrow, GoldTitle } from "@/components/shared";

const Section = styled.section`
  padding: clamp(48px, 7vw, 96px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

const Head = styled.header`
  text-align: center;
  max-width: 680px;
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
    line-height: 1.6;
    margin: 0;
  }
`;

export default function VideosPage() {
  return (
    <>
      <Header />
      <main>
        <Section id="videos">
          <Wrap>
            <Head>
              <SectionEyebrow>Videos</SectionEyebrow>
              <GoldTitle as="h1">See strategy from every angle.</GoldTitle>
              <p>
                The Kickstarter trailer plus upcoming gameplay walkthroughs,
                instructions and behind-the-scenes footage. We only publish
                videos the owner has approved — the rest show as "Coming soon".
              </p>
            </Head>
            <VideoGallery />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
