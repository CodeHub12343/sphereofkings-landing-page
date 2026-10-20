"use client";

import styled from "styled-components";
import { Wrap, GoldTitle } from "./shared";
import ShareButton from "./videos/ShareButton";

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: var(--bg2);
  text-align: center;

  @media (max-width: 720px) {
    padding: 48px 0;
  }
`;

const Heading = styled(GoldTitle)`
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 12px;
  font-weight: 900;
`;

const Sub = styled.p`
  color: #a89880;
  margin: 0 auto 36px;
  max-width: 520px;
  font-size: 0.98rem;
  line-height: 1.65;
`;

const Frame = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.55);

  video {
    width: 100%;
    height: 100%;
    display: block;
    background: #000;
  }
`;

// Points at the owner-approved featured trailer. Single source of truth
// in lib/videos.ts, so the home-page hero and /videos stay in sync when
// the owner uploads a newer trailer.
import { TRAILER_SRC as VIDEO_SRC } from "@/lib/videos";

export default function Video() {
  return (
    <Section id="video">
      <Wrap>
        <Heading>See the Sphere in Action</Heading>
        <Sub>
          Watch the official Kickstarter campaign video and see every game mode come to life.
        </Sub>
        <Frame>
          <video
            controls
            preload="metadata"
            playsInline
            poster="/images/d846e954-7329-421e-9b42-85a07f82d117.jpg"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
            Your browser does not support the video tag.
            <a href={VIDEO_SRC}>Watch the video</a>.
          </video>
        </Frame>
        <ShareRow>
          <ShareButton
            title="Sphere of Kings — official trailer"
            text="Watch Sphere of Kings in action — one spherical board, seven games. Launching on Kickstarter November 19."
            hash="trailer-october-20"
          />
        </ShareRow>
      </Wrap>
    </Section>
  );
}

const ShareRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;
