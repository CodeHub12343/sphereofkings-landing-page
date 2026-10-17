"use client";

import styled from "styled-components";
import { Wrap, GoldTitle, SectionEyebrow } from "./shared";
import SignupForm from "./SignupForm";

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: linear-gradient(180deg, #0d0b08 0%, #0a0805 100%);
  text-align: center;
`;

const Heading = styled(GoldTitle)`
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 14px;
  font-weight: 900;
`;

const Sub = styled.p`
  color: #a89880;
  max-width: 520px;
  margin: 0 auto 36px;
  font-size: 0.98rem;
  line-height: 1.65;
`;

const FormWrap = styled.div`
  max-width: 460px;
  margin: 0 auto;
  text-align: left;
`;

export default function FinalCTA() {
  return (
    <Section>
      <Wrap>
        <SectionEyebrow>Your Throne Awaits</SectionEyebrow>
        <Heading>Join the Kingdom Before Day One</Heading>
        <Sub>
          Early subscribers are the first to know when the campaign goes live on Kickstarter
          on November 19, 2026.
        </Sub>
        <FormWrap>
          <SignupForm source="final" finePrint="No spam. Unsubscribe anytime." />
        </FormWrap>
      </Wrap>
    </Section>
  );
}
